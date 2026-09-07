# FormulaLens 📐

FormulaLens is an interactive, zero-backend mathematical laboratory and visual drafting workbench. Designed with the aesthetics of graph paper, fountain-pen ink, and chalkboard mathematics, FormulaLens bridges abstract symbolic equations and geometric intuition in real time.

Instead of treating mathematical functions as static lines on generic charts, FormulaLens deconstructs expressions into their constituent terms, exposes active parameter coefficients as reactive controls, renders calculus tangents dynamically, graphs 3D topological surfaces, and visualizes 2D linear matrix coordinate transformations.

---

## Key Features

### 🖋️ LaTeX Chalkboard Typesetting
- **Native KaTeX Typography**: Displays mathematical equations using authentic Latin Modern math typography with high-contrast display sizing.
- **Live Equation Editor**: Type custom formulas using standard mathematical syntax (e.g., `a * sin(b * x + c)`, `x^3 - 3*x`, `1 / (x^2 - 1)`).
- **Instant AST Validation**: Evaluates syntax correctness on the fly, providing helpful diagnostics for unbalanced parentheses or unrecognized symbols without crashing.
- **Mathematical Symbol Palette**: Quick-insert drawer for common operations, trigonometric functions, exponents, roots, and transcendentals ($\pi$, $e$).

### 🎚️ Dynamic AST Free Variable Extraction
- **Zero-Configuration Sliders**: Traverses the expression's Abstract Syntax Tree (AST) using `math.js` to automatically detect free coefficient variables (such as $a$, $b$, $c$, $k$, $\omega$, $\sigma$).
- **Smart Bounds & Stepping**: Assigns appropriate mathematical ranges, step resolutions, and default values to detected parameters.
- **Adaptive UI**: If an equation contains no free parameters (e.g., $f(x) = x^3 - 2x$), the parameter panel cleanly collapses to prioritize graphing space.
- **Bi-Directional Highlighting**: Hovering over or focusing on a parameter highlights its corresponding term within the equation breakdown.

### 📈 Technical 2D Graph Paper Plotter
- **Millimeter Coordinate Grid**: Precision SVG plotting canvas styled after classical engineering graph paper with fine millimeter subdivisions and high-contrast axes.
- **Asymptotic Discontinuity Clipping**: Detects vertical asymptotes and poles (such as in $\tan(x)$ or $1/(x-1)$) and inserts path breaks to eliminate false vertical connector artifacts.
- **Signature Motion**: Smooth sketched draw-in animation along the curve (`stroke-dashoffset`) upon preset selection, paired with immediate zero-latency curve recalculations during slider adjustments.
- **Interactive Navigation**: Drag-to-pan across the Cartesian plane, mouse wheel zoom centered at the cursor, coordinate crosshairs, and live $(x, y)$ coordinate readouts.

### 🔍 Calculus Tangent & Derivative Engine
- **Numerical Derivative Computation**: Calculates $f'(x_0)$ live using central finite differences with machine-precision step tuning:
  $$f'(x_0) \approx \frac{f(x_0 + h) - f(x_0 - h)}{2h}$$
- **Draggable Evaluation Point**: Move $x_0$ interactively along the curve directly on the canvas or fine-tune via numeric slider.
- **Dynamic Tangent Line**: Displays the point-slope tangent line $y - y_0 = m(x - x_0)$ with slope indicator and coordinate readout.
- **Optional Secant Line Approximation**: Visualizes the finite difference quotient $\frac{\Delta y}{\Delta x}$ as $\Delta x \to 0$.

### 📊 Function Comparison & Residual Analysis
- **Dual Function Plotting**: Overlay a secondary function (such as Taylor series polynomials or Fourier harmonics) against the primary equation.
- **Error & Residual Metrics**: Computes live Maximum Residual ($\max |f(x) - g(x)|$) and Root-Mean-Square Error (RMSE) across the viewport domain.

