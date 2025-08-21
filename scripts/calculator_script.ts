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


// helper function to format numbers so they're more readable
function formatNumber(num: number, decimals: number = ndp): string {
    if (Math.abs(num) > 10000 || Math.abs(num) < 0.001) {
        return num.toExponential(decimals);
    } else {
        return num.toFixed(decimals);
    }
}

// extend the HTML input box so that it has the methods to convert values to/from joules and identify change
interface EnergyInput extends HTMLInputElement {
  toJoule?: (energy?: number) => number;
  fromJoule?: (energyJ: number) => number;
  changed?: (energyJ: number) => void;
}

// helper function to get hold of the box element needed for input/output
function getBox(id: string): EnergyInput {
  return document.getElementById(id) as EnergyInput;
}

// frequency. E = hv
const freqbox = getBox("freq");
freqbox.toJoule = () => Number(freqbox.value) * planck;
freqbox.fromJoule = (energyJ) => energyJ / planck;

// ang freq. E = h v / 2pi (omega = 2pi nu)
const angfreqbox = getBox("angfreq");
angfreqbox.toJoule = () => Number(freqbox.value) * planck / (2 * pi);
angfreqbox.fromJoule = (energyJ) => (2 * pi * energyJ) / planck;

// hartree. 1 hartree = 4.359E-18 J
const hartreebox = getBox("energyH");
hartreebox.toJoule = () => Number(hartreebox.value) * hartree;
hartreebox.fromJoule = (energyJ) => energyJ / hartree;

// kWh. 1 kWh = 1000 * 3600 J
const kWhbox = getBox("energykWh");
kWhbox.toJoule = () => Number(kWhbox.value) * kwh;
kWhbox.fromJoule = (energyJ) => energyJ / kwh;

// Joules. base unit for conversion
const energyJbox = getBox("energyJ");
energyJbox.toJoule = () => Number(energyJbox.value);
energyJbox.fromJoule = (energyJ) => energyJ;

// eV. 1 eV = 1.6E-19 Joules
const energyeVbox = getBox("energyeV");
energyeVbox.toJoule = () => Number(energyeVbox.value) * electronvolt;
energyeVbox.fromJoule = (energyJ) => energyJ / electronvolt;

// kJ/mol. 1 kJ/mol = (Joule / 1000) * avogadro
const energykJmolbox = getBox("energykJmol");
energykJmolbox.toJoule = () => (1000 * Number(energykJmolbox.value)) / avogadro;
energykJmolbox.fromJoule = (energyJ) => (energyJ * avogadro) / 1000;

// kcal/mol. 1 kcal/mol = (Joule / 1000) * avogadro / 4.184
const energykcalmolbox = getBox("energykcalmol");
energykcalmolbox.toJoule = () =>
  (1000 * kcal * Number(energykcalmolbox.value)) / avogadro;
energykcalmolbox.fromJoule = (energyJ) => (energyJ * avogadro) / (1000 * kcal);

// optical period. E = h/T
const timebox = getBox("time");
timebox.toJoule = () => planck / Number(timebox.value);
timebox.fromJoule = (energyJ) => planck / energyJ;

// wavelength. E = hc/lambda
const wavelengthbox = getBox("wavelength");
wavelengthbox.toJoule = () => (planck * c) / Number(wavelengthbox.value);
wavelengthbox.fromJoule = (energyJ) => (planck * c) / energyJ;

// wavenumber. E = hc nubar
const wavenumberbox = getBox("wavenumber");
wavenumberbox.toJoule = () => planck * c * Number(wavenumberbox.value);
wavenumberbox.fromJoule = (energyJ) => energyJ / (planck * c);

// wavenumber in cm. E = 100 hc nubar
const wavenumberboxcm = getBox("wavenumbercm");
wavenumberboxcm.toJoule = () => planck * c * Number(wavenumberboxcm.value) * 100;
wavenumberboxcm.fromJoule = (energyJ) => energyJ / (planck * c * 100);

// angular wavenumber. angnubar = 2 pi * nubar
const angwavenumberbox = getBox("angwavenumber");
angwavenumberbox.toJoule = () =>
  planck * c * (Number(angwavenumberbox.value) / (2 * pi));
angwavenumberbox.fromJoule = (energyJ) => (2 * pi * energyJ) / (planck * c);

// characteristic temperature. E = kT 
const temperaturebox = getBox("temperature");
temperaturebox.toJoule = () => Number(temperaturebox.value) * boltz;
temperaturebox.fromJoule = (energyJ) => energyJ / boltz;


// temperature for boltzmann, rate, equilibria calculations (i.e. ensemble temperature)
// recalculate various parameters when this is changed
const boltzmannTbox = getBox("boltzmannT");
boltzmannTbox.changed = (energyJ) => {
  boltzmannbox.value = formatNumber(
    Number(boltzmanngbox.value) *
      Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)))
  );
  equilibriumconstantbox.value = formatNumber(
    Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)))
  );
  lnequilibriumconstantbox.value = formatNumber(
    -energyJ / (boltz * Number(boltzmannTbox.value))
  );
  arrheniusbox.value = formatNumber(
    Number(Aconstantbox.value) *
      Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)))
  );
};

// boltzmann degeneracy ratio (upper/lower)
const boltzmanngbox = getBox("boltzmanng");
boltzmanngbox.changed = (energyJ) => {
  boltzmannbox.value = formatNumber(
    Number(boltzmanngbox.value) *
      Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)))
  );
};

// gives boltzmann populations (upper/lower)
const boltzmannbox = getBox("boltzmann");
boltzmannbox.toJoule = () =>
  Math.log(Number(boltzmannbox.value) / Number(boltzmanngbox.value)) * boltz * Number(boltzmannTbox.value);
