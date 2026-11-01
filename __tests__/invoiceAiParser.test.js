import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../pages/api/parse-invoice';
import {
  buildOpenAiFileContentBlocks,
  DEFAULT_OPENAI_INVOICE_MODEL,
  detectInvoiceFileKind,
  normalizeExtractedInvoice,
} from '../services/invoiceAiParser';

function createMockReqRes({ method = 'POST', headers = {}, body = {} } = {}) {
  const req = { method, headers, body };
  const res = {
    statusCode: 200,
    jsonPayload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.jsonPayload = payload;
      return this;
    },
  };
  return { req, res };
}

describe('AI Credit Card Invoice Extraction (gpt-6-luna)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses gpt-6-luna as the default cost-effective OpenAI model', () => {
    expect(DEFAULT_OPENAI_INVOICE_MODEL).toBe('gpt-6-luna');
  });

  it('detects PDF and image files via magic bytes even when Android/iOS omits extension and MIME type', () => {
    // Android content:// URI without .pdf extension and application/octet-stream
    const pdfBuf = Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj', 'utf8');
    expect(
      detectInvoiceFileKind({
        filename: 'msf:1000034219',
        mimeType: 'application/octet-stream',
        buffer: pdfBuf,
      })
    ).toEqual({ kind: 'pdf', mime: 'application/pdf' });

    // PNG magic bytes without extension
    const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(
      detectInvoiceFileKind({
        filename: 'document_9912',
        mimeType: '',
        buffer: pngBuf,
      })
    ).toEqual({ kind: 'image', mime: 'image/png' });

    // JPEG magic bytes without extension
    const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1]);
    expect(
      detectInvoiceFileKind({
        filename: 'photo_picker_1',
        mimeType: 'application/octet-stream',
        buffer: jpgBuf,
      })
    ).toEqual({ kind: 'image', mime: 'image/jpeg' });
  });

  it('builds proper multimodal OpenAI content blocks for scanned PDF, digital PDF text, images, and CSV', () => {
    // Scanned PDF (no extracted text) -> multimodal file block even with Android opaque filename
    const pdfBase64 = Buffer.from('%PDF-1.4\n%scanned', 'utf8').toString('base64');
    const pdfBlocks = buildOpenAiFileContentBlocks({
      filename: 'msf:1000034219',
      mimeType: 'application/octet-stream',
      base64Data: pdfBase64,
      targetMonth: '2026-11',
      extractedPdfText: '',
    });
    expect(pdfBlocks[0].type).toBe('file');
    expect(pdfBlocks[0].file.filename).toBe('msf:1000034219.pdf');
    expect(pdfBlocks[0].file.file_data).toBe(`data:application/pdf;base64,${pdfBase64}`);

    // Digital PDF (with extracted text >= 160 chars) -> fast low-token text block
    const richPdfText =
      '--- PÁGINA 1 ---\nNubank Fatura Novembro 2026 Vencimento 09 NOV 2026 Total a pagar R$ 2.642,89\n01 OUT Jim.Com* Evodia Camil - Parcela 6/10 R$ 111,06\n05 OUT Mercado Livre - Parcela 2/6 R$ 85,00';
    const fastPdfBlocks = buildOpenAiFileContentBlocks({
      filename: 'Nubank_2026-11-09.pdf',
      mimeType: 'application/pdf',
      base64Data: pdfBase64,
      targetMonth: '2026-11',
      extractedPdfText: richPdfText,
    });
    expect(fastPdfBlocks).toHaveLength(1);
    expect(fastPdfBlocks[0].type).toBe('text');
    expect(fastPdfBlocks[0].text).toContain('R$ 2.642,89');

    const imgBlocks = buildOpenAiFileContentBlocks({
      filename: 'print_fatura.png',
      mimeType: 'image/png',
      base64Data: 'iVBORw0KGgo=',
      targetMonth: '2026-11',
    });
    expect(imgBlocks[0].type).toBe('image_url');
    expect(imgBlocks[0].image_url.url).toBe('data:image/png;base64,iVBORw0KGgo=');

    const csvBase64 = Buffer.from('date,title,amount\n2026-10-20,Spotify,21.90', 'utf8').toString('base64');
    const csvBlocks = buildOpenAiFileContentBlocks({
      filename: 'nubank.csv',
      mimeType: 'text/csv',
      base64Data: csvBase64,
      targetMonth: '2026-11',
    });
    expect(csvBlocks[0].type).toBe('text');
    expect(csvBlocks[0].text).toContain('Spotify,21.90');
  });

  it('normalizes extracted items and computes retroactive start_month for installments', () => {
    const rawAiOutput = {
      card_name: 'Nubank',
      reference_month: '2026-11',
      due_day: 9,
      closing_day: 2,
      invoice_total: 460.0,
      items: [
        {
          name: 'Mercado Livre',
          purchase_date: '15/08',
          amount: 120.5,
          current_installment: 4,
          total_installments: 10,
          category: 'Compras',
          is_recurring_hint: false,
        },
        {
          name: 'Spotify',
          purchase_date: '01/11',
          amount: 21.9,
          current_installment: 1,
          total_installments: 1,
          category: 'Assinatura',
          is_recurring_hint: true,
        },
        {
          name: 'Estorno IOF',
          purchase_date: '02/11',
          amount: -5.4,
          current_installment: 1,
          total_installments: 1,
          category: 'Estorno',
          is_recurring_hint: false,
        },
      ],
    };

    const normalized = normalizeExtractedInvoice(rawAiOutput, '2026-11');
    expect(normalized.card_name).toBe('Nubank');
    expect(normalized.reference_month).toBe('2026-11');
    expect(normalized.due_day).toBe(9);
    expect(normalized.items).toHaveLength(3);

    // Installment 4/10 in 2026-11 MUST have start_month = 2026-08 so future months 5..10 project automatically!
    const ml = normalized.items[0];
    expect(ml.start_month).toBe('2026-08');
    expect(ml.current_installment).toBe(4);
    expect(ml.installments).toBe(10);
    expect(ml.total_value).toBe(1205);

    // Recurring hint preserved on 1x positive subscription
    expect(normalized.items[1].is_recurring).toBe(true);

    // Items sum = 120.50 + 21.90 - 5.40 = 137.00; invoice_total = 460.00 -> residual_difference = 323.00
    expect(normalized.items_sum).toBe(137);
    expect(normalized.residual_difference).toBe(323);
  });

  it('validates method, auth token, reasoning_effort: none, and processes mocked OpenAI gpt-6-luna response in /api/parse-invoice', async () => {
    // 1. Reject GET with 405
    const getCall = createMockReqRes({ method: 'GET' });
    await handler(getCall.req, getCall.res);
    expect(getCall.res.statusCode).toBe(405);

    // 2. Reject unauthenticated request with 401
    const noAuthCall = createMockReqRes({ method: 'POST', body: {} });
    await handler(noAuthCall.req, noAuthCall.res);
    expect(noAuthCall.res.statusCode).toBe(401);

    // 3. Test authenticated request with gpt-6-luna fast reasoning_effort: 'none'
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.OPENAI_API_KEY;
    const prevModel = process.env.OPENAI_MODEL;

    process.env.NEXT_PUBLIC_SUPABASE_URL = '';
    process.env.OPENAI_API_KEY = 'sk-test-dummy-key';
    delete process.env.OPENAI_MODEL;

    const mockOpenAiPayload = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              card_name: 'Nubank',
              reference_month: '2026-11',
              due_day: 9,
              closing_day: 2,
              invoice_total: 200,
              items: [
                {
                  name: 'Amazon',
                  purchase_date: '10/10',
                  amount: 200,
                  current_installment: 2,
                  total_installments: 5,
                  category: 'Compras',
                  is_recurring_hint: false,
                },
              ],
            }),
          },
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockOpenAiPayload),
    });

    try {
      const okCall = createMockReqRes({
        method: 'POST',
        headers: { authorization: 'Bearer test-jwt-token' },
        body: {
          filename: 'msf:1000034219',
          mimeType: 'application/octet-stream',
          base64Data: Buffer.from('%PDF-1.4\n%test', 'utf8').toString('base64'),
          targetMonth: '2026-11',
        },
      });

      await handler(okCall.req, okCall.res);
      expect(okCall.res.statusCode).toBe(200);
      expect(okCall.res.jsonPayload.model).toBe('gpt-6-luna');
      expect(okCall.res.jsonPayload.invoice.card_name).toBe('Nubank');
      expect(okCall.res.jsonPayload.invoice.items[0].start_month).toBe('2026-10');
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(sentBody.model).toBe('gpt-6-luna');
      expect(sentBody.reasoning_effort).toBe('none');
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      process.env.OPENAI_API_KEY = prevKey;
      if (prevModel !== undefined) process.env.OPENAI_MODEL = prevModel;
    }
  });
});
