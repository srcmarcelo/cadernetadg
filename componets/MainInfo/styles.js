import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  width: 100%;
  height: 25vh;
  border-radius: 10px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
`;

export const BalancesContainer = styled.div`
  width: 100%;
  flex: 1;
`;

export const Balance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BalanceLabel = styled.div`
  font-size: 1rem;
  color: #8176fb;
`;

export const BalanceValue = styled.div`
  font-size: 1.3rem;
  color: ${({ color }) => color};
`;

export const WarningContainer = styled.div`
  color: green;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
`;
