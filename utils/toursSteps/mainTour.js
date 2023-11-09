export const mainTourSteps = [
  {
    target: '.app',
    title: 'Bem vindo ao Caderneta Digital!',
    content:
      'O objetivo da plataforma é te ajudar a saber se você vai conseguir pagar suas dívidas do mês, quanto vai sobrar ou quanto vai faltar!',
    disableBeacon: true,
  },
  {
    target: '.main-info',
    title: 'Informações gerais',
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
    title: 'Barra de navegação',
    content: 'Aqui é onde você pode navegar entre as telas principais.',
    disableBeacon: true,
  },
  {
    target: '.panel-screen',
    title: 'Painel de controle',
    content:
      'Esta é a tela do painel de controle, onde poderá modificar o saldo atual e saldo guardado, além de ver as análises e alertas.',
    disableBeacon: true,
  },
  {
    target: '.income-button',
    title: 'Recebimentos',
    content: (
      <p>
        Clicando aqui você navega para a tela de{' '}
        <strong style={{ color: '#368f42' }}>ganhos</strong>.
      </p>
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.income-screen',
    title: 'Tela de ganhos',
    content:
      'Nessa tela você pode registrar seus recebimentos fixos (ex: salário), coisas que pessoas estão te devendo e recebimentos extras.',
    disableBeacon: true,
  },
  {
    target: '.outcome-button',
    title: 'Despesas',
    content: (
      <p>
        Clicando aqui você navega para a tela de{' '}
        <strong style={{ color: '#C83126' }}>dívidas</strong>.
      </p>
    ),
    disableBeacon: true,
    placement: 'bottom',
  },
  {
    target: '.outcome-screen',
    title: 'Tela de dívidas',
    content:
      'Nessa tela você pode registrar, por exemplo, suas despesas fixas, as faturas dos seus cartões e despesas eventuais do mês.',
    disableBeacon: true,
  },
  {
    target: '.profile-button',
    title: 'Ir para o perfil',
    content: 'Ao clicar neste botão, você acessas as informações do perfil.',
    disableBeacon: true,
  },
  {
    target: '.profile-screen',
    title: 'Tela de perfil',
    content:
      'Aqui você pode mudar o seu nome, sair da conta ou apagar os seus dados.',
    disableBeacon: true,
  },
  {
    target: '.swith-month-button',
    title: 'Ver próximo mês',
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
    target: '.app',
    title: 'Aproveite a plataforma!',
    content:
      'Que tal começar a se organizar? Depois que colocar tudo, acompanhar será prazeroso e libertador!',
    disableBeacon: true,
    placement: 'center',
  },
];
