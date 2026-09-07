import React, { useState } from 'react';
import { FORMULA_PRESETS } from '../presets';
import { FormulaPreset, ViewMode, PresetCategory } from '../types';
import { Share2, Check, RefreshCw, Layers, Compass, GitCompare, Box, Grid } from 'lucide-react';

interface HeaderProps {
  currentPreset: FormulaPreset | null;
  onSelectPreset: (preset: FormulaPreset) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onResetParameters: () => void;
  onShare: () => void;
  shareCopied: boolean;
}

const CATEGORIES: PresetCategory[] = [
  'Algebra',
  'Trigonometry',
  'Calculus',
  'Statistics',
  'Linear Algebra',
  '3D Surfaces',
];

export const Header: React.FC<HeaderProps> = ({
  currentPreset,
  onSelectPreset,
  viewMode,
  onChangeViewMode,
  onResetParameters,
  onShare,
  shareCopied,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPresets = FORMULA_PRESETS.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.expression.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  return (
    <header className="border-b border-[#D8DFE2] bg-[#F7F6F2] px-4 py-2.5 sm:px-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Left: App Title & Preset Picker */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold tracking-tight text-[#1C1D21]">
              FormulaLens
            </span>
            <span className="text-xs text-[#575E66] border border-[#C9D6D9] px-1.5 py-0.5 rounded">
              v1.0
            </span>
          </div>

          <div className="relative">
            <button
              id="preset-picker-button"
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded border border-[#C9D6D9] bg-white px-3 py-1.5 text-sm font-medium text-[#1C1D21] hover:border-[#9EB0B5] hover:bg-[#FAF9F5] transition-colors shadow-xs"
            >
              <span className="text-[#575E66] font-normal">Formula:</span>
              <span className="truncate max-w-[170px] sm:max-w-[220px]">
                {currentPreset ? currentPreset.name : 'Custom Formula'}
              </span>
              <span className="text-xs text-[#575E66]">▾</span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-72 sm:w-80 rounded border border-[#C9D6D9] bg-white p-2 shadow-lg z-50 max-h-[460px] overflow-y-auto">
                  <div className="mb-2 px-1">
                    <input
                      type="text"
                      placeholder="Search formulas or concepts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded border border-[#C9D6D9] px-2.5 py-1.5 text-xs text-[#1C1D21] placeholder-[#87929D] focus:border-[#2E5F4E] focus:outline-hidden"
                      autoFocus
                    />
                  </div>

                  {CATEGORIES.map((cat) => {
                    const presetsInCat = filteredPresets.filter((p) => p.category === cat);
                    if (presetsInCat.length === 0) return null;
                    return (
                      <div key={cat} className="mb-2">
                        <div className="px-2 py-1 text-[11px] font-semibold text-[#575E66] border-b border-[#F0EFEB]">
                          {cat}
                        </div>
                        <div className="mt-1 space-y-0.5">
                          {presetsInCat.map((preset) => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => {
                                onSelectPreset(preset);
                                setDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              className={`w-full text-left px-2 py-1.5 text-xs rounded transition-colors flex items-center justify-between ${
                                currentPreset?.id === preset.id
                                  ? 'bg-[#2E5F4E]/10 text-[#2E5F4E] font-medium'
                                  : 'text-[#1C1D21] hover:bg-[#F7F6F2]'
                              }`}
                            >
                              <span className="truncate">{preset.name}</span>
                              <span className="text-[10px] text-[#575E66] font-mono ml-2 shrink-0">
                                {preset.expression.length > 15
                                  ? preset.expression.slice(0, 15) + '…'
                                  : preset.expression}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {filteredPresets.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-[#575E66]">
                      No matching formulas found.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Visual Modes & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switchers */}
          <div className="flex items-center rounded border border-[#C9D6D9] bg-white p-0.5 text-xs font-medium text-[#575E66]">
            <button
              type="button"
              onClick={() => onChangeViewMode('2d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === '2d'
                  ? 'bg-[#1C1D21] text-white font-semibold'
                  : 'hover:text-[#1C1D21] hover:bg-[#F7F6F2]'
              }`}
              title="Standard 2D Plotter"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plot</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode('calculus')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'calculus'
                  ? 'bg-[#1C1D21] text-white font-semibold'
                  : 'hover:text-[#1C1D21] hover:bg-[#F7F6F2]'
              }`}
              title="Calculus Tangent & Derivative Analysis"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Calculus</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode('comparison')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-[#1C1D21] text-white font-semibold'
                  : 'hover:text-[#1C1D21] hover:bg-[#F7F6F2]'
              }`}
              title="Overlay Second Formula for Approximation & Error"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode('3d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === '3d'
                  ? 'bg-[#1C1D21] text-white font-semibold'
                  : 'hover:text-[#1C1D21] hover:bg-[#F7F6F2]'
              }`}
              title="3D Surface Mesh for z = f(x, y)"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Surface</span>
            </button>

            <button
              type="button"
              onClick={() => onChangeViewMode('matrix')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-[#1C1D21] text-white font-semibold'
                  : 'hover:text-[#1C1D21] hover:bg-[#F7F6F2]'
              }`}
              title="2D Matrix Coordinate Warping"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>
          </div>

          {/* Reset Parameters */}
          <button
            type="button"
            onClick={onResetParameters}
            title="Reset parameters to initial preset values"
            className="flex items-center gap-1 rounded border border-[#C9D6D9] bg-white px-2.5 py-1.5 text-xs text-[#575E66] hover:text-[#1C1D21] hover:border-[#9EB0B5] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Share View URL */}
          <button
            id="share-view-button"
            type="button"
            onClick={onShare}
            title="Copy bookmarkable URL with formula and parameter state"
            className="flex items-center gap-1.5 rounded border border-[#C9D6D9] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1C1D21] hover:border-[#2E5F4E] hover:text-[#2E5F4E] transition-colors shadow-2xs"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2E5F4E]" />
                <span className="text-[#2E5F4E]">Link copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
