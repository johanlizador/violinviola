/* 1. CONFIGURACIÓN DE SEGURIDAD Y TRADUCCIONES */
const TEACHER_PASSWORD = "viola2026"; 
let isStudentAllowed = false; 

const translations = {
  es: { 
    nav_teachers: "Profesores", nav_studio: "Aula Remota", hero_title: "Excelencia e Innovación en Cuerdas", hero_subtitle: "Clases privadas de Violín y Viola.", hero_cta: "Entrar al Aula", studio_title: "Aula de Práctica Sincronizada", login_title: "Acceso a Panel de Profesor", btn_login: "Desbloquear Aula", join_title: "¡Bienvenido a la clase!", join_desc: "Haz clic abajo para activar el sonido y conectar.", join_btn: "Activar Audio y Conectar", metronome_heading: "Metrónomo de Precisión", btn_start_metro: "Iniciar", btn_stop_metro: "Detener", drone_heading: "Drones de Afinación", video_heading: "Videollamada Integrada", video_hint: "⚠️ Obligatorio: El alumno debe usar audífonos/auriculares para evitar problemas de eco con el metrónomo.", btn_start_video: "Encender Cámara y Micrófono", vid_local_wait: "Tu cámara está apagada", vid_remote_wait: "Esperando a que el otro participante encienda su cámara...", vid_remote: "Remoto", 
    btn_mute: "Silenciar", btn_unmute: "Activar Audio", btn_cam_off: "Apagar Cámara", btn_cam_on: "Encender Cámara", btn_fullscreen: "Pantalla Completa", btn_exit_fullscreen: "Salir Pantalla", btn_layout: "Cambiar Vista",
    vid_starting: "Accediendo a cámara...", btn_answer_call: "Contestar videollamada (requiere cámara)", copy_ok: "¡Copiado!", copy_label: "Copiar",
    student_hint: "¿Eres alumno? Necesitas el enlace que te envía tu profesor.", calib_label: "LA de referencia", open_strings: "Cuerdas al aire", keyboard_label: "Teclado cromático", btn_stop_drone: "Detener Afinador", drone_idle: "Sin nota"
  },
  en: { 
    nav_teachers: "Faculty", nav_studio: "Live Classroom", hero_title: "Strings Excellence & Innovation", hero_subtitle: "Private violin and viola instruction.", hero_cta: "Enter Studio", studio_title: "Synchronized Studio", login_title: "Teacher Panel Access", btn_login: "Unlock Studio", join_title: "Welcome to class!", join_desc: "Click below to enable audio and connect.", join_btn: "Enable Audio & Connect", metronome_heading: "Precision Metronome", btn_start_metro: "Start", btn_stop_metro: "Stop", drone_heading: "Tuning Drones", video_heading: "Integrated Video Call", video_hint: "⚠️ Required: Student must wear headphones to prevent metronome echo.", btn_start_video: "Turn on Camera & Mic", vid_local_wait: "Your camera is off", vid_remote_wait: "Waiting for the other participant to turn on their camera...", vid_remote: "Remote",
    btn_mute: "Mute", btn_unmute: "Unmute", btn_cam_off: "Stop Video", btn_cam_on: "Start Video", btn_fullscreen: "Full Screen", btn_exit_fullscreen: "Exit Screen", btn_layout: "Change View",
    vid_starting: "Accessing camera...", btn_answer_call: "Answer video call (camera required)", copy_ok: "Copied!", copy_label: "Copy",
    student_hint: "Are you a student? You need the link your teacher sends you.", calib_label: "Reference A", open_strings: "Open strings", keyboard_label: "Chromatic keyboard", btn_stop_drone: "Stop Tuner", drone_idle: "No pitch"
  }
};

let currentLang = 'es';
function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyLanguage(currentLang);
  updateMediaButtonsText();
  buildKeyboard();          // DO RE MI  <->  C D E
  refreshStringLabels();
  updateDroneReadout();
}
function applyLanguage(lang) { 
  document.documentElement.lang = lang; 
  document.getElementById('lang-toggle').innerText = lang === 'es' ? 'EN' : 'ES'; 
  document.querySelectorAll('[data-i18n]').forEach(el => { 
    if (translations[lang][el.getAttribute('data-i18n')]) el.innerText = translations[lang][el.getAttribute('data-i18n')]; 
  }); 
}

