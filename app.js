/* 1. CONFIGURACIÓN DE SEGURIDAD Y TRADUCCIONES */
const TEACHER_PASSWORD = "viola2026"; 
let isStudentAllowed = false; 

const translations = {
  es: { 
    nav_teachers: "Profesores", nav_studio: "Aula Remota", nav_request: "Solicitar clase", hero_title: "Excelencia e Innovación en Cuerdas", hero_subtitle: "Clases privadas de Violín y Viola.", hero_cta: "Entrar al Aula", studio_title: "Aula de Práctica Sincronizada", login_title: "Acceso a Panel de Profesor", btn_login: "Desbloquear Aula", share_hint: "Enlace para el alumno:", join_title: "Bienvenido a la clase", join_btn: "Entrar a la clase",
    join_headphones: "🎧 Ponte los auriculares antes de entrar. Sin ellos, el metrónomo se cuela por tu micrófono y se oye eco.",
    join_name_label: "¿Cómo te llamas?", join_need_name: "Escribe tu nombre para que tu profesor sepa quién entra.",
    join_preview_hint: "Aquí te verás a ti mismo", join_test: "Probar cámara y micrófono",
    join_framing: "Coloca la cámara de modo que se vean el arco y la mano izquierda, no solo la cara.",
    perm_title: "El navegador bloqueó la cámara o el micrófono.",
    perm_desktop: "Pulsa el candado (o el icono de cámara) a la izquierda de la dirección web, pon Cámara y Micrófono en «Permitir», y recarga la página.",
    perm_ios: "Abre Ajustes › Safari › Cámara y Micrófono y elige «Preguntar» o «Permitir». Después vuelve aquí y recarga la página.",
    perm_none: "No se detectó ninguna cámara o micrófono conectado.",
    perm_busy: "Otra aplicación está usando la cámara. Cierra Zoom, Meet o cualquier otra videollamada y vuelve a intentarlo.", metronome_heading: "Metrónomo de Precisión", btn_start_metro: "Iniciar", btn_stop_metro: "Detener", drone_heading: "Drones de Afinación", video_heading: "Videollamada Integrada", video_hint: "⚠️ Obligatorio: El alumno debe usar audífonos/auriculares para evitar problemas de eco con el metrónomo.", btn_start_video: "Encender Cámara y Micrófono", vid_local_wait: "Tu cámara está apagada", vid_remote_wait: "Esperando a que el otro participante encienda su cámara...", vid_remote_off: "Cámara apagada", vid_remote: "Remoto", 
    btn_mute: "Silenciar", btn_unmute: "Activar Audio", btn_cam_off: "Apagar Cámara", btn_cam_on: "Encender Cámara", btn_fullscreen: "Pantalla Completa", btn_exit_fullscreen: "Salir Pantalla", btn_layout: "Cambiar Vista",
    vid_starting: "Accediendo a cámara...", btn_answer_call: "Contestar videollamada (requiere cámara)", copy_ok: "¡Copiado!", copy_label: "Copiar",
    student_hint: "¿Eres alumno? Necesitas el enlace que te envía tu profesor.",
    st_waiting: "Esperando conexión...", st_generating: "Generando sala...", st_wait_student: "Esperando al alumno...", st_ready: "Listo para conectar...", st_connecting: "Conectando con tu profesor...", st_live: "Conectado en vivo", st_student_left: "El alumno se desconectó", st_teacher_left: "Tu profesor se desconectó",
    err_peer_gone: "No se encontró esa sala. ¿El enlace es el actual?", err_network: "Sin conexión con el servidor de enlace", err_id: "Ya tienes el aula abierta en otra pestaña. Ciérrala y recarga.", err_browser: "Este navegador no soporta videollamadas", err_generic: "Error de conexión", err_ice: "No se pudo abrir la conexión (falta TURN)", err_room_closed: "El aula no está abierta. Pídele a tu profesor que la abra y vuelve a intentarlo.", st_retrying: "El aula aún no está abierta, reintentando...",
    lock_badge: "🔒 Lo controla tu profesor", routing_label: "¿Dónde suenan el metrónomo y los drones?", routing_local: "En mi equipo", routing_remote: "En el equipo del alumno", mon_tempo: "Tempo de la clase", mon_pitch: "Nota de referencia", mon_idle: "Sin metrónomo", calib_label: "LA de referencia", open_strings: "Cuerdas al aire", keyboard_label: "Teclado cromático", btn_stop_drone: "Detener Afinador", drone_idle: "Sin nota"
  },
  en: { 
    nav_teachers: "Faculty", nav_studio: "Live Classroom", nav_request: "Request a lesson", hero_title: "Strings Excellence & Innovation", hero_subtitle: "Private violin and viola instruction.", hero_cta: "Enter Studio", studio_title: "Synchronized Studio", login_title: "Teacher Panel Access", btn_login: "Unlock Studio", share_hint: "Link for your student:", join_title: "Welcome to class", join_btn: "Enter the class",
    join_headphones: "🎧 Put your headphones on before entering. Without them the metronome leaks into your microphone and echoes.",
    join_name_label: "What's your name?", join_need_name: "Enter your name so your teacher knows who's joining.",
    join_preview_hint: "You'll see yourself here", join_test: "Test camera and microphone",
    join_framing: "Position the camera so the bow and the left hand are visible, not just your face.",
    perm_title: "Your browser blocked the camera or microphone.",
    perm_desktop: "Click the padlock (or camera icon) to the left of the web address, set Camera and Microphone to Allow, and reload the page.",
    perm_ios: "Open Settings > Safari > Camera and Microphone and choose Ask or Allow. Then come back here and reload.",
    perm_none: "No camera or microphone was detected.",
    perm_busy: "Another app is using the camera. Close Zoom, Meet or any other video call and try again.", metronome_heading: "Precision Metronome", btn_start_metro: "Start", btn_stop_metro: "Stop", drone_heading: "Tuning Drones", video_heading: "Integrated Video Call", video_hint: "⚠️ Required: Student must wear headphones to prevent metronome echo.", btn_start_video: "Turn on Camera & Mic", vid_local_wait: "Your camera is off", vid_remote_wait: "Waiting for the other participant to turn on their camera...", vid_remote_off: "Camera off", vid_remote: "Remote",
    btn_mute: "Mute", btn_unmute: "Unmute", btn_cam_off: "Stop Video", btn_cam_on: "Start Video", btn_fullscreen: "Full Screen", btn_exit_fullscreen: "Exit Screen", btn_layout: "Change View",
    vid_starting: "Accessing camera...", btn_answer_call: "Answer video call (camera required)", copy_ok: "Copied!", copy_label: "Copy",
    student_hint: "Are you a student? You need the link your teacher sends you.",
    st_waiting: "Waiting for connection...", st_generating: "Creating room...", st_wait_student: "Waiting for the student...", st_ready: "Ready to connect...", st_connecting: "Connecting to your teacher...", st_live: "Live", st_student_left: "The student disconnected", st_teacher_left: "Your teacher disconnected",
    err_peer_gone: "That room wasn't found. Is the link current?", err_network: "No connection to the signalling server", err_id: "You already have the classroom open in another tab. Close it and reload.", err_browser: "This browser doesn't support video calls", err_generic: "Connection error", err_ice: "Could not open the connection (TURN needed)", err_room_closed: "The classroom isn't open. Ask your teacher to open it, then try again.", st_retrying: "Classroom not open yet, retrying...",
    lock_badge: "🔒 Your teacher controls this", routing_label: "Where do the metronome and drones play?", routing_local: "On my machine", routing_remote: "On the student's machine", mon_tempo: "Class tempo", mon_pitch: "Reference pitch", mon_idle: "No metronome", calib_label: "Reference A", open_strings: "Open strings", keyboard_label: "Chromatic keyboard", btn_stop_drone: "Stop Tuner", drone_idle: "No pitch"
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
  if (lastStatusKey) setStatus(lastStatusKey, document.getElementById('status-dot').className.replace('dot ', ''));
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
  if (currentRole === 'student' && !hasJoined) studentEnterClass();
}

function initSystem() {
  applyLanguage(currentLang);
  setA4(a4, false);
  buildBeatDots();
  requestAnimationFrame(beatLoop);
  buildKeyboard();
  refreshStringLabels();
  updateDroneReadout();
  joinIdFromUrl = getJoinId();
  
  if (joinIdFromUrl) {
    currentRole = 'student';
    document.body.classList.add('student-view');
    document.getElementById('teacher-login-panel').style.display = 'none';
    document.getElementById('student-lobby').style.display = 'block';
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
    const quien = document.getElementById('room-choice');
    initPeerTeacher(ROOMS[quien ? quien.value : 'johann']);
    keepScreenAwake();
  } else {
    document.getElementById('login-error').style.display = 'block';
  }
}

/* 3. PEERJS (WEBRTC) - DATOS Y VIDEOLLAMADA */
let lastStatusKey = 'st_waiting';
function setStatus(key, state) {
  lastStatusKey = key;
  document.getElementById('status-text').innerText = translations[currentLang][key] || key;
  document.getElementById('status-dot').className = 'dot ' + state;
}

/* ==========================================================================
   RED: servidores de STUN y TURN
   --------------------------------------------------------------------------
   STUN sólo sirve para descubrir la IP pública. Si una de las dos partes está
   detrás de NAT de operadora (CGNAT) — lo normal en Venezuela y en muchas redes
   móviles — los dos navegadores NO consiguen verse y la conexión nunca llega a
   abrirse, ni siquiera la de datos.

   La solución es un TURN, que retransmite el tráfico por un servidor
   intermedio. Hace falta uno con credenciales propias:

     1. Cuenta gratis en https://www.metered.ca/tools/openrelay/
        (20 GB al mes, y funciona por los puertos 80 y 443, que es justo lo que
         hace falta para atravesar redes restrictivas)
     2. Copia usuario y contraseña en TURN_USER / TURN_PASS

   Sin esto la clase funcionará entre dos casas con conexión permisiva y
   fallará justo con quien más lo necesitas.
   ========================================================================== */
const TURN_USER = "";   // <-- pegar aquí
const TURN_PASS = "";   // <-- pegar aquí

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

if (TURN_USER && TURN_PASS) {
  ICE_SERVERS.push(
    { urls: 'turn:standard.relay.metered.ca:80',            username: TURN_USER, credential: TURN_PASS },
    { urls: 'turn:standard.relay.metered.ca:80?transport=tcp',  username: TURN_USER, credential: TURN_PASS },
    { urls: 'turn:standard.relay.metered.ca:443',           username: TURN_USER, credential: TURN_PASS },
    { urls: 'turns:standard.relay.metered.ca:443?transport=tcp', username: TURN_USER, credential: TURN_PASS }
  );
}

/* Salas fijas: el enlace de cada profesor es SIEMPRE el mismo.
   Antes se generaba un ID al azar en cada carga, así que bastaba recargar la
   página para que el enlace ya enviado dejara de existir (peer-unavailable). */
const ROOMS = {
  johann: 'dnstudio-johann-aula',
  abril:  'dnstudio-abril-aula'
};

function newPeer(fixedId) {
  const p = fixedId
    ? new Peer(fixedId, { config: { iceServers: ICE_SERVERS } })
    : new Peer({ config: { iceServers: ICE_SERVERS } });
  // El servidor de enlace corta las sesiones inactivas; al reconectar se
  // recupera el MISMO id, así que el enlace del alumno sigue sirviendo.
  p.on('disconnected', () => { if (!p.destroyed) { showDiagnostic('reconectando...'); p.reconnect(); } });
  p.on('error', (err) => onPeerError(err));
  return p;
}

/* Hasta ahora no había ningún manejador de errores: si PeerJS fallaba, fallaba
   en silencio y el profesor se quedaba mirando "Esperando al alumno". */
let joinAttempts = 0;

function onPeerError(err) {
  const tipo = err && err.type ? err.type : 'desconocido';

  // El alumno llegó antes de que el profesor abriera el aula: reintentamos
  if (tipo === 'peer-unavailable' && currentRole === 'student') {
    showDiagnostic('PeerJS: peer-unavailable');
    return retryJoin();
  }
  // El profesor tiene otra pestaña abierta con la misma sala
  if (tipo === 'unavailable-id' && currentRole === 'teacher') {
    setStatus('err_id', 'error');
    showDiagnostic('PeerJS: unavailable-id');
    return;
  }
  const msg = {
    'peer-unavailable': 'PEER_GONE',
    'network':          'NET_DOWN',
    'server-error':     'NET_DOWN',
    'unavailable-id':   'ID_TAKEN',
    'browser-incompatible': 'NO_WEBRTC'
  }[tipo] || 'GENERIC';
  setStatus({
    PEER_GONE: 'err_peer_gone', NET_DOWN: 'err_network', ID_TAKEN: 'err_id',
    NO_WEBRTC: 'err_browser', GENERIC: 'err_generic'
  }[msg], 'error');
  showDiagnostic('PeerJS: ' + tipo);
  console.error('[aula] error de PeerJS:', err);
}

/* El aula puede abrirse después que el alumno: insistir es lo correcto */
function retryJoin() {
  if (joinAttempts >= 4) {
    hasJoined = false;
    joinAttempts = 0;
    setStatus('err_room_closed', 'error');
    const lobby = document.getElementById('student-lobby');
    if (lobby) lobby.style.display = 'block';
    const espera = document.getElementById('lobby-waiting');
    if (espera) { espera.hidden = false; espera.innerText = translations[currentLang].err_room_closed; }
    return;
  }
  joinAttempts++;
  setStatus('st_retrying', 'warning');
  const espera = document.getElementById('lobby-waiting');
  if (espera) { espera.hidden = false; espera.innerText = translations[currentLang].st_retrying; }
  setTimeout(() => {
    if (!peer || peer.destroyed) return;
    const conn = peer.connect(joinIdFromUrl);
    activeConnection = conn;
    setupConn(conn);
  }, 4000);
}

/* Estado real de la negociación ICE, que es donde falla el CGNAT */
function watchIce(conn) {
  const pc = conn && conn.peerConnection;
  if (!pc) return;
  pc.oniceconnectionstatechange = () => {
    showDiagnostic('ICE: ' + pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed') {
      setStatus('err_ice', 'error');
      console.error('[aula] ICE falló: hace falta un servidor TURN.');
    }
  };
}

function showDiagnostic(texto) {
  const box = document.getElementById('diagnostic');
  if (!box) return;
  box.textContent = texto;
  box.hidden = false;
}

function initPeerTeacher(roomId) {
  setStatus('st_generating', 'warning');
  peer = newPeer(roomId);
  peer.on('open', (id) => {
    document.getElementById('peer-id-label').innerText = id;
    // Quitamos primero el #hash y luego la query: si no, un '#studio' en la URL
    // del profesor dejaba el '?join=' dentro del hash y el alumno nunca lo veía.
    const base = window.location.href.split('#')[0].split('?')[0];
    document.getElementById('student-link-input').value = base + '?join=' + id + '#studio';
    setStatus('st_wait_student', 'warning');
  });
  peer.on('connection', (conn) => { activeConnection = conn; setupConn(conn); });
  setupCallListener();
}

function initPeerClient() {
  setStatus('st_ready', 'warning');
  peer = newPeer();
  peer.on('open', (id) => { document.getElementById('peer-id-label').innerText = "Alumno"; });
  setupCallListener();
}

/* ==========================================================================
   ENTRADA DEL ALUMNO
   Una sola puerta: nombre, prueba opcional de cámara, y un botón que activa
   audio, pide permisos, conecta y arranca el video en un mismo gesto.
   ========================================================================== */
let studentName = '';
let micMeterRAF = null;

/* Prueba de cámara y micrófono antes de que el profesor lo vea */
async function prepareMedia() {
  try {
    if (!localStream) {
      localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false }
      });
    }
    const prev = document.getElementById('lobby-video');
    if (prev) prev.srcObject = localStream;
    const empty = document.getElementById('lobby-preview-empty');
    if (empty) empty.style.display = 'none';
    startMicMeter();
    document.getElementById('permission-help').hidden = true;
    return true;
  } catch (err) {
    showPermissionHelp(err);
    return false;
  }
}

