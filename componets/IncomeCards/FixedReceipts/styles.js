import styled from 'styled-components';
import CurrencyInput from 'react-currency-input';
import { Button, Form, Input } from 'antd';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 15px 15px 15px;
  width: 100%;
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

export const Buttons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AddButton = styled(Button)`
  background-color: blue;
  color: white;
  border-radius: 20px;

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
  width: ${({ editing }) => (editing ? '80%' : '64%')};
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 0px;
`;

export const InputLabel = styled.div`
  display: flex;
  margin-right: 5px;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
`;

export const TitleInput = styled(Input)`
  font-size: 1rem;
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
  font-size: 1rem;
  color: ${({ received, disabled }) =>
    received || disabled ? '#fff' : 'black'};
  padding: 0px 5px;
  border-top: none;
  border-left: none;
  border-right: none;
  border-bottom-color: black;
  border-bottom-width: 1px;
  background: ${({ received, disabled }) =>
    received ? '#368f42' : disabled ? 'grey' : '#fff'};
  margin: 0;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Value = styled(CurrencyInput)`
  font-size: 1.5rem;
  height: '36px';
  color: green;
  background: #f0f0f0;
  border-radius: 10px;
  border: none;
  width: 100%;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 18%;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
`;

export const ActionButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ color }) => color};
  color: white;
  border-radius: 10px;
  font-size: 0.9rem;
  width: 40px;
  margin: 1px 0px;

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
  display: flex;
  justify-content: center;
  align-items: center;

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
