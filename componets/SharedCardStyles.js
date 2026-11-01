import styled from 'styled-components';

export const SectionCard = styled.section`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 14px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 640px) {
    padding: 18px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SectionTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionSubtitle = styled.span`
  font-size: 0.78rem;
  color: #64748B;
  line-height: 1.35;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 520px) {
    width: 100%;

    & > .ant-btn {
      flex: 1 1 auto;
      min-height: 38px;
      font-weight: 600;
    }
  }
`;

export const TotalBanner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ $variant }) =>
    $variant === 'danger'
      ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
      : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'};
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.88rem;

  & > span:last-child {
    white-space: nowrap;
    font-size: 0.98rem;
    font-weight: 800;
  }
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ListItemCard = styled.div`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: ${({ $muted }) => ($muted ? '#F8FAFC' : '#FFFFFF')};
  border: 1px solid ${({ $muted }) => ($muted ? '#E2E8F0' : '#CBD5E1')};
  opacity: ${({ $muted }) => ($muted ? 0.76 : 1)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  transition: border-color 0.15s ease, background 0.15s ease;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

export const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;

  @media (max-width: 480px) {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
`;

export const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;
  flex: 1;
`;

export const ItemName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ $strike }) => ($strike ? '#64748B' : '#0F172A')};
  text-decoration: ${({ $strike }) => ($strike ? 'line-through' : 'none')};
  word-break: break-word;
  line-height: 1.3;
`;

export const ItemAmount = styled.span`
  font-size: 1.08rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0F172A'};
  white-space: nowrap;
  flex-shrink: 0;
`;

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid #F1F5F9;
  }
`;

export const IconActionBtn = styled.button`
  min-width: 38px;
  height: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid ${({ $border }) => $border || '#E2E8F0'};
  background: ${({ $bg }) => $bg || '#F8FAFC'};
  color: ${({ $color }) => $color || '#334155'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 600;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  transition: background 0.15s ease, border-color 0.15s ease;

  @media (hover: hover) and (pointer: fine) {
    &:hover:not(:disabled) {
      filter: brightness(0.95);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const InlineEditorBox = styled.div`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #F8FAFC;
  border: 1.5px solid #94A3B8;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  align-items: end;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const FormActionsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;

  @media (max-width: 480px) {
    & > .ant-btn {
      flex: 1;
      min-height: 40px;
      font-weight: 600;
    }
  }
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
`;

export const EmptyBox = styled.div`
  width: 100%;
  padding: 22px 14px;
  border-radius: 12px;
  border: 1.5px dashed #CBD5E1;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  color: #64748B;
  font-size: 0.9rem;
`;
