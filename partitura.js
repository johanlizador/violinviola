/* PARTITURA COMPARTIDA
   El profesor abre un PDF de su equipo. El archivo viaja al alumno por el
   mismo canal de datos de PeerJS, en trozos, y se dibuja con pdf.js en el
   navegador de cada uno: no se sube a ningún servidor.

   Lo que se sincroniza: la página y las marcas de lápiz. Las marcas se
   guardan en coordenadas de 0 a 1 respecto a la página, así que se ven en el
   mismo sitio aunque cada uno tenga la pantalla de otro tamaño o con otro
   zoom.

   Quién puede tocar: el profesor siempre; el alumno solo cuando el profesor
   le abre los controles, igual que con el metrónomo. */

const SCORE_CHUNK = 16 * 1024;        // trozos de 16 kB
const SCORE_MAX_MB = 25;
const SCORE_COLORS = ['#e5484d', '#3b82f6', '#22c55e', '#f5a524'];

let pdfDoc = null;
let scorePage = 1;
let scoreZoom = 1;
let scoreName = '';
let scoreBytes = null;                 // el PDF tal cual, para reenviarlo
let scoreStrokes = {};                 // { página: [trazo, ...] }
let scoreIncoming = null;              // recepción en curso
let scoreRendering = false;
let inkColor = SCORE_COLORS[0];
let inkOn = true;
let drawing = null;

function scoreT(key) { return translations[currentLang][key]; }

function pdfReady() {
  if (typeof pdfjsLib === 'undefined') return false;
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  return true;
}

function canDrawScore() {
  return currentRole === 'teacher' || !document.body.classList.contains('student-locked');
}

/* ---------- Abrir y cerrar ---------- */
function openScorePicker() {
  document.getElementById('score-file').click();
}

async function onScoreFileChosen(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file) return;
  if (file.type !== 'application/pdf') { alert(scoreT('score_only_pdf')); return; }
  if (file.size > SCORE_MAX_MB * 1024 * 1024) { alert(scoreT('score_too_big').replace('{mb}', SCORE_MAX_MB)); return; }

  const bytes = new Uint8Array(await file.arrayBuffer());
  await loadScoreBytes(bytes, file.name);
  sendScoreToPeer();
}

async function loadScoreBytes(bytes, nombre) {
  if (!pdfReady()) { alert(scoreT('score_no_pdfjs')); return; }
  try {
    // pdf.js se queda con el buffer, así que se guarda una copia para reenviar
    scoreBytes = bytes.slice(0);
    scoreName = nombre || '';
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
    scorePage = 1;
    scoreStrokes = {};
    scoreZoom = 1;
    await renderScorePage();
    updateScoreUI();
  } catch (e) {
    console.error('[aula] no se pudo abrir el PDF:', e);
    alert(scoreT('score_failed'));
  }
}

function closeScore(avisar = true) {
  pdfDoc = null; scoreBytes = null; scoreName = ''; scoreStrokes = {}; scorePage = 1;
  scoreIncoming = null;
  const base = document.getElementById('score-page-canvas');
  const tinta = document.getElementById('score-ink');
  [base, tinta].forEach(c => { if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); });
  if (avisar) sendPeerMessage({ type: 'SCORE_CLOSE' });
  updateScoreUI();
}

/* ---------- Dibujar la página ---------- */
async function renderScorePage() {
  if (!pdfDoc || scoreRendering) return;
  scoreRendering = true;
  try {
    const pagina = await pdfDoc.getPage(scorePage);
    const wrap = document.getElementById('score-wrap');
    const base = document.getElementById('score-page-canvas');
    const tinta = document.getElementById('score-ink');

    const natural = pagina.getViewport({ scale: 1 });
    const ancho = (wrap.clientWidth || 700) * scoreZoom;
    const escala = ancho / natural.width;
    const viewport = pagina.getViewport({ scale: escala });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    [base, tinta].forEach(c => {
      c.width = Math.round(viewport.width * dpr);
      c.height = Math.round(viewport.height * dpr);
      c.style.width = Math.round(viewport.width) + 'px';
      c.style.height = Math.round(viewport.height) + 'px';
    });

    const ctx = base.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);
    await pagina.render({ canvasContext: ctx, viewport }).promise;
    redrawInk();
  } catch (e) {
    console.error('[aula] error al dibujar la página:', e);
  }
  scoreRendering = false;
}

function redrawInk() {
  const tinta = document.getElementById('score-ink');
  if (!tinta) return;
  const ctx = tinta.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, tinta.width, tinta.height);
  (scoreStrokes[scorePage] || []).forEach(tr => pintarTrazo(ctx, tr, tinta));
}

