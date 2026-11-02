import { roundMoney } from './currency';
import {
  addMonths,
  compareMonths,
  diffMonths,
  formatMonthYear,
  getCurrentYearMonth,
  isValidYearMonth,
  resolveExtraReceiptForMonth,
  resolveFixedDebtForMonth,
  resolveFixedReceiptForMonth,
  resolveInstallmentItemForMonth,
} from './monthUtils';

/**
 * Resolves a single Credit Card Purchase for a given month YYYY-MM.
 */
export function resolveCardPurchaseForMonth(purchase, selectedMonth) {
  const disabledMap =
    purchase?.disabled_months && typeof purchase.disabled_months === 'object'
      ? purchase.disabled_months
      : {};
  const rawEntry = disabledMap[selectedMonth];
  const disabled =
    typeof rawEntry === 'object' && rawEntry !== null
      ? Boolean(rawEntry.disabled)
      : Boolean(rawEntry);
  const startMonth = isValidYearMonth(purchase?.start_month)
    ? purchase.start_month
    : selectedMonth;
  const totalInstallments = Math.max(1, parseInt(purchase?.installments || 1, 10));
  const value = roundMoney(purchase?.value || 0);

  if (purchase?.is_recurring) {
    const started = compareMonths(selectedMonth, startMonth) >= 0;
    const notEnded =
      !isValidYearMonth(purchase?.end_month) ||
      compareMonths(selectedMonth, purchase.end_month) <= 0;
    const active = started && notEnded;

    return {
      ...purchase,
      start_month: startMonth,
      active,
      isRecurring: true,
      currentInstallment: null,
      totalInstallments: 1,
      effectiveValue: value,
      effectiveDisabled: disabled,
    };
  }

  const instNum = diffMonths(selectedMonth, startMonth) + 1;
  const active = instNum >= 1 && instNum <= totalInstallments;

  return {
    ...purchase,
    start_month: startMonth,
    active,
    isRecurring: false,
    currentInstallment: instNum,
    totalInstallments,
    effectiveValue: value,
    effectiveDisabled: disabled,
  };
}

/**
 * Resolves a Credit Card and its complete monthly invoice (fatura) for `selectedMonth`.
 * Supports detailed purchases (à vista, parceladas, recorrentes), manual adjustments,
 * and 100% backwards-compatible fallback to legacy `value` / `future_value`.
 */
export function resolveCreditCardForMonth(
  card,
  allPurchases = [],
  selectedMonth,
  baseMonth = getCurrentYearMonth()
) {
  const nextMonth = addMonths(baseMonth, 1);
  const invoicesMap =
    card?.monthly_invoices && typeof card.monthly_invoices === 'object'
      ? card.monthly_invoices
      : {};
  const monthMeta = invoicesMap[selectedMonth] || {};

  const cardPurchases = allPurchases
    .filter((p) => p.card_id === card.id)
    .map((p) => resolveCardPurchaseForMonth(p, selectedMonth))
    .filter((p) => p.active);

  const activePurchases = cardPurchases.filter((p) => !p.effectiveDisabled);

  let singleTotal = 0;
  let installmentsTotal = 0;
  let recurringTotal = 0;

  activePurchases.forEach((p) => {
    if (p.isRecurring) {
      recurringTotal += p.effectiveValue;
    } else if (p.totalInstallments > 1) {
      installmentsTotal += p.effectiveValue;
    } else {
      singleTotal += p.effectiveValue;
    }
  });

  singleTotal = roundMoney(singleTotal);
  installmentsTotal = roundMoney(installmentsTotal);
  recurringTotal = roundMoney(recurringTotal);

  const purchasesTotal = roundMoney(singleTotal + installmentsTotal + recurringTotal);
  const hasDetailedPurchases = cardPurchases.length > 0;

  const manualAdjustment = roundMoney(monthMeta.manual_adjustment || 0);
  const hasManualOverride =
    monthMeta.manual_total !== undefined && monthMeta.manual_total !== null;

  let effectiveValue = 0;
  if (hasManualOverride && monthMeta.override_total === true) {
    effectiveValue = roundMoney(monthMeta.manual_total);
  } else if (hasDetailedPurchases) {
    effectiveValue = Math.max(0, roundMoney(purchasesTotal + manualAdjustment));
  } else if (hasManualOverride) {
    effectiveValue = roundMoney(monthMeta.manual_total);
  } else if (selectedMonth === baseMonth) {
    effectiveValue = roundMoney(card?.value || 0);
  } else if (selectedMonth === nextMonth) {
    effectiveValue = roundMoney(card?.future_value || 0);
  } else {
    effectiveValue = 0;
  }

  let disabled = false;
  if (monthMeta.disabled !== undefined) {
    disabled = Boolean(monthMeta.disabled);
  } else if (selectedMonth === baseMonth) {
    disabled = Boolean(card?.disabled);
  } else if (selectedMonth === nextMonth) {
    disabled = Boolean(card?.future_disabled);
  }

  const paid = Boolean(monthMeta.paid);

  return {
    ...card,
    effectiveValue,
    effectivePaid: paid,
    effectiveDisabled: disabled,
    purchases: cardPurchases,
    hasDetailedPurchases,
    purchasesTotal,
    singleTotal,
    installmentsTotal,
    recurringTotal,
    manualAdjustment,
    monthMeta,
  };
}

