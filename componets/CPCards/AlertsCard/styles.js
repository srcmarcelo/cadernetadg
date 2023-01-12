import { Button } from 'antd';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 10px;
  width: 100%;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  color: orange;
  margin: 0px;
`;

export const SubTitle = styled.div`
  font-size: 1.2rem;
  color: #312d2d;
  margin-bottom: 10px;
`;

export const AlertContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: solid 1px orange;
  width: 100%;
  padding: 5px;
  margin-bottom: 10px;
`;

export const AlertTitle = styled.h3`
  font-size: 0.9rem;
  color: orange;
  margin-bottom: 5px;
`;

export const AlertDescription = styled.div`
  font-size: 0.8rem;
  color: black;
  text-align: center;
  margin-bottom: 5px;
`;

export const DetailsButton = styled(Button)`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: orange;
  color: #fff;
  font-size: 1rem;
  width: 100%;
  border-radius: 10px;

  &:enabled {
    background-color: orange;
    color: #fff;
    border: none;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

export const ContentTitle = styled.h2`
  font-size: 1.1rem;
  margin: 0px;
`;

export const Balance = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const BalanceLabel = styled.div`
  font-size: 1rem;
  color: ${({ color }) => color};
  white-space: nowrap;
  margin-right: 10px;
`;