function pintarTrazo(ctx, trazo, lienzo) {
  if (!trazo.pts.length) return;
  ctx.save();
  ctx.strokeStyle = trazo.color;
  ctx.lineWidth = Math.max(1.5, trazo.w * lienzo.width);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  trazo.pts.forEach(([x, y], i) => {
    const px = x * lienzo.width, py = y * lienzo.height;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.restore();
}

/* ---------- Navegación y zoom ---------- */
function changeScorePage(delta) {
  if (!pdfDoc) return;
  const destino = Math.min(Math.max(1, scorePage + delta), pdfDoc.numPages);
  if (destino === scorePage) return;
  scorePage = destino;
  renderScorePage();
  updateScoreUI();
  sendPeerMessage({ type: 'SCORE_PAGE', page: scorePage });
}

function changeScoreZoom(delta) {
  scoreZoom = Math.min(3, Math.max(0.5, Math.round((scoreZoom + delta) * 10) / 10));
  renderScorePage();
  updateScoreUI();
}

/* ---------- Lápiz ---------- */
function setInkColor(color) {
  inkColor = color;
  document.querySelectorAll('.ink-color').forEach(b =>
    b.classList.toggle('active', b.dataset.color === color));
}

function toggleInk() {
  inkOn = !inkOn;
  updateScoreUI();
}

function puntoEnLienzo(e, lienzo) {
  const r = lienzo.getBoundingClientRect();
  return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
}

function inkDown(e) {
  if (!pdfDoc || !inkOn || !canDrawScore()) return;
  const tinta = document.getElementById('score-ink');
  tinta.setPointerCapture(e.pointerId);
  drawing = {
    id: Math.random().toString(36).slice(2, 9),
    color: inkColor,
    w: 0.004,
    pts: [puntoEnLienzo(e, tinta)],
    enviados: 0
  };
  (scoreStrokes[scorePage] = scoreStrokes[scorePage] || []).push(drawing);
}

function inkMove(e) {
  if (!drawing) return;
  const tinta = document.getElementById('score-ink');
  drawing.pts.push(puntoEnLienzo(e, tinta));
  redrawInk();
  if (drawing.pts.length - drawing.enviados >= 6) enviarTrazo(false);
}

function inkUp() {
  if (!drawing) return;
  enviarTrazo(true);
  drawing = null;
}

// Se manda el trazo a cachos mientras se dibuja, para que el otro lo vea salir
function enviarTrazo(final) {
  if (!drawing) return;
  const nuevos = drawing.pts.slice(Math.max(0, drawing.enviados - 1));
  drawing.enviados = drawing.pts.length;
  sendPeerMessage({
    type: 'SCORE_STROKE', page: scorePage, id: drawing.id,
    color: drawing.color, w: drawing.w, pts: nuevos, done: final
  });
}

function undoInk() {
  const lista = scoreStrokes[scorePage];
  if (!lista || !lista.length) return;
  const fuera = lista.pop();
  redrawInk();
  sendPeerMessage({ type: 'SCORE_UNDO', page: scorePage, id: fuera.id });
}

function clearInk() {
  scoreStrokes[scorePage] = [];
  redrawInk();
  sendPeerMessage({ type: 'SCORE_CLEAR', page: scorePage });
}

/* ---------- Envío del archivo ---------- */
function scoreBuffered() {
  const dc = activeConnection && activeConnection.dataChannel;
  return dc ? dc.bufferedAmount : 0;
}

async function sendScoreToPeer() {
  if (!scoreBytes || !activeConnection || !activeConnection.open) return;
  const total = Math.ceil(scoreBytes.length / SCORE_CHUNK);
  sendPeerMessage({ type: 'SCORE_META', name: scoreName, chunks: total, size: scoreBytes.length });
  for (let i = 0; i < total; i++) {
    // Sin esta espera el canal se satura y se pierden trozos
    while (scoreBuffered() > 512 * 1024) await new Promise(r => setTimeout(r, 50));
    if (!activeConnection || !activeConnection.open) return;
    sendPeerMessage({
      type: 'SCORE_CHUNK', i,
      data: scoreBytes.slice(i * SCORE_CHUNK, (i + 1) * SCORE_CHUNK)
    });
    if (i % 8 === 0) {
      showScoreProgress(scoreT('score_sending'), (i + 1) / total);
      await new Promise(r => setTimeout(r, 0));
    }
  }
  showScoreProgress('', 0);
  // Estado actual por si el alumno llegó con la clase empezada
  sendPeerMessage({ type: 'SCORE_PAGE', page: scorePage });
}

// El profesor reconecta o el alumno entra tarde: recibe la partitura igual
function pushScoreToPeer() {
  if (currentRole === 'teacher' && scoreBytes) sendScoreToPeer();
}

function showScoreProgress(texto, fraccion) {
  const box = document.getElementById('score-progress');
  if (!box) return;
  if (!texto) { box.hidden = true; return; }
  box.hidden = false;
  box.innerText = texto + ' ' + Math.round(fraccion * 100) + '%';
}

/* ---------- Mensajes ---------- */
async function handleScoreMessage(data) {
  if (data.type === 'SCORE_META') {
    scoreIncoming = { name: data.name, chunks: data.chunks, partes: new Array(data.chunks), recibidos: 0 };
    showScoreProgress(scoreT('score_receiving'), 0);
  }
  else if (data.type === 'SCORE_CHUNK') {
    if (!scoreIncoming) return;
    if (scoreIncoming.partes[data.i] === undefined) scoreIncoming.recibidos++;
    scoreIncoming.partes[data.i] = new Uint8Array(data.data);
    showScoreProgress(scoreT('score_receiving'), scoreIncoming.recibidos / scoreIncoming.chunks);
    if (scoreIncoming.recibidos === scoreIncoming.chunks) {
      const total = scoreIncoming.partes.reduce((n, p) => n + p.length, 0);
      const bytes = new Uint8Array(total);
      let pos = 0;
      scoreIncoming.partes.forEach(p => { bytes.set(p, pos); pos += p.length; });
      const nombre = scoreIncoming.name;
      scoreIncoming = null;
      showScoreProgress('', 0);
      await loadScoreBytes(bytes, nombre);
    }
  }
  else if (data.type === 'SCORE_PAGE') {
    if (!pdfDoc || data.page === scorePage) return;
    scorePage = Math.min(Math.max(1, data.page), pdfDoc.numPages);
    renderScorePage();
    updateScoreUI();
  }
  else if (data.type === 'SCORE_STROKE') {
    const lista = (scoreStrokes[data.page] = scoreStrokes[data.page] || []);
    let trazo = lista.find(t => t.id === data.id);
    if (!trazo) { trazo = { id: data.id, color: data.color, w: data.w, pts: [] }; lista.push(trazo); }
    // El primer punto de cada envío repite el último ya recibido
    const pts = trazo.pts.length ? data.pts.slice(1) : data.pts;
    trazo.pts.push(...pts);
    if (data.page === scorePage) redrawInk();
  }
  else if (data.type === 'SCORE_UNDO') {
    const lista = scoreStrokes[data.page];
    if (lista) scoreStrokes[data.page] = lista.filter(t => t.id !== data.id);
    if (data.page === scorePage) redrawInk();
  }
  else if (data.type === 'SCORE_CLEAR') {
    scoreStrokes[data.page] = [];
    if (data.page === scorePage) redrawInk();
  }
  else if (data.type === 'SCORE_CLOSE') {
    closeScore(false);
  }
  updateScoreUI();
}

/* ---------- Interfaz ---------- */
function updateScoreUI() {
  const hay = !!pdfDoc;
  const stage = document.getElementById('score-stage');
  const vacio = document.getElementById('score-empty');
  if (stage) stage.hidden = !hay;
  if (vacio) vacio.hidden = hay;

  const etiqueta = document.getElementById('score-page-label');
  if (etiqueta) etiqueta.innerText = hay ? scorePage + ' / ' + pdfDoc.numPages : '—';
  const zoomLbl = document.getElementById('score-zoom-label');
  if (zoomLbl) zoomLbl.innerText = Math.round(scoreZoom * 100) + '%';

  const nombre = document.getElementById('score-name');
  if (nombre) nombre.innerText = hay ? scoreName : '';

  const lapiz = document.getElementById('btn-ink');
  if (lapiz) {
    lapiz.classList.toggle('active', inkOn);
    const span = lapiz.querySelector('span');
    if (span) span.innerText = scoreT(inkOn ? 'score_pen_on' : 'score_pen_off');
  }
  const tinta = document.getElementById('score-ink');
  if (tinta) tinta.style.cursor = (inkOn && canDrawScore()) ? 'crosshair' : 'default';

  document.querySelectorAll('.score-needs-pdf').forEach(el => { el.disabled = !hay; });
  document.querySelectorAll('.score-own').forEach(el => { el.hidden = !hay; });
}

/* Al cambiar el tamaño de la ventana hay que volver a dibujar la página */
let scoreResizeTimer = null;
window.addEventListener('resize', () => {
  if (!pdfDoc) return;
  clearTimeout(scoreResizeTimer);
  scoreResizeTimer = setTimeout(renderScorePage, 200);
});

(function armarPartitura() {
  const tinta = document.getElementById('score-ink');
  if (!tinta) return;
  tinta.addEventListener('pointerdown', inkDown);
  tinta.addEventListener('pointermove', inkMove);
  tinta.addEventListener('pointerup', inkUp);
  tinta.addEventListener('pointercancel', inkUp);
  setInkColor(inkColor);
})();
