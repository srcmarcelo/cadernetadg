import styled from 'styled-components';
import CurrencyInput from 'react-currency-input';
import { Button, Input } from 'antd';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 15px 15px 15px;
  width: 100%;
  height: ${({ items }) => (items > 0 ? `${150 * items}px` : '150px')};
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const Head = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const Label = styled.h1`
  font-size: 24px;
  color: black;
  margin: 0;
`;

export const AddButton = styled(Button)`
  background: #f0f0f0;
  border-radius: 20px;
  padding: 5px 10px;
`;

export const AddButtonText = styled.h1`
  color: black;
  font-size: 11px;
  font-weight: bold;
`;

export const ItemContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
`;

export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 70%;
`;

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  border-bottom-color: black;
  border-bottom-width: 1px;
  margin-bottom: 5px;
`;

export const Title = styled(Input)`
  font-size: 20px;
  color: black;
  padding: 0px 10px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom-color: black;
  border-bottom-width: 1px;
  background: #f0f0f0;
  margin: 0;
  width: 100%;
`;

export const Value = styled(CurrencyInput)`
  font-size: ${(props) => props.size || '24px'};
  height: ${(props) => (props.size ? '26px' : '36px')};
  color: green;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 30%;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;
