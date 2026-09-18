/**
 * Painel Educativo Lúdico para Crianças (6 a 10 anos)
 */

export function setupEducationalPanel() {
  const explanationEl = document.getElementById('phase-explanation');
  const tipEl = document.getElementById('phase-tip');
  const funFactEl = document.getElementById('phase-fun-fact');
  const cardBadgeEl = document.getElementById('card-badge');

  let currentPhaseIndex = -1;

  /**
   * Atualiza as informações do card com os dados da fase atual
   * @param {object} phaseData
   */
  function update(phaseData) {
    if (currentPhaseIndex === phaseData.phaseIndex) {
      return; // evita reflow desnecessário se a fase continuar a mesma
    }
    currentPhaseIndex = phaseData.phaseIndex;

    if (cardBadgeEl) {
      cardBadgeEl.textContent = `✨ ${phaseData.phaseName} • Dia ${phaseData.day.toFixed(1)}`;
    }

    if (explanationEl) {
      explanationEl.textContent = phaseData.description;
    }

    if (tipEl) {
      tipEl.textContent = phaseData.tip;
    }

    if (funFactEl) {
      funFactEl.textContent = phaseData.funFact;
    }
  }

  return {
    update
  };
}
