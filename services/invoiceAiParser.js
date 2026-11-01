import { roundMoney } from '../utils/currency';
import { addMonths, getCurrentYearMonth, isValidYearMonth } from '../utils/monthUtils';

export const DEFAULT_OPENAI_INVOICE_MODEL = 'gpt-6-luna';

export const INVOICE_EXTRACTION_SCHEMA = {
  name: 'credit_card_invoice_extraction',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      card_name: {
        type: 'string',
        description:
          'Nome do banco/emissor ou cartão identificado na fatura (ex: Nubank, Itaú, Inter, C6 Bank, Bradesco, Santander). Vazio se não identificado.',
      },
      reference_month: {
        type: 'string',
        description:
          'Mês de vencimento/referência da fatura no formato YYYY-MM (ex: 2026-11). String vazia se não for possível identificar.',
      },
      due_day: {
        type: ['integer', 'null'],
        description: 'Dia do vencimento da fatura (1 a 31), ou null se não constar.',
      },
      closing_day: {
        type: ['integer', 'null'],
        description: 'Dia de fechamento da fatura (1 a 31), ou null se não constar.',
      },
      invoice_total: {
        type: 'number',
        description: 'Valor total a pagar desta fatura em reais (ex: 1542.89).',
      },
      items: {
        type: 'array',
        description:
          'Lista de compras, tarifas/IOF e estornos desta fatura. NÃO inclua o pagamento recebido da fatura do mês anterior.',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              description:
                'Nome limpo do estabelecimento ou descrição da compra (sem repetir "Parc 02/10" se já extraído nos campos de parcela).',
            },
            purchase_date: {
              type: 'string',
              description: 'Data da compra como aparece na fatura (ex: 14/10 ou 2026-10-14), ou string vazia.',
            },
            amount: {
              type: 'number',
              description:
                'Valor cobrado NESTA fatura em reais. Positivo para compras/encargos; negativo para estornos/descontos/créditos na fatura.',
            },
            current_installment: {
              type: 'integer',
              description:
                'Número da parcela atual cobrada nesta fatura (ex: 3 para "03/10"). Use 1 para compras à vista.',
            },
            total_installments: {
              type: 'integer',
              description:
                'Quantidade total de parcelas da compra (ex: 10 para "03/10"). Use 1 para compras à vista.',
            },
            category: {
              type: 'string',
              enum: [
                'Alimentação',
                'Supermercado',
                'Transporte',
                'Compras',
                'Assinatura',
                'Saúde',
                'Lazer',
                'Serviços',
                'Encargos',
                'Estorno',
                'Outros',
              ],
            },
            is_recurring_hint: {
              type: 'boolean',
              description:
                'True apenas se for claramente uma assinatura mensal recorrente à vista (ex: Netflix, Spotify, iCloud, academia, internet).',
            },
          },
          required: [
            'name',
            'purchase_date',
            'amount',
            'current_installment',
            'total_installments',
            'category',
            'is_recurring_hint',
          ],
        },
      },
    },
    required: [
      'card_name',
      'reference_month',
      'due_day',
      'closing_day',
      'invoice_total',
      'items',
    ],
  },
};

export const INVOICE_SYSTEM_PROMPT = `Você é um especialista contábil brasileiro em leitura de faturas de cartão de crédito (Nubank, Itaú, Inter, Bradesco, Santander, C6, Banco do Brasil, Caixa, XP, BTG, Mercado Pago, PicPay, etc.).
Extraia fielmente os dados da fatura anexada seguindo estas regras rigorosas:
1. EXCLUA lançamentos de "Pagamento recebido", "Pagamento de fatura", "Débito automático de fatura" referentes à quitação da fatura anterior.
2. Para compras parceladas (ex: "MERCADOLIVRE 03/10", "Parc 2/6", "02 de 12"):
   - current_installment = parcela cobrada nesta fatura (ex: 3)
   - total_installments = total de parcelas (ex: 10)
   - amount = valor da PARCELA cobrada nesta fatura (não multiplique pelo total de parcelas).
3. Para compras à vista, current_installment = 1 e total_installments = 1.
4. Estornos, descontos na fatura ou cashback devem ter amount NEGATIVO (ex: -25.90) e category = "Estorno".
5. IOF, anuidade, juros ou seguro fatura devem ser incluídos normalmente com category = "Encargos".
6. Valores numéricos devem usar ponto decimal (ex: 1234.56) convertendo corretamente o formato brasileiro "1.234,56".`;

