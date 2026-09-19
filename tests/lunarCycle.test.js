import { describe, it, expect } from 'vitest';
import { calculatePhase, PHASES, getPhaseByIndex, normalizeAngle } from '../src/simulation/lunarCycle.js';

describe('Simulação do Ciclo Lunar', () => {
  it('deve normalizar ângulos para o intervalo [0, 2*PI)', () => {
    expect(normalizeAngle(0)).toBeCloseTo(0, 5);
    expect(normalizeAngle(2 * Math.PI)).toBeCloseTo(0, 5);
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 5);
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 5);
  });

  it('deve identificar a Lua Nova em 0 radianos (0 graus)', () => {
    const phase = calculatePhase(0);
    expect(phase.phaseIndex).toBe(0);
    expect(phase.phaseKey).toBe('new');
    expect(phase.illuminatedFraction).toBeCloseTo(0, 1);
    expect(phase.day).toBeCloseTo(0, 1);
  });

  it('deve identificar a Crescente Côncava em PI/4 radianos (45 graus)', () => {
    const phase = calculatePhase(Math.PI / 4);
    expect(phase.phaseIndex).toBe(1);
    expect(phase.phaseKey).toBe('waxingCrescent');
    expect(phase.illuminatedFraction).toBeGreaterThan(0);
    expect(phase.illuminatedFraction).toBeLessThan(0.5);
  });

  it('deve identificar o Quarto Crescente em PI/2 radianos (90 graus)', () => {
    const phase = calculatePhase(Math.PI / 2);
    expect(phase.phaseIndex).toBe(2);
    expect(phase.phaseKey).toBe('firstQuarter');
    expect(phase.illuminatedFraction).toBeCloseTo(0.5, 1);
  });

  it('deve identificar a Gibosa Crescente em 3*PI/4 radianos (135 graus)', () => {
    const phase = calculatePhase((3 * Math.PI) / 4);
    expect(phase.phaseIndex).toBe(3);
    expect(phase.phaseKey).toBe('waxingGibbous');
    expect(phase.illuminatedFraction).toBeGreaterThan(0.5);
    expect(phase.illuminatedFraction).toBeLessThan(1);
  });

  it('deve identificar a Lua Cheia em PI radianos (180 graus)', () => {
    const phase = calculatePhase(Math.PI);
    expect(phase.phaseIndex).toBe(4);
    expect(phase.phaseKey).toBe('full');
    expect(phase.illuminatedFraction).toBeCloseTo(1, 1);
    expect(phase.day).toBeCloseTo(14.76, 1);
  });

  it('deve identificar a Gibosa Minguante em 5*PI/4 radianos (225 graus)', () => {
    const phase = calculatePhase((5 * Math.PI) / 4);
    expect(phase.phaseIndex).toBe(5);
    expect(phase.phaseKey).toBe('waningGibbous');
    expect(phase.illuminatedFraction).toBeGreaterThan(0.5);
    expect(phase.illuminatedFraction).toBeLessThan(1);
  });

  it('deve identificar o Quarto Minguante em 3*PI/2 radianos (270 graus)', () => {
    const phase = calculatePhase((3 * Math.PI) / 2);
    expect(phase.phaseIndex).toBe(6);
    expect(phase.phaseKey).toBe('lastQuarter');
    expect(phase.illuminatedFraction).toBeCloseTo(0.5, 1);
  });

  it('deve identificar a Minguante Côncava em 7*PI/4 radianos (315 graus)', () => {
    const phase = calculatePhase((7 * Math.PI) / 4);
    expect(phase.phaseIndex).toBe(7);
    expect(phase.phaseKey).toBe('waningCrescent');
    expect(phase.illuminatedFraction).toBeGreaterThan(0);
    expect(phase.illuminatedFraction).toBeLessThan(0.5);
  });

  it('deve conter as 8 fases canônicas com metadados corretos', () => {
    expect(PHASES).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      const phase = getPhaseByIndex(i);
      expect(phase).toBeDefined();
      expect(phase.key).toBeTruthy();
      expect(phase.icon).toBeTruthy();
      expect(phase.targetAngle).toBeDefined();
      expect(phase.targetDay).toBeDefined();
    }
  });
});
