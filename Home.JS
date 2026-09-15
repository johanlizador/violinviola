/* ==========================================================================
   Díaz-Núñez Music Studio — página pública
   ========================================================================== */

/* Para recibir las solicitudes por correo sin montar servidor, crea un
   formulario gratuito en https://formspree.io y pega aquí su URL.
   Mientras esté vacío, el botón abre el correo del visitante con la
   solicitud ya redactada, que también funciona. */
const FORM_ENDPOINT = "";
const STUDIO_EMAIL = "johannviolista@hotmail.com";

/* ---------- Idioma ---------- */
let currentLang = document.documentElement.lang === 'en' ? 'en' : 'es';

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.getElementById('lang-toggle').innerText = currentLang === 'es' ? 'EN' : 'ES';
  // Los <option> no admiten spans, así que llevan su texto en data-es / data-en
  document.querySelectorAll('option[data-es]').forEach(op => {
    op.textContent = currentLang === 'es' ? op.dataset.es : op.dataset.en;
  });
  buildSlotGrid();
}

function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyLanguage();
}

/* ---------- Trayectoria completa ---------- */
document.querySelectorAll('.more-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.dataset.more);
    const open = !panel.hidden;
    panel.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
  });
});

/* ---------- Rejilla de disponibilidad ----------
   No es un calendario de reservas: es la franja en la que el alumno puede,
   que es justo lo que hace falta para proponerle un horario. */
const DAYS = {
  es: [['lun', 'L'], ['mar', 'M'], ['mié', 'X'], ['jue', 'J'], ['vie', 'V'], ['sáb', 'S'], ['dom', 'D']],
  en: [['Mon', 'M'], ['Tue', 'T'], ['Wed', 'W'], ['Thu', 'T'], ['Fri', 'F'], ['Sat', 'S'], ['Sun', 'S']]
};
const BLOCKS = {
  es: [['mañana', 'Mañana', '8–12'], ['tarde', 'Tarde', '12–17'], ['noche', 'Noche', '17–21']],
  en: [['morning', 'Morning', '8–12'], ['afternoon', 'Afternoon', '12–5'], ['evening', 'Evening', '5–9']]
};

const chosenSlots = new Set();

function buildSlotGrid() {
  const head = document.getElementById('slot-head');
  const body = document.getElementById('slot-body');
  if (!head || !body) return;

  head.innerHTML = '<th></th>' + DAYS[currentLang].map(d => '<th>' + d[1] + '</th>').join('');
  body.innerHTML = '';

  BLOCKS[currentLang].forEach((block, bi) => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = block[1] + '<br><span style="opacity:.6">' + block[2] + '</span>';
    tr.appendChild(th);

    DAYS[currentLang].forEach((day, di) => {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      const key = di + '-' + bi;
      btn.type = 'button';
      btn.className = 'slot';
      btn.dataset.key = key;
      btn.setAttribute('aria-pressed', chosenSlots.has(key) ? 'true' : 'false');
      btn.setAttribute('aria-label', DAYS[currentLang][di][0] + ' ' + block[1]);
      btn.addEventListener('click', () => {
        if (chosenSlots.has(key)) chosenSlots.delete(key); else chosenSlots.add(key);
        btn.setAttribute('aria-pressed', chosenSlots.has(key) ? 'true' : 'false');
      });
      td.appendChild(btn);
      tr.appendChild(td);
    });
    body.appendChild(tr);
  });
}

function slotsAsText() {
  const porDia = {};
  chosenSlots.forEach(key => {
    const [di, bi] = key.split('-').map(Number);
    const dia = DAYS[currentLang][di][0];
    (porDia[dia] = porDia[dia] || []).push(BLOCKS[currentLang][bi][1].toLowerCase());
  });
  return Object.keys(porDia).map(d => d + ': ' + porDia[d].join(', ')).join(' | ');
}

/* ---------- Envío ---------- */
const T = {
  es: {
    needName: 'Falta tu nombre.',
    needEmail: 'Escribe un correo válido para que podamos responderte.',
    needSlot: 'Marca al menos una franja horaria.',
    sent: 'Solicitud enviada. Te respondemos en uno o dos días.',
    mail: 'Se abrió tu programa de correo con la solicitud redactada. Solo tienes que enviarla.',
    failed: 'No se pudo enviar. Escríbenos directamente a ' + STUDIO_EMAIL + '.'
  },
  en: {
    needName: 'Your name is missing.',
    needEmail: 'Enter a valid email so we can reply.',
    needSlot: 'Mark at least one time block.',
    sent: 'Request sent. We reply within a day or two.',
    mail: 'Your email app opened with the request written out. Just hit send.',
    failed: 'Could not send. Write to us directly at ' + STUDIO_EMAIL + '.'
  }
};

function showError(msg) {
  const box = document.getElementById('form-error');
  box.textContent = msg;
  box.hidden = false;
}

function showOk(msg) {
  document.getElementById('form-error').hidden = true;
  const box = document.getElementById('form-ok');
  document.getElementById('form-ok-text').textContent = msg;
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

document.getElementById('request-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const t = T[currentLang];
  const val = id => document.getElementById(id).value.trim();

  if (!val('f-name')) return showError(t.needName);
  if (!/^\S+@\S+\.\S+$/.test(val('f-email'))) return showError(t.needEmail);
  if (chosenSlots.size === 0) return showError(t.needSlot);
  document.getElementById('form-error').hidden = true;

  const data = {
    nombre: val('f-name'),
    correo: val('f-email'),
    telefono: val('f-phone'),
    edad: val('f-age'),
    instrumento: val('f-instrument'),
    nivel: val('f-level'),
    modalidad: val('f-mode'),
    profesor: val('f-teacher'),
    disponibilidad: slotsAsText(),
    mensaje: val('f-message')
  };

  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(res.status);
      document.getElementById('request-form').reset();
      chosenSlots.clear();
      buildSlotGrid();
      return showOk(t.sent);
    } catch (err) {
      return showError(t.failed);
    }
  }

  // Sin endpoint: el correo del visitante, con todo ya escrito
  const cuerpo = Object.keys(data).map(k => k + ': ' + (data[k] || '—')).join('\n');
  const asunto = 'Solicitud de clase — ' + data.nombre;
  window.location.href = 'mailto:' + STUDIO_EMAIL +
    '?subject=' + encodeURIComponent(asunto) +
    '&body=' + encodeURIComponent(cuerpo);
  showOk(t.mail);
});

/* ---------- Arranque ---------- */
// Enlaces antiguos de clase que apuntaban a index.html siguen funcionando
const join = new URLSearchParams(window.location.search).get('join');
if (join) window.location.replace('aula.html?join=' + encodeURIComponent(join));

applyLanguage();
