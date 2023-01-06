import styled from 'styled-components';

export const TotalContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-radius: 10px;
  padding: 10px;
  background-color: ${({ color }) => color || '#368f42'};
`;

export const TotalLabel = styled.h1`
  font-size: 1.2rem;
  margin: 0px;
  color: #fff;
`;
