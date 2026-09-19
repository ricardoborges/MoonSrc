/**
 * HUD do Visor do Telescópio da Terra (Visão Dupla)
 */

import { t, formatNumber } from '../i18n/index.js';

export function setupEarthViewHUD() {
  const badgeEl = document.getElementById('illumination-badge');
  const tagEl = document.getElementById('earth-pov-tag');
  const distanceEl = document.getElementById('moon-distance-badge');

  let lastDistanceText = '';
  let lastPhaseData = null;
  let lastDistanceState = null;

  /**
   * Atualiza as informações do visor da Terra
   * @param {object} phaseData
   */
  function update(phaseData) {
    lastPhaseData = phaseData;

    if (badgeEl) {
      badgeEl.textContent = t('telescope.illuminated', { percent: phaseData.illuminatedPercentage });
    }

    if (tagEl) {
      if (phaseData.phaseIndex === 0) {
        tagEl.textContent = t('telescope.povNew');
      } else if (phaseData.phaseIndex === 4) {
        tagEl.textContent = t('telescope.povFull');
      } else {
        tagEl.textContent = t('telescope.povDefault', { phase: t(`phases.${phaseData.phaseKey}.name`) });
      }
    }
  }

  /**
   * Mostra a distância Terra-Lua do quadro atual. Como a órbita é uma elipse
   * com a Terra em um foco, ela varia 11,6% entre o perigeu e o apogeu — é por
   * isso que a Lua muda de tamanho aparente no visor.
   * @param {{distanceKm: number, marker: ('perigee'|'apogee'|null)}} state
   */
  function updateDistance(state) {
    if (!distanceEl) {
      return;
    }

    lastDistanceState = state;

    // Arredondado na casa do milhar: a precisão de km não significa nada aqui
    const rounded = Math.round(state.distanceKm / 1000) * 1000;
    const key = state.marker === 'perigee'
      ? 'telescope.distancePerigee'
      : state.marker === 'apogee'
        ? 'telescope.distanceApogee'
        : 'telescope.distance';
    const text = t(key, { distance: formatNumber(rounded) });

    if (text !== lastDistanceText) {
      lastDistanceText = text;
      distanceEl.textContent = text;
      distanceEl.classList.toggle('is-extreme', Boolean(state.marker));
    }
  }

  /** Reescreve os textos do visor após a troca de idioma */
  function refreshLocale() {
    if (lastPhaseData) {
      update(lastPhaseData);
    }
    if (lastDistanceState) {
      lastDistanceText = ''; // força a reescrita com o novo separador de milhar
      updateDistance(lastDistanceState);
    }
  }

  return {
    update,
    updateDistance,
    refreshLocale
  };
}
