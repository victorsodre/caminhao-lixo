import { video } from './content/video.ts';
import { VideoSection } from './kit/VideoSection.tsx';
import { CollectionNav } from './kit/CollectionNav.tsx';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Box, ChevronRight, Download, Eye, FastForward, Focus, Layers3, Maximize, Minus, Pause, Play, Plus, RotateCcw, Search, Volume2, VolumeX, X } from 'lucide-react';
import { Brand } from './kit/Brand.tsx';
import { labNumber } from './kit/collection.ts';
import { Sources } from './ui/Sources.tsx';
import { project } from './content/project.ts';
import { createScene } from './scene/runtime.ts';
import { createAudio } from './scene/audio.ts';
import { advanceCycle, bodyFill, isFull, samplePacker, type CycleState } from './simulation/packer.ts';
import type { Part, SceneHandle } from './scene/types.ts';

/** Speed of "Encher a caixa": a time-lapse of whole cycles. */
const FILL_SPEED = 8;

const fillStatus = (cycle: CycleState) =>
  `Caixa ${Math.round(bodyFill(cycle.loads, cycle.progress) * 100)}% cheia · ${cycle.loads} ${cycle.loads === 1 ? 'ciclo' : 'ciclos'}`;

/** Below-the-fold content, kept out of the 30 Hz playback re-render. */
const Below = memo(function Below({ onSources }: { onSources: () => void }) {
  return <>
    <VideoSection video={video}/>
    <footer><span>UM EXPERIMENTO DO OVICTORLAB <i>© 2026</i></span><button onClick={onSources}>Modelo educativo · Fontes e créditos <ArrowUpRight size={13}/></button><CollectionNav current="caminhao-lixo"/></footer>
  </>;
});

