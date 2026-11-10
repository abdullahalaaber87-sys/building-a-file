import { Apple, Axe, Box, Heart, Move, Pickaxe, Shield, Sparkles, Sword } from 'lucide-react';
import { useRef, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react';
import type { HudOptions, Track } from '../clientData';
import { BrandMark, SpotifyWidget, Switch } from './ClientPieces';

export type HudPoint = { x: number; y: number };
export type HudItemId = 'spotify' | 'watermark' | 'moduleList' | 'coordinates' | 'hotbar';
export type HudPosition = Record<HudItemId, HudPoint> & { x?: number; y?: number };

export const defaultHudPosition: HudPosition = {
  spotify: { x: 0.045, y: 0.53 },
  watermark: { x: 0.025, y: 0.035 },
  moduleList: { x: 0.975, y: 0.04 },
  coordinates: { x: 0.025, y: 0.74 },
  hotbar: { x: 0.5, y: 0.98 },
};

type HudEditorProps = {
  position: HudPosition;
  setPosition: (position: HudPosition) => void;
  options: HudOptions;
  toggleOption: (option: keyof HudOptions) => void;
  enabled: boolean;
  hudEnabled: boolean;
  enabledNames: string[];
  track: Track;
  trackPosition: number;
  playing: boolean;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function getPoint(position: HudPosition, id: HudItemId): HudPoint {
  const saved = position[id];
  if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') return saved;
  if (id === 'spotify' && typeof position.x === 'number' && typeof position.y === 'number') {
    return { x: position.x, y: position.y };
  }
  return defaultHudPosition[id];
}

/** A shared drag target keeps every HUD widget clamped to the same canvas. */
function DraggableHud({
  id,
  label,
  point,
  canvas,
  onChange,
  className,
  children,
}: {
  id: HudItemId;
  label: string;
  point: HudPoint;
  canvas: RefObject<HTMLDivElement | null>;
  onChange: (id: HudItemId, point: HudPoint) => void;
  className: string;
  children: ReactNode;
}) {
  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!dragOffset.current || !canvas.current) return;
    const bounds = canvas.current.getBoundingClientRect();
    const item = event.currentTarget.getBoundingClientRect();
    const travelX = Math.max(1, bounds.width - item.width);
    const travelY = Math.max(1, bounds.height - item.height);
    onChange(id, {
      x: clamp((event.clientX - bounds.left - dragOffset.current.x) / travelX),
      y: clamp((event.clientY - bounds.top - dragOffset.current.y) / travelY),
    });
  }

  function moveWithKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 0.025 : 0.005;
    onChange(id, {
      x: clamp(point.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0)),
      y: clamp(point.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0)),
    });
  }

  return (
    <div
      className={`hud-draggable ${className}`}
      data-label={label}
      style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, transform: `translate(-${point.x * 100}%, -${point.y * 100}%)` }}
      onPointerDown={startDrag}
      onPointerMove={moveDrag}
      onPointerUp={() => { dragOffset.current = null; }}
      onPointerCancel={() => { dragOffset.current = null; }}
      onKeyDown={moveWithKeys}
      role="button"
      tabIndex={0}
      aria-label={`Move ${label}. Drag it or use the arrow keys.`}
    >
      {children}
    </div>
  );
}

const HOTBAR_ITEMS = [Pickaxe, Axe, Sword, Apple, Shield, Box, Sparkles, Sword, Apple];

function GameHotbar() {
  return (
    <div className="game-hotbar" aria-label="Minecraft hotbar preview">
      <div className="game-vitals">
        <div className="game-armor" aria-label="Armor">
          {Array.from({ length: 10 }, (_, i) => <Shield key={i} size={9} strokeWidth={2.3} />)}
        </div>
        <div className="game-health" aria-label="Health">
          {Array.from({ length: 10 }, (_, i) => <Heart key={i} size={11} fill={i < 8 ? '#ef5260' : '#293035'} strokeWidth={1.8} />)}
        </div>
        <div className="game-food" aria-label="Hunger">
          {Array.from({ length: 10 }, (_, i) => <Apple key={i} size={10} fill={i < 8 ? '#d79a53' : '#293035'} strokeWidth={1.8} />)}
        </div>
      </div>
      <div className="game-hotbar-slots">
        {HOTBAR_ITEMS.map((Icon, i) => (
          <span key={i} className={`game-hotbar-slot${i === 2 ? ' selected' : ''}`}>
            {i < 5 && <Icon size={14} strokeWidth={1.8} />}
            {i === 3 && <i className="hotbar-count">16</i>}
          </span>
        ))}
      </div>
      <div className="game-xp"><span /></div>
    </div>
  );
}

