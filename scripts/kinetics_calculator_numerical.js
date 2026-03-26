import * as ODE from "./ODE_solvers.js";
const k1slider = document.getElementById("k1Slider");
const k1Value = document.getElementById("k1Value");
const k2slider = document.getElementById("k2Slider");
const k2Value = document.getElementById("k2Value");
const k3slider = document.getElementById("k3Slider");
const k3Value = document.getElementById("k3Value");
const y0slider = document.getElementById("y0Slider");
const y0Value = document.getElementById("y0Value");
const y1slider = document.getElementById("y1Slider");
const y1Value = document.getElementById("y1Value");
const y2slider = document.getElementById("y2Slider");
const y2Value = document.getElementById("y2Value");
const y3slider = document.getElementById("y3Slider");
const y3Value = document.getElementById("y3Value");
const hslider = document.getElementById("stepSlider");
const hValue = document.getElementById("stepValue");
const tmaxSlider = document.getElementById("tmaxSlider");
const tmaxValue = document.getElementById("tmaxValue");
//const equation = document.getElementById('equation') as HTMLElement
//var eq: string = 'Chemical Equation:' 
const presetdropdown = document.getElementById("presetdropdown");
const kinetics_ctx = document.getElementById("kinetics_chart").getContext("2d");
const zoombutton = document.getElementById("zoombutton");
const ksliders = [k1slider, k2slider, k3slider];
const ysliders = [y0slider, y1slider, y2slider, y3slider];
const kvalues = [k1Value, k2Value, k3Value];
const yvalues = [y0Value, y1Value, y2Value, y3Value];
const ks = ksliders.map(a => parseFloat(a.value));
const y0 = ysliders.map(a => parseFloat(a.value));
const h = parseFloat(hslider.value);
if (presetdropdown.value == 'A-B') {
    var model = ODE.kinetic_model_A_k1_B;
}
else if (presetdropdown.value == 'A-B-Cseq') {
    var model = ODE.kinetic_model_A_k1_B_k2_C;
}
else if (presetdropdown.value == 'A-B-Cpar') {
    var model = ODE.kinetic_model_A_k1_B_A_k2_C;
}
else if (presetdropdown.value == 'A+B-C') {
    var model = ODE.kinetic_model_A_B_k1_C;
}
else if (presetdropdown.value == 'A-Bcat') {
    var model = ODE.kinetic_model_A_k1_B_autocat;
}
else if (presetdropdown.value == 'A-B-C-D') {
    var model = ODE.kinetic_model_A_B_k12_C_k3_D;
}
else if (presetdropdown.value == 'A-B-C-DMM') {
    var model = ODE.kinetic_model_A_B_k12_C_k3_D_MM;
}
else {
    var model = ODE.kinetic_model_A_k1_B;
}
console.log(model);
const trange = [0, parseFloat(tmaxSlider.value)];
const tvals = ODE.arange(trange[0], trange[1], h);
let solution = ODE.RK4_system_solver(model, trange, y0, h, false, ks);
let conc_curves = ODE.transpose(solution);
const labels = tvals.map(a => a.toFixed(1));
const legend = ['A', 'B', 'C', 'D'];
const datasets = conc_curves.map((line, index) => ({
    label: legend[index],
    data: line,
    borderColor: `hsl(${index * 60}, 70%, 50%)`,
    fill: false,
    borderWidth: 2,
    tension: 0
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
                        enabled: false,
                    },
                    drag: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: false,
                    },
                    mode: 'xy',
                },
                pan: { enabled: false },
            },
            legend: {
                position: 'top', labels: {
                    pointStyle: 'line',
                    usePointStyle: true,
                    font: { size: 18 },
                }
            }
        },
        animation: false,
        scales: {
            x: {
                title: { display: true, text: "Time", font: { size: 18 } },
                ticks: { display: true, font: { size: 16 } },
                grid: { display: true },
            },
            y: {
                title: { display: true, text: "Concentration", font: { size: 18 } },
                ticks: { display: true, font: { size: 16 } },
            }
        },
        elements: {
            point: {
                radius: 0
            }
        }
    }
});
function kinetics_updateGraph(ks, y0, h, trange, model) {
    let solution = ODE.RK4_system_solver(model, trange, y0, h, false, ks);
    console.log(solution);
    let conc_curves = ODE.transpose(solution);
    const tvals = ODE.arange(trange[0], trange[1], h);
    conc_curves.map((line, index) => kinetics_chart.data.datasets[index].data = line);
    kinetics_chart.data.labels = tvals.map(a => a.toFixed(1));
    kinetics_chart.update();
}
zoombutton.addEventListener('click', () => {
    kinetics_chart.resetZoom();
});
// stick all these into a list and loop it
for (let slider of ksliders.concat(ysliders).concat([hslider]).concat([tmaxSlider])) {
    slider.addEventListener("input", () => {
        //on input, read all values and update graph
        let ktemp = [];
        let ytemp = [];
        for (let kslider of ksliders) {
            console.log(kslider.value);
            ktemp.push(parseFloat(kslider.value)); // push the current slider values to a temp array
        }
        ;
        for (let yslider of ysliders) {
            ytemp.push(parseFloat(yslider.value)); // push the current slider values to a temp array
        }
        ;
        kvalues.map((a, i) => a.textContent = ksliders[i].value.toString());
        yvalues.map((a, i) => a.textContent = ysliders[i].value.toString());
        let htemp = parseFloat(hslider.value);
        hValue.textContent = htemp.toString();
        let tmaxtemp = parseFloat(tmaxSlider.value);
        tmaxValue.textContent = tmaxtemp.toString();
        let trangetemp = [0, tmaxtemp];
        const preset = presetdropdown.value;
        if (preset == 'A-B') {
            var model = ODE.kinetic_model_A_k1_B;
        }
        else if (preset == 'A-B-Cseq') {
            var model = ODE.kinetic_model_A_k1_B_k2_C;
        }
        else if (preset == 'A-B-Cpar') {
            var model = ODE.kinetic_model_A_k1_B_A_k2_C;
        }
        else if (preset == 'A+B-C') {
            var model = ODE.kinetic_model_A_B_k1_C;
        }
        else if (preset == 'A-Bcat') {
            var model = ODE.kinetic_model_A_k1_B_autocat;
        }
        else if (preset == 'A-B-C-D') {
            var model = ODE.kinetic_model_A_B_k12_C_k3_D;
        }
        else if (preset == 'A-B-C-DMM') {
            var model = ODE.kinetic_model_A_B_k12_C_k3_D_MM;
        }
        else {
            var model = ODE.kinetic_model_A_k1_B;
        }
        kinetics_updateGraph(ktemp, ytemp, htemp, trangetemp, model);
    });
}
;
presetdropdown.addEventListener("change", () => {
    const preset = presetdropdown.value;
    if (preset == 'A-B') {
        var model = ODE.kinetic_model_A_k1_B;
        //  var eq: string = 'Chemical Equation: $$A \\xrightarrow{k_1} B$$'
    }
    else if (preset == 'A-B-Cseq') {
        var model = ODE.kinetic_model_A_k1_B_k2_C;
        //   var eq: string = 'Chemical Equation: $$A  \\xrightarrow{k_1} B  \\xrightarrow{k_2} C$$'
    }
    else if (preset == 'A-B-Cpar') {
        var model = ODE.kinetic_model_A_k1_B_A_k2_C;
        //   var eq: string = 'Chemical Equation: $$A  \\xrightarrow{k_1} B$$ and $$A \\xrightarrow{k_2} C$$'
    }
    else if (preset == 'A+B-C') {
        var model = ODE.kinetic_model_A_B_k1_C;
        //  var eq: string = 'Chemical Equation: $$A + B\\xrightarrow{k_1} C$$'
    }
    else if (preset == 'A-Bcat') {
        var model = ODE.kinetic_model_A_k1_B_autocat;
        // var eq: string = 'Chemical Equation: $$$A \\xrightarrow{k_1} B$$ ($$B$$ catalyses)'
    }
    else if (preset == 'A-B-C-D') {
        var model = ODE.kinetic_model_A_B_k12_C_k3_D;
        // var eq: string = 'Chemical Equation: $$A+B \\rightleftarrows C  \\xrightarrow{k_3} D$$'
    }
    else if (preset == 'A-B-C-DMM') {
        var model = ODE.kinetic_model_A_B_k12_C_k3_D_MM;
        // var eq: string = 'Chemical Equation: $$A+B \\rightleftarrows C  \\xrightarrow{k_3} D + A$$'
    }
    else {
        var model = ODE.kinetic_model_A_k1_B;
        // var eq: string = 'xyz' 
    }
    //equation.textContent = eq;
    let ktemp = [];
    let ytemp = [];
    for (let kslider of ksliders) {
        console.log(kslider.value);
        ktemp.push(parseFloat(kslider.value)); // push the current slider values to a temp array
    }
    ;
    for (let yslider of ysliders) {
        ytemp.push(parseFloat(yslider.value)); // push the current slider values to a temp array
    }
    ;
    kvalues.map((a, i) => a.textContent = ksliders[i].value.toString());
    yvalues.map((a, i) => a.textContent = ysliders[i].value.toString());
    let htemp = parseFloat(hslider.value);
    hValue.textContent = htemp.toString();
    let tmaxtemp = parseFloat(tmaxSlider.value);
    tmaxValue.textContent = tmaxtemp.toString();
    let trangetemp = [0, tmaxtemp];
    kinetics_updateGraph(ktemp, ytemp, htemp, trangetemp, model);
});
