import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  width: 100%;
  min-height: 22vh;
  border-radius: 10px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  margin-bottom: 1px;
  border-width: 2px;
  border-style: solid;
  border-color: ${({future}) => future ? '#8176fb' : '#f0f0f0'};
  transition: border-color 1s;
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
  color: ${({ color }) => color};
  white-space: nowrap;
  font-weight: ${({weight}) => weight || 'normal'};
`;

export const BalanceValue = styled.div`
  font-size: ${({ width }) => (width < 400 ? '1.1rem' : '1.3rem')};
  color: ${({ color }) => color};
  white-space: nowrap;
`;

export const WarningContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  flex: 1;
`;

export const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 30%;
  height: 100%;
`;

export const SituationContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 5px;
  padding-right: 5px;
  width: 40%;
  height: 100%;
`;

export const SituationTitle = styled.h1`
  font-size: ${({ width }) => (width < 400 ? '0.8rem' : '1rem')};
  color: ${({ color }) => color || 'black'};
  margin: 0px;
  font-weight: bold;
`;

export const SituationDescription = styled.div`
  color: ${({ color }) => color || 'black'};
  text-align: center;
  font-size: ${({ width }) => (width < 400 ? '0.7rem' : '0.9rem')}
`;
