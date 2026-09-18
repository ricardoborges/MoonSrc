import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EARTH_POSITION, EARTH_RADIUS } from './celestialBodies.js';

/**
 * Cria a câmera espacial principal e a câmera do telescópio terrestre
 * @param {HTMLCanvasElement} canvas
 * @returns {object} { mainCamera, earthCamera, controls }
 */
export function createCameras(canvas) {
  const aspect = window.innerWidth / window.innerHeight;

  // 1. Câmera Espacial Principal (visão cósmica 3D livre)
  const mainCamera = new THREE.PerspectiveCamera(48, aspect, 0.1, 1000);
  mainCamera.position.set(-6, 20, 24);
  mainCamera.lookAt(0, 0, 0);

  // Controles orbitais interativos com mouse/toque
  const controls = new OrbitControls(mainCamera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 6;
  controls.maxDistance = 75;
  controls.maxPolarAngle = Math.PI * 0.85; // evita girar além do polo sul
  controls.target.set(-3, 0, 0); // foca ligeiramente entre o Sol e a Terra

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
 * @param {THREE.Vector3} moonPosition
 */
export function updateEarthCamera(earthCamera, moonPosition) {
  // Posiciona a câmera na superfície da Terra voltada exatamente para a Lua
  const dir = new THREE.Vector3().subVectors(moonPosition, EARTH_POSITION).normalize();
  const surfacePos = new THREE.Vector3().copy(EARTH_POSITION).addScaledVector(dir, EARTH_RADIUS + 0.1);

  earthCamera.position.copy(surfacePos);
  earthCamera.lookAt(moonPosition);
  earthCamera.up.set(0, 1, 0);
}
