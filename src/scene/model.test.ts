import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { createTruck } from './truck.ts';
import { framing } from './camera.ts';

test('catálogo resolve nove conjuntos reais e nenhum conjunto vazio', () => {
  const model = createTruck();
  assert.equal(model.parts.length, 9); assert.equal(new Set(model.parts.map(p => p.id)).size, 9);
  for (const p of model.parts) assert.ok(p.group.children.length && !new Box3().setFromObject(p.group).isEmpty());
  model.dispose();
});

test('ciclo e corte preservam posições finitas e reset restaura a mesma geometria', () => {
  const model = createTruck();
  const snapshot = () => { const rows: number[][] = []; model.root.traverse(o => rows.push([...o.position, ...o.quaternion, ...o.scale])); return rows; };
  const start = snapshot();
  for (let i = 0; i <= 100; i++) { model.update(i / 100, true); for (const r of snapshot()) assert.ok(r.every(Number.isFinite)); }
  model.update(0, false); assert.deepEqual(snapshot(), start); model.dispose();
});

test('câmera cobre todos os cantos em desktop, celular e horizontal', () => {
  const model = createTruck(), bounds = new Box3().setFromObject(model.root);
  for (const aspect of [1440 / 900, 390 / 400, 844 / 390]) {
    const camera = new PerspectiveCamera(38, aspect, .1, 200);
    const pose = framing(bounds, aspect, new Vector3(1.15, .6, 1.5));
    camera.position.copy(pose.position); camera.lookAt(pose.center); camera.updateMatrixWorld();
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const p = new Vector3(x, y, z).project(camera); assert.ok(Math.abs(p.x) < 1 && Math.abs(p.y) < 1);
    }
  }
  model.dispose();
});