/* Una barra que se mueve dice más que "micrófono activo" */
function startMicMeter() {
  if (micMeterRAF || !localStream) return;
  const ctx = getAudioContext();
  const source = ctx.createMediaStreamSource(localStream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);           // no se conecta a destination: no se oye a sí mismo
  const datos = new Uint8Array(analyser.frequencyBinCount);
  const barra = document.getElementById('mic-level');
  const meter = document.getElementById('mic-meter');
  if (meter) meter.style.display = 'block';

  const pintar = () => {
    analyser.getByteTimeDomainData(datos);
    let pico = 0;
    for (let i = 0; i < datos.length; i++) pico = Math.max(pico, Math.abs(datos[i] - 128));
    if (barra) barra.style.width = Math.min(100, (pico / 70) * 100) + '%';
    micMeterRAF = requestAnimationFrame(pintar);
  };
  pintar();
}

function stopMicMeter() {
  if (micMeterRAF) cancelAnimationFrame(micMeterRAF);
  micMeterRAF = null;
}

/* Un permiso denegado se recuerda: hay que explicar cómo revertirlo */
function showPermissionHelp(err) {
  const caja = document.getElementById('permission-help');
  const pasos = document.getElementById('perm-steps');
  if (!caja || !pasos) return;
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const denegado = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
  const sinCamara = err && (err.name === 'NotFoundError' || err.name === 'OverconstrainedError');

  let clave;
  if (sinCamara) clave = 'perm_none';
  else if (!denegado) clave = 'perm_busy';
  else clave = iOS ? 'perm_ios' : 'perm_desktop';

  pasos.innerText = translations[currentLang][clave];
  caja.hidden = false;
  console.error('[aula] permisos:', err && err.name, err);
}

