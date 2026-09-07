import React, { useMemo, useState } from 'react';
import katex from 'katex';
import { AlertCircle, Edit3, Check, Sparkles } from 'lucide-react';

interface FormulaHeroProps {
  expression: string;
  latex: string;
  error: string | null;
  onChangeExpression: (newExpr: string) => void;
  presetName?: string;
  selectedTerm?: string | null;
  onSelectTerm?: (term: string | null) => void;
}

export const FormulaHero: React.FC<FormulaHeroProps> = ({
  expression,
  latex,
  error,
  onChangeExpression,
  presetName,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempExpr, setTempExpr] = useState(expression);

  // Sync tempExpr if external expression changes and not actively editing
  React.useEffect(() => {
    if (!isEditing) {
      setTempExpr(expression);
    }
  }, [expression, isEditing]);

  const renderedLatex = useMemo(() => {
    try {
      const latexToRender = latex || expression;
      return katex.renderToString(latexToRender, {
        displayMode: true,
        throwOnError: false,
      });
    } catch {
      return `<span class="text-sm text-[#575E66]">${expression}</span>`;
    }
  }, [latex, expression]);

  const handleApply = () => {
    onChangeExpression(tempExpr);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    } else if (e.key === 'Escape') {
      setTempExpr(expression);
      setIsEditing(false);
    }
  };

  const insertSymbol = (sym: string) => {
    setTempExpr((prev) => prev + sym);
  };

  return (
    <section className="mb-6">
      {/* Small contextual header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-[#575E66] tracking-normal">
          {presetName ? presetName : 'Active Expression'}
        </div>
        <button
          type="button"
          onClick={() => {
            if (isEditing) {
              handleApply();
            } else {
              setTempExpr(expression);
              setIsEditing(true);
            }
          }}
          className="flex items-center gap-1 text-xs text-[#2E5F4E] hover:text-[#1C1D21] font-medium transition-colors"
        >
          {isEditing ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit formula</span>
            </>
          )}
        </button>
      </div>

      {/* Oversized Chalkboard Formula Display (Hero) */}
      <div className="rounded border border-[#D8DFE2] bg-white p-4 sm:p-5 shadow-2xs transition-all relative overflow-x-auto">
        <div
          className="font-display text-2xl sm:text-3xl md:text-[2.25rem] text-[#1C1D21] leading-tight select-text py-1"
          dangerouslySetInnerHTML={{ __html: renderedLatex }}
        />

        {/* Inline Formula Input Bar (expanded when editing or by default available) */}
        {isEditing && (
          <div className="mt-4 pt-4 border-t border-[#F0EFEB]">
            <label htmlFor="formula-raw-input" className="block text-xs font-medium text-[#575E66] mb-1.5">
              Type mathematical expression (variables parsed automatically):
            </label>
            <div className="flex items-center gap-2">
              <input
                id="formula-raw-input"
                type="text"
                value={tempExpr}
                onChange={(e) => {
                  setTempExpr(e.target.value);
                  onChangeExpression(e.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. a * sin(b * x + c) + d or x^3 - 2*x"
                className="w-full rounded border border-[#C9D6D9] bg-[#FAF9F5] px-3 py-2 text-sm font-mono text-[#1C1D21] focus:border-[#2E5F4E] focus:bg-white focus:outline-hidden"
                autoFocus
              />
              <button
                type="button"
                onClick={handleApply}
                className="rounded bg-[#2E5F4E] px-3 py-2 text-xs font-medium text-white hover:bg-[#23483b] shrink-0"
              >
                Apply
              </button>
            </div>

            {/* Quick Math Symbols Palette */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[11px] text-[#87929D] mr-1">Insert:</span>
              {[
                { label: 'x²', val: '^2' },
                { label: '√x', val: 'sqrt(' },
                { label: 'sin', val: 'sin(' },
                { label: 'cos', val: 'cos(' },
                { label: 'tan', val: 'tan(' },
                { label: 'eˣ', val: 'exp(' },
                { label: 'ln', val: 'log(' },
                { label: 'π', val: 'pi' },
                { label: '·', val: '*' },
                { label: '/', val: '/' },
              ].map((sym) => (
                <button
                  key={sym.label}
                  type="button"
                  onClick={() => insertSymbol(sym.val)}
                  className="rounded border border-[#D8DFE2] bg-white px-2 py-0.5 text-xs font-mono text-[#1C1D21] hover:bg-[#EFECE6] transition-colors"
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clear Inline Error State using --accent-warn (#B8860B) */}
        {error && (
          <div
            id="formula-parse-error"
            className="mt-3 flex items-start gap-2 rounded border border-[#B8860B]/40 bg-[#FAF3E0] px-3 py-2 text-xs text-[#7A5800]"
          >
            <AlertCircle className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
            <div className="leading-snug">
              <span className="font-semibold text-[#8F6800]">Formula parsing note: </span>
              {error}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
