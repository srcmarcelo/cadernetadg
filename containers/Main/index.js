/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

import ProfileButton from '../../componets/ProfileButton';
import MainInfo from '../../componets/MainInfo';
import NavigationBar from '../../componets/NavigationBar';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import { syncData } from './redux';
import { Container, Content } from './styles';
import Profile from '../Profile';

import ReactJoyride from 'react-joyride';

export default function Main() {
  const dispatch = useDispatch();

  const supabase = useSupabaseClient();
  const user = useUser();

  const [currentTab, setCurrentTab] = useState('panel');
  const [future, setFuture] = useState(false);
  const [pastValue, setPastValue] = useState(0);

  useEffect(() => {
    syncData(dispatch, supabase, user);
  }, []);

  // const steps = [
  //   {
  //     target: '.my-first-step',
  //     content: 'This is my awesome feature!',
  //   },
  //   {
  //     target: '.my-other-step',
  //     content: 'This another awesome feature!',
  //   },
  // ];

  return (
    <Container future={future}>
      <Content>
        {/* <ReactJoyride steps={steps} run={true} /> */}
        <MainInfo
          dispatch={dispatch}
          future={future}
          setPastValue={setPastValue}
        />
        <ProfileButton
          onClickProfile={setCurrentTab}
          onClickMonth={setFuture}
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
