export const project = {
  number: '01', title: 'CAMINHÃO DE LIXO', subtitle: 'O que acontece depois da coleta?',
  intro: 'Abra a carroceria e acompanhe o mecanismo que faz o lixo ocupar menos espaço.',
  video: 'https://www.youtube.com/watch?v=7EmikyV0mzk',
  stages: [
    { name: 'Abrir', description: 'A lâmina abre espaço para o carro descer até a caçamba de alimentação.' },
    { name: 'Descer', description: 'O carro desliza pelos trilhos, com a lâmina aberta, até a parte inferior.' },
    { name: 'Varrer', description: 'A lâmina gira e reúne os resíduos da caçamba em direção ao interior.' },
    { name: 'Compactar', description: 'O carro sobe com a lâmina fechada, levando os resíduos para a caixa coletora.' },
  ],
  sources: [
    { title: 'McNeilus · Standard Rear Loader', detail: 'Manual 1432584, revisão 0918. Sequência de compactação: seção 3.6 e figura 25, páginas impressas 60–61.', url: 'https://www.amtruck.com/wp-content/uploads/2021/10/Rear-Loader-Manual-.pdf#page=74' },
    { title: 'O destino do lixo · ovictorlab', detail: 'O vídeo que conecta a coleta ao aterro.', url: 'https://www.youtube.com/watch?v=7EmikyV0mzk' },
  ],
  disclosure: 'Modelo educativo autoral. Geometria, velocidade e compressão são ilustrativas; não representam medidas de um veículo real.',
};
