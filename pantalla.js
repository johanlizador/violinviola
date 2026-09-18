/* COMPARTIR PANTALLA
   Se pide la pantalla con getDisplayMedia y su pista sustituye a la de la
   cámara en la llamada que ya está abierta (replaceTrack), así que no hay que
   reconectar nada. La cámara no se apaga: su pista se guarda y vuelve al
   dejar de compartir.

   No está en iPhone ni iPad: iOS no permite compartir pantalla desde el
   navegador. Ahí el botón no aparece. */
let screenStream = null;     // lo que devuelve getDisplayMedia
let savedCamTrack = null;    // la pista de cámara mientras se comparte
let isSharingScreen = false;

function canShareScreen() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
}

function shareT(key) { return translations[currentLang][key]; }

function updateShareButton() {
  const btn = document.getElementById('btn-share-screen');
  if (!btn) return;
  if (!canShareScreen()) { btn.hidden = true; return; }
  btn.hidden = false;
  btn.innerHTML = '';
  btn.append(isSharingScreen ? '🛑 ' : '🖥 ');
  const span = document.createElement('span');
  span.innerText = shareT(isSharingScreen ? 'share_stop' : 'share_start');
  btn.appendChild(span);
  btn.classList.toggle('sharing', isSharingScreen);
}

function toggleScreenShare() {
  if (isSharingScreen) stopScreenShare();
  else startScreenShare();
}

async function startScreenShare() {
  if (isSharingScreen) return;
  if (!canShareScreen()) { alert(shareT('share_unsupported')); return; }
  if (!localStream) { alert(shareT('share_no_video')); return; }

  const btn = document.getElementById('btn-share-screen');
  if (btn) btn.disabled = true;

  try {
    // Sin audio: mezclar el sonido del sistema con el micrófono daría eco
    // con el metrónomo, que ya viaja aparte.
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 15 },
      audio: false
    });
    const pista = screenStream.getVideoTracks()[0];

    // La cámara se guarda viva para poder volver a ella al instante
    savedCamTrack = localStream.getVideoTracks()[0] || null;
    if (savedCamTrack) { try { localStream.removeTrack(savedCamTrack); } catch (e) {} }
    localStream.addTrack(pista);

    const localVid = document.getElementById('local-video');
    localVid.srcObject = localStream;
    localVid.style.transform = 'none';       // una pantalla nunca va en espejo
    localVid.play().catch(e => console.warn('[aula] auto-play bloqueado:', e));
    setLocalPlaceholder(false);

    await ensureVideoNegotiated(pista);

    // El botón "Dejar de compartir" del propio navegador
    pista.addEventListener('ended', () => { if (isSharingScreen) stopScreenShare(); });

    isSharingScreen = true;
    sendPeerMessage({ type: 'SCREEN_STATE', on: true });
    sendPeerMessage({ type: 'CAM_STATE', on: true });
  } catch (err) {
    // Cancelar el diálogo del navegador no es un error que haya que anunciar
    if (err && (err.name === 'NotAllowedError' || err.name === 'AbortError')) {
      console.log('[aula] compartir pantalla cancelado');
    } else {
      console.error('[aula] compartir pantalla:', err);
      alert(shareT('share_failed'));
    }
    screenStream = null;
    if (savedCamTrack) { try { localStream.addTrack(savedCamTrack); } catch (e) {} savedCamTrack = null; }
  }

  if (btn) btn.disabled = false;
  updateShareButton();
}

async function stopScreenShare() {
  if (!isSharingScreen) return;
  const btn = document.getElementById('btn-share-screen');
  if (btn) btn.disabled = true;

  const pantalla = localStream ? localStream.getVideoTracks()[0] : null;
  if (pantalla) { pantalla.stop(); try { localStream.removeTrack(pantalla); } catch (e) {} }
  if (screenStream) screenStream.getTracks().forEach(t => t.stop());
  screenStream = null;
  isSharingScreen = false;

  const localVid = document.getElementById('local-video');
  try {
    if (savedCamTrack && savedCamTrack.readyState === 'live') {
      localStream.addTrack(savedCamTrack);
      await ensureVideoNegotiated(savedCamTrack);
    } else if (isCamOn) {
      // La cámara se perdió por el camino (pasa al bloquear el equipo): otra nueva
      const fresca = await getReliableMediaStream(true, false);
      const pista = fresca.getVideoTracks()[0];
      localStream.addTrack(pista);
      await ensureVideoNegotiated(pista);
    } else {
      const sender = videoSender();
      if (sender) await sender.replaceTrack(null);
    }
  } catch (err) {
    console.error('[aula] al volver de compartir pantalla:', err);
  }
  savedCamTrack = null;

  if (localVid) {
    localVid.srcObject = localStream;
    localVid.style.transform = isMirrored ? 'scaleX(-1)' : 'none';
    localVid.play().catch(e => console.warn(e));
  }
  setLocalPlaceholder(!isCamOn);
  sendPeerMessage({ type: 'SCREEN_STATE', on: false });
  sendPeerMessage({ type: 'CAM_STATE', on: isCamOn });

  if (btn) btn.disabled = false;
  updateShareButton();
}

/* El otro lado: avisar de que lo que se ve es una pantalla, no una cámara */
function setRemoteSharing(on) {
  const etiqueta = document.getElementById('remote-label');
  if (!etiqueta) return;
  if (on) {
    if (!etiqueta.dataset.nombrePrevio) etiqueta.dataset.nombrePrevio = etiqueta.innerText;
    etiqueta.innerText = '🖥 ' + shareT('share_remote');
  } else if (etiqueta.dataset.nombrePrevio) {
    etiqueta.innerText = etiqueta.dataset.nombrePrevio;
    delete etiqueta.dataset.nombrePrevio;
  }
}

// Si se cae la conexión mientras compartes, se deja de compartir
function onSharingPeerGone() {
  setRemoteSharing(false);
  if (isSharingScreen) stopScreenShare();
}