export function App() {
  const host = useRef<HTMLDivElement>(null), scene = useRef<SceneHandle | null>(null);
  const audio = useRef<ReturnType<typeof createAudio> | null>(null);
  const [parts, setParts] = useState<Part[]>([]), [selected, setSelected] = useState<string | null>(null);
  const [cycle, setCycle] = useState<CycleState>({ progress: 0, loads: 0 }), [playing, setPlaying] = useState(false);
  const [filling, setFilling] = useState(false);
  const [cutaway, setCutaway] = useState(false), [explosion, setExplosion] = useState(0);
  const [isolated, setIsolated] = useState(false), [wireframe, setWireframe] = useState(false);
  const [sound, setSound] = useState(false), [sources, setSources] = useState(false);
  const [search, setSearch] = useState(''), [drawer, setDrawer] = useState(false), [tour, setTour] = useState(false);
  const [error, setError] = useState<string | null>(null), [notice, setNotice] = useState('');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const partsDialog = useRef<HTMLDialogElement>(null);
  const inspector = useRef<HTMLElement>(null);
  /** End of the guided-tour segment being played; 1 means "play to the end of the cycle". */
  const segmentEnd = useRef(1);
  const { progress, loads } = cycle, full = isFull(loads);
  const cycleRef = useRef(cycle); cycleRef.current = cycle;
  const currentPart = parts.find(p => p.id === selected), phase = samplePacker(progress).stage;
  const fill = Math.round(bodyFill(loads, progress) * 100);
  const normalize = (value: string) => value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const filteredParts = parts.filter(p => normalize(p.label).includes(normalize(search)));
  const select = useCallback((id: string | null) => { setSelected(id); setIsolated(false); setTour(false); }, []);
  const openSources = useCallback(() => setSources(true), []);
  useEffect(() => {
    if (!host.current) return;
    try { scene.current = createScene(host.current, select, setParts, setError); }
    catch { setError('Seu navegador não conseguiu abrir a cena 3D. Você ainda pode consultar as fontes e assistir ao vídeo.'); }
    return () => { scene.current?.dispose(); scene.current = null; };
  }, [select]);
  useEffect(() => { scene.current?.update({ progress, loads, cutaway, explosion, selected, isolated, wireframe }); }, [progress, loads, cutaway, explosion, selected, isolated, wireframe]);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => { setReduced(media.matches); if (media.matches) { setPlaying(false); setFilling(false); } };
    media.addEventListener('change', change); return () => media.removeEventListener('change', change);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let id = 0, last = performance.now();
    const speed = filling ? FILL_SPEED : 1, startLoads = cycleRef.current.loads;
    // Without the time-lapse, playback holds after one finished cycle until the effect below pauses it.
    const step = (c: CycleState, delta: number) => !filling && c.loads > startLoads ? c : advanceCycle(c, delta, speed, segmentEnd.current);
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      if (delta >= 1 / 30 - .002) { last = now; if (!document.hidden) setCycle(c => step(c, delta)); }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick); return () => cancelAnimationFrame(id);
  }, [playing, filling]);
  // A tour segment stops at its own end.
  useEffect(() => {
    if (segmentEnd.current < 1 && progress >= segmentEnd.current) { setPlaying(false); segmentEnd.current = 1; }
  }, [progress]);
  // A finished cycle keeps its layer in the body; only "Encher a caixa" chains the next one.
  const doneLoads = useRef(0);
  useEffect(() => {
    if (loads > doneLoads.current) {
      if (isFull(loads)) { setPlaying(false); setFilling(false); setNotice(project.fullNote); }
      else if (!filling) { setPlaying(false); setNotice(`Ciclo ${loads} concluído. Caixa ${Math.round(bodyFill(loads, 0) * 100)}% cheia.`); }
    }
    doneLoads.current = loads;
  }, [loads, filling]);
  useEffect(() => {
    const sync = () => audio.current?.set(sound && playing && !document.hidden, phase);
    sync(); document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [sound, playing, phase]);
  useEffect(() => () => audio.current?.dispose(), []);
  useEffect(() => { if (drawer) partsDialog.current?.showModal(); else partsDialog.current?.close(); }, [drawer]);
  useEffect(() => {
    if ((selected || tour) && innerWidth <= 760) {
      const id = requestAnimationFrame(() => inspector.current?.scrollIntoView({ block: 'nearest', behavior: reduced ? 'instant' : 'smooth' }));
      return () => cancelAnimationFrame(id);
    }
  }, [selected, tour, reduced]);
  const setProgress = (value: number) => setCycle(c => ({ ...c, progress: value }));
  /** Manual control of the mechanism: stops playback, the time-lapse and any tour segment. */
  function scrub(value: number) {
    setPlaying(false); setFilling(false); segmentEnd.current = 1; setProgress(value); setCutaway(true); setExplosion(0);
  }
  function reset() {
    setPlaying(false); setFilling(false); segmentEnd.current = 1; setCycle({ progress: 0, loads: 0 });
    setSelected(null); setIsolated(false); setExplosion(0); setCutaway(false); setWireframe(false); setTour(false);
    scene.current?.home(); setNotice('Experiência reiniciada. A caixa foi esvaziada.');
  }
  function empty() {
    setPlaying(false); setFilling(false); segmentEnd.current = 1; setCycle({ progress: 0, loads: 0 });
    setNotice('Caixa esvaziada. No aterro, a placa ejetora empurra a carga para fora.');
  }
  function prepare() { setExplosion(0); setIsolated(false); setCutaway(true); setTour(false); segmentEnd.current = 1; }
  function play() {
    if (full) return empty();
    prepare();
    if (playing) { setPlaying(false); setFilling(false); } else setPlaying(true);
  }
  function fillBody() {
    if (filling) { setFilling(false); setPlaying(false); return; }
    prepare(); setFilling(true); setPlaying(true);
  }
  function guide(step: number) {
    const i = Math.max(0, Math.min(3, step)), end = (i + 1) / 4 - .002;
    setFilling(false); setTour(true); setSelected(null); setIsolated(false); setCutaway(true); setExplosion(0);
    if (reduced) { setPlaying(false); segmentEnd.current = 1; setProgress(end); return; }
    segmentEnd.current = end; setProgress(i / 4); setPlaying(true);
  }
  async function toggleSound() {
    try { audio.current ??= createAudio(); await audio.current.resume(); setSound(v => !v); }
    catch { setNotice('O áudio não está disponível neste navegador.'); }
  }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { setNotice('Tela cheia não está disponível neste navegador.'); }
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('dialog[open]') || e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || sources || drawer) return;
      if (e.key.toLowerCase() === 'r') scene.current?.home();
      if (e.key.toLowerCase() === 'e') { setPlaying(false); setFilling(false); setExplosion(p => p > 0 ? 0 : 1); }
      if (e.key === 'Escape') { setSelected(null); setIsolated(false); setTour(false); }
    };
    document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey);
  }, [sources, drawer]);
  const playLabel = full ? 'Esvaziar a caixa' : playing ? 'Pausar' : progress > 0 ? 'Continuar ciclo' : loads > 0 ? 'Próximo ciclo' : 'Ver compactação';
  const renderParts = () => <>
    <label className="search"><Search size={16}/><input aria-label="Encontrar conjunto" placeholder="Encontrar conjunto" value={search} onChange={e => setSearch(e.target.value)}/><span>{parts.length.toString().padStart(2, '0')}</span></label>
    <div className="parts-list">
      {filteredParts.map(p => <button key={p.id} className={'part-row' + (selected === p.id ? ' selected' : '')} aria-pressed={selected === p.id} onClick={() => { select(p.id); setDrawer(false); }}><span>{String(parts.indexOf(p) + 1).padStart(2, '0')}</span><strong>{p.label}</strong><ChevronRight size={14}/></button>)}
      {parts.length > 0 && !filteredParts.length && <small className="search-hint">Nenhum conjunto encontrado.</small>}
    </div>
  </>;
  return <div className="app">
    <header className="header"><Brand/><div className="collection-label">ENGENHARIA POR DENTRO <span>/</span> LAB {labNumber('caminhao-lixo')}</div><a className="video-link" href="#video">Ver o vídeo <ArrowUpRight size={16}/></a></header>
    <main className={'workspace' + (currentPart || tour ? ' with-card' : '')}>
      <div className="heading"><p className="eyebrow"><span/> EXPERIMENTO {labNumber('caminhao-lixo')} <i>—</i> COLETA URBANA</p><h1>{project.title}</h1><p className="subtitle">{project.subtitle}</p><p className="intro">{project.intro}</p></div>
      <div className="canvas-region"><div className="scene-host" ref={host}/>
        {!parts.length && !error && <div className="loading" role="status">Preparando o laboratório…</div>}
        {error && <div className="scene-error" role="alert"><Box size={32}/><h2>Cena indisponível</h2><p>{error}</p><button className="primary" onClick={() => location.reload()}>Tentar novamente</button><a href={project.video}>Assistir ao vídeo</a></div>}
        <div className="scene-mode"><span className={playing ? 'status-dot active' : 'status-dot'}/>{isolated ? 'CONJUNTO ISOLADO' : explosion > 0 ? 'VISTA DESMONTADA' : cutaway ? 'POR DENTRO' : 'VISTA COMPLETA'}<span className="mode-divider"/>MODELO 3D</div>
        <div className="orbit-hint"><span className="hint-fine">Arraste para girar <i>·</i> Ctrl + rolagem aproxima</span><span className="hint-coarse">Deslize para os lados para girar <i>·</i> Pinça aproxima</span></div>
      </div>
      <aside className="sidebar"><div className="sidebar-label">CONHEÇA OS CONJUNTOS</div>{renderParts()}<div className="sidebar-foot"><span className="mini-line"/><p>Uma máquina. Quatro movimentos.</p><button className="text-button" onClick={() => guide(0)}>Fazer uma visita guiada <ArrowRight size={15}/></button></div></aside>
      <nav className="view-switch" aria-label="Modo da cena"><button className={!cutaway ? 'active' : ''} aria-pressed={!cutaway} onClick={() => setCutaway(false)}>Explorar</button><button className={cutaway ? 'active' : ''} aria-pressed={cutaway} onClick={() => setCutaway(true)}>Por dentro</button></nav>
      <div className="camera-tools" role="toolbar" aria-label="Câmera e imagem"><button aria-label="Aproximar" title="Aproximar" onClick={() => scene.current?.zoom(.85)}><Plus size={18}/></button><button aria-label="Afastar" title="Afastar" onClick={() => scene.current?.zoom(1.15)}><Minus size={18}/></button><span/><button aria-label="Reenquadrar" title="Reenquadrar (R)" onClick={() => scene.current?.home()}><Focus size={19}/></button><button aria-label="Vista lateral" title="Vista lateral" onClick={() => scene.current?.preset('side')}><Eye size={18}/></button><button className="wireframe-button" aria-label="Mostrar malha" title="Mostrar malha" aria-pressed={wireframe} onClick={() => setWireframe(v => !v)}><Box size={18}/></button><span/><button aria-label="Salvar imagem PNG" title="Salvar imagem" onClick={() => scene.current?.capture(false, fillStatus(cycle))}><Download size={18}/></button><button className="format-button" aria-label="Salvar imagem vertical 9 por 16" title="Salvar imagem vertical 9:16" onClick={() => scene.current?.capture(true, fillStatus(cycle))}>9:16</button>{Boolean(document.documentElement.requestFullscreen) && <button className="fullscreen-button" aria-label="Tela cheia" title="Tela cheia" onClick={fullscreen}><Maximize size={17}/></button>}</div>
      {currentPart && <section ref={inspector} className="inspector" aria-label="Conjunto selecionado"><div className="inspector-top"><span className="eyebrow">EM DETALHE</span><button className="icon-button" aria-label="Fechar detalhe" onClick={() => select(null)}><X size={16}/></button></div><h2>{currentPart.label}</h2><p>{currentPart.detail}</p><small>{currentPart.note}</small><div className="inspector-actions"><button onClick={() => setIsolated(v => !v)} aria-pressed={isolated}><Layers3 size={14}/>{isolated ? 'Ver conjunto todo' : 'Isolar'}</button><button onClick={() => scene.current?.focus(currentPart.id)}><Focus size={14}/>Aproximar</button></div></section>}
      {tour && <section ref={inspector} className="inspector tour" aria-label="Visita guiada"><div className="inspector-top"><span className="eyebrow">VISITA GUIADA · {phase + 1}/4</span><button className="icon-button" aria-label="Fechar visita" onClick={() => setTour(false)}><X size={16}/></button></div><h2>{project.stages[phase].name}</h2><p>{project.stages[phase].description}</p><div className="inspector-actions"><button disabled={phase === 0} onClick={() => guide(phase - 1)}><ArrowLeft size={14}/>Anterior</button><button onClick={() => phase < 3 ? guide(phase + 1) : setTour(false)}>{phase < 3 ? 'Próxima etapa' : 'Concluir'}<ArrowRight size={14}/></button></div></section>}
      <div className="mobile-actions"><button onClick={() => setDrawer(true)}><Layers3 size={16}/>Conjuntos <span>{parts.length}</span></button><button onClick={() => guide(0)}>Visita guiada <ArrowRight size={16}/></button></div>
      <section className="control-dock" aria-label="Controles da compactação">
        <div className="dock-top"><button className="primary play-button" disabled={Boolean(error)} onClick={play}>{full ? <RotateCcw size={17}/> : playing ? <Pause size={17}/> : <Play size={17}/>}<span>{playLabel}</span></button><button className="icon-button" aria-label={sound ? 'Desligar som ilustrativo' : 'Ligar som ilustrativo'} title="Som ilustrativo" aria-pressed={sound} onClick={toggleSound}>{sound ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button><div className="phase-copy" aria-live={filling ? 'off' : 'polite'}><strong>{full ? 'Caixa cheia' : project.stages[phase].name}</strong><span>{full ? project.fullNote : project.stages[phase].description}</span></div><button className="icon-button" aria-label="Reiniciar experiência" title="Reiniciar" onClick={reset}><RotateCcw size={18}/></button></div>
        <div className="timeline"><label htmlFor="cycle">CICLO <span>{Math.round(progress * 100)}%</span></label><input id="cycle" aria-label="Progresso do ciclo" type="range" min="0" max="1000" value={Math.round(progress * 1000)} style={{ '--progress': `${progress * 100}%` } as React.CSSProperties} onChange={e => scrub(Number(e.target.value) / 1000)}/><div className="phase-markers">{project.stages.map((stage, i) => <button className={phase === i ? 'current' : ''} key={stage.name} aria-label={`Etapa ${i + 1}: ${stage.name}`} onClick={() => scrub(i / 4 + .125)}>{String(i + 1).padStart(2, '0')} <span>{stage.name}</span></button>)}</div></div>
        <div className="load-meter"><span className="load-label">CAIXA</span><div className="load-bar" aria-hidden="true"><i style={{ width: `${fill}%` }}/></div><output aria-label="Ocupação da caixa coletora">{fill}% cheia · {loads} {loads === 1 ? 'ciclo' : 'ciclos'}</output><button className="fill-button" disabled={Boolean(error) || full} aria-pressed={filling} onClick={fillBody}><FastForward size={15}/>{filling ? 'Parar' : 'Encher a caixa'}</button><small>{project.compactionNote}</small></div>
        <div className="explode-control"><Layers3 size={17}/><label htmlFor="explode">Desmontar conjuntos</label><input id="explode" aria-label="Desmontagem dos conjuntos" type="range" min="0" max="100" value={Math.round(explosion * 100)} onChange={e => { setPlaying(false); setFilling(false); setIsolated(false); setExplosion(Number(e.target.value) / 100); }}/><output>{Math.round(explosion * 100)}%</output></div>
        {reduced && <p className="motion-note">Movimento reduzido ativo. Você também pode explorar pelas etapas e pelos controles deslizantes.</p>}
      </section>
    </main>
    <Below onSources={openSources}/>
    <Sources open={sources} onClose={() => setSources(false)}/>
    <dialog ref={partsDialog} className="parts-dialog" onClose={() => setDrawer(false)} aria-label="Conjuntos do caminhão"><div className="dialog-top"><span className="eyebrow">CONHEÇA OS CONJUNTOS</span><button className="icon-button" aria-label="Fechar conjuntos" onClick={() => setDrawer(false)}><X size={20}/></button></div>{renderParts()}</dialog>
    <span className="sr-only" role="status" aria-live="polite">{notice}</span>
  </div>;
}
