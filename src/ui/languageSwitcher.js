/**
 * Seletor de Idioma (EN / PT)
 *
 * São só dois idiomas, então um botão basta: ele mostra o idioma atual e o
 * clique leva para o outro. O idioma inicial vem da detecção automática
 * (navegador/fuso); clicar fixa a escolha para as próximas visitas.
 */

import { getLocale, setLocale, onLocaleChange, t } from '../i18n/index.js';

const OTHER_LOCALE = {
  en: 'pt-BR',
  'pt-BR': 'en'
};

export function setupLanguageSwitcher() {
  const btn = document.getElementById('btn-language');
  const codeEl = document.getElementById('language-code');

  if (!btn) {
    return;
  }

  function render(locale) {
    const target = OTHER_LOCALE[locale] || 'pt-BR';

    if (codeEl) {
      codeEl.textContent = t(locale === 'en' ? 'language.en' : 'language.pt');
    }

    // O rótulo descreve o que o clique faz (e já vem no idioma de destino),
    // porque o botão sozinho mostra apenas o código do idioma atual.
    const hint = t(target === 'en' ? 'language.enTitle' : 'language.ptTitle');
    btn.title = hint;
    btn.setAttribute('aria-label', hint);
    btn.lang = target;
  }

  btn.addEventListener('click', () => {
    setLocale(OTHER_LOCALE[getLocale()]);
  });

  onLocaleChange(render);
  render(getLocale());
}