/* 2. LÓGICA DE ROLES Y AUTH */
let peer = null; let activeConnection = null; let currentRole = 'visitor'; let joinIdFromUrl = null;
let hasJoined = false;

function getJoinId() {
  const fromQuery = new URLSearchParams(window.location.search).get('join');
  if (fromQuery) return fromQuery;
  // Rescate de enlaces antiguos del tipo  .../index.html#studio?join=ID
  const hash = window.location.hash;
  const q = hash.indexOf('?');
  if (q !== -1) return new URLSearchParams(hash.slice(q)).get('join');
  return null;
}

/* "Entrar al Aula": para el alumno no es sólo bajar la página, es conectarse.
   Además el clic sirve de gesto para desbloquear el audio del navegador. */
function enterStudio() {
  const studio = document.getElementById('studio');
  if (studio) studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (currentRole === 'student' && !hasJoined) studentJoinClass();
}

function initSystem() {
  applyLanguage(currentLang);
  setA4(a4, false);
  buildKeyboard();
  refreshStringLabels();
  updateDroneReadout();
  joinIdFromUrl = getJoinId();
  
  if (joinIdFromUrl) {
    currentRole = 'student';
    document.getElementById('teacher-login-panel').style.display = 'none';
    document.getElementById('student-join-panel').style.display = 'block';
    document.getElementById('main-controls').style.display = 'grid'; 
    lockStudentInterface(true); // Bloquea botones de metrónomo/drone
    initPeerClient();
  } else {
    document.getElementById('teacher-login-panel').style.display = 'block';
  }
}

function authenticateTeacher() {
  const input = document.getElementById('teacher-password').value;
  if (input === TEACHER_PASSWORD) {
    currentRole = 'teacher';
    document.getElementById('teacher-login-panel').style.display = 'none';
    document.getElementById('teacher-share-box').style.display = 'block';
    document.getElementById('main-controls').style.display = 'grid'; 
    lockStudentInterface(false); 
    initPeerTeacher();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

/* 3. PEERJS (WEBRTC) - DATOS Y VIDEOLLAMADA */
function setStatus(text, state) { 
  document.getElementById('status-text').innerText = text; 
  document.getElementById('status-dot').className = 'dot ' + state; 
}

function initPeerTeacher() {
  setStatus("Generando sala...", "warning");
  peer = new Peer({ config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }] } });
  peer.on('open', (id) => {
    document.getElementById('peer-id-label').innerText = id;
    // Quitamos primero el #hash y luego la query: si no, un '#studio' en la URL
    // del profesor dejaba el '?join=' dentro del hash y el alumno nunca lo veía.
    const base = window.location.href.split('#')[0].split('?')[0];
    document.getElementById('student-link-input').value = base + '?join=' + id + '#studio';
    setStatus("Esperando al alumno...", "warning");
  });
  peer.on('connection', (conn) => { activeConnection = conn; setupConn(conn); });
  setupCallListener();
}

function initPeerClient() {
  setStatus("Listo para conectar...", "warning");
  peer = new Peer({ config: { 'iceServers': [{ urls: 'stun:stun.l.google.com:19302' }] } });
  peer.on('open', (id) => { document.getElementById('peer-id-label').innerText = "Alumno"; });
  setupCallListener();
}

function studentJoinClass() {
  if (hasJoined) return;
  hasJoined = true;
  const ctx = getAudioContext();
  ctx.resume().then(() => {
    const unlockOsc = ctx.createOscillator(); const unlockGain = ctx.createGain();
    unlockOsc.connect(unlockGain); unlockGain.connect(ctx.destination); unlockGain.gain.value = 0; 
    unlockOsc.start(ctx.currentTime); unlockOsc.stop(ctx.currentTime + 0.001);

    document.getElementById('student-join-panel').style.display = 'none';
    setStatus("Conectando con profesor...", "warning");
    const doConnect = () => {
      const conn = peer.connect(joinIdFromUrl);
      activeConnection = conn; setupConn(conn);
    };
    // Si el alumno pulsa antes de que PeerJS termine de registrarse, esperamos
    if (peer && peer.open) doConnect(); else peer.on('open', doConnect);
  });
}

