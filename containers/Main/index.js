/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import JoyRideNoSSR from 'react-joyride-next';

import ProfileButton from '../../componets/ProfileButton';
import MainInfo from '../../componets/MainInfo';
import NavigationBar from '../../componets/NavigationBar';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import { syncData } from './redux';
import { Container, Content } from './styles';
import Profile from '../Profile';

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

  const steps = [
    {
      target: '.step-one',
      content: 'Bem vindo ao Caderneta Digital! [teste]',
      disableBeacon: true,
    },
    {
      target: '.step-two',
      content: (
        <p>
          Aqui ficará o resumo do seu{' '}
          <strong style={{ color: '#232C68' }}>saldo atual</strong>, seus{' '}
          <strong style={{ color: '#368f42' }}>recebimentos</strong> e suas{' '}
          <strong style={{ color: '#C83126' }}>dívidas</strong>.
        </p>
      ),
      disableBeacon: true,
    },
    {
      target: '.navigation-bar',
      content: 'Aqui é onde você pode navegar entre as telas principais.',
      disableBeacon: true,
    },
    {
      target: '.panel-screen',
      content:
        'Esta é a tela do painel de controle, onde poderá modificar o saldo atual e saldo guardado, além de ver as análises e alertas.',
      disableBeacon: true,
    },
    {
      target: '.income-button',
      content: (
        <p>
          Clicando aqui você navega para navegar para a tela de{' '}
          <strong style={{ color: '#368f42' }}>ganhos</strong>.
        </p>
      ),
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: '.income-screen',
      content:
        'Nessa tela você pode registrar, por exemplo, seu salário nos seus recebimentos fixos, coisas que pessoas estão te devendo e recebimentos extras.',
      disableBeacon: true,
    },
    {
      target: '.outcome-button',
      content: (
        <p>
          Clicando aqui você navega para a tela de{' '}
          <strong style={{ color: '#C83126' }}>dívidas</strong>.
        </p>
      ),
      disableBeacon: true,
      placement: 'top',
    },
    {
      target: '.outcome-screen',
      content:
        'Nessa tela você pode registrar, por exemplo, suas despesas fixas, as faturas dos seus cartões e despesas eventuais do mês.',
      disableBeacon: true,
    },
    {
      target: '.profile-button',
      content: 'Ao clicar neste botão, você acessas as informações do perfil.',
      disableBeacon: true,
    },
    {
      target: '.profile-screen',
      content:
        'Aqui você pode mudar o seu nome, sair da conta ou apagar os seus dados.',
      disableBeacon: true,
    },
    {
      target: '.swith-month-button',
      content: (
        <p>
          Neste botão você pode trocar entre o <strong>mês atual</strong> e o{' '}
          <strong>próximo mês</strong> para ter uma noção de como estarão as
          coisas no futuro.
        </p>
      ),
      disableBeacon: true,
    },
    {
      target: '.step-one',
      content: 'Ao trocar de mês, tudo irá considerar essa mudança!',
      disableBeacon: true,
      placement: 'center',
    },
  ];

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
    <Container className='step-one' future={future}>
      <JoyRideNoSSR
        steps={steps}
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
        callback={({ index }) => {
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