export function HudEditor({ position, setPosition, options, toggleOption, enabled, hudEnabled, enabledNames, track, trackPosition, playing }: HudEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const excluded = new Set(['HUD', 'ClickGUI', 'SpotifyHUD', 'Spotify HUD', 'Watermalon+']);
  const listedNames = enabledNames.filter((name) => !excluded.has(name));

  function changePosition(id: HudItemId, point: HudPoint) {
    setPosition({ ...position, [id]: point });
  }

  function resetPositions() {
    setPosition(defaultHudPosition);
  }

  return (
    <section className="workspace-content hud-workspace">
      <div className="page-heading editor-heading">
        <div><h1>HUD <em>layout.</em></h1></div>
        <button className="subtle-button" onClick={resetPositions}><Move size={13} /> Reset layout</button>
      </div>
      <div className="canvas-heading"><span className="section-kicker">IN-GAME PREVIEW</span><span className="hud-canvas-version">WATERMALON / 1.21.11</span></div>
      <div className="hud-editor-canvas" ref={canvasRef}>
        <div className="hud-canvas-shade" />

        {hudEnabled && options.watermark && (
          <DraggableHud id="watermark" label="Watermalon watermark" point={getPoint(position, 'watermark')} canvas={canvasRef} onChange={changePosition} className="hud-watermark-drag">
            <div className="game-watermark"><BrandMark small /><div><strong>WATER<span>MALON</span></strong><small>1.21.11 <i /> 144 FPS</small></div></div>
          </DraggableHud>
        )}

        {hudEnabled && options.moduleList && (
          <DraggableHud id="moduleList" label="ArrayList" point={getPoint(position, 'moduleList')} canvas={canvasRef} onChange={changePosition} className="hud-arraylist-drag">
            <div className="game-module-list">
              {listedNames.map((name) => <span key={name}>{name}<i /></span>)}
            </div>
          </DraggableHud>
        )}

        <div className="hud-canvas-crosshair" aria-hidden="true" />

        {hudEnabled && options.coordinates && (
          <DraggableHud id="coordinates" label="Coordinates" point={getPoint(position, 'coordinates')} canvas={canvasRef} onChange={changePosition} className="hud-coords-drag">
            <div className="game-coordinates"><span>XYZ</span><strong>128.5 / 71 / -247.2</strong><i>Taiga</i></div>
          </DraggableHud>
        )}

        {hudEnabled && options.hotbar && (
          <DraggableHud id="hotbar" label="Hotbar and status bars" point={getPoint(position, 'hotbar')} canvas={canvasRef} onChange={changePosition} className="hud-hotbar-drag">
            <GameHotbar />
          </DraggableHud>
        )}

        <DraggableHud id="spotify" label="Spotify HUD" point={getPoint(position, 'spotify')} canvas={canvasRef} onChange={changePosition} className={`draggable-spotify${!enabled ? ' is-disabled' : ''}`}>
          <SpotifyWidget track={track} position={trackPosition} options={options} playing={playing} />
          {!enabled && <span className="disabled-hud-tag">HUD OFF</span>}
        </DraggableHud>
      </div>
      <div className="canvas-help"><span><Move size={13} /> Drag any widget. Arrow keys nudge; Shift + arrows for smaller steps.</span></div>
      <div className="editor-bottom-options">
        <div><div><strong>Watermark</strong></div><Switch checked={options.watermark} onChange={() => toggleOption('watermark')} label="Show watermark preview" small /></div>
        <div><div><strong>ArrayList</strong></div><Switch checked={options.moduleList} onChange={() => toggleOption('moduleList')} label="Show module list preview" small /></div>
        <div><div><strong>Coordinates</strong></div><Switch checked={options.coordinates} onChange={() => toggleOption('coordinates')} label="Show coordinates preview" small /></div>
        <div><div><strong>Hotbar</strong></div><Switch checked={options.hotbar} onChange={() => toggleOption('hotbar')} label="Show hotbar preview" small /></div>
      </div>
    </section>
  );
}