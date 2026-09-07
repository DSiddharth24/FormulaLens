import React, { useMemo } from 'react';
import { ComparisonState } from '../types';
import katex from 'katex';
import { GitCompare } from 'lucide-react';

interface ComparisonPanelProps {
  comparisonState: ComparisonState;
  onChangeComparisonState: (updater: (prev: ComparisonState) => ComparisonState) => void;
  primaryExpression: string;
  maxResidual: number | null;
  rmsError: number | null;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  comparisonState,
  onChangeComparisonState,
  maxResidual,
  rmsError,
}) => {
  const { expression, label } = comparisonState;

  const renderedLatex = useMemo(() => {
    try {
      return katex.renderToString(`g(x) = ${expression}`, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `g(x) = ${expression}`;
    }
  }, [expression]);

  return (
    <section className="mb-6 rounded border border-[#A63D40]/30 bg-[#FAF9F5] p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[#A63D40] uppercase tracking-wider flex items-center gap-1.5">
          <GitCompare className="w-3.5 h-3.5 text-[#A63D40]" />
          <span>Function Comparison</span>
        </h3>
        <span className="text-[11px] text-[#575E66]">{label || 'Secondary curve'}</span>
      </div>

      <div className="mb-3">
        <label htmlFor="comp-input" className="block text-xs font-medium text-[#1C1D21] mb-1">
          Secondary Formula <span className="font-serif italic text-[#A63D40]">g(x)</span>:
        </label>
        <input
          id="comp-input"
          type="text"
          value={expression}
          onChange={(e) =>
            onChangeComparisonState((prev) => ({
              ...prev,
              expression: e.target.value,
            }))
          }
          placeholder="e.g. x - x^3/6 + x^5/120"
          className="w-full rounded border border-[#C9D6D9] bg-white px-2.5 py-1.5 font-mono text-xs text-[#1C1D21] focus:border-[#A63D40] focus:outline-hidden"
        />
      </div>

      {/* Rendered formula */}
      <div className="rounded border border-[#D8DFE2] bg-white p-2 mb-3 text-center overflow-x-auto">
        <div
          className="text-xs font-serif text-[#1C1D21]"
          dangerouslySetInnerHTML={{ __html: renderedLatex }}
        />
      </div>

      {/* Legend & Error Metrics */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-1.5 rounded bg-white border border-[#D8DFE2]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#2E5F4E] rounded"></span>
            <span className="font-medium text-[#1C1D21]">Primary f(x)</span>
          </div>
          <span className="text-[11px] text-[#575E66]">Base Function</span>
        </div>

        <div className="flex items-center justify-between p-1.5 rounded bg-white border border-[#D8DFE2]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#A63D40] rounded"></span>
            <span className="font-medium text-[#1C1D21]">Secondary g(x)</span>
          </div>
          <span className="text-[11px] text-[#575E66]">Approximation</span>
        </div>

        {/* Residual / Convergence readouts */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="rounded border border-[#D8DFE2] bg-white p-2 text-center">
            <div className="text-[10px] text-[#575E66]">Max Residual |f - g|</div>
            <div className="font-mono text-xs font-semibold text-[#1C1D21]">
              {maxResidual !== null ? maxResidual.toFixed(4) : 'N/A'}
            </div>
          </div>
          <div className="rounded border border-[#D8DFE2] bg-white p-2 text-center">
            <div className="text-[10px] text-[#575E66]">RMS Error</div>
            <div className="font-mono text-xs font-semibold text-[#A63D40]">
              {rmsError !== null ? rmsError.toFixed(4) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
