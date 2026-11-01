import React from 'react';
import styled from 'styled-components';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

const NavWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 6px;
  margin-bottom: 14px;
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #E2E8F0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
`;

const TabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 42px;
  border-radius: 10px;
  border: none;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${({ $selected, $color }) => ($selected ? '#FFFFFF' : $color)};
  background: ${({ $selected, $color }) =>
    $selected ? $color : 'transparent'};
  box-shadow: ${({ $selected, $color }) =>
    $selected ? `0 4px 12px ${$color}40` : 'none'};

  &:hover {
    background: ${({ $selected, $color }) =>
      $selected ? $color : `${$color}14`};
  }
`;

const TABS = [
  { key: 'income', label: 'Ganhos', color: '#16A34A', icon: <ArrowUpOutlined /> },
  { key: 'panel', label: 'Painel', color: '#1E295E', icon: <AppstoreOutlined /> },
  { key: 'outcome', label: 'Dívidas', color: '#DC2626', icon: <ArrowDownOutlined /> },
];

export default function NavigationBar({ onClick, currentTab }) {
  return (
    <NavWrapper className='navigation-bar'>
      {TABS.map((tab) => (
        <TabButton
          key={tab.key}
          type='button'
          $color={tab.color}
          $selected={currentTab === tab.key}
          onClick={() => onClick(tab.key)}
          className={`${tab.key}-button`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </TabButton>
      ))}
    </NavWrapper>
  );
}