### 🧊 3D Surface Visualizer ($z = f(x, y)$)
- **WebGL Geometry Engine**: Renders two-variable functions over an $8 \times 8$ domain using Three.js with custom vertex height recalculations.
- **Topological Inspection**: Smooth orbit controls (drag to rotate, wheel to zoom), lighting models, ground reference coordinate grids, and animated rotation.
- **Wireframe Toggle**: Switch between solid shaded chalkboard mesh and clean wireframe topology.

### 🔲 2×2 Linear Matrix Grid Warping
- **Basis Vector Transformation**: Visualizes the transformation matrix $A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}$ acting on the standard basis $\hat{i} = (1, 0)$ and $\hat{j} = (0, 1)$.
- **Warped Coordinate Net**: Transforms Cartesian grid lines under matrix multiplication to illustrate shears, rotations, scaling, and reflections.
- **Determinant Parallelogram**: Highlights the unit area signed determinant $\det(A) = ad - bc$, detecting rank collapse and orientation changes.
- **Geometric Presets**: One-click transformations for Identity, 90° Rotation, Shear X, Shear Y, Reflection, and Singular collapse ($\det = 0$).

### 🔗 URL State Serialization
- **Lossless State Sharing**: Encodes the active formula string, parameter slider values, calculus point $x_0$, view mode, and matrix values directly into query parameters.
- **Clipboard Integration**: Generates clean shareable URLs with copy confirmation.

---

## Aesthetic & Design System

FormulaLens is built on the **Notebook Mathematics** visual language:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `--paper` | `#F7F6F2` | Warm off-white drafting paper background |
| `--surface` | `#FFFFFF` | Elevated card & panel containers |
| `--ink` | `#1C1D21` | Deep technical near-black typography and primary axes |
| `--ink-muted` | `#575E66` | Secondary annotations, coordinate labels, and metadata |
| `--graph-line` | `#C9D6D9` | Millimeter drafting grid lines |
| `--accent-curve` | `#2E5F4E` | Chalkboard pine green for primary curves and basis vector $\hat{i}$ |
| `--accent-secondary` | `#A63D40` | Brick red for derivative tangents, comparison curves, and basis vector $\hat{j}$ |
| `--accent-warn` | `#B8860B` | Dark gold for asymptotic warnings and syntax alerts |

- **Typography**: Display titles typeset in **Fraunces**, UI controls in **Inter**, and all equations rendered in KaTeX's authentic **Latin Modern Math**.

---

## Architecture & Codebase Overview

```
├── index.html                           # Entry HTML with KaTeX & font CDNs
├── metadata.json                        # App manifest & permissions
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript configuration
├── vite.config.ts                       # Vite bundling configuration
└── src/
    ├── main.tsx                         # React application mounting point
    ├── App.tsx                          # Primary layout, state coordinator & URL sync
    ├── index.css                        # CSS variables & Tailwind directives
    ├── types.ts                         # Core TypeScript interfaces & data models
    ├── presets.ts                       # Pre-configured mathematical formulas & breakdowns
    ├── components/
    │   ├── Header.tsx                   # Top navigation bar, mode switcher & preset selector
    │   ├── FormulaHero.tsx              # KaTeX display, inline formula editor & symbol drawer
    │   ├── ParameterSliders.tsx         # Auto-generated reactive parameter sliders
    │   ├── TermBreakdown.tsx            # Structural term breakdown cards with math explanations
    │   ├── Plot2D.tsx                   # Interactive SVG 2D graph paper canvas & tangent overlay
    │   ├── CalculusPanel.tsx            # Tangent & secant evaluation controls
    │   ├── ComparisonPanel.tsx          # Dual-curve residual and RMSE analysis
    │   ├── Surface3D.tsx                # Three.js WebGL 3D surface plot for z = f(x, y)
    │   └── MatrixTransformVisualizer.tsx # 2D linear transformation & grid warping visualizer
    └── utils/
        ├── mathParser.ts                # AST parsing, free variable discovery, numerical derivatives
        └── urlState.ts                  # URL query parameter serialization & deserialization
```

