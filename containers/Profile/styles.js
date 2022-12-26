
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: blue;
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
  background-color: blue;
  width: 100%;
  height: 100%;
  padding: 0px 10px;
  border-radius: 10px;
  overflow-x: hidden;
  overflow-y: auto;
`;
