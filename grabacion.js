/* GRABACIÓN DE LA CLASE
   Todo ocurre en el navegador de quien graba; nada se sube a ningún sitio.
   Los dos videos se dibujan lado a lado en un <canvas> y los audios (tu
   micrófono, el del otro, y metrónomo/drones) se mezclan con Web Audio. El
   resultado se graba con MediaRecorder y se descarga al detener.

   Flujo del alumno (doble autorización):
     1. El profesor pulsa «Grabar: visible al alumno»     → REC_OFFER {enabled}
     2. El alumno pulsa «Pedir grabar»                    → REC_REQUEST {name}
     3. Al profesor le aparece un aviso Permitir/Rechazar → REC_RESPONSE {approved}
     4. Si se permite, empieza a grabar solo              → REC_STATE {recording}
   El profesor puede grabar sin pedir permiso; el alumno ve el indicador.
   Si el profesor oculta la opción mientras el alumno graba, se detiene y se
   guarda lo grabado. */
let recOffered = false;          // ¿el profesor ofrece grabar al alumno?
let recStudentState = 'idle';    // alumno: idle | pending
let recPendingFrom = null;       // profesor: nombre de quien pide grabar
let recRemoteRecording = false;  // ¿el otro está grabando?
let recRequestTimer = null;
const REC_REQUEST_TIMEOUT = 60000;

let recorder = null;
let recChunks = [];
let recStartedAt = 0;
let recDrawTimer = null;
let recClockTimer = null;
let recAudio = null;             // { dest, sources: Map(trackId → nodo), watch }
let recCanvas = null;

function recT(key) { return translations[currentLang][key]; }

function canRecord() {
  return typeof MediaRecorder !== 'undefined' &&
         typeof HTMLCanvasElement !== 'undefined' &&
         'captureStream' in HTMLCanvasElement.prototype;
}

function pickRecordingMime() {
  const opciones = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm'
  ];
  if (typeof MediaRecorder.isTypeSupported !== 'function') return '';
  return opciones.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

/* ---------- Profesor: ofrecer / responder ---------- */
function toggleRecordingOffer() {
  recOffered = !recOffered;
  sendPeerMessage({ type: 'REC_OFFER', enabled: recOffered });
  if (!recOffered && recPendingFrom !== null) {
    hideRecordingToast();
    sendPeerMessage({ type: 'REC_RESPONSE', approved: false });
  }
  updateRecordingUI();
}

function showRecordingToast(name) {
  recPendingFrom = name || recT('rec_student');
  const toast = document.getElementById('rec-toast');
  document.getElementById('rec-toast-text').innerText = recT('rec_toast_ask').replace('{name}', recPendingFrom);
  mountRecordingToast();
  toast.hidden = false;
  playRequestChime();
}

function hideRecordingToast() {
  recPendingFrom = null;
  document.getElementById('rec-toast').hidden = true;
}

// En pantalla completa solo se ve el contenedor del video: el aviso va dentro
function mountRecordingToast() {
  const toast = document.getElementById('rec-toast');
  const container = document.getElementById('video-conference-container');
  const fs = container && fullscreenActive(container);
  const destino = fs ? container : document.body;
  if (toast.parentElement !== destino) destino.appendChild(toast);
}
document.addEventListener('fullscreenchange', mountRecordingToast);
document.addEventListener('webkitfullscreenchange', mountRecordingToast);

function answerRecordingRequest(approved) {
  if (recPendingFrom === null) return;
  hideRecordingToast();
  sendPeerMessage({ type: 'REC_RESPONSE', approved: approved && recOffered });
}

function playRequestChime() {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    [880, 1175].forEach((f, i) => {
      const t = ctx.currentTime + i * 0.16;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g); g.connect(ctx.destination);   // directo: no entra en grabaciones
      o.start(t); o.stop(t + 0.3);
    });
  } catch (e) {}
}

/* ---------- Alumno: pedir ---------- */
function requestRecording() {
  if (!canRecord()) { alert(recT('rec_unsupported')); return; }
  if (!localStream) { alert(recT('rec_no_video')); return; }
  recStudentState = 'pending';
  sendPeerMessage({ type: 'REC_REQUEST', name: studentName });
  clearTimeout(recRequestTimer);
  recRequestTimer = setTimeout(() => {
    if (recStudentState !== 'pending') return;
    recStudentState = 'idle';
    sendPeerMessage({ type: 'REC_CANCEL' });
    updateRecordingUI();
    alert(recT('rec_timeout'));
  }, REC_REQUEST_TIMEOUT);
  updateRecordingUI();
}

function cancelRecordingRequest() {
  clearTimeout(recRequestTimer);
  recStudentState = 'idle';
  sendPeerMessage({ type: 'REC_CANCEL' });
  updateRecordingUI();
}

/* ---------- Botón único de la barra ---------- */
function onRecordButton() {
  if (recorder) { stopRecording(); return; }
  if (currentRole === 'teacher') { startRecording(); return; }
  if (currentRole === 'student' && recOffered) {
    if (recStudentState === 'pending') cancelRecordingRequest();
    else requestRecording();
  }
}

