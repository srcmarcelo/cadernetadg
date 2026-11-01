const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function roundMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function formatBRL(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 'R$ 0,00';
  // Normalize -0
  const normalized = Object.is(num, -0) || Math.abs(num) < 0.005 ? 0 : num;
  return brlFormatter.format(normalized).replace(/\u00A0/g, ' ');
}

export function parseBRL(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? roundMoney(input) : 0;
  }
  if (typeof input !== 'string') return 0;
  const trimmed = input.trim();
  if (!trimmed) return 0;

  const isNegative = trimmed.includes('-');
  // If string contains comma as decimal separator (pt-BR format: "R$ 1.234,56" or "1234,56")
  if (trimmed.includes(',')) {
    const cleaned = trimmed
      .replace(/[^\d,]/g, '')
      .replace(/,(\d*)$/, '.$1')
      .replace(/,/g, '');
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return 0;
    return roundMoney(isNegative ? -parsed : parsed);
  }

  // Otherwise digits with optional dot decimal ("1234.56") or pure cents
  const cleaned = trimmed.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return 0;
  return roundMoney(isNegative ? -parsed : parsed);
}
