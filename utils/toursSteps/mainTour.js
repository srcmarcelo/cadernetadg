export const mainTourSteps = [
    {
      target: '.app',
      content: 'Bem vindo ao Caderneta Digital!',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.main-info',
      content: (
        <p>
          Aqui ficará o resumo do seu{' '}
          <strong style={{ color: '#232C68' }}>saldo atual</strong>, seus{' '}
          <strong style={{ color: '#368f42' }}>recebimentos</strong> e suas{' '}
          <strong style={{ color: '#C83126' }}>dívidas</strong>.
        </p>
      ),
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.navigation-bar',
      content: 'Aqui é onde você pode navegar entre as telas principais.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.panel-screen',
      content:
        'Esta é a tela do painel de controle, onde poderá modificar o saldo atual e saldo guardado, além de ver as análises e alertas.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.income-button',
      content: (
        <p>
          Clicando aqui você navega para navegar para a tela de{' '}
          <strong style={{ color: '#368f42' }}>ganhos</strong>.
        </p>
      ),
      disableBeacon: true,
      disableScrolling: true,
      placement: 'top',
    },
    {
      target: '.income-screen',
      content:
        'Nessa tela você pode registrar, por exemplo, seu salário nos seus recebimentos fixos, coisas que pessoas estão te devendo e recebimentos extras.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.outcome-button',
      content: (
        <p>
          Clicando aqui você navega para a tela de{' '}
          <strong style={{ color: '#C83126' }}>dívidas</strong>.
        </p>
      ),
      disableBeacon: true,
      disableScrolling: true,
      placement: 'top',
    },
    {
      target: '.outcome-screen',
      content:
        'Nessa tela você pode registrar, por exemplo, suas despesas fixas, as faturas dos seus cartões e despesas eventuais do mês.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.profile-button',
      content: 'Ao clicar neste botão, você acessas as informações do perfil.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.profile-screen',
      content:
        'Aqui você pode mudar o seu nome, sair da conta ou apagar os seus dados.',
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.swith-month-button',
      content: (
        <p>
          Neste botão você pode trocar entre o <strong>mês atual</strong> e o{' '}
          <strong>próximo mês</strong> para ter uma noção de como estarão as
          coisas no futuro.
        </p>
      ),
      disableBeacon: true,
      disableScrolling: true,
    },
    {
      target: '.app',
      content: 'Ao trocar de mês, tudo irá considerar essa mudança!',
      disableBeacon: true,
      disableScrolling: true,
      placement: 'center',
    },
  ];