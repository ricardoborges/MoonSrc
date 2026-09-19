/**
 * Painel Educativo Lúdico para Crianças (6 a 10 anos)
 * Fica fechado por padrão e flutua acima do console, sem roubar altura do 3D.
 */

import { t } from '../i18n/index.js';

export function setupEducationalPanel() {
  const explanationEl = document.getElementById('phase-explanation');
  const tipEl = document.getElementById('phase-tip');
  const funFactEl = document.getElementById('phase-fun-fact');
  const cardBadgeEl = document.getElementById('card-badge');
  const cardEl = document.getElementById('educational-card');
  const toggleEl = document.getElementById('btn-toggle-lesson');
  const toggleTextEl = document.getElementById('lesson-toggle-text');
  const closeEl = document.getElementById('btn-close-lesson');

  let currentPhaseKey = null;
  let isOpen = false;

  function setOpen(open) {
    if (!cardEl || !toggleEl) {
      return;
    }
    isOpen = open;
    toggleEl.setAttribute('aria-expanded', String(open));
    cardEl.hidden = !open;
    toggleEl.classList.toggle('is-open', open);
    if (toggleTextEl) {
      toggleTextEl.textContent = open ? t('lesson.close') : t('lesson.open');
    }
  }

  if (toggleEl && cardEl) {
    toggleEl.addEventListener('click', () => {
      setOpen(cardEl.hidden);
    });
  }

  if (closeEl) {
    closeEl.addEventListener('click', () => setOpen(false));
  }

  /** Escreve os textos da fase no card, no idioma ativo */
  function renderPhase(phaseKey) {
    if (cardBadgeEl) {
      // O dia exato fica no console; aqui só o nome da fase (que é o que muda o texto)
      cardBadgeEl.textContent = t('lesson.badge', { phase: t(`phases.${phaseKey}.name`) });
    }

    if (explanationEl) {
      explanationEl.textContent = t(`phases.${phaseKey}.description`);
    }

    if (tipEl) {
      tipEl.textContent = t(`phases.${phaseKey}.tip`);
    }

    if (funFactEl) {
      funFactEl.textContent = t(`phases.${phaseKey}.funFact`);
    }
  }

  /**
   * Atualiza as informações do card com os dados da fase atual
   * @param {object} phaseData
   */
  function update(phaseData) {
    if (currentPhaseKey === phaseData.phaseKey) {
      return; // evita reflow desnecessário se a fase continuar a mesma
    }
    currentPhaseKey = phaseData.phaseKey;
    renderPhase(currentPhaseKey);
  }

  /** Reescreve o card e o botão após a troca de idioma */
  function refreshLocale() {
    if (toggleTextEl) {
      toggleTextEl.textContent = isOpen ? t('lesson.close') : t('lesson.open');
    }
    if (currentPhaseKey) {
      renderPhase(currentPhaseKey);
    } else if (cardBadgeEl) {
      cardBadgeEl.textContent = t('lesson.badgeDefault');
    }
  }

  // Escreve os rótulos no idioma detectado (o HTML vem sempre em inglês)
  refreshLocale();

  return {
    update,
    setOpen,
    refreshLocale,
    isOpen: () => Boolean(cardEl) && !cardEl.hidden
  };
}
