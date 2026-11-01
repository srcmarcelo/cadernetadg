import { roundMoney } from './currency';

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const MONTH_SHORT_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export function isValidYearMonth(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(value.trim());
  return Boolean(match);
}

export function getCurrentYearMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseYearMonth(yearMonth) {
  if (!isValidYearMonth(yearMonth)) {
    const fallback = getCurrentYearMonth();
    const [fy, fm] = fallback.split('-').map(Number);
    return { year: fy, month: fm };
  }
  const [year, month] = yearMonth.split('-').map(Number);
  return { year, month };
}

export function addMonths(yearMonth, delta) {
  const { year, month } = parseYearMonth(yearMonth);
  const totalMonths = year * 12 + (month - 1) + Number(delta || 0);
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = (((totalMonths % 12) + 12) % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
}

/**
 * Returns (monthA - monthB) in integer months.
 * Example: diffMonths('2026-12', '2026-11') === 1
 */
export function diffMonths(monthA, monthB) {
  const a = parseYearMonth(monthA);
  const b = parseYearMonth(monthB);
  return (a.year - b.year) * 12 + (a.month - b.month);
}

export function compareMonths(monthA, monthB) {
  const diff = diffMonths(monthA, monthB);
  if (diff < 0) return -1;
  if (diff > 0) return 1;
  return 0;
}

export function formatMonthYear(yearMonth, { short = false } = {}) {
  const { year, month } = parseYearMonth(yearMonth);
  const names = short ? MONTH_SHORT_PT : MONTH_NAMES_PT;
  return short ? `${names[month - 1]}/${year}` : `${names[month - 1]} de ${year}`;
}

export function getRelativeMonthBadge(selectedMonth, baseMonth = getCurrentYearMonth()) {
  const diff = diffMonths(selectedMonth, baseMonth);
  if (diff === 0) return 'Mês atual';
  if (diff === 1) return 'Próximo mês';
  if (diff === -1) return 'Mês anterior';
  if (diff > 1) return `Em ${diff} meses`;
  return `Há ${Math.abs(diff)} meses`;
}

/**
 * Resolves a Fixed Receipt (Recebimento Fixo) for any calendar month YYYY-MM,
 * preserving full backwards compatibility with legacy `received` & `future_received`.
 */
export function resolveFixedReceiptForMonth(item, selectedMonth, baseMonth = getCurrentYearMonth()) {
  const nextMonth = addMonths(baseMonth, 1);
  const statusMap = item?.monthly_status && typeof item.monthly_status === 'object' ? item.monthly_status : {};
  const monthEntry = statusMap[selectedMonth];

  let received = false;
  let disabled = false;
  let value = roundMoney(item?.value || 0);

  if (monthEntry && typeof monthEntry === 'object') {
    if (monthEntry.value !== undefined && monthEntry.value !== null) {
      value = roundMoney(monthEntry.value);
    }
    received = Boolean(monthEntry.received);
    disabled = Boolean(monthEntry.disabled);
  } else if (selectedMonth === baseMonth) {
    received = Boolean(item?.received);
    disabled = Boolean(item?.disabled);
  } else if (selectedMonth === nextMonth) {
    received = Boolean(item?.future_received);
    disabled = Boolean(item?.future_disabled);
  }

  return {
    ...item,
    effectiveValue: value,
    effectiveReceived: received,
    effectiveDisabled: disabled,
    active: true,
  };
}

/**
 * Resolves a Fixed Debt (Despesa Fixa) for any calendar month YYYY-MM,
 * preserving full backwards compatibility with legacy `payed` & `future_payed`.
 */
export function resolveFixedDebtForMonth(item, selectedMonth, baseMonth = getCurrentYearMonth()) {
  const nextMonth = addMonths(baseMonth, 1);
  const statusMap = item?.monthly_status && typeof item.monthly_status === 'object' ? item.monthly_status : {};
  const monthEntry = statusMap[selectedMonth];

  let paid = false;
  let disabled = false;
  let value = roundMoney(item?.value || 0);

  if (monthEntry && typeof monthEntry === 'object') {
    if (monthEntry.value !== undefined && monthEntry.value !== null) {
      value = roundMoney(monthEntry.value);
    }
    paid = Boolean(monthEntry.paid ?? monthEntry.payed);
    disabled = Boolean(monthEntry.disabled);
  } else if (selectedMonth === baseMonth) {
    paid = Boolean(item?.payed);
    disabled = Boolean(item?.disabled);
  } else if (selectedMonth === nextMonth) {
    paid = Boolean(item?.future_payed);
    disabled = Boolean(item?.future_disabled);
  }

  return {
    ...item,
    effectiveValue: value,
    effectivePaid: paid,
    effectiveDisabled: disabled,
    active: true,
  };
}

/**
 * Computes the effective start_month (YYYY-MM of installment #1) for installment-based
 * records (`extra_debts` and `debts`), seamlessly inferring from legacy `current_pay`
 * when `start_month` is not yet stored.
 */
export function inferStartMonth(item, baseMonth = getCurrentYearMonth()) {
  if (isValidYearMonth(item?.start_month)) {
    return item.start_month;
  }
  const currentPay = typeof item?.current_pay === 'number' ? item.current_pay : 1;
  return addMonths(baseMonth, 1 - currentPay);
}

/**
 * Resolves an installment-based Debt (`extra_debts` or `debts` of a debtor)
 * for any calendar month YYYY-MM.
 */
export function resolveInstallmentItemForMonth(item, selectedMonth, baseMonth = getCurrentYearMonth()) {
  const totalInstallments = Math.max(1, parseInt(item?.installments || 1, 10));
  const nextMonth = addMonths(baseMonth, 1);
  const hasExplicitStart = isValidYearMonth(item?.start_month);
  const startMonth = inferStartMonth(item, baseMonth);

  let installmentNumber;
  if (!hasExplicitStart && selectedMonth === baseMonth && typeof item?.current_pay === 'number') {
    installmentNumber = item.current_pay;
  } else if (!hasExplicitStart && selectedMonth === nextMonth && typeof item?.future_pay === 'number') {
    installmentNumber = item.future_pay;
  } else {
    installmentNumber = diffMonths(selectedMonth, startMonth) + 1;
  }

  const active = installmentNumber >= 1 && installmentNumber <= totalInstallments;

  const statusMap = item?.monthly_status && typeof item.monthly_status === 'object' ? item.monthly_status : {};
  const monthEntry = statusMap[selectedMonth];

  let paid = false;
  let disabled = false;
  let value = roundMoney(item?.value || 0);

  if (monthEntry && typeof monthEntry === 'object') {
    if (monthEntry.value !== undefined && monthEntry.value !== null) {
      value = roundMoney(monthEntry.value);
    }
    paid = Boolean(monthEntry.paid ?? monthEntry.received);
    disabled = Boolean(monthEntry.disabled);
  } else if (!hasExplicitStart && selectedMonth === baseMonth) {
    disabled = Boolean(item?.disabled);
  } else if (!hasExplicitStart && selectedMonth === nextMonth) {
    disabled = Boolean(item?.future_disabled);
  }

  return {
    ...item,
    start_month: startMonth,
    currentInstallment: installmentNumber,
    totalInstallments,
    effectiveValue: value,
    effectivePaid: paid,
    effectiveDisabled: disabled,
    active,
  };
}

/**
 * Resolves an Extra Receipt (Recebimento Extra) for a specific calendar month YYYY-MM.
 */
export function resolveExtraReceiptForMonth(item, selectedMonth, baseMonth = getCurrentYearMonth()) {
  const nextMonth = addMonths(baseMonth, 1);
  const targetMonth = isValidYearMonth(item?.target_month)
    ? item.target_month
    : item?.future
    ? nextMonth
    : baseMonth;

  const active = targetMonth === selectedMonth;

  let value = roundMoney(item?.value || 0);
  if (!isValidYearMonth(item?.target_month) && item?.future) {
    value = roundMoney(item?.future_value || item?.value || 0);
  }

  let disabled = false;
  if (isValidYearMonth(item?.target_month)) {
    disabled = Boolean(item?.disabled);
  } else if (item?.future) {
    disabled = Boolean(item?.future_disabled);
  } else {
    disabled = Boolean(item?.disabled);
  }

  const received = Boolean(item?.received);

  return {
    ...item,
    target_month: targetMonth,
    effectiveValue: value,
    effectiveReceived: received,
    effectiveDisabled: disabled,
    active,
  };
}