function setupConn(conn) {
  conn.on('open', () => { 
    setStatus("Conectado en Vivo", "connected"); 
    if(currentRole === 'teacher') {
      sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
      sendPeerMessage({ type: 'TUNING_CHANGE', a4 });
    }
    if(localStream && conn.peer) makeCall(conn.peer);
  });
  conn.on('data', (data) => { handleData(data); });
  conn.on('close', () => { setStatus(currentRole === 'teacher' ? "Alumno desconectado" : "Profesor desconectado", "error"); });
}

function sendPeerMessage(msg) { if (activeConnection && activeConnection.open) activeConnection.send(msg); }
function copyStudentLink(btn) {
  const input = document.getElementById('student-link-input');
  const feedback = () => {
    if (!btn) return;
    btn.innerText = translations[currentLang].copy_ok;
    setTimeout(() => { btn.innerText = translations[currentLang].copy_label; }, 1500);
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(input.value).then(feedback).catch(() => {
      input.select(); document.execCommand('copy'); feedback();
    });
  } else {
    input.select(); input.setSelectionRange(0, 99999); document.execCommand('copy'); feedback();
  }
}

/* ----------------------------------------------------
   LÓGICA DE VIDEO, PANTALLA COMPLETA Y ARRASTRE
   ---------------------------------------------------- */
let localStream = null;
let currentCall = null;
let pendingCall = null;
let isMicOn = true;
let isCamOn = true;
let isFullScreen = false;

async function startVideo() {
  const btn = document.getElementById('btn-start-video');
  btn.disabled = true;
  btn.innerText = translations[currentLang].vid_starting;

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } 
    });

    document.getElementById('local-video').srcObject = localStream;
    setLocalPlaceholder(false);
    btn.style.display = 'none'; 
    
    // Revelar la interfaz de videollamada
    document.getElementById('video-conference-container').style.display = 'flex';

    if (activeConnection && activeConnection.peer) makeCall(activeConnection.peer);
    if (pendingCall) {
      pendingCall.answer(localStream);
      setupCallEvents(pendingCall);
      pendingCall = null;
    }
  } catch(err) {
    console.error("Error media:", err);
    alert("No se pudo acceder a la cámara o micrófono. Revisa los permisos de tu navegador.");
    btn.disabled = false;
    btn.innerText = translations[currentLang].btn_start_video;
  }
}

function toggleMic() {
  if (!localStream) return;
  isMicOn = !isMicOn;
  localStream.getAudioTracks().forEach(track => track.enabled = isMicOn);
  document.getElementById('btn-toggle-mic').classList.toggle('disabled', !isMicOn);
  updateMediaButtonsText();
}

function setLocalPlaceholder(visible) {
  const ph = document.getElementById('local-placeholder');
  if (ph) ph.style.display = visible ? 'flex' : 'none';
}

function toggleCam() {
  if (!localStream) return;
  isCamOn = !isCamOn;
  localStream.getVideoTracks().forEach(track => track.enabled = isCamOn);
  document.getElementById('btn-toggle-cam').classList.toggle('disabled', !isCamOn);
  setLocalPlaceholder(!isCamOn);
  updateMediaButtonsText();
}

function toggleViewLayout() {
  const container = document.getElementById('video-conference-container');
  const localBox = document.getElementById('draggable-local');
  
  if (container.classList.contains('pip-mode')) {
    container.classList.remove('pip-mode');
    container.classList.add('gallery-mode');
    // Reiniciar estilos de arrastre
    localBox.style.top = ''; localBox.style.left = ''; localBox.style.right = ''; localBox.style.bottom = '';
  } else {
    container.classList.remove('gallery-mode');
    container.classList.add('pip-mode');
  }
}

