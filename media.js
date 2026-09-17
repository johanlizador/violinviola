/* Cámara y micrófono: sala de espera del alumno, permisos y pistas */

/* Solicitar Audio y Video */
async function getReliableMediaStream(reqVideo, reqAudio) {
  try {
    let audioConfig = reqAudio ? { echoCancellation: true, noiseSuppression: false, autoGainControl: false } : false;
    return await navigator.mediaDevices.getUserMedia({
      video: reqVideo,
      audio: audioConfig
    });
  } catch (err) {
    console.warn('[aula] Las restricciones para música fallaron, forzando estándar:', err);
    return await navigator.mediaDevices.getUserMedia({
      video: reqVideo,
      audio: reqAudio 
    });
  }
}

let studentName = '';
let micMeterRAF = null;

async function prepareMedia() {
  try {
    if (!localStream) {
      localStream = await getReliableMediaStream(true, true);
    }
    const prev = document.getElementById('lobby-video');
    if (prev) {
      prev.srcObject = localStream;
      prev.play().catch(e => console.warn('[aula] auto-play lobby bloqueado:', e));
    }
    const empty = document.getElementById('lobby-preview-empty');
    if (empty) empty.style.display = 'none';
    startMicMeter();
    document.getElementById('permission-help').hidden = true;
    populateAudioOutputs();
    return true;
  } catch (err) {
    showPermissionHelp(err);
    return false;
  }
}

function startMicMeter() {
  if (micMeterRAF || !localStream) return;
  const ctx = getAudioContext();
  const source = ctx.createMediaStreamSource(localStream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  source.connect(analyser);
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
}

function forceUnlockAudio() {
  try {
      const ctx = getAudioContext();
      ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.01);

      const remoteVid = document.getElementById('remote-video');
      if (remoteVid) {
          remoteVid.muted = false;
          remoteVid.play().catch(()=>{});
      }
  } catch (e) {
      console.warn("[aula] forceUnlockAudio:", e);
  }
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

  forceUnlockAudio();

  if (!await prepareMedia()) return;

  hasJoined = true;
  stopMicMeter();
  document.getElementById('student-lobby').style.display = 'none';
  keepScreenAwake();
  setStatus('st_connecting', 'warning');

  const localVid = document.getElementById('local-video');
  localVid.srcObject = localStream;
  if (isMirrored) localVid.style.transform = 'scaleX(-1)';
  localVid.play().catch(e => console.warn('[aula] auto-play bloqueado:', e));
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

let localStream = null;
let currentCall = null;
let pendingCall = null;
let isMicOn = true;
let isCamOn = true;
let isFullScreen = false;
let isMirrored = true;

/* Alternar Espejo */
function toggleMirror() {
  isMirrored = !isMirrored;
  const localVid = document.getElementById('local-video');
  if (localVid) {
    localVid.style.transform = isMirrored ? 'scaleX(-1)' : 'none';
  }
  updateMediaButtonsText();
}

async function startVideo() {
  const btn = document.getElementById('btn-start-video');
  btn.disabled = true;
  btn.innerText = translations[currentLang].vid_starting;

  try {
    localStream = await getReliableMediaStream(true, true);

    const localVid = document.getElementById('local-video');
    localVid.srcObject = localStream;
    if (isMirrored) localVid.style.transform = 'scaleX(-1)';
    localVid.play().catch(e => console.warn('[aula] auto-play bloqueado:', e));
    
    setLocalPlaceholder(false);
    btn.style.display = 'none'; 
    
    document.getElementById('video-conference-container').style.display = 'flex';
    populateAudioOutputs(); 

    if (pendingCall) {
      currentCall = pendingCall;          
      currentCall.answer(localStream);
      setupCallEvents(currentCall);
      pendingCall = null;
    } else if (activeConnection && activeConnection.peer && !currentCall) {
       makeCall(activeConnection.peer);
    }
  } catch(err) {
    console.error("Error media:", err);
    alert(translations[currentLang].err_media_alert);
    btn.disabled = false;
    btn.innerText = translations[currentLang].btn_start_video;
  }
}

function stopAllAudioTracks() {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(t => {
    t.stop();
    try { localStream.removeTrack(t); } catch (e) {}
  });
}

function audioSender() {
  const pc = currentCall && currentCall.peerConnection;
  if (!pc) return null;
  const transceivers = pc.getTransceivers();
  if (transceivers && transceivers.length > 0) {
      const t = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === 'audio');
      if (t) return t.sender;
  }
  return pc.getSenders().find(s => s.track && s.track.kind === 'audio');
}

