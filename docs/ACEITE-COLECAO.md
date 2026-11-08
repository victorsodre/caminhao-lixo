# Aceite da coleção — 07/11/2026

**Dez aplicações concluídas e validadas localmente; 76 testes automatizados aprovados.** A entrega inclui desenvolvimento, guias, repositórios privados e rascunhos do X. Deploy público e postagem social não foram executados.

## Escopos conferidos

Cada linha foi confrontada com `docs/ESCOPO.md` e `docs/VALIDACAO.md` do projeto. Commits abaixo identificam as implementações funcionais; commits posteriores sincronizam documentação e posts.

| Projeto / evidência | Entrega e invariantes | Testes | Commit de implementação |
|---|---|---:|---|
| [caminhao-lixo](https://github.com/victorsodre/caminhao-lixo/blob/main/docs/VALIDACAO.md) | Compactação, corte e desmontagem; ciclo retorna à pose original e atuadores acompanham pivôs. | 10 | [`5f71981`](https://github.com/victorsodre/caminhao-lixo/commit/5f719813f8200e50f7d52f41ac4f20a19e578c74) |
| [oleoduto](https://github.com/victorsodre/oleoduto/blob/main/docs/VALIDACAO.md) | Lotes/interface e troca de destino; conservação de volumes e histórico sem transferência retroativa. | 9 | [`7e47524`](https://github.com/victorsodre/oleoduto/commit/7e4752478cf8e14eea585c5b13387a909250ad76) |
| [voyager](https://github.com/victorsodre/voyager/blob/main/docs/VALIDACAO.md) | Voyager 1, sete conjuntos NASA e viagem datada; sem telemetria falsa ou mistura das duas sondas. | 5 | [`b45e392`](https://github.com/victorsodre/voyager/commit/b45e392781189b52c6b17e8da527130bf0789715) |
| [tatuzao](https://github.com/victorsodre/tatuzao/blob/main/docs/VALIDACAO.md) | EPB: avanço/retirada e montagem de anel; terreno/revestimento acompanham o ciclo. | 8 | [`7d0454d`](https://github.com/victorsodre/tatuzao/commit/7d0454d324b82c1cf1a681b97726deece8b781af) |
| [motor-por-dentro](https://github.com/victorsodre/motor-por-dentro/blob/main/docs/VALIDACAO.md) | Quatro tempos/720°, cinemática sincronizada, corte e desmontagem reversíveis. | 8 | [`ae11ca2`](https://github.com/victorsodre/motor-por-dentro/commit/ae11ca2e7e5705be3abc06f60e82326e5f06ecfe) |
| [amazonas-em-camadas](https://github.com/victorsodre/amazonas-em-camadas/blob/main/docs/VALIDACAO.md) | Corte ilustrativo, remoção visual de água, camadas e poros; fontes/limites e Hamza sem caverna. | 7 | [`d05535d`](https://github.com/victorsodre/amazonas-em-camadas/commit/d05535dec47e02dd79885f5707a0d264dcbfebbc) |
| [radar-placas](https://github.com/victorsodre/radar-placas/blob/main/docs/VALIDACAO.md) | Captura virtual e recorte de pixels; leitura pré-definida identificada, sem OCR real ou dados pessoais. | 7 | [`bb0d69e`](https://github.com/victorsodre/radar-placas/commit/bb0d69eed46cf1b55bb508dc7779deb87252b4e9) |
| [motor-navio](https://github.com/victorsodre/motor-navio/blob/main/docs/VALIDACAO.md) | RT-flex96C, dois tempos/cruzeta, eixo e hélice 1:1, corte e referência de escala documentada. | 7 | [`625444f`](https://github.com/victorsodre/motor-navio/commit/625444f2fd7107019a2359ec398a142bc3b46967) |
| [itaipu-por-dentro](https://github.com/victorsodre/itaipu-por-dentro/blob/main/docs/VALIDACAO.md) | Geração/vertedouro independentes; água passa pela turbina e não pelo gerador; sem potência fictícia. | 7 | [`0ca9be3`](https://github.com/victorsodre/itaipu-por-dentro/commit/0ca9be391b9098ae6a051a77af1afe2b14ee024a) |
| [ponte-sob-carga](https://github.com/victorsodre/ponte-sob-carga/blob/main/docs/VALIDACAO.md) | Viga equivalente, apoios coerentes, carga móvel, equilíbrio e comparação com fator visual explícito. | 8 | [`b3e16a3`](https://github.com/victorsodre/ponte-sob-carga/commit/b3e16a33bf63a970328ea29bee4365f0d47d007c) |

## Verificação transversal

- Dez pastas independentes em `/Users/victor/ovictor/`, aplicação, lockfile, scripts de instalação/teste/TypeScript/build e guias exigidos presentes.
- Identidade oficial documentada e aplicada; catálogo, seleção por lista/clique, isolamento/reset, fontes e PNGs conferidos em cada experiência. Corte/desmontagem/áudio usados conforme o mecanismo, sem obrigar recursos sem função.
- Builds estáticos testados em subpasta com recarga direta. Fontes/licenças locais; Voyager conserva crédito e termos do modelo NASA. Geometria dos outros nove projetos autoral.
- Fluxos reais no Chrome, capturas visualmente inspecionadas, teclado, movimento reduzido, pausa, fallback/perda de contexto e layouts móveis emulados documentados por projeto.
- Fontes técnicas e limites acessíveis. As demos não apresentam cálculos/leituras ilustrativos como medições ou operação real.
- Índice `docs/COLECAO.md` sincronizado nos dez repositórios. Links Markdown locais conferidos sem destino ausente. Nenhum `node_modules`, log/captura de navegador, `.env` ou estado de sessão incluído nos commits desta entrega.
- Trinta posts individuais e um da coleção, todos com até 280 caracteres por bloco, compilados sem divergência em [POSTAGENS-X-COLECAO.md](../POSTAGENS-X-COLECAO.md). Lançamentos condicionados a URL pública futura; nenhum envio realizado.

Testes/QA correspondem aos commits funcionais e seus registros. A revisão final alterou documentação e removeu uma linha em branco do CSS da ponte, sem mudança de comportamento; verificou diffs, links e correspondência dos textos. Não se apresenta essa revisão documental como uma segunda execução integral dos testes.

## Limites materiais

Validação móvel por emulação no Chrome do Mac, sem telefone físico, Safari/iOS, bateria ou benchmark de rede móvel. A ocultação usa eventos controlados nos testes, sem comprovar transições nativas em todo navegador. Não há homologação de engenharia, geologia ou medição de desempenho social.

Os modelos declaram suas simplificações. Nenhuma mudança no site principal, Fusquinha, credenciais/visibilidade, infraestrutura de vídeo ou GPU de produção integra esta entrega. Fontes com fatos datados, especialmente Voyager, devem ser reconsultadas antes de divulgação futura.

O próximo passo de publicação exige escolher hospedagem/URL e autorização específica. A execução solicitada termina com os aplicativos e guias prontos nos repositórios privados; os posts ficam para Victor.
