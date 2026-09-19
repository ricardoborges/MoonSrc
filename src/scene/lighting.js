import * as THREE from 'three';

/**
 * Cria o sistema de iluminação solar e cósmica
 * @param {THREE.Vector3} sunPosition
 * @returns {object} { group, sunPointLight, sunDirLight, ambientLight }
 */
export function createLighting(sunPosition) {
  const group = new THREE.Group();
  group.name = 'LightingGroup';

  // Luz solar pontual (para dispersão esférica natural)
  const sunPointLight = new THREE.PointLight(0xfff6dd, 3.2, 120, 0.4);
  sunPointLight.position.copy(sunPosition);
  group.add(sunPointLight);

  // Luz solar direcional (para sombras nítidas no sistema Terra-Lua)
  const sunDirLight = new THREE.DirectionalLight(0xfff9e6, 2.5);
  sunDirLight.position.copy(sunPosition);
  sunDirLight.target.position.set(0, 0, 0); // aponta para o centro da Terra
  group.add(sunDirLight);
  group.add(sunDirLight.target);

  // Luz ambiente suave (didática: evita escuridão 100% impenetrável no lado oculto)
  const ambientLight = new THREE.AmbientLight(0x222638, 0.35);
  group.add(ambientLight);

  // Raios solares didáticos (linhas pontilhadas indicando a direção da luz).
  // Ficam em coordenadas LOCAIS ao Sol: quem os posiciona é o pivô da translação,
  // assim eles continuam apontando para a Terra quando ela dá a volta.
  const beamGroup = new THREE.Group();
  beamGroup.name = 'SunBeams';
  const beamMaterial = new THREE.LineDashedMaterial({
    color: 0xffd54f,
    dashSize: 0.8,
    gapSize: 0.5,
    opacity: 0.4,
    transparent: true,
    linewidth: 1
  });

  const beamOffsets = [-6, -3, 0, 3, 6];
  beamOffsets.forEach(offsetZ => {
    const points = [
      new THREE.Vector3(3.5, 0, offsetZ),
      new THREE.Vector3(sunPosition.length() + 14, 0, offsetZ)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, beamMaterial);
    line.computeLineDistances();
    beamGroup.add(line);
  });
  // beamGroup NÃO entra no grupo de luzes: o SceneManager o pendura no pivô do Sol

  return {
    group,
    sunPointLight,
    sunDirLight,
    ambientLight,
    beamGroup
  };
}
