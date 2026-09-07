import * as math from 'mathjs';

// Reserved constants and standard functions in math.js that should not be treated as free parameter variables
const RESERVED_NAMES = new Set([
  'x',
  'y',
  'z',
  'pi',
  'e',
  'i',
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'atan2',
  'sinh',
  'cosh',
  'tanh',
  'sec',
  'csc',
  'cot',
  'exp',
  'log',
  'log10',
  'log2',
  'ln',
  'sqrt',
  'cbrt',
  'abs',
  'sign',
  'floor',
  'ceil',
  'round',
  'min',
  'max',
  'mod',
]);

export interface ParseResult {
  valid: boolean;
  error: string | null;
  compiled: math.EvalFunction | null;
  ast: math.MathNode | null;
  freeVariables: string[];
  latex: string;
}

export function parseExpression(expressionString: string, independentVars: string[] = ['x']): ParseResult {
  const trimmed = expressionString.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Empty expression. Type a mathematical formula such as sin(x) or a*x^2 + b*x + c.',
      compiled: null,
      ast: null,
      freeVariables: [],
      latex: '',
    };
  }

  try {
    const ast = math.parse(trimmed);
    const compiled = ast.compile();

    // Extract all symbol nodes that are free variables
    const symbols = new Set<string>();
    const ignoreList = new Set([...RESERVED_NAMES, ...independentVars]);

    ast.traverse((node: math.MathNode) => {
      const maybeSymbol = node as unknown as { type?: string; isSymbolNode?: boolean; name?: string };
      if (maybeSymbol.type === 'SymbolNode' || maybeSymbol.isSymbolNode) {
        const name = maybeSymbol.name;
        if (name && !ignoreList.has(name)) {
          symbols.add(name);
        }
      }
    });

    let latex = '';
    try {
      latex = ast.toTex();
    } catch {
      latex = trimmed;
    }

    return {
      valid: true,
      error: null,
      compiled,
      ast,
      freeVariables: Array.from(symbols).sort(),
      latex,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      valid: false,
      error: formatParseError(message, trimmed),
      compiled: null,
      ast: null,
      freeVariables: [],
      latex: '',
    };
  }
}

function formatParseError(rawError: string, expr: string): string {
  if (rawError.includes('Parenthesis') || rawError.includes('parenthesis')) {
    return "Can't parse this — check for an unclosed or mismatched parenthesis.";
  }
  if (rawError.includes('Unexpected type of argument') || rawError.includes('Unexpected end of expression')) {
    return "Incomplete expression — check for a trailing operator or missing argument.";
  }
  if (rawError.includes('Unexpected operator')) {
    return "Can't parse this — two consecutive operators or misplaced punctuation detected.";
  }
  if (expr.includes('^') && rawError.includes('Value expected')) {
    return "Exponentiation needs an exponent term, e.g. x^2 or e^(a*x).";
  }
  return `Can't parse this — ${rawError.replace(/^Error:\s*/, '')}.`;
}

/**
 * Safely evaluate a compiled expression for a given scope
 */
export function evaluatePoint(
  compiled: math.EvalFunction,
  scope: Record<string, number>
): number | null {
  try {
    const result = compiled.evaluate(scope);
    if (typeof result === 'number') {
      if (!Number.isFinite(result) || Number.isNaN(result)) return null;
      return result;
    }
    // Handle mathjs BigNumber or Complex
    if (typeof result === 'object' && result !== null) {
      // If complex with non-zero imaginary part, it's outside real domain
      if ('im' in result && Math.abs(result.im) > 1e-9) {
        return null;
      }
      if ('re' in result && typeof result.re === 'number') {
        return Number.isFinite(result.re) ? result.re : null;
      }
      if (typeof (result as unknown as { toNumber: () => number }).toNumber === 'function') {
        const val = (result as unknown as { toNumber: () => number }).toNumber();
        return Number.isFinite(val) ? val : null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Compute numerical derivative f'(x0) using central finite difference
 */
export function computeDerivative(
  compiled: math.EvalFunction,
  x0: number,
  params: Record<string, number>,
  h = 1e-5
): { slope: number | null; y0: number | null } {
  const y0 = evaluatePoint(compiled, { ...params, x: x0 });
  if (y0 === null) return { slope: null, y0: null };

  const yPlus = evaluatePoint(compiled, { ...params, x: x0 + h });
  const yMinus = evaluatePoint(compiled, { ...params, x: x0 - h });

  if (yPlus === null || yMinus === null) {
    // Fallback to one-sided forward difference
    if (yPlus !== null) {
      return { slope: (yPlus - y0) / h, y0 };
    }
    if (yMinus !== null) {
      return { slope: (y0 - yMinus) / h, y0 };
    }
    return { slope: null, y0 };
  }

  const slope = (yPlus - yMinus) / (2 * h);
  return { slope: Number.isFinite(slope) ? slope : null, y0 };
}

/**
 * Generate 2D plot dataset over [xMin, xMax] with step count and asymptote discontinuity detection
 */
export function generate2DData(
  compiled: math.EvalFunction,
  params: Record<string, number>,
  xMin: number,
  xMax: number,
  samples = 500
): { x: number[]; y: (number | null)[] } {
  const xVals: number[] = [];
  const yVals: (number | null)[] = [];
  const dx = (xMax - xMin) / (samples - 1);

  let prevY: number | null = null;

  for (let i = 0; i < samples; i++) {
    const x = xMin + i * dx;
    const y = evaluatePoint(compiled, { ...params, x });

    // Asymptote detection: if large jump with opposite signs, insert null to break the line
    if (y !== null && prevY !== null) {
      const diff = Math.abs(y - prevY);
      const isOppositeSign = (y > 0 && prevY < 0) || (y < 0 && prevY > 0);
      if (diff > 25 && isOppositeSign) {
        xVals.push(x - dx * 0.5);
        yVals.push(null);
      }
    }

    xVals.push(x);
    yVals.push(y);
    prevY = y;
  }

  return { x: xVals, y: yVals };
}
