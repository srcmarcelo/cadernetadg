import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import mainReducer from '../containers/Main/redux/reducer';
import incomeReducer from '../containers/Income/redux/reducer';
import outcomeReducer from '../containers/Outcome/redux/reducer';

let mockTables = {};

function resetMockTables() {
  mockTables = {
    fixed_debts: [
      {
        id: 'debt-1',
        name: 'Energia Elétrica',
        value: 240,
        payed: false,
        disabled: false,
        monthly_status: {},
      },
    ],
    credit_cards: [
      {
        id: 'card-1',
        name: 'Nubank',
        due_day: 9,
        closing_day: 2,
        value: 111.06,
        future_value: 111.06,
        payed: false,
        monthly_status: {},
        monthly_invoices: {},
      },
    ],
    credit_card_purchases: [
      {
        id: 'pur-1',
        card_id: 'card-1',
        name: 'Jim.Com* Evodia Camil',
        value: 111.06,
        total_value: 1110.6,
        installments: 10,
        start_month: '2026-06',
        purchase_date: '01/10',
        category: 'Compras',
        is_recurring: false,
      },
    ],
  };
}

function createTableBuilder(tableName) {
  let pendingPatch = null;
  let pendingInsert = null;
  let filterId = null;

  const getRows = () => mockTables[tableName] || [];

  const execute = () => {
    const rows = getRows();
    if (pendingInsert) {
      const items = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
      mockTables[tableName] = [...rows, ...items];
      return { data: items, error: null };
    }
    if (pendingPatch) {
      let updatedRow = null;
      mockTables[tableName] = rows.map((r) => {
        if (!filterId || r.id === filterId) {
          updatedRow = { ...r, ...pendingPatch };
          return updatedRow;
        }
        return r;
      });
      return { data: updatedRow ? [updatedRow] : [], error: null };
    }
    const filtered = filterId ? rows.filter((r) => r.id === filterId) : rows;
    return { data: filtered, error: null };
  };

  const chain = {
    select: vi.fn(() => chain),
    insert: vi.fn((payload) => {
      pendingInsert = payload;
      return chain;
    }),
    update: vi.fn((patch) => {
      pendingPatch = patch;
      return chain;
    }),
    delete: vi.fn(() => chain),
    order: vi.fn(() => chain),
    eq: vi.fn((col, val) => {
      if (col === 'id') filterId = val;
      return chain;
    }),
    single: vi.fn(async () => {
      const res = execute();
      return { data: res.data[0] || null, error: null };
    }),
    maybeSingle: vi.fn(async () => {
      const res = execute();
      return { data: res.data[0] || null, error: null };
    }),
    then: (resolve) => Promise.resolve(execute()).then(resolve),
  };

  return chain;
}

const mockSupabase = {
  auth: {
    getSession: vi.fn(async () => ({
      data: { session: { access_token: 'mock-jwt-token', user: { id: 'user-123' } } },
    })),
  },
  from: vi.fn((table) => createTableBuilder(table)),
};

vi.mock('../services/supabaseClient', () => ({
  useSupabaseClient: () => mockSupabase,
  useUser: () => ({ id: 'user-123', email: 'teste@cadernetadg.com.br' }),
  useSession: () => ({ access_token: 'mock-jwt-token', user: { id: 'user-123' } }),
  useSessionContext: () => ({
    supabaseClient: mockSupabase,
    session: { access_token: 'mock-jwt-token', user: { id: 'user-123' } },
    isLoading: false,
  }),
  normalizeSupabaseUrl: (u) => u || '',
}));

import CreditCards from '../componets/OutcomeCards/CreditCards';
import FixedDebts from '../componets/OutcomeCards/FixedDebts';

