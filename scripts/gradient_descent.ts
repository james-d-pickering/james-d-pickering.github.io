export {};
declare const Plotly: any;

// ── DOM elements ──────────────────────────────────────────────────────────────
const x0input          = document.getElementById("x0input") as HTMLInputElement;
const etaslider        = document.getElementById("etaslider") as HTMLInputElement;
const betaslider       = document.getElementById("betaslider") as HTMLInputElement;
const tolslider        = document.getElementById("tolslider") as HTMLInputElement;
const runbutton        = document.getElementById("runbutton") as HTMLInputElement;
const runmomentumbutton    = document.getElementById("runmomentumbutton") as HTMLInputElement;
const runacceleratedbutton = document.getElementById("runacceleratedbutton") as HTMLInputElement;
const clearbutton      = document.getElementById("clearbutton") as HTMLInputElement;
const resetbutton      = document.getElementById("resetbutton") as HTMLInputElement;
const showline         = document.getElementById("showline") as HTMLInputElement;
const adaptivecb       = document.getElementById("adaptivecb") as HTMLInputElement;
const nesterovbetacb   = document.getElementById("nesterovbetacb") as HTMLInputElement;
const backtrackcb      = document.getElementById("backtrackcb") as HTMLInputElement;
const armijocb         = document.getElementById("armijocb") as HTMLInputElement;
const etasliderValue   = document.getElementById("etasliderValue") as HTMLSpanElement;
const betasliderValue  = document.getElementById("betasliderValue") as HTMLSpanElement;
const tolsliderValue   = document.getElementById("tolsliderValue") as HTMLSpanElement;
const funcselect       = document.getElementById("funcselect") as HTMLSelectElement;
const y0input          = document.getElementById("y0input") as HTMLInputElement;

// ── helpers ───────────────────────────────────────────────────────────────────
function linspace(start: number, end: number, n: number): number[] {
    const step = (end - start) / (n - 1);
    return Array.from({ length: n }, (_, i) => start + i * step);
}

const xs = linspace(-10,10, 500);

function quadratic_f(x:  number): number {
    return x**2;
}

function quadratic_df(x:  number): number {
    return 2*x;
}

function quartic_f(x:  number): number {
    return x**4 + 0.5* x**3 - 2*x**2;
}

function quartic_df(x:  number): number {
    return 4*x**3 + 1.5* x**2 - 4*x;
}

function rosenbrock_f(x: number, y: number, a: number, b: number): number {
    return (a - x)**2 + b*(y - x**2)**2
}

function rosenbrock_df(x: number, y: number, a: number, b: number): number[] {
    const dfdx = -2*((a-x)+2*b*x*(y-x**2));
    const dfdy = 2*b*(y-x**2)
    const deriv = [dfdx, dfdy];
    return deriv
}

function rosenbrock_f_2d(xy: number[]): number {
    return rosenbrock_f(xy[0], xy[1], 1, 100);
}

function rosenbrock_df_2d(xy: number[]): number[] {
    return rosenbrock_df(xy[0], xy[1], 1, 100);
}

function nesterov_beta(n: number): number {
    return n / (n + 3);
}

function adaptive_eta(outarr: [(number | number[]), (number | number[]), number, number][], init_eta: number = 0.01): number {
    const gradSumSq = outarr.reduce((acc, entry) => {
    const grad = entry[1];
    const normSq = Array.isArray(grad) ? grad.reduce((a, v) => a + v * v, 0) : (grad as number) ** 2;
        return acc + normSq;
    }, 0);
    if (outarr.length <= 2) return init_eta;
    return gradSumSq > 0 ? 1 / Math.sqrt(gradSumSq) : init_eta;
}

