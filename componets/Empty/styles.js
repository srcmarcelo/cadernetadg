import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: ${({sizeAdjust}) => `${16-(sizeAdjust || 0)}px`};
  color: black;
  text-align: center;
`;

export const Message = styled.p`
  font-size: ${({sizeAdjust}) => `${12-(sizeAdjust || 0)}px`};
  color: black;
  text-align: center;
`;
