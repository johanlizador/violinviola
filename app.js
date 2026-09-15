/* 1. CONFIGURACIÓN DE SEGURIDAD Y TRADUCCIONES */
const TEACHER_PASSWORD = "viola2026"; 
let isStudentAllowed = false; 

const translations = {
  es: { nav_teachers: "Profesores", nav_studio: "Aula Remota", hero_title: "Excelencia e Innovación en Cuerdas", hero_subtitle: "Clases privadas de Violín y Viola.", hero_cta: "Entrar al Aula", studio_title: "Aula de Práctica Sincronizada", login_title: "Acceso a Panel de Profesor", btn_login: "Desbloquear Aula", join_title: "¡Bienvenido a la clase!", join_desc: "Haz clic abajo para activar el sonido y conectar.", join_btn: "Activar Audio y Conectar", metronome_heading: "Metrónomo de Precisión", btn_start_metro: "Iniciar", btn_stop_metro: "Detener", drone_heading: "Drones de Afinación", video_heading: "Videollamada Integrada", video_hint: "⚠️ Obligatorio: El alumno debe usar audífonos/auriculares para evitar problemas de eco con el metrónomo.", btn_start_video: "Encender Cámara y Micrófono", vid_local_wait: "Tu cámara está apagada", vid_remote_wait: "Esperando cámara del otro participante...", vid_remote: "Remoto" },
  en: { nav_teachers: "Faculty", nav_studio: "Live Classroom", hero_title: "Strings Excellence & Innovation", hero_subtitle: "Private violin and viola instruction.", hero_cta: "Enter Studio", studio_title: "Synchronized Studio", login_title: "Teacher Panel Access", btn_login: "Unlock Studio", join_title: "Welcome to class!", join_desc: "Click below to enable audio and connect.", join_btn: "Enable Audio & Connect", metronome_heading: "Precision Metronome", btn_start_metro: "Start", btn_stop_metro: "Stop", drone_heading: "Tuning Drones", video_heading: "Integrated Video Call", video_hint: "⚠️ Required: Student must wear headphones to prevent metronome echo.", btn_start_video: "Turn on Camera & Mic", vid_local_wait: "Your camera is off", vid_remote_wait: "Waiting for the other participant's camera...", vid_remote: "Remote" }
};

let currentLang = 'es';
function toggleLanguage() { currentLang = currentLang === 'es' ? 'en' : 'es'; applyLanguage(currentLang); updateMediaButtonsText(); }
function applyLanguage(lang) { 
  document.documentElement.lang = lang; 
  document.getElementById('lang-toggle').innerText = lang === 'es' ? 'EN' : 'ES'; 
  document.querySelectorAll('[data-i18n]').forEach(el => { 
    if (translations[lang][el.getAttribute('data-i18n')]) el.innerText = translations[lang][el.getAttribute('data-i18n')]; 
  }); 
}

/* 2. LÓGICA DE ROLES Y AUTH */
let peer = null; let activeConnection = null; let currentRole = 'visitor'; let joinIdFromUrl = null;

function initSystem() {
  applyLanguage(currentLang);
  const urlParams = new URLSearchParams(window.location.search);
  joinIdFromUrl = urlParams.get('join');
  
  if (joinIdFromUrl) {
    currentRole = 'student';
    document.getElementById('teacher-login-panel').style.display = 'none';
    document.getElementById('student-join-panel').style.display = 'block';
    document.getElementById('main-controls').style.display = 'grid'; 
    lockStudentInterface(true); 
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
    document.getElementById('student-link-input').value = window.location.href.split('?')[0] + '?join=' + id;
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
  const ctx = getAudioContext();
  ctx.resume().then(() => {
    const unlockOsc = ctx.createOscillator(); const unlockGain = ctx.createGain();
    unlockOsc.connect(unlockGain); unlockGain.connect(ctx.destination); unlockGain.gain.value = 0; 
    unlockOsc.start(ctx.currentTime); unlockOsc.stop(ctx.currentTime + 0.001);

    document.getElementById('student-join-panel').style.display = 'none';
    setStatus("Conectando con profesor...", "warning");
    const conn = peer.connect(joinIdFromUrl);
    activeConnection = conn; setupConn(conn);
  });
}

function setupConn(conn) {
  conn.on('open', () => { 
    setStatus("Conectado en Vivo", "connected"); 
    if(currentRole === 'teacher') sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
    
    if(localStream && conn.peer) {
      makeCall(conn.peer);
    }
  });
  conn.on('data', (data) => { handleData(data); });
  conn.on('close', () => { setStatus(currentRole === 'teacher' ? "Alumno desconectado" : "Profesor desconectado", "error"); });
}

function sendPeerMessage(msg) { if (activeConnection && activeConnection.open) activeConnection.send(msg); }
function copyStudentLink() { document.getElementById('student-link-input').select(); document.execCommand('copy'); }

/* LÓGICA DE VIDEOLLAMADA Y BOTONES MUTE/CÁMARA */
let localStream = null;
let currentCall = null;
let pendingCall = null;
let isMicOn = true;
let isCamOn = true;

async function startVideo() {
  const btn = document.getElementById('btn-start-video');
  btn.disabled = true;
  btn.innerText = "Accediendo a cámara...";

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } 
    });

    document.getElementById('local-video').srcObject = localStream;
    document.getElementById('local-placeholder').style.display = 'none';
    btn.style.display = 'none'; 
    
    document.getElementById('call-controls').style.display = 'flex';

    if (activeConnection && activeConnection.peer) {
      makeCall(activeConnection.peer);
    }

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
  
  const btn = document.getElementById('btn-toggle-mic');
  if (isMicOn) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
  updateMediaButtonsText();
}