beforeAll(() => {
  const origGetComputedStyle = window.getComputedStyle.bind(window);
  window.getComputedStyle = (elt) => origGetComputedStyle(elt);

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query.includes('max-width: 480px'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
});

function createTestStore() {
  return configureStore({
    reducer: {
      main: mainReducer,
      income: incomeReducer,
      outcome: outcomeReducer,
    },
    preloadedState: {
      main: {
        currentBalance: 3500,
        keptBalance: 1000,
        userInfo: { name: 'Marcelo' },
        selectedMonth: '2026-11',
        syncing: false,
        backgroundSyncing: false,
        lastSyncedAt: null,
      },
      income: {
        fixedReceipts: [],
        extraReceipts: [],
        debtors: [],
      },
      outcome: {
        fixedDebts: [...mockTables.fixed_debts],
        extraDebts: [],
        creditCards: [...mockTables.credit_cards],
        cardPurchases: [...mockTables.credit_card_purchases],
        hasCardPurchasesTable: true,
      },
    },
  });
}

function renderWithProviders(ui, store = createTestStore()) {
  return {
    store,
    ...render(
      <ConfigProvider locale={ptBR}>
        <Provider store={store}>{ui}</Provider>
      </ConfigProvider>
    ),
  };
}

describe('Mobile UX & Single-Tap Responsiveness', () => {
  beforeEach(() => {
    resetMockTables();
    vi.clearAllMocks();
  });

  it('triggers Pagar/Reabrir in FixedDebts on a single tap without Tooltip interception', async () => {
    const { store, container } = renderWithProviders(<FixedDebts />);

    // Ensure zero Antd Tooltip wrappers exist around buttons
    expect(container.querySelectorAll('.ant-tooltip').length).toBe(0);

    const payBtn = screen.getByRole('button', { name: /Pagar/i });
    fireEvent.click(payBtn);

    await waitFor(() => {
      const updated = store.getState().outcome.fixedDebts[0];
      expect(updated.monthly_status['2026-11']?.paid).toBe(true);
    });
  });

  it('renders mobile CreditCards cleanly, opens invoice modal in 1 tap, and transitions to AI import modal with separate PDF & Photo inputs', async () => {
    const { store } = renderWithProviders(<CreditCards />);

    expect(screen.getByText('Nubank')).toBeTruthy();
    expect(screen.getByText(/1 item/i)).toBeTruthy();
    expect(screen.getByText(/parcelado/i)).toBeTruthy();

    // 1. Single tap on "Ver Fatura" opens CreditCardInvoiceModal immediately
    const verFaturaBtn = screen.getByRole('button', { name: /Ver Fatura/i });
    fireEvent.click(verFaturaBtn);

    await waitFor(() => {
      expect(screen.getByText('Jim.Com* Evodia Camil')).toBeTruthy();
    });

    // 2. Single tap on "Ler Fatura (IA)" inside the modal transitions to AiInvoiceImportModal with separate mobile pickers
    const modalEl = screen.getByRole('dialog');
    const aiBtn = within(modalEl).getByRole('button', { name: /Ler Fatura \(IA\)/i });
    fireEvent.click(aiBtn);

    await waitFor(() => {
      expect(screen.getByText(/Escolher PDF \/ CSV/i)).toBeTruthy();
      expect(screen.getByText(/Enviar Foto \/ Print/i)).toBeTruthy();
    });

    // 3. Simulate uploading an Android PDF file (application/octet-stream, no .pdf extension) and receiving AI extraction
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({
          model: 'gpt-6-luna',
          invoice: {
            card_name: 'Nubank',
            reference_month: '2026-11',
            due_day: 9,
            closing_day: 2,
            invoice_total: 155.9,
            items_sum: 155.9,
            residual_difference: 0,
            items: [
              {
                tempId: 'ai_0',
                selected: true,
                name: 'Mp *Melimais',
                purchase_date: '09 OUT',
                value: 24.9,
                total_value: 24.9,
                current_installment: 1,
                installments: 1,
                start_month: '2026-11',
                category: 'Assinatura',
                is_recurring: true,
              },
              {
                tempId: 'ai_1',
                selected: true,
                name: 'Produtos Globo',
                purchase_date: '19 OUT',
                value: 131.0,
                total_value: 262.0,
                installments: 2,
                current_installment: 2,
                start_month: '2026-10',
                category: 'Assinatura',
                is_recurring: false,
              },
            ],
          },
        }),
    });

    const pdfLabel = screen.getByText(/Escolher PDF \/ CSV/i).closest('label');
    expect(pdfLabel.getAttribute('for')).toBe('ai-invoice-pdf-input');
    const fileInput = document.getElementById('ai-invoice-pdf-input');
    const fakePdf = new File(['%PDF-1.7 Nubank'], 'msf:1000034219', {
      type: 'application/octet-stream',
    });

    fireEvent.change(fileInput, { target: { files: [fakePdf] } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Mp *Melimais')).toBeTruthy();
      expect(screen.getByDisplayValue('Produtos Globo')).toBeTruthy();
    });

    // 4. Single tap on Importar saves all purchases into Redux state for card-1!
    const confirmImportBtn = screen.getByRole('button', { name: /Importar \(2\)/i });
    fireEvent.click(confirmImportBtn);

    await waitFor(() => {
      const allPurchases = store.getState().outcome.cardPurchases;
      expect(allPurchases.some((p) => p.name === 'Mp *Melimais')).toBe(true);
      expect(allPurchases.some((p) => p.name === 'Produtos Globo' && p.start_month === '2026-10')).toBe(true);
    });

    fetchSpy.mockRestore();
  });
});
