import { Button, Form, Input } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #8176fb;
  width: 100%;
  height: 58vh;
  border-radius: 10px;
  padding: 10px 0px;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #8176fb;
  width: 100%;
  height: 100%;
  padding: 0px 10px;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const NameContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DisplayName = styled.div`
  color: white;
  font-size: 1.3rem;
`;

export const EditButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  color: #fff;
  border-radius: 10px;
  width: 20px;
  margin-left: 5px;

  &:enabled {
    background-color: transparent;
    color: #fff;
  }
`;

export const FormContainer = styled(Form)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`;

export const TitleInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 50%;
`;

export const TitleInput = styled(Input)`
  font-size: 0.9rem;
  color: black;
  padding: 0px 5px;
  background: #f0f0f0;
  margin: 0;
  width: 100%;
  margin-bottom: 5px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: nowrap;
`;

export const EditNameButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ color }) => color};
  font-size: 0.8rem;
  border-radius: 10px;
  margin-left: 10px;
  width: 30px;
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

export const ProfileButton = styled(Button)`
  width: 200px;
  margin: 20px;
`;