function handleRecordingMessage(data) {
  if (data.type === 'REC_OFFER' && currentRole === 'student') {
    recOffered = !!data.enabled;
    if (!recOffered) {
      if (recStudentState === 'pending') { clearTimeout(recRequestTimer); recStudentState = 'idle'; }
      if (recorder) { stopRecording(); alert(recT('rec_revoked')); }
    }
  }
  else if (data.type === 'REC_REQUEST' && currentRole === 'teacher') {
    if (recOffered) showRecordingToast(data.name);
    else sendPeerMessage({ type: 'REC_RESPONSE', approved: false });
  }
  else if (data.type === 'REC_CANCEL' && currentRole === 'teacher') {
    hideRecordingToast();
  }
  else if (data.type === 'REC_RESPONSE' && currentRole === 'student') {
    if (recStudentState !== 'pending') return;
    clearTimeout(recRequestTimer);
    recStudentState = 'idle';
    if (data.approved) startRecording();
    else alert(recT('rec_denied'));
  }
  else if (data.type === 'REC_STATE') {
    recRemoteRecording = !!data.recording;
  }
  updateRecordingUI();
}

function onRecordingPeerGone() {
  recRemoteRecording = false;
  if (currentRole === 'teacher') hideRecordingToast();
  if (recStudentState === 'pending') { clearTimeout(recRequestTimer); recStudentState = 'idle'; }
  // Si se cae la conexión mientras grabas, se guarda lo que haya
  if (recorder) stopRecording();
  updateRecordingUI();
}

/* ---------- Interfaz ---------- */
function updateRecordingUI() {
  document.body.classList.toggle('rec-offered', recOffered);

  const offerBtn = document.getElementById('btn-toggle-rec-offer');
  if (offerBtn) {
    offerBtn.innerText = recT(recOffered ? 'rec_offer_on' : 'rec_offer_off');
    const color = recOffered ? 'var(--danger)' : 'var(--text-muted)';
    offerBtn.style.color = color; offerBtn.style.borderColor = color;
  }

  const btn = document.getElementById('btn-record');
  if (btn) {
    let icono = '⏺';
    let clave = currentRole === 'student' ? 'rec_btn_request' : 'rec_btn_start';
    if (recorder) { icono = '⏹'; clave = 'rec_btn_stop'; }
    else if (recStudentState === 'pending') { icono = '⏳'; clave = 'rec_btn_pending'; }
    btn.innerHTML = '';
    btn.append(icono + ' ');
    const span = document.createElement('span');
    span.innerText = recT(clave);
    btn.appendChild(span);
    btn.classList.toggle('recording', !!recorder);
    btn.classList.toggle('pending', !recorder && recStudentState === 'pending');
  }

  const ind = document.getElementById('rec-indicator');
  const txt = document.getElementById('rec-indicator-text');
  if (ind && txt) {
    if (recorder) {
      const s = Math.floor((Date.now() - recStartedAt) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      txt.innerText = recT('rec_self') + ' ' + mm + ':' + ss;
      ind.hidden = false;
    } else if (recRemoteRecording) {
      txt.innerText = recT(currentRole === 'teacher' ? 'rec_remote_student' : 'rec_remote_teacher');
      ind.hidden = false;
    } else {
      ind.hidden = true;
    }
  }
}

/* ---------- Grabación: vídeo en canvas ---------- */
const REC_W = 1280, REC_H = 720, REC_FPS = 30;

function localDisplayName() {
  if (currentRole === 'student') return studentName || recT('rec_student');
  const sel = document.getElementById('room-choice');
  return sel && sel.selectedOptions[0] ? sel.selectedOptions[0].text : recT('rec_teacher');
}

function remoteDisplayName() {
  const lbl = document.getElementById('remote-label');
  if (lbl && !lbl.hasAttribute('data-i18n')) return lbl.innerText;   // nombre recibido por HELLO
  return recT(currentRole === 'teacher' ? 'rec_student' : 'rec_teacher');
}

function drawContain(ctx, video, x, y, w, h) {
  if (!video) return false;
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh || video.readyState < 2) return false;
  const k = Math.min(w / vw, h / vh);
  const dw = vw * k, dh = vh * k;
  ctx.drawImage(video, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  return true;
}

function drawRecordingFrame() {
  if (!recCanvas) return;
  const ctx = recCanvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, REC_W, REC_H);
  const mitad = REC_W / 2;
  const remoto = [document.getElementById('remote-video'), remoteDisplayName()];
  const local = [document.getElementById('local-video'), localDisplayName()];
  // El profesor siempre a la izquierda, así las grabaciones de ambos coinciden.
  // Sin espejo: en la grabación cada uno se ve como lo ve el otro.
  const lados = currentRole === 'teacher' ? [local, remoto] : [remoto, local];

  lados.forEach(([video, nombre], i) => {
    const x = i * mitad;
    drawContain(ctx, video, x, 0, mitad, REC_H);
    if (nombre) {
      ctx.font = '600 22px sans-serif';
      ctx.textAlign = 'left';
      const ancho = ctx.measureText(nombre).width;
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(x + 16, REC_H - 52, ancho + 24, 36);
      ctx.fillStyle = '#fff';
      ctx.fillText(nombre, x + 28, REC_H - 26);
    }
  });
  ctx.fillStyle = '#222';
  ctx.fillRect(mitad - 1, 0, 2, REC_H);
}

