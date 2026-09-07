import React from 'react';
import { TermBreakdownItem } from '../types';
import katex from 'katex';
import { HelpCircle, ChevronRight } from 'lucide-react';

interface TermBreakdownProps {
  terms: TermBreakdownItem[];
  selectedTerm: string | null;
  onSelectTerm: (term: string | null) => void;
}

export const TermBreakdown: React.FC<TermBreakdownProps> = ({
  terms,
  selectedTerm,
  onSelectTerm,
}) => {
  if (!terms || terms.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-[#575E66] uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#575E66]" />
          <span>Mathematical Structure</span>
        </h3>
        <span className="text-[11px] text-[#87929D]">
          Click a term to inspect
        </span>
      </div>

      <div className="space-y-2">
        {terms.map((item) => {
          const isSelected = selectedTerm === item.term;
          let renderedLatex = item.term;
          try {
            renderedLatex = katex.renderToString(item.latex || item.term, {
              throwOnError: false,
            });
          } catch {
            renderedLatex = item.term;
          }

          return (
            <div
              key={item.term}
              onClick={() => onSelectTerm(isSelected ? null : item.term)}
              className={`cursor-pointer rounded border p-2.5 transition-all ${
                isSelected
                  ? 'border-[#2E5F4E] bg-white ring-1 ring-[#2E5F4E]'
                  : 'border-[#D8DFE2] bg-[#FAF9F5] hover:border-[#B5C2C6] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block px-1.5 py-0.5 rounded bg-white border border-[#C9D6D9] text-xs font-serif"
                    dangerouslySetInnerHTML={{ __html: renderedLatex }}
                  />
                  <span className="text-xs font-medium text-[#1C1D21]">
                    {item.label}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-[#87929D] transition-transform ${
                    isSelected ? 'rotate-90 text-[#2E5F4E]' : ''
                  }`}
                />
              </div>

              {isSelected && (
                <div className="mt-2 pt-2 border-t border-[#F0EFEB] text-xs leading-relaxed text-[#575E66] select-text">
                  {item.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
