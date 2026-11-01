import { extractText } from 'unpdf';
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
        description: 'Valor total a pagar desta fatura em reais (ex: 2642.89).',
      },
      items: {
        type: 'array',
        description:
          'Lista completa de todas as compras, parcelamentos, financiamentos/Pix no crédito da fatura atual, tarifas/IOF e estornos. NÃO inclua o pagamento recebido referente à quitação da fatura do mês anterior.',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
              description:
                'Nome limpo do estabelecimento ou descrição da compra (sem repetir "Parcela 02/10" no nome).',
            },
            purchase_date: {
              type: 'string',
              description: 'Data da compra como aparece na fatura (ex: 01/10 ou 2026-10-01), ou string vazia.',
            },
            amount: {
              type: 'number',
              description:
                'Valor cobrado NESTA fatura em reais. Positivo para compras/encargos/parcelas; negativo apenas para estornos/descontos/cashback.',
            },
            current_installment: {
              type: 'integer',
              description:
                'Número da parcela atual cobrada nesta fatura (ex: 6 para "Parcela 6/10"). Use 1 para compras à vista.',
            },
            total_installments: {
              type: 'integer',
              description:
                'Quantidade total de parcelas da compra (ex: 10 para "Parcela 6/10"). Use 1 para compras à vista.',
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
                'True apenas se for claramente uma assinatura mensal recorrente à vista (ex: Netflix, Spotify, HBO Max, Canva, NuCel, iCloud).',
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
Extraia fielmente TODOS os lançamentos cobrados na fatura atual seguindo estas regras rigorosas:
1. EXCLUA lançamentos de quitação da fatura anterior ("Pagamento recebido", "Pagamento em DD MMM", "Pagamento de fatura", "Débito automático de fatura") e EXCLUA tabelas meramente simuladas de "Alternativas de pagamento / Parcele a sua fatura / Pagamento mínimo".
2. INCLUA todas as transações de compras (de todos os cartões/adicionais) E eventuais lançamentos positivos cobrados na seção "Pagamentos e Financiamentos" (como Pix no crédito, boletos no crédito ou parcelas de financiamentos cobradas no mês).
3. Para compras ou financiamentos parcelados (ex: "Parcela 6/10", "Parc 02/12", "03 de 10"):
   - current_installment = parcela cobrada nesta fatura (ex: 6)
   - total_installments = total de parcelas (ex: 10)
   - amount = valor da PARCELA cobrada nesta fatura (NUNCA use o valor total da transação inteira quando houver parcela do mês).
4. Para compras à vista, current_installment = 1 e total_installments = 1.
5. Estornos, descontos ou créditos de compras (ex: Estorno de "...") devem ter amount NEGATIVO (ex: -0.05) e category = "Estorno".
6. IOF, anuidade, juros ou encargos cobrados na fatura devem ser incluídos com category = "Encargos".
7. Valores numéricos devem usar ponto decimal (ex: 2642.89) convertendo o formato brasileiro "2.642,89". A soma dos items deve bater com o Total a pagar da fatura.`;

/**
 * Detects real file format using magic bytes first (critical on Android/iOS where
 * content:// URIs often omit file extensions and report application/octet-stream).
 */
export function detectInvoiceFileKind({ filename = '', mimeType = '', buffer }) {
  const lowerName = String(filename || '').toLowerCase();
  const lowerMime = String(mimeType || '').toLowerCase();

  if (buffer && buffer.length >= 12) {
    // %PDF-
    if (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    ) {
      return { kind: 'pdf', mime: 'application/pdf' };
    }
    // PNG: 89 50 4E 47
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return { kind: 'image', mime: 'image/png' };
    }
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { kind: 'image', mime: 'image/jpeg' };
    }
    // WEBP: RIFF....WEBP
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return { kind: 'image', mime: 'image/webp' };
    }
    // GIF: GIF8
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    ) {
      return { kind: 'image', mime: 'image/gif' };
    }
  }

  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) {
    return { kind: 'pdf', mime: 'application/pdf' };
  }

  if (lowerMime.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(lowerName)) {
    const effectiveMime = lowerMime.startsWith('image/')
      ? lowerMime
      : lowerName.endsWith('.png')
      ? 'image/png'
      : lowerName.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg';
    return { kind: 'image', mime: effectiveMime };
  }

  return { kind: 'text', mime: 'text/plain' };
}

/**
 * Synchronous helper for unit tests and direct multimodal block construction.
 */
export function buildOpenAiFileContentBlocks({
  filename = 'fatura',
  mimeType = '',
  base64Data = '',
  targetMonth = '',
  extractedPdfText = '',
}) {
  const cleanBase64 = String(base64Data || '')
    .replace(/^data:[^;]+;base64,/, '')
    .replace(/\s+/g, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const detected = detectInvoiceFileKind({ filename, mimeType, buffer });

  const contextHint = targetMonth
    ? `Extraia todos os lançamentos desta fatura de cartão de crédito (mês selecionado pelo usuário: ${targetMonth}).`
    : 'Extraia todos os lançamentos desta fatura de cartão de crédito.';

  if (detected.kind === 'pdf') {
    // If clean digital text was extracted from PDF, send text for fast & low-token inference
    if (extractedPdfText && extractedPdfText.trim().length >= 160) {
      return [
        {
          type: 'text',
          text: `${contextHint}\n\nTexto extraído do PDF (${filename || 'fatura.pdf'}):\n${extractedPdfText.slice(0, 120000)}`,
        },
      ];
    }

    const safeFilename = filename && filename.toLowerCase().endsWith('.pdf')
      ? filename
      : `${filename || 'fatura'}.pdf`;

    return [
      {
        type: 'file',
        file: {
          filename: safeFilename,
          file_data: `data:application/pdf;base64,${cleanBase64}`,
        },
      },
      {
        type: 'text',
        text: contextHint,
      },
    ];
  }

  if (detected.kind === 'image') {
    return [
      {
        type: 'image_url',
        image_url: {
          url: `data:${detected.mime};base64,${cleanBase64}`,
          detail: 'high',
        },
      },
      {
        type: 'text',
        text: contextHint,
      },
    ];
  }

  const decodedText = buffer.toString('utf8').slice(0, 120000);
  return [
    {
      type: 'text',
      text: `${contextHint}\n\nArquivo (${filename}):\n${decodedText}`,
    },
  ];
}

/**
 * Attempts fast in-memory text extraction for digital PDFs using `unpdf`.
 * Returns empty string if PDF is scanned/image-only or encrypted, triggering automatic
 * fallback to OpenAI's native multimodal PDF vision (`type: "file"`).
 */
export async function tryExtractDigitalPdfText(base64Data) {
  try {
    const cleanBase64 = String(base64Data || '')
      .replace(/^data:[^;]+;base64,/, '')
      .replace(/\s+/g, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (
      buffer.length < 12 ||
      buffer[0] !== 0x25 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x44 ||
      buffer[3] !== 0x46
    ) {
      return '';
    }

    const { text } = await extractText(new Uint8Array(buffer), { mergePages: false });
    const pages = Array.isArray(text) ? text : [String(text || '')];
    const joined = pages
      .map((p, idx) => `--- PÁGINA ${idx + 1} ---\n${String(p || '').trim()}`)
      .join('\n\n')
      .trim();

    // Ensure it actually contains readable financial digits (not an image-only scan)
    const digitCount = (joined.match(/\d/g) || []).length;
    if (joined.length < 160 || digitCount < 15) {
      return '';
    }
    return joined;
  } catch {
    return '';
  }
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
