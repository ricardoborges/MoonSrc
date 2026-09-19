/**
 * Gerenciador dos controles principais de simulação, navegação de câmera,
 * modo foco (esconder painéis) e atalhos de teclado.
 */

import { t } from '../i18n/index.js';

export function setupControls({ onPlayPauseToggle, onSpeedChange, onReset, onCameraChange, onLayerToggle, onHudVisibilityChange, onConsoleCollapse }) {
  const playPauseBtn = document.getElementById('btn-play-pause');
  const playPauseIcon = document.getElementById('play-pause-icon');
  const playPauseText = document.getElementById('play-pause-text');
  const resetBtn = document.getElementById('btn-reset');
  const speedBtns = document.querySelectorAll('.btn-speed');
  const cameraBtns = document.querySelectorAll('.btn-camera');
  const hudToggleBtn = document.getElementById('btn-toggle-hud');
  const hudToggleIcon = document.getElementById('hud-toggle-icon');
  const hudToggleLabel = document.getElementById('hud-toggle-label');
  const consoleToggleBtn = document.getElementById('btn-collapse-console');
  const consoleToggleIcon = document.getElementById('console-handle-icon');
  const consoleToggleLabel = document.getElementById('console-handle-label');
  const layerBtns = [
    { el: document.getElementById('btn-toggle-beams'), layer: 'beams' },
    { el: document.getElementById('btn-toggle-orbit'), layer: 'orbit' },
    { el: document.getElementById('btn-toggle-earth-orbit'), layer: 'earthOrbit' }
  ];

  let isPlaying = true;
  let hudHidden = false;
  let consoleCollapsed = false;

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
        playPauseText.textContent = t('controls.pause');
      } else {
        playPauseIcon.textContent = '▶️';
        playPauseText.textContent = t('controls.resume');
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

  // 5. Camadas didáticas (raios de luz e trilha da órbita)
  layerBtns.forEach(({ el, layer }) => {
    if (!el) {
      return;
    }
    el.addEventListener('click', () => {
      const visible = !el.classList.contains('is-on');
      el.classList.toggle('is-on', visible);
      el.setAttribute('aria-pressed', String(visible));
      if (onLayerToggle) {
        onLayerToggle(layer, visible);
      }
    });
  });

  // 6. Barra inferior retrátil: desce para fora da tela e deixa só o puxador
  function setConsoleCollapsed(collapsed) {
    consoleCollapsed = collapsed;
    document.body.classList.toggle('console-collapsed', collapsed);

    if (consoleToggleBtn) {
      consoleToggleBtn.setAttribute('aria-expanded', String(!collapsed));
      consoleToggleBtn.title = collapsed
        ? t('console.expandTitle')
        : t('console.collapseTitle');
    }
    if (consoleToggleIcon) {
      consoleToggleIcon.textContent = collapsed ? '▴' : '▾';
    }
    if (consoleToggleLabel) {
      consoleToggleLabel.textContent = collapsed ? t('console.expand') : t('console.collapse');
    }
    if (onConsoleCollapse) {
      onConsoleCollapse(collapsed);
    }
  }

  if (consoleToggleBtn) {
    consoleToggleBtn.addEventListener('click', () => setConsoleCollapsed(!consoleCollapsed));
  }

  // 7. Modo Foco: esconde todo o HUD, menos este próprio botão
  function setHudHidden(hidden) {
    hudHidden = hidden;
    document.body.classList.toggle('hud-hidden', hidden);

    if (hudToggleBtn) {
      hudToggleBtn.setAttribute('aria-pressed', String(hidden));
      hudToggleBtn.title = hidden
        ? t('hud.showTitle')
        : t('hud.hideTitle');
    }
    if (hudToggleIcon) {
      hudToggleIcon.textContent = hidden ? '🎛️' : '⛶';
    }
    if (hudToggleLabel) {
      hudToggleLabel.textContent = hidden ? t('hud.show') : t('hud.hide');
    }
    if (onHudVisibilityChange) {
      onHudVisibilityChange(!hidden);
    }
  }

  if (hudToggleBtn) {
    hudToggleBtn.addEventListener('click', () => setHudHidden(!hudHidden));
  }

  /** Reescreve os rótulos que dependem do estado atual após a troca de idioma */
  function refreshLocale() {
    updatePlayPauseUI(isPlaying);

    if (consoleToggleBtn) {
      consoleToggleBtn.title = consoleCollapsed ? t('console.expandTitle') : t('console.collapseTitle');
    }
    if (consoleToggleLabel) {
      consoleToggleLabel.textContent = consoleCollapsed ? t('console.expand') : t('console.collapse');
    }
    if (hudToggleBtn) {
      hudToggleBtn.title = hudHidden ? t('hud.showTitle') : t('hud.hideTitle');
    }
    if (hudToggleLabel) {
      hudToggleLabel.textContent = hudHidden ? t('hud.show') : t('hud.hide');
    }
  }

  // Escreve os rótulos de estado no idioma detectado (o HTML vem sempre em inglês)
  refreshLocale();

  return {
    setPlayingState: (playing) => {
      isPlaying = playing;
      updatePlayPauseUI(playing);
    },
    refreshLocale,
    toggleHud: () => setHudHidden(!hudHidden),
    isHudHidden: () => hudHidden,
    toggleConsole: () => setConsoleCollapsed(!consoleCollapsed)
  };
}

/**
 * Atalhos de teclado — ajudam muito ao explicar o ciclo para uma criança
 * sem precisar caçar botões com o mouse.
 * @param {object} callbacks { onStepDays, onPhaseSelectIndex, onToggleHud }
 */
export function setupKeyboardShortcuts({ onStepDays, onPhaseSelectIndex, onToggleHud }) {
  const click = (id) => document.getElementById(id)?.click();

  window.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    const target = event.target;
    const isTypingField = target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

    // Setas dentro do slider já são tratadas nativamente pelo próprio input
    if (isTypingField && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      return;
    }

    // Números 1 a 8 saltam direto para cada fase
    if (event.key >= '1' && event.key <= '8') {
      event.preventDefault();
      onPhaseSelectIndex?.(Number(event.key) - 1);
      return;
    }

    switch (event.key) {
      case ' ':
      case 'k':
      case 'K':
        event.preventDefault();
        click('btn-play-pause');
        break;
      case 'ArrowRight':
        event.preventDefault();
        onStepDays?.(0.5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onStepDays?.(-0.5);
        break;
      case 'r':
      case 'R':
        click('btn-reset');
        break;
      case 'l':
      case 'L':
        click('btn-toggle-lesson');
        break;
      case 'b':
      case 'B':
        click('btn-toggle-beams');
        break;
      case 'o':
      case 'O':
        click('btn-toggle-orbit');
        break;
      case 'c':
      case 'C':
        click('btn-collapse-console');
        break;
      case 't':
      case 'T':
        click('btn-toggle-earth-orbit');
        break;
      case 'h':
      case 'H':
        onToggleHud?.();
        break;
      case 'Escape':
        if (document.getElementById('educational-card')?.hidden === false) {
          click('btn-toggle-lesson');
        }
        break;
      default:
        break;
    }
  });
}
