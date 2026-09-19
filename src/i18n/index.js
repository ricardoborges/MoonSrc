/**
 * Módulo de internacionalização (i18n)
 *
 * Idioma padrão: inglês. Quem está no Brasil abre direto em português —
 * detectamos pelo idioma do navegador e, como reforço, pelo fuso horário
 * (alguém no Brasil com o navegador em inglês continua caindo no português).
 *
 * A escolha manual do usuário tem prioridade sobre tudo e fica salva.
 */

import en from './en.js';
import ptBR from './pt-BR.js';

export const DEFAULT_LOCALE = 'en';
export const SUPPORTED_LOCALES = ['en', 'pt-BR'];

const DICTIONARIES = {
  en,
  'pt-BR': ptBR
};

const STORAGE_KEY = 'moon-lab-locale';

/** Fusos horários IANA do Brasil: o sinal de "está no Brasil" sem pedir GPS */
const BRAZIL_TIME_ZONES = new Set([
  'America/Araguaina',
  'America/Bahia',
  'America/Belem',
  'America/Boa_Vista',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Eirunepe',
  'America/Fortaleza',
  'America/Maceio',
  'America/Manaus',
  'America/Noronha',
  'America/Porto_Velho',
  'America/Recife',
  'America/Rio_Branco',
  'America/Santarem',
  'America/Sao_Paulo'
]);

let currentLocale = DEFAULT_LOCALE;
const listeners = new Set();

/** Acesso ao storage falha em modo privativo/iframe: nunca pode derrubar a página */
function safeStorage(action) {
  try {
    return action(window.localStorage);
  } catch {
    return null;
  }
}

/** Normaliza "pt", "PT-br", "pt-PT" etc. para um código suportado (ou null) */
function normalizeLocale(tag) {
  if (!tag || typeof tag !== 'string') {
    return null;
  }
  const lower = tag.toLowerCase();
  if (lower === 'pt-br' || lower === 'pt' || lower.startsWith('pt-')) {
    return 'pt-BR';
  }
  if (lower === 'en' || lower.startsWith('en-')) {
    return 'en';
  }
  return null;
}

function isInBrazil() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return BRAZIL_TIME_ZONES.has(zone);
  } catch {
    return false;
  }
}

/**
 * Descobre o idioma inicial, em ordem de prioridade:
 * 1. ?lang=pt-BR na URL (útil para compartilhar link já traduzido)
 * 2. escolha anterior do usuário, salva no navegador
 * 3. idioma do navegador (pt* -> português)
 * 4. fuso horário brasileiro -> português
 * 5. inglês (padrão)
 */
export function detectLocale() {
  try {
    const fromQuery = normalizeLocale(new URLSearchParams(window.location.search).get('lang'));
    if (fromQuery) {
      return fromQuery;
    }
  } catch {
    // URL sem query válida: segue para os próximos sinais
  }

  const saved = normalizeLocale(safeStorage(storage => storage.getItem(STORAGE_KEY)));
  if (saved) {
    return saved;
  }

  const browserTags = (navigator.languages && navigator.languages.length)
    ? navigator.languages
    : [navigator.language];

  for (const tag of browserTags) {
    const normalized = normalizeLocale(tag);
    if (normalized) {
      return normalized;
    }
  }

  return isInBrazil() ? 'pt-BR' : DEFAULT_LOCALE;
}

export function getLocale() {
  return currentLocale;
}

/** Busca "a.b.c" no dicionário atual, caindo no inglês se a chave faltar */
function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (
    node && typeof node === 'object' ? node[part] : undefined
  ), dictionary);
}

/**
 * Traduz uma chave, substituindo {placeholders} pelos valores informados
 * @param {string} key caminho pontilhado, ex.: 'phases.full.name'
 * @param {Record<string, string|number>} [params]
 * @returns {string}
 */
export function t(key, params) {
  const value = lookup(DICTIONARIES[currentLocale], key) ?? lookup(en, key);

  if (typeof value !== 'string') {
    // Chave inexistente: devolver a própria chave deixa o erro visível na tela
    return key;
  }
  if (!params) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (match, name) => (
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match
  ));
}

/**
 * Traduz uma chave que guarda uma lista (ex.: os nomes dos meses)
 * @param {string} key
 * @returns {string[]}
 */
export function tList(key) {
  const value = lookup(DICTIONARIES[currentLocale], key) ?? lookup(en, key);
  return Array.isArray(value) ? value : [];
}

/**
 * Formata um número na convenção do idioma atual ("0.5" x "0,5")
 * @param {number} value
 * @param {number} [digits] casas decimais fixas
 * @returns {string}
 */
export function formatNumber(value, digits = 0) {
  return value.toLocaleString(currentLocale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

/**
 * Troca o idioma e avisa quem estiver ouvindo. A escolha fica salva.
 * @param {string} locale
 * @param {{persist?: boolean}} [options]
 */
export function setLocale(locale, { persist = true } = {}) {
  const normalized = normalizeLocale(locale) || DEFAULT_LOCALE;

  // Salva mesmo quando o idioma não muda: clicar no botão já ativo fixa a
  // escolha e impede que a detecção automática assuma na próxima visita.
  if (persist) {
    safeStorage(storage => storage.setItem(STORAGE_KEY, normalized));
  }

  if (normalized === currentLocale) {
    return;
  }

  currentLocale = normalized;

  applyDocumentLocale();
  listeners.forEach(listener => listener(normalized));
}

/**
 * Registra um callback para reagir à troca de idioma
 * @param {(locale: string) => void} listener
 * @returns {() => void} função para cancelar a inscrição
 */
export function onLocaleChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Atualiza lang, título e meta description — o que os buscadores e leitores de tela leem */
function applyDocumentLocale() {
  document.documentElement.lang = currentLocale;
  document.title = t('app.title');

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', t('app.description'));
  }

  applyTranslations();
}

/**
 * Aplica as traduções marcadas no HTML.
 *   data-i18n           -> textContent
 *   data-i18n-html      -> innerHTML (textos com <kbd>, <strong> etc.)
 *   data-i18n-title     -> title
 *   data-i18n-aria-label-> aria-label
 * @param {ParentNode} [root]
 */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });

  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });

  root.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
}

/**
 * Inicializa o idioma na carga da página (detecta e aplica no documento)
 * @returns {string} idioma escolhido
 */
export function initI18n() {
  currentLocale = detectLocale();
  applyDocumentLocale();
  return currentLocale;
}
