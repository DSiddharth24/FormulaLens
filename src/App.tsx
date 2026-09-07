import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FORMULA_PRESETS } from './presets';
import {
  FormulaPreset,
  ViewMode,
  ParameterConfig,
  CalculusState,
  ComparisonState,
  MatrixState,
} from './types';
import { parseExpression, generate2DData, computeDerivative } from './utils/mathParser';
import { readStateFromUrl, writeStateToUrl } from './utils/urlState';
import { Header } from './components/Header';
import { FormulaHero } from './components/FormulaHero';
import { ParameterSliders } from './components/ParameterSliders';
import { TermBreakdown } from './components/TermBreakdown';
import { CalculusPanel } from './components/CalculusPanel';
import { ComparisonPanel } from './components/ComparisonPanel';
import { Plot2D } from './components/Plot2D';
import { Surface3D } from './components/Surface3D';
import { MatrixTransformVisualizer } from './components/MatrixTransformVisualizer';

export default function App() {
  // 1. Initial State Restoration from URL or fallback to first preset
  const initialUrlState = useMemo(() => readStateFromUrl(), []);
  const initialPreset = useMemo(() => {
    if (initialUrlState?.presetId) {
      const found = FORMULA_PRESETS.find((p) => p.id === initialUrlState.presetId);
      if (found) return found;
    }
    return FORMULA_PRESETS[0]; // General Sine Wave
  }, [initialUrlState]);

  const [currentPreset, setCurrentPreset] = useState<FormulaPreset | null>(initialPreset);
  const [expression, setExpression] = useState<string>(
    initialUrlState?.expression || initialPreset.expression
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialUrlState?.mode || initialPreset.mode || '2d'
  );

  // Parameter values and configs
  const [parameters, setParameters] = useState<Record<string, ParameterConfig>>(() => {
    const baseParams: Record<string, ParameterConfig> = { ...initialPreset.parameters };
    if (initialUrlState?.parameters) {
      for (const [k, val] of Object.entries(initialUrlState.parameters as Record<string, number>)) {
        const numVal = typeof val === 'number' ? val : Number(val);
        if (baseParams[k]) {
          baseParams[k] = { ...baseParams[k], value: numVal };
        } else {
          baseParams[k] = { value: numVal, min: -5, max: 5, step: 0.1 };
        }
      }
    }
    return baseParams;
  });

  // Selected term in breakdown for cross-highlighting
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  // Formula change key for the sketched draw-in animation
  const [formulaAnimationKey, setFormulaAnimationKey] = useState<string>(
    initialPreset.id || 'initial'
  );

  // Calculus overlay state
  const [calculusState, setCalculusState] = useState<CalculusState>({
    enabled: initialUrlState?.mode === 'calculus' || initialPreset.mode === 'calculus',
    x0: initialUrlState?.x0 !== undefined ? initialUrlState.x0 : 1.0,
    showTangent: true,
    showSecant: false,
    secantDx: 0.5,
  });

  // Comparison state
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    enabled: initialUrlState?.mode === 'comparison' || initialPreset.mode === 'comparison',
    expression:
      initialUrlState?.comparisonExpression ||
      initialPreset.comparisonPreset?.expression ||
      'x - (x^3)/6 + (x^5)/120',
    latex: initialPreset.comparisonPreset?.latex || 'T(x)',
    label: initialPreset.comparisonPreset?.label || 'Taylor Approximation',
  });

  // 2x2 Matrix state
  const [matrixState, setMatrixState] = useState<MatrixState>(
    initialUrlState?.matrix || initialPreset.matrixDefaults || { a: 1.0, b: 0.5, c: 0.0, d: 1.0 }
  );

  // Share link feedback
  const [shareCopied, setShareCopied] = useState(false);

  // Independent variables depending on mode (for 3D: ['x', 'y'], otherwise ['x'])
  const independentVars = useMemo(() => {
    return viewMode === '3d' ? ['x', 'y'] : ['x'];
  }, [viewMode]);

  // Parse primary formula
  const parseResult = useMemo(() => {
    return parseExpression(expression, independentVars);
  }, [expression, independentVars]);

  // Sync free variables detected from formula with parameter sliders
  useEffect(() => {
    if (!parseResult.valid) return;
    const detectedVars = parseResult.freeVariables;

    setParameters((prev) => {
      const next: Record<string, ParameterConfig> = {};
      for (const v of detectedVars) {
        if (prev[v]) {
          next[v] = prev[v];
        } else if (currentPreset?.parameters[v]) {
          next[v] = { ...currentPreset.parameters[v] };
        } else {
          // Auto-generate sensible bounds for new variable
          next[v] = {
            value: 1.0,
            min: -5,
            max: 5,
            step: 0.1,
            description: `Free parameter ${v}`,
          };
        }
      }
      return next;
    });
  }, [parseResult, currentPreset]);

  // Scope parameter numbers for evaluation
  const paramNumbers = useMemo(() => {
    const scope: Record<string, number> = {};
    for (const [k, cfg] of Object.entries(parameters)) {
      scope[k] = (cfg as ParameterConfig).value;
    }
    return scope;
  }, [parameters]);

  // Default coordinate ranges
  const xRangeDefault = currentPreset?.defaultXRange || [-6.5, 6.5];
  const yRangeDefault = currentPreset?.defaultYRange || [-5, 5];

  // Primary 2D dataset
  const primaryPlotData = useMemo(() => {
    if (!parseResult.compiled || !parseResult.valid) {
      return { x: [], y: [] };
    }
    return generate2DData(
      parseResult.compiled,
      paramNumbers,
      xRangeDefault[0] - 2,
      xRangeDefault[1] + 2,
      450
    );
  }, [parseResult, paramNumbers, xRangeDefault]);

  // Secondary comparison dataset
  const comparisonParseResult = useMemo(() => {
    if (viewMode !== 'comparison' || !comparisonState.expression) return null;
    return parseExpression(comparisonState.expression, ['x']);
  }, [viewMode, comparisonState.expression]);

  const secondaryPlotData = useMemo(() => {
    if (viewMode !== 'comparison' || !comparisonParseResult?.compiled || !comparisonParseResult.valid) {
      return null;
    }
    return generate2DData(
      comparisonParseResult.compiled,
      paramNumbers,
      xRangeDefault[0] - 2,
      xRangeDefault[1] + 2,
      450
    );
  }, [viewMode, comparisonParseResult, paramNumbers, xRangeDefault]);

  // Calculate residual error between primary and comparison functions
  const { maxResidual, rmsError } = useMemo(() => {
    if (!secondaryPlotData || primaryPlotData.y.length === 0) {
      return { maxResidual: null, rmsError: null };
    }
    let maxDiff = 0;
    let sumSq = 0;
    let count = 0;

    for (let i = 0; i < Math.min(primaryPlotData.y.length, secondaryPlotData.y.length); i++) {
      const y1 = primaryPlotData.y[i];
      const y2 = secondaryPlotData.y[i];
      if (y1 !== null && y2 !== null && Number.isFinite(y1) && Number.isFinite(y2)) {
        const diff = Math.abs(y1 - y2);
        if (diff > maxDiff) maxDiff = diff;
        sumSq += diff * diff;
        count++;
      }
    }

    if (count === 0) return { maxResidual: null, rmsError: null };
    return {
      maxResidual: maxDiff,
      rmsError: Math.sqrt(sumSq / count),
    };
  }, [primaryPlotData, secondaryPlotData]);

  // Calculus tangent evaluation
  const { slope: tangentSlope, y0: tangentY0 } = useMemo(() => {
    if (!parseResult.compiled || !parseResult.valid || viewMode !== 'calculus') {
      return { slope: null, y0: null };
    }
    return computeDerivative(parseResult.compiled, calculusState.x0, paramNumbers);
  }, [parseResult, calculusState.x0, paramNumbers, viewMode]);

  // Keep URL updated with current view state
  useEffect(() => {
    writeStateToUrl(
      expression,
      parameters,
      viewMode,
      currentPreset?.id,
      viewMode === 'calculus' ? calculusState.x0 : undefined,
      viewMode === 'comparison' ? comparisonState.expression : undefined,
      viewMode === 'matrix' ? matrixState : undefined
    );
  }, [
    expression,
    parameters,
    viewMode,
    currentPreset,
    calculusState.x0,
    comparisonState.expression,
    matrixState,
  ]);

  // Preset Selection Handler
  const handleSelectPreset = (preset: FormulaPreset) => {
    setCurrentPreset(preset);
    setExpression(preset.expression);
    setViewMode(preset.mode);
    setParameters({ ...preset.parameters });
    setSelectedTerm(null);
    setFormulaAnimationKey(`${preset.id}-${Date.now()}`);

    if (preset.mode === 'calculus') {
      setCalculusState((prev) => ({ ...prev, enabled: true, x0: 1.0 }));
    }
    if (preset.comparisonPreset) {
      setComparisonState({
        enabled: true,
        expression: preset.comparisonPreset.expression,
        latex: preset.comparisonPreset.latex,
        label: preset.comparisonPreset.label,
      });
    }
    if (preset.matrixDefaults) {
      setMatrixState(preset.matrixDefaults);
    }
  };

  // Reset parameters to preset defaults
  const handleResetParameters = () => {
    if (currentPreset) {
      setParameters({ ...currentPreset.parameters });
      if (currentPreset.matrixDefaults) {
        setMatrixState(currentPreset.matrixDefaults);
      }
    }
  };

  // Change single parameter
  const handleChangeParameter = useCallback((name: string, value: number) => {
    setParameters((prev) => {
      if (!prev[name]) return prev;
      return {
        ...prev,
        [name]: { ...prev[name], value },
      };
    });
  }, []);

  // Share URL button handler
  const handleShare = () => {
    const shareUrl = writeStateToUrl(
      expression,
      parameters,
      viewMode,
      currentPreset?.id,
      viewMode === 'calculus' ? calculusState.x0 : undefined,
      viewMode === 'comparison' ? comparisonState.expression : undefined,
      viewMode === 'matrix' ? matrixState : undefined
    );

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2200);
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#1C1D21] flex flex-col selection:bg-[#2E5F4E22]">
      {/* Slim, left-aligned header (no hero banner) */}
      <Header
        currentPreset={currentPreset}
        onSelectPreset={handleSelectPreset}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          setViewMode(mode);
          if (mode === 'calculus') {
            setCalculusState((prev) => ({ ...prev, enabled: true }));
          }
        }}
        onResetParameters={handleResetParameters}
        onShare={handleShare}
        shareCopied={shareCopied}
      />

      {/* Main Working Tool Workspace (Left column ~35%, Right column dominant ~65%) */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 py-4 sm:px-6 sm:py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column (~35%): Chalkboard formula headline, sliders, math structure, mode controls */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col order-2 lg:order-1">
            {/* The Hero: Oversized Typeset Formula with inline editor */}
            <FormulaHero
              expression={expression}
              latex={currentPreset && currentPreset.expression === expression ? currentPreset.latex : parseResult.latex}
              error={parseResult.error}
              onChangeExpression={(newExpr) => {
                setExpression(newExpr);
                if (currentPreset && newExpr !== currentPreset.expression) {
                  setCurrentPreset(null);
                }
              }}
              presetName={currentPreset?.name}
              selectedTerm={selectedTerm}
              onSelectTerm={setSelectedTerm}
            />

            {/* Calculus Overlay Controls */}
            {viewMode === 'calculus' && (
              <CalculusPanel
                calculusState={calculusState}
                onChangeCalculusState={setCalculusState}
                xRange={xRangeDefault}
                currentY0={tangentY0}
                currentSlope={tangentSlope}
              />
            )}

            {/* Comparison Overlay Controls */}
            {viewMode === 'comparison' && (
              <ComparisonPanel
                comparisonState={comparisonState}
                onChangeComparisonState={setComparisonState}
                primaryExpression={expression}
                maxResidual={maxResidual}
                rmsError={rmsError}
              />
            )}

            {/* Auto-detected Parameter Sliders (omitted if no free variables exist, e.g. x^3 - 2x) */}
            <ParameterSliders
              parameters={parameters}
              onChangeParameter={handleChangeParameter}
              selectedTerm={selectedTerm}
            />

            {/* Term Breakdown (Click-to-explain plain language mathematics) */}
            {currentPreset?.termBreakdowns && (
              <TermBreakdown
                terms={currentPreset.termBreakdowns}
                selectedTerm={selectedTerm}
                onSelectTerm={setSelectedTerm}
              />
            )}

            {/* Notebook Technical Math Footer Note */}
            <div className="mt-2 text-[11px] text-[#575E66] border-t border-[#D8DFE2] pt-3 flex items-center justify-between">
              <span>Graph paper coordinate space</span>
              <span className="font-mono text-[10px] text-[#87929D]">
                Client-side math.js & KaTeX
              </span>
            </div>
          </div>

          {/* Right Column (~65%): Dominant Interactive Plotting Canvas */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[520px] sm:h-[620px] lg:h-[calc(100vh-6rem)] min-h-[480px] order-1 lg:order-2 sticky top-4">
            {viewMode === '3d' ? (
              <Surface3D
                compiledFormula={parseResult.compiled}
                parameters={parameters}
                expression={expression}
              />
            ) : viewMode === 'matrix' ? (
              <MatrixTransformVisualizer
                matrix={matrixState}
                onChangeMatrix={setMatrixState}
              />
            ) : (
              <Plot2D
                primaryData={primaryPlotData}
                secondaryData={viewMode === 'comparison' ? secondaryPlotData : null}
                calculusState={viewMode === 'calculus' ? calculusState : undefined}
                onUpdateX0={(newX0) => setCalculusState((prev) => ({ ...prev, x0: newX0 }))}
                tangentSlope={tangentSlope}
                tangentY0={tangentY0}
                xRangeDefault={xRangeDefault}
                yRangeDefault={yRangeDefault}
                formulaKey={formulaAnimationKey}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
