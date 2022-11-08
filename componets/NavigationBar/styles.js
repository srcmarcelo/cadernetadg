import styled from 'styled-components';
import { Button } from 'antd';

export const Container = styled.div`
  display: flex;
  width: 100%;
  background-color: #8c8c8c;
  height: 5vh;
  border-top-left-radius: 100px;
  border-top-right-radius: 100px;
  justify-content: center;
  align-items: center;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  width: 80%;
  justify-content: space-around;
  align-items: center;
`;

export const NavigationButton = styled(Button)`
  color: ${({ color }) => color};
  font-size: 1rem;
  background-color: transparent;
  border-color: transparent;
  height: 100%;

  &:hover {
    background-color: transparent;
    border-color: transparent;
    color: ${({ color }) => color};
  }

  &:focus {
    background-color: transparent;
    border-color: transparent;
    color: ${({ color }) => color};
    font-size: 1.5rem;
  }
`;
