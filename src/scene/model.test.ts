import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { createTruck } from './truck.ts';
import { framing } from './camera.ts';
import { BODY, CYCLES_TO_FILL } from '../simulation/packer.ts';

test('catálogo resolve dez conjuntos reais e nenhum conjunto vazio', () => {
  const model = createTruck();
  assert.equal(model.parts.length, 10); assert.equal(new Set(model.parts.map(p => p.id)).size, 10);
  for (const p of model.parts) assert.ok(p.group.children.length && !new Box3().setFromObject(p.group).isEmpty());
  model.dispose();
});

test('ciclo e corte preservam posições finitas e reset restaura a mesma geometria', () => {
  const model = createTruck();
  const snapshot = () => { const rows: number[][] = []; model.root.traverse(o => rows.push([...o.position, ...o.quaternion, ...o.scale])); return rows; };
  const start = snapshot();
  for (let i = 0; i <= 100; i++) { model.update(i / 100, true); for (const r of snapshot()) assert.ok(r.every(Number.isFinite)); }
  model.update(.9, true, 12); model.update(1, true, CYCLES_TO_FILL);
  model.update(0, false, 0); assert.deepEqual(snapshot(), start); model.dispose();
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

test('resíduos compactados, carga acumulada e placa ejetora ficam dentro da caixa', () => {
  const model = createTruck(), group = (id: string) => model.parts.find(p => p.id === id)!.group;
  const inside = new Box3(new Vector3(BODY.ejectorHome - .32, BODY.floor - .01, -BODY.halfWidth - .01), new Vector3(BODY.rear + .01, BODY.top + .01, BODY.halfWidth + .01));
  for (const loads of [0, 1, 13, CYCLES_TO_FILL - 1, CYCLES_TO_FILL]) {
    model.update(1, true, loads); model.root.updateMatrixWorld(true);
    for (const object of group('load').children) {
      if (!object.visible) continue;
      const box = new Box3().setFromObject(object);
      assert.ok(inside.containsBox(box), `fora da caixa com ${loads} cargas: ${JSON.stringify(box)}`);
    }
    assert.ok(inside.containsBox(new Box3().setFromObject(group('ejector'))), `placa fora da caixa com ${loads} cargas`);
  }
  model.dispose();
});

test('a carga anterior fica na caixa e empurra a placa para a frente', () => {
  const model = createTruck(), ejector = model.parts.find(p => p.id === 'ejector')!.group;
  const front = (loads: number) => { model.update(0, true, loads); model.root.updateMatrixWorld(true); return new Box3().setFromObject(ejector).max.x; };
  assert.ok(front(10) < front(2)); assert.ok(front(CYCLES_TO_FILL) < front(10));
  model.dispose();
});
