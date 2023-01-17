import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8176fb;
  width: 100%;
  min-height: 4vh;
  border-radius: 10px;
  margin-bottom: 1px;
`;

export const LinkText = styled.a`
  width: 80%;
  text-align: center;
  color: white;

  &:hover {
    color: white;
  }
`;
