import React, { useState } from 'react';
import styled from 'styled-components';
import {
  CalendarOutlined,
  LeftOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Popover } from 'antd';
import {
  addMonths,
  formatMonthYear,
  getCurrentYearMonth,
  getRelativeMonthBadge,
  parseYearMonth,
} from '../../utils/monthUtils';

const Bar = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  margin-bottom: 10px;
  background: #1E295E;
  border-radius: 14px;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(30, 41, 94, 0.16);

  @media (min-width: 640px) {
    padding: 8px 14px;
    gap: 10px;
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  min-width: 38px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.18)')};
  background: ${({ $active }) =>
    $active ? '#6366F1' : 'rgba(255, 255, 255, 0.1)'};
  color: #FFFFFF;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: ${({ $active }) =>
        $active ? '#4F46E5' : 'rgba(255, 255, 255, 0.2)'};
    }
  }
`;

const ProfileText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const HelpBtnWrapper = styled.div`
  @media (max-width: 380px) {
    display: none;
  }
`;

const MonthSelectorGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  background: rgba(255, 255, 255, 0.12);
  padding: 3px;
  border-radius: 11px;
  flex: 1;
  max-width: 245px;

  @media (min-width: 520px) {
    flex: initial;
    max-width: none;
    gap: 4px;
  }
`;

const ArrowBtn = styled.button`
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  touch-action: manipulation;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.22);
    }
  }
`;

const MonthCenterBtn = styled.button`
  border: none;
  background: transparent;
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  touch-action: manipulation;

  @media (min-width: 520px) {
    min-width: 150px;
    padding: 2px 10px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background: rgba(255, 255, 255, 0.14);
    }
  }
`;

const MonthTitle = styled.span`
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;

  @media (min-width: 420px) {
    font-size: 0.92rem;
  }
`;

const MonthBadge = styled.span`
  font-size: 0.68rem;
  font-weight: 600;
  color: ${({ $isCurrent }) => ($isCurrent ? '#86EFAC' : '#CBD5E1')};
  line-height: 1.15;
  white-space: nowrap;
`;

const PickerWrapper = styled.div`
  width: 256px;
  padding: 4px;
`;

const YearHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: 700;
  font-size: 1rem;
  color: #1E295E;
`;

const MonthsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-bottom: 10px;
`;

const MonthCell = styled.button`
  padding: 9px 4px;
  border-radius: 8px;
  border: 1px solid ${({ $selected }) => ($selected ? '#1E295E' : '#E2E8F0')};
  background: ${({ $selected, $today }) =>
    $selected ? '#1E295E' : $today ? '#EEF2FF' : '#FFFFFF'};
  color: ${({ $selected }) => ($selected ? '#FFFFFF' : '#0F172A')};
  font-weight: ${({ $selected, $today }) => ($selected || $today ? 700 : 500)};
  font-size: 0.85rem;
  cursor: pointer;
  touch-action: manipulation;
`;

const SHORT_MONTHS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export default function MonthNavigator({
  selectedMonth,
  onSelectMonth,
  onClickProfile,
  onStartTour,
  onManualSync,
  currentTab,
  syncing,
}) {
  const baseMonth = getCurrentYearMonth();
  const parsed = parseYearMonth(selectedMonth);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(parsed.year);

  const isCurrent = selectedMonth === baseMonth;
  const badgeText = getRelativeMonthBadge(selectedMonth, baseMonth);

  const handleOpenChange = (open) => {
    if (open) {
      setPickerYear(parseYearMonth(selectedMonth).year);
    }
    setPickerOpen(open);
  };

  // Compact month string without "de" on narrow mobile if needed
  const formattedMonth = formatMonthYear(selectedMonth).replace(' de ', ' ');

  const pickerContent = (
    <PickerWrapper>
      <YearHeader>
        <Button icon={<LeftOutlined />} onClick={() => setPickerYear((y) => y - 1)} />
        <span>{pickerYear}</span>
        <Button icon={<RightOutlined />} onClick={() => setPickerYear((y) => y + 1)} />
      </YearHeader>
      <MonthsGrid>
        {SHORT_MONTHS.map((label, idx) => {
          const ym = `${pickerYear}-${String(idx + 1).padStart(2, '0')}`;
          return (
            <MonthCell
              key={ym}
              type='button'
              $selected={ym === selectedMonth}
              $today={ym === baseMonth}
              onClick={() => {
                onSelectMonth(ym);
                setPickerOpen(false);
              }}
            >
              {label}
            </MonthCell>
          );
        })}
      </MonthsGrid>
      {!isCurrent && (
        <Button
          type='primary'
          block
          onClick={() => {
            onSelectMonth(baseMonth);
            setPickerOpen(false);
          }}
        >
          Ir para mês atual ({formatMonthYear(baseMonth, { short: true })})
        </Button>
      )}
    </PickerWrapper>
  );

  return (
    <Bar className='month-navigator'>
      <LeftGroup>
        <IconBtn
          type='button'
          $active={currentTab === 'profile'}
          onClick={() => onClickProfile(currentTab === 'profile' ? 'panel' : 'profile')}
          className='profile-button'
          aria-label='Perfil'
        >
          <UserOutlined />
          <ProfileText>Perfil</ProfileText>
        </IconBtn>

        <IconBtn
          type='button'
          onClick={onManualSync}
          aria-label='Sincronizar agora'
        >
          <ReloadOutlined spin={syncing} />
        </IconBtn>

        {onStartTour && (
          <HelpBtnWrapper>
            <IconBtn type='button' onClick={onStartTour} aria-label='Guia rápido'>
              <QuestionCircleOutlined />
            </IconBtn>
          </HelpBtnWrapper>
        )}
      </LeftGroup>

      <MonthSelectorGroup className='swith-month-button'>
        <ArrowBtn
          type='button'
          onClick={() => onSelectMonth(addMonths(selectedMonth, -1))}
          aria-label='Mês anterior'
        >
          <LeftOutlined style={{ fontSize: '0.8rem' }} />
        </ArrowBtn>

        <Popover
          content={pickerContent}
          trigger='click'
          open={pickerOpen}
          onOpenChange={handleOpenChange}
          placement='bottomRight'
        >
          <MonthCenterBtn type='button'>
            <MonthTitle>
              <CalendarOutlined style={{ fontSize: '0.8rem', opacity: 0.85 }} />
              {formattedMonth}
            </MonthTitle>
            <MonthBadge $isCurrent={isCurrent}>{badgeText}</MonthBadge>
          </MonthCenterBtn>
        </Popover>

        <ArrowBtn
          type='button'
          onClick={() => onSelectMonth(addMonths(selectedMonth, 1))}
          aria-label='Próximo mês'
        >
          <RightOutlined style={{ fontSize: '0.8rem' }} />
        </ArrowBtn>
      </MonthSelectorGroup>
    </Bar>
  );
}
