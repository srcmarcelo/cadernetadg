import { describe, expect, it } from 'vitest';
import {
  applyScenarioToProjection,
  calculateLoanInstallment,
  computeMultiMonthProjection,
} from '../utils/financialProjection';

describe('Financial Projections & Loan Simulation (utils/financialProjection.js)', () => {
  it('computes Price formula loan installments accurately', () => {
    // R$ 15.000 a 5.5% ao mês em 24 meses
    // PMT = 15000 * (0.055 * 1.055^24) / (1.055^24 - 1)
    // 1.055^24 = 3.616616...
    // PMT = 15000 * (0.1989139) / 2.616616 = ~1140.29
    const sim = calculateLoanInstallment({
      principal: 15000,
      monthlyRatePercent: 5.5,
      installments: 24,
    });

    expect(sim.installmentValue).toBeGreaterThan(1135);
    expect(sim.installmentValue).toBeLessThan(1145);
    expect(sim.totalPayment).toBe(round(sim.installmentValue * 24));
    expect(sim.totalInterest).toBe(round(sim.totalPayment - 15000));
  });

  it('handles zero interest loan (free installments)', () => {
    const sim = calculateLoanInstallment({
      principal: 12000,
      monthlyRatePercent: 0,
      installments: 12,
    });

    expect(sim.installmentValue).toBe(1000);
    expect(sim.totalPayment).toBe(12000);
    expect(sim.totalInterest).toBe(0);
  });

  it('computes 12-month baseline projection with accumulating deficit', () => {
    const baseline = computeMultiMonthProjection({
      startMonth: '2026-11',
      monthsCount: 6,
      currentBalance: 1000,
      fixedReceipts: [{ id: 'r1', name: 'Salário', value: 4000, received: false }],
      fixedDebts: [{ id: 'd1', name: 'Aluguel', value: 3000, payed: false }],
      extraReceipts: [],
      extraDebts: [],
      debts: [],
      creditCards: [],
      cardPurchases: [],
    });

    expect(baseline.series).toHaveLength(6);
    // Month 0 (2026-11): opening 1000 + (4000 - 3000) = closing 2000
    expect(baseline.series[0].opening).toBe(1000);
    expect(baseline.series[0].closing).toBe(2000);

    // Month 1 (2026-12): opening 2000 + 1000 = closing 3000
    expect(baseline.series[1].opening).toBe(2000);
    expect(baseline.series[1].closing).toBe(3000);

    // Month 5 (2027-04): closing 7000
    expect(baseline.series[5].closing).toBe(7000);
  });

  it('simulates loan scenario and detects how debt/liquidity evolves', () => {
    // User is in deficit: earns 3000, spends 4000 (monthly deficit -1000). Starts with 0.
    const baseline = computeMultiMonthProjection({
      startMonth: '2026-11',
      monthsCount: 12,
      currentBalance: 0,
      fixedReceipts: [{ id: 'r1', name: 'Salário', value: 3000, received: false }],
      fixedDebts: [{ id: 'd1', name: 'Contas', value: 4000, payed: false }],
      extraReceipts: [],
      extraDebts: [],
      debts: [],
      creditCards: [],
      cardPurchases: [],
    });

    // Without loan, month 11 closing is -12.000
    expect(baseline.series[11].closing).toBe(-12000);

    // Scenario: user takes a 15k loan at 5.5% in 24x
    const sim = applyScenarioToProjection(baseline.series, {
      loan: {
        principal: 15000,
        monthlyRatePercent: 5.5,
        installments: 24,
      },
    });

    // Month 0 gets +15k cash injection: net = -1000 + 15000 = 14000 closing
    expect(sim.series[0].closing).toBe(14000);
    // Month 1 starts paying installment (~1140): net = -1000 - 1140 = -2140. Opening 14000 -> Closing ~11860
    expect(sim.series[1].closing).toBeLessThan(12000);
    expect(sim.series[1].closing).toBeGreaterThan(11700);

    // Metrics are populated
    expect(sim.metrics.worstMonth).toBeTruthy();
    expect(sim.loanCalculations).not.toBeNull();
  });
});

function round(val) {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}