function backtrack(base: number[] | number, grad: number[] | number,
                   step: number, f_cur: number, f: Function, doArmijo: boolean = false): number {

    const c = 0.3;

    const normSq = Array.isArray(grad)
        ? (grad as number[]).reduce((a, v) => a + v * v, 0)
        : (grad as number) ** 2;

    let s = step; // s will be halved each failed attempt
    for (let i = 0; i < 50; i++) {

        // Trial point: move distance s in the descent direction (-grad) from base
        const x_try = Array.isArray(base)
            ? (base as number[]).map((v, j) => v - s * (grad as number[])[j])
            : (base as number) - s * (grad as number);

        const f_try = f(x_try) as number; // objective value at the trial point

        // Acceptance check:
        //   Simple:  f_try < f_cur                          (any decrease is fine)
        //   Armijo:  f_try ≤ f_cur − c·s·‖grad‖²           (decrease must be lower)
        //
        // The Armijo RHS gets smaller as s shrinks, so the condition eventually becomes
        // identical to the simple one — guaranteeing termination.
        const ok = doArmijo ? f_try <= f_cur - c * s * normSq : f_try < f_cur;
        if (ok) return s; // first s that passes → return it
        s *= 0.5;         // otherwise halve and try again
    }
    return s; // fallback: return whatever tiny s remains after 50 halvings
}

