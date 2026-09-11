"use strict";
// helper function to get hold of the box element needed for input/output
function getBox(id) {
    return document.getElementById(id);
}
// to avoid faffing with dotted letters, safe to assume anything with an e is heavy?
// heavy vowels = true, light (Dotted) = false
function getVowelGroup(verb) {
    if (verb.includes('e')) {
        var vowelgroup = true;
    }
    else {
        var vowelgroup = false;
    }
    return vowelgroup;
}
const vowelgroupbox = document.getElementById('vowelgroupbox');
// present simple (A bia m/O me). same as root.
// to root: do nothing, from root: do nothing
const presentbox = getBox("present");
presentbox.toRoot = () => String(presentbox.value);
presentbox.fromRootHeavy = (root) => root;
presentbox.fromRootLight = (root) => root;
const negpresentbox = getBox("negpresent");
negpresentbox.toRoot = () => String(negpresentbox.value).slice(0, -3);
negpresentbox.fromRootHeavy = (root) => root + 'ghi';
negpresentbox.fromRootLight = (root) => root + 'ghị';
// perfect (A biaala, O meela)
const perfectbox = getBox("perfect");
perfectbox.toRoot = () => String(perfectbox.value).slice(0, -3);
perfectbox.fromRootHeavy = (root) => root + 'ela';
perfectbox.fromRootLight = (root) => root + 'ala';
const negperfectbox = getBox("negperfect");
negperfectbox.toRoot = () => String(negperfectbox.value).slice(0, -5);
negperfectbox.fromRootHeavy = (root) => root + 'beghị';
negperfectbox.fromRootLight = (root) => root + 'beghị';
// future (A ga-abia , O ga-eme)
const futurebox = getBox("future");
futurebox.toRoot = () => String(futurebox.value).slice(4) + '';
futurebox.fromRootHeavy = (root) => 'ga-e' + root;
futurebox.fromRootLight = (root) => 'ga-a' + root;
const negfuturebox = getBox("negfuture");
negfuturebox.toRoot = () => String(negfuturebox.value).slice(7);
negfuturebox.fromRootHeavy = (root) => 'gaghi e' + root;
negfuturebox.fromRootLight = (root) => 'gaghị a' + root;
// past (A biara , O mere)
const pastbox = getBox("past");
pastbox.toRoot = () => String(pastbox.value).slice(0, -2) + '';
pastbox.fromRootHeavy = (root) => root + 'r' + root.slice(-1);
pastbox.fromRootLight = (root) => root + 'r' + root.slice(-1);
const negpastbox = getBox("negpast");
negpastbox.toRoot = () => String(negpastbox.value).slice(0, -3) + '';
negpastbox.fromRootHeavy = (root) => root + 'ghi';
negpastbox.fromRootLight = (root) => root + 'ghị';
// present continuous (A na m abia, O na-abia)
const presentcontbox = getBox("presentcont");
presentcontbox.toRoot = () => String(presentcontbox.value).slice(4) + '';
presentcontbox.fromRootHeavy = (root) => 'na-e' + root;
presentcontbox.fromRootLight = (root) => 'na-a' + root;
const negpresentcontbox = getBox("negpresentcont");
negpresentcontbox.toRoot = () => String(negpresentcontbox.value).slice(7) + '';
negpresentcontbox.fromRootHeavy = (root) => 'naghi e' + root;
negpresentcontbox.fromRootLight = (root) => 'naghị a' + root;
// imperative (Biaa, mee)
const imperativebox = getBox("imperative");
imperativebox.toRoot = () => String(imperativebox.value).slice(0, -1) + '';
imperativebox.fromRootHeavy = (root) => root + 'e';
imperativebox.fromRootLight = (root) => root + 'a';
const negimperativebox = getBox("negimperative");
negimperativebox.toRoot = () => String(negimperativebox.value).slice(1, -3) + '';
negimperativebox.fromRootHeavy = (root) => 'e' + root + 'ela';
negimperativebox.fromRootLight = (root) => 'a' + root + 'ala';
// infinitive box (Biaa, mee)
const infinitivebox = getBox("infinitive");
infinitivebox.toRoot = () => String(infinitivebox.value).slice(1) + '';
infinitivebox.fromRootHeavy = (root) => 'i' + root;
infinitivebox.fromRootLight = (root) => 'ị' + root;
// boxes that are energies
const verbboxes = [
    presentbox,
    perfectbox,
    futurebox,
    pastbox,
    presentcontbox,
    imperativebox,
    infinitivebox,
    negpastbox,
    negpresentbox,
    negfuturebox,
    negpresentcontbox,
    negimperativebox,
    negperfectbox,
];
// boxes that aren't energies
// const nonEboxes: EnergyInput[] = [
//   boltzmannTbox,
//   boltzmanngbox,
//   nelectronsbox,
//   Aconstantbox,
// ];
// function to update boxes when changed. 
function update_form(event) {
    // changed box is the one that the event targeted
    const changed_box = event.target;
    if (!changed_box.toRoot)
        return;
    // calculate the energy in Joules from the changed box
    const root = changed_box.toRoot(String(changed_box.value));
    const vowelgroup = getVowelGroup(root);
    if (vowelgroup) {
        vowelgroupbox.value = "Heavy (e i o u)";
    }
    else {
        vowelgroupbox.value = "Light (a ị ọ ụ)";
    }
    // run through all the other boxes and update them using the fromJoule functions
    for (const box of verbboxes) {
        if (box === changed_box || !box.fromRootHeavy || !box.fromRootLight)
            continue;
        if (vowelgroup) {
            box.value = String(box.fromRootHeavy(root));
        }
        else {
            box.value = String(box.fromRootLight(root));
        }
    }
}
// add event listeners for all the boxes, update_form for any energy. boxes
for (const box of verbboxes) {
    box.addEventListener("change", update_form);
}
