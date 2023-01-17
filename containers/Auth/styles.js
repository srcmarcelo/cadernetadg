import { Button, Form } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const RegistrationForm = styled(Form)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #232c68;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 30px;
`;

export const ErrorLabel = styled.div`
  color: red;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 30px;
`;

export const ChangeModeButton = styled(Button)`
  background-color: ${({ color }) => color};
  color: white;
  width: 150px;
  margin-bottom: 20px;

  &:enabled {
    background-color: ${({ color }) => color};
    color: white;
    border: none;
  }
`;
