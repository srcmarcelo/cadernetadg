/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import JoyRide from 'react-joyride';

import ProfileButton from '../../componets/ProfileButton';
import MainInfo from '../../componets/MainInfo';
import NavigationBar from '../../componets/NavigationBar';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import { syncData } from './redux';
import { Container, Content } from './styles';
import Profile from '../Profile';
import { mainTourSteps } from '../../utils/toursSteps/mainTour';

export default function Main() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const [currentTab, setCurrentTab] = useState('panel');
  const [future, setFuture] = useState(false);
  const [tour, setTour] = useState(false);
  const [pastValue, setPastValue] = useState(0);

  useEffect(() => {
    syncData(dispatch, supabase, user);
  }, []);

  const callbacks = {
    2: () => setCurrentTab('panel'),
    4: () => setCurrentTab('income'),
    6: () => setCurrentTab('outcome'),
    8: () => setCurrentTab('profile'),
    10: () => {
      setFuture(!future);
      setCurrentTab('panel');
    },
    11: () => setFuture(!future),
  };

  return (
    <Container className='app' future={future}>
      <JoyRide
        steps={mainTourSteps}
        run={tour}
        continuous={true}
        showSkipButton={true}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          open: 'Abrir legenda',
          skip: 'Pular guia',
        }}
        callback={({ index, action }) => {
          if(action === 'reset') setTour(false);
          if (callbacks[index]) callbacks[index]();
        }}
      />
      <Content>
        <MainInfo
          dispatch={dispatch}
          future={future}
          setPastValue={setPastValue}
        />
        <ProfileButton
          onClickProfile={setCurrentTab}
          onClickMonth={setFuture}
          activeTour={() => setTour(!tour)}
          future={future}
          currentTab={currentTab}
        />
        {currentTab === 'panel' && (
          <ControlPanel future={future} pastValue={pastValue} />
        )}
        {currentTab === 'income' && <Income future={future} />}
        {currentTab === 'outcome' && <Outcome future={future} />}
        {currentTab === 'profile' && <Profile dispatch={dispatch} />}
        <NavigationBar
          onClick={(value) => setCurrentTab(value)}
          currentTab={currentTab}
        />
      </Content>
    </Container>
  );
}
