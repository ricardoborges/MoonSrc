import * as THREE from 'three';
import { SceneManager } from './scene/sceneManager.js';
import {
  calculatePhase,
  normalizeAngle,
  angleToDay,
  dayToAngle,
  getPhaseByIndex,
  LUNAR_MONTHS_PER_YEAR,
  SYNODIC_MONTH_DAYS,
  TWO_PI
} from './simulation/lunarCycle.js';
import { setupTimeline } from './ui/timeline.js';
import { setupControls, setupKeyboardShortcuts } from './ui/controls.js';
import { setupEducationalPanel } from './ui/educationalPanel.js';
import { setupEarthViewHUD } from './ui/earthViewHUD.js';
import { setupEarthOrbitReadout } from './ui/earthOrbitReadout.js';
import { setupLanguageSwitcher } from './ui/languageSwitcher.js';
import { initI18n, onLocaleChange } from './i18n/index.js';

window.addEventListener('DOMContentLoaded', () => {
  // Idioma primeiro: os módulos de UI já nascem escrevendo no idioma certo
  initI18n();

  const canvas = document.getElementById('webgl-canvas');
  const telescopeCanvas = document.getElementById('telescope-canvas');
  const orbitHintEl = document.getElementById('orbit-hint');
  const headerEl = document.getElementById('hud-header');
  const footerEl = document.getElementById('hud-footer');

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
  const earthOrbitReadout = setupEarthOrbitReadout();

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

  function pause() {
    isPlaying = false;
    controls.setPlayingState(false);
  }

  /** Avança ou retrocede o ciclo em dias, dando a volta no mês lunar */
  function stepDays(deltaDays) {
    const day = angleToDay(currentAngle) + deltaDays;
    const wrapped = ((day % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
    currentAngle = dayToAngle(wrapped);
    targetAngle = null;
    pause();
    syncSimulation(currentAngle);
  }

  timeline = setupTimeline({
    onAngleChange: (angle) => {
      currentAngle = normalizeAngle(angle);
      targetAngle = null;
      pause();
      syncSimulation(currentAngle);
    },
    onPhaseSelect: (selectedAngle) => {
      targetAngle = normalizeAngle(selectedAngle);
      pause();
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
    },
    onLayerToggle: (layer, visible) => {
      if (layer === 'earthOrbit') {
        sceneManager.setEarthOrbitEnabled(visible);
      } else {
        sceneManager.setLayerVisible(layer, visible);
      }
    },
    onHudVisibilityChange: () => {
      scheduleHudMeasure();
    },
    onConsoleCollapse: (collapsed) => {
      // A explicação fica ancorada na barra: recolher sem fechá-la deixaria
      // o card saindo pela parte de baixo da tela.
      if (collapsed) {
        educationalPanel.setOpen(false);
      }
      scheduleHudMeasure();
    }
  });

  setupLanguageSwitcher();

  // Trocar de idioma reescreve os textos dinâmicos e remede o HUD: os rótulos
  // mudam de largura e o enquadramento 3D depende do espaço que a barra ocupa.
  onLocaleChange(() => {
    controls.refreshLocale();
    timeline.refreshLocale();
    earthViewHUD.refreshLocale();
    educationalPanel.refreshLocale();
    earthOrbitReadout.refreshLocale();
    scheduleHudMeasure();
  });

  setupKeyboardShortcuts({
    onStepDays: stepDays,
    onPhaseSelectIndex: (index) => {
      targetAngle = normalizeAngle(getPhaseByIndex(index).targetAngle);
      pause();
    },
    onToggleHud: () => controls.toggleHud()
  });

  // 4. Reenquadramento: informa ao 3D quanto da tela o HUD ocupa,
  //    para que o sistema Sol-Terra-Lua use o espaço realmente livre.
  let measureScheduled = false;

  function measureHud() {
    measureScheduled = false;

    if (document.body.classList.contains('hud-hidden')) {
      sceneManager.setHudInsets({ top: 0, bottom: 0, left: 0, right: 0 });
      return;
    }

    const margin = 8;
    const insets = { top: 0, bottom: 0, left: 0, right: 0 };

    if (headerEl) {
      insets.top = headerEl.getBoundingClientRect().bottom + margin;
    }
    if (footerEl) {
      insets.bottom = window.innerHeight - footerEl.getBoundingClientRect().top + margin;
    }

    // Só reenquadramos na vertical: deslocar na horizontal cortaria o Sol,
    // que já fica na borda esquerda do enquadramento padrão.
    sceneManager.setHudInsets(insets);
  }

  function scheduleHudMeasure() {
    if (!measureScheduled) {
      measureScheduled = true;
      requestAnimationFrame(measureHud);
    }
  }

  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(scheduleHudMeasure);
    [headerEl, footerEl].forEach(el => el && observer.observe(el));
  }
  window.addEventListener('resize', scheduleHudMeasure);

  // A barra desce com transform (o ResizeObserver não percebe): remede no fim
  if (footerEl) {
    footerEl.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform') {
        scheduleHudMeasure();
      }
    });
  }

  scheduleHudMeasure();

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
  setTimeout(dismissHint, 8000);

  // Sincronização inicial no frame 0
  syncSimulation(currentAngle);

  // 5. Loop de Animação (60 FPS com delta time)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.1); // limita delta para evitar saltos

    // O tempo só corre quando a simulação avança: pausado, a Terra para de girar
    const simDelta = isPlaying || targetAngle !== null ? delta : 0;

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
      const moonStep = BASE_ORBIT_SPEED * speedMultiplier * delta;
      currentAngle = normalizeAngle(currentAngle + moonStep);
      // A translação anda junto com o ciclo lunar (~12.37 luas por ano), então
      // pausa e velocidade valem para as duas órbitas.
      sceneManager.advanceEarthOrbit(moonStep / LUNAR_MONTHS_PER_YEAR);
      syncSimulation(currentAngle);
    }

    // Renderiza os dois viewports
    sceneManager.render(delta, simDelta);

    // Distâncias do quadro atual (os módulos só tocam no DOM quando mudam)
    earthOrbitReadout.update(sceneManager.getEarthOrbitState());
    earthViewHUD.updateDistance(sceneManager.getMoonOrbitState());
  }

  animate();
});