/**
 * Builds the OpenAI user message content blocks based on uploaded file MIME/extension.
 */
export function buildOpenAiFileContentBlocks({ filename = 'fatura', mimeType = '', base64Data = '', targetMonth = '' }) {
  const cleanBase64 = String(base64Data || '').replace(/^data:[^;]+;base64,/, '');
  const lowerName = filename.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  const contextHint = targetMonth
    ? `Extraia todos os lançamentos desta fatura de cartão de crédito (mês selecionado pelo usuário: ${targetMonth}).`
    : 'Extraia todos os lançamentos desta fatura de cartão de crédito.';

  // PDF native input
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return [
      {
        type: 'file',
        file: {
          filename: filename || 'fatura.pdf',
          file_data: `data:application/pdf;base64,${cleanBase64}`,
        },
      },
      {
        type: 'text',
        text: contextHint,
      },
    ];
  }

  // Image native vision input
  if (
    lowerMime.startsWith('image/') ||
    /\.(png|jpe?g|webp|gif)$/i.test(lowerName)
  ) {
    const effectiveMime = lowerMime.startsWith('image/')
      ? lowerMime
      : lowerName.endsWith('.png')
      ? 'image/png'
      : lowerName.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';

    return [
      {
        type: 'image_url',
        image_url: {
          url: `data:${effectiveMime};base64,${cleanBase64}`,
          detail: 'high',
        },
      },
      {
        type: 'text',
        text: contextHint,
      },
    ];
  }

  // Text / CSV / OFX input
  const decodedText = Buffer.from(cleanBase64, 'base64').toString('utf8').slice(0, 120000);
  return [
    {
      type: 'text',
      text: `${contextHint}\n\nArquivo (${filename}):\n${decodedText}`,
    },
  ];
}

/**
 * Normalizes raw OpenAI JSON output and calculates each item's exact `start_month`
 * so parcelamentos automatically project into future months!
 */
export function normalizeExtractedInvoice(raw, fallbackMonth = getCurrentYearMonth()) {
  const invoiceMonth = isValidYearMonth(raw?.reference_month)
    ? raw.reference_month
    : isValidYearMonth(fallbackMonth)
    ? fallbackMonth
    : getCurrentYearMonth();

  const rawItems = Array.isArray(raw?.items) ? raw.items : [];
  const normalizedItems = rawItems
    .filter((it) => it && typeof it.amount === 'number' && Number.isFinite(it.amount) && it.amount !== 0)
    .map((it, idx) => {
      const currentInst = Math.max(1, parseInt(it.current_installment || 1, 10));
      const totalInst = Math.max(currentInst, parseInt(it.total_installments || 1, 10));
      const amount = roundMoney(it.amount);
      const startMonth = addMonths(invoiceMonth, -(currentInst - 1));

      return {
        tempId: `ai_${idx}_${Date.now()}`,
        selected: true,
        name: String(it.name || 'Compra').trim(),
        purchase_date: String(it.purchase_date || '').trim(),
        value: amount,
        total_value: roundMoney(amount * totalInst),
        current_installment: currentInst,
        installments: totalInst,
        start_month: startMonth,
        category: it.category || 'Outros',
        is_recurring: Boolean(it.is_recurring_hint && totalInst === 1 && amount > 0),
      };
    });

  const itemsSum = roundMoney(normalizedItems.reduce((acc, it) => acc + it.value, 0));
  const invoiceTotal = roundMoney(
    raw?.invoice_total && raw.invoice_total > 0 ? raw.invoice_total : Math.max(0, itemsSum)
  );
  const residualDifference = roundMoney(invoiceTotal - itemsSum);

  return {
    card_name: String(raw?.card_name || '').trim(),
    reference_month: invoiceMonth,
    due_day:
      typeof raw?.due_day === 'number' && raw.due_day >= 1 && raw.due_day <= 31
        ? raw.due_day
        : null,
    closing_day:
      typeof raw?.closing_day === 'number' && raw.closing_day >= 1 && raw.closing_day <= 31
        ? raw.closing_day
        : null,
    invoice_total: invoiceTotal,
    items_sum: itemsSum,
    residual_difference: residualDifference,
    items: normalizedItems,
  };
}
