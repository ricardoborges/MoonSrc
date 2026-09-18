import { PHASES, dayToAngle } from '../simulation/lunarCycle.js';

/**
 * Gerenciador da linha do tempo e régua das 8 fases
 * @param {object} callbacks { onAngleChange, onPhaseSelect }
 */
export function setupTimeline({ onAngleChange, onPhaseSelect }) {
  const shelfEl = document.getElementById('phases-shelf');
  const sliderEl = document.getElementById('cycle-slider');
  const dayValueEl = document.getElementById('cycle-day-value');
  const currentIconEl = document.getElementById('current-phase-icon');
  const currentNameEl = document.getElementById('current-phase-name');

  let isUserDraggingSlider = false;

  // 1. Renderiza os 8 botões de atalho das fases na prateleira
  if (shelfEl) {
    shelfEl.innerHTML = '';
    PHASES.forEach((p, idx) => {
      const btn = document.createElement('button');
      btn.className = `phase-btn ${idx === 0 ? 'active' : ''}`;
      btn.dataset.index = idx;
      btn.dataset.angle = p.targetAngle;
      btn.title = `${p.name} (~Dia ${p.targetDay.toFixed(1)})`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

      btn.innerHTML = `
        <span class="phase-btn-icon">${p.icon}</span>
        <span class="phase-btn-name">${p.shortName}</span>
      `;

      btn.addEventListener('click', () => {
        if (onPhaseSelect) {
          onPhaseSelect(p.targetAngle, idx);
        }
      });

      shelfEl.appendChild(btn);
    });
  }

  // 2. Eventos do Slider de Dias
  if (sliderEl) {
    sliderEl.addEventListener('mousedown', () => { isUserDraggingSlider = true; });
    sliderEl.addEventListener('touchstart', () => { isUserDraggingSlider = true; }, { passive: true });

    window.addEventListener('mouseup', () => { isUserDraggingSlider = false; });
    window.addEventListener('touchend', () => { isUserDraggingSlider = false; });

    sliderEl.addEventListener('input', (e) => {
      const day = parseFloat(e.target.value);
      const angle = dayToAngle(day);
      if (onAngleChange) {
        onAngleChange(angle);
      }
    });
  }

  /**
   * Sincroniza a barra e a interface com o estado atual da simulação
   * @param {object} phaseData
   */
  function update(phaseData) {
    // Atualiza o slider se o usuário não estiver arrastando manualmente no exato momento
    if (sliderEl && !isUserDraggingSlider) {
      sliderEl.value = phaseData.day.toFixed(2);
    }

    if (dayValueEl) {
      dayValueEl.textContent = `Dia ${phaseData.day.toFixed(1)}`;
    }

    if (currentIconEl) {
      currentIconEl.textContent = phaseData.phaseIcon;
    }

    if (currentNameEl) {
      currentNameEl.textContent = phaseData.phaseName;
    }

    // Atualiza o botão ativo na prateleira
    if (shelfEl) {
      const buttons = shelfEl.querySelectorAll('.phase-btn');
      buttons.forEach((btn, idx) => {
        const isActive = idx === phaseData.phaseIndex;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }

  return {
    update
  };
}
