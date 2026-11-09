import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createTruck } from './truck.ts';
import { fit } from './camera.ts';
import { saveSceneImage } from './capture.ts';
import type { SceneHandle, ViewState, Part } from './types.ts';

export function createScene(host: HTMLElement, onSelect: (id: string | null) => void, onReady: (parts: Part[]) => void, onError: (message: string) => void): SceneHandle {
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;
  renderer.domElement.setAttribute('aria-label', 'Modelo 3D do caminhão de lixo. Arraste para girar; use os controles para explorar.');
  host.append(renderer.domElement);
  const scene = new T.Scene(); scene.fog = new T.Fog('#0b0d1a', 24, 65);
  const camera = new T.PerspectiveCamera(38, 1, .1, 150);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .13; controls.minDistance = 1.6; controls.maxDistance = 36;
  controls.maxPolarAngle = Math.PI * .49; controls.screenSpacePanning = false;
  controls.touches.TWO = T.TOUCH.DOLLY_ROTATE;
  // Touch: a vertical swipe scrolls the page; sideways drags orbit and a pinch zooms.
  if (matchMedia('(pointer: coarse)').matches) renderer.domElement.style.touchAction = 'pan-y';
  const model = createTruck(); scene.add(model.root);
  const envScene = new RoomEnvironment(), pmrem = new T.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(envScene, .04); scene.environment = environment.texture; scene.environmentIntensity = .65;
  envScene.dispose(); pmrem.dispose();
  scene.add(new T.HemisphereLight('#c4d6ff', '#404656', 1.3));
  const key = new T.DirectionalLight('#fff0cd', 2.8); key.position.set(-5, 10, 5); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -9; key.shadow.camera.right = 9;
  key.shadow.camera.top = 8; key.shadow.camera.bottom = -8; key.shadow.normalBias = .035;
  scene.add(key);
  const rim = new T.DirectionalLight('#b9ceff', 2.2); rim.position.set(6, 5, -6); scene.add(rim);
  const floor = new T.Mesh(new T.PlaneGeometry(120, 120), new T.ShadowMaterial({ opacity: .3 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -.025; floor.receiveShadow = true; scene.add(floor);
  const grid = new T.GridHelper(26, 26, '#2b3446', '#202839'); grid.position.y = -.018;
  const gridMaterial = grid.material as T.Material; gridMaterial.transparent = true; gridMaterial.opacity = .17; scene.add(grid);
  const highlight = new T.BoxHelper(model.root, '#ffd21f'); highlight.visible = false; scene.add(highlight);
  const defaultDirection = new T.Vector3(1.1, .58, 1.5);
  let state: ViewState = { progress: 0, loads: 0, cutaway: false, explosion: 0, selected: null, isolated: false, wireframe: false };
  let active = false, disposed = false, dirty = true, lastFrame = -Infinity;

  function invalidate() {
    if (disposed || document.hidden) return;
    dirty = true;
    if (!active) { active = true; renderer.setAnimationLoop(frame); }
  }
  function frame(time: number) {
    if (time - lastFrame < 1000 / 30) return;
    lastFrame = time; dirty = false;
    const moved = controls.update(); renderer.render(scene, camera);
    renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls);
    renderer.domElement.dataset.triangles = String(renderer.info.render.triangles);
    renderer.domElement.dataset.renderCount = String(Number(renderer.domElement.dataset.renderCount ?? 0) + 1);
    if (!moved && !dirty) { renderer.setAnimationLoop(null); active = false; }
  }
  /** Keeps the user's orbit: the current view direction, refitted to the model. */
  const currentDirection = () => {
    const direction = camera.position.clone().sub(controls.target);
    return direction.lengthSq() > 1e-8 ? direction : defaultDirection.clone();
  };
  function home(direction = defaultDirection) {
    const selected = model.parts.find(p => p.id === state.selected);
    const bounds = new T.Box3().setFromObject(state.isolated && selected ? selected.group : model.root);
    controls.target.copy(fit(camera, bounds, direction)); controls.update(); invalidate();
  }
  function size() {
    const { width, height } = host.getBoundingClientRect(); if (width < 1 || height < 1) return;
    renderer.setSize(width, height); camera.aspect = width / height; home(currentDirection());
  }
  const observer = new ResizeObserver(size); observer.observe(host);
  const change = () => invalidate(); controls.addEventListener('change', change);
  // A tap selects a part only if it was short, still and single-pointer; drags, pinches and taps
  // on empty space never clear the selection.
  const pointers = new Set<number>();
  let tap: { id: number; x: number; y: number; time: number } | null = null;
  const pointerDown = (event: PointerEvent) => {
    pointers.add(event.pointerId);
    tap = pointers.size === 1 && event.button === 0 ? { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp } : null;
  };
  const pointerEnd = (event: PointerEvent) => { pointers.delete(event.pointerId); if (event.type === 'pointercancel') tap = null; };
  const pointerUp = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    const start = tap; tap = null;
    if (!start || start.id !== event.pointerId || event.timeStamp - start.time > 450) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > (event.pointerType === 'mouse' ? 5 : 10)) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new T.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const ray = new T.Raycaster(); ray.setFromCamera(mouse, camera);
    const meshes: T.Object3D[] = []; model.root.traverseVisible(o => { if (o instanceof T.Mesh) meshes.push(o); });
    const hit = ray.intersectObjects(meshes, false)[0]; let current: T.Object3D | undefined = hit?.object;
    while (current && !current.userData.partId) current = current.parent ?? undefined;
    if (current?.userData.partId) onSelect(current.userData.partId);
  };
  renderer.domElement.addEventListener('pointerdown', pointerDown);
  renderer.domElement.addEventListener('pointerup', pointerUp);
  renderer.domElement.addEventListener('pointercancel', pointerEnd);
  // The wheel scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch) zooms the model.
  const wheel = (event: WheelEvent) => { if (!event.ctrlKey && !event.metaKey) event.stopPropagation(); };
  host.addEventListener('wheel', wheel, { capture: true, passive: true });
  function visibility() {
    if (document.hidden) { renderer.setAnimationLoop(null); active = false; }
    else { lastFrame = -Infinity; invalidate(); }
  }
  function lost(event: Event) { event.preventDefault(); renderer.setAnimationLoop(null); active = false; onError('A conexão com a cena 3D foi interrompida. Recarregue para continuar.'); }
  renderer.domElement.addEventListener('webglcontextlost', lost);
  document.addEventListener('visibilitychange', visibility);
  onReady(model.parts); size();

  return {
    update(next) {
      const reframe = next.isolated !== state.isolated || next.explosion !== state.explosion;
      const wireframeChanged = next.wireframe !== state.wireframe;
      state = next; model.update(state.progress, state.cutaway, state.loads);
      for (const p of model.parts) {
        p.group.position.copy(p.offset).multiplyScalar(state.explosion * 1.4);
        p.group.visible = !state.isolated || p.id === state.selected;
      }
      if (wireframeChanged) model.root.traverse(object => {
        if (object instanceof T.Mesh) for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
          if (material instanceof T.MeshStandardMaterial) material.wireframe = state.wireframe;
        }
      });
      const selected = model.parts.find(p => p.id === state.selected);
      highlight.visible = Boolean(selected) && !state.isolated;
      if (selected) highlight.setFromObject(selected.group);
      if (reframe) home(currentDirection()); invalidate();
    },
    home: () => home(),
    focus(id) {
      const p = model.parts.find(p => p.id === id); if (!p) return;
      controls.target.copy(fit(camera, new T.Box3().setFromObject(p.group), currentDirection())); controls.update(); invalidate();
    },
    zoom(factor) { camera.position.sub(controls.target).multiplyScalar(factor).add(controls.target); controls.update(); invalidate(); },
    preset(view) { home(view === 'side' ? new T.Vector3(.01, .15, 1) : view === 'rear' ? new T.Vector3(1, .2, .01) : defaultDirection); },
    capture(portrait, status) {
      const selected = model.parts.find(p => p.id === state.selected);
      saveSceneImage(renderer, scene, camera, state.isolated && selected ? selected.group : model.root, portrait, status);
      invalidate();
    },
    dispose() {
      disposed = true; renderer.setAnimationLoop(null); observer.disconnect(); controls.removeEventListener('change', change); controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', pointerDown); renderer.domElement.removeEventListener('pointerup', pointerUp);
      renderer.domElement.removeEventListener('pointercancel', pointerEnd); host.removeEventListener('wheel', wheel, { capture: true });
      renderer.domElement.removeEventListener('webglcontextlost', lost); document.removeEventListener('visibilitychange', visibility);
      model.dispose(); environment.dispose(); floor.geometry.dispose(); (floor.material as T.Material).dispose();
      grid.geometry.dispose(); gridMaterial.dispose(); highlight.geometry.dispose(); (highlight.material as T.Material).dispose();
      key.shadow.dispose(); renderer.dispose(); renderer.domElement.remove();
    },
  };
}
