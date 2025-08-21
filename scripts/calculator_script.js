const ndp = 3
const planck = 6.62607E-34 
const c = 2.99792E8
const electronvolt = 1.60218E-19
const avogadro = 6.022E23
const hartree = 4.35974E-18
const kwh = 3.6E6
const kcal = 4.184
const boltz = 1.3806E-23
const faraday = 96485.3415
const pi = 3.14159
const btu = 1055
const tnt = 4184
const rydberg = 13.6056 * electronvolt
const erg = 1.0E-7
const booe = 6.0E9

function formatNumber(num, decimals = ndp) {
    if (Math.abs(num) > 1000 || Math.abs(num) < 0.001) {
        return num.toExponential(decimals);
    } else {
        return num.toFixed(decimals);
    }
}


var freqbox = document.getElementById("freq")
freqbox.toJoule = function() {return freqbox.value * planck}
freqbox.fromJoule = function(energyJ) {return energyJ / planck }

var angfreqbox = document.getElementById("angfreq")
angfreqbox.toJoule = function() {return freqbox.value * planck/ (2*pi)}
angfreqbox.fromJoule = function(energyJ) {return 2*pi*energyJ / planck }

var hartreebox = document.getElementById("energyH")
hartreebox.toJoule = function() {return hartreebox.value * hartree}
hartreebox.fromJoule = function(energyJ) {return energyJ / hartree }

var kWhbox = document.getElementById("energykWh")
kWhbox.toJoule = function() {return kWhbox.value * kwh}
kWhbox.fromJoule = function(energyJ) {return energyJ / kwh }

var energyJbox = document.getElementById("energyJ")
energyJbox.toJoule = function() {return (energyJbox.value)}
energyJbox.fromJoule = function(energyJ) {return (energyJ)}

var energyeVbox = document.getElementById('energyeV')
energyeVbox.toJoule = function() {return (energyeVbox.value*electronvolt)}
energyeVbox.fromJoule = function(energyJ) {return (energyJ/electronvolt)}
    
var energykJmolbox = document.getElementById('energykJmol')
energykJmolbox.toJoule = function() {return (1000*energykJmolbox.value/avogadro)}
energykJmolbox.fromJoule = function(energyJ) {return (energyJ*avogadro/1000)}

var energykcalmolbox = document.getElementById('energykcalmol')
energykcalmolbox.toJoule = function() {return (1000*kcal*energykcalmolbox.value/(avogadro))}
energykcalmolbox.fromJoule = function(energyJ) {return (energyJ*avogadro/(1000*kcal))}

var timebox = document.getElementById('time')
timebox.toJoule = function() {return planck/timebox.value}
timebox.fromJoule = function(energyJ) {return planck/energyJ}
    
var wavelengthbox = document.getElementById('wavelength')
wavelengthbox.toJoule = function() {return planck*c/wavelengthbox.value}
wavelengthbox.fromJoule = function(energyJ) {return planck*c/energyJ}

var wavenumberbox = document.getElementById('wavenumber')
wavenumberbox.toJoule = function() {return planck*c*wavenumberbox.value}
wavenumberbox.fromJoule = function(energyJ) {return energyJ/(planck*c)}

var wavenumberboxcm = document.getElementById('wavenumbercm')
wavenumberboxcm.toJoule = function() {return planck*c*wavenumberbox.value*100}
wavenumberboxcm.fromJoule = function(energyJ) {return energyJ/(planck*c*100)}

var angwavenumberbox = document.getElementById('angwavenumber')
angwavenumberbox.toJoule = function() {return planck*c*(angwavenumberbox.value/(2*pi))}
angwavenumberbox.fromJoule = function(energyJ) {return 2*pi*energyJ/(planck*c)}

var temperaturebox = document.getElementById('temperature')
temperaturebox.toJoule = function() {return temperaturebox.value * boltz}
temperaturebox.fromJoule = function(energyJ) {return energyJ/boltz}

var boltzmannTbox = document.getElementById('boltzmannT')
boltzmannTbox.changed = function(energyJ) {
    boltzmannbox.value = formatNumber(boltzmanngbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value)))
    equilibriumconstantbox.value = formatNumber(Math.exp(-energyJ/(boltz * boltzmannTbox.value)))
    lnequilibriumconstantbox.value = formatNumber(-energyJ/(boltz * boltzmannTbox.value))
    arrheniusbox.value = formatNumber(Aconstantbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value)))
}
var boltzmanngbox = document.getElementById('boltzmanng')
boltzmanngbox.changed = function(energyJ) {boltzmannbox.value = formatNumber(boltzmanngbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value)))}

var boltzmannbox = document.getElementById('boltzmann')
boltzmannbox.toJoule = function() { 
    return Math.log(boltzmannbox.value/boltzmanngbox.value) * boltz * boltzmannTbox.value} 
boltzmannbox.fromJoule = function(energyJ) {return boltzmanngbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value))}

