/**
 * Mecânica orbital genérica (Leis de Kepler)
 *
 * As mesmas fórmulas valem para a Terra em torno do Sol e para a Lua em torno
 * da Terra — só muda a excentricidade. Por isso elas moram aqui, e os módulos
 * earthOrbit.js e moonOrbit.js só guardam os números de cada corpo.
 *
 * Convenção: a anomalia verdadeira é medida a partir do ponto mais próximo
 * (periélio para a Terra, perigeu para a Lua).
 */

import { normalizeAngle } from './lunarCycle.js';

/**
 * 1ª Lei: a órbita é uma elipse com o corpo central em um dos FOCOS.
 * Razão entre a distância atual e o semieixo maior:
 *   r(theta) / a = (1 - e^2) / (1 + e*cos(theta))
 * @param {number} eccentricity
 * @param {number} trueAnomaly em radianos
 * @returns {number} fator entre (1 - e) no ponto mais próximo e (1 + e) no mais distante
 */
export function ellipseRadiusFactor(eccentricity, trueAnomaly) {
  return (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(trueAnomaly));
}

/**
 * Razão entre o semieixo menor e o maior: b / a = sqrt(1 - e^2).
 * É esse número que explica por que órbitas de excentricidade pequena são
 * desenhadas como círculos: para e = 0.0167 ele vale 0.99986.
 * @param {number} eccentricity
 * @returns {number}
 */
export function semiMinorFactor(eccentricity) {
  return Math.sqrt(1 - eccentricity * eccentricity);
}

/**
 * 2ª Lei: áreas iguais em tempos iguais — o corpo corre mais rápido quando
 * está perto. Multiplicador da velocidade angular média:
 *   dtheta/dt = n * (1 + e*cos(theta))^2 / (1 - e^2)^(3/2)
 * @param {number} eccentricity
 * @param {number} trueAnomaly
 * @returns {number}
 */
export function ellipseSpeedFactor(eccentricity, trueAnomaly) {
  const k = 1 + eccentricity * Math.cos(trueAnomaly);
  return (k * k) / Math.pow(1 - eccentricity * eccentricity, 1.5);
}

/**
 * Converte a anomalia verdadeira em anomalia média (o "relógio" da órbita),
 * passando pela anomalia excêntrica:
 *   E = 2*atan( sqrt((1-e)/(1+e)) * tan(theta/2) )
 *   M = E - e*sin(E)
 * @param {number} eccentricity
 * @param {number} trueAnomaly
 * @returns {number} anomalia média em radianos [0, 2*PI)
 */
export function trueToMeanAnomaly(eccentricity, trueAnomaly) {
  const theta = normalizeAngle(trueAnomaly);
  const eccentricAnomaly = 2 * Math.atan2(
    Math.sqrt(1 - eccentricity) * Math.sin(theta / 2),
    Math.sqrt(1 + eccentricity) * Math.cos(theta / 2)
  );
  return normalizeAngle(eccentricAnomaly - eccentricity * Math.sin(eccentricAnomaly));
}
