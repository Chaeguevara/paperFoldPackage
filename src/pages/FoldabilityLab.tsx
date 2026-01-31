import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, RefreshCw, CheckCircle, XCircle, Calculator, Info, PenTool } from 'lucide-react';
import { analyzeSingleVertex } from '@/core/theorems';

/**
 * Single Vertex Flat Foldability Explorer
 *
 * Architecture:
 * - State: React useState for crease angles (degrees) and educational step index.
 * - Geometry: Uses analyzeSingleVertex() from the theorem system for real
 *   Kawasaki, Maekawa, and crimping validation.
 * - Visualization: SVG with interactive drag handles for crease lines.
 */

const CENTER = { x: 250, y: 250 };
const RADIUS = 180;
const HANDLE_RADIUS = 12;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

const normalizeAngle = (angle: number) => {
  let res = angle % 360;
  if (res < 0) res += 360;
  return res;
};

const getLineCoords = (angleDeg: number, r = RADIUS) => {
  const rad = toRad(angleDeg);
  return {
    x: CENTER.x + r * Math.cos(rad),
    y: CENTER.y + r * Math.sin(rad),
  };
};

const STEPS = [
  {
    title: '1. The Vertex & Creases',
    desc: 'A single vertex is where fold lines meet. For a flat-foldable pattern, we treat the paper as a circle around this point. Drag the handles to change the crease angles.',
    details: 'In engineering terms, this is a mechanism with concurrent rotational axes.',
  },
  {
    title: '2. The Sector Angles',
    desc: "The spaces between creases are called 'sector angles' (\u03B1). Observe the four angles created by your lines.",
    details: 'We label them sequentially: \u03B1\u2081, \u03B1\u2082, \u03B1\u2083, \u03B1\u2084.',
  },
  {
    title: "3. Kawasaki's Theorem (Geometry)",
    desc: "The 'Alternating Sum' rule. For the paper to fold flat, the sum of alternating angles must each equal 180\u00B0.",
    details: 'Math: \u03B1\u2081 + \u03B1\u2083 = \u03B1\u2082 + \u03B1\u2084 = 180\u00B0. If this fails, the paper will crumple or tear.',
  },
  {
    title: "4. Maekawa's Theorem & Vertex Type",
    desc: 'The fold direction rule. |M \u2212 V| must equal 2. Not all M/V arrangements are valid \u2014 the crimping algorithm checks layer ordering.',
    details: 'For 4 creases: 3M+1V or 1M+3V. The vertex type is the M/V sequence. Valid types pass the crimping test.',
  },
];

