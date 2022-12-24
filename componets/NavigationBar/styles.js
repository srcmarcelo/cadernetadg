import styled from 'styled-components';
import { Button } from 'antd';

export const Container = styled.div`
  display: flex;
  width: 100%;
  height: 5.5vh;
  border-radius: 10px;
  padding: 10px;
  background-color: ${({ color }) => color};
  justify-content: space-around;
  align-items: center;
`;

export const NavigationButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ color }) => color};
  color: white;
  font-size: 1rem;
  border-color: transparent;
  height: 30px;
  width: 30%;
  border-radius: 30px;
  border-width: ${({ selected }) => selected && '1px'};
  border-color: ${({ selected }) => selected && 'white'};

  &:hover {
    background-color: ${({ color }) => color};
    border-color: ${({ selected }) => (selected ? 'white' : 'transparent')};
    color: white;
  }

  &:focus {
    background-color: ${({ color }) => color};
    border-width: 1px;
    border-color: white;
    color: white;
  }
`;
