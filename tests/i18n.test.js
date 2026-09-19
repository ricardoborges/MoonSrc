import { describe, it, expect } from 'vitest';
import en from '../src/i18n/en.js';
import ptBR from '../src/i18n/pt-BR.js';
import { t, tList, formatNumber, getLocale, DEFAULT_LOCALE } from '../src/i18n/index.js';
import { PHASES } from '../src/simulation/lunarCycle.js';
import { formatDayOfYear } from '../src/simulation/earthOrbit.js';

/** Lista todos os caminhos de chave de um dicionário ('a.b.c') */
function collectKeys(node, prefix = '') {
  if (Array.isArray(node)) {
    return [`${prefix}[]`];
  }
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) => (
      collectKeys(value, prefix ? `${prefix}.${key}` : key)
    ));
  }
  return [prefix];
}

describe('Dicionários de idioma', () => {
  it('deve ter exatamente as mesmas chaves em inglês e português', () => {
    const enKeys = collectKeys(en).sort();
    const ptKeys = collectKeys(ptBR).sort();

    expect(ptKeys).toEqual(enKeys);
  });

  it('deve ter textos para as 8 fases nos dois idiomas', () => {
    for (const dictionary of [en, ptBR]) {
      for (const phase of PHASES) {
        const texts = dictionary.phases[phase.key];
        expect(texts, `fase ${phase.key}`).toBeDefined();
        expect(texts.name).toBeTruthy();
        expect(texts.shortName).toBeTruthy();
        expect(texts.description).toBeTruthy();
        expect(texts.tip).toBeTruthy();
        expect(texts.funFact).toBeTruthy();
      }
    }
  });

  it('deve ter 12 meses nos dois idiomas', () => {
    expect(en.months).toHaveLength(12);
    expect(ptBR.months).toHaveLength(12);
  });
});

describe('Tradução', () => {
  it('deve começar em inglês (idioma padrão)', () => {
    expect(getLocale()).toBe(DEFAULT_LOCALE);
    expect(getLocale()).toBe('en');
    expect(t('phases.full.name')).toBe('Full Moon');
  });

  it('deve substituir os parâmetros entre chaves', () => {
    expect(t('telescope.illuminated', { percent: 42 })).toBe('42% Lit');
    expect(t('timeline.day', { day: '7.5' })).toBe('Day 7.5');
  });

  it('deve devolver a própria chave quando ela não existe', () => {
    expect(t('nao.existe')).toBe('nao.existe');
  });

  it('deve devolver listas com tList e vazio para chave inválida', () => {
    expect(tList('months')[0]).toBe('January');
    expect(tList('brand.title')).toEqual([]);
  });

  it('deve formatar números na convenção do idioma ativo', () => {
    expect(formatNumber(7.5, 1)).toBe('7.5');
    expect(formatNumber(384000)).toBe('384,000');
  });

  it('deve escrever a data por extenso em inglês', () => {
    expect(formatDayOfYear(4)).toBe('January 4');
    expect(formatDayOfYear(186)).toBe('July 5');
  });
});
