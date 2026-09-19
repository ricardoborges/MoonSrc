import * as THREE from 'three';
import {
  createCelestialBodies,
  moonOrbitPosition,
  SUN_POSITION,
  EARTH_ORBIT_SEMI_MAJOR
} from './celestialBodies.js';
import {
  radiusFactor,
  angularSpeedFactor,
  describeOrbitPosition
} from '../simulation/earthOrbit.js';
import {
  distanceKm as moonDistanceKm,
  PERIGEE_DIRECTION as MOON_PERIGEE_DIRECTION
} from '../simulation/moonOrbit.js';
import { createLighting } from './lighting.js';
import { createCameras, updateEarthCamera, MAIN_CAMERA_FOV } from './cameras.js';
import { normalizeAngle } from '../simulation/lunarCycle.js';

/** Enquadramento largo usado quando a translação da Terra está ligada */
const WIDE_SYSTEM_VIEW = { x: 0, y: 48, z: 46 };

/** Janela angular (radianos) para anunciar "perigeu"/"apogeu" no HUD */
const MOON_MARKER_TOLERANCE = 0.25;

/**
 * Enquadramento do modo "Focar: Lua", em coordenadas do referencial Terra-Lua
 * (x = lateral, y = para cima, z = da Terra para a Lua).
 *
 * O z NEGATIVO é o que importa: a câmera fica ENTRE a Terra e a Lua, e não atrás
 * dela. Assim ela vê exatamente o mesmo hemisfério que o telescópio terrestre —
 * a fase no visor 3D passa a bater com a fase do visor da Terra.
 */
const MOON_FOCUS_OFFSET = { x: 0, y: 0.45, z: -4.2 };

/** Velocidade de rotação própria (radianos por segundo) — apenas efeito visual */
const SUN_SPIN_PER_SECOND = 0.06;
const EARTH_SPIN_PER_SECOND = 0.18;

export class SceneManager {
  constructor(canvasElement, telescopeCanvasElement) {
    this.canvas = canvasElement;
    this.telescopeCanvas = telescopeCanvasElement;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050711);

    // Renderizador WebGL Principal
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Renderizador WebGL Dedicado para o Telescópio (Visão da Terra)
    if (this.telescopeCanvas) {
      this.telescopeRenderer = new THREE.WebGLRenderer({
        canvas: this.telescopeCanvas,
        antialias: true
      });
      this.telescopeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.telescopeRenderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.telescopeRenderer.toneMappingExposure = 1.1;
    }

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

    // Modo "perseguir": a câmera acompanha um corpo enquanto ele orbita
    this.followedBody = null;
    this.followSettling = false;
    this.followOffset = new THREE.Vector3();   // posição desejada em relação ao corpo
    this.followAnchor = new THREE.Vector3();   // onde o corpo estava no quadro anterior
    this.scratchVector = new THREE.Vector3();  // evita alocar Vector3 a cada quadro

    // Perseguição travada no referencial Terra-Lua: o offset da câmera gira
    // junto com a linha Terra-Lua, mantendo constante o ângulo de iluminação.
    this.followFrameLocked = false;
    this.followQuat = new THREE.Quaternion();
    this.followPrevQuat = new THREE.Quaternion();
    this.followDeltaQuat = new THREE.Quaternion();
    this.followBasis = new THREE.Matrix4();
    this.scratchOffset = new THREE.Vector3();
    this.scratchForward = new THREE.Vector3();
    this.scratchRight = new THREE.Vector3();
    this.scratchUp = new THREE.Vector3();

    // Camadas didáticas que a criança pode ligar e desligar
    this.layers = { beams: true, orbit: true };

    // Translação da Terra: desligada por padrão (a Terra fica parada no centro)
    this.earthOrbitEnabled = false;
    this.earthOrbitAngle = 0;
    this.earthReturning = false;
    this.currentFocus = 'system';
    this.moonWorldPos = new THREE.Vector3();
    this.earthWorldPos = new THREE.Vector3();
    this.scratchBody = new THREE.Vector3();

    // Os raios de luz moram no pivô do Sol para continuarem apontando à Terra
    this.bodies.sunPivot.add(this.lighting.beamGroup);

