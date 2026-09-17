/* Web Audio compartido, enrutado del audio de herramientas y metrónomo */

let audioCtx = null; let isPlaying = false; let bpm = 100; let beatsPerBar = 4; let currentBeat = 0; let nextNoteTime = 0.0; let timerID = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Si ya se eligió un altavoz antes de crear el contexto, aplicarlo ahora
    applySinkToAudioContext();
  }
  return audioCtx;
}

let toolsBus = null;
let localAudioOn = true;
let remoteAudioOn = true;

function getToolsBus() {
  const ctx = getAudioContext();
  if (!toolsBus) {
    toolsBus = ctx.createGain();
    toolsBus.gain.value = localAudioOn ? 1 : 0;
    toolsBus.connect(ctx.destination);
  }
  return toolsBus;
}

function setLocalAudio(on) {
  localAudioOn = on;
  const bus = getToolsBus();
  const t = audioCtx.currentTime;
  bus.gain.cancelScheduledValues(t);
  bus.gain.setValueAtTime(bus.gain.value, t);
  bus.gain.linearRampToValueAtTime(on ? 1 : 0, t + 0.04);
}

function sendToolMessage(msg) {
  if (currentRole === 'teacher' && !remoteAudioOn) return;
  sendPeerMessage(msg);
}

function pushToolStateToPeer() {
  if (currentRole !== 'teacher' || !remoteAudioOn) return;
  if (isPlaying) sendToolMessage({ type: 'METRO_START', bpm, beatsPerBar });
  if (currentDroneMidi !== null) sendPeerMessage({ type: 'DRONE_START', midi: currentDroneMidi });
}

function setRemoteAudio(on) {
  remoteAudioOn = on;
  if (currentRole !== 'teacher') return;
  if (on) pushToolStateToPeer();
  else { sendPeerMessage({ type: 'METRO_STOP' }); sendPeerMessage({ type: 'DRONE_STOP' }); }
}

const beatQueue = [];

function buildBeatDots() {
  const box = document.getElementById('beat-dots');
  if (!box) return;
  box.innerHTML = '';
  for (let i = 0; i < beatsPerBar; i++) {
    const d = document.createElement('span');
    d.className = 'beat-dot' + (i === 0 ? ' strong' : '');
    box.appendChild(d);
  }
}

function markBeat(n) {
  document.querySelectorAll('.beat-dot').forEach((d, i) => d.classList.toggle('on', i === n));
}

function beatLoop() {
  if (audioCtx) {
    let ultimo = -1;
    while (beatQueue.length && beatQueue[0].time <= audioCtx.currentTime) ultimo = beatQueue.shift().beat;
    if (ultimo >= 0) markBeat(ultimo);
  }
  requestAnimationFrame(beatLoop);
}

function scheduleNote(beatNumber, time) {
  beatQueue.push({ beat: beatNumber, time });
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(getToolsBus());
  osc.frequency.value = (beatNumber === 0) ? 1000 : 650;
  gain.gain.setValueAtTime(beatNumber === 0 ? 0.8 : 0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
  osc.start(time); osc.stop(time + 0.04);
}

function scheduler() {
  while (nextNoteTime < audioCtx.currentTime + 0.1) {
    scheduleNote(currentBeat, nextNoteTime); nextNoteTime += (60.0 / bpm); currentBeat = (currentBeat + 1) % beatsPerBar;
  }
  timerID = setTimeout(scheduler, 25);
}

function toggleMetronome(broadcast = true) {
  getAudioContext();
  if (isPlaying) {
    isPlaying = false; clearTimeout(timerID); beatQueue.length = 0; markBeat(-1);
    document.getElementById('btn-play-metro').innerText = translations[currentLang].btn_start_metro; 
    document.getElementById('btn-play-metro').classList.remove('active');
    if (broadcast) sendToolMessage({ type: 'METRO_STOP' });
  } else {
    isPlaying = true; currentBeat = 0; nextNoteTime = audioCtx.currentTime; scheduler();
    document.getElementById('btn-play-metro').innerText = translations[currentLang].btn_stop_metro; 
    document.getElementById('btn-play-metro').classList.add('active');
    if (broadcast) sendToolMessage({ type: 'METRO_START', bpm, beatsPerBar });
  }
}

function onTempoChange(val, broadcast = true) {
  bpm = parseInt(val); document.getElementById('bpm-display').innerText = bpm; document.getElementById('tempo-slider').value = bpm;
  document.getElementById('mon-bpm').innerText = bpm;
  if (broadcast) sendToolMessage({ type: 'TEMPO_CHANGE', bpm });
}

function setTimeSignature(sig, broadcast = true) {
  beatsPerBar = sig; currentBeat = 0;
  document.getElementById('mon-ts').innerText = sig === 6 ? '6/8' : sig + '/4';
  buildBeatDots();
  document.querySelectorAll('.ts-btn').forEach(b => b.classList.remove('active')); 
  document.getElementById('ts-' + sig).classList.add('active');
  if (broadcast) sendToolMessage({ type: 'TIMESIG_CHANGE', beatsPerBar });
}