/**
 * Generates a multi-month projection for a credit card starting from `startFromMonth`
 * for `monthsCount` months ahead (great for seeing how parcelamentos affect future faturas).
 */
export function getCardFutureProjection(
  card,
  allPurchases = [],
  startFromMonth = getCurrentYearMonth(),
  monthsCount = 6,
  baseMonth = getCurrentYearMonth()
) {
  const result = [];
  for (let i = 0; i < monthsCount; i += 1) {
    const m = addMonths(startFromMonth, i);
    const resolved = resolveCreditCardForMonth(card, allPurchases, m, baseMonth);
    result.push({
      month: m,
      label: formatMonthYear(m, { short: true }),
      fullLabel: formatMonthYear(m),
      total: resolved.effectiveValue,
      installmentsTotal: resolved.installmentsTotal,
      singleTotal: resolved.singleTotal,
      recurringTotal: resolved.recurringTotal,
      itemsCount: resolved.purchases.length,
      paid: resolved.effectivePaid,
      disabled: resolved.effectiveDisabled,
    });
  }
  return result;
}

/**
 * Computes all financial totals for a single month YYYY-MM.
 */
export function computeSingleMonthSummary({
  selectedMonth,
  baseMonth = getCurrentYearMonth(),
  fixedReceipts = [],
  extraReceipts = [],
  debts = [],
  fixedDebts = [],
  extraDebts = [],
  creditCards = [],
  cardPurchases = [],
}) {
  const resolvedFixedReceipts = fixedReceipts.map((item) =>
    resolveFixedReceiptForMonth(item, selectedMonth, baseMonth)
  );
  const resolvedExtraReceipts = extraReceipts
    .map((item) => resolveExtraReceiptForMonth(item, selectedMonth, baseMonth))
    .filter((item) => item.active);
  const resolvedDebtorDebts = debts
    .map((item) => resolveInstallmentItemForMonth(item, selectedMonth, baseMonth))
    .filter((item) => item.active);

  const resolvedFixedDebts = fixedDebts.map((item) =>
    resolveFixedDebtForMonth(item, selectedMonth, baseMonth)
  );
  const resolvedExtraDebts = extraDebts
    .map((item) => resolveInstallmentItemForMonth(item, selectedMonth, baseMonth))
    .filter((item) => item.active);
  const resolvedCreditCards = creditCards.map((card) =>
    resolveCreditCardForMonth(card, cardPurchases, selectedMonth, baseMonth)
  );

  let willReceive = 0;
  resolvedFixedReceipts.forEach((item) => {
    if (!item.effectiveReceived && !item.effectiveDisabled && item.effectiveValue > 0) {
      willReceive += item.effectiveValue;
    }
  });
  resolvedExtraReceipts.forEach((item) => {
    if (!item.effectiveReceived && !item.effectiveDisabled && item.effectiveValue > 0) {
      willReceive += item.effectiveValue;
    }
  });
  resolvedDebtorDebts.forEach((item) => {
    if (!item.effectivePaid && !item.effectiveDisabled && item.effectiveValue > 0) {
      willReceive += item.effectiveValue;
    }
  });

  let totalDebtorsPending = 0;
  resolvedDebtorDebts.forEach((item) => {
    if (!item.effectivePaid && !item.effectiveDisabled && item.effectiveValue > 0) {
      totalDebtorsPending += item.effectiveValue;
    }
  });

  let totalDebts = 0;
  resolvedFixedDebts.forEach((item) => {
    if (!item.effectivePaid && !item.effectiveDisabled && item.effectiveValue > 0) {
      totalDebts += item.effectiveValue;
    }
  });
  resolvedExtraDebts.forEach((item) => {
    if (!item.effectivePaid && !item.effectiveDisabled && item.effectiveValue > 0) {
      totalDebts += item.effectiveValue;
    }
  });
  resolvedCreditCards.forEach((card) => {
    if (!card.effectivePaid && !card.effectiveDisabled && card.effectiveValue > 0) {
      totalDebts += card.effectiveValue;
    }
  });

  willReceive = roundMoney(willReceive);
  totalDebtorsPending = roundMoney(totalDebtorsPending);
  totalDebts = roundMoney(totalDebts);
  const monthlyNet = roundMoney(willReceive - totalDebts);

  return {
    willReceive,
    totalDebts,
    totalDebtorsPending,
    monthlyNet,
    resolvedFixedReceipts,
    resolvedExtraReceipts,
    resolvedDebtorDebts,
    resolvedFixedDebts,
    resolvedExtraDebts,
    resolvedCreditCards,
  };
}

