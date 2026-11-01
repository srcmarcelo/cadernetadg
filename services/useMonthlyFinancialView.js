import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  getCurrentBalance,
  getKeptBalance,
  getSelectedMonth,
} from '../containers/Main/redux/reducer';
import {
  getDebts,
  getExtraReceipts,
  getFixedReceipts,
} from '../containers/Income/redux/reducer';
import {
  getCardPurchases,
  getCreditCards,
  getExtraDebts,
  getFixedDebts,
} from '../containers/Outcome/redux/reducer';
import { computeFinancialViewForMonth } from '../utils/creditCardUtils';
import { getCurrentYearMonth } from '../utils/monthUtils';

export function useMonthlyFinancialView(overrideMonth) {
  const reduxMonth = useSelector(getSelectedMonth);
  const selectedMonth = overrideMonth || reduxMonth;

  const currentBalance = useSelector(getCurrentBalance);
  const keptBalance = useSelector(getKeptBalance);

  const fixedReceipts = useSelector(getFixedReceipts);
  const extraReceipts = useSelector(getExtraReceipts);
  const debts = useSelector(getDebts);

  const fixedDebts = useSelector(getFixedDebts);
  const extraDebts = useSelector(getExtraDebts);
  const creditCards = useSelector(getCreditCards);
  const cardPurchases = useSelector(getCardPurchases);

  const baseMonth = getCurrentYearMonth();

  return useMemo(
    () =>
      computeFinancialViewForMonth({
        selectedMonth,
        baseMonth,
        currentBalance,
        keptBalance,
        fixedReceipts,
        extraReceipts,
        debts,
        fixedDebts,
        extraDebts,
        creditCards,
        cardPurchases,
      }),
    [
      selectedMonth,
      baseMonth,
      currentBalance,
      keptBalance,
      fixedReceipts,
      extraReceipts,
      debts,
      fixedDebts,
      extraDebts,
      creditCards,
      cardPurchases,
    ]
  );
}
