import { Button } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: ${({sizeAdjust}) => `${20-(sizeAdjust || 0)}px`};
  color: black;
  text-align: center;
`;

export const Message = styled.p`
  font-size: ${({sizeAdjust}) => `${16-(sizeAdjust || 0)}px`};
  color: black;
  text-align: center;
`;

export const InitiateButton = styled(Button)`
  background-color: blue;
  color: white;
  border-radius: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &:enabled {
    background-color: blue;
    color: white;
  }
`;