async function studentEnterClass() {
  if (hasJoined) return;

  const campo = document.getElementById('student-name');
  studentName = campo ? campo.value.trim() : '';
  if (!studentName) {
    document.getElementById('lobby-waiting').hidden = false;
    document.getElementById('lobby-waiting').innerText = translations[currentLang].join_need_name;
    if (campo) campo.focus();
    return;
  }

  // El mismo clic desbloquea el audio del navegador
  const ctx = getAudioContext();
  await ctx.resume();

  if (!await prepareMedia()) return;   // sin permisos no se entra: ya se explicó por qué

  hasJoined = true;
  stopMicMeter();
  document.getElementById('student-lobby').style.display = 'none';
  keepScreenAwake();
  setStatus('st_connecting', 'warning');

  // Video listo desde el primer segundo, sin segundo botón
  document.getElementById('local-video').srcObject = localStream;
  setLocalPlaceholder(false);
  document.getElementById('btn-start-video').style.display = 'none';
  document.getElementById('video-conference-container').style.display = 'flex';

  const doConnect = () => {
    const conn = peer.connect(joinIdFromUrl);
    activeConnection = conn;
    setupConn(conn);
  };
  if (peer && peer.open) doConnect(); else peer.on('open', doConnect);
}

/* La pantalla no debe apagarse con el instrumento en las manos */
let wakeLock = null;
async function keepScreenAwake() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) { /* no es crítico */ }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !wakeLock && hasJoined) keepScreenAwake();
});