/**
 * Computes the complete financial state for `selectedMonth`, including cascading
 * projected opening balance and kept balance when viewing future months!
 */
export function computeFinancialViewForMonth({
  selectedMonth,
  baseMonth = getCurrentYearMonth(),
  currentBalance = 0,
  keptBalance = 0,
  fixedReceipts = [],
  extraReceipts = [],
  debts = [],
  fixedDebts = [],
  extraDebts = [],
  creditCards = [],
  cardPurchases = [],
}) {
  const offset = diffMonths(selectedMonth, baseMonth);

  let openingBalance = roundMoney(currentBalance || 0);
  let projectedKept = roundMoney(keptBalance || 0);

  if (offset > 0) {
    // Cascade month-by-month from baseMonth up to selectedMonth - 1
    // Deficits accumulate directly into openingBalance so the user sees the real snowball effect
    const steps = Math.min(offset, 120);
    for (let i = 0; i < steps; i += 1) {
      const m = addMonths(baseMonth, i);
      const stepSummary = computeSingleMonthSummary({
        selectedMonth: m,
        baseMonth,
        fixedReceipts,
        extraReceipts,
        debts,
        fixedDebts,
        extraDebts,
        creditCards,
        cardPurchases,
      });
      openingBalance = roundMoney(openingBalance + stepSummary.monthlyNet);
    }
  } else if (offset < 0) {
    // Past months show monthly performance without applying today's live bank balance
    openingBalance = 0;
  }

  const summary = computeSingleMonthSummary({
    selectedMonth,
    baseMonth,
    fixedReceipts,
    extraReceipts,
    debts,
    fixedDebts,
    extraDebts,
    creditCards,
    cardPurchases,
  });

  const closingBalance = roundMoney(openingBalance + summary.monthlyNet);
  const monthlyLoss = summary.monthlyNet < 0;
  const accumulatedDeficit = openingBalance < 0;
  const closingNegative = closingBalance < 0;
  const debtorDependency =
    summary.totalDebtorsPending > 0 &&
    (monthlyLoss ||
      roundMoney(openingBalance + summary.willReceive - summary.totalDebts - summary.totalDebtorsPending) < 0);

  return {
    ...summary,
    offset,
    isPastMonth: offset < 0,
    isCurrentMonth: offset === 0,
    isFutureMonth: offset > 0,
    openingBalance,
    projectedKept,
    closingBalance,
    monthlyLoss,
    accumulatedDeficit,
    closingNegative,
    debtorDependency,
  };
}