function updateMediaButtonsText() {
  const micSpan = document.querySelector('#btn-toggle-mic span');
  const camSpan = document.querySelector('#btn-toggle-cam span');
  const fsSpan = document.querySelector('.btn-fullscreen span');
  if (!micSpan || !camSpan) return;

  micSpan.innerText = translations[currentLang][isMicOn ? "btn_mute" : "btn_unmute"];
  camSpan.innerText = translations[currentLang][isCamOn ? "btn_cam_off" : "btn_cam_on"];
  if(fsSpan) fsSpan.innerText = translations[currentLang][isFullScreen ? "btn_exit_fullscreen" : "btn_fullscreen"];
}

/* --- Pantalla Completa --- */
function toggleFullScreen() {
  const container = document.getElementById('video-conference-container');
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (container.requestFullscreen) container.requestFullscreen();
    else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen(); // Safari
    isFullScreen = true;
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); // Safari
    isFullScreen = false;
  }
  updateMediaButtonsText();
}

function onFullScreenChange() {
  isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
  updateMediaButtonsText();
}
document.addEventListener('fullscreenchange', onFullScreenChange);
document.addEventListener('webkitfullscreenchange', onFullScreenChange);

/* --- Lógica de Arrastre para PiP (Picture in Picture) --- */
const localBox = document.getElementById('draggable-local');
let isDragging = false;
let offsetX, offsetY;

function startDrag(e) {
  if (!document.getElementById('video-conference-container').classList.contains('pip-mode')) return;
  isDragging = true;
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  const rect = localBox.getBoundingClientRect();
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault(); // Evita scroll en móviles al arrastrar
  
  const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
  const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
  
  const gridLayout = document.getElementById('video-grid').getBoundingClientRect();
  
  let x = clientX - gridLayout.left - offsetX;
  let y = clientY - gridLayout.top - offsetY;

  // Limitar para que no se salga de la pantalla negra
  x = Math.max(0, Math.min(x, gridLayout.width - localBox.offsetWidth));
  y = Math.max(0, Math.min(y, gridLayout.height - localBox.offsetHeight));

  localBox.style.left = x + 'px';
  localBox.style.top = y + 'px';
  localBox.style.bottom = 'auto'; // Elimina la posición por defecto del CSS
  localBox.style.right = 'auto';
}

function stopDrag() { isDragging = false; }

localBox.addEventListener('mousedown', startDrag);
localBox.addEventListener('touchstart', startDrag, {passive: false});
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag);

/* --- Conexión de Llamadas --- */
function makeCall(remoteId) {
  if (!localStream) return;
  currentCall = peer.call(remoteId, localStream);
  setupCallEvents(currentCall);
}

function setupCallListener() {
  peer.on('call', (call) => {
    if (localStream) {
      call.answer(localStream);
      setupCallEvents(call);
    } else {
      pendingCall = call;
      const btn = document.getElementById('btn-start-video');
      if (!btn) return;
      btn.removeAttribute('data-i18n'); // que applyLanguage no lo pise
      btn.innerText = translations[currentLang].btn_answer_call;
      btn.style.background = "var(--success)";
      btn.style.borderColor = "var(--success)";
    }
  });
}

function setupCallEvents(call) {
  call.on('stream', (remoteStream) => {
    document.getElementById('remote-video').srcObject = remoteStream;
    document.getElementById('remote-placeholder').style.display = 'none';
  });
  call.on('close', () => {
    document.getElementById('remote-video').srcObject = null;
    document.getElementById('remote-placeholder').style.display = 'flex';
  });
}

/* 4. BLOQUEOS Y PERMISOS BIDIRECCIONALES */
function toggleStudentPermissions() {
  isStudentAllowed = !isStudentAllowed;
  const btn = document.getElementById('btn-toggle-student-auth');
  if (isStudentAllowed) {
    btn.innerText = "🔓 Alumno Desbloqueado (Clic para bloquear)";
    btn.style.color = "var(--success)"; btn.style.borderColor = "var(--success)";
  } else {
    btn.innerText = "🔒 Alumno Bloqueado (Clic para permitir)";
    btn.style.color = "var(--warning)"; btn.style.borderColor = "var(--warning)";
  }
  sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
}