function setupConn(conn) {
  watchIce(conn);
  conn.on('open', () => { 
    setStatus('st_live', 'connected'); 
    if(currentRole === 'teacher') {
      sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
      sendPeerMessage({ type: 'TUNING_CHANGE', a4 });
      pushToolStateToPeer();
    }
    if (currentRole === 'student' && studentName) sendPeerMessage({ type: 'HELLO', name: studentName });
    if(localStream && conn.peer) makeCall(conn.peer);
  });
  conn.on('data', (data) => { handleData(data); });
  conn.on('close', () => { setStatus(currentRole === 'teacher' ? 'st_student_left' : 'st_teacher_left', 'error'); });
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
      currentCall = pendingCall;          // sin esto, videoSender() no encuentra la llamada
      currentCall.answer(localStream);
      setupCallEvents(currentCall);
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

/* Apagar la cámara de verdad.
   track.enabled = false sólo deja de enviar fotogramas: el dispositivo sigue
   abierto y el LED del portátil sigue encendido, que es exactamente lo que no
   quieres cuando le dices a un alumno que apagaste la cámara. Hay que llamar a
   track.stop() para soltar el hardware, y al reencender pedir una pista nueva
   y cambiarla en caliente con replaceTrack(), sin renegociar la llamada. */

/* El LED sólo se apaga cuando se detienen TODAS las pistas de vídeo abiertas,
   estén donde estén: en localStream, en la vista previa del vestíbulo o
   colgando de un elemento <video>. Una sola que quede viva mantiene el
   dispositivo encendido. */
function stopAllVideoTracks() {
  const streams = new Set();
  if (localStream) streams.add(localStream);
  ['local-video', 'lobby-video'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.srcObject) streams.add(el.srcObject);
  });

  const detenidas = [];
  streams.forEach(s => s.getVideoTracks().forEach(t => {
    t.stop();
    detenidas.push(t.readyState);          // debe quedar en "ended"
    try { s.removeTrack(t); } catch (e) {}
  }));

  const lv = document.getElementById('local-video');
  if (lv) lv.srcObject = localStream;
  const pv = document.getElementById('lobby-video');
  if (pv) pv.srcObject = null;
  return detenidas;
}