function toggleCam() {
  if (!localStream) return;
  isCamOn = !isCamOn;
  localStream.getVideoTracks().forEach(track => track.enabled = isCamOn);
  
  const btn = document.getElementById('btn-toggle-cam');
  if (isCamOn) {
    btn.classList.remove('disabled');
  } else {
    btn.classList.add('disabled');
  }
  updateMediaButtonsText();
}

function updateMediaButtonsText() {
  const micBtn = document.getElementById('btn-toggle-mic');
  const camBtn = document.getElementById('btn-toggle-cam');
  if (!micBtn || !camBtn) return;

  if (currentLang === 'es') {
    micBtn.innerText = isMicOn ? "🎤 Silenciar Micrófono" : "🎤 Activar Audio";
    camBtn.innerText = isCamOn ? "📷 Apagar Cámara" : "📷 Encender Cámara";
  } else {
    micBtn.innerText = isMicOn ? "🎤 Mute Mic" : "🎤 Unmute";
    camBtn.innerText = isCamOn ? "📷 Turn Off Cam" : "📷 Turn On Cam";
  }
}

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
      btn.innerText = "Contestar Videollamada (Requiere Cámara)";
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
    btn.innerText = "🔒 Alumno Bloqueado (Clic para permitir control)";
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

let droneOsc = null; let droneGain = null;
function toggleDrone(freq, noteName, broadcast = true) {
  getAudioContext(); stopDrone(false);
  droneOsc = audioCtx.createOscillator(); droneGain = audioCtx.createGain();
  droneOsc.type = 'sine'; droneOsc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  droneGain.gain.setValueAtTime(0.01, audioCtx.currentTime); droneGain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.1);
  droneOsc.connect(droneGain); droneGain.connect(audioCtx.destination); droneOsc.start();
  document.getElementById('drone-' + noteName).classList.add('playing');
  if (broadcast) sendPeerMessage({ type: 'DRONE_START', freq, noteName });
}

function stopDrone(broadcast = true) {
  if (droneGain) droneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  setTimeout(() => { if (droneOsc) { droneOsc.stop(); droneOsc.disconnect(); droneOsc = null; } }, 50);
  document.querySelectorAll('.drone-btn').forEach(b => b.classList.remove('playing'));
  if (broadcast) sendPeerMessage({ type: 'DRONE_STOP' });
}

/* 6. MANEJO DE MENSAJES RECIBIDOS (BIDIRECCIONAL) */
function handleData(data) {
  if (data.type === 'PERMISSIONS') {
    if(currentRole === 'student') lockStudentInterface(!data.allowed);
  }
  else if (data.type === 'METRO_START') { bpm = data.bpm; beatsPerBar = data.beatsPerBar; onTempoChange(bpm, false); setTimeSignature(beatsPerBar, false); if(!isPlaying) toggleMetronome(false); }
  else if (data.type === 'METRO_STOP') { if(isPlaying) toggleMetronome(false); }
  else if (data.type === 'TEMPO_CHANGE') { onTempoChange(data.bpm, false); }
  else if (data.type === 'TIMESIG_CHANGE') { setTimeSignature(data.beatsPerBar, false); }
  else if (data.type === 'DRONE_START') { toggleDrone(data.freq, data.noteName, false); }
  else if (data.type === 'DRONE_STOP') { stopDrone(false); }
}

window.addEventListener('load', initSystem);
