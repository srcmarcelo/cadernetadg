export const balanceCardTourSteps = [
  {
    target: '.balanceCard',
    title: 'Saldos',
    content:
      'Neste espaço você poderá registrar o seu saldo atual e o que tem guardado',
    disableBeacon: true,
  },
  {
    target: '.currentBalanceInput',
    title: 'Campo do saldo atual',
    content: 'Você pode alterar o seu saldo atual neste campo',
    disableBeacon: true,
  },
  {
    target: '.currentBalanceInfo',
    title: 'Atualização em tempo real',
    content: 'A alteração aparecerá instantaneamente aqui',
    disableBeacon: true,
  },
  {
    target: '.generalBalance',
    title: 'Quanto restará ou faltará',
    content:
      'O valor se soma com o lucro ou dívida total do mês e aparece aqui',
    disableBeacon: true,
  },
  {
    target: '.keptBalanceInput',
    title: 'Campo do saldo guardado',
    content:
      'Você pode alterar o saldo que tem guardado neste campo. Ele vai ser considerado para a sua situação caso esteja com o saldo negativo no mês.',
    disableBeacon: true,
  },
];

export const futureBalanceCardTourSteps = [
  {
    target: '.balanceCard',
    title: 'Saldos (futuro)',
    content:
      'Neste espaço você poderá ver quanto vai ter de saldo no próximo mês',
    disableBeacon: true,
  },
  {
    target: '.futureCurrentBalance',
    title: 'Saldo futuro',
    content: 'Este é o saldo que restará do mês atual',
    disableBeacon: true,
  },
  {
    target: '.currentBalanceInfo',
    title: 'Saldo futuro',
    content: 'O valor que restará do mês atual ficará aqui também',
    disableBeacon: true,
  },
  {
    target: '.generalBalance',
    title: 'Quanto restará ou faltará',
    content:
      'O valor se soma com o lucro ou dívida total do mês e aparece aqui',
    disableBeacon: true,
  },
  {
    target: '.futureKeptBalance',
    title: 'Saldo guardado (futuro)',
    content:
      'Este é o saldo que terá guardado. Ele já aparecerá alterado caso precise usar ele no mês atual',
    disableBeacon: true,
  },
];
