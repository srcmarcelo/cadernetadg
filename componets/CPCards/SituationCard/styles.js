import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 5px 10px;
  width: 100%;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-bottom: 20px;
`;

export const Title = styled.h1`
    font-size: 1.5rem;
    color: ${({color}) => color || 'black'};
    margin: 0px;
`;

export const Description = styled.div`
    font-size: 1rem;
    color: black;
    text-align: center;
    margin-top: 5px;
    margin-bottom: 5px;
`;

export const Situation = styled.h3`
    font-size: 1.3rem;
    color: ${({color}) => color || 'black'};
    margin: 0px;
`;