import { ParameterConfig, ViewMode, MatrixState } from '../types';

export interface SerializedAppState {
  expression?: string;
  presetId?: string;
  mode?: ViewMode;
  parameters?: Record<string, number>;
  x0?: number;
  comparisonExpression?: string;
  matrix?: MatrixState;
}

export function readStateFromUrl(): SerializedAppState | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const expr = params.get('f');
    const presetId = params.get('preset');
    const mode = (params.get('m') as ViewMode) || undefined;
    const rawParams = params.get('p');
    const rawX0 = params.get('x0');
    const compExpr = params.get('comp');
    const rawMatrix = params.get('mat');

    if (!expr && !presetId && !rawParams) return null;

    let parameters: Record<string, number> | undefined;
    if (rawParams) {
      parameters = {};
      const pairs = rawParams.split(';');
      for (const pair of pairs) {
        const [k, v] = pair.split(':');
        if (k && v !== undefined && !Number.isNaN(Number(v))) {
          parameters[k] = Number(v);
        }
      }
    }

    let matrix: MatrixState | undefined;
    if (rawMatrix) {
      const parts = rawMatrix.split(',').map(Number);
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        matrix = { a: parts[0], b: parts[1], c: parts[2], d: parts[3] };
      }
    }

    return {
      expression: expr ? decodeURIComponent(expr) : undefined,
      presetId: presetId || undefined,
      mode,
      parameters,
      x0: rawX0 !== null && !Number.isNaN(Number(rawX0)) ? Number(rawX0) : undefined,
      comparisonExpression: compExpr ? decodeURIComponent(compExpr) : undefined,
      matrix,
    };
  } catch (err) {
    console.warn('Failed to parse URL state', err);
    return null;
  }
}

export function writeStateToUrl(
  expression: string,
  parameters: Record<string, ParameterConfig>,
  mode: ViewMode,
  presetId?: string,
  x0?: number,
  comparisonExpr?: string,
  matrix?: MatrixState
): string {
  try {
    const params = new URLSearchParams();
    params.set('f', expression);
    if (presetId) params.set('preset', presetId);
    if (mode && mode !== '2d') params.set('m', mode);

    const paramEntries = Object.entries(parameters);
    if (paramEntries.length > 0) {
      const serialized = paramEntries.map(([k, cfg]) => `${k}:${cfg.value}`).join(';');
      params.set('p', serialized);
    }

    if (mode === 'calculus' && x0 !== undefined) {
      params.set('x0', x0.toString());
    }

    if (mode === 'comparison' && comparisonExpr) {
      params.set('comp', comparisonExpr);
    }

    if (mode === 'matrix' && matrix) {
      params.set('mat', `${matrix.a},${matrix.b},${matrix.c},${matrix.d}`);
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    return window.location.href;
  } catch (err) {
    console.warn('Failed to write URL state', err);
    return window.location.href;
  }
}
