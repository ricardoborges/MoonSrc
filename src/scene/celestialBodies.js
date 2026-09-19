import * as THREE from 'three';
import { radiusFactor } from '../simulation/earthOrbit.js';
import {
  radiusFactor as moonRadiusFactor,
  INCLINATION_DEGREES as MOON_INCLINATION_DEGREES
} from '../simulation/moonOrbit.js';
import {
  createSunTexture,
  createEarthTexture,
  createMoonTexture,
  createSunGlowTexture
} from '../utils/proceduralTextures.js';

/** Semieixo maior da órbita da Terra, em unidades da cena (equivale a 1 UA) */
export const EARTH_ORBIT_SEMI_MAJOR = 28;
/** Distância Sol-Terra no periélio: a(1 - e), o ponto de partida da simulação */
export const EARTH_PERIHELION_DISTANCE = EARTH_ORBIT_SEMI_MAJOR * radiusFactor(0);
/** O Sol fica em um FOCO da elipse, não no centro — por isso a distância do periélio */
export const SUN_POSITION = new THREE.Vector3(-EARTH_PERIHELION_DISTANCE, 0, 0);
/** Posição da Terra DENTRO do sistema Terra-Lua (o grupo é que se move ao redor do Sol) */
export const EARTH_POSITION = new THREE.Vector3(0, 0, 0);
/** Semieixo maior da órbita da Lua, em unidades da cena */
export const MOON_ORBIT_SEMI_MAJOR = 10.5;
export const SUN_RADIUS = 3.6;
export const EARTH_RADIUS = 2.2;
export const MOON_RADIUS = 0.75;

/**
 * Posição da Lua DENTRO do plano orbital (grupo moonOrbitTilt), para um ângulo
 * medido no referencial fixo da órbita. A Terra fica no foco da elipse, então a
 * distância muda com o ângulo: perto no perigeu, longe no apogeu.
 * @param {number} orbitAngle
 * @param {THREE.Vector3} [target] vetor reaproveitado (evita alocar por quadro)
 * @returns {THREE.Vector3}
 */
export function moonOrbitPosition(orbitAngle, target = new THREE.Vector3()) {
  const r = MOON_ORBIT_SEMI_MAJOR * moonRadiusFactor(orbitAngle);
  // Em ângulo 0 a Lua fica entre o Sol (-x) e a Terra (origem): é a Lua Nova
  return target.set(-r * Math.cos(orbitAngle), 0, r * Math.sin(orbitAngle));
}

/**
 * Constrói todos os corpos celestes do sistema didático
 * @returns {object}
 */