export function FoldabilityLab() {
  const [lines, setLines] = useState([45, 135, 225, 315]);
  const [step, setStep] = useState(0);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // --- Real theorem analysis ---
  const analysis = analyzeSingleVertex(lines);
  const sortedLines = [...lines].sort((a, b) => a - b);
  const sectors = analysis.sectorAngles;
  const isKawasakiValid = analysis.kawasakiSatisfied;
  const validAssignments = analysis.validAssignments;
  const currentAssignment = validAssignments.length > 0
    ? validAssignments[selectedAssignment % validAssignments.length]
    : null;

  // --- Interaction ---
  const handlePointerDown = (e: React.PointerEvent, index: number) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingIdx(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 500 / rect.width;
    const scaleY = 500 / rect.height;
    const x = (e.clientX - rect.left) * scaleX - CENTER.x;
    const y = (e.clientY - rect.top) * scaleY - CENTER.y;
    let angle = toDeg(Math.atan2(y, x));
    angle = normalizeAngle(angle);

    setLines(prev => {
      const next = [...prev];
      next[draggingIdx] = angle;
      return next;
    });
  };

  const handlePointerUp = () => {
    setDraggingIdx(null);
  };

  const snapToFoldable = () => {
    setLines([30, 150, 210, 330]);
    setSelectedAssignment(0);
  };

  const cycleAssignment = () => {
    if (validAssignments.length > 1) {
      setSelectedAssignment(prev => (prev + 1) % validAssignments.length);
    }
  };

  // Map from sorted line index to original index for dragging
  const sortedToOriginal = sortedLines.map(angle =>
    lines.findIndex(l => Math.abs(l - angle) < 0.001)
  );

  return (
    <div className="learn">
      <nav className="learn-breadcrumb">
        <Link to="/learn">Theory</Link>
        <span>/</span>
        <span>Foldability Lab</span>
      </nav>

      <header className="learn-header">
        <h1>Single Vertex Foldability Lab</h1>
        <p>
          Interactive visualization of Kawasaki&apos;s and Maekawa&apos;s theorems
          with real-time vertex type analysis and crimping validation.
        </p>
      </header>

      {/* Step Indicator */}
      <div className="lab-step-indicator">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`lab-step-dot ${i === step ? 'lab-step-dot-active' : ''}`}
          />
        ))}
      </div>

      <div className="lab-layout">
        {/* Left: SVG Visualization */}
        <div className="lab-canvas-panel">
          <div className="lab-status-badge">
            {isKawasakiValid ? (
              <span className="lab-badge lab-badge-valid">
                <CheckCircle size={16} /> Flat-Foldable
              </span>
            ) : (
              <span className="lab-badge lab-badge-invalid">
                <XCircle size={16} /> Not Flat-Foldable
              </span>
            )}
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 500 500"
            className="lab-svg"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Paper circle */}
            <circle
              cx={CENTER.x} cy={CENTER.y} r={RADIUS}
              fill="var(--color-surface)"
              stroke="var(--color-border)"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Sector wedges (step 1+) */}
            {step >= 1 && sectors.map((angle, i) => {
              const startAngle = sortedLines[i];
              const start = getLineCoords(startAngle, RADIUS * 0.35);
              const end = getLineCoords(startAngle + angle, RADIUS * 0.35);
              const largeArc = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${CENTER.x} ${CENTER.y}`,
                `L ${start.x} ${start.y}`,
                `A ${RADIUS * 0.35} ${RADIUS * 0.35} 0 ${largeArc} 1 ${end.x} ${end.y}`,
                'Z',
              ].join(' ');

              let fill: string;
              if (step >= 2) {
                fill = i % 2 === 0
                  ? 'rgba(99, 102, 241, 0.35)'
                  : 'rgba(244, 63, 94, 0.35)';
              } else {
                fill = i % 2 === 0
                  ? 'rgba(99, 102, 241, 0.2)'
                  : 'rgba(99, 102, 241, 0.1)';
              }

              const labelPos = getLineCoords(startAngle + angle / 2, RADIUS * 0.5);

              return (
                <g key={`sector-${i}`}>
                  <path d={pathData} fill={fill} stroke="none" />
                  {step >= 1 && (
                    <text
                      x={labelPos.x} y={labelPos.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="var(--color-text)"
                      fontSize="13" fontWeight="600"
                    >
                      {Math.round(angle)}&deg;
                    </text>
                  )}
                </g>
              );
            })}

            {/* Crease lines */}
            {sortedLines.map((angle, i) => {
              const pos = getLineCoords(angle);
              const originalIdx = sortedToOriginal[i];

              let strokeColor = 'var(--color-text-muted)';
              let strokeDash = '0';

              if (step === 3 && currentAssignment) {
                const isMountain = currentAssignment[i] === 'M';
                strokeColor = isMountain ? '#ef4444' : '#3b82f6';
                strokeDash = isMountain ? '10,5' : '5,3';
              }

              return (
                <g key={`line-${i}`}>
                  <line
                    x1={CENTER.x} y1={CENTER.y}
                    x2={pos.x} y2={pos.y}
                    stroke={strokeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={strokeDash}
                  />
                  <circle
                    cx={pos.x} cy={pos.y} r={HANDLE_RADIUS}
                    fill="var(--color-surface)"
                    stroke={draggingIdx === originalIdx ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                    strokeWidth="3"
                    className="lab-handle"
                    onPointerDown={(e) => handlePointerDown(e, originalIdx)}
                  />
                  {step === 3 && currentAssignment && (
                    <text
                      x={pos.x} y={pos.y - 20}
                      textAnchor="middle"
                      fill={currentAssignment[i] === 'M' ? '#ef4444' : '#3b82f6'}
                      fontSize="14" fontWeight="700"
                    >
                      {currentAssignment[i]}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center vertex */}
            <circle cx={CENTER.x} cy={CENTER.y} r="6" fill="var(--color-text)" />
          </svg>

          <div className="lab-canvas-footer">
            <button className="lab-reset-btn" onClick={snapToFoldable}>
              <RefreshCw size={16} /> Reset
            </button>
            <span className="lab-hint">Drag handles to adjust angles</span>
          </div>
        </div>

        {/* Right: Educational Panel */}
        <div className="lab-info-panel">
          <div className="lab-info-card">
            <div className="lab-info-icon">
              {step === 0 && <PenTool size={20} />}
              {step === 1 && <Calculator size={20} />}
              {step === 2 && <Info size={20} />}
              {step === 3 && <CheckCircle size={20} />}
              <span>Step {step + 1} of {STEPS.length}</span>
            </div>

            <h2>{STEPS[step].title}</h2>
            <p className="lab-info-desc">{STEPS[step].desc}</p>

            <div className="lab-insight">
              <h4>Technical Insight</h4>
              <p>{STEPS[step].details}</p>
            </div>

            {/* Live Stats (step 2+) */}
            {step >= 2 && (
              <div className="lab-stats">
                <div className="lab-stat-row">
                  <span className="lab-stat-label" style={{ color: 'rgb(99, 102, 241)' }}>
                    Sum (even \u03B1):
                  </span>
                  <span className="lab-stat-value">
                    {Math.round(analysis.sumEven)}&deg;
                  </span>
                </div>
                <div className="lab-stat-row">
                  <span className="lab-stat-label" style={{ color: 'rgb(244, 63, 94)' }}>
                    Sum (odd \u03B1):
                  </span>
                  <span className="lab-stat-value">
                    {Math.round(analysis.sumOdd)}&deg;
                  </span>
                </div>
                <div className="lab-stat-row lab-stat-divider">
                  <span className="lab-stat-label">Kawasaki error:</span>
                  <span className={`lab-stat-value ${isKawasakiValid ? 'lab-stat-valid' : 'lab-stat-invalid'}`}>
                    {analysis.kawasakiError.toFixed(1)}&deg;
                  </span>
                </div>
              </div>
            )}

            {/* Vertex type info (step 3) */}
            {step >= 3 && (
              <div className="lab-stats">
                <div className="lab-stat-row">
                  <span className="lab-stat-label">Maekawa candidates:</span>
                  <span className="lab-stat-value">{analysis.totalMaekawaAssignments}</span>
                </div>
                <div className="lab-stat-row">
                  <span className="lab-stat-label">Valid (crimping):</span>
                  <span className={`lab-stat-value ${analysis.totalValidAssignments > 0 ? 'lab-stat-valid' : 'lab-stat-invalid'}`}>
                    {analysis.totalValidAssignments}
                  </span>
                </div>
                {currentAssignment && (
                  <div className="lab-stat-row">
                    <span className="lab-stat-label">Current type:</span>
                    <span className="lab-stat-value lab-type-badge">
                      [{currentAssignment.join('')}]
                    </span>
                  </div>
                )}
                {validAssignments.length > 1 && (
                  <button className="lab-cycle-btn" onClick={cycleAssignment}>
                    Cycle assignment ({(selectedAssignment % validAssignments.length) + 1}/{validAssignments.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="lab-nav">
            <button
              className="lab-nav-btn lab-nav-prev"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            <button
              className="lab-nav-btn lab-nav-next"
              onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
              disabled={step === STEPS.length - 1}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
