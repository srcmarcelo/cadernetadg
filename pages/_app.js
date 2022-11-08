import 'antd/dist/antd.css';
import '../styles/globals.css';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { useState } from 'react';

import { store } from '../store';
import { Provider } from 'react-redux';

function MyApp({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </SessionContextProvider>
  );
}
export default MyApp;
