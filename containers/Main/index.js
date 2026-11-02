import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Tour } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useSupabaseClient, useUser } from '../../services/supabaseClient';
import { useRealtimeSync } from '../../services/useRealtimeSync';
import MainInfo from '../../componets/MainInfo';
import MonthNavigator from '../../componets/MonthNavigator';
import NavigationBar from '../../componets/NavigationBar';
import FinancialAnalysisModal from '../../componets/FinancialAnalysis';
import ControlPanel from '../ControlPanel';
import Income from '../Income';
import Outcome from '../Outcome';
import Profile from '../Profile';
import { syncData } from './redux';
import {
  getBackgroundSyncing,
  getSelectedMonth,
  getSyncing,
  setSelectedMonth,
} from './redux/reducer';

const AppShell = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;

  @media (min-width: 768px) {
    padding: 0;
  }
`;

const StickyNavHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(238, 242, 249, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 6px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
`;

export default function Main() {
  const dispatch = useDispatch();
  const supabase = useSupabaseClient();
  const user = useUser();

  const selectedMonth = useSelector(getSelectedMonth);
  const syncing = useSelector(getSyncing);
  const backgroundSyncing = useSelector(getBackgroundSyncing);

  const [currentTab, setCurrentTab] = useState('panel');
  const [tourOpen, setTourOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const mainInfoRef = useRef(null);
  const monthNavRef = useRef(null);
  const tabsNavRef = useRef(null);

  // Automatic initial load + Realtime multi-device sync + foreground resume sync
  useRealtimeSync({ dispatch, supabase, user });

  const tourSteps = [
    {
      title: 'Resumo Mensal Inteligente',
      description:
        'Acompanhe em tempo real quanto você tem, quanto vai receber, quanto deve e quanto sobrará no final do mês selecionado.',
      target: () => mainInfoRef.current,
    },
    {
      title: 'Navegue por Todos os Meses',
      description:
        'Use as setas ou clique no mês para navegar por qualquer mês passado ou futuro e ver como suas compras parceladas impactam os próximos meses!',
      target: () => monthNavRef.current,
    },
    {
      title: 'Ganhos, Painel e Dívidas',
      description:
        'Em Ganhos você gerencia recebimentos e exporta extratos de devedores; em Dívidas você detalha faturas de cartão de crédito (inclusive anexando PDF/foto com IA!).',
      target: () => tabsNavRef.current,
    },
  ];

  return (
    <AppShell className='app'>
      <div ref={mainInfoRef}>
        <MainInfo
          onOpenAnalysis={() => setAnalysisOpen(true)}
          onGoToPanel={() => setCurrentTab('panel')}
        />
      </div>

      <StickyNavHeader>
        <div ref={monthNavRef}>
          <MonthNavigator
            selectedMonth={selectedMonth}
            onSelectMonth={(ym) => dispatch(setSelectedMonth(ym))}
            onClickProfile={(tab) => setCurrentTab(tab)}
            onStartTour={() => setTourOpen(true)}
            onManualSync={() => syncData(dispatch, supabase, user, { silent: true })}
            currentTab={currentTab}
            syncing={syncing || backgroundSyncing}
          />
        </div>

        <div ref={tabsNavRef}>
          <NavigationBar
            onClick={(value) => setCurrentTab(value)}
            currentTab={currentTab}
          />
        </div>
      </StickyNavHeader>

      {currentTab === 'panel' && <ControlPanel />}
      {currentTab === 'income' && <Income />}
      {currentTab === 'outcome' && <Outcome />}
      {currentTab === 'profile' && <Profile dispatch={dispatch} />}

      <FinancialAnalysisModal
        open={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />

      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={tourSteps}
      />
    </AppShell>
  );
}
