import * as T from 'three';
import { box, mesh, rod, connect, materials, disposeTree, mergeStatic } from './geometry.ts';
import { samplePacker, packerGeometry, ejectorFace, safeLoads, isFull, BODY, LAYER, CYCLES_TO_FILL } from '../simulation/packer.ts';
import type { Assembly, Part } from './types.ts';

export function createTruck(): Assembly {
  const root = new T.Group(); root.name = 'collection-truck';
  const m = materials(), parts: Part[] = [];
  const part = (id: string, label: string, detail: string, note: string, offset: [number, number, number]) => {
    const group = new T.Group(); group.name = id; group.userData.partId = id; root.add(group);
    parts.push({ id, label, detail, note, group, offset: new T.Vector3(...offset) }); return group;
  };
  const cabin = part('cabin', 'Cabine', 'O posto do motorista e a ligação do veículo com o trajeto da coleta.', 'Cabine desenhada para esta experiência; não representa uma marca.', [-2.1, .2, 0]);
  const chassis = part('chassis', 'Chassi', 'A estrutura longitudinal sustenta a cabine, os eixos e a carroceria.', 'Longarinas, travessas e apoios formam a base do conjunto.', [0, -.65, 0]);
  const wheels = part('wheels', 'Rodas e eixos', 'Distribuem o peso do veículo e da carga sobre o solo.', 'Três eixos ilustrativos. A distribuição real depende da configuração do veículo.', [0, 0, 1.8]);
  const body = part('body', 'Caixa coletora', 'Recebe os resíduos que o compactador leva para dentro.', 'No modo Por dentro, uma lateral e a cobertura são retiradas para revelar o caminho.', [0, 1.7, -.8]);
  const ejector = part('ejector', 'Placa ejetora', 'Parede móvel dentro da caixa. A cada compactação, a carga é esmagada contra ela, e a placa recua para a frente quando a pressão chega ao limite.', 'Recuo sob pressão descrito no manual McNeilus, seção 2.6. No aterro, ela empurra a carga para fora; a descarga não é animada aqui.', [0, 1.7, -.8]);
  const hopper = part('hopper', 'Caçamba de alimentação', 'É a região traseira em que os resíduos entram antes da compactação.', 'A lâmina varre esta área e conduz o material para a caixa coletora.', [1.7, -.1, 0]);
  const slide = part('slide', 'Carro deslizante', 'Desce e sobe sobre guias. Ele carrega a articulação da lâmina.', 'Na última etapa, sobe com a lâmina fechada e empurra a carga para dentro.', [1.4, 1.8, 0]);
  const sweep = part('sweep', 'Lâmina de varredura', 'Gira para recolher os resíduos na parte inferior da caçamba.', 'Seu movimento é diferente do deslocamento do carro: girar e deslizar se complementam.', [2.1, .4, 1.2]);
  const hydraulics = part('hydraulics', 'Atuadores hidráulicos', 'Transformam a energia do fluido em movimento linear para acionar os conjuntos.', 'Os pontos de articulação acompanham o mecanismo. Pressão e força não são simuladas.', [1.2, .4, -1.7]);
  const load = part('load', 'Resíduos', 'Acompanhe o lixo da caçamba até a carga já compactada dentro da caixa.', `Cada carga solta vira uma camada cerca de 4 vezes menor, na ordem do "até quatro vezes" citado no EP145. Os ${CYCLES_TO_FILL} ciclos até encher são ilustrativos.`, [-.7, .1, 1.9]);

  // Frame, crossmembers, running boards and rear underride bar.
  for (const z of [-.65, .65]) box(chassis, [7.4, .2, .15], [.1, .92, z], m.dark);
  for (let x = -3; x < 3.6; x += 1) box(chassis, [.16, .14, 1.6], [x, .92, 0], m.steel);
  box(chassis, [1.1, .48, .58], [-.9, .73, .98], m.silver, .1);
  box(chassis, [.2, .24, 2.3], [3.85, .63, 0], m.dark, .04);
  box(chassis, [.08, .12, 1.2], [3.97, .66, 0], m.ivory);

  // Cab-over silhouette with divided windscreen, doors, mirrors and steps.
  box(cabin, [1.88, 1.68, 2.3], [-2.95, 1.85, 0], m.yellow, .16);
  box(cabin, [1.82, .23, 2.31], [-2.96, 2.71, 0], m.yellow, .1);
  box(cabin, [1.77, .45, 2.25], [-2.95, 1.08, 0], m.yellow, .08);
  box(cabin, [.05, .76, 2.02], [-3.895, 2.14, 0], m.glass, .02);
  box(cabin, [.07, .8, .05], [-3.925, 2.14, 0], m.dark);
  for (const z of [-1.16, 1.16]) {
    box(cabin, [1.3, .69, .035], [-2.97, 2.17, z], m.glass, .07);
    box(cabin, [1.36, .035, .04], [-2.97, 1.72, z], m.dark);
    box(cabin, [.26, .055, .05], [-2.48, 1.65, z * 1.01], m.dark, .01);
    box(cabin, [.78, .09, .35], [-2.85, .89, z], m.silver, .02);
    const bracket = rod(cabin, .025, m.dark);
    connect(bracket, new T.Vector3(-3.55, 2.2, z), new T.Vector3(-3.65, 2.24, z * 1.26));
    box(cabin, [.15, .35, .18], [-3.65, 2.15, z * 1.27], m.dark, .04);
    box(cabin, [.12, .28, .02], [-3.65, 2.15, z * 1.35], m.silver, .025);
  }
  box(cabin, [.19, .25, 2.4], [-3.95, .98, 0], m.dark, .07);
  box(cabin, [.08, .47, 1.25], [-3.915, 1.42, 0], m.dark, .02);
  for (let y = 1.24; y < 1.62; y += .085) box(cabin, [.1, .018, 1.14], [-3.97, y, 0], m.steel);
  for (const z of [-.88, .88]) {
    box(cabin, [.1, .2, .35], [-4.02, 1.25, z], m.light, .035);
    box(cabin, [.1, .08, .25], [-4.02, 1.48, z], m.orange, .02);
  }
  for (const z of [-.5, .5]) {
    const wiper = box(cabin, [.04, .035, .55], [-3.95, 1.91, z], m.dark); wiper.rotation.x = .14;
  }
  box(cabin, [.8, .12, .32], [-2.9, 2.91, 0], m.orange, .05);

  // Tires, recessed hubs, wheel bolts and axle beams.
  for (const x of [-2.95, 1.05, 2.5]) {
    const axle = mesh(wheels, new T.CylinderGeometry(.12, .12, 2.2, 12), m.dark, x, .61, 0); axle.rotation.x = Math.PI / 2;
    for (const side of [-1, 1]) {
      const z = side * 1.08;
      const tire = mesh(wheels, new T.CylinderGeometry(.59, .59, .42, 40), m.rubber, x, .61, z); tire.rotation.x = Math.PI / 2;
      for (const dz of [-.17, .17]) mesh(wheels, new T.TorusGeometry(.47, .09, 10, 40), m.rubber, x, .61, z + dz);
      const rim = mesh(wheels, new T.CylinderGeometry(.34, .34, .055, 32), m.silver, x, .61, z + side * .23); rim.rotation.x = Math.PI / 2;
      const hub = mesh(wheels, new T.CylinderGeometry(.16, .16, .1, 24), m.dark, x, .61, z + side * .28); hub.rotation.x = Math.PI / 2;
      for (let a = 0; a < 8; a++) {
        const angle = a * Math.PI / 4;
        const bolt = mesh(wheels, new T.CylinderGeometry(.025, .025, .035, 6), m.silver, x + Math.cos(angle) * .24, .61 + Math.sin(angle) * .24, z + side * .27); bolt.rotation.x = Math.PI / 2;
      }
      box(wheels, [1.35, .1, .5], [x, 1.29, z], m.dark, .03);
    }
  }

  // Separate panels allow a real visual cut instead of an opaque fake interior.
  box(body, [4.25, .16, 2.3], [.25, 1.32, 0], m.steel, .04);
  box(body, [.15, 2.23, 2.3], [-1.86, 2.45, 0], m.ivory, .03);
  const shells: T.Object3D[] = [];
  for (const side of [-1, 1]) {
    const panel = new T.Group(); body.add(panel);
    box(panel, [4.3, 2.18, .11], [.25, 2.48, side * 1.15], m.ivory, .05);
    box(panel, [4.35, .2, .12], [.25, 1.57, side * 1.22], m.yellow, .02);
    box(panel, [4.3, .09, .1], [.25, 3.53, side * 1.2], m.silver, .02);
    for (const x of [-1.6, -.85, -.1, .65, 1.4, 2.15]) box(panel, [.06, 1.9, .065], [x, 2.48, side * 1.23], m.silver, .01);
    mergeStatic(panel);
    if (side === 1) shells.push(panel);
  }
  const roof = box(body, [4.3, .2, 2.32], [.25, 3.62, 0], m.ivory, .09); shells.push(roof);
  // Body markings are generated here, with no external texture or manufacturer asset.
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#dce0de'; ctx.fillRect(0, 0, 1024, 256);
      ctx.fillStyle = '#1b2530'; ctx.font = 'bold 100px Arial'; ctx.fillText('ovictorlab', 100, 145);
      ctx.font = '26px Arial'; ctx.fillText('ENGENHARIA POR DENTRO', 105, 208);
      const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace;
      const decal = mesh(body, new T.PlaneGeometry(2.9, .73), new T.MeshStandardMaterial({ map: texture, roughness: .5 }), .25, 2.7, 1.213);
      shells.push(decal);
    }
  }

  // Open hopper with a low rear lip and sloped floor.
  const floor = box(hopper, [2, .15, 2.25], [3.25, 1.15, 0], m.steel); floor.rotation.z = -.13;
  box(hopper, [.14, .27, 2.35], [4.2, 1.09, 0], m.yellow, .03);
  for (const side of [-1, 1]) {
    const wall = new T.Group(); hopper.add(wall);
    const shape = new T.Shape(); shape.moveTo(2.3, 1.3); shape.lineTo(4.25, .98); shape.lineTo(4.25, 1.67); shape.lineTo(3.05, 3.58); shape.lineTo(2.3, 3.58); shape.closePath();
    mesh(wall, new T.ExtrudeGeometry(shape, { depth: .13, bevelEnabled: false }), m.yellow, 0, 0, side > 0 ? 1.12 : -1.25);
    const rail = rod(wall, .055, m.dark); connect(rail, new T.Vector3(3.1, 3.3, side * 1.29), new T.Vector3(4.14, 1.65, side * 1.29));
    box(wall, [.12, .2, .14], [4.2, 1.4, side * 1.25], m.red, .02);
    if (side === 1) shells.push(wall);
  }
  box(hopper, [.4, .15, 2.45], [2.85, 3.58, 0], m.yellow, .04);

  const carriage = new T.Group(); slide.add(carriage);
  box(carriage, [.22, .65, 1.94], [0, 0, 0], m.steel, .03);
  for (const side of [-1, 1]) {
    const track = rod(slide, .045, m.silver); connect(track, new T.Vector3(2.65, 2.95, side * 1.02), new T.Vector3(3.25, 2.35, side * 1.02));
    box(carriage, [.22, .28, .16], [0, .08, side * 1.03], m.dark);
  }
  const blade = new T.Group(); sweep.add(blade);
  box(blade, [.13, 1.05, 1.92], [0, -.48, 0], m.orange, .025);
  box(blade, [.24, .12, 1.96], [-.04, -1, 0], m.steel, .02);
  for (const z of [-.7, 0, .7]) box(blade, [.15, .94, .055], [.09, -.48, z], m.steel);

  const cylinders = [-.91, .91].map(z => ({ z,
    slideBody: rod(hydraulics, .09, m.yellow), slideRod: rod(hydraulics, .042, m.silver),
    sweepBody: rod(hydraulics, .075, m.yellow), sweepRod: rod(hydraulics, .034, m.silver),
  }));
  // Ejector panel: its rear face is the front of the packed load. It retracts as layers accumulate.
  const ejectorPanel = new T.Group(); ejector.add(ejectorPanel);
  const panelHeight = BODY.top - BODY.floor, panelY = (BODY.top + BODY.floor) / 2;
  box(ejectorPanel, [.12, panelHeight, BODY.halfWidth * 2], [-.06, panelY, 0], m.steel, .02);
  for (const y of [panelY - .62, panelY + .62]) box(ejectorPanel, [.07, .1, BODY.halfWidth * 1.9], [-.15, y, 0], m.dark);
  mergeStatic(ejectorPanel);
  const ejectorBase = new T.Vector3(-1.78, panelY + .25, 0);
  const ejectorStages = [.1, .075, .052].map((radius, i) => rod(ejector, radius, i ? m.silver : m.yellow));

  // Packed load: one box whose texture repeats once per layer, so each cycle reads as a band.
  const layered = new T.MeshStandardMaterial({ color: '#8d8a7c', roughness: .96 });
  const packedEnd = new T.MeshStandardMaterial({ color: '#8d8a7c', roughness: .96 });
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const colors = ['#62666c', '#b09a72', '#526659', '#9a9a8c', '#7d6f5a'];
      for (let i = 0; i < 220; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect((i * 37) % 64, (i * 53) % 256, 8 + (i % 5) * 4, 5 + (i % 3) * 3);
      }
      ctx.fillStyle = '#2a2d33'; ctx.fillRect(0, 0, 3, 256);
      const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; texture.wrapS = T.RepeatWrapping;
      layered.map = texture; layered.color.set('#ffffff');
      const end = texture.clone(); end.repeat.set(4, 1); packedEnd.map = end; packedEnd.color.set('#ffffff');
    }
  }
  // Box faces: ±x (ends) show plain refuse; top, bottom and sides show one band per layer.
  const packed = new T.Mesh(new T.BoxGeometry(1, 1, 1), [packedEnd, packedEnd, layered, layered, layered, layered]);
  packed.castShadow = packed.receiveShadow = true; load.add(packed);

  // Loose bags in the hopper, kept clear of the blade path. Each one is squashed into the new layer.
  const waste: { object: T.Mesh; origin: T.Vector3; rotation: T.Quaternion; gather: T.Vector3; target: T.Vector3; squash: T.Vector3 }[] = [];
  const wasteMats = ['#62666c', '#b09a72', '#526659', '#9a9a8c'].map(color => new T.MeshStandardMaterial({ color, roughness: .95 }));
  const radius = .2, rows = 4, columns = 6, cellY = panelHeight / rows, cellZ = BODY.halfWidth * 2 / columns;
  for (let i = 0; i < 24; i++) {
    const col = i % 4, row = Math.floor(i / 4) % 3, layer = Math.floor(i / 12);
    const x = 3 + col / 3, floorY = 1.225 - .131 * (x - 3.25), bottom = floorY + radius;
    const y = layer ? Math.min(bottom + .36, 1.7) : bottom, z = (row - 1) * .6 + (col % 2 ? .05 : -.05);
    const item = mesh(load, new T.IcosahedronGeometry(radius, 1), wasteMats[i % 4], x, y, z);
    item.rotation.set(i * .7, i * 1.9, i * .3);
    const k = i % rows, j = Math.floor(i / rows);
    waste.push({
      object: item, origin: item.position.clone(), rotation: item.quaternion.clone(),
      gather: new T.Vector3(1.98 + col * .14, 1.52 + layer * .42 + row * .12, (row - 1) * .55),
      target: new T.Vector3(BODY.rear - LAYER / 2, BODY.floor + (k + .5) * cellY, -BODY.halfWidth + (j + .5) * cellZ),
      squash: new T.Vector3(LAYER / (radius * 2), cellY / (radius * 2), cellZ / (radius * 2)),
    });
  }
  const identity = new T.Quaternion();

  function update(progress: number, cutaway: boolean, loads = 0) {
    const pose = samplePacker(progress);
    for (const panel of shells) panel.visible = !cutaway;
    const geometry = packerGeometry(progress);
    const pivot = new T.Vector3(geometry.x, geometry.y, 0);
    const angle = geometry.angle;
    carriage.position.copy(pivot); blade.position.copy(pivot); blade.rotation.z = angle;
    for (const c of cylinders) {
      const a = new T.Vector3(2.45, 3.43, c.z), b = pivot.clone().add(new T.Vector3(.12, .14, c.z));
      const join = a.clone().lerp(b, .58); connect(c.slideBody, a, join); connect(c.slideRod, join, b);
      const a2 = pivot.clone().add(new T.Vector3(.35, .3, c.z));
      const end = new T.Vector3(.07, -.66, 0).applyAxisAngle(new T.Vector3(0, 0, 1), angle).add(pivot); end.z = c.z;
      const join2 = a2.clone().lerp(end, .6); connect(c.sweepBody, a2, join2); connect(c.sweepRod, join2, end);
    }
    const done = safeLoads(loads), full = isFull(done), pack = full ? 0 : pose.pack;
    const face = ejectorFace(done, progress);
    ejectorPanel.position.x = face;
    const reach = new T.Vector3(face - .19, ejectorBase.y, 0).sub(ejectorBase);
    ejectorStages.forEach((stage, i) => connect(stage, ejectorBase.clone().addScaledVector(reach, i / 3), ejectorBase.clone().addScaledVector(reach, Math.min(1, (i + 1.15) / 3))));
    const length = LAYER * done, rearFace = BODY.rear - LAYER * pack;
    packed.visible = length > 0;
    packed.scale.set(Math.max(length, 1e-4), panelHeight, BODY.halfWidth * 2);
    packed.position.set(rearFace - length / 2, panelY, 0);
    layered.map?.repeat.set(Math.max(1, done), 1);
    for (const { object, origin, rotation, gather, target, squash } of waste) {
      object.visible = !full;
      object.position.copy(origin).lerp(gather, pose.gather).lerp(target, pack);
      object.quaternion.copy(rotation).slerp(identity, pack);
      const loose = 1 - .15 * pose.gather;
      object.scale.set(loose, loose, loose).lerp(squash, pack);
    }
  }
  for (const group of [cabin, chassis, wheels, carriage, blade]) mergeStatic(group);
  update(0, false, 0);
  return { root, parts, update, dispose: () => disposeTree(root) };
}
