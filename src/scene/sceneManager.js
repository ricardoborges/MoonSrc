import * as THREE from 'three';
import { createCelestialBodies, MOON_ORBIT_RADIUS, SUN_POSITION } from './celestialBodies.js';
import { createLighting } from './lighting.js';
import { createCameras, updateEarthCamera } from './cameras.js';

export class SceneManager {
  constructor(canvasElement, telescopeAnchorElement) {
    this.canvas = canvasElement;
    this.telescopeAnchor = telescopeAnchorElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050711);

    // Renderizador WebGL
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Inicialização de Corpos Celestes e Luzes
    this.bodies = createCelestialBodies();
    this.scene.add(this.bodies.root);

    this.lighting = createLighting(SUN_POSITION);
    this.scene.add(this.lighting.group);

    // Câmeras
    const { mainCamera, earthCamera, controls } = createCameras(this.canvas);
    this.mainCamera = mainCamera;
    this.earthCamera = earthCamera;
    this.controls = controls;

    this.currentAngle = 0;
    this.targetCameraPos = null;
    this.targetCameraLookAt = null;

    this.setupResizeListener();
  }

  setupResizeListener() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.mainCamera.aspect = width / height;
      this.mainCamera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    });
  }

  /**
   * Define a posição angular da Lua na órbita e aplica rotação síncrona (Tidal Locking)
   * @param {number} angleInRadians
   */
  setMoonAngle(angleInRadians) {
    this.currentAngle = angleInRadians;

    // Em angle = 0 (Lua Nova), Lua fica entre Sol (-28) e Terra (0) -> x = -MOON_ORBIT_RADIUS, z = 0
    const x = -MOON_ORBIT_RADIUS * Math.cos(angleInRadians);
    const z = MOON_ORBIT_RADIUS * Math.sin(angleInRadians);
    this.bodies.moonMesh.position.set(x, 0, z);

    // Rotação sincronizada (Tidal Locking):
    // A face visível da Lua está sempre virada para a Terra!
    this.bodies.moonMesh.rotation.y = angleInRadians;

    // Rotação do Sol e da Terra nos próprios eixos
    this.bodies.sunMesh.rotation.y += 0.001;
    this.bodies.earthMesh.rotation.y += 0.003;

    // Atualiza a câmera telescópica apontando da Terra para a Lua
    updateEarthCamera(this.earthCamera, this.bodies.moonMesh.position);
  }

  /**
   * Altera suavemente o foco da câmera espacial
   * @param {'system' | 'earth-moon' | 'moon'} targetType
   */
  setCameraFocus(targetType) {
    if (targetType === 'system') {
      this.targetCameraPos = new THREE.Vector3(-6, 20, 24);
      this.targetCameraLookAt = new THREE.Vector3(-3, 0, 0);
    } else if (targetType === 'earth-moon') {
      this.targetCameraPos = new THREE.Vector3(0, 14, 18);
      this.targetCameraLookAt = new THREE.Vector3(0, 0, 0);
    } else if (targetType === 'moon') {
      const moonPos = this.bodies.moonMesh.position;
      this.targetCameraPos = new THREE.Vector3(moonPos.x, 3.5, moonPos.z + 5.5);
      this.targetCameraLookAt = moonPos.clone();
    }
  }

  /**
   * Renderiza a cena com Visão Dupla (Espaço + Telescópio da Terra)
   */
  render() {
    this.controls.update();

    // Interpolação suave para transições de foco de câmera
    if (this.targetCameraPos && this.targetCameraLookAt) {
      this.mainCamera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetCameraLookAt, 0.05);
      if (this.mainCamera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.targetCameraPos = null;
        this.targetCameraLookAt = null;
      }
    }

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // 1. RENDERIZAÇÃO DO ESPAÇO PRINCIPAL (Viewport Total)
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, width, height);
    this.renderer.render(this.scene, this.mainCamera);

    // 2. RENDERIZAÇÃO DO VIEWPORT DO TELESCÓPIO DA TERRA (Picture-in-Picture)
    if (this.telescopeAnchor) {
      const rect = this.telescopeAnchor.getBoundingClientRect();

      // Verifica se o elemento âncora é visível
      if (rect.width > 0 && rect.height > 0) {
        // Conversão de coordenadas DOM para coordenadas de Scissor do WebGL (Y invertido)
        const scissorX = Math.floor(rect.left);
        const scissorY = Math.floor(height - rect.bottom);
        const scissorWidth = Math.floor(rect.width);
        const scissorHeight = Math.floor(rect.height);

        this.earthCamera.aspect = scissorWidth / scissorHeight;
        this.earthCamera.updateProjectionMatrix();

        // Oculta temporariamente os raios solares e a linha de órbita para visão limpa do telescópio
        this.lighting.beamGroup.visible = false;
        this.bodies.orbitLine.visible = false;

        this.renderer.setScissorTest(true);
        this.renderer.setScissor(scissorX, scissorY, scissorWidth, scissorHeight);
        this.renderer.setViewport(scissorX, scissorY, scissorWidth, scissorHeight);

        this.renderer.render(this.scene, this.earthCamera);

        // Restaura a visibilidade dos guias para o próximo frame da câmera espacial
        this.lighting.beamGroup.visible = true;
        this.bodies.orbitLine.visible = true;
        this.renderer.setScissorTest(false);
      }
    }
  }
}
