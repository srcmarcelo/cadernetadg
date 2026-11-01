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
import { Button, Popover, Tooltip } from 'antd';
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
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 10px;
  background: #1E295E;
  border-radius: 14px;
  color: #FFFFFF;
  box-shadow: 0 4px 14px rgba(30, 41, 94, 0.16);
  flex-wrap: wrap;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid
    ${({ $active }) => ($active ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.16)')};
  background: ${({ $active }) =>
    $active ? '#6366F1' : 'rgba(255, 255, 255, 0.08)'};
  color: #FFFFFF;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: ${({ $active }) =>
      $active ? '#4F46E5' : 'rgba(255, 255, 255, 0.18)'};
  }
`;

const MonthSelectorGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.1);
  padding: 3px;
  border-radius: 11px;
`;

const ArrowBtn = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #FFFFFF;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`;

const MonthCenterBtn = styled.button`
  border: none;
  background: transparent;
  color: #FFFFFF;
  padding: 2px 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 148px;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.14);
  }
`;

const MonthTitle = styled.span`
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

const MonthBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  color: ${({ $isCurrent }) => ($isCurrent ? '#86EFAC' : '#CBD5E1')};
  line-height: 1.15;
`;

const PickerWrapper = styled.div`
  width: 260px;
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
  padding: 8px 4px;
  border-radius: 8px;
  border: 1px solid ${({ $selected }) => ($selected ? '#1E295E' : '#E2E8F0')};
  background: ${({ $selected, $today }) =>
    $selected ? '#1E295E' : $today ? '#EEF2FF' : '#FFFFFF'};
  color: ${({ $selected }) => ($selected ? '#FFFFFF' : '#0F172A')};
  font-weight: ${({ $selected, $today }) => ($selected || $today ? 700 : 500)};
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #1E295E;
    background: ${({ $selected }) => ($selected ? '#1E295E' : '#F1F5F9')};
  }
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

  const pickerContent = (
    <PickerWrapper>
      <YearHeader>
        <Button size='small' icon={<LeftOutlined />} onClick={() => setPickerYear((y) => y - 1)} />
        <span>{pickerYear}</span>
        <Button size='small' icon={<RightOutlined />} onClick={() => setPickerYear((y) => y + 1)} />
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
          size='small'
          onClick={() => {
            onSelectMonth(baseMonth);
            setPickerOpen(false);
          }}
        >
          Voltar para o mês atual ({formatMonthYear(baseMonth, { short: true })})
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
        >
          <UserOutlined />
          <span>Perfil</span>
        </IconBtn>
        <Tooltip title='Sincronizar dados com a nuvem'>
          <IconBtn
            type='button'
            onClick={onManualSync}
            aria-label='Sincronizar agora'
          >
            <ReloadOutlined spin={syncing} />
          </IconBtn>
        </Tooltip>
        {onStartTour && (
          <Tooltip title='Guia rápido do aplicativo'>
            <IconBtn type='button' onClick={onStartTour} aria-label='Guia rápido'>
              <QuestionCircleOutlined />
            </IconBtn>
          </Tooltip>
        )}
      </LeftGroup>

      <MonthSelectorGroup className='swith-month-button'>
        <Tooltip title='Mês anterior'>
          <ArrowBtn
            type='button'
            onClick={() => onSelectMonth(addMonths(selectedMonth, -1))}
            aria-label='Mês anterior'
          >
            <LeftOutlined style={{ fontSize: '0.8rem' }} />
          </ArrowBtn>
        </Tooltip>

        <Popover
          content={pickerContent}
          trigger='click'
          open={pickerOpen}
          onOpenChange={handleOpenChange}
          placement='bottomRight'
        >
          <MonthCenterBtn type='button'>
            <MonthTitle>
              <CalendarOutlined style={{ fontSize: '0.82rem', opacity: 0.85 }} />
              {formatMonthYear(selectedMonth)}
            </MonthTitle>
            <MonthBadge $isCurrent={isCurrent}>{badgeText}</MonthBadge>
          </MonthCenterBtn>
        </Popover>

        <Tooltip title='Próximo mês'>
          <ArrowBtn
            type='button'
            onClick={() => onSelectMonth(addMonths(selectedMonth, 1))}
            aria-label='Próximo mês'
          >
            <RightOutlined style={{ fontSize: '0.8rem' }} />
          </ArrowBtn>
        </Tooltip>
      </MonthSelectorGroup>
    </Bar>
  );
}
