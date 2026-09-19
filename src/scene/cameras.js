import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EARTH_RADIUS } from './celestialBodies.js';

/** Campo de visão vertical base da câmera espacial (antes do reenquadramento do HUD) */
export const MAIN_CAMERA_FOV = 48;

/**
 * Cria a câmera espacial principal e a câmera do telescópio terrestre
 * @param {HTMLCanvasElement} canvas
 * @returns {object} { mainCamera, earthCamera, controls }
 */
export function createCameras(canvas) {
  const aspect = window.innerWidth / window.innerHeight;

  // 1. Câmera Espacial Principal (visão cósmica 3D livre)
  const mainCamera = new THREE.PerspectiveCamera(MAIN_CAMERA_FOV, aspect, 0.1, 1000);
  mainCamera.position.set(-9, 20, 26);
  mainCamera.lookAt(-9, 0, 0);

  // Controles orbitais interativos com mouse/toque
  const controls = new OrbitControls(mainCamera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 2.5; // permite chegar perto da Lua no modo "Focar: Lua"
  controls.maxDistance = 75;
  controls.maxPolarAngle = Math.PI * 0.85; // evita girar além do polo sul
  // Enquadra o sistema inteiro: o Sol precisa caber na tela, pois é ele que
  // explica de onde vem a luz que ilumina a Lua.
  controls.target.set(-9, 0, 0);

  // 2. Câmera da Terra (Telescópio / Observatório Terrestre)
  // FOV estreito (zoom de telescópio) com proporção 1:1
  const earthCamera = new THREE.PerspectiveCamera(12, 1, 0.1, 100);
  earthCamera.position.set(-EARTH_RADIUS - 0.2, 0, 0);

  return {
    mainCamera,
    earthCamera,
    controls
  };
}

/**
 * Atualiza a posição e orientação da câmera da Terra para acompanhar a Lua
 * @param {THREE.PerspectiveCamera} earthCamera
 * @param {THREE.Vector3} moonPosition posição da Lua no mundo
 * @param {THREE.Vector3} earthPosition posição da Terra no mundo (muda com a translação)
 */
export function updateEarthCamera(earthCamera, moonPosition, earthPosition) {
  // Posiciona a câmera na superfície da Terra voltada exatamente para a Lua
  const dir = new THREE.Vector3().subVectors(moonPosition, earthPosition).normalize();
  const surfacePos = new THREE.Vector3().copy(earthPosition).addScaledVector(dir, EARTH_RADIUS + 0.1);

  earthCamera.position.copy(surfacePos);
  earthCamera.up.set(0, 1, 0);
  earthCamera.lookAt(moonPosition);
}
