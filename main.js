/* Arranque del aula. Va el último: aquí ya existen todas las funciones. */

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
    lockStudentInterface(true);
    initPeerClient();
  } else {
    document.getElementById('teacher-login-panel').style.display = 'block';
  }

  updateRecordingUI();

  // Llenar listas de audio si ya hay permisos concedidos previamente
  populateAudioOutputs();
  if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
     navigator.mediaDevices.addEventListener('devicechange', populateAudioOutputs);
  }
}

window.addEventListener('load', initSystem);
