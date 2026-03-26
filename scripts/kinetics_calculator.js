import * as ODE from "./ODE_solvers.js";
const k1slider = document.getElementById("k1Slider");
const k1Value = document.getElementById("k1Value");
const A0slider = document.getElementById("A0Slider");
const A0Value = document.getElementById("A0Value");
const orderdropdown = document.getElementById("orderdropdown");
const kinetics_ctx = document.getElementById("kinetics_chart").getContext("2d");
const zoombutton = document.getElementById("zoombutton");
const sliders = [k1slider, A0slider];
const values = [k1Value, A0Value];
const dropdowns = [orderdropdown];
const A0_init = 1;
const k1_init = 1;
let ts = ODE.linspace(0, 10, 1000);
// single example
// const y0: number = 1;
// const h: number = 10;
// const k: number = 0.2;
// const trange: number[] = [0, 50];
// const tvals: number[] = arange(trange[0], trange[1], h);
// console.log(tvals);
// let exact_sol = RK4_example_sol(tvals, y0, k);
// let approx_sol = RK4_solver(RK4_example_func, trange, y0, h, false, k);
// console.log(exact_sol);
// console.log(approx_sol);
// example for a system of equations
const y0 = [1, 0, 0];
const h = 1;
const ks = [1, 1, 1];
const trange = [0, 10];
const tvals = ODE.arange(trange[0], trange[1], h);
//let exact_sol: any[] = ODERK4_array_example_sol(tvals, y0, ks[0]);
let solution = ODE.RK4_system_solver(ODE.kinetic_model_A_k1_B_k2_C, trange, y0, h, false, ks);
//console.log(exact_sol);
let conc_curves = ODE.transpose(solution);
console.log(conc_curves);
function analytical_kinetics(ts, k, A0, order) {
    const ys = [];
    if (order === 1) {
        for (let t of ts) {
            ys.push(A0 * Math.exp(-k * t));
        }
    }
    else {
        for (let t of ts) {
            let temp = A0 ** (1 - order) - (1 - order) * k * t;
            ys.push(temp ** (1 / (1 - order)));
        }
    }
    return ys;
}
let A = analytical_kinetics(ts, k1_init, A0_init, Number(orderdropdown.value));
const labels = ['A', 'B', 'C', 'D', 'E'];
const datasets = conc_curves.map((line, index) => ({
    label: `Line ${index + 1}`,
    data: line,
    borderColor: `hsl(${index * 60}, 70%, 50%)`,
    fill: false,
    tension: 0.2
}));
const kinetics_chart = new Chart(kinetics_ctx, {
    type: "line",
    data: { datasets: datasets,
        labels: labels
    },
    options: {
        responsive: true,
        plugins: {
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: false,
                    },
                    mode: 'xy',
                },
                pan: { enabled: true },
            },
            legend: {
                position: 'top', labels: {
                    pointStyle: 'line',
                    usePointStyle: true,
                }
            }
        },
        animation: false,
        scales: {
            x: {
                title: { display: true, text: "Time" },
                ticks: { display: true },
                grid: { display: true },
            },
            y: {
                title: { display: true, text: "Concentration" },
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }
});
function kinetics_updateGraph(k1, A0, order) {
    const data = analytical_kinetics(ts, k1, A0, order);
    kinetics_chart.data.datasets[0].data = data;
    kinetics_chart.update();
}
zoombutton.addEventListener('click', () => {
    kinetics_chart.resetZoom();
});
// stick all these into a list and loop it
for (let slider of sliders) {
    slider.addEventListener("input", () => {
        const k1 = parseFloat(k1slider.value);
        const A0 = parseFloat(A0slider.value);
        const order = Number(orderdropdown.value);
        k1Value.textContent = k1.toString();
        A0Value.textContent = A0.toString();
        kinetics_updateGraph(k1, A0, order);
    });
}
;
for (let dropdown of dropdowns) {
    dropdown.addEventListener("change", () => {
        const k1 = parseFloat(k1slider.value);
        const A0 = parseFloat(A0slider.value);
        const order = Number(orderdropdown.value);
        k1Value.textContent = k1.toString();
        A0Value.textContent = A0.toString();
        kinetics_updateGraph(k1, A0, order);
    });
}
;
