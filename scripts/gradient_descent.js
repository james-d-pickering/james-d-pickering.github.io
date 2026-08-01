// ── DOM elements ──────────────────────────────────────────────────────────────
const x0input = document.getElementById("x0input");
const etaslider = document.getElementById("etaslider");
const betaslider = document.getElementById("betaslider");
const tolslider = document.getElementById("tolslider");
const runbutton = document.getElementById("runbutton");
const runmomentumbutton = document.getElementById("runmomentumbutton");
const runacceleratedbutton = document.getElementById("runacceleratedbutton");
const clearbutton = document.getElementById("clearbutton");
const resetbutton = document.getElementById("resetbutton");
const showline = document.getElementById("showline");
const adaptivecb = document.getElementById("adaptivecb");
const nesterovbetacb = document.getElementById("nesterovbetacb");
const backtrackcb = document.getElementById("backtrackcb");
const armijocb = document.getElementById("armijocb");
const etasliderValue = document.getElementById("etasliderValue");
const betasliderValue = document.getElementById("betasliderValue");
const tolsliderValue = document.getElementById("tolsliderValue");
const funcselect = document.getElementById("funcselect");
const y0input = document.getElementById("y0input");
// ── helpers ───────────────────────────────────────────────────────────────────
function linspace(start, end, n) {
    const step = (end - start) / (n - 1);
    return Array.from({ length: n }, (_, i) => start + i * step);
}
const xs = linspace(-10, 10, 500);
function quadratic_f(x) {
    return x ** 2;
}
function quadratic_df(x) {
    return 2 * x;
}
function quartic_f(x) {
    return x ** 4 + 0.5 * x ** 3 - 2 * x ** 2;
}
function quartic_df(x) {
    return 4 * x ** 3 + 1.5 * x ** 2 - 4 * x;
}
function rosenbrock_f(x, y, a, b) {
    return (a - x) ** 2 + b * (y - x ** 2) ** 2;
}
function rosenbrock_df(x, y, a, b) {
    const dfdx = -2 * ((a - x) + 2 * b * x * (y - x ** 2));
    const dfdy = 2 * b * (y - x ** 2);
    const deriv = [dfdx, dfdy];
    return deriv;
}
function rosenbrock_f_2d(xy) {
    return rosenbrock_f(xy[0], xy[1], 1, 100);
}
function rosenbrock_df_2d(xy) {
    return rosenbrock_df(xy[0], xy[1], 1, 100);
}
function nesterov_beta(n) {
    return n / (n + 3);
}
function adaptive_eta(outarr, init_eta = 0.01) {
    const gradSumSq = outarr.reduce((acc, entry) => {
        const grad = entry[1];
        const normSq = Array.isArray(grad) ? grad.reduce((a, v) => a + v * v, 0) : grad ** 2;
        return acc + normSq;
    }, 0);
    if (outarr.length <= 2)
        return init_eta;
    return gradSumSq > 0 ? 1 / Math.sqrt(gradSumSq) : init_eta;
}
function backtrack(base, grad, step, f_cur, f, doArmijo = false) {
    const c = 0.3;
    const normSq = Array.isArray(grad)
        ? grad.reduce((a, v) => a + v * v, 0)
        : grad ** 2;
    let s = step; // s will be halved each failed attempt
    for (let i = 0; i < 50; i++) {
        // Trial point: move distance s in the descent direction (-grad) from base
        const x_try = Array.isArray(base)
            ? base.map((v, j) => v - s * grad[j])
            : base - s * grad;
        const f_try = f(x_try); // objective value at the trial point
        // Acceptance check:
        //   Simple:  f_try < f_cur                          (any decrease is fine)
        //   Armijo:  f_try ≤ f_cur − c·s·‖grad‖²           (decrease must be lower)
        //
        // The Armijo RHS gets smaller as s shrinks, so the condition eventually becomes
        // identical to the simple one — guaranteeing termination.
        const ok = doArmijo ? f_try <= f_cur - c * s * normSq : f_try < f_cur;
        if (ok)
            return s; // first s that passes → return it
        s *= 0.5; // otherwise halve and try again
    }
    return s; // fallback: return whatever tiny s remains after 50 halvings
}
function gradient_descent(x, f, df, eta, _beta, convtol, init_eta = 0.01, doBacktrack = false, doArmijo = false) {
    let n = 0;
    let tempgrad = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr = [[x, tempgrad, 0, Infinity]];
    let conv = Infinity;
    if (Array.isArray(x)) {
        let x_n = x;
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n + 1;
            const grad = df(x_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive')
                step = adaptive_eta(outarr, init_eta);
            if (doBacktrack)
                step = backtrack(x_n, grad, step, f(x_n), f, doArmijo);
            const x_n1 = x_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr;
    }
    let x_n = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n + 1;
        const grad = df(x_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive')
            step = adaptive_eta(outarr, init_eta);
        if (doBacktrack)
            step = backtrack(x_n, grad, step, f(x_n), f, doArmijo);
        const x_n1 = x_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr;
}
function momentum_gradient_descent(x, f, df, eta, beta, convtol, init_eta = 0.01, doBacktrack = false, doArmijo = false) {
    let n = 0;
    let tempgrad = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr = [[x, tempgrad, 0, Infinity]];
    let conv = Infinity;
    if (Array.isArray(x)) {
        let x_n = x;
        let x_prev = [...x];
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n + 1;
            const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
            const phi_n = x_n.map((v, i) => v + b * (v - x_prev[i]));
            const grad = df(x_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive')
                step = adaptive_eta(outarr, init_eta);
            if (doBacktrack)
                step = backtrack(phi_n, grad, step, f(x_n), f, doArmijo);
            const x_n1 = phi_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_prev = x_n;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr;
    }
    let x_n = x;
    let x_prev = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n + 1;
        const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
        const phi_n = x_n + b * (x_n - x_prev);
        const grad = df(x_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive')
            step = adaptive_eta(outarr, init_eta);
        if (doBacktrack)
            step = backtrack(phi_n, grad, step, f(x_n), f, doArmijo);
        const x_n1 = phi_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_prev = x_n;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr;
}
function accelerated_gradient_descent(x, f, df, eta, beta, convtol, init_eta = 0.01, doBacktrack = false, doArmijo = false) {
    let n = 0;
    let tempgrad = Array.isArray(x) ? new Array(x.length).fill(0) : 0;
    const outarr = [[x, tempgrad, 0, Infinity]];
    let conv = Infinity;
    if (Array.isArray(x)) {
        let x_n = x;
        let x_prev = [...x];
        let step = typeof eta === 'number' ? eta : init_eta;
        do {
            n = n + 1;
            const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
            const phi_n = x_n.map((v, i) => v + b * (v - x_prev[i]));
            const grad = df(phi_n);
            outarr.push([x_n, grad, n, Infinity]);
            if (eta === 'adaptive')
                step = adaptive_eta(outarr, init_eta);
            if (doBacktrack)
                step = backtrack(phi_n, grad, step, f(x_n), f, doArmijo);
            let x_n1 = phi_n.map((v, i) => v - step * grad[i]);
            conv = Math.abs(f(x_n1) - f(x_n));
            outarr[outarr.length - 1][0] = x_n1;
            outarr[outarr.length - 1][3] = conv;
            x_prev = x_n;
            x_n = x_n1;
        } while (conv > convtol && n < 10000 && isFinite(conv));
        return outarr;
    }
    let x_n = x;
    let x_prev = x;
    let step = typeof eta === 'number' ? eta : init_eta;
    do {
        n = n + 1;
        const b = beta === 'nesterov' ? nesterov_beta(n) : beta;
        const phi_n = x_n + b * (x_n - x_prev);
        const grad = df(phi_n);
        outarr.push([x_n, grad, n, Infinity]);
        if (eta === 'adaptive')
            step = adaptive_eta(outarr, init_eta);
        if (doBacktrack)
            step = backtrack(phi_n, grad, step, f(x_n), f, doArmijo);
        const x_n1 = phi_n - step * grad;
        conv = Math.abs(f(x_n1) - f(x_n));
        outarr[outarr.length - 1][0] = x_n1;
        outarr[outarr.length - 1][3] = conv;
        x_prev = x_n;
        x_n = x_n1;
    } while (conv > convtol && n < 10000 && isFinite(conv));
    return outarr;
}
// ── per-function defaults ─────────────────────────────────────────────────────
const funcDefaults = {
    quad: { eta: '-1', beta: '0', tol: '-6', x0: '2', y0: '0' },
    quar: { eta: '-2', beta: '0', tol: '-6', x0: '-0.3', y0: '0' },
    ros: { eta: '-3.7', beta: '0', tol: '-6', x0: '-1', y0: '1' },
};
function setDefaults(func) {
    const d = funcDefaults[func];
    if (!d)
        return;
    etaslider.value = d.eta;
    betaslider.value = d.beta;
    tolslider.value = d.tol;
    x0input.value = d.x0;
    y0input.value = d.y0;
    etasliderValue.textContent = (10 ** Number(d.eta)).toExponential(1);
    betasliderValue.textContent = Number(d.beta).toFixed(2);
    tolsliderValue.textContent = `1e${d.tol}`;
}
// ── chart setup ───────────────────────────────────────────────────────────────
const xs2d = xs;
const ys2d = linspace(-0.5, 3, 300);
const descentTraces = [
    { x: [], y: [], mode: "markers", name: "GD",
        marker: { color: "tomato", symbol: "circle", size: 8 } },
    { x: [], y: [], mode: "markers", name: "Momentum",
        marker: { color: "darkgreen", symbol: "triangle-up", size: 8 } },
    { x: [], y: [], mode: "markers", name: "Accelerated",
        marker: { color: "purple", symbol: "cross", size: 8 } },
];
function getTraceZero(func) {
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
function getLayout(func) {
    return {
        xaxis: { title: func === 'ros' ? "x" : "x", range: [-2, 2] },
        yaxis: Object.assign(Object.assign({ title: func === 'ros' ? "y" : "y" }, (func === 'quar' ? { range: [-2, 2] } : {})), (func === 'quad' ? { range: [-1, 2] } : {})),
        showlegend: true, margin: { t: 20 },
    };
}
function setupChart() {
    const func = funcselect.value;
    const emptyTraces = descentTraces.map(t => (Object.assign(Object.assign({}, t), { x: [], y: [] })));
    Plotly.react("chart", [getTraceZero(func), ...emptyTraces], getLayout(func));
}
setDefaults(funcselect.value);
setupChart();
// ── run ───────────────────────────────────────────────────────────────────────
function run(alg, traceIndex, stepsSpan = null) {
    const etaRaw = 10 ** Number(etaslider.value);
    const eta = adaptivecb.checked ? 'adaptive' : etaRaw;
    const beta = nesterovbetacb.checked ? 'nesterov' : Number(betaslider.value);
    const convtol = 10 ** Number(tolslider.value);
    etasliderValue.textContent = adaptivecb.checked ? `Adaptive` : etaRaw.toExponential(1);
    betasliderValue.textContent = nesterovbetacb.checked ? 'Nesterov' : Number(betaslider.value).toFixed(2);
    tolsliderValue.textContent = `1e${tolslider.value}`;
    const func = funcselect.value;
    const is2d = func === 'ros';
    let f, df;
    if (func === 'quar') {
        f = quartic_f;
        df = quartic_df;
    }
    else if (func === 'ros') {
        f = rosenbrock_f_2d;
        df = rosenbrock_df_2d;
    }
    else {
        f = quadratic_f;
        df = quadratic_df;
    }
    const x0 = is2d
        ? [Number(x0input.value), Number(y0input.value)]
        : Number(x0input.value);
    const outarr = alg(x0, f, df, eta, beta, convtol, etaRaw, backtrackcb.checked, armijocb.checked);
    const lastEntry = outarr[outarr.length - 1];
    const lastConv = lastEntry[lastEntry.length - 1];
    const converged = isFinite(lastConv) && lastConv <= convtol;
    if (stepsSpan) {
        if (converged) {
            stepsSpan.textContent = `${outarr.length - 1} steps`;
            stepsSpan.style.color = "";
        }
        else {
            stepsSpan.textContent = "did not converge";
            stepsSpan.style.color = "crimson";
        }
    }
    let px, py;
    if (is2d) {
        const pts = outarr.map(([x_n]) => x_n).filter(v => isFinite(v[0]) && isFinite(v[1]));
        px = pts.map(v => v[0]);
        py = pts.map(v => v[1]);
    }
    else {
        px = outarr.map(([x_n]) => x_n).filter(isFinite);
        py = px.map(v => f(v));
        Plotly.restyle("chart", { y: [xs.map(v => f(v))] }, 0);
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
    if (!backtrackcb.checked)
        armijocb.checked = false;
});
etaslider.addEventListener('input', () => { etasliderValue.textContent = (10 ** Number(etaslider.value)).toExponential(1); });
betaslider.addEventListener('input', () => { betasliderValue.textContent = betaslider.value; });
tolslider.addEventListener('input', () => { tolsliderValue.textContent = `1e${tolslider.value}`; });
etasliderValue.textContent = (10 ** Number(etaslider.value)).toExponential(1);
betasliderValue.textContent = betaslider.value;
tolsliderValue.textContent = `1e${tolslider.value}`;
const gdsteps = document.getElementById("gdsteps");
const momentumsteps = document.getElementById("momentumsteps");
const acceleratedsteps = document.getElementById("acceleratedsteps");
runbutton.addEventListener('click', () => run(gradient_descent, 1, gdsteps));
runmomentumbutton.addEventListener('click', () => run(momentum_gradient_descent, 2, momentumsteps));
runacceleratedbutton.addEventListener('click', () => run(accelerated_gradient_descent, 3, acceleratedsteps));
clearbutton.addEventListener("click", () => {
    Plotly.restyle("chart", { x: [[]], y: [[]] }, [1, 2, 3]);
    [gdsteps, momentumsteps, acceleratedsteps].forEach(s => { s.textContent = ""; s.style.color = ""; });
});
resetbutton.addEventListener("click", () => {
    Plotly.relayout("chart", { "xaxis.range": [-2, 2], "yaxis.autorange": true });
});
export {};
