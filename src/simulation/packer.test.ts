import test from 'node:test';
import assert from 'node:assert/strict';
import { samplePacker, advancePlayback, safeProgress, packerGeometry } from './packer.ts';

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

test('poses mecânicas retornam à origem; resíduos terminam dentro da caixa', () => {
  const first = samplePacker(0), last = samplePacker(1);
  assert.equal(first.open, last.open); assert.equal(first.slide, last.slide);
  assert.equal(first.transfer, 0); assert.equal(last.transfer, 1);
});

test('curso e abertura são contínuos, limitados e determinísticos', () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000, a = samplePacker(p), b = samplePacker(p);
    assert.deepEqual(a, b);
    for (const value of [a.open, a.slide, a.transfer]) assert.ok(value >= 0 && value <= 1 && Number.isFinite(value));
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
