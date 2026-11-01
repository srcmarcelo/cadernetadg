import '../styles/globals.css';
import React from 'react';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { StyleSheetManager } from 'styled-components';
import { store } from '../store';
import { SupabaseProvider } from '../services/supabaseClient';

const BLOCKED_DOM_PROPS = new Set([
  'future',
  'editing',
  'payed',
  'received',
  'installments',
  'justifyEnd',
  'selected',
  'weight',
  'textAlign',
  'fontSize',
  'sizeAdjust',
  'debt',
]);

function shouldForwardProp(propName, target) {
  if (typeof target === 'string') {
    if (propName.startsWith('$')) return false;
    if (BLOCKED_DOM_PROPS.has(propName)) return false;
  }
  return true;
}

function MyApp({ Component, pageProps }) {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ConfigProvider
        locale={ptBR}
        theme={{
          token: {
            colorPrimary: '#232C68',
            colorSuccess: '#16A34A',
            colorError: '#DC2626',
            colorWarning: '#D97706',
            borderRadius: 10,
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          },
        }}
      >
        <SupabaseProvider>
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        </SupabaseProvider>
      </ConfigProvider>
    </StyleSheetManager>
  );
}

export default MyApp;
