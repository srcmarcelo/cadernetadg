import { addMonths, getCurrentYearMonth } from './monthUtils';
import { roundMoney } from './currency';
import { computeSingleMonthSummary } from './creditCardUtils';

/**
 * Calculates monthly loan payment using the standard French amortization (Tabela Price) formula:
 * PMT = P * [ i * (1 + i)^n ] / [ (1 + i)^n - 1 ]
 * If rate is 0, PMT = P / n.
 *
 * @param {number} principal - Loan amount borrowed in BRL (e.g. 15000)
 * @param {number} monthlyRatePercent - Monthly interest rate in % (e.g. 5.5 for 5.5%)
 * @param {number} installments - Number of monthly installments (e.g. 12, 24, 36)
 */
export function calculateLoanInstallment({ principal, monthlyRatePercent, installments }) {
  const p = Number(principal || 0);
  const n = Math.max(1, Math.round(Number(installments || 1)));
  const i = Number(monthlyRatePercent || 0) / 100;

  if (p <= 0) return { installmentValue: 0, totalPayment: 0, totalInterest: 0 };
  if (i <= 0) {
    const pmt = roundMoney(p / n);
    return {
      installmentValue: pmt,
      totalPayment: roundMoney(pmt * n),
      totalInterest: 0,
    };
  }

  const factor = Math.pow(1 + i, n);
  const pmt = roundMoney((p * (i * factor)) / (factor - 1));
  const totalPayment = roundMoney(pmt * n);
  const totalInterest = roundMoney(Math.max(0, totalPayment - p));

  return {
    installmentValue: pmt,
    totalPayment,
    totalInterest,
  };
}

/**
 * Computes deterministic multi-month baseline projection starting at `startMonth`
 * with accumulating opening balance, exactly matching the app's financial cascade.
 */
export function computeMultiMonthProjection({
  startMonth = getCurrentYearMonth(),
  monthsCount = 12,
  currentBalance = 0,
  fixedReceipts = [],
  extraReceipts = [],
  debts = [],
  fixedDebts = [],
  extraDebts = [],
  creditCards = [],
  cardPurchases = [],
}) {
  const count = Math.min(Math.max(1, monthsCount), 60);
  let runningOpening = roundMoney(Number(currentBalance || 0));
  const series = [];

  for (let idx = 0; idx < count; idx += 1) {
    const month = addMonths(startMonth, idx);
    const summary = computeSingleMonthSummary({
      selectedMonth: month,
      baseMonth: startMonth,
      fixedReceipts,
      extraReceipts,
      debts,
      fixedDebts,
      extraDebts,
      creditCards,
      cardPurchases,
    });

    const opening = runningOpening;
    const monthlyNet = summary.monthlyNet;
    const closing = roundMoney(opening + monthlyNet);

    series.push({
      month,
      index: idx,
      opening,
      willReceive: summary.willReceive,
      totalDebts: summary.totalDebts,
      creditCardsTotal: summary.creditCardsTotal,
      fixedDebtsTotal: summary.fixedDebtsTotal,
      extraDebtsTotal: summary.extraDebtsTotal,
      totalDebtorsPending: summary.totalDebtorsPending,
      monthlyNet,
      closing,
    });

    // Accumulate closing as the next month's opening
    runningOpening = closing;
  }

  return {
    startMonth,
    monthsCount: count,
    series,
  };
}

/**
 * Applies a financial simulation scenario (loan, budget adjustment, extra income/cut)
 * to a computed baseline series or raw store data.
 *
 * @param {Array} baselineSeries - Array of monthly projection objects from computeMultiMonthProjection
 * @param {Object} scenario
 * @param {Object} [scenario.loan] - { principal, monthlyRatePercent, installments, startMonthOffset = 0 }
 * @param {number} [scenario.extraMonthlyIncome = 0]
 * @param {number} [scenario.extraMonthlyExpense = 0]
 * @param {number} [scenario.cardMonthlyBudget = null] - Target cap for credit card spending (if set and lower than baseline, savings are applied)
 */