async function ensureAudioNegotiated(pista) {
  const sender = audioSender();
  if (sender) {
    await sender.replaceTrack(pista).catch(e => console.warn(e));
    return;
  }
  const remoto = (currentCall && currentCall.peer) || (activeConnection && activeConnection.peer);
  if (!remoto) return;
  try { if (currentCall) currentCall.close(); } catch (e) {}
  currentCall = null;
  makeCall(remoto);
}

async function toggleMic() {
  if (!localStream) return;
  const btn = document.getElementById('btn-toggle-mic');
  btn.disabled = true;

  try {
    if (isMicOn) {
      stopAllAudioTracks();
      isMicOn = false;
      try {
        const sender = audioSender();
        if (sender) await sender.replaceTrack(null);
      } catch (e) { console.warn('[aula] Error muting audio:', e); }
    } else {
      const fresca = await getReliableMediaStream(false, true); 
      const pista = fresca.getAudioTracks()[0];
      localStream.addTrack(pista);

      await ensureAudioNegotiated(pista);
      isMicOn = true;
    }
  } catch (err) {
    console.error('[aula] no se pudo cambiar el micrófono:', err);
    showPermissionHelp(err);
  }

  btn.disabled = false;
  btn.classList.toggle('disabled', !isMicOn);
  updateMediaButtonsText();
}

function setLocalPlaceholder(visible) {
  const ph = document.getElementById('local-placeholder');
  if (ph) ph.style.display = visible ? 'flex' : 'none';
}

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
    detenidas.push(t.readyState);
    try { s.removeTrack(t); } catch (e) {}
  }));

  const lv = document.getElementById('local-video');
  if (lv) { lv.srcObject = localStream; lv.play().catch(e=>console.warn(e)); }
  const pv = document.getElementById('lobby-video');
  if (pv) pv.srcObject = null;
  return detenidas;
}

function videoSender() {
  const pc = currentCall && currentCall.peerConnection;
  if (!pc) return null;
  const transceivers = pc.getTransceivers();
  if (transceivers && transceivers.length > 0) {
      const t = transceivers.find(t => t.receiver && t.receiver.track && t.receiver.track.kind === 'video');
      if (t) return t.sender;
  }
  return pc.getSenders().find(s => s.track && s.track.kind === 'video');
}

async function ensureVideoNegotiated(pista) {
  const sender = videoSender();
  if (sender) {
    await sender.replaceTrack(pista);
    return;
  }
  const remoto = (currentCall && currentCall.peer)
              || (activeConnection && activeConnection.peer);
  if (!remoto) return;
  showDiagnostic('renegociando vídeo...');
  try { if (currentCall) currentCall.close(); } catch (e) {}
  currentCall = null;
  makeCall(remoto);
}

async function toggleCam() {
  if (!localStream) return;
  const btn = document.getElementById('btn-toggle-cam');
  btn.disabled = true;

  try {
    if (isCamOn) {
      const detenidas = stopAllVideoTracks();
      showDiagnostic('cámara: ' + (detenidas.join(', ') || 'sin pistas'));
      isCamOn = false;
      try {
        const sender = videoSender();
        if (sender) await sender.replaceTrack(null);
      } catch (e) {}
      sendPeerMessage({ type: 'CAM_STATE', on: false });

    } else {
      const fresca = await getReliableMediaStream(true, false); 
      const pista = fresca.getVideoTracks()[0];
      localStream.addTrack(pista);
      const localVid = document.getElementById('local-video');
      localVid.srcObject = localStream;
      if (isMirrored) localVid.style.transform = 'scaleX(-1)';
      localVid.play().catch(e => console.warn('[aula] auto-play bloqueado:', e));

      await ensureVideoNegotiated(pista);
      isCamOn = true;
      sendPeerMessage({ type: 'CAM_STATE', on: true });
    }
  } catch (err) {
    showPermissionHelp(err);
  }

  btn.disabled = false;
  btn.classList.toggle('disabled', !isCamOn);
  setLocalPlaceholder(!isCamOn);
  updateMediaButtonsText();
}

function releaseMedia() {
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
}
window.addEventListener('pagehide', releaseMedia);
