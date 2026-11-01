import { describe, expect, it } from 'vitest';
import {
  buildDebtorExportFilename,
  buildDebtorMonthlyReport,
  formatDebtorWhatsAppText,
  generateDebtorReportPDF,
} from '../utils/debtorExport';
import { resolveInstallmentItemForMonth } from '../utils/monthUtils';

describe('Debtor Monthly Statement Export (WhatsApp, Filename & PDF)', () => {
  const baseMonth = '2026-11';
  const debtor = { id: 'deb_joao', name: 'João da Silva' };
  const rawDebts = [
    {
      id: 'd1',
      debtor_id: 'deb_joao',
      name: 'Tênis Nike',
      value: 149.9,
      installments: 4,
      start_month: '2026-10', // Parcel 2/4 in 2026-11
      monthly_status: {},
    },
    {
      id: 'd2',
      debtor_id: 'deb_joao',
      name: 'Jantar Pizzaria',
      value: 85,
      installments: 1,
      start_month: '2026-11',
      monthly_status: {
        '2026-11': { paid: true },
      },
    },
    {
      id: 'd3',
      debtor_id: 'deb_joao',
      name: 'Item Pausado',
      value: 50,
      installments: 1,
      start_month: '2026-11',
      monthly_status: {
        '2026-11': { disabled: true },
      },
    },
    {
      id: 'd_other',
      debtor_id: 'deb_maria',
      name: 'Outro Devedor',
      value: 999,
      installments: 1,
      start_month: '2026-11',
    },
  ];

  const resolvedDebts = rawDebts.map((d) =>
    resolveInstallmentItemForMonth(d, '2026-11', baseMonth)
  );

  it('builds accurate debtor monthly report with paid, pending, and total amounts', () => {
    const report = buildDebtorMonthlyReport({
      debtor,
      resolvedDebts,
      selectedMonth: '2026-11',
      creditorName: 'Marcelo',
    });

    expect(report.debtorName).toBe('João da Silva');
    expect(report.monthLabel).toBe('Novembro de 2026');
    expect(report.items).toHaveLength(2); // Excludes disabled item and Maria's item
    expect(report.totalAll).toBe(234.9);
    expect(report.totalPaid).toBe(85);
    expect(report.totalPending).toBe(149.9);
  });

  it('formats a clean WhatsApp summary message with installments, paid badges, and totals', () => {
    const report = buildDebtorMonthlyReport({
      debtor,
      resolvedDebts,
      selectedMonth: '2026-11',
      creditorName: 'Marcelo',
    });

    const text = formatDebtorWhatsAppText(report);
    expect(text).toContain('*Caderneta Digital — Resumo do Mês*');
    expect(text).toContain('👤 *Para:* João da Silva');
    expect(text).toContain('📌 *Referente a:* Marcelo');
    expect(text).toContain('📅 *Mês:* Novembro de 2026');
    expect(text).toContain('1. *Tênis Nike* _(Parcela 2/4)_: R$ 149,90');
    expect(text).toContain('2. *Jantar Pizzaria* _(À vista)_: R$ 85,00 ✅ [Pago]');
    expect(text).toContain('Total do mês: R$ 234,90');
    expect(text).toContain('Já pago: R$ 85,00');
    expect(text).toContain('💰 *Falta pagar: R$ 149,90*');
  });

  it('creates clean ASCII filenames for PDF and PNG exports', () => {
    expect(buildDebtorExportFilename('João da Silva!', '2026-11', 'pdf')).toBe(
      'extrato-joao-da-silva-2026-11.pdf'
    );
    expect(buildDebtorExportFilename('Mãe / Casa', '2027-01', 'png')).toBe(
      'extrato-mae-casa-2027-01.png'
    );
  });

  it('generates a valid PDF document blob via jsPDF', async () => {
    const report = buildDebtorMonthlyReport({
      debtor,
      resolvedDebts,
      selectedMonth: '2026-11',
      creditorName: 'Marcelo',
    });

    const { doc, blob } = await generateDebtorReportPDF(report);
    expect(doc).toBeDefined();
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });
});
