import styled from 'styled-components';
import CurrencyInput from 'react-currency-input';
import { Button, Form, Input } from 'antd';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 15px 5px 15px;
  width: 100%;
  height: ${({ debtors, debts, error }) =>
    `${
      20 +
      (debtors > 0 ? 100 : 0) +
      115 * (debtors > 0 ? debtors : 1) +
      80 * (debts) +
      error
    }px`};
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

export const DebtContainer = styled.div`
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

export const DebtContent = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
  margin-top: 10px;
`;

export const ValueContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 35%;
`;

export const InstallmentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-left: 1%;
  padding-right: 1%;
  width: ${({form}) => form ? '35%' : '20%'};
`;

export const InstalmentsLabel = styled.div`
  font-size: 0.8rem;
  color: ${({color}) => color || 'black'};
`;

export const TitleInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 69%;
`;

export const TitleInput = styled(Input)`
  font-size: 0.9rem;
  color: black;
  padding: 0px 5px;
  border-top: none;
  border-left: none;
  border-right: none;
  background: #f0f0f0;
  margin: 0;
  width: 100%;
  margin-bottom: 5px;
`;

export const TitleDebtInput = styled(Input)`
  font-size: 0.8rem;
  color: black;
  padding: 0px 5px;
  border-top: none;
  border-left: none;
  border-right: none;
  background: #f0f0f0;
  margin: 0px 0px 5px 0px;
  width: 100%;
`;

export const Title = styled.div`
  font-size: 0.9rem;
  color: ${({ received }) => (received ? '#fff' : 'black')};
  padding: 0px 5px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom-color: black;
  border-bottom-width: 1px;
  background: ${({ received }) => (received ? '#368f42' : '#fff')};
  margin: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TitleDebt = styled.div`
  font-size: 0.8rem;
  color: ${({ disabled }) => (disabled ? '#fff' : 'black')};
  padding: 0px 5px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom-color: black;
  border-bottom-width: 1px;
  background: ${({ received }) => (received ? '#368f42' : '#fff')};
  margin: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background-color: ${({disabled}) => disabled ? 'grey' : 'none'};
`;

export const Value = styled(CurrencyInput)`
  font-size: 1.1rem;
  height: '36px';
  color: green;
  background: #f0f0f0;
  border-radius: 10px;
  border: none;
  width: 100%;
`;

export const DisplayValue = styled.div`
  font-size: 1.1rem;
  height: '36px';
  color: ${({color}) => color || '#368f42'};
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  text-align: center;
`;

export const DisplayDebtValue = styled.div`
  font-size: 1rem;
  height: '36px';
  color: #368f42;
  border-radius: 10px;
  padding: 0px 5px;
  border: none;
  width: 100%;
  white-space: nowrap;
  overflow-x: auto;
  text-align: start;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: ${({form}) => form ? '30%' : '45%'};
  justify-content: space-around;
  align-items: center;
  flex-wrap: nowrap;
`;

export const ActionButton = styled(Button)`
  background-color: ${({ color }) => color};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 0.9rem;
  border-radius: 10px;
  margin-right: 2px;
  margin-left: 2px;
  width: 30px;

  &:hover {
    background-color: ${({ color }) => color};
    border-color: ${({ color }) => color};
    color: white;
  }

  &:enabled {
    background-color: ${({ color }) => color};
    border-color: ${({ color }) => color};
    color: white;
  }
`;

export const ConfirmButton = styled(Button)`
  background-color: ${({ color }) => color};
  color: white;
  font-size: 2rem;
  width: 100%;
  height: 100%;

  &:hover {
    background-color: ${({ color }) => color};
    border-color: ${({ color }) => color};
    color: white;
  }

  &:enabled {
    background-color: ${({ color }) => color};
    border-color: ${({ color }) => color};
    color: white;
  }
`;

export const DebtorContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  flex-direction: column;
  border: solid;
  border-width: 1px;
  border-color: black;
  border-radius: 10px;
  padding: 3px;
`;

export const DebtorHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
`;

export const DebtorNameContainer = styled.div`
  display: flex;
  width: 35%;
  justify-content: center;
  align-items: center;
`;

export const EditNameButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ color }) => color};
  font-size: 0.9rem;
  border-radius: 10px;
  margin-right: 1px;
  margin-left: 1px;
  width: 10px;
  padding: 10px;
  border: none;

  &:hover {
    color: ${({ color }) => color};
    border: none;
  }

  &:enabled {
    color: ${({ color }) => color};
    border: none;
  }
`;

export const DebtorValueContainer = styled.div`
  display: flex;
  width: 35%;
  justify-content: center;
`;

export const DebtorButtonsContainer = styled.div`
  display: flex;
  width: 30%;
  justify-content: space-around;
  align-items: center;
`;

export const DebtsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
