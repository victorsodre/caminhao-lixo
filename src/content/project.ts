export const project = {
  number: '01', title: 'CAMINHÃO DE LIXO', subtitle: 'Como cabe tanto lixo dentro do caminhão?',
  intro: 'Abra a carroceria e acompanhe o mecanismo que faz o lixo ocupar menos espaço.',
  video: 'https://www.youtube.com/watch?v=7EmikyV0mzk',
  stages: [
    { name: 'Abrir', description: 'A lâmina abre espaço para o carro descer até a caçamba de alimentação.' },
    { name: 'Descer', description: 'O carro desliza pelos trilhos, com a lâmina aberta, até a parte inferior.' },
    { name: 'Varrer', description: 'A lâmina gira e reúne os resíduos da caçamba em direção ao interior.' },
    { name: 'Compactar', description: 'O carro sobe e esmaga os resíduos contra a carga anterior. Sob pressão, a placa ejetora recua e abre espaço.' },
  ],
  /** Shown when the body fills up. Abrema, Panorama dos Resíduos Sólidos no Brasil 2025. */
  fullNote: 'Caixa cheia. O Brasil gerou mais de 81 milhões de toneladas de resíduos em 2024, cerca de 1 quilo por pessoa por dia (Abrema).',
  compactionNote: 'Cada carga solta vira uma camada até 4 vezes menor. A quantidade de ciclos é ilustrativa.',
  sources: [
    { title: 'McNeilus · Standard Rear Loader', detail: 'Manual 1432584, revisão 0918. Sequência de compactação: seção 3.6 e figura 25, páginas impressas 60–61.', url: 'https://www.amtruck.com/wp-content/uploads/2021/10/Rear-Loader-Manual-.pdf#page=74' },
    { title: 'McNeilus · placa ejetora', detail: 'Mesmo manual, seção 2.6, página impressa 54: quando a pressão de compactação chega ao limite ajustado, a placa ejetora recua para caber mais lixo.', url: 'https://www.amtruck.com/wp-content/uploads/2021/10/Rear-Loader-Manual-.pdf#page=68' },
    { title: 'Brasil do Trecho · Como funciona o caminhão de lixo por dentro', detail: '12/01/2026. A compactação "consegue reduzir o volume do lixo em até quatro vezes"; fonte do EP145 do ovictorlab.', url: 'https://brasildotrecho.com.br/2026/01/como-funciona-caminhao-de-lixo-por-dentro/' },
    { title: 'Abrema · Panorama dos Resíduos Sólidos no Brasil 2025', detail: '15/12/2025. Mais de 81 milhões de toneladas de resíduos gerados em 2024; cerca de 1 quilo por pessoa por dia.', url: 'https://www.abrema.org.br/2025/12/15/brasil-ultrapassa-81-milhoes-de-toneladas-de-residuos-em-2024-aponta-panorama-da-abrema/' },
    { title: 'O destino do lixo · ovictorlab', detail: 'O vídeo que conecta a coleta ao aterro.', url: 'https://www.youtube.com/watch?v=7EmikyV0mzk' },
  ],
  disclosure: 'Modelo educativo autoral. Geometria, velocidade, capacidade e número de ciclos são ilustrativos; não representam medidas de um veículo real. A redução de volume segue a ordem de grandeza citada pela fonte (até 4 vezes).',
};
