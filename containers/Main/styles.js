import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background-color: ${({future}) => future ? '#bfbdbd' : 'white'};
  width: 100%;
  height: 93vh;
  border-radius: 10px;
  transition: background-color 1s;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px;
  border-radius: 10px;
`;