function videoSender() {
  const pc = currentCall && currentCall.peerConnection;
  if (!pc) return null;
  return pc.getSenders().find(s => s.track && s.track.kind === 'video')
      || pc.getSenders().find(s => !s.track);   // hueco libre tras apagarla
}

async function toggleCam() {
  if (!localStream) return;
  const btn = document.getElementById('btn-toggle-cam');
  btn.disabled = true;

  try {
    if (isCamOn) {
      // ---- Apagar: soltar el hardware ----
      // Primero se detiene, pase lo que pase después. Antes iba detrás del
      // replaceTrack: si ese fallaba, saltaba al catch y la cámara seguía viva.
      const detenidas = stopAllVideoTracks();
      showDiagnostic('cámara: ' + (detenidas.join(', ') || 'sin pistas'));
      isCamOn = false;
      try {
        const sender = videoSender();
        if (sender) await sender.replaceTrack(null);    // el otro ve "cámara apagada"
      } catch (e) { console.warn('[aula] replaceTrack(null):', e); }
      sendPeerMessage({ type: 'CAM_STATE', on: false });

    } else {
      // ---- Encender: pista nueva, sin renegociar ----
      const fresca = await navigator.mediaDevices.getUserMedia({ video: true });
      const pista = fresca.getVideoTracks()[0];
      localStream.addTrack(pista);
      document.getElementById('local-video').srcObject = localStream;

      const sender = videoSender();
      if (sender) await sender.replaceTrack(pista);
      isCamOn = true;
      sendPeerMessage({ type: 'CAM_STATE', on: true });
    }
  } catch (err) {
    console.error('[aula] no se pudo cambiar la cámara:', err);
    showPermissionHelp(err);
  }

  btn.disabled = false;
  btn.classList.toggle('disabled', !isCamOn);
  setLocalPlaceholder(!isCamOn);
  updateMediaButtonsText();
}

