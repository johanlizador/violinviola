/* Drones de afinación: LA de referencia, cuerdas al aire y teclado cromático */

let droneOsc = null; let droneGain = null; let currentDroneMidi = null;
let a4 = 440;                 
let kbStart = 48;             
const KB_OCTAVES = 3;
const BLACK_PCS = [1, 3, 6, 8, 10];
const NOTE_NAMES = {
  es: ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'],
  en: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
};

function midiToFreq(midi) { return a4 * Math.pow(2, (midi - 69) / 12); }
function noteName(midi) { return NOTE_NAMES[currentLang][((midi % 12) + 12) % 12]; }
function octaveOf(midi) { return Math.floor(midi / 12) - 1; }
function noteLabel(midi) { return noteName(midi) + octaveOf(midi); }

function setA4(value, broadcast = true) {
  a4 = Math.min(466, Math.max(415, Math.round(value)));
  document.getElementById('a4-value').innerText = a4;
  document.getElementById('mon-a4').innerText = a4;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.hz) === a4));
  if (droneOsc && currentDroneMidi !== null && audioCtx) {
    droneOsc.frequency.linearRampToValueAtTime(midiToFreq(currentDroneMidi), audioCtx.currentTime + 0.06);
  }
  updateDroneReadout();
  if (broadcast) sendPeerMessage({ type: 'TUNING_CHANGE', a4 });
}
function changeA4(delta) { setA4(a4 + delta); }

const BLACK_OFFSETS = { 1: 0.60, 3: 1.80, 6: 3.55, 8: 4.70, 10: 5.85 };

function buildKeyboard() {
  const piano = document.getElementById('piano');
  if (!piano) return;
  piano.innerHTML = '';

  const felt = document.createElement('div');
  felt.className = 'piano-felt';
  const bed = document.createElement('div');
  bed.className = 'keybed';

  const last = kbStart + KB_OCTAVES * 12;           
  const whites = [];
  for (let m = kbStart; m <= last; m++) if (!BLACK_PCS.includes(m % 12)) whites.push(m);
  bed.style.setProperty('--white-count', whites.length);

  whites.forEach(m => bed.appendChild(makeKey(m, 'white')));

  for (let m = kbStart; m <= last; m++) {
    if (!BLACK_PCS.includes(m % 12)) continue;
    const key = makeKey(m, 'black');
    const units = Math.floor((m - kbStart) / 12) * 7 + BLACK_OFFSETS[m % 12];
    key.style.left = 'calc(100% / ' + whites.length + ' * ' + units + ')';
    bed.appendChild(key);
  }

  piano.appendChild(felt);
  piano.appendChild(bed);

  const rangeLabel = document.getElementById('kb-range');
  if (rangeLabel) rangeLabel.innerText = noteLabel(kbStart) + ' – ' + noteLabel(last);
  refreshDroneHighlights();
}

function makeKey(midi, type) {
  const key = document.createElement('button');
  key.className = 'key ' + type + (midi % 12 === 0 ? ' is-c' : '');
  key.dataset.midi = midi;
  key.title = noteLabel(midi) + ' · ' + midiToFreq(midi).toFixed(1) + ' Hz';
  key.onclick = () => toggleDrone(midi);

  const face = document.createElement('span');   
  face.className = 'key-face';
  const front = document.createElement('span');  
  front.className = 'key-front';
  const label = document.createElement('span');
  label.className = 'key-label';
  label.innerText = type === 'white' ? (midi % 12 === 0 ? noteLabel(midi) : noteName(midi)) : '';

  key.appendChild(face);
  key.appendChild(front);
  key.appendChild(label);
  return key;
}

function shiftOctave(delta) {
  const next = kbStart + delta * 12;
  if (next < 24 || next > 60) return;
  kbStart = next;
  buildKeyboard();
}

function ensureKeyVisible(midi) {
  const last = kbStart + KB_OCTAVES * 12;
  if (midi >= kbStart && midi <= last) return;
  let next = kbStart;
  while (midi < next && next > 24) next -= 12;
  while (midi > next + KB_OCTAVES * 12 && next < 60) next += 12;
  if (next !== kbStart) { kbStart = next; buildKeyboard(); }
}

function refreshDroneHighlights() {
  document.querySelectorAll('.key, .drone-btn').forEach(el => {
    el.classList.toggle('playing', parseInt(el.dataset.midi) === currentDroneMidi);
  });
}

function refreshStringLabels() {
  document.querySelectorAll('.drone-btn').forEach(btn => {
    const midi = parseInt(btn.dataset.midi);
    btn.innerHTML = noteName(midi) + '<small>' + octaveOf(midi) + '</small>';
    btn.title = noteLabel(midi) + ' · ' + midiToFreq(midi).toFixed(1) + ' Hz';
  });
}

function updateDroneReadout() {
  const out = document.getElementById('drone-readout');
  if (!out) return;
  const mon = document.getElementById('mon-note');
  if (currentDroneMidi === null) {
    out.innerText = translations[currentLang].drone_idle;
    out.classList.add('idle');
    if (mon) mon.innerText = '—';
  } else {
    const txt = noteLabel(currentDroneMidi) + '  ·  ' + midiToFreq(currentDroneMidi).toFixed(1) + ' Hz';
    out.innerText = txt;
    out.classList.remove('idle');
    if (mon) mon.innerText = txt;
  }
  refreshStringLabels();
}

function toggleDrone(midi, broadcast = true) {
  getAudioContext();
  if (currentDroneMidi === midi) { stopDrone(broadcast); return; }
  stopDrone(false);

  droneOsc = audioCtx.createOscillator(); droneGain = audioCtx.createGain();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(midiToFreq(midi), audioCtx.currentTime);
  droneGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  droneGain.gain.exponentialRampToValueAtTime(0.28, audioCtx.currentTime + 0.1);
  droneOsc.connect(droneGain); droneGain.connect(getToolsBus()); droneOsc.start();

  currentDroneMidi = midi;
  ensureKeyVisible(midi);
  refreshDroneHighlights();
  updateDroneReadout();
  if (broadcast) sendToolMessage({ type: 'DRONE_START', midi });
}

function stopDrone(broadcast = true) {
  const osc = droneOsc, gain = droneGain;
  droneOsc = null; droneGain = null; currentDroneMidi = null;

  if (gain && audioCtx) {
    const t = audioCtx.currentTime;
    gain.gain.cancelScheduledValues(t);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  }
  if (osc) setTimeout(() => { try { osc.stop(); osc.disconnect(); } catch (e) {} }, 60);

  refreshDroneHighlights();
  updateDroneReadout();
  if (broadcast) sendToolMessage({ type: 'DRONE_STOP' });
}
