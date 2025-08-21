var ndp = 3;
var planck = 6.62607E-34;
var c = 2.99792E8;
var electronvolt = 1.60218E-19;
var avogadro = 6.022E23;
var hartree = 4.35974E-18;
var kwh = 3.6E6;
var kcal = 4.184;
var boltz = 1.3806E-23;
var faraday = 96485.3415;
var pi = 3.14159;
var btu = 1055;
var tnt = 4184;
var rydberg = 13.6056 * electronvolt;
var erg = 1.0E-7;
var booe = 6.0E9;
// helper function to format numbers so they're more readable
function formatNumber(num, decimals) {
    if (decimals === void 0) { decimals = ndp; }
    if (Math.abs(num) > 10000 || Math.abs(num) < 0.001) {
        return num.toExponential(decimals);
    }
    else {
        return num.toFixed(decimals);
    }
}
// helper function to get hold of the box element needed for input/output
function getBox(id) {
    return document.getElementById(id);
}
// frequency. E = hv
var freqbox = getBox("freq");
freqbox.toJoule = function () { return Number(freqbox.value) * planck; };
freqbox.fromJoule = function (energyJ) { return energyJ / planck; };
// ang freq. E = h v / 2pi (omega = 2pi nu)
var angfreqbox = getBox("angfreq");
angfreqbox.toJoule = function () { return Number(freqbox.value) * planck / (2 * pi); };
angfreqbox.fromJoule = function (energyJ) { return (2 * pi * energyJ) / planck; };
// hartree. 1 hartree = 4.359E-18 J
var hartreebox = getBox("energyH");
hartreebox.toJoule = function () { return Number(hartreebox.value) * hartree; };
hartreebox.fromJoule = function (energyJ) { return energyJ / hartree; };
// kWh. 1 kWh = 1000 * 3600 J
var kWhbox = getBox("energykWh");
kWhbox.toJoule = function () { return Number(kWhbox.value) * kwh; };
kWhbox.fromJoule = function (energyJ) { return energyJ / kwh; };
// Joules. base unit for conversion
var energyJbox = getBox("energyJ");
energyJbox.toJoule = function () { return Number(energyJbox.value); };
energyJbox.fromJoule = function (energyJ) { return energyJ; };
// eV. 1 eV = 1.6E-19 Joules
var energyeVbox = getBox("energyeV");
energyeVbox.toJoule = function () { return Number(energyeVbox.value) * electronvolt; };
energyeVbox.fromJoule = function (energyJ) { return energyJ / electronvolt; };
// kJ/mol. 1 kJ/mol = (Joule / 1000) * avogadro
var energykJmolbox = getBox("energykJmol");
energykJmolbox.toJoule = function () { return (1000 * Number(energykJmolbox.value)) / avogadro; };
energykJmolbox.fromJoule = function (energyJ) { return (energyJ * avogadro) / 1000; };
// kcal/mol. 1 kcal/mol = (Joule / 1000) * avogadro / 4.184
var energykcalmolbox = getBox("energykcalmol");
energykcalmolbox.toJoule = function () {
    return (1000 * kcal * Number(energykcalmolbox.value)) / avogadro;
};
energykcalmolbox.fromJoule = function (energyJ) { return (energyJ * avogadro) / (1000 * kcal); };
// optical period. E = h/T
var timebox = getBox("time");
timebox.toJoule = function () { return planck / Number(timebox.value); };
timebox.fromJoule = function (energyJ) { return planck / energyJ; };
// wavelength. E = hc/lambda
var wavelengthbox = getBox("wavelength");
wavelengthbox.toJoule = function () { return (planck * c) / Number(wavelengthbox.value); };
wavelengthbox.fromJoule = function (energyJ) { return (planck * c) / energyJ; };
// wavenumber. E = hc nubar
var wavenumberbox = getBox("wavenumber");
wavenumberbox.toJoule = function () { return planck * c * Number(wavenumberbox.value); };
wavenumberbox.fromJoule = function (energyJ) { return energyJ / (planck * c); };
// wavenumber in cm. E = 100 hc nubar
var wavenumberboxcm = getBox("wavenumbercm");
wavenumberboxcm.toJoule = function () { return planck * c * Number(wavenumberboxcm.value) * 100; };
wavenumberboxcm.fromJoule = function (energyJ) { return energyJ / (planck * c * 100); };
// angular wavenumber. angnubar = 2 pi * nubar
var angwavenumberbox = getBox("angwavenumber");
angwavenumberbox.toJoule = function () {
    return planck * c * (Number(angwavenumberbox.value) / (2 * pi));
};
angwavenumberbox.fromJoule = function (energyJ) { return (2 * pi * energyJ) / (planck * c); };
// characteristic temperature. E = kT 
var temperaturebox = getBox("temperature");
temperaturebox.toJoule = function () { return Number(temperaturebox.value) * boltz; };
temperaturebox.fromJoule = function (energyJ) { return energyJ / boltz; };
// temperature for boltzmann, rate, equilibria calculations (i.e. ensemble temperature)
// recalculate various parameters when this is changed
var boltzmannTbox = getBox("boltzmannT");
boltzmannTbox.changed = function (energyJ) {
    boltzmannbox.value = formatNumber(Number(boltzmanngbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
    equilibriumconstantbox.value = formatNumber(Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
    lnequilibriumconstantbox.value = formatNumber(-energyJ / (boltz * Number(boltzmannTbox.value)));
    arrheniusbox.value = formatNumber(Number(Aconstantbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
};
// boltzmann degeneracy ratio (upper/lower)
var boltzmanngbox = getBox("boltzmanng");
boltzmanngbox.changed = function (energyJ) {
    boltzmannbox.value = formatNumber(Number(boltzmanngbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
};
// gives boltzmann populations (upper/lower)
var boltzmannbox = getBox("boltzmann");
boltzmannbox.toJoule = function () {
    return Math.log(Number(boltzmannbox.value) / Number(boltzmanngbox.value)) * boltz * Number(boltzmannTbox.value);
};
boltzmannbox.fromJoule = function (energyJ) {
    return Number(boltzmanngbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));
};
// gives K = exp(-dG/kT)
var equilibriumconstantbox = getBox("equilibrium");
equilibriumconstantbox.toJoule = function () {
    return -boltz *
        Number(boltzmannTbox.value) *
        Math.log(Number(equilibriumconstantbox.value));
};
equilibriumconstantbox.fromJoule = function (energyJ) {
    return Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));
};
// gives lnK = -dG/kT
var lnequilibriumconstantbox = getBox("lnequilibrium");
lnequilibriumconstantbox.toJoule = function () {
    return -boltz *
        Number(boltzmannTbox.value) *
        Number(lnequilibriumconstantbox.value);
};
lnequilibriumconstantbox.fromJoule = function (energyJ) {
    return -energyJ / (boltz * Number(boltzmannTbox.value));
};
// Arrhenius A factor
var Aconstantbox = getBox("Aconstant");
Aconstantbox.changed = function (energyJ) {
    arrheniusbox.value = formatNumber(Number(Aconstantbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
};
// Arrhenius rate constant, k = A exp(-Ea/RT)
var arrheniusbox = getBox("arrhenius");
arrheniusbox.toJoule = function () {
    return -Math.log(Number(arrheniusbox.value) / Number(Aconstantbox.value)) *
        boltz *
        Number(boltzmannTbox.value);
};
arrheniusbox.fromJoule = function (energyJ) {
    return Number(Aconstantbox.value) *
        Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));
};
// half life from Arrhenius assuming 1st order kinetics t = ln2 / k 
var halflifebox = getBox("halflife");
halflifebox.toJoule = function () {
    return -Math.log((Math.log(2) / Number(halflifebox.value)) / Number(Aconstantbox.value)) *
        boltz *
        Number(boltzmannTbox.value);
};
halflifebox.fromJoule = function (energyJ) {
    return Math.log(2) /
        (Number(Aconstantbox.value) *
            Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));
};
// cell potential, E = -dG/nF
var cellpotentialbox = getBox("cellpotential");
cellpotentialbox.toJoule = function () {
    return (-Number(nelectronsbox.value) * faraday * Number(cellpotentialbox.value)) /
        avogadro;
};
cellpotentialbox.fromJoule = function (energyJ) {
    return (energyJ * avogadro) / (-Number(nelectronsbox.value) * faraday);
};
// Number of electrons (n) transferred in cell reaction: dG = -nFE
var nelectronsbox = getBox("nelectrons");
nelectronsbox.changed = function (energyJ) {
    cellpotentialbox.value = formatNumber((avogadro * energyJ) / (-Number(nelectronsbox.value) * faraday));
};
// British thermal units
var btubox = getBox("btu");
btubox.toJoule = function () { return Number(btubox.value) * btu; };
btubox.fromJoule = function (energyJ) { return energyJ / btu; };
// Grams of TNT equivalent
var tntbox = getBox("TNT");
tntbox.toJoule = function () { return Number(tntbox.value) * tnt; };
tntbox.fromJoule = function (energyJ) { return energyJ / tnt; };
// Calories equivalent (kcal)
var caloriebox = getBox("calorie");
caloriebox.toJoule = function () { return Number(caloriebox.value) * kcal; };
caloriebox.fromJoule = function (energyJ) { return energyJ / kcal; };
// Rydberg units
var rydbergbox = getBox("rydberg");
rydbergbox.toJoule = function () { return Number(rydbergbox.value) * rydberg; };
rydbergbox.fromJoule = function (energyJ) { return energyJ / rydberg; };
// Cgs standard units (ergs)
var ergbox = getBox("erg");
ergbox.toJoule = function () { return Number(ergbox.value) * erg; };
ergbox.fromJoule = function (energyJ) { return energyJ / erg; };
// Barrels of oil equivalent
var booebox = getBox("booe");
booebox.toJoule = function () { return Number(booebox.value) * booe; };
booebox.fromJoule = function (energyJ) { return energyJ / booe; };
// boxes that are energies
var boxes = [
    freqbox,
    energyJbox,
    energyeVbox,
    energykJmolbox,
    hartreebox,
    kWhbox,
    timebox,
    wavelengthbox,
    wavenumberbox,
    wavenumberboxcm,
    energykcalmolbox,
    temperaturebox,
    boltzmannbox,
    cellpotentialbox,
    equilibriumconstantbox,
    lnequilibriumconstantbox,
    angfreqbox,
    angwavenumberbox,
    btubox,
    tntbox,
    caloriebox,
    rydbergbox,
    ergbox,
    booebox,
    halflifebox,
    arrheniusbox,
];
// boxes that aren't energies
var nonEboxes = [
    boltzmannTbox,
    boltzmanngbox,
    nelectronsbox,
    Aconstantbox,
];
// function to update boxes when changed. 
function update_form(event) {
    // changed box is the one that the event targeted
    var changed_box = event.target;
    // if it doesn't have toJoule method return
    if (!changed_box.toJoule)
        return;
    // calculate the energy in Joules from the changed box
    var change_J = changed_box.toJoule(Number(changed_box.value));
    // run through all the other boxes and update them using the fromJoule functions
    for (var _i = 0, boxes_2 = boxes; _i < boxes_2.length; _i++) {
        var box = boxes_2[_i];
        if (box === changed_box || !box.fromJoule)
            continue;
        box.value = formatNumber(box.fromJoule(change_J));
    }
}
// add event listeners for all the boxes, update_form for any energy. boxes
for (var _i = 0, boxes_1 = boxes; _i < boxes_1.length; _i++) {
    var box = boxes_1[_i];
    box.addEventListener("input", update_form);
}
// custom changed functions boxes that aren't directly energy units
boltzmannTbox.addEventListener("input", function () { var _a; return (_a = boltzmannTbox.changed) === null || _a === void 0 ? void 0 : _a.call(boltzmannTbox, Number(energyJbox.value)); });
boltzmanngbox.addEventListener("input", function () { var _a; return (_a = boltzmanngbox.changed) === null || _a === void 0 ? void 0 : _a.call(boltzmanngbox, Number(energyJbox.value)); });
nelectronsbox.addEventListener("input", function () { var _a; return (_a = nelectronsbox.changed) === null || _a === void 0 ? void 0 : _a.call(nelectronsbox, Number(energyJbox.value)); });
Aconstantbox.addEventListener("input", function () { var _a; return (_a = Aconstantbox.changed) === null || _a === void 0 ? void 0 : _a.call(Aconstantbox, Number(energyJbox.value)); });
