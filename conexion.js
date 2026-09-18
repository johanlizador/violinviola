/* Conexión PeerJS: roles, sala, clave del profesor, llamada, permisos del
   alumno y mensajes entre ambos (handleData). */

let isStudentAllowed = false; 

let peer = null; let activeConnection = null; let currentRole = 'visitor'; let joinIdFromUrl = null;
let hasJoined = false;

function getJoinId() {
  const fromQuery = new URLSearchParams(window.location.search).get('join');
  if (fromQuery) return fromQuery;
  const hash = window.location.hash;
  const q = hash.indexOf('?');
  if (q !== -1) return new URLSearchParams(hash.slice(q)).get('join');
  return null;
}

function enterStudio() {
  const studio = document.getElementById('studio');
  if (studio) studio.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (currentRole === 'student' && !hasJoined) studentEnterClass();
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

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];

if (TURN_USER && TURN_PASS) {
  ICE_SERVERS.push(
    { urls: 'turn:violinandviolastudio.relay.metered.ca:80',            username: TURN_USER, credential: TURN_PASS },
    { urls: 'turn:violinandviolastudio.relay.metered.ca:80?transport=tcp',  username: TURN_USER, credential: TURN_PASS },
    { urls: 'turn:violinandviolastudio.relay.metered.ca:443',           username: TURN_USER, credential: TURN_PASS },
    { urls: 'turns:violinandviolastudio.relay.metered.ca:443?transport=tcp', username: TURN_USER, credential: TURN_PASS }
  );
}

function newPeer(fixedId) {
  const p = fixedId
    ? new Peer(fixedId, { config: { iceServers: ICE_SERVERS } })
    : new Peer({ config: { iceServers: ICE_SERVERS } });
  p.on('disconnected', () => { if (!p.destroyed) { showDiagnostic('reconectando...'); p.reconnect(); } });
  p.on('error', (err) => onPeerError(err));
  return p;
}

let joinAttempts = 0;
function onPeerError(err) {
  const tipo = err && err.type ? err.type : 'desconocido';
  if (tipo === 'peer-unavailable' && currentRole === 'student') {
    showDiagnostic('PeerJS: peer-unavailable');
    return retryJoin();
  }
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
}

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

function watchIce(conn) {
  const pc = conn && conn.peerConnection;
  if (!pc) return;
  pc.oniceconnectionstatechange = () => {
    showDiagnostic('ICE: ' + pc.iceConnectionState);
    if (pc.iceConnectionState === 'failed') {
      setStatus('err_ice', 'error');
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
  peer.on('open', (id) => {
    const lbl = document.getElementById('peer-id-label');
    lbl.setAttribute('data-i18n', 'role_student');
    lbl.innerText = translations[currentLang].role_student;
  });
  setupCallListener();
}

let wakeLock = null;
async function keepScreenAwake() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !wakeLock && hasJoined) keepScreenAwake();
});

function setupConn(conn) {
  watchIce(conn);
  conn.on('open', () => { 
    setStatus('st_live', 'connected'); 
    
    if(currentRole === 'teacher') {
      setTimeout(() => {
          sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
          sendPeerMessage({ type: 'REC_OFFER', enabled: recOffered });
          // Tu nombre en la pantalla del alumno y en sus grabaciones
          sendPeerMessage({ type: 'HELLO', name: localDisplayName() });
          sendPeerMessage({ type: 'TUNING_CHANGE', a4 });
          pushToolStateToPeer();
          pushScoreToPeer();
      }, 300); 
    }
    
    if (currentRole === 'student' && studentName) {
        sendPeerMessage({ type: 'HELLO', name: studentName });
        if (localStream && conn.peer && !currentCall) {
            makeCall(conn.peer);
        }
    }
    
    if (localStream && !isCamOn) sendPeerMessage({ type: 'CAM_STATE', on: false });
  });
  conn.on('data', (data) => { handleData(data); });
  conn.on('close', () => { onRecordingPeerGone(); onSharingPeerGone(); setStatus(currentRole === 'teacher' ? 'st_student_left' : 'st_teacher_left', 'error'); });
}

function sendPeerMessage(msg) { 
    if (!activeConnection) return;
    if (activeConnection.open) {
        activeConnection.send(msg); 
    } else {
        activeConnection.on('open', () => {
            activeConnection.send(msg);
        });
    }
}

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

function makeCall(remoteId) {
  if (!localStream) return;
  currentCall = peer.call(remoteId, localStream);
  setupCallEvents(currentCall);
}

function setupCallListener() {
  peer.on('call', (call) => {
    if (localStream) {
      try { if (currentCall && currentCall !== call) currentCall.close(); } catch (e) {}
      currentCall = call;                  
      call.answer(localStream);
      setupCallEvents(call);
    } else {
      pendingCall = call;
      const btn = document.getElementById('btn-start-video');
      if (!btn) return;
      btn.removeAttribute('data-i18n');
      btn.innerText = translations[currentLang].btn_answer_call;
      btn.style.background = "var(--success)";
      btn.style.borderColor = "var(--success)";
    }
  });
}

function setupCallEvents(call) {
  call.on('stream', (remoteStream) => {
    const remoteVid = document.getElementById('remote-video');
    
    remoteVid.srcObject = null;
    remoteVid.srcObject = remoteStream;
    remoteVid.muted = false;
    remoteVid.volume = 1.0; 
    
    document.getElementById('remote-placeholder').style.display = 'none';
    remoteVid.play().catch(e => console.warn('[aula] auto-play bloqueado:', e));
  });
  call.on('close', () => {
    document.getElementById('remote-video').srcObject = null;
    document.getElementById('remote-placeholder').style.display = 'flex';
  });
}

function toggleStudentPermissions() {
  isStudentAllowed = !isStudentAllowed;
  updateStudentAuthButton();
  sendPeerMessage({ type: 'PERMISSIONS', allowed: isStudentAllowed });
}

function updateStudentAuthButton() {
  const btn = document.getElementById('btn-toggle-student-auth');
  if (!btn) return;
  const color = isStudentAllowed ? 'var(--success)' : 'var(--warning)';
  btn.innerText = translations[currentLang][isStudentAllowed ? 'auth_unlocked' : 'auth_locked'];
  btn.style.color = color; btn.style.borderColor = color;
}

function lockStudentInterface(lock) {
  document.body.classList.toggle('student-locked', lock);
}

function handleData(data) {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn('No se pudo reanudar AudioContext:', e));
  }

  if (data.type === 'PERMISSIONS') {
    if(currentRole === 'student') lockStudentInterface(!data.allowed);
  }
  else if (data.type === 'METRO_START') { 
      bpm = data.bpm; beatsPerBar = data.beatsPerBar; 
      onTempoChange(bpm, false); setTimeSignature(beatsPerBar, false); 
      if(!isPlaying) toggleMetronome(false); 
  }
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
  else if (data.type === 'SCREEN_STATE') { setRemoteSharing(!!data.on); }
  else if (data.type && data.type.startsWith('SCORE_')) { handleScoreMessage(data); }
  else if (data.type === 'HELLO') {
    const etiqueta = document.getElementById('remote-label');
    if (etiqueta) { etiqueta.innerText = data.name; etiqueta.removeAttribute('data-i18n'); }
  }
  else if (data.type === 'TUNING_CHANGE') { setA4(data.a4, false); }
  else if (data.type === 'DRONE_START') { toggleDrone(data.midi, false); }
  else if (data.type === 'DRONE_STOP') { stopDrone(false); }
  else if (data.type && data.type.startsWith('REC_')) { handleRecordingMessage(data); }
}
