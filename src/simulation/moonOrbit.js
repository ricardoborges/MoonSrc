/**
 * Módulo da Órbita da Lua em torno da Terra
 *
 * Dois fatos que a versão puramente circular não contava:
 *
 * 1) A órbita é uma elipse com a Terra em um FOCO (e = 0.0549, três vezes a da
 *    Terra em torno do Sol). O formato ainda é quase um círculo (b/a = 0.9985),
 *    mas a DISTÂNCIA varia 11,6% entre o perigeu e o apogeu — é isso que faz a
 *    Lua Cheia parecer maior em algumas noites ("superlua").
 *
 * 2) O plano da órbita é inclinado ~5,14° em relação ao plano Terra-Sol. Sem
 *    essa inclinação haveria eclipse solar em TODA Lua Nova e eclipse lunar em
 *    TODA Lua Cheia. Como o plano é inclinado, os eclipses só acontecem quando
 *    a Lua cruza a linha dos nodos (onde os dois planos se encontram) bem na
 *    hora da Lua Nova ou Cheia — o que ocorre em duas "temporadas" por ano.
 */

import { ellipseRadiusFactor, semiMinorFactor } from './kepler.js';

/** Excentricidade média da órbita lunar */
export const ECCENTRICITY = 0.0549;

/** Semieixo maior, em km */
export const SEMI_MAJOR_AXIS_KM = 384400;

/** b/a = 0.9985: no desenho a elipse é indistinguível de um círculo */
export const SEMI_MINOR_FACTOR = semiMinorFactor(ECCENTRICITY);

/** Distância Terra-Lua nos extremos, em km */
export const PERIGEE_KM = SEMI_MAJOR_AXIS_KM * (1 - ECCENTRICITY);
export const APOGEE_KM = SEMI_MAJOR_AXIS_KM * (1 + ECCENTRICITY);

/** Inclinação do plano orbital em relação à eclíptica (plano Terra-Sol) */
export const INCLINATION_DEGREES = 5.145;

/**
 * Direção do perigeu dentro do plano orbital, medida no referencial FIXO da
 * órbita (o mesmo em que a linha dos nodos não gira).
 *
 * Escolhida em PI/2 de propósito: assim o ponto mais próximo não cai nem na Lua
 * Nova nem na Cheia, evitando ensinar que "toda Lua Cheia é superlua". Com a
 * translação ligada, o perigeu passeia por todas as fases ao longo do ano —
 * na natureza esse passeio leva 411 dias (o "ciclo da Lua Cheia"), aqui leva
 * um ano; a linha das apsides real também precessa, em 8,85 anos.
 */
export const PERIGEE_DIRECTION = Math.PI / 2;

/**
 * Razão entre a distância atual e o semieixo maior, para um ponto da órbita
 * @param {number} orbitAngle ângulo da Lua no referencial fixo da órbita
 * @returns {number} entre 1 - e (perigeu) e 1 + e (apogeu)
 */
export function radiusFactor(orbitAngle) {
  return ellipseRadiusFactor(ECCENTRICITY, orbitAngle - PERIGEE_DIRECTION);
}

/**
 * Distância Terra-Lua em km para um ponto da órbita
 * @param {number} orbitAngle
 * @returns {number}
 */
export function distanceKm(orbitAngle) {
  return SEMI_MAJOR_AXIS_KM * radiusFactor(orbitAngle);
}
