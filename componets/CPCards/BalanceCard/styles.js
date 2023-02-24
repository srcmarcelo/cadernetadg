import styled from 'styled-components';
import CurrencyInput from 'react-currency-input';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 15px 15px 15px;
  width: 100%;
  height: 150px;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Title = styled.h1`
  font-size: ${(props) => props.size || '20px'};
  color: black;
  margin: 0;
`;

export const Value = styled(CurrencyInput)`
  font-size: ${(props) => props.size || '28px'};
  color: green;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
`;
