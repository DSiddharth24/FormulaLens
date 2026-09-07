import React, { useState, useRef, useEffect } from 'react';
import { MatrixState } from '../types';
import katex from 'katex';
import { RotateCcw } from 'lucide-react';

interface MatrixTransformVisualizerProps {
  matrix: MatrixState;
  onChangeMatrix: (matrix: MatrixState) => void;
}

export const MatrixTransformVisualizer: React.FC<MatrixTransformVisualizerProps> = ({
  matrix,
  onChangeMatrix,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 500 });
  const [zoom, setZoom] = useState(45); // pixels per math unit

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 50 && height > 50) {
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { a, b, c, d } = matrix;
  const det = a * d - b * c;

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const toPx = (x: number, y: number) => ({
    px: centerX + x * zoom,
    py: centerY - y * zoom,
  });

  // Transformed unit basis vectors
  const pOrigin = toPx(0, 0);
  const pI = toPx(a, c);
  const pJ = toPx(b, d);
  const pCorner = toPx(a + b, c + d);

  // Parallelogram path
  const parallelogramPath = `M ${pOrigin.px} ${pOrigin.py} L ${pI.px} ${pI.py} L ${pCorner.px} ${pCorner.py} L ${pJ.px} ${pJ.py} Z`;

  // Grid lines: -5 to +5 in units
  const gridLines = [];
  const span = 6;

  // Unwarped faint background grid
  const unwarpedLines = [];
  for (let u = -span; u <= span; u++) {
    const startX = toPx(u, -span);
    const endX = toPx(u, span);
    unwarpedLines.push(
      <line
        key={`unw-v-${u}`}
        x1={startX.px}
        y1={startX.py}
        x2={endX.px}
        y2={endX.py}
        stroke="#E0E6E8"
        strokeWidth="0.75"
      />
    );
    const startY = toPx(-span, u);
    const endY = toPx(span, u);
    unwarpedLines.push(
      <line
        key={`unw-h-${u}`}
        x1={startY.px}
        y1={startY.py}
        x2={endY.px}
        y2={endY.py}
        stroke="#E0E6E8"
        strokeWidth="0.75"
      />
    );
  }

  // Warped transformed grid lines
  for (let u = -span; u <= span; u++) {
    // line where x = u, y goes from -span to span
    const startPt = toPx(a * u - b * span, c * u - d * span);
    const endPt = toPx(a * u + b * span, c * u + d * span);
    gridLines.push(
      <line
        key={`warp-v-${u}`}
        x1={startPt.px}
        y1={startPt.py}
        x2={endPt.px}
        y2={endPt.py}
        stroke={u === 0 ? '#1C1D21' : '#C9D6D9'}
        strokeWidth={u === 0 ? 1.5 : 1}
        strokeOpacity={u === 0 ? 0.9 : 0.65}
      />
    );

    // line where y = u, x goes from -span to span
    const startPtH = toPx(-a * span + b * u, -c * span + d * u);
    const endPtH = toPx(a * span + b * u, c * span + d * u);
    gridLines.push(
      <line
        key={`warp-h-${u}`}
        x1={startPtH.px}
        y1={startPtH.py}
        x2={endPtH.px}
        y2={endPtH.py}
        stroke={u === 0 ? '#1C1D21' : '#C9D6D9'}
        strokeWidth={u === 0 ? 1.5 : 1}
        strokeOpacity={u === 0 ? 0.9 : 0.65}
      />
    );
  }

  // Preset transformations
  const applyTransform = (newA: number, newB: number, newC: number, newD: number) => {
    onChangeMatrix({ a: newA, b: newB, c: newC, d: newD });
  };

  let matrixLatex = '';
  try {
    matrixLatex = katex.renderToString(
      `A = \\begin{pmatrix} ${a.toFixed(2)} & ${b.toFixed(2)} \\\\ ${c.toFixed(2)} & ${d.toFixed(2)} \\end{pmatrix}`,
      { throwOnError: false }
    );
  } catch {
    matrixLatex = `[${a}, ${b}; ${c}, ${d}]`;
  }

  return (
    <div className="flex flex-col h-full min-h-[460px] sm:min-h-[580px] bg-[#F7F6F2] border border-[#D8DFE2] rounded select-none overflow-hidden shadow-xs">
      {/* Top status bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#D8DFE2] bg-[#FAF9F5] px-4 py-2 text-xs text-[#575E66]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#1C1D21]">2D Linear Matrix Grid Transform</span>
          <span
            className="text-xs font-serif"
            dangerouslySetInnerHTML={{ __html: matrixLatex }}
          />
        </div>

        {/* Determinant badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-white border border-[#D8DFE2] text-[#1C1D21]">
            det(A) = {det.toFixed(3)}
          </span>
          <span className="text-[11px] text-[#575E66] hidden md:inline">
            {det === 0
              ? '(Rank collapse: 1D degenerate)'
              : det < 0
              ? '(Orientation inverted / reflection)'
              : '(Orientation preserved)'}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative flex-1 w-full h-full bg-[#F7F6F2]">
        <svg
          width={dimensions.width}
          height={dimensions.height - 48}
          className="w-full h-full block"
        >
          <defs>
            {/* Arrow marker for î */}
            <marker
              id="arrow-i"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2E5F4E" />
            </marker>

            {/* Arrow marker for ĵ */}
            <marker
              id="arrow-j"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#A63D40" />
            </marker>
          </defs>

          {/* Unwarped grid */}
          <g className="unwarped">{unwarpedLines}</g>

          {/* Warped transformed grid */}
          <g className="warped">{gridLines}</g>

          {/* Transformed Unit Area (Parallelogram) */}
          <path
            d={parallelogramPath}
            fill="#2E5F4E"
            fillOpacity="0.15"
            stroke="#2E5F4E"
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />

          {/* Standard Cartesian Origin Axes */}
          <line
            x1={0}
            y1={centerY}
            x2={dimensions.width}
            y2={centerY}
            stroke="#87929D"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={dimensions.height}
            stroke="#87929D"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Basis Vector î = (a, c) */}
          <line
            x1={pOrigin.px}
            y1={pOrigin.py}
            x2={pI.px}
            y2={pI.py}
            stroke="#2E5F4E"
            strokeWidth="3"
            markerEnd="url(#arrow-i)"
          />
          <text
            x={pI.px + 8}
            y={pI.py - 6}
            fontSize="12"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontWeight="bold"
            fill="#2E5F4E"
          >
            T(î) = ({a.toFixed(1)}, {c.toFixed(1)})
          </text>

          {/* Basis Vector ĵ = (b, d) */}
          <line
            x1={pOrigin.px}
            y1={pOrigin.py}
            x2={pJ.px}
            y2={pJ.py}
            stroke="#A63D40"
            strokeWidth="3"
            markerEnd="url(#arrow-j)"
          />
          <text
            x={pJ.px + 8}
            y={pJ.py - 6}
            fontSize="12"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontWeight="bold"
            fill="#A63D40"
          >
            T(ĵ) = ({b.toFixed(1)}, {d.toFixed(1)})
          </text>

          {/* Origin dot */}
          <circle cx={centerX} cy={centerY} r={3.5} fill="#1C1D21" />
        </svg>

        {/* Quick Transformation Presets Bar */}
        <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-xs border border-[#D8DFE2] rounded px-3 py-2 text-xs shadow-xs">
          <span className="font-medium text-[#575E66] mr-1">Presets:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyTransform(1, 0, 0, 1)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              Identity
            </button>
            <button
              type="button"
              onClick={() => applyTransform(0, -1, 1, 0)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              90° Rotation
            </button>
            <button
              type="button"
              onClick={() => applyTransform(1, 1, 0, 1)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              Shear X
            </button>
            <button
              type="button"
              onClick={() => applyTransform(1, 0, 1, 1)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              Shear Y
            </button>
            <button
              type="button"
              onClick={() => applyTransform(-1, 0, 0, 1)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              Reflection
            </button>
            <button
              type="button"
              onClick={() => applyTransform(0.5, 0.5, 0.5, 0.5)}
              className="px-2 py-0.5 rounded border border-[#D8DFE2] bg-white hover:bg-[#F0EFEB] text-[#1C1D21]"
            >
              Singular (det=0)
            </button>
          </div>

          <button
            type="button"
            onClick={() => applyTransform(1, 0, 0, 1)}
            className="p-1 text-[#575E66] hover:text-[#1C1D21]"
            title="Reset to Identity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
