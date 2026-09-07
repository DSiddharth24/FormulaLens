export type PresetCategory =
  | 'Algebra'
  | 'Trigonometry'
  | 'Calculus'
  | 'Statistics'
  | 'Linear Algebra'
  | '3D Surfaces';

export type ViewMode = '2d' | 'calculus' | 'comparison' | '3d' | 'matrix';

export interface ParameterConfig {
  value: number;
  min: number;
  max: number;
  step: number;
  description?: string;
}

export interface TermBreakdownItem {
  term: string;
  label: string;
  latex: string;
  explanation: string;
}

export interface FormulaPreset {
  id: string;
  name: string;
  category: PresetCategory;
  expression: string;
  latex: string;
  mode: ViewMode;
  parameters: Record<string, ParameterConfig>;
  defaultXRange: [number, number];
  defaultYRange?: [number, number];
  termBreakdowns?: TermBreakdownItem[];
  comparisonPreset?: {
    expression: string;
    latex: string;
    label: string;
  };
  matrixDefaults?: {
    a: number;
    b: number;
    c: number;
    d: number;
  };
}

export interface CalculusState {
  enabled: boolean;
  x0: number;
  showTangent: boolean;
  showSecant: boolean;
  secantDx: number;
}

export interface ComparisonState {
  enabled: boolean;
  expression: string;
  latex: string;
  label: string;
}

export interface MatrixState {
  a: number; // Row 1 Col 1
  b: number; // Row 1 Col 2
  c: number; // Row 2 Col 1
  d: number; // Row 2 Col 2
}
