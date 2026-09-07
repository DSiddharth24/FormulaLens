import React from 'react';
import { CalculusState } from '../types';
import katex from 'katex';
import { Compass } from 'lucide-react';

interface CalculusPanelProps {
  calculusState: CalculusState;
  onChangeCalculusState: (updater: (prev: CalculusState) => CalculusState) => void;
  xRange: [number, number];
  currentY0: number | null;
  currentSlope: number | null;
}

export const CalculusPanel: React.FC<CalculusPanelProps> = ({
  calculusState,
  onChangeCalculusState,
  xRange,
  currentY0,
  currentSlope,
}) => {
  const { x0, showTangent, showSecant, secantDx } = calculusState;

  // Render tangent equation in LaTeX
  let tangentLatex = 'y = f\'(x_0)(x - x_0) + f(x_0)';
  if (currentSlope !== null && currentY0 !== null) {
    const mStr = currentSlope.toFixed(3);
    const x0Str = x0 >= 0 ? `- ${x0.toFixed(2)}` : `+ ${Math.abs(x0).toFixed(2)}`;
    const y0Str = currentY0 >= 0 ? `+ ${currentY0.toFixed(2)}` : `- ${Math.abs(currentY0).toFixed(2)}`;
    tangentLatex = `y = ${mStr}(x ${x0Str}) ${y0Str}`;
  }

  let renderedTangentLatex = '';
  try {
    renderedTangentLatex = katex.renderToString(tangentLatex, { throwOnError: false });
  } catch {
    renderedTangentLatex = tangentLatex;
  }

  return (
    <section className="mb-6 rounded border border-[#2E5F4E]/30 bg-[#FAF9F5] p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[#2E5F4E] uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#2E5F4E]" />
          <span>Calculus Analysis</span>
        </h3>
        <span className="text-[11px] text-[#575E66]">
          Tangent & Derivative
        </span>
      </div>

      {/* Point x0 Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-medium text-[#1C1D21]">
            Evaluation Point <span className="font-serif italic font-bold">x₀</span>:
          </span>
          <span className="font-mono font-semibold text-[#1C1D21]">
            {x0.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={xRange[0]}
          max={xRange[1]}
          step={0.05}
          value={x0}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChangeCalculusState((prev) => ({ ...prev, x0: val }));
          }}
          className="w-full cursor-ew-resize"
          aria-label="Evaluation point x0"
        />
      </div>

      {/* Numerical Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded border border-[#D8DFE2] bg-white p-2 text-center">
          <div className="text-[11px] text-[#575E66] mb-0.5">Value f(x₀)</div>
          <div className="font-mono text-sm font-semibold text-[#1C1D21]">
            {currentY0 !== null ? currentY0.toFixed(4) : 'undefined'}
          </div>
        </div>

        <div className="rounded border border-[#D8DFE2] bg-white p-2 text-center">
          <div className="text-[11px] text-[#575E66] mb-0.5">Slope f'(x₀)</div>
          <div className="font-mono text-sm font-semibold text-[#2E5F4E]">
            {currentSlope !== null ? currentSlope.toFixed(4) : 'undefined'}
          </div>
        </div>
      </div>

      {/* Tangent line equation */}
      <div className="rounded border border-[#D8DFE2] bg-white p-2.5 mb-3 text-center overflow-x-auto">
        <div className="text-[10px] uppercase tracking-wider text-[#87929D] mb-1">
          Instantaneous Tangent Line Equation
        </div>
        <div
          className="text-xs font-serif text-[#1C1D21]"
          dangerouslySetInnerHTML={{ __html: renderedTangentLatex }}
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 text-xs">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTangent}
            onChange={(e) =>
              onChangeCalculusState((prev) => ({ ...prev, showTangent: e.target.checked }))
            }
            className="rounded border-[#C9D6D9] text-[#2E5F4E] focus:ring-[#2E5F4E]"
          />
          <span className="text-[#1C1D21]">Show tangent line on plot</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showSecant}
            onChange={(e) =>
              onChangeCalculusState((prev) => ({ ...prev, showSecant: e.target.checked }))
            }
            className="rounded border-[#C9D6D9] text-[#2E5F4E] focus:ring-[#2E5F4E]"
          />
          <span className="text-[#1C1D21]">Show secant line (Δx approximation)</span>
        </label>

        {showSecant && (
          <div className="mt-1 pl-5">
            <div className="flex justify-between text-[11px] text-[#575E66] mb-1">
              <span>Secant step Δx:</span>
              <span className="font-mono font-semibold">{secantDx.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={2.0}
              step={0.05}
              value={secantDx}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onChangeCalculusState((prev) => ({ ...prev, secantDx: val }));
              }}
              className="w-full"
            />
          </div>
        )}
      </div>
    </section>
  );
};
