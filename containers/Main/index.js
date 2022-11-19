import React, { useState } from 'react';
import Calendar from '../../componets/Calendar';
import MainInfo from '../../componets/MainInfo';
import NavigationBar from '../../componets/NavigationBar';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import { Container, Content } from './styles';

export default function Main() {
  const [currentTab, setCurrentTab] = useState('panel');

  return (
    <Container>
      <Content>
        <MainInfo />
        <Calendar />
        {currentTab === 'panel' && <ControlPanel />}
        {currentTab === 'income' && <Income />}
        {currentTab === 'outcome' && <Outcome />}
      </Content>
      <NavigationBar onClick={(value) => setCurrentTab(value)} currentTab={currentTab} />
    </Container>
  );
}
