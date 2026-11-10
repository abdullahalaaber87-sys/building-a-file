import { Check, RotateCcw } from 'lucide-react';
import { accents, type AccentName } from '../clientData';

type AppearanceViewProps = {
  accent: AccentName;
  setAccent: (accent: AccentName) => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
  radius: number;
  setRadius: (radius: number) => void;
  guiWidth: number;
  setGuiWidth: (width: number) => void;
  guiHeight: number;
  setGuiHeight: (height: number) => void;
  resetWindow: () => void;
  reset: () => void;
};

export function AppearanceView({ accent, setAccent, opacity, setOpacity, radius, setRadius, guiWidth, setGuiWidth, guiHeight, setGuiHeight, resetWindow, reset }: AppearanceViewProps) {
  return (
    <section className="workspace-content appearance-workspace">
      <div className="page-heading editor-heading">
        <div><h1>Set the <em>tone.</em></h1></div>
        <button className="subtle-button" onClick={reset}><RotateCcw size={14} /> Reset theme</button>
      </div>
      <div className="appearance-section">
        <div className="setting-title"><div><h3>Accent color</h3></div></div>
        <div className="accent-options">
          {accents.map((item) => (
            <button type="button" key={item.id} className={`accent-option${accent === item.id ? ' selected' : ''}`} onClick={() => setAccent(item.id)} aria-pressed={accent === item.id}>
              <span className="accent-swatch" style={{ background: item.color }}>{accent === item.id && <Check size={15} strokeWidth={2.5} />}</span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </div>
      </div>
      <div className="appearance-section surface-settings gui-size-settings">
        <div className="setting-title">
          <div><h3>Click GUI size</h3></div>
          <button className="text-link" type="button" onClick={resetWindow}>Reset window</button>
        </div>
        <label className="range-setting">
          <span><strong>Width</strong></span><b>{guiWidth}%</b>
          <input type="range" min="60" max="110" value={guiWidth} aria-label="Window width" onChange={(event) => setGuiWidth(Number(event.target.value))} style={{ '--range-progress': `${((guiWidth - 60) / 50) * 100}%` } as React.CSSProperties} />
        </label>
        <label className="range-setting">
          <span><strong>Height</strong></span><b>{guiHeight}%</b>
          <input type="range" min="50" max="110" value={guiHeight} aria-label="Window height" onChange={(event) => setGuiHeight(Number(event.target.value))} style={{ '--range-progress': `${((guiHeight - 50) / 60) * 100}%` } as React.CSSProperties} />
        </label>
        <p className="resize-hint">Drag the header to move it. Drag the bottom-right corner to resize.</p>
      </div>
      <div className="appearance-section surface-settings">
        <div className="setting-title"><div><h3>Surface</h3></div></div>
        <label className="range-setting"><span><strong>Panel opacity</strong></span><b>{opacity}%</b>
          <input type="range" min="82" max="100" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} style={{ '--range-progress': `${((opacity - 82) / 18) * 100}%` } as React.CSSProperties} />
        </label>
        <label className="range-setting"><span><strong>Corner radius</strong></span><b>{radius}px</b>
          <input type="range" min="4" max="20" value={radius} onChange={(event) => setRadius(Number(event.target.value))} style={{ '--range-progress': `${((radius - 4) / 16) * 100}%` } as React.CSSProperties} />
        </label>
      </div>
      <div className="appearance-type"><span className="type-sample">Aa</span><div><strong>Inter</strong></div></div>
    </section>
  );
}