function lockStudentInterface(lock) {
  document.getElementById('lock-metro').style.display = lock ? 'block' : 'none';
  document.getElementById('lock-drone').style.display = lock ? 'block' : 'none';
}

/* 5. AUDIO (METRÓNOMO Y AFINADOR) */
let audioCtx = null; let isPlaying = false; let bpm = 100; let beatsPerBar = 4; let currentBeat = 0; let nextNoteTime = 0.0; let timerID = null;
function getAudioContext() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }

function scheduleNote(beatNumber, time) {
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
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
    isPlaying = false; clearTimeout(timerID);
    document.getElementById('btn-play-metro').innerText = translations[currentLang].btn_start_metro; 
    document.getElementById('btn-play-metro').classList.remove('active');
    if (broadcast) sendPeerMessage({ type: 'METRO_STOP' });
  } else {
    isPlaying = true; currentBeat = 0; nextNoteTime = audioCtx.currentTime; scheduler();
    document.getElementById('btn-play-metro').innerText = translations[currentLang].btn_stop_metro; 
    document.getElementById('btn-play-metro').classList.add('active');
    if (broadcast) sendPeerMessage({ type: 'METRO_START', bpm, beatsPerBar });
  }
}

function onTempoChange(val, broadcast = true) {
  bpm = parseInt(val); document.getElementById('bpm-display').innerText = bpm; document.getElementById('tempo-slider').value = bpm;
  if (broadcast) sendPeerMessage({ type: 'TEMPO_CHANGE', bpm });
}

function setTimeSignature(sig, broadcast = true) {
  beatsPerBar = sig; currentBeat = 0;
  document.querySelectorAll('.ts-btn').forEach(b => b.classList.remove('active')); 
  document.getElementById('ts-' + sig).classList.add('active');
  if (broadcast) sendPeerMessage({ type: 'TIMESIG_CHANGE', beatsPerBar });
}

let droneOsc = null; let droneGain = null; let currentDroneMidi = null;
let a4 = 440;                 // LA de referencia en Hz
let kbStart = 48;             // nota más grave del teclado (48 = DO3)
const KB_OCTAVES = 3;
const BLACK_PCS = [1, 3, 6, 8, 10];
const NOTE_NAMES = {
  es: ['DO', 'DO#', 'RE', 'RE#', 'MI', 'FA', 'FA#', 'SOL', 'SOL#', 'LA', 'LA#', 'SI'],
  en: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
};

/* Todo se calcula desde el LA de referencia: si cambia a 442, cambia todo. */
function midiToFreq(midi) { return a4 * Math.pow(2, (midi - 69) / 12); }
function noteName(midi) { return NOTE_NAMES[currentLang][((midi % 12) + 12) % 12]; }
function octaveOf(midi) { return Math.floor(midi / 12) - 1; }
function noteLabel(midi) { return noteName(midi) + octaveOf(midi); }

/* --- Calibración del LA --- */
function setA4(value, broadcast = true) {
  a4 = Math.min(466, Math.max(415, Math.round(value)));
  document.getElementById('a4-value').innerText = a4;
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.hz) === a4));
  // Si hay un dron sonando, se reafina en vivo (sin cortes)
  if (droneOsc && currentDroneMidi !== null && audioCtx) {
    droneOsc.frequency.linearRampToValueAtTime(midiToFreq(currentDroneMidi), audioCtx.currentTime + 0.06);
  }
  updateDroneReadout();
  if (broadcast) sendPeerMessage({ type: 'TUNING_CHANGE', a4 });
}
function changeA4(delta) { setA4(a4 + delta); }

/* --- Teclado --- */
/* En un piano real las negras NO están centradas sobre la juntura de las
   blancas: dentro de cada grupo las colas de las blancas miden lo mismo, lo que
   empuja el DO# hacia la izquierda, el RE# hacia la derecha y deja el SOL#
   centrado. Estos son los bordes izquierdos, medidos en anchos de tecla blanca
   desde el DO de la octava (una negra mide 0.6 de una blanca). */
