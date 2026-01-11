import type { PatternConfig, ShapeType } from '@/types';

interface ConfigPanelProps {
  config: PatternConfig;
  onChange: (config: PatternConfig) => void;
  hideShapeType?: boolean;
}

const SHAPE_OPTIONS: { value: ShapeType; label: string }[] = [
  { value: 'box', label: 'Box' },
  { value: 'pyramid', label: 'Pyramid' },
  { value: 'prism', label: 'Hexagonal Prism' },
  { value: 'cylinder', label: 'Cylinder' },
  { value: 'envelope', label: 'Envelope' },
];

export function ConfigPanel({ config, onChange, hideShapeType = false }: ConfigPanelProps) {
  const handleChange = (key: keyof PatternConfig, value: number | string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="config-panel">
      <h3>Pattern Configuration</h3>

      {!hideShapeType && (
        <div className="config-field">
          <label htmlFor="shapeType">Shape Type</label>
          <select
            id="shapeType"
            value={config.shapeType}
            onChange={(e) => handleChange('shapeType', e.target.value)}
            className="config-select"
          >
            {SHAPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="config-field">
        <label htmlFor="width">Width (cm)</label>
        <input
          id="width"
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={config.width}
          onChange={(e) => handleChange('width', parseFloat(e.target.value))}
        />
        <span>{config.width}</span>
      </div>

      <div className="config-field">
        <label htmlFor="height">Height (cm)</label>
        <input
          id="height"
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={config.height}
          onChange={(e) => handleChange('height', parseFloat(e.target.value))}
        />
        <span>{config.height}</span>
      </div>

      {config.shapeType !== 'envelope' && (
        <div className="config-field">
          <label htmlFor="depth">Depth (cm)</label>
          <input
            id="depth"
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={config.depth}
            onChange={(e) => handleChange('depth', parseFloat(e.target.value))}
          />
          <span>{config.depth}</span>
        </div>
      )}

      <div className="config-field">
        <label htmlFor="thickness">Thickness (mm)</label>
        <input
          id="thickness"
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={config.thickness}
          onChange={(e) => handleChange('thickness', parseFloat(e.target.value))}
        />
        <span>{config.thickness}</span>
      </div>
    </div>
  );
}
