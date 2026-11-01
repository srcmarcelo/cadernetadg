import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '../../services/supabaseClient';
import {
  buildOpenAiFileContentBlocks,
  DEFAULT_OPENAI_INVOICE_MODEL,
  INVOICE_EXTRACTION_SCHEMA,
  INVOICE_SYSTEM_PROMPT,
  normalizeExtractedInvoice,
} from '../../services/invoiceAiParser';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '16mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  // 1. Authenticate caller via Supabase JWT so OpenAI credits are protected
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
  }

  const supabaseUrl = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    const { data: userData, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !userData?.user) {
      return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
    }
  }

  // 2. Validate OpenAI API Key
  const openAiKey = (process.env.OPENAI_API_KEY || '').trim();
  if (!openAiKey) {
    return res.status(500).json({
      error:
        'A chave OPENAI_API_KEY não está configurada no servidor (adicione nas variáveis de ambiente).',
    });
  }

  const { filename, mimeType, base64Data, targetMonth } = req.body || {};
  if (!base64Data || typeof base64Data !== 'string') {
    return res.status(400).json({ error: 'Nenhum documento enviado para leitura.' });
  }

  const model = (process.env.OPENAI_MODEL || DEFAULT_OPENAI_INVOICE_MODEL).trim();

  try {
    const contentBlocks = buildOpenAiFileContentBlocks({
      filename,
      mimeType,
      base64Data,
      targetMonth,
    });

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: INVOICE_SYSTEM_PROMPT },
          { role: 'user', content: contentBlocks },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: INVOICE_EXTRACTION_SCHEMA,
        },
      }),
    });

    const payload = await openAiRes.json();

    if (!openAiRes.ok) {
      const apiMsg = payload?.error?.message || 'Falha na leitura do documento pela IA.';
      return res.status(openAiRes.status).json({ error: apiMsg });
    }

    const message = payload?.choices?.[0]?.message;
    if (message?.refusal) {
      return res.status(422).json({
        error: 'Não foi possível extrair os dados deste documento.',
      });
    }

    const rawParsed = JSON.parse(message?.content || '{}');
    // File buffer is never persisted anywhere — immediately discarded after extraction
    const result = normalizeExtractedInvoice(rawParsed, targetMonth);

    return res.status(200).json({
      model,
      invoice: result,
    });
  } catch (err) {
    return res.status(500).json({
      error: err?.message || 'Erro inesperado ao processar a fatura.',
    });
  }
}
