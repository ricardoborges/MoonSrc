import * as THREE from 'three';
import { SceneManager } from './scene/sceneManager.js';
import { calculatePhase, normalizeAngle, TWO_PI } from './simulation/lunarCycle.js';
import { setupTimeline } from './ui/timeline.js';
import { setupControls } from './ui/controls.js';
import { setupEducationalPanel } from './ui/educationalPanel.js';
import { setupEarthViewHUD } from './ui/earthViewHUD.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const telescopeCanvas = document.getElementById('telescope-canvas');
  const orbitHintEl = document.getElementById('orbit-hint');

  if (!canvas) {
    console.error('Canvas WebGL não encontrado!');
    return;
  }

  // 1. Inicializa o motor 3D
  const sceneManager = new SceneManager(canvas, telescopeCanvas);

  // 2. Estado da Simulação
  let currentAngle = 0; // 0 = Lua Nova
  let targetAngle = null; // para transições suaves ao clicar nas 8 fases
  let isPlaying = true;
  let speedMultiplier = 1.0;

  // Velocidade base: uma volta completa (360 graus) em 45 segundos na velocidade 1x
  const BASE_ORBIT_SPEED = TWO_PI / 45;

  // 3. Inicializa os módulos de UI
  const educationalPanel = setupEducationalPanel();
  const earthViewHUD = setupEarthViewHUD();

  let timeline;
  let controls;

  // Função central para sincronizar UI e modelo 3D
  function syncSimulation(angle) {
    const phaseData = calculatePhase(angle);
    sceneManager.setMoonAngle(angle);
    timeline.update(phaseData);
    earthViewHUD.update(phaseData);
    educationalPanel.update(phaseData);
  }

  timeline = setupTimeline({
    onAngleChange: (angle) => {
      currentAngle = normalizeAngle(angle);
      targetAngle = null;
      isPlaying = false;
      controls.setPlayingState(false);
      syncSimulation(currentAngle);
    },
    onPhaseSelect: (selectedAngle) => {
      targetAngle = normalizeAngle(selectedAngle);
      isPlaying = false;
      controls.setPlayingState(false);
    }
  });

  controls = setupControls({
    onPlayPauseToggle: (playing) => {
      isPlaying = playing;
      if (isPlaying) {
        targetAngle = null;
      }
    },
    onSpeedChange: (speed) => {
      speedMultiplier = speed;
    },
    onReset: () => {
      currentAngle = 0;
      targetAngle = null;
      syncSimulation(0);
    },
    onCameraChange: (target) => {
      sceneManager.setCameraFocus(target);
    }
  });

  // Oculta a dica de interação 3D após o primeiro clique ou 6 segundos
  let hintDismissed = false;
  const dismissHint = () => {
    if (!hintDismissed && orbitHintEl) {
      hintDismissed = true;
      orbitHintEl.style.opacity = '0';
      setTimeout(() => { orbitHintEl.style.display = 'none'; }, 600);
    }
  };
  canvas.addEventListener('pointerdown', dismissHint);
  setTimeout(dismissHint, 6000);

  // Sincronização inicial no frame 0
  syncSimulation(currentAngle);

  // 4. Loop de Animação (60 FPS com delta time)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1); // limita delta para evitar saltos

    // Transição suave quando a criança clica em um botão de fase
    if (targetAngle !== null) {
      // Calcula o menor caminho angular no círculo
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += TWO_PI;
      while (diff > Math.PI) diff -= TWO_PI;

      if (Math.abs(diff) < 0.02) {
        currentAngle = targetAngle;
        targetAngle = null;
      } else {
        currentAngle = normalizeAngle(currentAngle + diff * Math.min(1, delta * 6));
      }
      syncSimulation(currentAngle);
    } else if (isPlaying) {
      currentAngle = normalizeAngle(currentAngle + BASE_ORBIT_SPEED * speedMultiplier * delta);
      syncSimulation(currentAngle);
    }

    // Renderiza os dois viewports
    sceneManager.render();
  }

  animate();
});
