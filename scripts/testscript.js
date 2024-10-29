var freqbox = document.getElementById("freq");
var energybox = document.getElementById("energyJ");

const planck = 6.626E-34

document.write(freqbox.value)

function update_form(frequency, energy) {
    energybox.value = freqbox.value * planck);
    document.write(freqbox.value)}


