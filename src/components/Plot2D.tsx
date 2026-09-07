import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { CalculusState } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';

interface Plot2DProps {
  primaryData: { x: number[]; y: (number | null)[] };
  secondaryData?: { x: number[]; y: (number | null)[] } | null;
  calculusState?: CalculusState;
  onUpdateX0?: (newX0: number) => void;
  tangentSlope?: number | null;
  tangentY0?: number | null;
  xRangeDefault: [number, number];
  yRangeDefault?: [number, number];
  formulaKey: string; // changes when a new formula preset is picked to trigger sketch animation
}

export const Plot2D: React.FC<Plot2DProps> = ({
  primaryData,
  secondaryData,
  calculusState,
  onUpdateX0,
  tangentSlope,
  tangentY0,
  xRangeDefault,
  yRangeDefault = [-5, 5],
  formulaKey,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });
  const [viewX, setViewX] = useState<[number, number]>(xRangeDefault);
  const [viewY, setViewY] = useState<[number, number]>(yRangeDefault);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingX0, setIsDraggingX0] = useState(false);
  const [hasSketched, setHasSketched] = useState(false);

  // ResizeObserver for true responsive sizing
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

  // When formulaKey changes (e.g. preset picked), trigger the sketch animation once
  useEffect(() => {
    setViewX(xRangeDefault);
    setViewY(yRangeDefault);
    setHasSketched(false);
    const timer = setTimeout(() => setHasSketched(true), 950);
    return () => clearTimeout(timer);
  }, [formulaKey, xRangeDefault[0], xRangeDefault[1], yRangeDefault[0], yRangeDefault[1]]);

  // Coordinate transforms
  const margin = { top: 24, right: 32, bottom: 36, left: 48 };
  const plotWidth = Math.max(100, dimensions.width - margin.left - margin.right);
  const plotHeight = Math.max(100, dimensions.height - margin.top - margin.bottom);

  const xToPx = useCallback(
    (x: number) => {
      const [xMin, xMax] = viewX;
      return margin.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    },
    [viewX, margin.left, plotWidth]
  );

  const yToPx = useCallback(
    (y: number) => {
      const [yMin, yMax] = viewY;
      return margin.top + ((yMax - y) / (yMax - yMin)) * plotHeight;
    },
    [viewY, margin.top, plotHeight]
  );

  const pxToX = useCallback(
    (px: number) => {
      const [xMin, xMax] = viewX;
      return xMin + ((px - margin.left) / plotWidth) * (xMax - xMin);
    },
    [viewX, margin.left, plotWidth]
  );

  const pxToY = useCallback(
    (py: number) => {
      const [yMin, yMax] = viewY;
      return yMax - ((py - margin.top) / plotHeight) * (yMax - yMin);
    },
    [viewY, margin.top, plotHeight]
  );

  // Grid lines calculation
  const gridTicks = useMemo(() => {
    const [xMin, xMax] = viewX;
    const [yMin, yMax] = viewY;

    // Pick nice step size
    const getStep = (min: number, max: number, targetCount = 10) => {
      const range = max - min;
      const rawStep = range / targetCount;
      const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const norm = rawStep / mag;
      let step = mag;
      if (norm > 5) step = 5 * mag;
      else if (norm > 2) step = 2 * mag;
      return step || 1;
    };

    const xStep = getStep(xMin, xMax, Math.max(5, Math.floor(plotWidth / 80)));
    const yStep = getStep(yMin, yMax, Math.max(5, Math.floor(plotHeight / 60)));

    const xTicks: number[] = [];
    const firstX = Math.ceil(xMin / xStep) * xStep;
    for (let x = firstX; x <= xMax; x += xStep) {
      xTicks.push(Number(x.toFixed(4)));
    }

    const yTicks: number[] = [];
    const firstY = Math.ceil(yMin / yStep) * yStep;
    for (let y = firstY; y <= yMax; y += yStep) {
      yTicks.push(Number(y.toFixed(4)));
    }

    return { xTicks, yTicks, xStep, yStep };
  }, [viewX, viewY, plotWidth, plotHeight]);

  // Convert array of points to SVG path with asymptote breaks (nulls)
  const createSvgPath = useCallback(
    (data: { x: number[]; y: (number | null)[] }) => {
      let pathStr = '';
      let inSegment = false;

      for (let i = 0; i < data.x.length; i++) {
        const x = data.x[i];
        const y = data.y[i];

        if (y === null || Number.isNaN(y) || !Number.isFinite(y)) {
          inSegment = false;
          continue;
        }

        const px = xToPx(x);
        const py = yToPx(y);

        // Clip to generous bounds
        const isOutOfBounds = py < margin.top - 200 || py > dimensions.height + 200;
        if (isOutOfBounds) {
          inSegment = false;
          continue;
        }

        if (!inSegment) {
          pathStr += ` M ${px.toFixed(2)} ${py.toFixed(2)}`;
          inSegment = true;
        } else {
          pathStr += ` L ${px.toFixed(2)} ${py.toFixed(2)}`;
        }
      }

      return pathStr;
    },
    [xToPx, yToPx, margin.top, dimensions.height]
  );

  const primaryPath = useMemo(() => createSvgPath(primaryData), [primaryData, createSvgPath]);
  const secondaryPath = useMemo(
    () => (secondaryData ? createSvgPath(secondaryData) : null),
    [secondaryData, createSvgPath]
  );

  // Tangent line path
  const tangentPath = useMemo(() => {
    if (
      !calculusState?.enabled ||
      !calculusState.showTangent ||
      tangentSlope === null ||
      tangentSlope === undefined ||
      tangentY0 === null ||
      tangentY0 === undefined
    ) {
      return null;
    }
    const [xMin, xMax] = viewX;
    const x0 = calculusState.x0;
    const m = tangentSlope;
    const y0 = tangentY0;

    const yStart = m * (xMin - x0) + y0;
    const yEnd = m * (xMax - x0) + y0;

    const p1x = xToPx(xMin);
    const p1y = yToPx(yStart);
    const p2x = xToPx(xMax);
    const p2y = yToPx(yEnd);

    return `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)}`;
  }, [calculusState, tangentSlope, tangentY0, viewX, xToPx, yToPx]);

  // Zoom controls
  const handleZoom = (factor: number) => {
    setViewX(([min, max]) => {
      const center = (min + max) / 2;
      const span = (max - min) * factor;
      return [center - span / 2, center + span / 2];
    });
    setViewY(([min, max]) => {
      const center = (min + max) / 2;
      const span = (max - min) * factor;
      return [center - span / 2, center + span / 2];
    });
  };

  const handleResetZoom = () => {
    setViewX(xRangeDefault);
    setViewY(yRangeDefault);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.12 : 0.88;
    handleZoom(factor);
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      if (
        mouseX >= margin.left &&
        mouseX <= dimensions.width - margin.right &&
        mouseY >= margin.top &&
        mouseY <= dimensions.height - margin.bottom
      ) {
        setHoverCoord({
          x: pxToX(mouseX),
          y: pxToY(mouseY),
        });
      } else {
        setHoverCoord(null);
      }
    }

    // Dragging x0 in calculus mode
    if (isDraggingX0 && onUpdateX0) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const newX = pxToX(mouseX);
        onUpdateX0(Number(newX.toFixed(2)));
      }
      return;
    }

    // Panning
    if (!isPanning || !panStart) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    setPanStart({ x: e.clientX, y: e.clientY });

    const [xMin, xMax] = viewX;
    const [yMin, yMax] = viewY;
    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;

    const xShift = (dx / plotWidth) * xSpan;
    const yShift = (dy / plotHeight) * ySpan;

    setViewX([xMin - xShift, xMax - xShift]);
    setViewY([yMin + yShift, yMax + yShift]);
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
    setIsDraggingX0(false);
  };

  // Axes zero coordinates
  const zeroX = xToPx(0);
  const zeroY = yToPx(0);
  const isZeroXVisible = zeroX >= margin.left && zeroX <= dimensions.width - margin.right;
  const isZeroYVisible = zeroY >= margin.top && zeroY <= dimensions.height - margin.bottom;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[460px] sm:min-h-[580px] bg-[#F7F6F2] border border-[#D8DFE2] rounded select-none overflow-hidden flex flex-col shadow-xs"
    >
      {/* Drafting Header Bar */}
      <div className="flex items-center justify-between border-b border-[#D8DFE2] bg-[#FAF9F5] px-4 py-2 text-xs text-[#575E66]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2E5F4E]"></span>
            <span className="font-medium text-[#1C1D21]">f(x) Active Plot</span>
          </div>

          {secondaryData && (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A63D40]"></span>
              <span className="font-medium text-[#A63D40]">g(x) Comparison</span>
            </div>
          )}

          {calculusState?.enabled && calculusState.showTangent && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#1C1D21]"></span>
              <span className="font-medium text-[#1C1D21]">Tangent at x₀</span>
            </div>
          )}
        </div>

        {/* Live Coordinate Crosshairs & Range indicator */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {hoverCoord ? (
            <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-white border border-[#D8DFE2] text-[#1C1D21]">
              <Crosshair className="w-3 h-3 text-[#575E66]" />
              <span>
                ({hoverCoord.x >= 0 ? '+' : ''}{hoverCoord.x.toFixed(2)}, {hoverCoord.y >= 0 ? '+' : ''}{hoverCoord.y.toFixed(2)})
              </span>
            </div>
          ) : (
            <span className="text-[#87929D] hidden sm:inline">
              Hover to read coordinates
            </span>
          )}

          {/* Canvas Navigation Tools */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleZoom(0.8)}
              className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21] hover:bg-[#EFECE6] transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(1.25)}
              className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21] hover:bg-[#EFECE6] transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded border border-[#D8DFE2] bg-white text-[#575E66] hover:text-[#1C1D21] hover:bg-[#EFECE6] transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas with Notebook Math Drafting Grid */}
      <div className="relative flex-1 w-full h-full cursor-crosshair">
        <svg
          width={dimensions.width}
          height={dimensions.height - 38}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoverCoord(null);
          }}
          className="w-full h-full block"
        >
          <defs>
            {/* Fine graph paper grid pattern */}
            <pattern
              id="millimeter-grid"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="#C9D6D9"
                strokeWidth="0.5"
                opacity="0.55"
              />
            </pattern>

            {/* Clipping path for inner plot boundary */}
            <clipPath id="plot-clip">
              <rect
                x={margin.left}
                y={margin.top}
                width={plotWidth}
                height={plotHeight}
              />
            </clipPath>
          </defs>

          {/* Background Graph Paper */}
          <rect
            x={0}
            y={0}
            width={dimensions.width}
            height={dimensions.height}
            fill="#F7F6F2"
          />
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="url(#millimeter-grid)"
          />

          {/* Major Grid Lines (xTicks & yTicks) */}
          <g className="grid-lines" opacity="0.8">
            {gridTicks.xTicks.map((xVal) => {
              const px = xToPx(xVal);
              if (px < margin.left || px > dimensions.width - margin.right) return null;
              return (
                <line
                  key={`gx-${xVal}`}
                  x1={px}
                  y1={margin.top}
                  x2={px}
                  y2={dimensions.height - margin.bottom}
                  stroke="#C9D6D9"
                  strokeWidth="1"
                />
              );
            })}

            {gridTicks.yTicks.map((yVal) => {
              const py = yToPx(yVal);
              if (py < margin.top || py > dimensions.height - margin.bottom) return null;
              return (
                <line
                  key={`gy-${yVal}`}
                  x1={margin.left}
                  y1={py}
                  x2={dimensions.width - margin.right}
                  y2={py}
                  stroke="#C9D6D9"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Primary Coordinate Axes */}
          <g className="axes">
            {/* X Axis line (y = 0) */}
            {isZeroYVisible ? (
              <line
                x1={margin.left}
                y1={zeroY}
                x2={dimensions.width - margin.right}
                y2={zeroY}
                stroke="#1C1D21"
                strokeWidth="1.5"
              />
            ) : (
              <line
                x1={margin.left}
                y1={dimensions.height - margin.bottom}
                x2={dimensions.width - margin.right}
                y2={dimensions.height - margin.bottom}
                stroke="#9EB0B5"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            )}

            {/* Y Axis line (x = 0) */}
            {isZeroXVisible ? (
              <line
                x1={zeroX}
                y1={margin.top}
                x2={zeroX}
                y2={dimensions.height - margin.bottom}
                stroke="#1C1D21"
                strokeWidth="1.5"
              />
            ) : (
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={dimensions.height - margin.bottom}
                stroke="#9EB0B5"
                strokeWidth="1"
                strokeDasharray="4 3"
              />
            )}
          </g>

          {/* Axis Labels & Ticks */}
          <g className="tick-labels" fontSize="10" fontFamily="Inter, monospace" fill="#575E66">
            {gridTicks.xTicks.map((xVal) => {
              const px = xToPx(xVal);
              if (px < margin.left + 10 || px > dimensions.width - margin.right - 10) return null;
              const py = isZeroYVisible
                ? Math.min(dimensions.height - margin.bottom - 4, Math.max(margin.top + 14, zeroY + 14))
                : dimensions.height - margin.bottom + 14;
              return (
                <text key={`tx-${xVal}`} x={px} y={py} textAnchor="middle">
                  {xVal}
                </text>
              );
            })}

            {gridTicks.yTicks.map((yVal) => {
              if (yVal === 0) return null; // Avoid overlapping origin
              const py = yToPx(yVal);
              if (py < margin.top + 10 || py > dimensions.height - margin.bottom - 10) return null;
              const px = isZeroXVisible
                ? Math.max(margin.left + 4, Math.min(dimensions.width - margin.right - 20, zeroX - 6))
                : margin.left - 6;
              return (
                <text key={`ty-${yVal}`} x={px} y={py + 3} textAnchor="end">
                  {yVal}
                </text>
              );
            })}

            {/* Axis Letter Indicators */}
            <text
              x={dimensions.width - margin.right + 14}
              y={isZeroYVisible ? zeroY + 4 : dimensions.height - margin.bottom + 4}
              fontSize="12"
              fontFamily="Fraunces, Georgia, serif"
              fontStyle="italic"
              fill="#1C1D21"
              fontWeight="bold"
            >
              x
            </text>
            <text
              x={isZeroXVisible ? zeroX - 4 : margin.left - 4}
              y={margin.top - 8}
              textAnchor="end"
              fontSize="12"
              fontFamily="Fraunces, Georgia, serif"
              fontStyle="italic"
              fill="#1C1D21"
              fontWeight="bold"
            >
              y
            </text>
          </g>

          {/* Clipped Data Curves */}
          <g clipPath="url(#plot-clip)">
            {/* Secondary Comparison Function g(x) in --accent-secondary (#A63D40) */}
            {secondaryPath && (
              <path
                d={secondaryPath}
                fill="none"
                stroke="#A63D40"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                opacity="0.9"
              />
            )}

            {/* Primary Plotted Function f(x) in --accent-curve (#2E5F4E) */}
            {/* Signature motion moment: when a formula is first selected, curve draws itself along path */}
            {primaryPath && (
              <path
                key={formulaKey}
                d={primaryPath}
                fill="none"
                stroke="#2E5F4E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={!hasSketched ? 'sketch-animation' : ''}
              />
            )}

            {/* Tangent Line in Calculus Mode */}
            {tangentPath && (
              <path
                d={tangentPath}
                fill="none"
                stroke="#1C1D21"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.85"
              />
            )}

            {/* Draggable Tangent Point on Curve (x0, f(x0)) */}
            {calculusState?.enabled && tangentY0 !== null && tangentY0 !== undefined && (
              <g
                className="cursor-ew-resize group"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingX0(true);
                }}
              >
                {/* Vertical drop line to x-axis */}
                <line
                  x1={xToPx(calculusState.x0)}
                  y1={yToPx(tangentY0)}
                  x2={xToPx(calculusState.x0)}
                  y2={isZeroYVisible ? zeroY : dimensions.height - margin.bottom}
                  stroke="#575E66"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />

                {/* Point on x-axis */}
                <circle
                  cx={xToPx(calculusState.x0)}
                  cy={isZeroYVisible ? zeroY : dimensions.height - margin.bottom}
                  r={4}
                  fill="#1C1D21"
                />

                {/* Evaluation Point on Function Curve */}
                <circle
                  cx={xToPx(calculusState.x0)}
                  cy={yToPx(tangentY0)}
                  r={6}
                  fill="#2E5F4E"
                  stroke="#F7F6F2"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125"
                />

                {/* Live Point Tag */}
                <text
                  x={xToPx(calculusState.x0) + 8}
                  y={yToPx(tangentY0) - 8}
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fill="#1C1D21"
                  className="select-none bg-white"
                >
                  ({calculusState.x0.toFixed(2)}, {tangentY0.toFixed(2)})
                </text>
              </g>
            )}
          </g>

          {/* Outer drafting border */}
          <rect
            x={margin.left}
            y={margin.top}
            width={plotWidth}
            height={plotHeight}
            fill="none"
            stroke="#D8DFE2"
            strokeWidth="1"
          />
        </svg>

        {/* Quiet Chalkboard/Domain note if values contain discontinuity */}
        {primaryData.y.includes(null) && (
          <div className="absolute bottom-2 left-4 bg-white/90 border border-[#B8860B]/40 rounded px-2.5 py-1 text-[11px] text-[#7A5800] flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B8860B]"></span>
            <span>Singularity / undefined region detected — continuous curve breaks past asymptote.</span>
          </div>
        )}
      </div>
    </div>
  );
};
