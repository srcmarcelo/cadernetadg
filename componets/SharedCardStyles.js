import styled from 'styled-components';

export const SectionCard = styled.section`
  width: 100%;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 18px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const SectionTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 1.08rem;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SectionSubtitle = styled.span`
  font-size: 0.78rem;
  color: #64748B;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const TotalBanner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 12px;
  background: ${({ $variant }) =>
    $variant === 'danger'
      ? 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
      : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'};
  color: #FFFFFF;
  font-weight: 700;
  font-size: 0.9rem;
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ListItemCard = styled.div`
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${({ $muted }) => ($muted ? '#F8FAFC' : '#FFFFFF')};
  border: 1px solid ${({ $muted }) => ($muted ? '#E2E8F0' : '#CBD5E1')};
  opacity: ${({ $muted }) => ($muted ? 0.74 : 1)};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.16s ease;

  @media (max-width: 520px) {
    flex-wrap: wrap;
  }
`;

export const ItemInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

export const ItemTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

export const ItemName = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ $strike }) => ($strike ? '#64748B' : '#0F172A')};
  text-decoration: ${({ $strike }) => ($strike ? 'line-through' : 'none')};
  word-break: break-word;
`;

export const ItemAmount = styled.span`
  font-size: 1.12rem;
  font-weight: 800;
  color: ${({ $color }) => $color || '#0F172A'};
`;

export const ItemActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

export const IconActionBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid ${({ $border }) => $border || '#E2E8F0'};
  background: ${({ $bg }) => $bg || '#F8FAFC'};
  color: ${({ $color }) => $color || '#334155'};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
    transform: translateY(-1px);
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
  gap: 10px;
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  align-items: end;
`;

export const FieldLabel = styled.label`
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
`;

export const EmptyBox = styled.div`
  width: 100%;
  padding: 24px 16px;
  border-radius: 12px;
  border: 1.5px dashed #CBD5E1;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  color: #64748B;
  font-size: 0.9rem;
`;
