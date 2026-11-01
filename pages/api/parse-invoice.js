import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '../../services/supabaseClient';
import {
  buildOpenAiFileContentBlocks,
  DEFAULT_OPENAI_INVOICE_MODEL,
  INVOICE_EXTRACTION_SCHEMA,
  INVOICE_SYSTEM_PROMPT,
  normalizeExtractedInvoice,
  tryExtractDigitalPdfText,
} from '../../services/invoiceAiParser';

export const maxDuration = 60;

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '20mb',
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

async function callOpenAiStructured({ openAiKey, model, contentBlocks }) {
  const baseBody = {
    model,
    messages: [
      { role: 'system', content: INVOICE_SYSTEM_PROMPT },
      { role: 'user', content: contentBlocks },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: INVOICE_EXTRACTION_SCHEMA,
    },
  };

  const withEffort = modelSupportsReasoningEffortNone(model)
    ? { ...baseBody, reasoning_effort: 'none' }
    : baseBody;

  let res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openAiKey}`,
    },
    body: JSON.stringify(withEffort),
  });

  // Fallback without reasoning_effort if user configured a custom model that rejects it
  if (res.status === 400 && withEffort.reasoning_effort) {
    const firstErr = await readResponseSafe(res);
    if (firstErr.rawText.includes('reasoning_effort')) {
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify(baseBody),
      });
    } else {
      return { ok: false, status: res.status, ...firstErr };
    }
  }

  const parsed = await readResponseSafe(res);
  return { ok: res.ok, status: res.status, ...parsed };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // 1. Authenticate caller via Supabase JWT so OpenAI credits are protected
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Sessão expirada. Atualize a página e tente novamente.' });
  }

  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = cleanEnvSecret(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      const { data: userData, error: authErr } = await supabase.auth.getUser(token);
      if (authErr || !userData?.user) {
        return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
      }
    } catch (authException) {
      console.error('Supabase JWT verification error:', authException);
      return res.status(500).json({
        error: 'Falha ao validar sua sessão com o Supabase. Verifique a conexão.',
      });
    }
  }

  // 2. Validate OpenAI API Key
  const openAiKey = cleanEnvSecret(process.env.OPENAI_API_KEY);
  if (!openAiKey) {
    return res.status(500).json({
      error:
        'A chave OPENAI_API_KEY não está configurada no servidor (adicione nas variáveis de ambiente da Vercel / .env.local).',
    });
  }

  const { filename, mimeType, base64Data, targetMonth } = req.body || {};
  if (!base64Data || typeof base64Data !== 'string') {
    return res.status(400).json({ error: 'Nenhum documento válido enviado para leitura.' });
  }

  const model = cleanEnvSecret(process.env.OPENAI_MODEL) || DEFAULT_OPENAI_INVOICE_MODEL;

  try {
    // Fast path: extract embedded text from digital PDFs in ~250ms; falls back to native PDF Vision if scanned
    const extractedPdfText = await tryExtractDigitalPdfText(base64Data);

    const contentBlocks = buildOpenAiFileContentBlocks({
      filename,
      mimeType,
      base64Data,
      targetMonth,
      extractedPdfText,
    });

    let aiCall = await callOpenAiStructured({ openAiKey, model, contentBlocks });

    // If configured model doesn't exist on user's account, fall back to gpt-6-luna or gpt-4o-mini
    if (
      !aiCall.ok &&
      (aiCall.status === 404 ||
        aiCall.payload?.error?.code === 'model_not_found') &&
      model !== 'gpt-4o-mini'
    ) {
      const fallbackModel = model === DEFAULT_OPENAI_INVOICE_MODEL ? 'gpt-4o-mini' : DEFAULT_OPENAI_INVOICE_MODEL;
      aiCall = await callOpenAiStructured({
        openAiKey,
        model: fallbackModel,
        contentBlocks,
      });
    }

    if (!aiCall.ok) {
      const apiMsg =
        aiCall.payload?.error?.message ||
        'Falha na comunicação com a Inteligência Artificial.';
      return res.status(aiCall.status || 502).json({ error: apiMsg });
    }

    const message = aiCall.payload?.choices?.[0]?.message;
    if (message?.refusal) {
      return res.status(422).json({
        error: 'Não foi possível identificar dados de fatura neste arquivo.',
      });
    }

    let rawParsed = JSON.parse(message?.content || '{}');

    // Safety fallback: if digital PDF text yielded 0 items (e.g. unusual custom font encoding),
    // automatically retry once with native PDF multimodal vision!
    if (
      extractedPdfText &&
      (!Array.isArray(rawParsed?.items) || rawParsed.items.length === 0)
    ) {
      const visionBlocks = buildOpenAiFileContentBlocks({
        filename,
        mimeType,
        base64Data,
        targetMonth,
        extractedPdfText: '',
      });
      const visionRetry = await callOpenAiStructured({
        openAiKey,
        model,
        contentBlocks: visionBlocks,
      });
      if (visionRetry.ok) {
        const visionMsg = visionRetry.payload?.choices?.[0]?.message;
        if (visionMsg?.content && !visionMsg?.refusal) {
          rawParsed = JSON.parse(visionMsg.content);
        }
      }
    }

    // File buffer is never persisted anywhere — immediately discarded after extraction
    const result = normalizeExtractedInvoice(rawParsed, targetMonth);

    return res.status(200).json({
      model,
      invoice: result,
    });
  } catch (err) {
    console.error('parse-invoice error:', err);
    return res.status(500).json({
      error: err?.message || 'Erro inesperado ao processar o documento da fatura.',
    });
  }
}
