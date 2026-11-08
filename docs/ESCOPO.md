# Escopo — Caminhão de lixo por dentro

## Pergunta e resultado esperado

Como cabe tanto lixo dentro do caminhão? O visitante deve conseguir explicar o mecanismo depois de explorar a cena e acionar seus controles.

Um caminhão coletor de carregamento traseiro, estacionado, com corte da carroceria e um ciclo de compactação explicável. O aterro será uma experiência posterior.

## Conjuntos da primeira versão

- Cabine e chassi
- Rodas e eixos
- Caixa coletora
- Conjunto traseiro de alimentação
- Placa e articulações do compactador
- Atuadores hidráulicos ilustrativos

Esses grupos são uma proposta semântica; validar sua correspondência com a geometria e as fontes antes de nomear peças como reais.

## Ações principais

| Controle | Comportamento implementado |
|---|---|
| Compactar | Executa um ciclo delimitado, com pausa e retorno ao repouso. |
| Abrir por dentro | Expõe o conjunto traseiro e a caixa sem retirar suas referências espaciais. |
| Desmontar | Afasta conjuntos, preservando vínculos e posições de origem. |

Base de exploração: órbita, zoom, seleção por lista ou clique, isolamento, reenquadrar e reset. Desmontagem e corte só se aplicam aos conjuntos para os quais forem úteis e tecnicamente coerentes. Som, malha e captura são complementos, posteriores à clareza do mecanismo.

## Estado do mecanismo

`abrir → descer → varrer → compactar → concluído`; pausa conserva a fase, repetir inicia outro ciclo e reset restaura a experiência. A pose mecânica final coincide com a inicial; os resíduos permanecem dentro da caixa até repetir/resetar.

## Critérios específicos de conclusão

- O fim de um ciclo coincide com a pose inicial, sem saltos de peças ou acumulação de transformações.
- O corte permite acompanhar o lixo e o movimento da placa; não simula descarga sem um mecanismo documentado.
- A geometria dos atuadores acompanha os pivôs durante todo o curso; não atribuir pressão ou força sem fonte.

- A pergunta inicial é respondida por uma interação observável, com texto curto e fontes acessíveis.
- Desktop e celular emulado foram validados, com reset/fallback conferidos; teste em telefone físico não integra a evidência disponível.
- Nenhum botão visível é apenas decorativo ou promete função pendente.

## Fora da primeira versão

- Cidade inteira, tráfego, coleta autônoma e física de milhares de resíduos.
- Aterro, chorume e biogás dentro da primeira versão.

Ampliações entram no backlog após o piloto, com evidência de uso e esforço. Não incluir funcionalidades só para repetir todas as opções do Fusquinha.
