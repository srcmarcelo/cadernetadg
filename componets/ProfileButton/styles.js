import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 4vh;
  margin-bottom: 1px;
`;

export const Profile = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8176fb;
  width: 49%;
  min-height: 4vh;
  border-radius: 10px;
`;

export const SwitchMonth = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ future }) => (future ? '#8176fb' : '#232C68')};
  transition: background-color 1s;
  width: 49%;
  min-height: 4vh;
  border-radius: 10px;
`;

export const LinkText = styled.a`
  display: flex;
  justify-content: center;
  align-content: center;
  width: 100%;
  text-align: center;
  color: white;

  &:hover {
    color: white;
  }
`;

export const Left = styled(ArrowLeftOutlined)`
  font-size: ${({ future }) => (future ? '18px' : '0px')};
  color: white;
  margin-top: 2px;
  margin-right: ${({ future }) => (future ? '10px' : '20px')};
  transition: font-size 1s;
  transition: margin-right 1s;
`;

export const Right = styled(ArrowRightOutlined)`
  font-size: ${({ future }) => (!future ? '18px' : '0px')};
  color: white;
  margin-top: 2px;
  margin-left: ${({ future }) => (!future ? '10px' : '20px')};
  transition: font-size 1s;
  transition: margin-left 1s;
`;