export function applyScenarioToProjection(baselineSeries, scenario = {}) {
  const {
    loan = null,
    extraMonthlyIncome = 0,
    extraMonthlyExpense = 0,
    cardMonthlyBudget = null,
  } = scenario;

  let loanCalculations = null;
  if (loan && Number(loan.principal) > 0) {
    loanCalculations = calculateLoanInstallment({
      principal: loan.principal,
      monthlyRatePercent: loan.monthlyRatePercent,
      installments: loan.installments,
    });
  }

  const initialOpening = baselineSeries.length > 0 ? baselineSeries[0].opening : 0;
  let runningOpening = initialOpening;

  const simulatedSeries = baselineSeries.map((item, idx) => {
    let incomeDelta = roundMoney(Number(extraMonthlyIncome || 0));
    let expenseDelta = roundMoney(Number(extraMonthlyExpense || 0));

    // Loan: principal enters as cash in the first month (index = loan.startMonthOffset || 0)
    const loanStartIdx = Number(loan?.startMonthOffset || 0);
    if (loanCalculations && idx === loanStartIdx) {
      incomeDelta = roundMoney(incomeDelta + Number(loan.principal || 0));
    }

    // Loan installment: paid starting from the next month (or current month if startMonthOffset is specified)
    if (loanCalculations) {
      const loanInstallmentEnd = loanStartIdx + Number(loan.installments || 1);
      if (idx >= loanStartIdx + 1 && idx <= loanInstallmentEnd) {
        expenseDelta = roundMoney(expenseDelta + loanCalculations.installmentValue);
      }
    }

    // Card budget adjustment: if user wants to cap or expand credit card
    let cardAdjustment = 0;
    if (typeof cardMonthlyBudget === 'number' && cardMonthlyBudget >= 0) {
      const currentCard = item.creditCardsTotal;
      // If budget is higher, user spends more; if lower, savings
      cardAdjustment = roundMoney(cardMonthlyBudget - currentCard);
      if (cardAdjustment > 0) {
        expenseDelta = roundMoney(expenseDelta + cardAdjustment);
      } else {
        // Savings reduced from expenses
        expenseDelta = roundMoney(expenseDelta + cardAdjustment);
      }
    }

    const simWillReceive = roundMoney(item.willReceive + incomeDelta);
    const simTotalDebts = roundMoney(Math.max(0, item.totalDebts + expenseDelta));
    const simMonthlyNet = roundMoney(simWillReceive - simTotalDebts);
    const simOpening = runningOpening;
    const simClosing = roundMoney(simOpening + simMonthlyNet);

    runningOpening = simClosing;

    return {
      month: item.month,
      index: idx,
      opening: simOpening,
      willReceive: simWillReceive,
      totalDebts: simTotalDebts,
      monthlyNet: simMonthlyNet,
      closing: simClosing,
      baselineClosing: item.closing,
      diffVsBaseline: roundMoney(simClosing - item.closing),
    };
  });

  // Synthesize metrics
  const firstBalancedMonth = simulatedSeries.find((s) => s.closing >= 0)?.month || null;
  const worstMonth = simulatedSeries.reduce(
    (worst, cur) => (cur.closing < worst.closing ? cur : worst),
    simulatedSeries[0] || { month: null, closing: 0 }
  );
  const endBalance = simulatedSeries[simulatedSeries.length - 1]?.closing ?? 0;
  const isHealthyAtEnd = endBalance >= 0;

  // Maximum sustainable additional monthly spend without dipping below 0 at any month
  let safeMonthlyExtraSpend = null;
  const minClosing = Math.min(...simulatedSeries.map((s) => s.closing));
  if (minClosing > 0) {
    // If every month is positive, how much extra per month could be spent from month 0?
    // In month k (1-indexed), total extra spent is k * x. So x <= closing_k / (k + 1).
    const maxPerMonth = Math.min(
      ...simulatedSeries.map((s, idx) => s.closing / (idx + 1))
    );
    safeMonthlyExtraSpend = roundMoney(Math.max(0, maxPerMonth));
  } else {
    safeMonthlyExtraSpend = 0;
  }

  return {
    loanCalculations,
    series: simulatedSeries,
    metrics: {
      firstBalancedMonth,
      worstDeficit: roundMoney(worstMonth.closing),
      worstMonth: worstMonth.month,
      endBalance,
      isHealthyAtEnd,
      safeMonthlyExtraSpend,
    },
  };
}
