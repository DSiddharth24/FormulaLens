import { FormulaPreset } from './types';

export const FORMULA_PRESETS: FormulaPreset[] = [
  // --- TRIGONOMETRY ---
  {
    id: 'trig-sine-general',
    name: 'General Sine Wave',
    category: 'Trigonometry',
    expression: 'a * sin(b * x + c) + d',
    latex: 'f(x) = a \\cdot \\sin(b x + c) + d',
    mode: '2d',
    parameters: {
      a: { value: 1.5, min: -4, max: 4, step: 0.1, description: 'Amplitude (vertical stretch / reflection)' },
      b: { value: 1.0, min: 0.1, max: 5, step: 0.1, description: 'Angular frequency (controls period T = 2π/b)' },
      c: { value: 0.0, min: -3.14, max: 3.14, step: 0.1, description: 'Phase shift (horizontal translation)' },
      d: { value: 0.0, min: -3, max: 3, step: 0.2, description: 'Vertical equilibrium offset' },
    },
    defaultXRange: [-6.5, 6.5],
    defaultYRange: [-4, 4],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Amplitude',
        latex: 'a',
        explanation: 'Multiplies the wave height. Magnitudes greater than 1 stretch the peak-to-trough distance; negative values invert the crests and troughs across the equilibrium axis.',
      },
      {
        term: 'b',
        label: 'Angular Frequency',
        latex: 'b',
        explanation: 'Compresses or expands the oscillation along the x-axis. The period of repetition is T = 2π/|b|. Increasing b yields higher frequency oscillation.',
      },
      {
        term: 'c',
        label: 'Phase Shift',
        latex: 'c',
        explanation: 'Shifts the waveform horizontally. When written as sin(b(x + c/b)), -c/b determines how far left or right the wave has translated from the origin.',
      },
      {
        term: 'd',
        label: 'Vertical Baseline',
        latex: 'd',
        explanation: 'Shifts the mean center line of the wave up or down without affecting its frequency or amplitude shape.',
      },
    ],
  },
  {
    id: 'trig-damped-oscillation',
    name: 'Damped Oscillation',
    category: 'Trigonometry',
    expression: 'a * exp(-b * x) * cos(c * x)',
    latex: 'f(x) = a \\cdot e^{-b x} \\cdot \\cos(c x)',
    mode: '2d',
    parameters: {
      a: { value: 2.0, min: 0.5, max: 5, step: 0.2, description: 'Initial peak amplitude' },
      b: { value: 0.35, min: 0.05, max: 1.5, step: 0.05, description: 'Damping coefficient (decay rate)' },
      c: { value: 3.0, min: 0.5, max: 8, step: 0.25, description: 'Natural angular frequency' },
    },
    defaultXRange: [0, 10],
    defaultYRange: [-2.5, 2.5],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Initial Amplitude',
        latex: 'a',
        explanation: 'Initial envelope height at x = 0.',
      },
      {
        term: 'b',
        label: 'Damping Factor',
        latex: 'b',
        explanation: 'Controls how fast energy dissipates. Higher b causes exponential decay to flatten the oscillations quickly.',
      },
      {
        term: 'c',
        label: 'Ringing Frequency',
        latex: 'c',
        explanation: 'The speed of cyclical oscillations inside the exponential envelope e^(-bx).',
      },
    ],
  },
  {
    id: 'trig-tangent',
    name: 'Tangent & Asymptotes',
    category: 'Trigonometry',
    expression: 'a * tan(b * x)',
    latex: 'f(x) = a \\cdot \\tan(b x)',
    mode: '2d',
    parameters: {
      a: { value: 1.0, min: -3, max: 3, step: 0.2, description: 'Vertical scale' },
      b: { value: 1.0, min: 0.2, max: 3, step: 0.1, description: 'Period factor (asymptotes at ±π/(2b))' },
    },
    defaultXRange: [-4, 4],
    defaultYRange: [-6, 6],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Vertical Scale',
        latex: 'a',
        explanation: 'Scales the steepness of each branch between vertical asymptotes.',
      },
      {
        term: 'b',
        label: 'Frequency Factor',
        latex: 'b',
        explanation: 'Positions vertical asymptotes where cos(bx) = 0, exactly at x = (2k+1)π / (2b).',
      },
    ],
  },

  // --- ALGEBRA ---
  {
    id: 'alg-quadratic',
    name: 'Quadratic Parabola',
    category: 'Algebra',
    expression: 'a * x^2 + b * x + c',
    latex: 'f(x) = a x^2 + b x + c',
    mode: '2d',
    parameters: {
      a: { value: 1.0, min: -3, max: 3, step: 0.1, description: 'Leading coefficient (curvature & concavity)' },
      b: { value: -1.0, min: -5, max: 5, step: 0.25, description: 'Linear slope at y-intercept (shifts vertex)' },
      c: { value: -2.0, min: -6, max: 6, step: 0.5, description: 'y-intercept: point (0, c)' },
    },
    defaultXRange: [-5, 5],
    defaultYRange: [-6, 8],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Quadratic Curvature',
        latex: 'a',
        explanation: 'Determines whether the parabola opens upward (a > 0) or downward (a < 0), and how steep the bowl is.',
      },
      {
        term: 'b',
        label: 'Vertex Shift Factor',
        latex: 'b',
        explanation: 'Moves the axis of symmetry to x = -b / (2a). When combined with a, it tilts the parabolic vertex.',
      },
      {
        term: 'c',
        label: 'Vertical Intercept',
        latex: 'c',
        explanation: 'The value of the function when x = 0. Translates the entire parabola vertically.',
      },
    ],
  },
  {
    id: 'alg-cubic',
    name: 'Cubic Polynomial',
    category: 'Algebra',
    expression: 'a * x^3 + b * x^2 + c * x + d',
    latex: 'f(x) = a x^3 + b x^2 + c x + d',
    mode: '2d',
    parameters: {
      a: { value: 0.5, min: -2, max: 2, step: 0.1, description: 'Cubic growth factor' },
      b: { value: -0.5, min: -3, max: 3, step: 0.25, description: 'Quadratic bending coefficient' },
      c: { value: -2.0, min: -5, max: 5, step: 0.25, description: 'Linear term / origin slope' },
      d: { value: 0.0, min: -4, max: 4, step: 0.5, description: 'Constant offset' },
    },
    defaultXRange: [-4, 4],
    defaultYRange: [-8, 8],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Cubic Term',
        latex: 'a x^3',
        explanation: 'Governs end behavior as x → ±∞. An odd power ensures opposite tails in quadrant I and III (or II and IV).',
      },
      {
        term: 'b',
        label: 'Inflection Offset',
        latex: 'b x^2',
        explanation: 'Places the point of inflection at x = -b / (3a), introducing asymmetric local extrema.',
      },
      {
        term: 'c',
        label: 'Local Extrema Spacing',
        latex: 'c x',
        explanation: 'Controls the slope at the y-intercept. If b² - 3ac > 0, the curve possesses two distinct local turning points.',
      },
      {
        term: 'd',
        label: 'Constant Offset',
        latex: 'd',
        explanation: 'Translates the curve up or down rigidly.',
      },
    ],
  },
  {
    id: 'alg-rational',
    name: 'Rational Function',
    category: 'Algebra',
    expression: 'a / (x - b) + c',
    latex: 'f(x) = \\frac{a}{x - b} + c',
    mode: '2d',
    parameters: {
      a: { value: 1.5, min: -4, max: 4, step: 0.25, description: 'Hyperbolic scale' },
      b: { value: 1.0, min: -3, max: 3, step: 0.25, description: 'Vertical asymptote at x = b' },
      c: { value: 0.5, min: -3, max: 3, step: 0.25, description: 'Horizontal asymptote at y = c' },
    },
    defaultXRange: [-5, 6],
    defaultYRange: [-6, 6],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Branch Curvature',
        latex: 'a',
        explanation: 'Distance of hyperbolic vertices from the intersection of the asymptotes. Negative flips quadrants.',
      },
      {
        term: 'b',
        label: 'Pole / Singularity',
        latex: 'b',
        explanation: 'The denominator becomes zero at x = b, creating a vertical line where the function is undefined and diverges to ±∞.',
      },
      {
        term: 'c',
        label: 'Horizontal Limit',
        latex: 'c',
        explanation: 'As x approaches ±∞, the rational term decays toward 0, leaving y = c as the horizontal asymptote.',
      },
    ],
  },

  // --- CALCULUS ---
  {
    id: 'calc-derivative-tangent',
    name: 'Cubic & Dynamic Tangent Line',
    category: 'Calculus',
    expression: 'a * x^3 - 3 * b * x',
    latex: 'f(x) = a x^3 - 3 b x',
    mode: 'calculus',
    parameters: {
      a: { value: 0.5, min: 0.1, max: 2, step: 0.1, description: 'Cubic steepness' },
      b: { value: 1.0, min: 0.2, max: 3, step: 0.1, description: 'Critical points at x = ±√(b/a)' },
    },
    defaultXRange: [-4, 4],
    defaultYRange: [-6, 6],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Cubic Coefficient',
        latex: 'a x^3',
        explanation: 'Differentiates to 3ax². Controls how rapidly the derivative grows quadratically away from the origin.',
      },
      {
        term: 'b',
        label: 'Local Extrema Position',
        latex: '3 b x',
        explanation: 'Derivative is f\'(x) = 3ax² - 3b = 3(ax² - b). Stationary points with zero derivative occur at x = ±√(b/a).',
      },
    ],
  },
  {
    id: 'calc-taylor-sine',
    name: 'Sine vs. Taylor Polynomial',
    category: 'Calculus',
    expression: 'sin(x)',
    latex: 'f(x) = \\sin(x)',
    mode: 'comparison',
    parameters: {
      k: { value: 1.0, min: 0.2, max: 2, step: 0.1, description: 'Wave scale' },
    },
    defaultXRange: [-5, 5],
    defaultYRange: [-2.5, 2.5],
    comparisonPreset: {
      expression: 'x - (x^3)/6 + (x^5)/120',
      latex: 'T_5(x) = x - \\frac{x^3}{3!} + \\frac{x^5}{5!}',
      label: '5th-Order Taylor Approximation',
    },
    termBreakdowns: [
      {
        term: 'sin(x)',
        label: 'Target Transcendental Function',
        latex: '\\sin(x)',
        explanation: 'The exact periodic trigonometric sine wave.',
      },
      {
        term: 'T_5(x)',
        label: 'Polynomial Expansion',
        latex: 'x - \\frac{x^3}{6} + \\frac{x^5}{120}',
        explanation: 'Taylor series around x = 0. Notice how closely it hugs the sine curve near 0, then diverges outside [-π, π].',
      },
    ],
  },

  // --- STATISTICS ---
  {
    id: 'stat-gaussian',
    name: 'Normal (Gaussian) Distribution',
    category: 'Statistics',
    expression: '(1 / (s * sqrt(2 * pi))) * exp(-((x - m)^2) / (2 * s^2))',
    latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x - \\mu)^2}{2\\sigma^2}}',
    mode: '2d',
    parameters: {
      m: { value: 0.0, min: -4, max: 4, step: 0.2, description: 'Mean (μ): center of symmetry' },
      s: { value: 1.0, min: 0.3, max: 3, step: 0.1, description: 'Standard deviation (σ): dispersion' },
    },
    defaultXRange: [-6, 6],
    defaultYRange: [-0.1, 1.2],
    termBreakdowns: [
      {
        term: 'm',
        label: 'Mean (μ)',
        latex: '\\mu',
        explanation: 'The expected value and axis of mirror symmetry. Translating μ slides the entire probability bell left or right.',
      },
      {
        term: 's',
        label: 'Standard Deviation (σ)',
        latex: '\\sigma',
        explanation: 'Measures spread. Points of inflection occur at exactly x = μ ± σ. Smaller σ sharpens the peak to preserve total integral area = 1.',
      },
    ],
  },
  {
    id: 'stat-logistic',
    name: 'Logistic Sigmoid',
    category: 'Statistics',
    expression: 'L / (1 + exp(-k * (x - x0)))',
    latex: 'f(x) = \\frac{L}{1 + e^{-k(x - x_0)}}',
    mode: '2d',
    parameters: {
      L: { value: 2.0, min: 0.5, max: 5, step: 0.25, description: 'Carrying capacity / upper asymptote' },
      k: { value: 1.5, min: 0.2, max: 4, step: 0.1, description: 'Logistic growth steepness' },
      x0: { value: 0.0, min: -3, max: 3, step: 0.25, description: 'Sigmoid midpoint (x₀)' },
    },
    defaultXRange: [-5, 5],
    defaultYRange: [-0.5, 4],
    termBreakdowns: [
      {
        term: 'L',
        label: 'Carrying Capacity',
        latex: 'L',
        explanation: 'Maximum value bounded by the horizontal ceiling as x → +∞.',
      },
      {
        term: 'k',
        label: 'Steepness',
        latex: 'k',
        explanation: 'Growth rate parameter. Controls how abruptly the transition occurs across the midpoint.',
      },
      {
        term: 'x0',
        label: 'Sigmoid Midpoint',
        latex: 'x_0',
        explanation: 'Point where the curve reaches 50% capacity (L/2) and reaches maximum slope.',
      },
    ],
  },

  // --- LINEAR ALGEBRA ---
  {
    id: 'linalg-matrix-2x2',
    name: '2x2 Matrix Transformation',
    category: 'Linear Algebra',
    expression: 'a * x', // Not directly used in 2D plot, specialized visualizer
    latex: '\\begin{pmatrix} x\' \\\\ y\' \\end{pmatrix} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix}',
    mode: 'matrix',
    parameters: {
      a: { value: 1.0, min: -3, max: 3, step: 0.1, description: 'T(î)_x : x-component of transformed î' },
      b: { value: 0.5, min: -3, max: 3, step: 0.1, description: 'T(ĵ)_x : x-component of transformed ĵ' },
      c: { value: 0.0, min: -3, max: 3, step: 0.1, description: 'T(î)_y : y-component of transformed î' },
      d: { value: 1.0, min: -3, max: 3, step: 0.1, description: 'T(ĵ)_y : y-component of transformed ĵ' },
    },
    defaultXRange: [-4, 4],
    defaultYRange: [-4, 4],
    matrixDefaults: { a: 1.0, b: 0.5, c: 0.0, d: 1.0 },
    termBreakdowns: [
      {
        term: '[a, c]',
        label: 'Transformed Basis Vector î',
        latex: 'T(\\hat{i}) = \\begin{pmatrix} a \\\\ c \\end{pmatrix}',
        explanation: 'Where the standard unit x-vector (1, 0) lands after applying transformation matrix A.',
      },
      {
        term: '[b, d]',
        label: 'Transformed Basis Vector ĵ',
        latex: 'T(\\hat{j}) = \\begin{pmatrix} b \\\\ d \\end{pmatrix}',
        explanation: 'Where the standard unit y-vector (0, 1) lands after transformation.',
      },
      {
        term: 'det(A)',
        label: 'Determinant (Area Scale)',
        latex: '\\det(A) = ad - bc',
        explanation: 'The factor by which any 2D area scales. If negative, orientation is flipped (reflection). If zero, space is squashed to a line or point.',
      },
    ],
  },

  // --- 3D SURFACES ---
  {
    id: 'surf-ripple',
    name: 'Concentric Ripple Wave',
    category: '3D Surfaces',
    expression: 'a * sin(b * sqrt(x^2 + y^2)) / (1 + 0.2 * (x^2 + y^2))',
    latex: 'z = \\frac{a \\cdot \\sin\\left(b \\sqrt{x^2 + y^2}\\right)}{1 + 0.2(x^2 + y^2)}',
    mode: '3d',
    parameters: {
      a: { value: 2.0, min: 0.5, max: 4, step: 0.2, description: 'Wave amplitude' },
      b: { value: 2.5, min: 0.5, max: 5, step: 0.25, description: 'Radial frequency' },
    },
    defaultXRange: [-4, 4],
    defaultYRange: [-4, 4],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Wave Amplitude',
        latex: 'a',
        explanation: 'Height of the radial crests radiating outwards from the origin.',
      },
      {
        term: 'b',
        label: 'Radial Wavenumber',
        latex: 'b',
        explanation: 'Frequency of concentric rings per unit distance r = √(x² + y²).',
      },
    ],
  },
  {
    id: 'surf-saddle',
    name: 'Hyperbolic Paraboloid (Saddle)',
    category: '3D Surfaces',
    expression: 'a * x^2 - b * y^2',
    latex: 'z = a x^2 - b y^2',
    mode: '3d',
    parameters: {
      a: { value: 0.5, min: -2, max: 2, step: 0.1, description: 'Curvature in x (curves upward if a > 0)' },
      b: { value: 0.5, min: -2, max: 2, step: 0.1, description: 'Curvature in y (curves downward if b > 0)' },
    },
    defaultXRange: [-3, 3],
    defaultYRange: [-3, 3],
    termBreakdowns: [
      {
        term: 'a',
        label: 'x-Curvature',
        latex: 'a x^2',
        explanation: 'Along the x-axis, cross-sections are parabolas opening upward when a > 0.',
      },
      {
        term: 'b',
        label: 'y-Curvature',
        latex: '-b y^2',
        explanation: 'Along the y-axis, cross-sections are parabolas opening downward when b > 0. The origin is a saddle point where gradient is zero.',
      },
    ],
  },
  {
    id: 'surf-monkey-saddle',
    name: 'Monkey Saddle',
    category: '3D Surfaces',
    expression: 'a * (x^3 - 3 * x * y^2)',
    latex: 'z = a (x^3 - 3 x y^2)',
    mode: '3d',
    parameters: {
      a: { value: 0.3, min: 0.05, max: 1.0, step: 0.05, description: 'Cubic scale factor' },
    },
    defaultXRange: [-3, 3],
    defaultYRange: [-3, 3],
    termBreakdowns: [
      {
        term: 'a',
        label: 'Cubic Amplitude',
        latex: 'a',
        explanation: 'Features three depressions (two for legs, one for the tail) and three peaks, giving rise to its classical mathematical nickname.',
      },
    ],
  },
];
