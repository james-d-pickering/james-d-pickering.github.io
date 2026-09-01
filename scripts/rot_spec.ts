export {};
declare const Plotly: any;

// ── physical constants (as in the Python original) ────────────────────────────
const h_planck = 6.626e-34;   // J s
const c_light  = 2.997e10;    // cm s^-1
const k_b      = 1.38e-23;    // J K^-1

// ── DOM elements ──────────────────────────────────────────────────────────────
const bSlider      = document.getElementById("bSlider") as HTMLInputElement;
const bValue       = document.getElementById("bValue") as HTMLSpanElement;
const dSlider      = document.getElementById("dSlider") as HTMLInputElement;
const dValue       = document.getElementById("dValue") as HTMLSpanElement;
const dWarn        = document.getElementById("dWarn") as HTMLSpanElement;
const tSlider      = document.getElementById("tSlider") as HTMLInputElement;
const tValue       = document.getElementById("tValue") as HTMLSpanElement;
const lSlider      = document.getElementById("lSlider") as HTMLInputElement;
const lValue       = document.getElementById("lValue") as HTMLSpanElement;
const jmaxInput    = document.getElementById("jmaxInput") as HTMLInputElement;
const normalisecb  = document.getElementById("normalisecb") as HTMLInputElement;
const autoscalecb  = document.getElementById("autoscalecb") as HTMLInputElement;
const presetdropdown = document.getElementById("presetdropdown") as HTMLSelectElement;
const fitbutton    = document.getElementById("fitbutton") as HTMLButtonElement;
const zoombutton   = document.getElementById("zoombutton") as HTMLButtonElement;

const chart_id = "rotspec_chart";

// ── defaults ──────────────────────────────────────────────────────────────────
const t_init         = 200;     // K
const linewidth_init = 0.1;     // cm^-1

const maxJ_cap = 500;           // guard against silly values typed into the box

const w_points = 10000;

// ── molecule presets ──────────────────────────────────────────────────────────
// B and D in cm^-1, taken from CCCBDB. D calculated from B and w.
interface Molecule { name: string; B: number; D: number; }

const molecules: Record<string, Molecule> = {
    hcl: { name: "HCl", B: 10.592, D: 0.57e-3 },
    dcl: { name: "DCl", B: 5.449,  D: 0.14e-3 },
    oh:  { name: "OH",  B: 18.91,  D: 2.12e-3 },
    icl: { name: "ICl", B: 0.114,  D: 0.00004e-3 },
    heh: { name: "HeH (calculated)", B: 0.878,  D: 27e-3 },
};

// ── helpers ───────────────────────────────────────────────────────────────────
function linspace(start: number, end: number, num: number): number[] {
    const arr: number[] = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + step * i);
    }
    return arr;
}

function maxOf(arr: number[]): number {
    let m = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > m) m = arr[i];
    }
    return m;
}

// ── the D slider ──────────────────────────────────────────────────────────────
// The slider carries a 0 ->1 fraction that is converted into a D, so it scales with the size of B.
const d_ratio_max    = 1 / 20;
const d_slider_power = 5;

function sliderToD(fraction: number, B: number): number {
    return B * d_ratio_max * fraction ** d_slider_power;
}

function dToSlider(D: number, B: number): number {
    const fraction = (D / (B * d_ratio_max)) ** (1 / d_slider_power);
    return Math.min(1, Math.max(0, fraction));
}

// flag that raises a warning when D gets unphysically large
const d_ratio_flag = 1e-3;

// ── lineshape ─────────────────────────────────────────────────────────────────
// assuming real absorptive part of a lorentzian lineshape, some faff here to avoid it skipping lines if they get narrower than the grid spacing.
function addLorentzian(spec: number[], x: number[], step: number,
                       w0: number, gamma: number, A: number): void {
    const n = x.length;
    const g2 = gamma * gamma;

    let k = Math.round((w0 - x[0]) / step);
    if (k < 0) k = 0;
    else if (k > n - 1) k = n - 1;

    const dx_nearest = x[k] - w0;
    const peakMax = 1 / (dx_nearest * dx_nearest + g2);
    if (!isFinite(peakMax) || peakMax <= 0) return;

    const scale = A / peakMax;
    for (let i = 0; i < n; i++) {
        const dx = x[i] - w0;
        spec[i] += scale / (dx * dx + g2);
    }
}

// ── spectrum ──────────────────────────────────────────────────────────────────
// Rigid rotor with centrifugal distortion. Both the line positions and the
// level populations come from the same term energy,
//
//     E_J  = B J(J+1) - D J^2 (J+1)^2                      (cm^-1)
//     dE   = E_{J+1} - E_J = 2B(J+1) - 4D(J+1)^3           (cm^-1)
//
// The line is placed at dE, but the intensity is set by the population of the
// *lower* level J: the (2J+1) degeneracy against a Boltzmann factor in E_J.
interface Line { nu: number; pop: number; }

function rotationalLines(maxJ: number, B: number, D: number, N0: number, T: number): Line[] {
    const lines: Line[] = [];

    for (let J = 0; J < maxJ; J++) {
        const term_energy = B * J * (J + 1) - D * (J * (J + 1)) ** 2;   // cm^-1
        const dE = 2 * B * (J + 1) - 4 * D * (J + 1) ** 3;              // cm^-1

        if (term_energy < 0 || dE <= 0) break;


        const boltzmann = T > 0
            ? Math.exp(-(term_energy * h_planck * c_light) / (k_b * T))
            : (term_energy === 0 ? 1 : 0);

        lines.push({ nu: dE, pop: (2 * J + 1) * N0 * boltzmann });
    }

    return lines;
}

