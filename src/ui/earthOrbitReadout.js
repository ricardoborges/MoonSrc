/**
 * Indicador da Órbita da Terra
 * Só aparece com a translação ligada: mostra a distância real até o Sol e a
 * época do ano, que é o único jeito de perceber que a órbita é uma elipse —
 * o desenho dela é quase um círculo perfeito.
 */

import { PERIHELION_MKM, APHELION_MKM } from '../simulation/earthOrbit.js';
import { t, formatNumber } from '../i18n/index.js';

export function setupEarthOrbitReadout() {
  const rootEl = document.getElementById('earth-orbit-readout');
  const distanceEl = document.getElementById('orbit-distance');
  const dateEl = document.getElementById('orbit-date');
  const markerEl = document.getElementById('orbit-marker');

  let lastDistanceText = '';
  let lastDateText = '';
  let lastMarker = 'init';
  let lastVisible = null;
  let lastState = null;

  /**
   * @param {{visible: boolean, distanceMkm: number, dateLabel: string, marker: string|null}} state
   */
  function update(state) {
    if (!rootEl) {
      return;
    }

    lastState = state;

    if (state.visible !== lastVisible) {
      lastVisible = state.visible;
      rootEl.hidden = !state.visible;
    }
    if (!state.visible) {
      return;
    }

    // A distância muda devagar: só mexemos no DOM quando o texto realmente muda
    const distanceText = t('orbitReadout.distance', { value: formatNumber(state.distanceMkm, 1) });
    if (distanceEl && distanceText !== lastDistanceText) {
      lastDistanceText = distanceText;
      distanceEl.textContent = distanceText;
    }

    const dateText = t('orbitReadout.date', { date: state.dateLabel });
    if (dateEl && dateText !== lastDateText) {
      lastDateText = dateText;
      dateEl.textContent = dateText;
    }

    if (markerEl && state.marker !== lastMarker) {
      lastMarker = state.marker;
      markerEl.hidden = !state.marker;
      markerEl.textContent = state.marker === 'perihelion'
        ? t('orbitReadout.perihelion', { value: formatNumber(PERIHELION_MKM, 1) })
        : state.marker === 'aphelion'
          ? t('orbitReadout.aphelion', { value: formatNumber(APHELION_MKM, 1) })
          : '';
    }
  }

  /** Reescreve os textos do indicador após a troca de idioma */
  function refreshLocale() {
    lastDistanceText = '';
    lastDateText = '';
    lastMarker = 'init';
    if (lastState) {
      update(lastState);
    }
  }

  return { update, refreshLocale };
}
