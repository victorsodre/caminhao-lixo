# Assets e fontes — Caminhão de lixo por dentro

**Estado atual:** modelo procedural autoral, fontes locais licenciadas e áudio sintetizado. Aplicação educativa validada localmente.

## Conteúdo que originou a proposta

- [Aterro — YouTube](https://www.youtube.com/watch?v=7EmikyV0mzk)
- [Compactador — Instagram](https://www.instagram.com/reel/Debu3fBiufQ/)

O Short sobre o aterro registrou 91.251 visualizações no YouTube. Esse resultado pertence ao destino do lixo, não ao vídeo do compactador; é um sinal de interesse na família de temas.

Leitura em 07/11/2026. A análise consultou as APIs oficiais do Instagram/YouTube e relatórios existentes do canal. Vídeos do próprio canal orientam a pauta; fatos científicos/operacionais precisam retornar a fontes primárias antes de serem usados no modelo.

## Fonte mecânica consultada em 07/11/2026

[McNeilus — Rear Loader Operator Manual, 1432584, revisão 0918](https://www.amtruck.com/wp-content/uploads/2021/10/Rear-Loader-Manual-.pdf#page=74), seção 3.6, figura 25, páginas impressas 60–61 (PDF 74–75). Fonte primária do fabricante hospedada por distribuidor. Sustenta a ordem: abrir lâmina, descer carro, fechar lâmina, subir carro. A figura foi conferida visualmente.

Mesmo manual, seção 2.6, página impressa 54 (PDF 68), consultada em 09/11/2026: com o recurso Smart-Pak, quando a pressão de compactação atinge o valor ajustado, a placa ejetora recua para caber mais lixo; a figura 22 mostra o sentido do recuo durante a carga. Sustenta a placa ejetora e o acúmulo entre ciclos.

## Números do EP145 (conferidos em 09/11/2026)

- Brasil do Trecho, 12/01/2026: a compactação "consegue reduzir o volume do lixo em até quatro vezes". A camada desenhada por ciclo é ~3,8× menor que a carga solta (teste `modelCompaction`); os 28 ciclos até encher são ilustrativos.
- Abrema, Panorama 2025 (15/12/2025): mais de 81 milhões de toneladas de resíduos em 2024; cerca de 1 kg por pessoa por dia. Usado na mensagem de caixa cheia.

Não foram copiados desenhos, PDF, medidas, logotipos McNeilus ou texturas do fabricante. Modelo independente, proporções e duração ilustrativas; não demonstra descarga nem parâmetros de segurança/operação.

## Assets incorporados

| Asset | Origem | Uso e termos |
|---|---|---|
| Geometria e materiais do caminhão | Autoria desta implementação para ovictorlab | Código procedural em `src/scene/truck.ts`; nenhum modelo externo redistribuído |
| Marca | SVG oficial do site ovictorlab.com | `public/icon.svg` e `src/kit/Brand.tsx`, identidade do próprio projeto |
| Áudio | Síntese Web Audio local | Sem gravação externa; som ilustrativo |
| Anton, Archivo, Archivo Black, JetBrains Mono | Pacotes Fontsource 5.3.0 | SIL OFL 1.1; textos em `public/licenses/` |
| React, Three, Vite, Lucide e demais bibliotecas | Dependências fixadas em package-lock.json | Avisos/termos agregados em `public/licenses/bibliotecas.txt` |

O modelo de referência Fusquinha orientou possibilidades de interação; código, GLB e áudio não foram copiados.
