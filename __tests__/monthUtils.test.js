import { describe, expect, it } from 'vitest';
import { formatBRL, parseBRL, roundMoney } from '../utils/currency';
import {
  addMonths,
  compareMonths,
  diffMonths,
  formatMonthYear,
  getRelativeMonthBadge,
  inferStartMonth,
  isValidYearMonth,
  resolveExtraReceiptForMonth,
  resolveFixedDebtForMonth,
  resolveFixedReceiptForMonth,
  resolveInstallmentItemForMonth,
} from '../utils/monthUtils';

describe('Currency utilities', () => {
  it('formats and parses BRL currency values accurately', () => {
    expect(roundMoney(10.555)).toBe(10.56);
    expect(formatBRL(1542.89)).toBe('R$ 1.542,89');
    expect(formatBRL(-0)).toBe('R$ 0,00');
    expect(parseBRL('R$ 1.542,89')).toBe(1542.89);
    expect(parseBRL('-R$ 25,90')).toBe(-25.9);
    expect(parseBRL('1234.56')).toBe(1234.56);
    expect(parseBRL('')).toBe(0);
  });
});

describe('All-months calendar math (YYYY-MM)', () => {
  it('validates YYYY-MM strings strictly', () => {
    expect(isValidYearMonth('2026-11')).toBe(true);
    expect(isValidYearMonth('2026-01')).toBe(true);
    expect(isValidYearMonth('2026-13')).toBe(false);
    expect(isValidYearMonth('2026-00')).toBe(false);
    expect(isValidYearMonth('11/2026')).toBe(false);
  });

  it('adds and subtracts months across year boundaries', () => {
    expect(addMonths('2026-11', 1)).toBe('2026-12');
    expect(addMonths('2026-11', 2)).toBe('2027-01');
    expect(addMonths('2026-11', 14)).toBe('2028-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(addMonths('2026-03', -15)).toBe('2024-12');
  });

  it('calculates month differences, labels, and relative badges', () => {
    expect(diffMonths('2027-03', '2026-11')).toBe(4);
    expect(diffMonths('2026-08', '2026-11')).toBe(-3);
    expect(compareMonths('2026-10', '2026-11')).toBe(-1);
    expect(compareMonths('2026-11', '2026-11')).toBe(0);
    expect(compareMonths('2026-12', '2026-11')).toBe(1);

    expect(formatMonthYear('2026-11')).toBe('Novembro de 2026');
    expect(formatMonthYear('2027-02', { short: true })).toBe('Fev/2027');

    expect(getRelativeMonthBadge('2026-11', '2026-11')).toBe('Mês atual');
    expect(getRelativeMonthBadge('2026-12', '2026-11')).toBe('Próximo mês');
    expect(getRelativeMonthBadge('2026-10', '2026-11')).toBe('Mês anterior');
    expect(getRelativeMonthBadge('2027-04', '2026-11')).toBe('Em 5 meses');
    expect(getRelativeMonthBadge('2026-07', '2026-11')).toBe('Há 4 meses');
  });
});

describe('Backwards-compatible monthly resolvers across ALL months', () => {
  const baseMonth = '2026-11';

  it('resolves legacy and extended Fixed Receipts for past, current, and future months', () => {
    const salary = {
      id: 'u1_1',
      name: 'Salário',
      value: 5000,
      received: true,
      future_received: false,
      monthly_status: {
        '2027-03': { received: true, value: 5500 },
        '2027-04': { disabled: true },
      },
    };

    const nov = resolveFixedReceiptForMonth(salary, '2026-11', baseMonth);
    expect(nov.effectiveReceived).toBe(true);
    expect(nov.effectiveValue).toBe(5000);

    const dec = resolveFixedReceiptForMonth(salary, '2026-12', baseMonth);
    expect(dec.effectiveReceived).toBe(false);
    expect(dec.effectiveValue).toBe(5000);

    const mar27 = resolveFixedReceiptForMonth(salary, '2027-03', baseMonth);
    expect(mar27.effectiveReceived).toBe(true);
    expect(mar27.effectiveValue).toBe(5500);

    const apr27 = resolveFixedReceiptForMonth(salary, '2027-04', baseMonth);
    expect(apr27.effectiveDisabled).toBe(true);
  });

  it('resolves legacy Fixed Debts and per-month paid/disabled overrides', () => {
    const rent = {
      id: 'u1_rent',
      name: 'Aluguel',
      value: 1800,
      payed: true,
      future_payed: false,
      monthly_status: {
        '2027-02': { paid: true },
      },
    };

    expect(resolveFixedDebtForMonth(rent, '2026-11', baseMonth).effectivePaid).toBe(true);
    expect(resolveFixedDebtForMonth(rent, '2026-12', baseMonth).effectivePaid).toBe(false);
    expect(resolveFixedDebtForMonth(rent, '2027-02', baseMonth).effectivePaid).toBe(true);
    expect(resolveFixedDebtForMonth(rent, '2026-09', baseMonth).effectivePaid).toBe(false);
  });

  it('projects legacy installment debts (without start_month) across past and future months', () => {
    // Legacy record currently on installment 3 of 6 in 2026-11 -> started in 2026-09, ends in 2027-02
    const legacyLoan = {
      id: 'u1_loan',
      name: 'Notebook',
      value: 350,
      installments: 6,
      current_pay: 3,
      future_pay: 4,
      disabled: false,
      future_disabled: false,
    };

    expect(inferStartMonth(legacyLoan, baseMonth)).toBe('2026-09');

    const aug = resolveInstallmentItemForMonth(legacyLoan, '2026-08', baseMonth);
    expect(aug.active).toBe(false);

    const sep = resolveInstallmentItemForMonth(legacyLoan, '2026-09', baseMonth);
    expect(sep.active).toBe(true);
    expect(sep.currentInstallment).toBe(1);

    const nov = resolveInstallmentItemForMonth(legacyLoan, '2026-11', baseMonth);
    expect(nov.active).toBe(true);
    expect(nov.currentInstallment).toBe(3);

    const feb27 = resolveInstallmentItemForMonth(legacyLoan, '2027-02', baseMonth);
    expect(feb27.active).toBe(true);
    expect(feb27.currentInstallment).toBe(6);

    const mar27 = resolveInstallmentItemForMonth(legacyLoan, '2027-03', baseMonth);
    expect(mar27.active).toBe(false);
  });

  it('resolves modern start_month installment items created directly in future months', () => {
    const futureDebt = {
      id: 'u1_fut',
      name: 'IPVA 2027',
      value: 420,
      installments: 5,
      start_month: '2027-01',
      monthly_status: {
        '2027-01': { paid: true },
      },
    };

    expect(resolveInstallmentItemForMonth(futureDebt, '2026-11', baseMonth).active).toBe(false);

    const jan27 = resolveInstallmentItemForMonth(futureDebt, '2027-01', baseMonth);
    expect(jan27.active).toBe(true);
    expect(jan27.currentInstallment).toBe(1);
    expect(jan27.effectivePaid).toBe(true);

    const may27 = resolveInstallmentItemForMonth(futureDebt, '2027-05', baseMonth);
    expect(may27.active).toBe(true);
    expect(may27.currentInstallment).toBe(5);
    expect(may27.effectivePaid).toBe(false);

    expect(resolveInstallmentItemForMonth(futureDebt, '2027-06', baseMonth).active).toBe(false);
  });

  it('resolves Extra Receipts for target_month as well as legacy future flag', () => {
    const legacyNextMonthBonus = {
      id: 'er_1',
      name: '13º Salário',
      value: 0,
      future_value: 2500,
      future: true,
      future_disabled: false,
    };

    expect(resolveExtraReceiptForMonth(legacyNextMonthBonus, '2026-11', baseMonth).active).toBe(false);
    const dec = resolveExtraReceiptForMonth(legacyNextMonthBonus, '2026-12', baseMonth);
    expect(dec.active).toBe(true);
    expect(dec.effectiveValue).toBe(2500);

    const freelanceJul = {
      id: 'er_2',
      name: 'Projeto Freelance',
      value: 1900,
      target_month: '2027-07',
      received: false,
      disabled: false,
    };
    expect(resolveExtraReceiptForMonth(freelanceJul, '2026-12', baseMonth).active).toBe(false);
    expect(resolveExtraReceiptForMonth(freelanceJul, '2027-07', baseMonth).active).toBe(true);
  });
});