---

## Technical Highlights

### 1. Robust Mathematical AST Parsing
Expressions are parsed using `mathjs.parse()`. The resulting AST is traversed to discover identifiers:
- Filters out reserved symbols ($\pi$, $e$, $\tau$, $\infty$, $i$) and mathematical functions (`sin`, `cos`, `exp`, `log`, etc.).
- Distinguishes independent variables ($x$ for 2D, $x$ and $y$ for 3D) from free coefficient parameters.
- Compiles expressions to native JavaScript functions via `mathNode.compile()` for evaluation performance during animation frames.

### 2. Discontinuity-Aware Curve Sampling
To prevent vertical connector spikes across asymptotic boundaries:
- Evaluates function values across uniform domain intervals.
- Detects non-finite values (`NaN`, `Infinity`, `-Infinity`).
- Flags extreme derivative jumps between adjacent points ($|y_{i} - y_{i-1}| > \text{threshold}$) and splits the SVG path into separate `<path>` segments.

### 3. Responsive WebGL Viewport
The 3D surface visualizer wraps a Three.js scene inside a container observed by `ResizeObserver`:
- Dynamically updates camera aspect ratio and renderer pixel dimensions on window or layout resize.
- Automatically normalizes high-DPI displays (`window.devicePixelRatio`).
- Recomputes vertex height offsets in-place on existing plane geometry without rebuilding GPU buffers.

---

## Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/FormulaLens.git
   cd FormulaLens
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   The development server will spin up on `http://localhost:3000`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Generates optimized static assets inside the `dist/` directory.

5. **Run TypeScript verification**:
   ```bash
   npm run lint
   ```

---

## Built-In Formula Presets

| Preset Name | Expression | Mode | Key Concepts Demonstrated |
| :--- | :--- | :--- | :--- |
| **General Sine Wave** | $a \cdot \sin(b \cdot x + c)$ | 2D | Amplitude ($a$), Angular Frequency ($b$), Phase Shift ($c$) |
| **Damped Oscillator** | $a \cdot \exp(-\gamma \cdot x) \cdot \cos(\omega \cdot x)$ | 2D | Exponential decay envelope, natural frequency, damping coefficient |
| **Gaussian Distribution** | $\frac{1}{\sigma \sqrt{2\pi}} \exp\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$ | 2D | Mean centering ($\mu$), standard deviation width ($\sigma$), normalization |
| **Polynomial Calculus** | $a \cdot x^3 - b \cdot x$ | Calculus | Local extrema, inflection points, dynamic tangent line & $f'(x_0)$ |
| **Rational Function** | $\frac{a}{x^2 - b^2}$ | 2D | Vertical asymptotes at $x = \pm b$, horizontal asymptote at $y = 0$ |
| **Sine vs Taylor Series** | $\sin(x)$ vs $x - \frac{x^3}{6} + \frac{x^5}{120}$ | Comparison | Polynomial approximations, radius of convergence, residual error |
| **3D Ripple Function** | $\sin(\sqrt{x^2 + y^2}) / (\sqrt{x^2 + y^2} + 0.1)$ | 3D | Circular symmetry, radial wave decay, 3D surface topography |
| **2×2 Matrix Transform** | $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ | Matrix | Basis vector mapping, linear combinations, coordinate grid shear, determinant |

---

## Technology Stack

- **Framework**: React 19
- **Language**: TypeScript 5.8
- **Styling**: Tailwind CSS v4
- **Mathematical Evaluation**: `mathjs`
- **Equation Typesetting**: `katex`
- **3D Graphics**: `three` (Three.js WebGL)
- **Icons**: `lucide-react`
- **Build Tool**: Vite 6

---

## License

This project is open source and available under the [MIT License](LICENSE).