boltzmannbox.fromJoule = (energyJ) =>
  Number(boltzmanngbox.value) *
  Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));

// gives K = exp(-dG/kT)
const equilibriumconstantbox = getBox("equilibrium");
equilibriumconstantbox.toJoule = () =>
  -boltz *
  Number(boltzmannTbox.value) *
  Math.log(Number(equilibriumconstantbox.value));
equilibriumconstantbox.fromJoule = (energyJ) =>
  Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));

// gives lnK = -dG/kT
const lnequilibriumconstantbox = getBox("lnequilibrium");
lnequilibriumconstantbox.toJoule = () =>
  -boltz *
  Number(boltzmannTbox.value) *
  Number(lnequilibriumconstantbox.value);
lnequilibriumconstantbox.fromJoule = (energyJ) =>
  -energyJ / (boltz * Number(boltzmannTbox.value));

// Arrhenius A factor
const Aconstantbox = getBox("Aconstant");
Aconstantbox.changed = (energyJ) => {
  arrheniusbox.value = formatNumber(
    Number(Aconstantbox.value) *
      Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)))
  );
};

// Arrhenius rate constant, k = A exp(-Ea/RT)
const arrheniusbox = getBox("arrhenius");
arrheniusbox.toJoule = () =>
  -Math.log(Number(arrheniusbox.value) / Number(Aconstantbox.value)) *
  boltz *
  Number(boltzmannTbox.value);
arrheniusbox.fromJoule = (energyJ) =>
  Number(Aconstantbox.value) *
  Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value)));

// half life from Arrhenius assuming 1st order kinetics t = ln2 / k 
const halflifebox = getBox("halflife");
halflifebox.toJoule = () =>
  -Math.log((Math.log(2) / Number(halflifebox.value)) / Number(Aconstantbox.value)) *
  boltz *
  Number(boltzmannTbox.value);
halflifebox.fromJoule = (energyJ) =>
  Math.log(2) /
  (Number(Aconstantbox.value) *
    Math.exp(-energyJ / (boltz * Number(boltzmannTbox.value))));



// cell potential, E = -dG/nF
const cellpotentialbox = getBox("cellpotential");

cellpotentialbox.toJoule = () =>
  (-Number(nelectronsbox.value) * faraday * Number(cellpotentialbox.value)) /
  avogadro;
cellpotentialbox.fromJoule = (energyJ) =>
  (energyJ * avogadro) / (-Number(nelectronsbox.value) * faraday);



// Number of electrons (n) transferred in cell reaction: dG = -nFE
const nelectronsbox = getBox("nelectrons");
nelectronsbox.changed = (energyJ) => {
  cellpotentialbox.value = formatNumber(
    (avogadro * energyJ) / (-Number(nelectronsbox.value) * faraday)
  );
};



// British thermal units
const btubox = getBox("btu");
btubox.toJoule = () => Number(btubox.value) * btu;
btubox.fromJoule = (energyJ) => energyJ / btu;

// Grams of TNT equivalent
const tntbox = getBox("TNT");
tntbox.toJoule = () => Number(tntbox.value) * tnt;
tntbox.fromJoule = (energyJ) => energyJ / tnt;

// Calories equivalent (kcal)
const caloriebox = getBox("calorie");
caloriebox.toJoule = () => Number(caloriebox.value) * kcal;
caloriebox.fromJoule = (energyJ) => energyJ / kcal;

// Rydberg units
const rydbergbox = getBox("rydberg");
rydbergbox.toJoule = () => Number(rydbergbox.value) * rydberg;
rydbergbox.fromJoule = (energyJ) => energyJ / rydberg;

// Cgs standard units (ergs)
const ergbox = getBox("erg");
ergbox.toJoule = () => Number(ergbox.value) * erg;
ergbox.fromJoule = (energyJ) => energyJ / erg;

// Barrels of oil equivalent
const booebox = getBox("booe");
booebox.toJoule = () => Number(booebox.value) * booe;
booebox.fromJoule = (energyJ) => energyJ / booe;


// boxes that are energies
const boxes: EnergyInput[] = [
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
const nonEboxes: EnergyInput[] = [
  boltzmannTbox,
  boltzmanngbox,
  nelectronsbox,
  Aconstantbox,
];

// function to update boxes when changed. 
function update_form(event: Event): void {
    // changed box is the one that the event targeted
  const changed_box = event.target as EnergyInput;
  // if it doesn't have toJoule method return
  if (!changed_box.toJoule) return;

// calculate the energy in Joules from the changed box
  const change_J = changed_box.toJoule(Number(changed_box.value));

  // run through all the other boxes and update them using the fromJoule functions
  for (const box of boxes) {
    if (box === changed_box || !box.fromJoule) continue;
    box.value = formatNumber(box.fromJoule(change_J));
  }
}

// add event listeners for all the boxes, update_form for any energy. boxes
for (const box of boxes) {
  box.addEventListener("input", update_form);
}

// custom changed functions boxes that aren't directly energy units
boltzmannTbox.addEventListener("input", () =>
  boltzmannTbox.changed?.(Number(energyJbox.value))
);
boltzmanngbox.addEventListener("input", () =>
  boltzmanngbox.changed?.(Number(energyJbox.value))
);
nelectronsbox.addEventListener("input", () =>
  nelectronsbox.changed?.(Number(energyJbox.value))
);
Aconstantbox.addEventListener("input", () =>
  Aconstantbox.changed?.(Number(energyJbox.value))
);

