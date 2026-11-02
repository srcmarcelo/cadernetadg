import { describe, expect, it } from 'vitest';
import {
  computeFinancialViewForMonth,
  getCardFutureProjection,
  resolveCardPurchaseForMonth,
  resolveCreditCardForMonth,
} from '../utils/creditCardUtils';

describe('Detailed Credit Card Invoices, Installments & Multi-Month Projection', () => {
  const baseMonth = '2026-11';
  const nubank = {
    id: 'card_nubank',
    name: 'Nubank Ultravioleta',
    value: 900, // legacy fallback
    future_value: 450,
    disabled: false,
    future_disabled: false,
    monthly_invoices: {
      '2026-11': { due_day: 10, manual_adjustment: 12.5 },
    },
  };

  const purchases = [
    // Single purchase (à vista) only in 2026-11
    {
      id: 'p_ifood',
      card_id: 'card_nubank',
      name: 'iFood',
      value: 89.9,
      installments: 1,
      start_month: '2026-11',
      is_recurring: false,
    },
    // Installment purchase: 10x of R$ 250 starting in 2026-09 (so 2026-11 is parcel 3/10, ends 2027-06)
    {
      id: 'p_iphone',
      card_id: 'card_nubank',
      name: 'Apple Store',
      value: 250,
      installments: 10,
      start_month: '2026-09',
      is_recurring: false,
    },
    // Recurring monthly subscription starting 2026-10
    {
      id: 'p_netflix',
      card_id: 'card_nubank',
      name: 'Netflix',
      value: 59.9,
      installments: 1,
      start_month: '2026-10',
      is_recurring: true,
    },
    // Refund / Estorno in 2026-11
    {
      id: 'p_refund',
      card_id: 'card_nubank',
      name: 'Estorno Compra',
      value: -20,
      installments: 1,
      start_month: '2026-11',
      is_recurring: false,
    },
  ];

  it('resolves individual purchases (à vista, parcelada, recorrente, disabled_months) accurately', () => {
    const iphoneNov = resolveCardPurchaseForMonth(purchases[1], '2026-11');
    expect(iphoneNov.active).toBe(true);
    expect(iphoneNov.currentInstallment).toBe(3);
    expect(iphoneNov.totalInstallments).toBe(10);

    const iphoneJun27 = resolveCardPurchaseForMonth(purchases[1], '2027-06');
    expect(iphoneJun27.active).toBe(true);
    expect(iphoneJun27.currentInstallment).toBe(10);

    const iphoneJul27 = resolveCardPurchaseForMonth(purchases[1], '2027-07');
    expect(iphoneJul27.active).toBe(false);

    const disabledInDec = resolveCardPurchaseForMonth(
      {
        ...purchases[2],
        disabled_months: { '2026-12': { disabled: true } },
      },
      '2026-12'
    );
    expect(disabledInDec.active).toBe(true);
    expect(disabledInDec.effectiveDisabled).toBe(true);
  });

  it('computes complete credit card fatura breakdown for a month including manual adjustments', () => {
    // 2026-11: iFood (89.90) + Estorno (-20.00) + Apple 3/10 (250.00) + Netflix (59.90) + adjustment (12.50) = 392.30
    const novInvoice = resolveCreditCardForMonth(nubank, purchases, '2026-11', baseMonth);
    expect(novInvoice.hasDetailedPurchases).toBe(true);
    expect(novInvoice.singleTotal).toBe(69.9);
    expect(novInvoice.installmentsTotal).toBe(250);
    expect(novInvoice.recurringTotal).toBe(59.9);
    expect(novInvoice.purchasesTotal).toBe(379.8);
    expect(novInvoice.manualAdjustment).toBe(12.5);
    expect(novInvoice.effectiveValue).toBe(392.3);
  });

  it('projects future faturas across upcoming months showing exact drop-off when installments end', () => {
    const projection = getCardFutureProjection(nubank, purchases, '2026-11', 9, baseMonth);
    expect(projection).toHaveLength(9);

    // 2026-11 (index 0): 392.30
    expect(projection[0].month).toBe('2026-11');
    expect(projection[0].total).toBe(392.3);

    // 2026-12 (index 1): iFood & Estorno & Nov adjustment gone -> Apple 4/10 (250) + Netflix (59.90) = 309.90
    expect(projection[1].month).toBe('2026-12');
    expect(projection[1].total).toBe(309.9);
    expect(projection[1].installmentsTotal).toBe(250);
    expect(projection[1].recurringTotal).toBe(59.9);

    // 2027-06 (index 7): Apple 10/10 (250) + Netflix (59.90) = 309.90
    expect(projection[7].month).toBe('2027-06');
    expect(projection[7].total).toBe(309.9);

    // 2027-07 (index 8): Apple 10x finished! Only Netflix (59.90) remains
    expect(projection[8].month).toBe('2027-07');
    expect(projection[8].total).toBe(59.9);
    expect(projection[8].installmentsTotal).toBe(0);
  });

  it('falls back seamlessly to legacy value and future_value for existing cards without detailed items', () => {
    const legacyCard = {
      id: 'card_legacy',
      name: 'Itaú Click',
      value: 1200,
      future_value: 680,
      disabled: false,
      future_disabled: false,
    };

    expect(resolveCreditCardForMonth(legacyCard, [], '2026-11', baseMonth).effectiveValue).toBe(1200);
    expect(resolveCreditCardForMonth(legacyCard, [], '2026-12', baseMonth).effectiveValue).toBe(680);
    expect(resolveCreditCardForMonth(legacyCard, [], '2027-01', baseMonth).effectiveValue).toBe(0);
  });

  it('cascades opening balance and kept balance accurately across future months in computeFinancialViewForMonth', () => {
    const state = {
      baseMonth: '2026-11',
      currentBalance: 1000,
      keptBalance: 2000,
      fixedReceipts: [{ id: 'r1', name: 'Salário', value: 4000, received: false, future_received: false }],
      fixedDebts: [{ id: 'd1', name: 'Custo de Vida', value: 3000, payed: false, future_payed: false }],
      extraReceipts: [],
      extraDebts: [],
      debts: [],
      creditCards: [nubank],
      cardPurchases: purchases,
    };

    // 2026-11: opening 1000 + willReceive 4000 - totalDebts (3000 + 392.30) = closing 1607.70
    const novView = computeFinancialViewForMonth({ ...state, selectedMonth: '2026-11' });
    expect(novView.openingBalance).toBe(1000);
    expect(novView.totalDebts).toBe(3392.3);
    expect(novView.closingBalance).toBe(1607.7);

    // 2026-12: opening 1607.70 + willReceive 4000 - totalDebts (3000 + 309.90) = closing 2297.80
    const decView = computeFinancialViewForMonth({ ...state, selectedMonth: '2026-12' });
    expect(decView.openingBalance).toBe(1607.7);
    expect(decView.closingBalance).toBe(2297.8);
  });

  it('accumulates and carries deficits forward into future months without zeroing', () => {
    const deficitState = {
      baseMonth: '2026-11',
      currentBalance: 500,
      keptBalance: 1000,
      fixedReceipts: [{ id: 'r1', name: 'Salário', value: 2000, received: false }],
      fixedDebts: [{ id: 'd1', name: 'Aluguel + Contas', value: 3000, payed: false }],
      extraReceipts: [],
      extraDebts: [],
      debts: [],
      creditCards: [],
      cardPurchases: [],
    };

    // Nov: opening 500 + (2000 - 3000) = closing -500. MonthlyNet = -1000.
    const novView = computeFinancialViewForMonth({ ...deficitState, selectedMonth: '2026-11' });
    expect(novView.openingBalance).toBe(500);
    expect(novView.monthlyNet).toBe(-1000);
    expect(novView.closingBalance).toBe(-500);
    expect(novView.accumulatedDeficit).toBe(false); // base month opening was positive
    expect(novView.closingNegative).toBe(true);

    // Dec: opening -500 + (2000 - 3000) = closing -1500. Deficit accumulated!
    const decView = computeFinancialViewForMonth({ ...deficitState, selectedMonth: '2026-12' });
    expect(decView.openingBalance).toBe(-500);
    expect(decView.monthlyNet).toBe(-1000);
    expect(decView.closingBalance).toBe(-1500);
    expect(decView.accumulatedDeficit).toBe(true);
    expect(decView.closingNegative).toBe(true);

    // Jan: opening -1500 + (2000 - 3000) = closing -2500
    const janView = computeFinancialViewForMonth({ ...deficitState, selectedMonth: '2027-01' });
    expect(janView.openingBalance).toBe(-1500);
    expect(janView.closingBalance).toBe(-2500);
    expect(janView.accumulatedDeficit).toBe(true);
  });
});

