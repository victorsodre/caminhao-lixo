# Decisões e estado

## 2026-11-07 — documentação inicial

- Victor solicitou salvar o plano no VicMind, criar uma pasta para cada projeto, preparar guias de desenvolvimento/identidade, enviar ao GitHub e escrever posts do X para uso posterior.
- Planejamento detalhado criado; prioridade recomendada **1/10**. A prioridade pode mudar após o piloto e a validação de assets.
- Identidade: ovictorlab.com / Laboratório noturno. Interações: referência Fusquinha, adaptadas à pergunta do projeto.
- Repositório inicialmente privado por escolha operacional conservadora nesta fase. O pedido autoriza o envio dos guias; não foi tratado como solicitação de implementar e publicar os aplicativos.
- Nenhuma postagem no X enviada. Textos de protótipo e lançamento têm condições explícitas de uso.

## Pendências iniciais — resolvidas na implementação

- Manual e esquema de um compactador traseiro identificado por fabricante/modelo.
- Sequência real de alimentação, compactação, retorno e travas; escolher uma variante antes de animar.

Próxima ação: Escolher uma variante de compactador e montar um estudo do ciclo com blocos, antes de detalhar o caminhão.

## Como registrar mudanças

Acrescentar data, decisão, motivo, fonte/evidência, arquivos afetados e consequência para o escopo. Separar proposta, implementação, validação e publicação. Preservar decisões antigas com indicação de substituição quando necessário.

## 2026-11-07 — aplicação implementada

Victor definiu a meta de desenvolver os dez projetos até completar os respectivos escopos. Isso substitui a restrição anterior à documentação; publicação web e envio de posts continuam separados.

Caminhão autoral procedural escolhido para permitir pivôs e corte verificáveis, sem redistribuir o asset do Fusquinha. Ciclo de quatro movimentos do McNeilus Standard Rear Loader, seção 3.6/figura 25. Não modelamos a descarga.

Dez testes aprovados, build/check aprovados, zero vulnerabilidades no audit da instalação e fluxos reais no Chrome. Dois formatos PNG com marca, mobile sem sobreposição do detalhe com o modelo, fallback WebGL verificado. Evidências/limites em VALIDACAO.md. Próxima ação local: manter este baseline enquanto a coleção avança; nenhum deploy realizado.

## 2026-11-08 — repositório público e GitHub Pages

Victor autorizou aprimorar e tornar públicos os dez projetos com HTML funcional e identidade oficial. Esta decisão substitui a restrição histórica de publicação acima. Incluídos navegação entre os dez sites, canonical/OG/X, prévia real, sitemap, página 404, verificação de caminhos e workflow com testes/build antes do deploy. URL: https://victorsodre.github.io/caminhao-lixo/. Conteúdo e modelo educativo preservados; nenhum post enviado ao X. Procedimento e reversão em PUBLICACAO.md.

## 2026-11-08 — vídeo do canal incorporado

Pedido de Victor: embed abaixo do experimento e thumbnail clicável no README. Vídeo `7EmikyV0mzk`, autoria ovictorlab confirmada pelo oEmbed público. O vídeo acompanha o destino do lixo no aterro. Aqui, você explora a etapa anterior: a compactação dentro do caminhão. Player `youtube-nocookie.com`, criado só por clique, `autoplay=0`, controles nativos, referrer de origem e link direto sempre disponível. Capa local para não carregar o YouTube na abertura; layout portrait. Cabeçalho leva à seção `#video`. Identidade preservada; nenhum upload ou alteração de vídeo no canal.

## 2026-11-09 — placa ejetora, acúmulo e revisão de celular/SEO

Pedido de Victor ("faça tudo") a partir da revisão dos dez labs.

- Mecanismo: nova peça **Placa ejetora** (McNeilus 1432584, seção 2.6). Cada ciclo concluído deixa uma camada na caixa, esmagada contra a carga anterior, e a placa recua. "Repetir ciclo" deu lugar a "Próximo ciclo"; nada volta à caçamba. Medidor "caixa X% cheia · N ciclos" e "Encher a caixa" (tempo-lapso ×8). Cheia: mensagem com o número da Abrema e botão "Esvaziar a caixa". A descarga continua sem animação.
- Precisão: "até 4×" (Brasil do Trecho, fonte do EP145) aparece como fato; capacidade, 28 ciclos e geometria seguem ilustrativos. Fontes novas no diálogo de créditos.
- Câmera: resize, tela cheia, isolar, desmontar e "Aproximar" mantêm a direção da órbita. Só "Reenquadrar" volta à vista padrão. Toque curto em área vazia ou arrasto não desmarca a peça. A rodinha rola a página; Ctrl/⌘ + rolagem ou pinça aproxima. No celular, o canvas usa `touch-action: pan-y`: deslizar na vertical rola a página.
- Celular: barra da câmera abaixo do canvas, descrição da etapa sempre visível, texto ≥ 11 px e alvos ≥ 44 px no CSS do lab. Pendências do kit (rótulos do vídeo e logo) foram pedidas ao lab-kit.
- SEO: título com "caminhão de lixo compactador", resumo indexável dentro de `#root` (substituído pelo app) e JSON-LD VideoObject do EP309. O teste `seo.test.ts` confere o sincronismo com `project.ts` e `video.ts`.
- Visita guiada anima cada etapa e para no fim dela. A captura leva a URL do lab e o estado da caixa.
