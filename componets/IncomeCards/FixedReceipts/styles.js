import styled from 'styled-components';
import CurrencyInput from 'react-currency-input';
import { Button, Form, Input } from 'antd';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 15px 15px 15px;
  width: 100%;
  height: ${({ items, error }) =>
    `${55 + (80 * (items > 0 ? items : 1)) + error}px`};
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const Head = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 5px;
`;

export const Label = styled.h1`
  font-size: 22px;
  color: black;
  margin: 0;
`;

export const AddButton = styled(Button)`
  background-color: blue;
  color: white;
  border-radius: 20px;
  color: white;

  &:enabled {
    background-color: blue;
    color: white;
  }
`;

export const ItemContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
`;

export const FormContainer = styled(Form)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;
export const ItemContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 80%;
`;

export const TitleInput = styled(Input)`
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
  margin-bottom: 5px;
`;

export const Title = styled.div`
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
  font-size: 1.5rem;
  height: '36px';
  color: green;
  background: #f0f0f0;
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
`;

export const DisplayValue = styled.div`
  font-size: 1.5rem;
  height: '36px';
  color: #368F42;
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 20%;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
`;

export const ActionButton = styled(Button)`
  background-color: ${({ color }) => color};
  color: white;
  border-radius: 40px;
  font-size: 1rem;
  width: 50px;

  &:hover {
    background-color: ${({ color }) => color};
    color: white;
  }

  &:enabled {
    background-color: ${({ color }) => color};
    color: white;
  }
`;
