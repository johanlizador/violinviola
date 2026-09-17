/* SELECTOR DE DISPOSITIVO DE SALIDA DE AUDIO (Sincronizado)
   Elegir altavoz requiere HTMLMediaElement.setSinkId: existe en Chrome, Edge
   y Firefox de escritorio, pero no en Safari ni en ningún navegador de iOS
   (allí la salida la decide el sistema). Donde no hay soporte, o solo hay un
   dispositivo, los selectores se quedan ocultos en vez de no hacer nada. */
let selectedSinkId = 'default';
const canChooseAudioOutput =
  typeof HTMLMediaElement !== 'undefined' && 'setSinkId' in HTMLMediaElement.prototype;

function setAudioPickersVisible(visible) {
  document.querySelectorAll('.audio-output-picker').forEach(el => { el.hidden = !visible; });
}

async function populateAudioOutputs() {
  const selects = document.querySelectorAll('.audio-output-select');
  if (selects.length === 0 || !canChooseAudioOutput ||
      !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    setAudioPickersVisible(false);
    return;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
    // Chrome añade entradas virtuales ("default", "communications") que
    // duplican un dispositivo real; no cuentan para decidir si hay elección.
    const realOutputs = audioOutputs.filter(d => d.deviceId !== 'default' && d.deviceId !== 'communications');
    // Sin permiso de cámara/micrófono las etiquetas llegan vacías: aún no hay
    // nada útil que mostrar.
    const labelled = audioOutputs.length > 0 && audioOutputs[0].label !== '';

    if (!labelled || realOutputs.length < 2) {
      setAudioPickersVisible(false);
      return;
    }

    selects.forEach(select => {
      select.innerHTML = '';
      audioOutputs.forEach((device, i) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `${translations[currentLang].speaker_n} ${i + 1}`;
        select.appendChild(option);
      });
      if (Array.from(select.options).some(opt => opt.value === selectedSinkId)) {
        select.value = selectedSinkId;
      }
    });
    setAudioPickersVisible(true);
  } catch (e) {
    console.warn("[aula] No se pudieron listar las salidas de audio:", e);
    setAudioPickersVisible(false);
  }
}

async function applySinkToAudioContext() {
  if (!audioCtx || typeof audioCtx.setSinkId !== 'function') return;
  // AudioContext usa '' para el dispositivo predeterminado
  const id = selectedSinkId === 'default' ? '' : selectedSinkId;
  try {
    await audioCtx.setSinkId(id);
  } catch (e) {
    console.warn("[aula] Error al cambiar salida de Web Audio API:", e);
  }
}

async function changeAudioOutput(deviceId) {
  if (!canChooseAudioOutput) return;
  selectedSinkId = deviceId;
  // Sincronizar todos los menús desplegables de la pantalla
  document.querySelectorAll('.audio-output-select').forEach(sel => sel.value = deviceId);

  const remoteVid = document.getElementById('remote-video');
  if (remoteVid) {
    try {
      await remoteVid.setSinkId(deviceId);
    } catch (e) {
      console.warn("[aula] Error al cambiar salida de video:", e);
    }
  }

  // Metrónomo y drones. Firefox tiene setSinkId en <video> pero no en
  // AudioContext; ahí esas herramientas siguen en el altavoz predeterminado.
  await applySinkToAudioContext();
}