function spectrumFromLines(x: number[], step: number, lines: Line[], linewidth: number): number[] {
    const spec = new Array<number>(x.length).fill(0);
    for (const line of lines) {
        addLorentzian(spec, x, step, line.nu, linewidth, line.pop);
    }
    return spec;
}

// neat claude way of making the sampling grid dynamic 
function gridTop(lines: Line[]): number {
    let top = 0;
    for (const line of lines) {
        if (line.nu > top) top = line.nu;
    }
    return top > 0 ? top * 1.05 : 1;
}

// The window holding every line worth looking at, for the fit button.
function fitRange(lines: Line[], linewidth: number, top: number): [number, number] {
    const peak = Math.max(...lines.map(l => l.pop), 0);
    if (peak <= 0) return [0, top];

    const cutoff = peak * 1e-3;
    let lo = Infinity, hi = 0;
    for (const line of lines) {
        if (line.pop < cutoff) continue;
        if (line.nu < lo) lo = line.nu;
        if (line.nu > hi) hi = line.nu;
    }
    if (!isFinite(lo)) return [0, top];

    const pad = Math.max((hi - lo) * 0.05, 5 * linewidth);
    return [Math.max(0, lo - pad), Math.min(top, hi + pad)];
}

// ── current state ─────────────────────────────────────────────────────────────
function currentMaxJ(): number {
    let m = Math.floor(Number(jmaxInput.value));
    if (!isFinite(m) || m < 1) m = 1;
    if (m > maxJ_cap) m = maxJ_cap;
    if (String(m) !== jmaxInput.value) jmaxInput.value = String(m);
    return m;
}

interface State {
    B: number; D: number; T: number; linewidth: number;
    lines: Line[]; top: number; x: number[]; spec: number[];
}

function currentState(): State {
    const B = Number(bSlider.value);
    const D = sliderToD(Number(dSlider.value), B);
    const T = Number(tSlider.value);
    const linewidth = Number(lSlider.value);

    const lines = rotationalLines(currentMaxJ(), B, D, 1, T);
    const top = gridTop(lines);
    const x = linspace(0, top, w_points);
    const spec = spectrumFromLines(x, top / (w_points - 1), lines, linewidth);

    return { B, D, T, linewidth, lines, top, x, spec };
}

let state = currentState();

// ── chart ─────────────────────────────────────────────────────────────────────
const trace = {
    x: state.x,
    y: state.spec,
    mode: "lines",
    name: "Rotational Spectrum",
    line: { color: "#0015FF", width: 1 },
    hovertemplate: "%{x:.4g} cm<sup>-1</sup><br>%{y:.3g}<extra></extra>",
};

const layout = {
    xaxis: { title: { text: "Wavenumber [cm<sup>-1</sup>]" },
             range: fitRange(state.lines, state.linewidth, state.top) },
    yaxis: { title: { text: "Intensity" }, range: [0, maxOf(state.spec)] },
    showlegend: false,
    margin: { t: 20, r: 20 },
};

Plotly.newPlot(chart_id, [trace], layout, { responsive: true, displaylogo: false });

// ── controls ──────────────────────────────────────────────────────────────────
function updateLabels(s: State): void {
    bValue.textContent = s.B.toFixed(3);
    dValue.textContent = s.D.toExponential(2);
    tValue.textContent = s.T.toFixed(0);
    lValue.textContent = s.linewidth.toFixed(2);

    dWarn.textContent = s.D > s.B * d_ratio_flag ? " — unusually large" : "";
}

function updateGraph(): void {
    state = currentState();
    updateLabels(state);

    const specMax = maxOf(state.spec);
    const normalised = normalisecb.checked && specMax > 0;
    if (normalised) {
        for (let i = 0; i < state.spec.length; i++) state.spec[i] /= specMax;
    }

    Plotly.restyle(chart_id, { x: [state.x], y: [state.spec] }, 0);

    if (normalised) {
        Plotly.relayout(chart_id, { "yaxis.range": [0, 1] });
    } else if (autoscalecb.checked) {
        Plotly.relayout(chart_id, { "yaxis.range": [0, specMax > 0 ? specMax : 1] });
    }
    // otherwise the y range is left wherever it was, as in the matplotlib version
}

function fitX(): void {
    Plotly.relayout(chart_id, { "xaxis.range": fitRange(state.lines, state.linewidth, state.top) });
}

function applyPreset(key: string): void {
    const molecule = molecules[key];
    if (!molecule) return;
    bSlider.value = String(molecule.B);
    dSlider.value = String(dToSlider(molecule.D, molecule.B));
    updateGraph();
    fitX();
}

updateLabels(state);

// Moving B or D by hand means the spectrum is no longer the chosen molecule.
function markCustom(): void {
    presetdropdown.value = "custom";
}

bSlider.addEventListener("input", () => { markCustom(); updateGraph(); });
dSlider.addEventListener("input", () => { markCustom(); updateGraph(); });
tSlider.addEventListener("input", updateGraph);
lSlider.addEventListener("input", updateGraph);
jmaxInput.addEventListener("change", updateGraph);
normalisecb.addEventListener("change", updateGraph);
autoscalecb.addEventListener("change", updateGraph);
presetdropdown.addEventListener("change", () => applyPreset(presetdropdown.value));

fitbutton.addEventListener("click", fitX);

zoombutton.addEventListener("click", () => {
    Plotly.relayout(chart_id, { "xaxis.range": [0, state.top], "yaxis.autorange": true });
});