/* Al salir del aula hay que soltar cámara y micrófono igualmente */
function releaseMedia() {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
}
window.addEventListener('pagehide', releaseMedia);

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

/* --- Pantalla Completa ---
   iPhone no implementa la API de pantalla completa sobre elementos que no sean
   <video>, así que ahí caemos a una pantalla completa simulada con CSS. */
function nativeFullscreenAvailable(el) {
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

function fullscreenActive(el) {
  return !!(document.fullscreenElement || document.webkitFullscreenElement) || el.classList.contains('faux-fullscreen');
}

function enterFauxFullscreen(el) {
  resetLocalBoxPosition();           // si venía arrastrado, podría quedar fuera de vista
  el.classList.add('faux-fullscreen');
  document.body.classList.add('fs-lock');
  isFullScreen = true;
  updateMediaButtonsText();
}

function exitFauxFullscreen(el) {
  el.classList.remove('faux-fullscreen');
  document.body.classList.remove('fs-lock');
  resetLocalBoxPosition();
  isFullScreen = false;
  updateMediaButtonsText();
}

function resetLocalBoxPosition() {
  const box = document.getElementById('draggable-local');
  if (!box) return;
  box.style.top = ''; box.style.left = ''; box.style.right = ''; box.style.bottom = '';
}

function toggleFullScreen() {
  const container = document.getElementById('video-conference-container');

  if (!fullscreenActive(container)) {
    if (nativeFullscreenAvailable(container)) {
      const req = container.requestFullscreen
        ? container.requestFullscreen()
        : container.webkitRequestFullscreen();
      // Algunos navegadores rechazan la promesa: ahí también caemos al modo simulado
      if (req && typeof req.catch === 'function') req.catch(() => enterFauxFullscreen(container));
    } else {
      enterFauxFullscreen(container);
    }
  } else {
    if (container.classList.contains('faux-fullscreen')) {
      exitFauxFullscreen(container);
      return;
    }
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
  updateMediaButtonsText();
}

// Escape también sale del modo simulado
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const container = document.getElementById('video-conference-container');
  if (container && container.classList.contains('faux-fullscreen')) exitFauxFullscreen(container);
});

