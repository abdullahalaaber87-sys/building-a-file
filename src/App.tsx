import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type SetStateAction } from 'react';
import { ArrowUpRight, ChevronDown, CircleHelp, Code2, Command, LayoutPanelTop, MoveDiagonal2, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { accents, categories, defaultEnabled, defaultFavorites, defaultHudOptions, defaultKeybinds, defaultSettings, modules, tracks, type AccentName, type Category, type Filter, type HudOptions, type ModuleSetting, type View } from './clientData';
import { AppearanceView } from './components/AppearanceView';
import { BrandMark, PreviewPanel, Switch } from './components/ClientPieces';
import { defaultHudPosition, HudEditor, type HudPosition } from './components/HudEditor';

function useStoredState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`watermalon:${key}`);
      if (!saved) return initial;
      const parsed = JSON.parse(saved) as T;
      if (key === 'hud-position' && typeof parsed === 'object' && parsed !== null) {
        const legacy = parsed as Record<string, unknown>;
        if (!('spotify' in legacy) && typeof legacy.x === 'number' && typeof legacy.y === 'number') {
          return { ...initial, ...legacy, spotify: { x: legacy.x, y: legacy.y } } as T;
        }
      }
      return typeof initial === 'object' && initial !== null && !Array.isArray(initial)
        ? { ...initial, ...parsed }
        : parsed;
    } catch {
      return initial;
    }
  });
  useLayoutEffect(() => {
    try { localStorage.setItem(`watermalon:${key}`, JSON.stringify(value)); } catch { /* Local preview still works without storage. */ }
  }, [key, value]);
  return [value, setValue];
}

function ImplementationModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section className="implementation-modal" role="dialog" aria-modal="true" aria-labelledby="implementation-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-top"><span className="section-kicker">GITHUB BUILD KIT  /  FABRIC 1.21.11</span><button className="icon-button" onClick={close} aria-label="Close implementation notes"><X size={17} /></button></div>
        <h2 id="implementation-title">Build the Watermalon starter.</h2>
        <p className="modal-intro">A GitHub-ready Fabric project with Gradle, source, assets, tests, and an Actions workflow that uploads a JAR.</p>
        <div className="findings-list">
          <div><span>01</span><p><strong>Push to GitHub</strong><small>The included workflow installs Java 21, runs the layout checks, builds with Fabric Loom, and uploads the remapped JAR as an Actions artifact.</small></p></div>
          <div><span>02</span><p><strong>Try the starter in-game</strong><small>Install Fabric 1.21.11 and Fabric API, launch Minecraft, and press Right Shift. The sample Watermalon HUD uses live player coordinates.</small></p></div>
          <div><span>03</span><p><strong>Connect the original client</strong><small>This starter does not contain the original module implementations or Spotify service. Connect it to the original mapped Gradle source project to preserve those behaviors.</small></p></div>
        </div>
        <div className="modal-notice"><CircleHelp size={16} /><span>The original Gofile JAR could not be fetched in this session; this download is a runnable starter, not a patched copy of it.</span></div>
        <div className="modal-actions">
          <a className="primary-button" href="/CLIENT_PORT.md" target="_blank" rel="noreferrer">GitHub build instructions <ArrowUpRight size={15} /></a>
          <a className="download-link" href="/client-port.zip" download>Download build kit</a>
          <a className="download-link" href="/watermalon-1.0.0.jar" download>Download starter JAR</a>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [view, setView] = useState<View>('modules');
  const [category, setCategory] = useState<Category>('All modules');
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [listening, setListening] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [enabled, setEnabled] = useStoredState('enabled', defaultEnabled);
  const [favorites, setFavorites] = useStoredState('favorites', defaultFavorites);
  const [keybinds, setKeybinds] = useStoredState('keybinds', defaultKeybinds);
  const [moduleSettings, setModuleSettings] = useStoredState<Record<string, ModuleSetting[]>>('settings', defaultSettings);
  const [options, setOptions] = useStoredState<HudOptions>('hud-options', defaultHudOptions);
  const [hudPosition, setHudPosition] = useStoredState<HudPosition>('hud-position', defaultHudPosition);
  const [accent, setAccent] = useStoredState<AccentName>('accent', 'melon');
  const [opacity, setOpacity] = useStoredState('opacity', 96);
  const [radius, setRadius] = useStoredState('radius', 12);
  const [guiWidth, setGuiWidth] = useStoredState('gui-width', 68);
  const [guiHeight, setGuiHeight] = useStoredState('gui-height', 78);
  const [guiPosition, setGuiPosition] = useStoredState('gui-position', { x: 0, y: 0 });
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackPosition, setTrackPosition] = useState(84);
  const [playing, setPlaying] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const windowRef = useRef<HTMLElement | null>(null);
  const windowDrag = useRef<{ pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const windowResize = useRef<{ pointerId: number; startX: number; startY: number; width: number; height: number } | null>(null);
  const track = tracks[trackIndex];
  const currentAccent = accents.find((item) => item.id === accent) ?? accents[0];

  useEffect(() => {
    function keepWindowInView() {
      const rect = windowRef.current?.getBoundingClientRect();
      if (!rect) return;
      setGuiPosition((previous) => {
        const maxX = Math.max(0, (window.innerWidth - rect.width - 24) / 2);
        const maxY = Math.max(0, (window.innerHeight - rect.height - 24) / 2);
        const x = Math.max(-maxX, Math.min(maxX, (previous.x * window.innerWidth) / 100));
        const y = Math.max(-maxY, Math.min(maxY, (previous.y * window.innerHeight) / 100));
        const next = { x: (x / window.innerWidth) * 100, y: (y / window.innerHeight) * 100 };
        return next.x === previous.x && next.y === previous.y ? previous : next;
      });
    }
    keepWindowInView();
    window.addEventListener('resize', keepWindowInView);
    return () => window.removeEventListener('resize', keepWindowInView);
  }, [guiWidth, guiHeight, open, setGuiPosition]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTrackPosition((position) => Math.min(track.duration, position + 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, track.duration]);

  useEffect(() => {
    if (trackPosition >= track.duration && playing) {
      setTrackIndex((index) => (index + 1) % tracks.length);
      setTrackPosition(0);
    }
  }, [trackPosition, track.duration, playing]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (listening) {
        event.preventDefault();
        if (event.key === 'Escape') { setListening(null); return; }
        if (['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) return;
        const key = event.key === 'Backspace' || event.key === 'Delete' ? '' : event.key === ' ' ? 'SPACE' : event.key.toUpperCase();
        setKeybinds((previous) => ({ ...previous, [listening]: key }));
        setListening(null);
        return;
      }
      if (event.key === 'Escape') {
        if (showNotes) setShowNotes(false);
        else setOpen(false);
        return;
      }
      if (event.code === 'ShiftRight' && !event.repeat) {
        setOpen((previous) => !previous);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.matches('input, textarea, select') || target?.isContentEditable) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        setView('modules');
        window.setTimeout(() => searchRef.current?.focus(), 0);
        return;
      }
      if (!open || showNotes || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key === ' ' ? 'SPACE' : event.key.toUpperCase();
      const matched = modules.filter((module) => keybinds[module.id] && keybinds[module.id] === key);
      if (matched.length) {
        event.preventDefault();
        setEnabled((previous) => {
          const next = { ...previous };
          matched.forEach((module) => { next[module.id] = !next[module.id]; });
          return next;
        });
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keybinds, listening, open, setEnabled, setKeybinds, showNotes]);

  function toggleEnabled(id: string) {
    setEnabled((previous) => ({ ...previous, [id]: !previous[id] }));
  }

  function toggleOption(option: keyof HudOptions) {
    setOptions((previous) => ({ ...previous, [option]: !previous[option] }));
  }

  function startWindowDrag(event: ReactPointerEvent<HTMLElement>) {
    if (event.button !== 0 || (event.target instanceof Element && event.target.closest('button, input, a'))) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    windowDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: guiPosition.x,
      y: guiPosition.y,
    };
  }

  function moveWindowDrag(event: ReactPointerEvent<HTMLElement>) {
    const drag = windowDrag.current;
    const rect = windowRef.current?.getBoundingClientRect();
    if (!drag || drag.pointerId !== event.pointerId || !rect) return;
    const maxX = Math.max(0, (window.innerWidth - rect.width - 24) / 2);
    const maxY = Math.max(0, (window.innerHeight - rect.height - 24) / 2);
    const x = Math.max(-maxX, Math.min(maxX, (drag.x * window.innerWidth) / 100 + event.clientX - drag.startX));
    const y = Math.max(-maxY, Math.min(maxY, (drag.y * window.innerHeight) / 100 + event.clientY - drag.startY));
    setGuiPosition({ x: (x / window.innerWidth) * 100, y: (y / window.innerHeight) * 100 });
  }

  function endWindowDrag(event: ReactPointerEvent<HTMLElement>) {
    if (windowDrag.current?.pointerId === event.pointerId) windowDrag.current = null;
  }

  function startWindowResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    windowResize.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      width: guiWidth,
      height: guiHeight,
    };
  }

  function moveWindowResize(event: ReactPointerEvent<HTMLButtonElement>) {
    const resize = windowResize.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    const baseWidth = Math.min(1180, window.innerWidth * 0.94);
    const baseHeight = Math.min(760, window.innerHeight * 0.88);
    setGuiWidth(Math.max(60, Math.min(110, resize.width + ((event.clientX - resize.startX) / baseWidth) * 100)));
    setGuiHeight(Math.max(50, Math.min(110, resize.height + ((event.clientY - resize.startY) / baseHeight) * 100)));
  }

  function endWindowResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (windowResize.current?.pointerId === event.pointerId) windowResize.current = null;
  }

  function updateSetting(moduleId: string, settingId: string, value: boolean | number | string) {
    setModuleSettings((previous) => ({
      ...previous,
      [moduleId]: (previous[moduleId] ?? []).map((setting) => setting.id === settingId ? { ...setting, value } as ModuleSetting : setting),
    }));
  }

  function changeTrack(direction: number) {
    setTrackIndex((index) => (index + direction + tracks.length) % tracks.length);
    setTrackPosition(0);
    setPlaying(true);
  }

  function selectCategory(next: Category) {
    setCategory(next);
    setFilter('all');
    setView('modules');
    setExpanded(null);
  }

  const visibleModules = modules.filter((module) => {
    const matchesCategory = category === 'All modules' || module.category === category;
    const matchesFilter = filter === 'all' || (filter === 'enabled' ? enabled[module.id] : favorites[module.id]);
    const search = query.trim().toLowerCase();
    return matchesCategory && matchesFilter && (!search || `${module.name} ${module.description} ${module.category}`.toLowerCase().includes(search));
  });
  const enabledCount = modules.filter((module) => enabled[module.id]).length;
  const favoriteCount = modules.filter((module) => favorites[module.id]).length;
  const enabledNames = modules.filter((module) => enabled[module.id]).map((module) => module.name);
  const appStyle = {
    '--accent': currentAccent.color,
    '--accent-rgb': currentAccent.rgb,
    '--surface-opacity': opacity / 100,
    '--window-radius': `${radius}px`,
    '--gui-width': guiWidth / 100,
    '--gui-height': guiHeight / 100,
    '--gui-offset-x': `${guiPosition.x}vw`,
    '--gui-offset-y': `${guiPosition.y}svh`,
  } as CSSProperties;

  return (
    <div className="game-shell" style={appStyle}>
      <div className="world-background" />
      <div className="world-vignette" />
      <div className="outer-hud outer-hud-left"><BrandMark small /><span>WATER<span>MALON</span><small>1.21.11</small></span></div>
      <div className="outer-hud outer-hud-right"><span className="outer-online" /> <strong>144</strong> FPS <i /> <strong>24</strong> MS</div>

      {open ? (
        <main ref={windowRef} className="client-window" aria-label="Watermalon click GUI">
          <header
            className="window-header"
            onPointerDown={startWindowDrag}
            onPointerMove={moveWindowDrag}
            onPointerUp={endWindowDrag}
            onPointerCancel={endWindowDrag}
          >
            <div className="brand-lockup"><BrandMark /><div><strong>WATER<span>MALON</span></strong><small>FRESH. SHARP. YOURS.</small></div></div>
            <nav className="top-navigation" aria-label="Client views">
              <button className={view === 'modules' ? 'active' : ''} onClick={() => setView('modules')}>Modules</button>
              <button className={view === 'hud' ? 'active' : ''} onClick={() => setView('hud')}>HUD Editor</button>
              <button className={view === 'appearance' ? 'active' : ''} onClick={() => setView('appearance')}>Appearance</button>
            </nav>
            <div className="header-actions">
              <button className="notes-button" onClick={() => setShowNotes(true)} title="Build notes" aria-label="Build notes"><Code2 size={15} /></button>
              <button className="close-button" onClick={() => setOpen(false)} aria-label="Close client preview"><X size={17} /></button>
            </div>
          </header>

          <div className={`window-body${view === 'hud' ? ' hud-mode' : ''}`}>
            <aside className="sidebar">
              <div className="sidebar-nav">
                {categories.map(({ label, icon: Icon }) => {
                  const count = label === 'All modules' ? modules.length : modules.filter((module) => module.category === label).length;
                  return <button key={label} className={view === 'modules' && category === label ? 'selected' : ''} onClick={() => selectCategory(label)}><Icon size={16} strokeWidth={1.7} /><span>{label}</span><small>{String(count).padStart(2, '0')}</small></button>;
                })}
              </div>
              <div className="sidebar-rule" />
              <div className="sidebar-nav sidebar-tools">
                <button className={view === 'hud' ? 'selected' : ''} onClick={() => setView('hud')}><LayoutPanelTop size={16} strokeWidth={1.7} /><span>HUD editor</span><ArrowUpRight size={13} /></button>
                <button className={view === 'appearance' ? 'selected' : ''} onClick={() => setView('appearance')}><SlidersHorizontal size={16} strokeWidth={1.7} /><span>Appearance</span><ArrowUpRight size={13} /></button>
              </div>
              <div className="sidebar-bottom"><div className="profile-avatar">W</div><div><strong>Watermalon</strong><small>{modules.length} modules loaded</small></div><ChevronDown size={14} /></div>
            </aside>

            {view === 'modules' && (
              <section className="workspace-content modules-workspace">
                <div className="page-heading modules-heading">
                  <div><h1>Modules<span className="accent-dot">.</span></h1></div>
                  <label className="search-box"><Search size={16} /><input ref={searchRef} type="search" placeholder="Search modules..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search modules" /><kbd><Command size={10} /> K</kbd></label>
                </div>
                <div className="module-toolbar">
                  <div className="filter-tabs" role="group" aria-label="Filter modules">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All modules <span>{modules.length}</span></button>
                    <button className={filter === 'enabled' ? 'active' : ''} onClick={() => setFilter('enabled')}>Enabled <span>{enabledCount}</span></button>
                    <button className={filter === 'favorites' ? 'active' : ''} onClick={() => setFilter('favorites')}>Favorites <span>{favoriteCount}</span></button>
                  </div>
                  <span className="toolbar-sorting">{visibleModules.length} SHOWN</span>
                </div>
                <div className="module-list">
                  {visibleModules.length ? visibleModules.map((module, index) => {
                    const Icon = module.icon;
                    const isExpanded = expanded === module.id;
                    return <div className={`module-entry${isExpanded ? ' expanded' : ''}`} key={module.id} style={{ '--row-index': index } as CSSProperties}>
                      <div className="module-row">
                        <button type="button" className="module-main" onClick={() => setExpanded(isExpanded ? null : module.id)} aria-expanded={isExpanded} aria-label={`${module.name} settings`}>
                          <span className={`module-icon${enabled[module.id] ? ' enabled' : ''}`}><Icon size={18} strokeWidth={1.65} /></span>
                          <span className="module-copy"><strong>{module.name}</strong><small>{module.description}</small></span>
                        </button>
                        <button className={`favorite-button${favorites[module.id] ? ' is-favorite' : ''}`} onClick={() => setFavorites((previous) => ({ ...previous, [module.id]: !previous[module.id] }))} aria-label={`${favorites[module.id] ? 'Remove' : 'Add'} ${module.name} ${favorites[module.id] ? 'from' : 'to'} favorites`} title={favorites[module.id] ? 'Remove favorite' : 'Add favorite'}><Star size={14} fill={favorites[module.id] ? 'currentColor' : 'none'} /></button>
                        <span className="module-category">{module.category.toUpperCase()}</span>
                        <Switch checked={Boolean(enabled[module.id])} onChange={() => toggleEnabled(module.id)} label={`Toggle ${module.name}`} />
                      </div>
                      {isExpanded && <div className="module-expanded">
                        <div className="setting-row">
                          <div><strong>Keyboard shortcut</strong><small>{listening === module.id ? 'Press a key. Backspace clears; Esc cancels.' : 'Click to set a shortcut.'}</small></div>
                          <button className={`keybind-button${listening === module.id ? ' listening' : ''}`} onClick={() => setListening(module.id)}>{listening === module.id ? 'PRESS A KEY' : keybinds[module.id] || 'NONE'}</button>
                        </div>
                        {(moduleSettings[module.id] ?? module.settings).map((setting) => (
                          <div className="setting-row" key={setting.id}>
                            <div><strong>{setting.name}</strong><small>{setting.description}</small></div>
                            {setting.type === 'toggle' && <Switch checked={Boolean(setting.value)} onChange={() => updateSetting(module.id, setting.id, !setting.value)} label={`${setting.name} for ${module.name}`} small />}
                            {setting.type === 'slider' && (
                              <label className="inline-range">
                                <b>{setting.value}</b>
                                <input type="range" min={setting.min} max={setting.max} step={setting.step} value={setting.value} onChange={(event) => updateSetting(module.id, setting.id, Number(event.target.value))} style={{ '--range-progress': `${((Number(setting.value) - setting.min) / (setting.max - setting.min)) * 100}%` } as CSSProperties} />
                              </label>
                            )}
                            {setting.type === 'mode' && (
                              <div className="mode-pills">
                                {setting.options.map((option) => (
                                  <button key={option} className={setting.value === option ? 'active' : ''} onClick={() => updateSetting(module.id, setting.id, option)}>{option}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        {(module.id === 'spotify' || module.id === 'hud') && <button className="mini-editor-link" onClick={() => setView('hud')}>Edit HUD <ArrowUpRight size={12} /></button>}
                      </div>}
                    </div>;
                  }) : <div className="empty-state"><Search size={21} /><strong>No modules found</strong><p>Try another search or filter.</p><button onClick={() => { setQuery(''); setFilter('all'); setCategory('All modules'); }}>Clear filters</button></div>}
                </div>
                <div className="workspace-footer"><span><i /> {enabledCount} ENABLED</span></div>
              </section>
            )}

            {view === 'hud' && <HudEditor position={hudPosition} setPosition={setHudPosition} options={options} toggleOption={toggleOption} enabled={Boolean(enabled.spotify)} hudEnabled={Boolean(enabled.hud)} enabledNames={enabledNames} track={track} trackPosition={trackPosition} playing={playing} />}
            {view === 'appearance' && <AppearanceView accent={accent} setAccent={setAccent} opacity={opacity} setOpacity={setOpacity} radius={radius} setRadius={setRadius} guiWidth={guiWidth} setGuiWidth={setGuiWidth} guiHeight={guiHeight} setGuiHeight={setGuiHeight} resetWindow={() => { setGuiWidth(68); setGuiHeight(78); setGuiPosition({ x: 0, y: 0 }); }} reset={() => { setAccent('melon'); setOpacity(96); setRadius(12); }} />}

            {view !== 'hud' && <PreviewPanel enabled={Boolean(enabled.spotify)} toggleEnabled={() => toggleEnabled('spotify')} options={options} toggleOption={toggleOption} track={track} position={trackPosition} playing={playing} setPlaying={setPlaying} seek={setTrackPosition} changeTrack={changeTrack} openEditor={() => setView('hud')} />}
          </div>
          <button
            type="button"
            className="window-resize-handle"
            aria-label="Resize Click GUI. Drag to change its width and height."
            title="Drag to resize"
            onPointerDown={startWindowResize}
            onPointerMove={moveWindowResize}
            onPointerUp={endWindowResize}
            onPointerCancel={endWindowResize}
          >
            <MoveDiagonal2 size={12} aria-hidden="true" />
          </button>
        </main>
      ) : (
        <button className="reopen-button" onClick={() => setOpen(true)}><BrandMark /><span><strong>Open Watermalon</strong><small>Press Right Shift to open</small></span><ArrowUpRight size={17} /></button>
      )}

      <div className="outer-footer"><span /><span><kbd>R SHIFT</kbd> {open ? 'TO CLOSE' : 'TO OPEN'}</span></div>
      {showNotes && <ImplementationModal close={() => setShowNotes(false)} />}
    </div>
  );
}

export default App;