/**
 * HUD do Visor do Telescópio da Terra (Visão Dupla)
 */

export function setupEarthViewHUD() {
  const badgeEl = document.getElementById('illumination-badge');
  const tagEl = document.getElementById('earth-pov-tag');

  /**
   * Atualiza as informações do visor da Terra
   * @param {object} phaseData
   */
  function update(phaseData) {
    if (badgeEl) {
      badgeEl.textContent = `${phaseData.illuminatedPercentage}% Iluminada`;
    }

    if (tagEl) {
      if (phaseData.phaseIndex === 0) {
        tagEl.textContent = '🌙 A Lua está no céu diurno perto do Sol (lado escuro para nós)!';
      } else if (phaseData.phaseIndex === 4) {
        tagEl.textContent = '🌟 Olhe para o céu da noite! A face visível está toda brilhante!';
      } else {
        tagEl.textContent = `🔭 Visão do céu da Terra: ${phaseData.phaseName}`;
      }
    }
  }

  return {
    update
  };
}
