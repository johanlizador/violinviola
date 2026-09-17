/* Vistas del video: cambiar vista, miniatura arrastrable y pantalla completa */

/* Cambiar vista: recorre tres vistas, solo en tu pantalla (la cámara se
   sigue transmitiendo y el otro participante no ve ningún cambio):
     1. normal   — el otro en grande, tú en miniatura
     2. oculta   — solo el otro, sin tu miniatura
     3. invertida — tú en grande, el otro en miniatura
     4. lado a lado — los dos del mismo tamaño
   y vuelve a la normal. Tocar la miniatura alterna entre normal e invertida. */
const VIEW_ORDER = ['normal', 'hide-self', 'swapped', 'side'];

function getViewMode() {
  const c = document.getElementById('video-conference-container');
  if (c.classList.contains('hide-self')) return 'hide-self';
  if (c.classList.contains('swapped')) return 'swapped';
  if (c.classList.contains('side')) return 'side';
  return 'normal';
}

function setViewMode(mode) {
  const c = document.getElementById('video-conference-container');
  c.classList.toggle('hide-self', mode === 'hide-self');
  c.classList.toggle('swapped', mode === 'swapped');
  c.classList.toggle('side', mode === 'side');
  resetLocalBoxPosition();
}

function toggleViewLayout() {
  const i = VIEW_ORDER.indexOf(getViewMode());
  setViewMode(VIEW_ORDER[(i + 1) % VIEW_ORDER.length]);
}

function swapFromThumbnail() {
  setViewMode(getViewMode() === 'swapped' ? 'normal' : 'swapped');
}

function updateMediaButtonsText() {
  const micSpan = document.querySelector('#btn-toggle-mic span');
  const camSpan = document.querySelector('#btn-toggle-cam span');
  const fsSpan = document.querySelector('.btn-fullscreen span');
  const mirrorSpan = document.querySelector('#btn-toggle-mirror span');
  
  if (micSpan) micSpan.innerText = translations[currentLang][isMicOn ? "btn_mute" : "btn_unmute"];
  if (camSpan) camSpan.innerText = translations[currentLang][isCamOn ? "btn_cam_off" : "btn_cam_on"];
  if (fsSpan) fsSpan.innerText = translations[currentLang][isFullScreen ? "btn_exit_fullscreen" : "btn_fullscreen"];
  if (mirrorSpan) mirrorSpan.innerText = translations[currentLang][isMirrored ? "btn_mirror_on" : "btn_mirror_off"];
}

function nativeFullscreenAvailable(el) {
  return !!(el.requestFullscreen || el.webkitRequestFullscreen);
}

function fullscreenActive(el) {
  return !!(document.fullscreenElement || document.webkitFullscreenElement) || el.classList.contains('faux-fullscreen');
}

function enterFauxFullscreen(el) {
  resetLocalBoxPosition();
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
  // Limpia la posición arrastrada de ambas cajas: tras intercambiar, la
  // miniatura vuelve a su esquina y la grande no hereda coordenadas.
  document.querySelectorAll('#video-grid .video-box').forEach(box => {
    box.style.top = ''; box.style.left = ''; box.style.right = ''; box.style.bottom = '';
  });
}

function toggleFullScreen() {
  const container = document.getElementById('video-conference-container');
  if (!fullscreenActive(container)) {
    if (nativeFullscreenAvailable(container)) {
      const req = container.requestFullscreen
        ? container.requestFullscreen()
        : container.webkitRequestFullscreen();
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

/* Miniatura: se arrastra para moverla y se toca para intercambiar vistas.
   Un toque es soltar sin haberse movido más de unos píxeles. */
const TAP_TOLERANCE = 6;
let dragBox = null;
let isDragging = false;
let dragMoved = false;
let offsetX, offsetY, startX, startY;

function pointerXY(e) {
  const p = e.touches ? (e.touches[0] || e.changedTouches[0]) : e;
  return { x: p.clientX, y: p.clientY };
}

function currentThumbnail() {
  const container = document.getElementById('video-conference-container');
  if (!container.classList.contains('pip-mode') || container.classList.contains('hide-self') || container.classList.contains('side')) return null;
  return document.querySelector(container.classList.contains('swapped') ? '#video-grid .remote-box' : '#draggable-local');
}

function startDrag(e) {
  const thumb = currentThumbnail();
  if (!thumb || e.currentTarget !== thumb) return;
  if (e.type === 'mousedown' && e.button !== 0) return;
  dragBox = thumb;
  isDragging = true;
  dragMoved = false;
  const { x, y } = pointerXY(e);
  const rect = thumb.getBoundingClientRect();
  startX = x; startY = y;
  offsetX = x - rect.left;
  offsetY = y - rect.top;
}

function drag(e) {
  if (!isDragging || !dragBox) return;
  const { x: clientX, y: clientY } = pointerXY(e);
  if (!dragMoved && Math.hypot(clientX - startX, clientY - startY) < TAP_TOLERANCE) return;
  dragMoved = true;
  e.preventDefault();
  const gridLayout = document.getElementById('video-grid').getBoundingClientRect();

  let x = clientX - gridLayout.left - offsetX;
  let y = clientY - gridLayout.top - offsetY;

  x = Math.max(0, Math.min(x, gridLayout.width - dragBox.offsetWidth));
  y = Math.max(0, Math.min(y, gridLayout.height - dragBox.offsetHeight));

  dragBox.style.left = x + 'px';
  dragBox.style.top = y + 'px';
  dragBox.style.bottom = 'auto';
  dragBox.style.right = 'auto';
}

function stopDrag(e) {
  if (!isDragging) return;
  const wasTap = !dragMoved;
  isDragging = false;
  dragBox = null;
  if (wasTap) {
    // Evita el "click" fantasma que el navegador emite tras un toque
    if (e && e.type === 'touchend') e.preventDefault();
    swapFromThumbnail();
  }
}

document.querySelectorAll('#video-grid .video-box').forEach(box => {
  box.addEventListener('mousedown', startDrag);
  box.addEventListener('touchstart', startDrag, { passive: true });
});
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, {passive: false});
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag, {passive: false});
document.addEventListener('touchcancel', () => { isDragging = false; dragBox = null; });