/* ---------- Grabación: mezcla de audio ----------
   Silenciar el micrófono o reconectar la llamada cambia las pistas, así que
   cada segundo se comprueba qué pistas hay y se reconectan a la mezcla. */
function currentAudioTracks() {
  const pistas = [];
  if (localStream) pistas.push(...localStream.getAudioTracks());
  const rv = document.getElementById('remote-video');
  if (rv && rv.srcObject) pistas.push(...rv.srcObject.getAudioTracks());
  return pistas.filter(t => t.readyState === 'live');
}

function syncRecordingAudio() {
  if (!recAudio) return;
  const ctx = getAudioContext();
  const vivas = currentAudioTracks();
  const ids = new Set(vivas.map(t => t.id));
  recAudio.sources.forEach((node, id) => {
    if (!ids.has(id)) { try { node.disconnect(); } catch (e) {} recAudio.sources.delete(id); }
  });
  vivas.forEach(t => {
    if (recAudio.sources.has(t.id)) return;
    try {
      const node = ctx.createMediaStreamSource(new MediaStream([t]));
      node.connect(recAudio.dest);   // solo a la grabación, nunca a los altavoces
      recAudio.sources.set(t.id, node);
    } catch (e) { console.warn('[aula] no se pudo mezclar una pista de audio:', e); }
  });
}

function setupRecordingAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  const dest = ctx.createMediaStreamDestination();
  getToolsBus().connect(dest);     // metrónomo y drones tal como suenan en tu equipo
  recAudio = { dest, sources: new Map(), watch: null };
  syncRecordingAudio();
  recAudio.watch = setInterval(syncRecordingAudio, 1000);
  return dest.stream.getAudioTracks()[0];
}

function teardownRecordingAudio() {
  if (!recAudio) return;
  clearInterval(recAudio.watch);
  recAudio.sources.forEach(node => { try { node.disconnect(); } catch (e) {} });
  try { if (toolsBus) toolsBus.disconnect(recAudio.dest); } catch (e) {}
  recAudio = null;
}

/* ---------- Iniciar / detener ---------- */
function startRecording() {
  if (recorder) return;
  if (!canRecord()) { alert(recT('rec_unsupported')); return; }
  if (!localStream) { alert(recT('rec_no_video')); return; }

  recCanvas = document.createElement('canvas');
  recCanvas.width = REC_W; recCanvas.height = REC_H;
  drawRecordingFrame();
  // setInterval y no requestAnimationFrame: rAF se detiene con la pestaña en
  // segundo plano y el video grabado se congelaría.
  recDrawTimer = setInterval(drawRecordingFrame, 1000 / REC_FPS);

  const stream = recCanvas.captureStream(REC_FPS);
  const audioTrack = setupRecordingAudio();
  if (audioTrack) stream.addTrack(audioTrack);

  const mimeType = pickRecordingMime();
  try {
    recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 2500000 } : undefined);
  } catch (e) {
    console.error('[aula] MediaRecorder:', e);
    cleanupRecording();
    alert(recT('rec_unsupported'));
    return;
  }

  recChunks = [];
  recorder.ondataavailable = ev => { if (ev.data && ev.data.size > 0) recChunks.push(ev.data); };
  recorder.onstop = saveRecording;
  recorder.start(5000);            // trozos cada 5 s
  recStartedAt = Date.now();
  recClockTimer = setInterval(updateRecordingUI, 1000);
  sendPeerMessage({ type: 'REC_STATE', recording: true });
  updateRecordingUI();
}

function stopRecording() {
  if (!recorder) return;
  if (recorder.state !== 'inactive') recorder.stop();   // saveRecording llega en onstop
  else saveRecording();
  sendPeerMessage({ type: 'REC_STATE', recording: false });
}

function cleanupRecording() {
  clearInterval(recDrawTimer); recDrawTimer = null;
  clearInterval(recClockTimer); recClockTimer = null;
  teardownRecordingAudio();
  if (recorder && recorder.stream) recorder.stream.getTracks().forEach(t => t.stop());
  recorder = null;
  recCanvas = null;
}

function saveRecording() {
  const tipo = (recorder && recorder.mimeType) || 'video/webm';
  const ext = tipo.includes('mp4') ? 'mp4' : 'webm';
  const blob = new Blob(recChunks, { type: tipo });
  recChunks = [];
  cleanupRecording();
  updateRecordingUI();
  if (blob.size === 0) return;

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const nombre = `clase-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.${ext}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Margen amplio: en iOS la descarga abre una vista previa que aún usa la URL
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

// Cerrar o recargar la página intenta guardar lo grabado
window.addEventListener('pagehide', () => { if (recorder) stopRecording(); });