var nelectronsbox = document.getElementById('nelectrons')
nelectronsbox.changed = function(energyJ) {cellpotentialbox.value = formatNumber((avogadro*energyJ/(-nelectronsbox.value * faraday))) }

var cellpotentialbox = document.getElementById('cellpotential')
cellpotentialbox.toJoule = function() { return -nelectronsbox.value * faraday * cellpotentialbox.value / avogadro }
cellpotentialbox.fromJoule = function(energyJ) {return energyJ*avogadro/(-nelectronsbox.value * faraday)}

var equilibriumconstantbox = document.getElementById('equilibrium')
equilibriumconstantbox.toJoule = function() { return -boltz * boltzmannTbox.value*Math.log(equilibriumconstantbox.value) }
equilibriumconstantbox.fromJoule = function(energyJ) {return Math.exp(-energyJ/(boltz * boltzmannTbox.value))}

var lnequilibriumconstantbox = document.getElementById('lnequilibrium')
lnequilibriumconstantbox.toJoule = function() { return -boltz * boltzmannTbox.value*lnequilibriumconstantbox.value }
lnequilibriumconstantbox.fromJoule = function(energyJ) {return -energyJ/(boltz * boltzmannTbox.value)}

var btubox = document.getElementById('btu')
btubox.toJoule = function() { return btubox.value * btu }
btubox.fromJoule = function(energyJ) {return energyJ/btu }

var tntbox = document.getElementById('TNT')
tntbox.toJoule = function() { return tntbox.value * tnt }
tntbox.fromJoule = function(energyJ) {return energyJ/tnt }

var caloriebox = document.getElementById('calorie')
caloriebox.toJoule = function() { return caloriebox.value * kcal }
caloriebox.fromJoule = function(energyJ) {return energyJ/kcal }

var rydbergbox = document.getElementById('rydberg')
rydbergbox.toJoule = function() { return rydbergbox.value * rydberg }
rydbergbox.fromJoule = function(energyJ) {return energyJ/rydberg }

var ergbox = document.getElementById('erg')
ergbox.toJoule = function() { return ergbox.value * erg }
ergbox.fromJoule = function(energyJ) {return energyJ/erg }

var booebox = document.getElementById('booe')
booebox.toJoule = function() { return booebox.value * booe }
booebox.fromJoule = function(energyJ) {return energyJ/booe }

var Aconstantbox = document.getElementById('Aconstant')
Aconstantbox.changed = function(energyJ) {arrheniusbox.value = formatNumber(Aconstantbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value))) }

var halflifebox = document.getElementById('halflife')
halflifebox.toJoule = function() {return -Math.log((Math.log(2)/halflifebox.value)/Aconstantbox.value)*boltz*boltzmannTbox.value}
halflifebox.fromJoule = function(energyJ) {return Math.log(2)/(Aconstantbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value)))}

var arrheniusbox = document.getElementById('arrhenius')
arrhenius.toJoule = function() { return -Math.log(arrheniusbox.value/Aconstantbox.value)*boltz*boltzmannTbox.value }
arrhenius.fromJoule = function(energyJ) {return Aconstantbox.value * Math.exp(-energyJ/(boltz*boltzmannTbox.value))}


var boxes = [freqbox, energyJbox, energyeVbox, energykJmolbox, 
    hartreebox, kWhbox, timebox, wavelengthbox, wavenumberbox, wavenumberboxcm, energykcalmolbox, temperaturebox,
boltzmannbox, cellpotentialbox, equilibriumconstantbox, lnequilibriumconstantbox,
angfreqbox, angwavenumberbox,btubox, tntbox,
caloriebox, rydbergbox, ergbox, booebox, halflifebox, arrheniusbox];

var nonEboxes = [boltzmannTbox, boltzmanngbox, nelectronsbox, Aconstantbox]

for (box of boxes) {
    box.addEventListener('input', event => update_form(event) )}
// on a change, pass the outer box class to the update form function
// 
boltzmannTbox.addEventListener('input', event => boltzmannTbox.changed(energyJbox.value))
boltzmanngbox.addEventListener('input', event => boltzmanngbox.changed(energyJbox.value))
nelectronsbox.addEventListener('input', event => nelectronsbox.changed(energyJbox.value))
Aconstantbox.addEventListener('input', event => Aconstantbox.changed(energyJbox.value))

function update_form(event) { 
    console.log(event)
    changed_box = event.srcElement
    console.log('box changed is', changed_box, "with value", changed_box.value);
    
    change_J = changed_box.toJoule(changed_box.value)

    console.log('value in Joules', change_J)

    boxes_unchanged = [];

    for (box of boxes) {
        if (Object.is(box, changed_box)) {
                continue;}
        boxes_unchanged.push(box);
         }
    console.log(boxes_unchanged)
    for (box of boxes_unchanged) {

        box.value = formatNumber(box.fromJoule(change_J))

    }

        

    return;
    }