    // Área ocupada pelo HUD em cada borda: a cena é reenquadrada no espaço livre
    this.insets = { top: 0, bottom: 0, left: 0, right: 0 };

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  /**
   * Informa quanto espaço o HUD ocupa em cada borda (em pixels CSS).
   * A projeção é deslocada para que o sistema Sol-Terra-Lua fique centralizado
   * na área realmente livre da tela, e não atrás dos painéis.
   * @param {{top?: number, bottom?: number, left?: number, right?: number}} insets
   */
  setHudInsets(insets = {}) {
    this.insets = {
      top: Math.max(0, insets.top || 0),
      bottom: Math.max(0, insets.bottom || 0),
      left: Math.max(0, insets.left || 0),
      right: Math.max(0, insets.right || 0)
    };
    this.applyViewOffset();
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.applyViewOffset();

    // O visor do telescópio acompanha o tamanho real da moldura em CSS
    if (this.telescopeRenderer && this.telescopeCanvas) {
      const size = Math.max(64, Math.round(this.telescopeCanvas.clientWidth || 190));
      this.telescopeRenderer.setSize(size, size, false); // false: mantém o CSS responsivo
    }
  }

  /**
   * Recalcula a projeção da câmera principal considerando as margens do HUD.
   * Usa setViewOffset: a imagem "completa" é maior que o canvas e recortamos
   * a janela visível deslocada, o que centraliza a cena no espaço livre sem
   * distorcer a proporção nem alterar o zoom aparente.
   */
  applyViewOffset() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Limita as margens para nunca passar de metade da tela (evita FOV absurdo)
    const maxH = width * 0.4;
    const maxV = height * 0.4;
    const left = Math.min(this.insets.left, maxH);
    const right = Math.min(this.insets.right, maxH);
    const top = Math.min(this.insets.top, maxV);
    const bottom = Math.min(this.insets.bottom, maxV);

    const fullWidth = width + left + right;
    const fullHeight = height + top + bottom;

    // FOV compensado: o campo de visão visível continua equivalente ao original
    const baseHalf = Math.tan(THREE.MathUtils.degToRad(MAIN_CAMERA_FOV) / 2);
    this.mainCamera.fov = THREE.MathUtils.radToDeg(
      2 * Math.atan(baseHalf * (fullHeight / height))
    );
    this.mainCamera.aspect = fullWidth / fullHeight;

