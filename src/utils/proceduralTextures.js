import * as THREE from 'three';

/**
 * Cria a textura procedural de alta fidelidade do Sol
 * @param {number} width
 * @param {number} height
 * @returns {THREE.CanvasTexture}
 */
export function createSunTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Gradiente de fundo do Sol (incandescência solar)
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  baseGrad.addColorStop(0, '#ff9900');
  baseGrad.addColorStop(0.3, '#ffcc00');
  baseGrad.addColorStop(0.7, '#ff6600');
  baseGrad.addColorStop(1, '#ffaa00');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // Granulação e convecção solar (células de convecção)
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const radius = 2 + Math.random() * 12;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
    grad.addColorStop(0.6, 'rgba(255, 170, 20, 0.25)');
    grad.addColorStop(1, 'rgba(255, 80, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Manchas solares (zonas magnéticas mais frias)
  for (let s = 0; s < 18; s++) {
    const sx = Math.random() * width;
    const sy = height * 0.25 + Math.random() * (height * 0.5); // concentradas na zona equatorial
    const sRadius = 5 + Math.random() * 14;

    const spotGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sRadius);
    spotGrad.addColorStop(0, '#5a1200'); // umbra
    spotGrad.addColorStop(0.5, '#993300'); // penumbra
    spotGrad.addColorStop(1, 'rgba(255, 140, 0, 0)');

    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, sRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cria a textura procedural da Terra com continentes, oceanos, gelo e nuvens
 * @param {number} width
 * @param {number} height
 * @returns {THREE.CanvasTexture}
 */
export function createEarthTexture(width = 2048, height = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Oceano azul profundo com variações de profundidade
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#0c2656');
  oceanGrad.addColorStop(0.5, '#12418a');
  oceanGrad.addColorStop(1, '#0c2656');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Marés e plataformas continentais rasas (azul turquesa)
  ctx.fillStyle = 'rgba(24, 112, 172, 0.4)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * width;
    const y = height * 0.15 + Math.random() * (height * 0.7);
    const r = 20 + Math.random() * 60;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Função auxiliar para desenhar massas de terra continentais
  function drawContinent(cx, cy, rx, ry, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const points = 16;
    for (let p = 0; p <= points; p++) {
      const angle = (p / points) * Math.PI * 2;
      const noise = 0.75 + Math.sin(p * 3.5) * 0.2 + Math.cos(p * 2.1) * 0.15;
      const x = cx + Math.cos(angle) * rx * noise;
      const y = cy + Math.sin(angle) * ry * noise;
      if (p === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Grandes Massas Continentais
  // Américas (Norte e Sul)
  drawContinent(width * 0.28, height * 0.35, 120, 100, '#2d7a38'); // América do Norte
  drawContinent(width * 0.32, height * 0.65, 95, 140, '#21632a');  // América do Sul
  // Eurásia
  drawContinent(width * 0.62, height * 0.30, 240, 110, '#387c3a'); // Europa e Ásia
  // África
  drawContinent(width * 0.54, height * 0.55, 110, 130, '#5a782a'); // África central/sul
  drawContinent(width * 0.53, height * 0.42, 90, 60, '#8c7b3e');   // Saara
  // Oceania / Austrália
  drawContinent(width * 0.82, height * 0.70, 80, 65, '#8c6b32');
  // Ilhas e arquipélagos menores
  for (let k = 0; k < 60; k++) {
    const ix = Math.random() * width;
    const iy = height * 0.2 + Math.random() * (height * 0.6);
    drawContinent(ix, iy, 15 + Math.random() * 25, 10 + Math.random() * 20, '#2e6b2c');
  }

  // Calotas polares (Ártico e Antártica)
  const polarGradNorth = ctx.createLinearGradient(0, 0, 0, height * 0.15);
  polarGradNorth.addColorStop(0, '#ffffff');
  polarGradNorth.addColorStop(0.7, '#e0f2fe');
  polarGradNorth.addColorStop(1, 'rgba(224, 242, 254, 0)');
  ctx.fillStyle = polarGradNorth;
  ctx.fillRect(0, 0, width, height * 0.15);

  const polarGradSouth = ctx.createLinearGradient(0, height * 0.85, 0, height);
  polarGradSouth.addColorStop(0, 'rgba(224, 242, 254, 0)');
  polarGradSouth.addColorStop(0.3, '#e0f2fe');
  polarGradSouth.addColorStop(1, '#ffffff');
  ctx.fillStyle = polarGradSouth;
  ctx.fillRect(0, height * 0.85, width, height * 0.15);

  // Faixas suaves de nuvens brancas translúcidas
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let c = 0; c < 300; c++) {
    const cx = Math.random() * width;
    const cy = height * 0.1 + Math.random() * (height * 0.8);
    const crx = 30 + Math.random() * 90;
    const cry = 10 + Math.random() * 25;
    ctx.beginPath();
    ctx.ellipse(cx, cy, crx, cry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cria a textura procedural da Lua com crateras de impacto e mares lunares
 * @param {number} width
 * @param {number} height
 * @returns {THREE.CanvasTexture}
 */
export function createMoonTexture(width = 1024, height = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Base de rególito lunar (cinza médio rochoso)
  ctx.fillStyle = '#9e9fa5';
  ctx.fillRect(0, 0, width, height);

  // Micro-textura de ruído de rochas
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const brightness = Math.random() > 0.5 ? 170 : 130;
    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
    ctx.fillRect(x, y, size, size);
  }

  // Mares Lunares (Mare Tranquillitatis, Mare Imbrium, etc. - grandes planícies de basalto escuras)
  const mariaLocations = [
    { x: width * 0.35, y: height * 0.40, rx: 90, ry: 70 },
    { x: width * 0.45, y: height * 0.35, rx: 110, ry: 80 },
    { x: width * 0.48, y: height * 0.55, rx: 80, ry: 60 },
    { x: width * 0.28, y: height * 0.52, rx: 70, ry: 50 },
    { x: width * 0.80, y: height * 0.38, rx: 60, ry: 45 }
  ];

  mariaLocations.forEach(m => {
    const mGrad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, Math.max(m.rx, m.ry));
    mGrad.addColorStop(0, 'rgba(80, 82, 88, 0.7)');
    mGrad.addColorStop(0.7, 'rgba(95, 97, 102, 0.5)');
    mGrad.addColorStop(1, 'rgba(158, 159, 165, 0)');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.ellipse(m.x, m.y, m.rx, m.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Crateras de impacto detalhadas (centro escuro + anel brilhante com relevo)
  for (let c = 0; c < 220; c++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const radius = 3 + Math.random() * 16;

    // Anel brilhante da borda da cratera
    ctx.strokeStyle = 'rgba(230, 232, 238, 0.6)';
    ctx.lineWidth = Math.max(1, radius * 0.25);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Sombra interna no fundo da cratera
    const pitGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius);
    pitGrad.addColorStop(0, '#595a60');
    pitGrad.addColorStop(0.8, '#707278');
    pitGrad.addColorStop(1, 'rgba(158, 159, 165, 0)');

    ctx.fillStyle = pitGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Raios de impacto (para crateras maiores como Tycho)
    if (radius > 12) {
      ctx.strokeStyle = 'rgba(240, 242, 248, 0.35)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 8; r++) {
        const rayAngle = (r / 8) * Math.PI * 2 + Math.random() * 0.2;
        const rayLen = radius * (1.8 + Math.random() * 1.5);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(rayAngle) * radius, cy + Math.sin(rayAngle) * radius);
        ctx.lineTo(cx + Math.cos(rayAngle) * rayLen, cy + Math.sin(rayAngle) * rayLen);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Cria a textura para a aura/halo de brilho do Sol (corona)
 * @returns {THREE.CanvasTexture}
 */
export function createSunGlowTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  const glowGrad = ctx.createRadialGradient(half, half, 0, half, half, half);
  glowGrad.addColorStop(0, 'rgba(255, 245, 180, 1)');
  glowGrad.addColorStop(0.2, 'rgba(255, 190, 50, 0.7)');
  glowGrad.addColorStop(0.5, 'rgba(255, 120, 10, 0.3)');
  glowGrad.addColorStop(0.8, 'rgba(255, 60, 0, 0.08)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
