import styled from 'styled-components';

export const AddButton = styled.div`
  background-color: blue;
  color: white;
  border-radius: 10px;
  width: ${({ hide }) => (hide ? '0px' : '30px')};
  height: 30px;
  transition: width 1s;
  display: flex;
  justify-content: center;
  align-items: center;
`;
