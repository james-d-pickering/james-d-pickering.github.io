"use strict";
const aslider = document.getElementById("aSlider");
const aValue = document.getElementById("aValue");
const kslider = document.getElementById("kSlider");
const kValue = document.getElementById("kValue");
const bslider = document.getElementById("bSlider");
const bValue = document.getElementById("bValue");
const ctx = document.getElementById("chart").getContext("2d");
const attdropdown = document.getElementById("attdropdown");
const repdropdown = document.getElementById("repdropdown");
const presetdropdown = document.getElementById("presetdropdown");
const k_init = 1;
const a_init = 0.2;
const b_init = 1;
function linspace(start, end, num) {
    const arr = [];
    const step = (end - start) / (num - 1);
    for (let i = 0; i < num; i++) {
        arr.push(start + step * i);
    }
    return arr;
}
let rs = linspace(1E-6, 12, 1000);
function DLVO_attraction(r, a, deg = Number(attdropdown.value)) {
    const ys = [];
    for (let r of rs) {
        ys.push(-a / r ** deg);
    }
    return ys;
}
function hard_sphere_repulsion(r) {
    const ys = [];
    for (let r of rs) {
        ys.push(1E-10 / r ** 12);
    }
    return ys;
}
function DLVO_repulsion(r, b, k, potential = String(repdropdown.value)) {
    const ys = [];
    for (let r of rs) {
        if (potential === "yukawa") {
            ys.push(b * k * k * Math.exp(-r / k) / r);
        }
        else {
            ys.push(b * k * k * Math.exp(-r / k));
        }
    }
    return ys;
}
function combined_DLVO(hs, att, rep) {
    const combined = att.map((val, idx) => val + rep[idx] + hs[idx]);
    return combined;
}
let att = DLVO_attraction(rs, a_init);
let rep_DH = DLVO_repulsion(rs, b_init, k_init);
let rep_HS = hard_sphere_repulsion(rs);
let combined = combined_DLVO(rep_HS, att, rep_DH);
const chart = new Chart(ctx, {
    type: "line",
    data: {
        labels: rs,
        datasets: [{
                label: 'Attractive Interactions',
                data: att,
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                borderColor: '#00D118',
                backgroundColor: '#00D118'
            }, {
                label: 'Repulsive Interactions',
                data: rep_DH,
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                borderColor: '#FF0015'
            },
            {
                label: "Hard Sphere Repulsion",
                data: rep_HS,
                borderWidth: 1,
                borderDash: [5, 5],
                fill: false,
                borderColor: '#FFAE00'
            },
            {
                label: "Combined DLVO Potential",
                data: combined,
                borderWidth: 2,
                fill: false,
                borderColor: '#0015FF'
            }]
    },
    options: {
        responsive: true,
        plugins: {
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
                title: { display: true, text: "Distance Between Particles" },
                ticks: { display: false },
                grid: { display: false }
            },
            y: {
                title: { display: true, text: "DLVO Energy (V_DLVO)" },
                min: -0.2,
                max: 0.3,
                afterBuildTicks: (axis) => axis.ticks = [0].map(v => ({ value: v }))
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }
});
function updateGraph(a, b, k, deg = Number(attdropdown.value), rep_potential = repdropdown.value) {
    const data_att = DLVO_attraction(rs, a, deg);
    const data_rep = DLVO_repulsion(rs, b, k, rep_potential);
    //  chart.data.labels = data.rs;
    chart.data.datasets[0].data = data_att;
    chart.data.datasets[1].data = data_rep;
    chart.data.datasets[3].data = combined_DLVO(rep_HS, data_att, data_rep);
    chart.update();
}
aslider.addEventListener("input", () => {
    const a = parseFloat(aslider.value);
    const b = parseFloat(bslider.value);
    const k = parseFloat(kslider.value);
    aValue.textContent = a.toString();
    updateGraph(a, b, k);
});
kslider.addEventListener("input", () => {
    const k = parseFloat(kslider.value);
    const a = parseFloat(aslider.value);
    const b = parseFloat(bslider.value);
    kValue.textContent = k.toString();
    updateGraph(a, b, k);
});
bslider.addEventListener("input", () => {
    const b = parseFloat(bslider.value);
    const a = parseFloat(aslider.value);
    bValue.textContent = b.toString();
    const k = parseFloat(kslider.value);
    updateGraph(a, b, k);
});
attdropdown.addEventListener("change", () => {
    const a = parseFloat(aslider.value);
    const b = parseFloat(bslider.value);
    const k = parseFloat(kslider.value);
    const deg = Number(attdropdown.value);
    updateGraph(a, b, k, deg);
});
repdropdown.addEventListener("change", () => {
    const a = parseFloat(aslider.value);
    const b = parseFloat(bslider.value);
    const k = parseFloat(kslider.value);
    const deg = Number(attdropdown.value);
    const rep_potential = repdropdown.value;
    updateGraph(a, b, k, deg, rep_potential);
});
presetdropdown.addEventListener("change", () => {
    const preset = presetdropdown.value;
    if (preset === "flocculated") {
        aslider.value = 0.4.toString();
        bslider.value = 3.5.toString();
        kslider.value = 0.7.toString();
        attdropdown.value = "2";
        repdropdown.value = "exponential";
        const deg = Number(attdropdown.value);
        const a = parseFloat(aslider.value);
        const b = parseFloat(bslider.value);
        const k = parseFloat(kslider.value);
        updateGraph(a, b, k, deg, repdropdown.value);
    }
    else if (preset === "coagulated") {
        aslider.value = 0.4.toString();
        bslider.value = 3.5.toString();
        kslider.value = 0.5.toString();
        attdropdown.value = "2";
        repdropdown.value = "exponential";
        const deg = Number(attdropdown.value);
        const a = parseFloat(aslider.value);
        const b = parseFloat(bslider.value);
        const k = parseFloat(kslider.value);
        updateGraph(a, b, k, deg, repdropdown.value);
    }
    else if (preset === "stable") {
        aslider.value = 0.8.toString();
        bslider.value = 1.2.toString();
        kslider.value = 2.0.toString();
        attdropdown.value = "2";
        repdropdown.value = "exponential";
        const deg = Number(attdropdown.value);
        const a = parseFloat(aslider.value);
        const b = parseFloat(bslider.value);
        const k = parseFloat(kslider.value);
        updateGraph(a, b, k, deg, repdropdown.value);
    }
});