function onFullScreenChange() {
  const container = document.getElementById('video-conference-container');
  isFullScreen = !!(document.fullscreenElement || document.webkitFullscreenElement)
              || (container && container.classList.contains('faux-fullscreen'));
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
  // El alumno bloqueado no ve los controles desactivados: ve un monitor de la clase
  document.body.classList.toggle('student-locked', lock);
}

/* 5. AUDIO (METRÓNOMO Y AFINADOR) */
let audioCtx = null; let isPlaying = false; let bpm = 100; let beatsPerBar = 4; let currentBeat = 0; let nextNoteTime = 0.0; let timerID = null;
function getAudioContext() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return audioCtx; }

/* Metrónomo y drones pasan por un bus propio, así el profesor puede silenciarlos
   en su equipo sin dejar de mandárselos al alumno (y sin meter el clic por su
   micrófono, que era la causa del eco). */
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

/* El alumno no oye nada porque no le llegan los mensajes, no porque le baje el volumen */
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
  // Al mover el interruptor hay que poner al alumno al día, no esperar al próximo clic
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

/* El clic se agenda con antelación, así que la luz se dispara cuando
   el audio realmente suena, no cuando se programó. */
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
  document.getElementById('mon-a4').innerText = a4;
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
  droneOsc.connect(droneGain); droneGain.connect(getToolsBus()); droneOsc.start();

  currentDroneMidi = midi;
  ensureKeyVisible(midi);
  refreshDroneHighlights();
  updateDroneReadout();
  if (broadcast) sendToolMessage({ type: 'DRONE_START', midi });
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
  if (broadcast) sendToolMessage({ type: 'DRONE_STOP' });
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
  else if (data.type === 'CAM_STATE') {
    const ph = document.getElementById('remote-placeholder');
    if (ph) {
      ph.style.display = data.on ? 'none' : 'flex';
      ph.innerText = translations[currentLang][data.on ? 'vid_remote_wait' : 'vid_remote_off'];
    }
  }
  else if (data.type === 'HELLO') {
    const etiqueta = document.getElementById('remote-label');
    if (etiqueta) { etiqueta.innerText = data.name; etiqueta.removeAttribute('data-i18n'); }
  }
  else if (data.type === 'TUNING_CHANGE') { setA4(data.a4, false); }
  else if (data.type === 'DRONE_START') { toggleDrone(data.midi, false); }
  else if (data.type === 'DRONE_STOP') { stopDrone(false); }
}

window.addEventListener('load', initSystem);
