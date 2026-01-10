interface ExportButtonsProps {
  onExportSVG: () => void;
  onExportSTL: () => void;
  disabled?: boolean;
}

export function ExportButtons({ onExportSVG, onExportSTL, disabled }: ExportButtonsProps) {
  return (
    <div className="export-buttons">
      <h3>Export</h3>

      <button
        className="export-btn export-btn-svg"
        onClick={onExportSVG}
        disabled={disabled}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        Export SVG
      </button>

      <button
        className="export-btn export-btn-stl"
        onClick={onExportSTL}
        disabled={disabled}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        Export STL
      </button>
    </div>
  );
}
