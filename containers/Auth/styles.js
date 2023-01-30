import { Button, Form } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding-top: 10px;
`;

export const RegistrationForm = styled(Form)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #232c68;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 5px;
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

export const Terms = styled.div`
  width: 320px;
  color: #232c68;
  margin-bottom: 20px;
  text-align: center;
`;

export const TermsLinks = styled.a`
  color: #368f42;
`;

export const GoogleButton = styled(Button)`
  background-color: #c71610;
  color: #fff;
  width: 300px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 40px;
  font-size: 1rem;
`