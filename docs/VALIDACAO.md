# Validação — 07/11/2026

## Ambiente e resultados

macOS, Node 26.7.0, npm 11.19.0, Chrome controlado pelo Playwright CLI em sessão isolada `ovl-dev`. Desktop 1440×980, viewport móvel 390×844 e horizontal. Viewport móvel não equivale a teste em telefone físico.

- `npm test`: 10 aprovados, zero falhas. Ciclo, continuidade, inputs inválidos, pausa/ocultação, limite temporal, folga da lâmina em 1.001 amostras, grupos reais, reset sem deriva e enquadramento em três proporções.
- `npm run check` e `npm run build`: aprovados. Build 485 ms; JS 833,79 KB / 225,27 KB gzip, CSS 16,21 KB / 4,26 KB gzip. Aviso de chunk >500 KB, sem falha.
- `npm audit`: zero vulnerabilidades após atualização para Vite 8.3.6.
- Chrome: reprodução, pausa, fim/repetir, reset, seleção, isolamento, desmontagem, busca com acento, busca vazia, tour de quatro etapas, fontes, áudio opcional, mobile, movimento reduzido. Zero erros JS nos fluxos validados.
- Renderização em repouso para; vista inicial 144 chamadas de desenho e aproximadamente 59.746 triângulos, incluindo passes de sombra.
- Perda de contexto via extensão WebGL exibe fallback; recarregar restaura uma única cena.
- PNGs reais 1920×1080 e 1080×1920, com marca, fundo e títulos. Câmera e canvas preservados após captura.
- Build servido por HTTP em `/caminhao-lixo/`: carregamento, reprodução, recarga e licenças HTTP 200, zero erros JS.

## Evidências locais

`output/playwright/fluxo-navegador.txt`, `limites-navegador.txt`, `producao-subpasta.txt`; capturas desktop-completo, desktop-varredura, desktop-isolamento, desktop-desmontado, mobile-detalhe-abaixo, mobile-fallback, exportacao-horizontal e exportacao-vertical. Artefatos ignorados pelo Git.

## Limites materiais

A ocultação nativa não foi confirmada neste Chrome de automação: trocar a aba e minimizar a janela manteve `document.hidden=false`. A regra de não avançar oculta passa no unitário; a integração por evento controlado também passou: animação e renderização param e retomam. Evidência: `output/playwright/visibilidade-controlada.txt`. Sem claim de bateria, FPS medido em telefone físico ou compatibilidade universal. Sem testes em Safari/Firefox físico.

O modelo é explicativo: não fornece medidas reais, pressão, força ou instruções de operação. A pose mecânica final volta ao começo; a carga segue dentro da caixa até repetir/resetar.

Sem deploy público, analytics ou postagem social. A etapa de desenvolvimento está concluída localmente dentro desses limites.

## Revisão para publicação — 08/11/2026

Testes automatizados do projeto, TypeScript/build e `check:pages` aprovados. O último verifica assets relativos em subpasta, canonical, prévia social, 404, sitemap e fallback sem JavaScript. O conjunto mantém 76 testes dos mecanismos.

Chrome real em janela dedicada: build servido sob a subpasta do projeto, canvas e catálogo carregados, seleção, ação principal quando presente no dock, diálogo da coleção com dez destinos corretos, indicação da página atual, fechamento por Escape, foco devolvido e seleção preservada. Viewports 1440×1000 e 390×844, sem transbordamento horizontal, erros de JavaScript ou respostas HTTP de erro durante o fluxo. Capturas reais em `output/publish-local-*.png` (ignoradas pelo Git).

A publicação usa o procedimento em [PUBLICACAO.md](PUBLICACAO.md). Verificação local não substitui conferir a URL após o deploy. Celular físico e Safari permanecem fora da amostra; o modelo mantém os limites educativos descritos acima.
