import * as THREE from 'three';
import {
  createSunTexture,
  createEarthTexture,
  createMoonTexture,
  createSunGlowTexture
} from '../utils/proceduralTextures.js';

export const SUN_POSITION = new THREE.Vector3(-28, 0, 0);
export const EARTH_POSITION = new THREE.Vector3(0, 0, 0);
export const MOON_ORBIT_RADIUS = 10.5;
export const SUN_RADIUS = 3.6;
export const EARTH_RADIUS = 2.2;
export const MOON_RADIUS = 0.75;

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
  root.add(earthGroup);

  // 3. ÓRBITA DA LUA (Trajetória circular didática pontilhada)
  const orbitCurve = new THREE.EllipseCurve(
    0, 0,
    MOON_ORBIT_RADIUS, MOON_ORBIT_RADIUS,
    0, 2 * Math.PI,
    false,
    0
  );
  const orbitPoints = orbitCurve.getPoints(128);
  const orbitGeo = new THREE.BufferGeometry().setFromPoints(
    orbitPoints.map(p => new THREE.Vector3(p.x, 0, p.y))
  );
  const orbitMat = new THREE.LineDashedMaterial({
    color: 0x64b5f6,
    opacity: 0.45,
    transparent: true,
    dashSize: 0.4,
    gapSize: 0.25
  });
  const orbitLine = new THREE.Line(orbitGeo, orbitMat);
  orbitLine.computeLineDistances();
  root.add(orbitLine);

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

  // Posição inicial da Lua (na Lua Nova: x = -MOON_ORBIT_RADIUS, z = 0)
  moonMesh.position.set(-MOON_ORBIT_RADIUS, 0, 0);
  root.add(moonMesh);

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
    earthGroup,
    earthMesh,
    moonMesh,
    orbitLine,
    starField
  };
}
