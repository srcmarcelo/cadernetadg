/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import Calendar from '../../componets/Calendar';
import MainInfo from '../../componets/MainInfo';
import NavigationBar from '../../componets/NavigationBar';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import { syncData } from './redux';
import { Container, Content } from './styles';

export default function Main() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const [currentTab, setCurrentTab] = useState('panel');

  useEffect(() => {
    syncData(dispatch, supabase, user);
  }, []);

  return (
    <Container>
      <Content>
        <MainInfo />
        <Calendar />
        {currentTab === 'panel' && <ControlPanel />}
        {currentTab === 'income' && <Income />}
        {currentTab === 'outcome' && <Outcome />}
        <NavigationBar
          onClick={(value) => setCurrentTab(value)}
          currentTab={currentTab}
        />
      </Content>
    </Container>
  );
}
