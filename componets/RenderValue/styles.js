import styled from "styled-components";

export const DisplayDebtValue = styled.div`
  font-size: 1rem;
  height: '36px';
  color: ${({color}) => color || '#368f42'};
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  text-align: start;
`;

export const DisplayValue = styled.div`
  font-size: ${({fontSize}) => fontSize || '1.1rem'};
  height: '36px';
  color: ${({color}) => color || '#368f42'};
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  text-align: ${({start}) => start ? 'start' : 'center'};
`;