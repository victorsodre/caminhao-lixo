# Arquitetura implementada

Aplicação estática React 19.2.6 + TypeScript 5.9.3 + Three.js 0.187.0 + Vite 8.3.6. Dependências e lockfile fixados; sem servidor de aplicação, LLM ou GPU dedicada. `vite.config.ts` usa base relativa.

- `src/App.tsx`: estado da experiência, controles HTML, navegação por teclado e visita guiada.
- `src/content/project.ts`: explicações e fontes.
- `src/simulation/packer.ts`: quatro movimentos determinísticos, limites e avanço temporal.
- `src/scene/truck.ts`: modelo autoral, nove grupos semânticos, pivôs, volumes de resíduos e atuadores.
- `src/scene/runtime.ts`: ciclo de vida WebGL, seleção, corte, isolamento, desmontagem, câmera, suspensão e descarte.
- `src/scene/camera.ts`: enquadramento por limites do objeto e proporção da tela.
- `src/scene/capture.ts`: composição PNG com logo oficial e formatos 16:9/9:16.
- `src/scene/audio.ts`: som sintetizado após gesto, desligado por padrão.
- `src/styles.css`: tokens oficiais e layouts desktop/celular.
- `public/licenses/`: termos das bibliotecas e fontes servidos junto ao build.

## Invariantes

Transforms sempre derivam da pose de referência. Peças móveis não participam do agrupamento de malhas estáticas. Corte altera apenas painéis definidos; seleção usa IDs estáveis. A exportação restaura câmera, resolução e DPR em `finally`.

O avanço usa segundos, limita delta a 0,1 e não avança quando pausado/oculto. Um ciclo ilustrativo dura 14 segundos. Geometria e volumes não são dados industriais. A transferência da carga é determinística, sem física de partículas.

## Desempenho

Renderização sob demanda, teto de 30 fps durante interação e DPR até 1,5. Materiais/geometria/observadores/listeners são descartados no unmount. Agrupamento de malhas estáticas reduziu chamadas de desenho de 384 para 144 na vista inicial. Bundle JS da build validada: 833,79 KB / 225,27 KB gzip. O aviso de chunk acima de 500 KB é esperado pelo Three; não foi suprimido.

A mesma base visual pode informar os próximos projetos, mas este repositório instala e compila sozinho. Nenhum código ou asset do Fusquinha foi copiado.