function gradient_descent(x: number[] | number, f: Function, df: Function, eta: number | 'adaptive', _beta: number, convtol: number, init_eta: number = 0.01, doBacktrack: boolean = false, doArmijo: boolean = false): [(number | number[]), (number | number[]), number, number][] {

    let n = 0;
    let tempgrad: number[] | number = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr: [(number | number[]), (number | number[]), number, number][] = [[x, tempgrad, 0, Infinity]];
    let conv: number = Infinity;

    if (Array.isArray(x)) {
        let x_n: number[] = x;
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n+1;
            const grad: number[] = df(x_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
            if (doBacktrack) step = backtrack(x_n, grad, step, f(x_n) as number, f, doArmijo);
            const x_n1: number[] = x_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr
    }

    let x_n: number = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n+1;
        const grad: number = df(x_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
        if (doBacktrack) step = backtrack(x_n, grad, step, f(x_n) as number, f, doArmijo);
        const x_n1: number = x_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr
}

function momentum_gradient_descent(x: number[] | number, f: Function, df: Function, eta: number | 'adaptive', beta: number | 'nesterov', convtol: number, init_eta: number = 0.01, doBacktrack: boolean = false, doArmijo: boolean = false): [(number | number[]), (number | number[]), number, number][] {

    let n = 0;
    let tempgrad: number[] | number = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr: [(number | number[]), (number | number[]), number, number][] = [[x, tempgrad, 0, Infinity]];
    let conv: number = Infinity;

    if (Array.isArray(x)) {
        let x_n: number[] = x;
        let x_prev: number[] = [...x];
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n+1;
            const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
            const phi_n: number[] = x_n.map((v, i) => v + b * (v - x_prev[i]));
            const grad: number[] = df(x_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
            if (doBacktrack) step = backtrack(phi_n, grad, step, f(x_n) as number, f, doArmijo);
            const x_n1: number[] = phi_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_prev = x_n;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr
    }

    let x_n: number = x;
    let x_prev: number = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n+1;
        const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
        const phi_n = x_n + b * (x_n - x_prev);
        const grad: number = df(x_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
        if (doBacktrack) step = backtrack(phi_n, grad, step, f(x_n) as number, f, doArmijo);
        const x_n1: number = phi_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_prev = x_n;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr
}

function accelerated_gradient_descent(x: number[] | number, f: Function, df: Function, eta: number | 'adaptive', beta: number | 'nesterov', convtol: number, init_eta: number = 0.01, doBacktrack: boolean = false, doArmijo: boolean = false): [(number | number[]), (number | number[]), number, number][] {

    let n = 0;
    let tempgrad: number[] | number = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr: [(number | number[]), (number | number[]), number, number][] = [[x, tempgrad, 0, Infinity]];
    let conv: number = Infinity;

    if (Array.isArray(x)) {
        let x_n: number[] = x;
        let x_prev: number[] = [...x];
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n+1;
            const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
            const phi_n: number[] = x_n.map((v, i) => v + b * (v - x_prev[i]));
            const grad: number[] = df(phi_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
            if (doBacktrack) step = backtrack(phi_n, grad, step, f(x_n) as number, f, doArmijo);
            let x_n1: number[] = phi_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_prev = x_n;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr
    }

    let x_n: number = x;
    let x_prev: number = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n+1;
        const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
        const phi_n = x_n + b * (x_n - x_prev);
        const grad: number = df(phi_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive') step = adaptive_eta(outarr, init_eta);
        if (doBacktrack) step = backtrack(phi_n, grad, step, f(x_n) as number, f, doArmijo);
        const x_n1: number = phi_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_prev = x_n;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr
}

// ── per-function defaults ─────────────────────────────────────────────────────
const funcDefaults: Record<string, { eta: string; beta: string; tol: string; x0: string; y0: string }> = {
    quad: { eta: '-1',   beta: '0', tol: '-6', x0:  '2',    y0: '0'   },
    quar: { eta: '-2',   beta: '0', tol: '-6', x0: '-0.3',  y0: '0'   },
    ros:  { eta: '-3.7', beta: '0', tol: '-6', x0: '-1',    y0: '1'   },
};

function setDefaults(func: string): void {
    const d = funcDefaults[func];
    if (!d) return;
    etaslider.value  = d.eta;
    betaslider.value = d.beta;
    tolslider.value  = d.tol;
    x0input.value    = d.x0;
    y0input.value    = d.y0;
    etasliderValue.textContent  = (10 ** Number(d.eta)).toExponential(1);
    betasliderValue.textContent = Number(d.beta).toFixed(2);
    tolsliderValue.textContent  = `1e${d.tol}`;
}

// ── chart setup ───────────────────────────────────────────────────────────────
const xs2d = xs;
const ys2d = linspace(-0.5, 3, 300);

const descentTraces = [
    { x: [], y: [], mode: "markers", name: "GD",
      marker: { color: "tomato",    symbol: "circle",      size: 8 } },
    { x: [], y: [], mode: "markers", name: "Momentum",
      marker: { color: "darkgreen", symbol: "triangle-up", size: 8 } },
    { x: [], y: [], mode: "markers", name: "Accelerated",
      marker: { color: "purple",    symbol: "cross",       size: 8 } },
];

function getTraceZero(func: string): object {
    if (func === 'ros') {
        return {
            type: "contour", x: xs2d, y: ys2d,
            z: ys2d.map(y => xs2d.map(x => Math.min(rosenbrock_f_2d([x, y]), 2000))),
            colorscale: "Viridis", ncontours: 25,
            contours: { coloring: "heatmap" },
            showscale: false, showlegend: false,
        };
    }
    const f = func === 'quar' ? quartic_f : quadratic_f;
    return { x: xs, y: xs.map(x => f(x)), mode: "lines",
             line: { color: "steelblue", width: 2 }, showlegend: false };
}

function getLayout(func: string): object {
    return {
        xaxis: { title: func === 'ros' ? "x" : "x", range: [-2, 2] },
        yaxis: {
            title: func === 'ros' ? "y" : "y",
            ...(func === 'quar' ? { range: [-2,  2] } : {}),
            ...(func === 'quad' ? { range: [-1,  2] } : {}),
        },
        showlegend: true, margin: { t: 20 },
    };
}

function setupChart(): void {
    const func = funcselect.value;
    const emptyTraces = descentTraces.map(t => ({ ...t, x: [], y: [] }));
    Plotly.react("chart", [getTraceZero(func), ...emptyTraces], getLayout(func));
}

setDefaults(funcselect.value);
setupChart();

// ── run ───────────────────────────────────────────────────────────────────────
function run(alg: Function, traceIndex: number, stepsSpan: HTMLSpanElement | null = null): void {
    const etaRaw  = 10 ** Number(etaslider.value);
    const eta: number | 'adaptive' = adaptivecb.checked ? 'adaptive' : etaRaw;
    const beta: number | 'nesterov' = nesterovbetacb.checked ? 'nesterov' : Number(betaslider.value);
    const convtol = 10 ** Number(tolslider.value);
    etasliderValue.textContent  = adaptivecb.checked ? `Adaptive` : etaRaw.toExponential(1);
    betasliderValue.textContent = nesterovbetacb.checked ? 'Nesterov' : Number(betaslider.value).toFixed(2);
    tolsliderValue.textContent  = `1e${tolslider.value}`;

    const func = funcselect.value;
    const is2d = func === 'ros';

    let f: Function, df: Function;
    if      (func === 'quar') { f = quartic_f;       df = quartic_df; }
    else if (func === 'ros')  { f = rosenbrock_f_2d; df = rosenbrock_df_2d; }
    else                      { f = quadratic_f;     df = quadratic_df; }

    const x0: number[] | number = is2d
        ? [Number(x0input.value), Number(y0input.value)]
        : Number(x0input.value);

    const outarr: [(number | number[]), number, number][] = alg(x0, f, df, eta, beta, convtol, etaRaw, backtrackcb.checked, armijocb.checked);

    const lastEntry = outarr[outarr.length - 1] as any[];
    const lastConv = lastEntry[lastEntry.length - 1] as number;
    const converged = isFinite(lastConv) && lastConv <= convtol;
    if (stepsSpan) {
        if (converged) {
            stepsSpan.textContent = `${outarr.length - 1} steps`;
            stepsSpan.style.color = "";
        } else {
            stepsSpan.textContent = "did not converge";
            stepsSpan.style.color = "crimson";
        }
    }

    let px: number[], py: number[];
    if (is2d) {
        const pts = outarr.map(([x_n]) => x_n as number[]).filter(v => isFinite(v[0]) && isFinite(v[1]));
        px = pts.map(v => v[0]);
        py = pts.map(v => v[1]);
    } else {
        px = outarr.map(([x_n]) => x_n as number).filter(isFinite);
        py = px.map(v => (f as (x: number) => number)(v));
        Plotly.restyle("chart", { y: [xs.map(v => (f as (x: number) => number)(v))] }, 0);
    }

    const mode = showline.checked ? "markers+lines" : "markers";
    Plotly.restyle("chart", { x: [px], y: [py], mode: [mode] }, traceIndex);
}

// ── event listeners ───────────────────────────────────────────────────────────
funcselect.addEventListener('change', () => { setDefaults(funcselect.value); setupChart(); });
nesterovbetacb.addEventListener('change', () => {
    betaslider.disabled = nesterovbetacb.checked;
    betasliderValue.textContent = nesterovbetacb.checked ? 'Nesterov' : Number(betaslider.value).toFixed(2);
});

adaptivecb.addEventListener('change', () => {
    etaslider.disabled = adaptivecb.checked;
    etasliderValue.textContent = adaptivecb.checked ? 'Adaptive' : (10 ** Number(etaslider.value)).toExponential(1);
});

backtrackcb.addEventListener('change', () => {
    armijocb.disabled = !backtrackcb.checked;
    if (!backtrackcb.checked) armijocb.checked = false;
});
etaslider.addEventListener('input',  () => { etasliderValue.textContent  = (10 ** Number(etaslider.value)).toExponential(1); });
betaslider.addEventListener('input', () => { betasliderValue.textContent = betaslider.value; });
tolslider.addEventListener('input',  () => { tolsliderValue.textContent  = `1e${tolslider.value}`; });

etasliderValue.textContent  = (10 ** Number(etaslider.value)).toExponential(1);
betasliderValue.textContent = betaslider.value;
tolsliderValue.textContent  = `1e${tolslider.value}`;

const gdsteps          = document.getElementById("gdsteps") as HTMLSpanElement;
const momentumsteps    = document.getElementById("momentumsteps") as HTMLSpanElement;
const acceleratedsteps = document.getElementById("acceleratedsteps") as HTMLSpanElement;

runbutton.addEventListener('click',            () => run(gradient_descent,             1, gdsteps));
runmomentumbutton.addEventListener('click',    () => run(momentum_gradient_descent,    2, momentumsteps));
runacceleratedbutton.addEventListener('click', () => run(accelerated_gradient_descent, 3, acceleratedsteps));

clearbutton.addEventListener("click", () => {
    Plotly.restyle("chart", { x: [[]], y: [[]] }, [1, 2, 3]);
    [gdsteps, momentumsteps, acceleratedsteps].forEach(s => { s.textContent = ""; s.style.color = ""; });
});

resetbutton.addEventListener("click", () => {
    Plotly.relayout("chart", { "xaxis.range": [-2, 2], "yaxis.autorange": true });
});

