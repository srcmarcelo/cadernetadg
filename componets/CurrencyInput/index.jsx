import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatBRL, roundMoney } from '../../utils/currency';

const StyledInput = styled.input`
  width: 100%;
  padding: ${({ $compact }) => ($compact ? '6px 10px' : '9px 12px')};
  font-size: ${({ $fontSize }) => $fontSize || '1rem'};
  font-weight: 600;
  color: ${({ $color }) => $color || '#0F172A'};
  background: #FFFFFF;
  border: 1.5px solid #CBD5E1;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: #232C68;
    box-shadow: 0 0 0 3px rgba(35, 44, 104, 0.12);
  }

  &:disabled {
    background: #F1F5F9;
    color: #94A3B8;
    cursor: not-allowed;
  }
`;

/**
 * Modern, React 19 compatible BRL Currency Input (`R$ 1.234,56`).
 * Typing digits shifts cents smoothly like Brazilian banking apps,
 * and works natively inside Ant Design `<Form.Item>` (`value` + `onChange(number)`).
 */
export default function CurrencyInput({
  value,
  onChange,
  allowNegative = false,
  placeholder = 'R$ 0,00',
  disabled = false,
  compact = false,
  fontSize,
  color,
  className,
  id,
  style,
}) {
  const numericValue = useMemo(() => {
    const n = Number(value);
    return Number.isFinite(n) ? roundMoney(n) : 0;
  }, [value]);

  const displayString = useMemo(() => formatBRL(numericValue), [numericValue]);

  const handleChange = (e) => {
    const raw = e.target.value || '';
    const isNeg = allowNegative && raw.includes('-');
    const digitsOnly = raw.replace(/\D/g, '');
    if (!digitsOnly) {
      onChange?.(0);
      return;
    }
    // Cap to 12 digits (up to R$ 9.999.999.999,99)
    const capped = digitsOnly.slice(0, 12);
    const cents = parseInt(capped, 10);
    const nextVal = roundMoney((isNeg ? -cents : cents) / 100);
    onChange?.(nextVal);
  };

  const handleFocus = (e) => {
    // Place cursor at the end for smooth ATM-style entry
    const len = e.target.value.length;
    requestAnimationFrame(() => {
      try {
        e.target.setSelectionRange(len, len);
      } catch {
        // ignore on unsupported input types
      }
    });
  };

  return (
    <StyledInput
      id={id}
      type='text'
      inputMode='numeric'
      value={displayString}
      onChange={handleChange}
      onFocus={handleFocus}
      placeholder={placeholder}
      disabled={disabled}
      $compact={compact}
      $fontSize={fontSize}
      $color={color}
      className={className}
      style={style}
    />
  );
}
