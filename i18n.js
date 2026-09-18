/* Traducciones ES/EN y cambio de idioma */

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
    lock_badge: "🔒 Lo controla tu profesor", routing_label: "¿Dónde suenan el metrónomo y los drones?", routing_local: "En mi equipo", routing_remote: "En el equipo del alumno", mon_tempo: "Tempo de la clase", mon_pitch: "Nota de referencia", mon_idle: "Sin metrónomo", calib_label: "LA de referencia", open_strings: "Cuerdas al aire", keyboard_label: "Teclado cromático", btn_stop_drone: "Detener Afinador", drone_idle: "Sin nota",
    btn_mirror_on: "Espejo: ON", btn_mirror_off: "Espejo: OFF",
    login_placeholder: "Clave de acceso", login_error: "Clave incorrecta.",
    auth_locked: "🔒 Alumno bloqueado (clic para permitir)", auth_unlocked: "🔓 Alumno desbloqueado (clic para bloquear)",
    vid_you: "Tú", role_student: "Alumno", speaker_default: "Altavoz predeterminado", speaker_n: "Altavoz",
    err_media_alert: "No se pudo acceder a la cámara o al micrófono. Revisa los permisos del navegador.",
    footer_rights: "Todos los derechos reservados.",
    rec_btn_start: "Grabar", rec_btn_stop: "Detener grabación", rec_btn_request: "Pedir grabar", rec_btn_pending: "Esperando al profesor…",
    rec_offer_off: "🎥 Grabar: oculto al alumno (clic para mostrar)", rec_offer_on: "🎥 Grabar: visible al alumno (clic para ocultar)",
    rec_toast_ask: "{name} quiere grabar la clase.", rec_toast_note: "La grabación incluirá tu imagen y tu voz.", rec_allow: "Permitir", rec_deny: "Rechazar",
    rec_self: "Grabando", rec_remote_student: "El alumno está grabando", rec_remote_teacher: "Tu profesor está grabando",
    rec_denied: "Tu profesor no autorizó la grabación.", rec_timeout: "Tu profesor no respondió. Puedes volver a pedirlo.",
    rec_revoked: "Tu profesor desactivó la grabación. Se guardó lo grabado hasta ahora.",
    rec_unsupported: "Este navegador no puede grabar. Prueba con Chrome, Edge, Firefox o Safari actualizado.",
    rec_no_video: "Enciende la videollamada antes de grabar.", rec_student: "Alumno", rec_teacher: "Profesor",
    share_start: "Compartir pantalla", share_stop: "Dejar de compartir", share_remote: "Pantalla compartida",
    share_no_video: "Enciende la videollamada antes de compartir la pantalla.",
    share_unsupported: "Este navegador no puede compartir pantalla. En iPhone y iPad no está disponible.",
    share_failed: "No se pudo compartir la pantalla."
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
    lock_badge: "🔒 Your teacher controls this", routing_label: "Where do the metronome and drones play?", routing_local: "On my machine", routing_remote: "On the student's machine", mon_tempo: "Class tempo", mon_pitch: "Reference pitch", mon_idle: "No metronome", calib_label: "Reference A", open_strings: "Open strings", keyboard_label: "Chromatic keyboard", btn_stop_drone: "Stop Tuner", drone_idle: "No pitch",
    btn_mirror_on: "Mirror: ON", btn_mirror_off: "Mirror: OFF",
    login_placeholder: "Access code", login_error: "Incorrect code.",
    auth_locked: "🔒 Student locked (click to allow)", auth_unlocked: "🔓 Student unlocked (click to lock)",
    vid_you: "You", role_student: "Student", speaker_default: "Default speaker", speaker_n: "Speaker",
    err_media_alert: "Could not access the camera or microphone. Check your browser permissions.",
    footer_rights: "All rights reserved.",
    rec_btn_start: "Record", rec_btn_stop: "Stop recording", rec_btn_request: "Ask to record", rec_btn_pending: "Waiting for teacher…",
    rec_offer_off: "🎥 Recording: hidden from student (click to show)", rec_offer_on: "🎥 Recording: shown to student (click to hide)",
    rec_toast_ask: "{name} wants to record the lesson.", rec_toast_note: "The recording will include your video and voice.", rec_allow: "Allow", rec_deny: "Decline",
    rec_self: "Recording", rec_remote_student: "The student is recording", rec_remote_teacher: "Your teacher is recording",
    rec_denied: "Your teacher did not allow the recording.", rec_timeout: "Your teacher didn't answer. You can ask again.",
    rec_revoked: "Your teacher turned recording off. What was recorded so far has been saved.",
    rec_unsupported: "This browser can't record. Try an up-to-date Chrome, Edge, Firefox or Safari.",
    rec_no_video: "Turn on the video call before recording.", rec_student: "Student", rec_teacher: "Teacher",
    share_start: "Share screen", share_stop: "Stop sharing", share_remote: "Shared screen",
    share_no_video: "Turn on the video call before sharing your screen.",
    share_unsupported: "This browser can't share the screen. It isn't available on iPhone or iPad.",
    share_failed: "Could not share the screen."
  }
};

let currentLang = 'es';
function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyLanguage(currentLang);
  updateMediaButtonsText();
  buildKeyboard();
  refreshStringLabels();
  updateDroneReadout();
  populateAudioOutputs();
}
function applyLanguage(lang) { 
  document.documentElement.lang = lang; 
  document.getElementById('lang-toggle').innerText = lang === 'es' ? 'EN' : 'ES'; 
  document.querySelectorAll('[data-i18n]').forEach(el => { 
    if (translations[lang][el.getAttribute('data-i18n')]) el.innerText = translations[lang][el.getAttribute('data-i18n')]; 
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const txt = translations[lang][el.getAttribute('data-i18n-placeholder')];
    if (txt) el.placeholder = txt;
  });
  updateStudentAuthButton();
  if (typeof updateRecordingUI === 'function') updateRecordingUI();
  if (typeof updateShareButton === 'function') updateShareButton();
  if (lastStatusKey) setStatus(lastStatusKey, document.getElementById('status-dot').className.replace('dot ', ''));
}