const BLACK_OFFSETS = { 1: 0.60, 3: 1.80, 6: 3.55, 8: 4.70, 10: 5.85 };

function buildKeyboard() {
  const piano = document.getElementById('piano');
  if (!piano) return;
  piano.innerHTML = '';

  const felt = document.createElement('div');
  felt.className = 'piano-felt';
  const bed = document.createElement('div');
  bed.className = 'keybed';

  const last = kbStart + KB_OCTAVES * 12;           // incluye el DO superior
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

  const face = document.createElement('span');   // superficie superior de la tecla
  face.className = 'key-face';
  const front = document.createElement('span');  // canto frontal, el que mira al intérprete
  front.className = 'key-front';
  const label = document.createElement('span');
  label.className = 'key-label';
  // Sólo etiquetamos las blancas; los DO llevan además el número de octava
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

/* Si el profesor toca algo fuera de la vista del alumno, la desplazamos */
function ensureKeyVisible(midi) {
  const last = kbStart + KB_OCTAVES * 12;
  if (midi >= kbStart && midi <= last) return;
  let next = kbStart;
  while (midi < next && next > 24) next -= 12;
  while (midi > next + KB_OCTAVES * 12 && next < 60) next += 12;
  if (next !== kbStart) { kbStart = next; buildKeyboard(); }
}

/* --- Estado visual --- */
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
  if (currentDroneMidi === null) {
    out.innerText = translations[currentLang].drone_idle;
    out.classList.add('idle');
  } else {
    out.innerText = noteLabel(currentDroneMidi) + '  ·  ' + midiToFreq(currentDroneMidi).toFixed(1) + ' Hz';
    out.classList.remove('idle');
  }
  refreshStringLabels();
}

/* --- Motor de sonido --- */
function toggleDrone(midi, broadcast = true) {
  getAudioContext();
  if (currentDroneMidi === midi) { stopDrone(broadcast); return; }
  stopDrone(false);

  droneOsc = audioCtx.createOscillator(); droneGain = audioCtx.createGain();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(midiToFreq(midi), audioCtx.currentTime);
  droneGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
  droneGain.gain.exponentialRampToValueAtTime(0.28, audioCtx.currentTime + 0.1);
  droneOsc.connect(droneGain); droneGain.connect(audioCtx.destination); droneOsc.start();

  currentDroneMidi = midi;
  ensureKeyVisible(midi);
  refreshDroneHighlights();
  updateDroneReadout();
  if (broadcast) sendPeerMessage({ type: 'DRONE_START', midi });
}

function stopDrone(broadcast = true) {
  // Guardamos referencias locales: si no, el setTimeout apagaba el oscilador
  // nuevo cuando se cambiaba de una nota a otra.
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
  if (broadcast) sendPeerMessage({ type: 'DRONE_STOP' });
}

/* 6. MANEJO DE MENSAJES RECIBIDOS */
function handleData(data) {
  if (data.type === 'PERMISSIONS') {
    if(currentRole === 'student') lockStudentInterface(!data.allowed);
  }
  else if (data.type === 'METRO_START') { bpm = data.bpm; beatsPerBar = data.beatsPerBar; onTempoChange(bpm, false); setTimeSignature(beatsPerBar, false); if(!isPlaying) toggleMetronome(false); }
  else if (data.type === 'METRO_STOP') { if(isPlaying) toggleMetronome(false); }
  else if (data.type === 'TEMPO_CHANGE') { onTempoChange(data.bpm, false); }
  else if (data.type === 'TIMESIG_CHANGE') { setTimeSignature(data.beatsPerBar, false); }
  else if (data.type === 'TUNING_CHANGE') { setA4(data.a4, false); }
  else if (data.type === 'DRONE_START') { toggleDrone(data.midi, false); }
  else if (data.type === 'DRONE_STOP') { stopDrone(false); }
}

window.addEventListener('load', initSystem);
