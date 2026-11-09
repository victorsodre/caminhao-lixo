import test from 'node:test';
import assert from 'node:assert/strict';
import { samplePacker, advancePlayback, safeProgress, packerGeometry, advanceCycle, bodyFill, ejectorFace, isFull, modelCompaction, safeLoads, BODY, CYCLES_TO_FILL, LAYER } from './packer.ts';

test('o ciclo abre a lâmina, desce o carro, varre e sobe para compactar', () => {
  const opened = samplePacker(0.25);
  const lowered = samplePacker(0.5);
  const swept = samplePacker(0.75);
  const packed = samplePacker(1);
  assert.equal(opened.open, 1); assert.equal(opened.slide, 0);
  assert.equal(lowered.open, 1); assert.equal(lowered.slide, 1);
  assert.equal(swept.open, 0); assert.equal(swept.slide, 1);
  assert.equal(packed.open, 0); assert.equal(packed.slide, 0);
});

test('poses mecânicas retornam à origem; a carga só é varrida e empurrada no fim do ciclo', () => {
  const first = samplePacker(0), last = samplePacker(1);
  assert.equal(first.open, last.open); assert.equal(first.slide, last.slide);
  assert.equal(first.gather, 0); assert.equal(first.pack, 0);
  assert.equal(samplePacker(.5).gather, 0); assert.equal(samplePacker(.75).gather, 1); assert.equal(samplePacker(.75).pack, 0);
  assert.equal(last.gather, 1); assert.equal(last.pack, 1);
});

test('curso e abertura são contínuos, limitados e determinísticos', () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000, a = samplePacker(p), b = samplePacker(p);
    assert.deepEqual(a, b);
    for (const value of [a.open, a.slide, a.gather, a.pack]) assert.ok(value >= 0 && value <= 1 && Number.isFinite(value));
    if (i) {
      const prev = samplePacker(p - .001);
      assert.ok(Math.abs(prev.open - a.open) < .01);
      assert.ok(Math.abs(prev.slide - a.slide) < .01);
    }
  }
});

test('entradas inválidas não contaminam as transformações', () => {
  assert.equal(safeProgress(NaN), 0); assert.equal(safeProgress(Infinity), 0);
  assert.equal(safeProgress(-4), 0); assert.equal(safeProgress(3), 1);
});

test('pausa e aba oculta conservam o progresso; fim para sem repetir', () => {
  assert.equal(advancePlayback(.3, 1, false, true), .3);
  assert.equal(advancePlayback(.3, 1, true, false), .3);
  assert.ok(advancePlayback(.3, .1, true, true) > .3);
  assert.equal(advancePlayback(.999, .1, true, true), 1);
  assert.equal(advancePlayback(1, .1, true, true), 1);
});

test('tempo travado não salta o ciclo inteiro na retomada', () => {
  assert.ok(advancePlayback(0, 900, true, true) < .02);
  assert.equal(advancePlayback(.3, -1, true, true), .3);
});

test('a borda da lâmina conserva folga sobre o piso durante toda a varredura', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = packerGeometry(i / 1000);
    const tipX = pose.x + Math.sin(pose.angle) * 1.06;
    const tipY = pose.y - Math.cos(pose.angle) * 1.06;
    assert.ok(tipY > 1.24, `A lâmina atravessou o piso em ${i / 1000}`);
    assert.ok(tipX < 4.3, `A lâmina ultrapassou a traseira em ${i / 1000}`);
  }
});

test('cada ciclo concluído deixa uma camada na caixa e não devolve o lixo à caçamba', () => {
  let state = { progress: 0, loads: 0 }, ticks = 0;
  while (state.loads === 0 && ticks < 1000) { state = advanceCycle(state, 1 / 30); ticks++; }
  assert.ok(Math.abs(ticks - 14 * 30) <= 1, `ciclo levou ${ticks} quadros`);
  assert.equal(state.loads, 1); assert.equal(state.progress, 0);
  assert.equal(bodyFill(state.loads, state.progress), 1 / CYCLES_TO_FILL);
  while (state.loads === 1 && ticks < 2000) { state = advanceCycle(state, 1 / 30); ticks++; }
  assert.equal(state.loads, 2);
});

test('a placa ejetora recua de forma contínua até a frente e a caixa enche', () => {
  let last = Infinity;
  for (let loads = 0; loads < CYCLES_TO_FILL; loads++) for (let i = 0; i <= 100; i++) {
    const face = ejectorFace(loads, i / 100);
    assert.ok(face <= last + 1e-12, `a placa avançou para trás em ${loads}/${i}`);
    assert.ok(Math.abs(face - last) < LAYER / 10 || last === Infinity, `salto da placa em ${loads}/${i}`);
    last = face;
  }
  assert.ok(Math.abs(ejectorFace(CYCLES_TO_FILL, 0) - BODY.ejectorHome) < 1e-9);
  assert.ok(Math.abs(ejectorFace(0, 0) - BODY.rear) < 1e-9);
  assert.equal(bodyFill(CYCLES_TO_FILL, .5), 1);
});

test('caixa cheia não ganha camada nova; o tempo-lapso só acelera', () => {
  let state = { progress: 0, loads: CYCLES_TO_FILL - 1 };
  while (!isFull(state.loads)) state = advanceCycle(state, .1, 8);
  assert.equal(state.loads, CYCLES_TO_FILL);
  for (let i = 0; i < 200; i++) state = advanceCycle(state, .1, 8);
  assert.equal(state.loads, CYCLES_TO_FILL); assert.ok(state.progress <= 1);
  assert.equal(safeLoads(99), CYCLES_TO_FILL); assert.equal(safeLoads(NaN), 0); assert.equal(safeLoads(-3), 0);
  assert.ok(advancePlayback(0, .1, true, true, 8) > advancePlayback(0, .1, true, true, 1));
  assert.equal(advancePlayback(.2, .1, true, true, NaN), advancePlayback(.2, .1, true, true, 1));
});

test('a visita guiada para no fim da etapa, sem concluir o ciclo', () => {
  let state = { progress: .75, loads: 3 };
  for (let i = 0; i < 200; i++) state = advanceCycle(state, 1 / 30, 1, .998);
  assert.equal(state.progress, .998); assert.equal(state.loads, 3);
});

test('a camada desenhada é até 4 vezes menor que a carga solta (EP145: "até quatro vezes")', () => {
  const ratio = modelCompaction();
  assert.ok(ratio > 3 && ratio <= 4, `compactação do modelo: ${ratio.toFixed(2)}×`);
});

test('a borda da lâmina nunca invade a carga compactada', () => {
  for (let i = 0; i <= 1000; i++) {
    const pose = packerGeometry(i / 1000);
    assert.ok(pose.x + Math.sin(pose.angle) * 1.06 - .12 > BODY.rear, `lâmina dentro da carga em ${i / 1000}`);
  }
});
