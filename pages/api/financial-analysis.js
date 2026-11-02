import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '../../services/supabaseClient';
import { DEFAULT_OPENAI_INVOICE_MODEL } from '../../services/invoiceAiParser';
import { applyScenarioToProjection } from '../../utils/financialProjection';

export const maxDuration = 60;

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

function cleanEnvSecret(val) {
  return String(val || '')
    .trim()
    .replace(/^['"]|['"]$/g, '');
}

function modelSupportsReasoningEffortNone(model) {
  const m = String(model || '').toLowerCase();
  return m.startsWith('gpt-6') || m.startsWith('gpt-5.2') || m.startsWith('gpt-5.4');
}

async function readResponseSafe(res) {
  if (typeof res.text === 'function') {
    const rawText = await res.text();
    let payload = null;
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = null;
    }
    return { payload, rawText };
  }
  const payload = typeof res.json === 'function' ? await res.json() : null;
  return { payload, rawText: payload ? JSON.stringify(payload) : '' };
}

const PARAMETER_EXTRACTION_SCHEMA = {
  name: 'financial_simulation_parameters',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      has_loan: {
        type: 'boolean',
        description: 'True if user mentions borrowing, taking a loan or financing',
      },
      loan_principal: {
        type: 'number',
        description: 'Loan amount borrowed in BRL (e.g. 15000 for 15 mil). 0 if none.',
      },
      loan_monthly_rate_percent: {
        type: 'number',
        description: 'Monthly interest rate in percent (e.g. 5.5 for 5.5%). 0 if not mentioned.',
      },
      loan_installments: {
        type: 'number',
        description: 'Number of monthly installments (e.g. 12, 24). Defaults to 24 if loan asked without installments.',
      },
      extra_monthly_income: {
        type: 'number',
        description: 'Permanent extra income per month in BRL. 0 if none.',
      },
      extra_monthly_expense: {
        type: 'number',
        description: 'Permanent extra expense per month in BRL. 0 if none.',
      },
      card_monthly_budget: {
        type: 'number',
        description: 'Target monthly credit card spend limit asked by user. -1 if none.',
      },
    },
    required: [
      'has_loan',
      'loan_principal',
      'loan_monthly_rate_percent',
      'loan_installments',
      'extra_monthly_income',
      'extra_monthly_expense',
      'card_monthly_budget',
    ],
    additionalProperties: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // 1. Authenticate with Supabase JWT
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return res.status(401).json({ error: 'Autenticação necessária.' });
  }

  const supabaseUrl = normalizeSupabaseUrl(
    cleanEnvSecret(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    )
  );
  const supabaseAnonKey = cleanEnvSecret(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({ error: 'Configuração do Supabase ausente.' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return res.status(401).json({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  const openAiKey = cleanEnvSecret(process.env.OPENAI_API_KEY);
  if (!openAiKey) {
    return res.status(500).json({
      error: 'Chave OPENAI_API_KEY não configurada no servidor.',
    });
  }

  const { baselineSeries = [], userQuery = '' } = req.body || {};
  if (!Array.isArray(baselineSeries) || baselineSeries.length === 0) {
    return res.status(400).json({ error: 'Série de projeção baseline é obrigatória.' });
  }

  const model = cleanEnvSecret(process.env.OPENAI_INVOICE_MODEL) || DEFAULT_OPENAI_INVOICE_MODEL;

  try {
    // 2. Call OpenAI to extract scenario parameters from user's Portuguese question
    const extractPrompt = `O usuário está em um app de finanças pessoais e fez a seguinte pergunta ou simulação:
"${userQuery || 'Faça um diagnóstico geral da minha situação financeira.'}"

Extraia os parâmetros numéricos exatos mencionados.
Se for um empréstimo sem prazo informado, assuma 24 parcelas. Se a taxa não for informada e ele pedir simulação de empréstimo, assuma 4.5% a.m. Se não mencionar cartão, card_monthly_budget deve ser -1.`;

    const extractBody = {
      model,
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de extração de parâmetros de simulação financeira.',
        },
        { role: 'user', content: extractPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: PARAMETER_EXTRACTION_SCHEMA,
      },
    };
    if (modelSupportsReasoningEffortNone(model)) {
      extractBody.reasoning_effort = 'none';
    }

    const extractRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify(extractBody),
    });

    const { payload: extractData } = await readResponseSafe(extractRes);
    let params = {
      has_loan: false,
      loan_principal: 0,
      loan_monthly_rate_percent: 0,
      loan_installments: 24,
      extra_monthly_income: 0,
      extra_monthly_expense: 0,
      card_monthly_budget: -1,
    };

    if (extractData?.choices?.[0]?.message?.content) {
      try {
        params = { ...params, ...JSON.parse(extractData.choices[0].message.content) };
      } catch {
        // Fallback default
      }
    }

    // 3. Compute deterministic simulation scenario locally with precision math
    const scenario = {
      loan: params.has_loan && params.loan_principal > 0
        ? {
            principal: params.loan_principal,
            monthlyRatePercent: params.loan_monthly_rate_percent,
            installments: params.loan_installments,
          }
        : null,
      extraMonthlyIncome: params.extra_monthly_income,
      extraMonthlyExpense: params.extra_monthly_expense,
      cardMonthlyBudget: params.card_monthly_budget >= 0 ? params.card_monthly_budget : null,
    };

    const simulation = applyScenarioToProjection(baselineSeries, scenario);

    // 4. Call OpenAI to write the natural language diagnosis and recommendations
    const baselineSummary = baselineSeries
      .map((b) => `${b.month}: Entra R$ ${b.willReceive}, Sai R$ ${b.totalDebts} (Cartão R$ ${b.creditCardsTotal}), Fim R$ ${b.closing}`)
      .join('\n');

    const simSummary = simulation.series
      .map((s) => `${s.month}: Sai R$ ${s.totalDebts}, Fim R$ ${s.closing}`)
      .join('\n');

    const loanInfo = simulation.loanCalculations
      ? `Empréstimo R$ ${params.loan_principal} a ${params.loan_monthly_rate_percent}% a.m. em ${params.loan_installments}x de R$ ${simulation.loanCalculations.installmentValue} (total pago R$ ${simulation.loanCalculations.totalPayment}).`
      : 'Nenhum empréstimo simulado.';

    const advisorPrompt = `Você é um consultor financeiro pessoal acolhedor, analítico e direto.
Responda em português brasileiro à pergunta do usuário: "${userQuery || 'Qual é a análise da minha situação?'}"

DADOS REAIS COMPUTADOS:
${loanInfo}
Métricas da simulação:
- Primeiro mês no azul: ${simulation.metrics.firstBalancedMonth || 'Não atinge o azul no período'}
- Pior saldo acumulado: R$ ${simulation.metrics.worstDeficit} em ${simulation.metrics.worstMonth || 'N/A'}
- Saldo final projetado: R$ ${simulation.metrics.endBalance} (${simulation.metrics.isHealthyAtEnd ? 'SAUDÁVEL' : 'DEFICITÁRIO'})
- Gasto extra mensal seguro em cartão/livre: R$ ${simulation.metrics.safeMonthlyExtraSpend || 0}

Histórico mês a mês da simulação:
${simSummary}

Histórico mês a mês SEM simulação (baseline atual):
${baselineSummary}

INSTRUÇÕES DE RESPOSTA:
1. Comece com uma resposta direta e conclusiva (ex: "Sim, o empréstimo alivia o início mas...", ou "Você se estabilizará em [mês]...", ou "O valor máximo seguro de cartão é R$ X").
2. Explique os números exatos calculados (parcela, juros totais pagos, quando o saldo fica positivo ou se o déficit volta a crescer).
3. Dê de 2 a 3 recomendações práticas e realistas de ajustes se a conta não fechar.
4. Use formatação markdown limpa com tópicos curtos.`;

    const advisorBody = {
      model,
      messages: [
        {
          role: 'system',
          content: 'Você é um consultor financeiro pessoal especialista em orçamento doméstico brasileiro.',
        },
        { role: 'user', content: advisorPrompt },
      ],
    };
    if (modelSupportsReasoningEffortNone(model)) {
      advisorBody.reasoning_effort = 'none';
    }

    const advisorRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify(advisorBody),
    });

    const { payload: advisorData } = await readResponseSafe(advisorRes);
    const analysisText = advisorData?.choices?.[0]?.message?.content ||
      'Não foi possível gerar a análise textual, mas os cálculos matemáticos da simulação foram concluídos com sucesso.';

    return res.status(200).json({
      model,
      scenario,
      loanCalculations: simulation.loanCalculations,
      metrics: simulation.metrics,
      simulationSeries: simulation.series,
      analysis: analysisText,
    });
  } catch (err) {
    console.error('financial-analysis error:', err);
    return res.status(500).json({
      error: err?.message || 'Erro interno ao processar a simulação financeira.',
    });
  }
}
