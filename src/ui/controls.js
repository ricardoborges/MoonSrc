/**
 * Gerenciador dos controles principais de simulação e navegação de câmera
 */

export function setupControls({ onPlayPauseToggle, onSpeedChange, onReset, onCameraChange }) {
  const playPauseBtn = document.getElementById('btn-play-pause');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const playPauseText = document.getElementById('play-pause-text');
  const resetBtn = document.getElementById('btn-reset');
  const speedBtns = document.querySelectorAll('.btn-speed');
  const cameraBtns = document.querySelectorAll('.btn-camera');

  let isPlaying = true;

  // 1. Play / Pausa
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updatePlayPauseUI(isPlaying);
      if (onPlayPauseToggle) {
        onPlayPauseToggle(isPlaying);
      }
    });
  }

  function updatePlayPauseUI(playing) {
    if (playPauseIcon && playPauseText) {
      if (playing) {
        playPauseIcon.textContent = '⏸️';
        playPauseText.textContent = 'Pausar';
      } else {
        playPauseIcon.textContent = '▶️';
        playPauseText.textContent = 'Continuar';
      }
    }
  }

  // 2. Seletor de Velocidades
  speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speedBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const speed = parseFloat(btn.dataset.speed) || 1.0;
      if (onSpeedChange) {
        onSpeedChange(speed);
      }
    });
  });

  // 3. Reiniciar para o início (Lua Nova)
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (onReset) {
        onReset();
      }
    });
  }

  // 4. Foco de Câmera
  cameraBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      cameraBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.target;
      if (onCameraChange) {
        onCameraChange(target);
      }
    });
  });

  return {
    setPlayingState: (playing) => {
      isPlaying = playing;
      updatePlayPauseUI(playing);
    }
  };
}