    // Deslocar a janela para baixo/direita empurra a cena para cima/esquerda
    this.mainCamera.setViewOffset(fullWidth, fullHeight, right, bottom, width, height);
    this.mainCamera.updateProjectionMatrix();
  }

  /**
   * Liga ou desliga uma camada didática da cena
   * @param {'beams' | 'orbit'} layer raios de luz do Sol ou trilha da órbita
   * @param {boolean} visible
   */
  setLayerVisible(layer, visible) {
    if (!(layer in this.layers)) {
      return;
    }
    this.layers[layer] = Boolean(visible);

    if (layer === 'beams') {
      this.lighting.beamGroup.visible = this.layers.beams;
    } else if (layer === 'orbit') {
      this.bodies.orbitLine.visible = this.layers.orbit;
      this.bodies.earthOrbitLine.visible = this.layers.orbit && this.isEarthOrbitVisible();
    }
  }

  /** A trilha da órbita da Terra só faz sentido quando ela está se movendo */
  isEarthOrbitVisible() {
    return this.earthOrbitEnabled || this.earthReturning;
  }

  /**
   * Liga/desliga a translação da Terra em torno do Sol.
   * Ao desligar, a Terra volta suavemente ao ponto de partida em vez de saltar.
   * @param {boolean} enabled
   */
  setEarthOrbitEnabled(enabled) {
    this.earthOrbitEnabled = Boolean(enabled);
    this.earthReturning = !this.earthOrbitEnabled && Math.abs(this.earthOrbitAngle) > 1e-4;
    this.bodies.earthOrbitLine.visible = this.layers.orbit && this.isEarthOrbitVisible();

    // Ao ligar, a vista "Sistema Todo" abre para caber a órbita inteira.
    // Ao desligar, o reenquadramento espera a Terra terminar de voltar ao ponto
    // de partida — senão a câmera reabriria no meio do caminho e ficaria larga.
    if (this.currentFocus === 'system' && (this.earthOrbitEnabled || !this.earthReturning)) {
      this.setCameraFocus('system');
    }
  }

  /**
   * Avança a translação junto com o ciclo lunar (a Lua dá ~12.37 voltas por ano).
   * Quem chama é o loop da simulação, então pausa e velocidade valem aqui também.
   *
   * O passo recebido é o da órbita "média" (relógio do ano). A 2ª Lei de Kepler
   * entra aqui: perto do Sol a Terra corre mais, longe ela desacelera, de modo
   * que a volta completa continua levando exatamente um ano.
   * @param {number} deltaMeanRadians avanço da anomalia média, em radianos
   */
  advanceEarthOrbit(deltaMeanRadians) {
    if (!this.earthOrbitEnabled) {
      return;
    }
    const step = deltaMeanRadians * angularSpeedFactor(this.earthOrbitAngle);
    this.earthOrbitAngle = (this.earthOrbitAngle + step) % (Math.PI * 2);
  }

  /**
   * Dados da posição atual da Terra na elipse (distância real e data do ano),
   * usados pelo HUD da translação.
   * @returns {object}
   */
  getEarthOrbitState() {
    return {
      ...describeOrbitPosition(this.earthOrbitAngle),
      visible: this.isEarthOrbitVisible()
    };
  }

  /**
   * Distância Terra-Lua do quadro atual, para o HUD do telescópio.
   * @returns {{distanceKm: number, marker: ('perigee'|'apogee'|null)}}
   */
  getMoonOrbitState() {
    const fromPerigee = normalizeAngle(
      this.currentAngle + this.earthOrbitAngle - MOON_PERIGEE_DIRECTION
    );

    let marker = null;
    if (Math.min(fromPerigee, Math.PI * 2 - fromPerigee) < MOON_MARKER_TOLERANCE) {
      marker = 'perigee';
    } else if (Math.abs(fromPerigee - Math.PI) < MOON_MARKER_TOLERANCE) {
      marker = 'apogee';
    }

    return {
      distanceKm: moonDistanceKm(this.currentAngle + this.earthOrbitAngle),
      marker
    };
  }

  /**
   * Define a posição angular da Lua na órbita (0 = Lua Nova)
   * @param {number} angleInRadians ângulo de fase, medido a partir da direção do Sol
   */
  setMoonAngle(angleInRadians) {
    this.currentAngle = angleInRadians;
    this.updateMoonPlacement();
  }

  /**
   * Coloca a Lua na elipse e aplica a rotação síncrona (Tidal Locking).
   *
   * O ângulo de FASE é medido a partir da direção do Sol; já o plano orbital
   * fica parado no espaço (a linha dos nodos não acompanha a translação). No
   * referencial desse plano, portanto, a Lua está no ângulo de fase somado ao
   * ângulo da translação — é isso que faz o perigeu e os nodos passearem pelas
   * fases ao longo do ano, em vez de cair sempre na mesma.
   */
  updateMoonPlacement() {
    const orbitAngle = this.currentAngle + this.earthOrbitAngle;

    moonOrbitPosition(orbitAngle, this.bodies.moonMesh.position);

    // Rotação sincronizada (Tidal Locking):
    // A face visível da Lua está sempre virada para a Terra!
    this.bodies.moonMesh.rotation.y = orbitAngle;

    // A câmera do telescópio é reposicionada no render, quando as matrizes do
    // pivô já estão atualizadas e as posições no mundo são confiáveis.
  }

  /**
   * Altera suavemente o foco da câmera espacial
   * @param {'system' | 'earth-moon' | 'moon'} targetType
   */
  setCameraFocus(targetType) {
    this.currentFocus = targetType;
    this.followedBody = null;
    this.followFrameLocked = false;

    if (targetType === 'system') {
      if (this.isEarthOrbitVisible()) {
        // Com a Terra viajando, abre o quadro para caber a órbita inteira
        this.targetCameraPos = new THREE.Vector3(
          SUN_POSITION.x + WIDE_SYSTEM_VIEW.x,
          WIDE_SYSTEM_VIEW.y,
          WIDE_SYSTEM_VIEW.z
        );
        this.targetCameraLookAt = SUN_POSITION.clone();
      } else {
        this.targetCameraPos = new THREE.Vector3(-9, 20, 26);
        this.targetCameraLookAt = new THREE.Vector3(-9, 0, 0);
      }
    } else if (targetType === 'earth-moon') {
      // Também persegue: com a translação ligada a Terra não fica mais na origem
      this.targetCameraPos = null;
      this.targetCameraLookAt = null;
      this.followedBody = this.bodies.earthGroup;
      this.followOffset.set(0, 14, 18);
      this.bodies.earthGroup.getWorldPosition(this.followAnchor);
      this.followSettling = true;
    } else if (targetType === 'moon') {
      // A Lua não para: em vez de mirar uma posição fixa, a câmera passa a
      // acompanhá-la pela órbita (ver updateFollow). E o enquadramento fica
      // travado no eixo Terra-Lua, do lado da Terra: a criança vê a Lua com o
      // MESMO ângulo de iluminação do telescópio terrestre, ou seja, a fase do
      // dia — o que ela gira com o mouse é um desvio a partir desse ponto.
      this.targetCameraPos = null;
      this.targetCameraLookAt = null;
      this.followedBody = this.bodies.moonMesh;
      this.followFrameLocked = true;
      this.followOffset.set(MOON_FOCUS_OFFSET.x, MOON_FOCUS_OFFSET.y, MOON_FOCUS_OFFSET.z);
      this.updateFollowFrame(true);
      this.bodies.moonMesh.getWorldPosition(this.followAnchor);
      this.followSettling = true;
    }
  }

  /**
   * Gira o pivô do Sol (translação da Terra) e mantém o eixo da Terra
   * apontando sempre para o mesmo lado do espaço — é essa inclinação fixa
   * que dá origem às estações.
   * @param {number} delta segundos desde o último quadro
   */
  updateEarthOrbit(delta) {
    if (!this.earthOrbitEnabled && this.earthReturning) {
      // Volta pelo caminho mais curto até o ponto de partida
      let diff = -this.earthOrbitAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      if (Math.abs(diff) < 0.01) {
        this.earthOrbitAngle = 0;
        this.earthReturning = false;
        this.bodies.earthOrbitLine.visible = false;
        if (this.currentFocus === 'system') {
          this.setCameraFocus('system'); // agora sim volta ao enquadramento normal
        }
      } else {
        this.earthOrbitAngle += diff * Math.min(1, delta * 2.5);
      }
    }

    this.bodies.sunPivot.rotation.y = this.earthOrbitAngle;
    this.bodies.earthAxisGroup.rotation.y = -this.earthOrbitAngle;

    // O plano orbital da Lua também não gira junto com a translação: desfazer
    // aqui a rotação do pivô deixa a linha dos nodos (e o perigeu) fixa no
    // espaço. Consequência: os alinhamentos que produzem eclipses acontecem em
    // duas temporadas por ano, e não em todo mês lunar.
    this.bodies.moonOrbitPlane.rotation.y = -this.earthOrbitAngle;
    this.updateMoonPlacement();

    // 1ª Lei de Kepler: a órbita é uma elipse com o Sol em um dos focos.
    // O pivô já cuida da direção; aqui ajustamos só a distância r(theta), que
    // vai de a(1 - e) no periélio até a(1 + e) no afélio. Como o Sol continua
    // na direção -x dentro do grupo, a matemática das fases da Lua não muda.
    this.bodies.earthSystem.position.x =
      EARTH_ORBIT_SEMI_MAJOR * radiusFactor(this.earthOrbitAngle);
  }

  /**
   * Recalcula o referencial da linha Terra-Lua e quanto ele girou desde o
   * quadro anterior. É essa rotação que a câmera travada aplica ao seu offset.
   * @param {boolean} [reset] true ao entrar no modo: zera o giro acumulado
   */
  updateFollowFrame(reset = false) {
    const forward = this.scratchForward
      .subVectors(this.moonWorldPos, this.earthWorldPos);

    if (forward.lengthSq() < 1e-8) {
      this.followDeltaQuat.identity();
      return;
    }
    forward.normalize();

    // Base ortonormal com "para cima" ancorado no eixo Y do mundo: a órbita da
    // Lua é quase horizontal (5,14° de inclinação), então não há risco de o
    // produto vetorial degenerar.
    this.scratchRight.set(0, 1, 0).cross(forward).normalize();
    this.scratchUp.copy(forward).cross(this.scratchRight).normalize();

    this.followBasis.makeBasis(this.scratchRight, this.scratchUp, forward);
    this.followQuat.setFromRotationMatrix(this.followBasis);

    if (reset) {
      this.followPrevQuat.copy(this.followQuat);
      this.followDeltaQuat.identity();
      return;
    }

    // Quanto a linha Terra-Lua girou desde o quadro anterior
    this.followDeltaQuat.copy(this.followPrevQuat).invert().premultiply(this.followQuat);
    this.followPrevQuat.copy(this.followQuat);
  }

  /**
   * Mantém a câmera junto ao corpo perseguido.
   * A aproximação inicial é feita no referencial do próprio corpo (senão a
   * interpolação nunca alcançaria um alvo em movimento). Depois disso a câmera
   * apenas acompanha o deslocamento quadro a quadro, o que preserva o ângulo
   * e o zoom que a criança escolheu girando a cena com o mouse.
   *
   * No modo travado (Focar: Lua) ela acompanha também o GIRO da linha
   * Terra-Lua, e não só o deslocamento: é isso que congela o ângulo de
   * iluminação e faz a fase bater com a do visor da Terra.
   */
  updateFollow() {
    if (!this.followedBody) {
      return;
    }

    const bodyPos = this.followedBody.getWorldPosition(this.scratchBody);

    if (this.followFrameLocked) {
      this.updateFollowFrame();
    }

    if (this.followSettling) {
      // Alvo escrito no referencial do corpo perseguido; no modo travado ele é
      // reescrito em coordenadas do mundo a cada quadro, pois o eixo gira.
      const desired = this.scratchOffset.copy(this.followOffset);
      if (this.followFrameLocked) {
        desired.applyQuaternion(this.followQuat);
      }

      const offset = this.scratchVector.subVectors(this.mainCamera.position, bodyPos);
      offset.lerp(desired, 0.08);
      this.mainCamera.position.copy(bodyPos).add(offset);
      this.controls.target.lerp(bodyPos, 0.08);

      if (offset.distanceTo(desired) < 0.08 && this.controls.target.distanceTo(bodyPos) < 0.08) {
        this.followSettling = false;
      }
    } else if (this.followFrameLocked) {
      // Gira o offset junto com a linha Terra-Lua: o ângulo de visada em
      // relação ao Sol fica congelado, então a fase vista aqui continua sendo a
      // mesma do telescópio, mês afora. O giro do mouse vira um desvio sobre
      // esse referencial, e não some no quadro seguinte.
      const offset = this.scratchVector
        .subVectors(this.mainCamera.position, bodyPos)
        .applyQuaternion(this.followDeltaQuat);
      this.mainCamera.position.copy(bodyPos).add(offset);

      const aim = this.scratchOffset
        .subVectors(this.controls.target, bodyPos)
        .applyQuaternion(this.followDeltaQuat);
      this.controls.target.copy(bodyPos).add(aim);
    } else {
      const step = this.scratchVector.subVectors(bodyPos, this.followAnchor);
      this.mainCamera.position.add(step);
      this.controls.target.add(step);
    }

    this.followAnchor.copy(bodyPos);
  }

  /**
   * Renderiza a cena com Visão Dupla (Espaço + Telescópio da Terra)
   * @param {number} delta segundos desde o último quadro
   * @param {number} spinDelta segundos de tempo simulado (0 quando pausado)
   */
  render(delta = 0, spinDelta = delta) {
    this.updateEarthOrbit(delta);

    // Posições no mundo (mudam quando a Terra translada)
    this.bodies.moonMesh.getWorldPosition(this.moonWorldPos);
    this.bodies.earthGroup.getWorldPosition(this.earthWorldPos);

    // A luz direcional do Sol precisa mirar a Terra onde quer que ela esteja
    this.lighting.sunDirLight.target.position.copy(this.earthWorldPos);
    this.lighting.sunDirLight.target.updateMatrixWorld();

    // Telescópio: da superfície da Terra apontando para a Lua
    updateEarthCamera(this.earthCamera, this.moonWorldPos, this.earthWorldPos);

    // Perseguição antes dos controles: assim o giro/zoom do usuário é aplicado
    // em torno do corpo já reposicionado, sem tranco.
    this.updateFollow();
    this.controls.update();

    // Rotação própria do Sol e da Terra: acompanha o tempo da simulação, então
    // congela junto com as órbitas quando a criança pausa
    this.bodies.sunMesh.rotation.y += SUN_SPIN_PER_SECOND * spinDelta;
    this.bodies.earthMesh.rotation.y += EARTH_SPIN_PER_SECOND * spinDelta;

    // Interpolação suave para transições de foco de câmera
    if (this.targetCameraPos && this.targetCameraLookAt) {
      this.mainCamera.position.lerp(this.targetCameraPos, 0.05);
      this.controls.target.lerp(this.targetCameraLookAt, 0.05);
      if (this.mainCamera.position.distanceTo(this.targetCameraPos) < 0.1) {
        this.targetCameraPos = null;
        this.targetCameraLookAt = null;
      }
    }

    // 1. RENDERIZAÇÃO DO ESPAÇO PRINCIPAL (Viewport Total)
    this.renderer.render(this.scene, this.mainCamera);

    // 2. RENDERIZAÇÃO DO TELESCÓPIO DA TERRA (Visão da Terra)
    if (this.telescopeRenderer) {
      // Oculta temporariamente os guias de raios solares, linha da órbita e o corpo do Sol (para não vazar no fundo da Lua Nova)
      this.lighting.beamGroup.visible = false;
      this.bodies.orbitLine.visible = false;
      this.bodies.sunGroup.visible = false;

      this.telescopeRenderer.render(this.scene, this.earthCamera);

      // Restaura a visibilidade escolhida pelo usuário para o próximo frame
      this.lighting.beamGroup.visible = this.layers.beams;
      this.bodies.orbitLine.visible = this.layers.orbit;
      this.bodies.sunGroup.visible = true;
    }
  }
}