export function createCelestialBodies() {
  const root = new THREE.Group();
  root.name = 'CelestialRoot';

  // 1. SOL (Esfera emissiva + Sprite de Corona Glow)
  const sunGroup = new THREE.Group();
  sunGroup.position.copy(SUN_POSITION);

  const sunGeo = new THREE.SphereGeometry(SUN_RADIUS, 48, 48);
  const sunTex = createSunTexture();
  const sunMat = new THREE.MeshBasicMaterial({
    map: sunTex
  });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.name = 'Sun';
  sunGroup.add(sunMesh);

  // Halo de brilho externo do Sol
  const glowTex = createSunGlowTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });
  const glowSprite = new THREE.Sprite(glowMat);
  glowSprite.scale.set(SUN_RADIUS * 4.5, SUN_RADIUS * 4.5, 1);
  sunGroup.add(glowSprite);

  root.add(sunGroup);

  // 1b. PIVÔ DA TRANSLAÇÃO
  // Todo o sistema Terra-Lua vive dentro de um grupo girado em torno do Sol.
  // Assim, ligar a translação não muda nada na matemática das fases: dentro
  // desse grupo o Sol continua sempre na direção -x.
  const sunPivot = new THREE.Group();
  sunPivot.name = 'SunPivot';
  sunPivot.position.copy(SUN_POSITION);
  root.add(sunPivot);

  const earthSystem = new THREE.Group();
  earthSystem.name = 'EarthSystem';
  // No periélio (ângulo 0) a Terra nasce exatamente na origem do mundo.
  // O SceneManager reescreve esse x a cada quadro seguindo r(theta).
  earthSystem.position.set(EARTH_PERIHELION_DISTANCE, 0, 0);
  sunPivot.add(earthSystem);

  // 2. TERRA (No centro, com inclinação axial e atmosfera sutil)
  const earthGroup = new THREE.Group();
  earthGroup.position.copy(EARTH_POSITION);

  // Inclinação axial de ~23.4 graus
  const earthAxisGroup = new THREE.Group();
  earthAxisGroup.rotation.z = THREE.MathUtils.degToRad(23.4);

  const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
  const earthTex = createEarthTexture();
  const earthMat = new THREE.MeshStandardMaterial({
    map: earthTex,
    roughness: 0.8,
    metalness: 0.1
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  earthMesh.name = 'Earth';
  earthAxisGroup.add(earthMesh);

  // Brilho atmosférico azul sutil ao redor da Terra
  const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.03, 48, 48);
  const atmosMat = new THREE.MeshBasicMaterial({
    color: 0x4da6ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  });
  const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
  earthAxisGroup.add(atmosMesh);

  earthGroup.add(earthAxisGroup);
  earthSystem.add(earthGroup);

  // 3. PLANO ORBITAL DA LUA (dois grupos aninhados, cada um com um papel)
  //
  //  - moonOrbitPlane: o SceneManager cancela nele a translação da Terra, de
  //    modo que a linha dos nodos fique PARADA no espaço, como na natureza.
  //    É isso que faz as temporadas de eclipse acontecerem duas vezes por ano
  //    em vez de todo mês.
  //  - moonOrbitTilt: inclina o plano em 5,14° em relação ao plano Terra-Sol.
  const moonOrbitPlane = new THREE.Group();
  moonOrbitPlane.name = 'MoonOrbitPlane';
  earthSystem.add(moonOrbitPlane);

  const moonOrbitTilt = new THREE.Group();
  moonOrbitTilt.name = 'MoonOrbitTilt';
  // Inclinação em torno de Z: os nodos (onde a órbita cruza o plano Terra-Sol)
  // ficam no eixo Z, perpendiculares à direção do Sol. A simulação começa,
  // portanto, num mês SEM eclipses: na Lua Nova a Lua passa por baixo do Sol.
  moonOrbitTilt.rotation.z = THREE.MathUtils.degToRad(MOON_INCLINATION_DEGREES);
  moonOrbitPlane.add(moonOrbitTilt);

  // 3b. ÓRBITA DA LUA (elipse pontilhada com a Terra em um dos focos)
  const MOON_ORBIT_SEGMENTS = 160;
  const orbitPoints = [];
  for (let i = 0; i <= MOON_ORBIT_SEGMENTS; i++) {
    orbitPoints.push(moonOrbitPosition((i / MOON_ORBIT_SEGMENTS) * Math.PI * 2));
  }
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMat = new THREE.LineDashedMaterial({
    color: 0x64b5f6,
    opacity: 0.45,
    transparent: true,
    dashSize: 0.4,
    gapSize: 0.25
  });
  const orbitLine = new THREE.Line(orbitGeo, orbitMat);
  orbitLine.computeLineDistances();
  moonOrbitTilt.add(orbitLine);

  // 4. LUA
  const moonGeo = new THREE.SphereGeometry(MOON_RADIUS, 48, 48);
  const moonTex = createMoonTexture();
  const moonMat = new THREE.MeshStandardMaterial({
    map: moonTex,
    roughness: 0.9,
    metalness: 0.05
  });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.name = 'Moon';

  // Posição inicial da Lua (Lua Nova, ângulo 0)
  moonOrbitPosition(0, moonMesh.position);
  moonOrbitTilt.add(moonMesh);

  // 4b. ÓRBITA DA TERRA (só aparece quando a translação é ligada)
  // Elipse de Kepler traçada pela fórmula polar r(theta), com o Sol no foco.
  // Como e = 0.0167, o desenho sai quase idêntico a um círculo — e é exatamente
  // assim que a órbita real é: a "elipse bem esticada" dos livros é um exagero.
  const EARTH_ORBIT_SEGMENTS = 240;
  const earthOrbitPoints = [];
  for (let i = 0; i <= EARTH_ORBIT_SEGMENTS; i++) {
    const theta = (i / EARTH_ORBIT_SEGMENTS) * Math.PI * 2;
    const r = EARTH_ORBIT_SEMI_MAJOR * radiusFactor(theta);
    // O pivô gira em torno de Y: o ângulo theta cresce de +x na direção de -z
    earthOrbitPoints.push(new THREE.Vector3(r * Math.cos(theta), 0, -r * Math.sin(theta)));
  }
  const earthOrbitGeo = new THREE.BufferGeometry().setFromPoints(earthOrbitPoints);
  const earthOrbitLine = new THREE.Line(earthOrbitGeo, new THREE.LineDashedMaterial({
    color: 0xfbbf24,
    opacity: 0.35,
    transparent: true,
    dashSize: 1.2,
    gapSize: 0.9
  }));
  earthOrbitLine.computeLineDistances();
  earthOrbitLine.position.copy(SUN_POSITION);
  earthOrbitLine.visible = false;
  root.add(earthOrbitLine);

  // 5. CAMPO ESTELAR PROFUNDO (Stars Background)
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 2200;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);

  const starColorPalette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xdce7ff),
    new THREE.Color(0xfff0c2),
    new THREE.Color(0x9fc5e8)
  ];

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 90 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    starPositions[i3 + 2] = r * Math.cos(phi);

    const c = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
    starColors[i3] = c.r;
    starColors[i3 + 1] = c.g;
    starColors[i3 + 2] = c.b;
  }

  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starsGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

  const starsMat = new THREE.PointsMaterial({
    size: 0.9,
    vertexColors: true,
    transparent: true,
    opacity: 0.85
  });
  const starField = new THREE.Points(starsGeo, starsMat);
  starField.name = 'StarField';
  root.add(starField);

  return {
    root,
    sunGroup,
    sunMesh,
    sunPivot,
    earthSystem,
    earthGroup,
    earthAxisGroup,
    earthMesh,
    moonOrbitPlane,
    moonOrbitTilt,
    moonMesh,
    orbitLine,
    earthOrbitLine,
    starField
  };
}
