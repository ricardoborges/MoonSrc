# Fases da Lua 3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir uma aplicação web interativa em 3D usando Three.js e Vite com o sistema Sol-Terra-Lua, apresentando Visão Dupla (Espaço + Visão da Terra) e recursos pedagógicos lúdicos para crianças de 6 a 10 anos compreenderem as fases da Lua.

**Architecture:** A aplicação é baseada em Vite com Three.js vanilla e CSS nativo modular. O motor 3D renderiza dois viewports sincronizados: a câmera orbital principal (visão cósmica livre) e a câmera do telescópio terrestre (apontada da Terra para a Lua). Um módulo de simulação astronômica calcula o ciclo lunar de 29.5 dias e sincroniza a rotação lunar (travamento de maré), a posição orbital e os dados didáticos do HUD. Texturas de alta fidelidade da Terra, Lua e Sol são geradas proceduralmente via Canvas 2D, garantindo 100% de disponibilidade offline.

**Tech Stack:** JavaScript (ES Modules), Three.js (r160+), Vite, Vitest (testes unitários de lógica orbital), Vanilla CSS (Glassmorphism, CSS Custom Properties, Google Fonts).

**Spec:** [`docs/superpowers/specs/2026-09-18-fases-da-lua-3d-design.md`](file:///d:/dev/github/ricardoborges/MoonSrc/docs/superpowers/specs/2026-09-18-fases-da-lua-3d-design.md)

## Global Constraints
- Target audience: Crianças de 6 a 10 anos (linguagem acessível, botões grandes, contraste visual e cores vibrantes).
- Sistema solar reduzido didático: Apenas Sol, Terra e Lua com iluminação fisicamente coerente.
- Visão Dupla Simultânea: Cena do Espaço + Visor circular da Terra ("Como vemos da Terra").
- Zero dependência de URLs externas para texturas 3D (todas geradas proceduralmente em tempo real).
- Nenhuma dependência de TailwindCSS (usar Vanilla CSS moderno e responsivo).
- Terminal shell: PowerShell no Windows 11.

---

### Task 1: Setup do Projeto e Infraestrutura de Testes

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `tests/setup.test.js`

**Interfaces:**
- Produces: Ambiente Vite funcional com suporte a Three.js e Vitest configurado para testes automatizados.

- [ ] **Step 1: Criar package.json com scripts e dependências**

```json
{
  "name": "moon-phases-3d",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.1.0",
    "vitest": "^1.3.0"
  }
}
```

- [ ] **Step 2: Criar vite.config.js**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  server: {
    port: 3000,
    open: false
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
```

- [ ] **Step 3: Criar teste de sanidade do ambiente**

Arquivo: `tests/setup.test.js`
```javascript
import { describe, it, expect } from 'vitest';

describe('Ambiente de testes', () => {
  it('deve executar testes corretamente', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Instalar dependências e executar o teste**

Comandos:
```powershell
npm install
npm test
```
Expected: PASS com 1 teste aprovado.

- [ ] **Step 5: Criar esqueleto semântico de index.html**

Arquivo: `index.html` com container `#app`, canvas 3D `#webgl-canvas`, visor da terra `#earth-view-container`, e contêineres de HUD.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json vite.config.js index.html tests/setup.test.js
git commit -m "chore: setup inicial do projeto com vite, threejs e vitest"
```

---

### Task 2: Motor Matemático do Ciclo Lunar e Fases

**Files:**
- Create: `tests/lunarCycle.test.js`
- Create: `src/simulation/lunarCycle.js`

**Interfaces:**
- Produces: `calculatePhase(angleInRadians)` -> `{ day, angleDegrees, phaseIndex, phaseName, illuminatedFraction, earthViewDescription }`
- Produces: `PHASES` array com metadados das 8 fases.

- [ ] **Step 1: Escrever teste automatizado para as 8 fases da Lua**

Arquivo: `tests/lunarCycle.test.js`
```javascript
import { describe, it, expect } from 'vitest';
import { calculatePhase, PHASES, getPhaseByIndex } from '../src/simulation/lunarCycle.js';

describe('Simulação do Ciclo Lunar', () => {
  it('deve identificar a Lua Nova em 0 radianos (0 graus)', () => {
    const phase = calculatePhase(0);
    expect(phase.phaseIndex).toBe(0);
    expect(phase.phaseName).toBe('Lua Nova');
    expect(phase.illuminatedFraction).toBeCloseTo(0, 1);
  });

  it('deve identificar o Quarto Crescente em PI/2 radianos (90 graus)', () => {
    const phase = calculatePhase(Math.PI / 2);
    expect(phase.phaseIndex).toBe(2);
    expect(phase.phaseName).toBe('Quarto Crescente');
    expect(phase.illuminatedFraction).toBeCloseTo(0.5, 1);
  });

  it('deve identificar a Lua Cheia em PI radianos (180 graus)', () => {
    const phase = calculatePhase(Math.PI);
    expect(phase.phaseIndex).toBe(4);
    expect(phase.phaseName).toBe('Lua Cheia');
    expect(phase.illuminatedFraction).toBeCloseTo(1, 1);
  });

  it('deve identificar o Quarto Minguante em 3*PI/2 radianos (270 graus)', () => {
    const phase = calculatePhase((3 * Math.PI) / 2);
    expect(phase.phaseIndex).toBe(6);
    expect(phase.phaseName).toBe('Quarto Minguante');
    expect(phase.illuminatedFraction).toBeCloseTo(0.5, 1);
  });

  it('deve mapear corretamente o ciclo de 29.5 dias', () => {
    const phaseFull = calculatePhase(Math.PI);
    expect(phaseFull.day).toBeCloseTo(14.75, 1);
  });
});
```

- [ ] **Step 2: Executar teste para verificar que falha**

Comando: `npm test`
Expected: FAIL com erro de módulo inexistente.

- [ ] **Step 3: Implementar `src/simulation/lunarCycle.js`**

Implementar cálculo preciso de fase, fração iluminada, dias decorridos (0 a 29.53) e lista com as 8 fases canônicas e seus ângulos centrais.

- [ ] **Step 4: Executar teste para verificar que passa**

Comando: `npm test`
Expected: PASS para todos os testes.

- [ ] **Step 5: Commit**

```powershell
git add src/simulation/lunarCycle.js tests/lunarCycle.test.js
git commit -m "feat: adicionar modulo de calculo do ciclo lunar com testes unitarios"
```

---

### Task 3: Gerador Procedural de Texturas dos Corpos Celestes

**Files:**
- Create: `src/utils/proceduralTextures.js`
- Test: Verificação via renderização Three.js em canvas.

**Interfaces:**
- Produces: `createSunTexture()` -> `THREE.CanvasTexture`
- Produces: `createEarthTexture()` -> `THREE.CanvasTexture`
- Produces: `createMoonTexture()` -> `THREE.CanvasTexture`
- Produces: `createStarsTexture()` -> `THREE.CanvasTexture`

- [ ] **Step 1: Implementar `src/utils/proceduralTextures.js`**
  - **Textura do Sol:** Canvas 1024x512 com gradiente amarelo/dourado incandescente, granulações solares e manchas solares aleatórias com glow radial.
  - **Textura da Terra:** Canvas 2048x1024 com gradientes de oceano azul profundo, continentes detalhados em tons de verde/marrom, calotas polares de gelo branco e filamentos translúcidos de nuvens.
  - **Textura da Lua:** Canvas 1024x512 com base cinza rochosa craterada, gradientes dos grandes "mares lunares" (*maria*) e anéis de impacto de crateras com bordas iluminadas e centros sombreados.
  - **Fundo Estelar (Skybox/Particles):** Geração de campo estelar profundo com estrelas cintilantes e nebulosas sutis.

- [ ] **Step 2: Adicionar teste unitário de geração em ambiente headless ou validação de canvas**

- [ ] **Step 3: Commit**

```powershell
git add src/utils/proceduralTextures.js
git commit -m "feat: implementar gerador procedural de texturas para Sol, Terra e Lua"
```

---

### Task 4: Cena 3D, Corpos Celestes e Sistema de Iluminação

**Files:**
- Create: `src/scene/celestialBodies.js`
- Create: `src/scene/lighting.js`
- Create: `src/scene/cameras.js`
- Create: `src/scene/sceneManager.js`

**Interfaces:**
- Consumes: `proceduralTextures.js`
- Produces: `SceneManager` com método `init()`, `update(angle)`, `render()` e suporte a resize responsivo.
- Produces: Grupo do Sol (com luz emissiva e halo), Grupo da Terra (com rotação axial) e Grupo da Lua (com raio orbital e trava de maré).

- [ ] **Step 1: Implementar `src/scene/lighting.js`**
  - Luz direcional e luz pontual intensa na posição do Sol apontando para a origem.
  - Luz ambiente com intensidade calculada para permitir contraste nítido de sombras sem escuridão absoluta inacessível para crianças.
  - Feixe guia de luz solar semi-transparente conectando o Sol à Terra.

- [ ] **Step 2: Implementar `src/scene/celestialBodies.js`**
  - Sol esférico à esquerda (ex: `x = -25`), com material emissivo e glow sprite pulsante.
  - Terra no centro (`x = 0, y = 0, z = 0`), raio 3.0, com inclinação de 23.5°.
  - Linha da órbita lunar em círculo tracejado e iluminado ao redor da Terra.
  - Lua com raio 1.0, orbitando a uma distância de 10 unidades da Terra.

- [ ] **Step 3: Implementar `src/scene/cameras.js`**
  - Câmera Principal: `PerspectiveCamera` no espaço com `OrbitControls` (zoom limitado para não perder a cena).
  - Câmera da Terra (Telescópio): Posicionada na superfície/centro da Terra, com campo de visão ajustado (`fov: 18°`) e sempre fazendo `lookAt(moon.position)`.

- [ ] **Step 4: Implementar `src/scene/sceneManager.js`**
  - Orquestra renderização da cena principal e renderização do viewport secundário (Visão da Terra) usando técnica `setViewport` e `setScissor`.

- [ ] **Step 5: Commit**

```powershell
git add src/scene/
git commit -m "feat: criar corpos celestes 3D, iluminacao e sistema de cameras duplas"
```

---

### Task 5: Interface do Usuário (HUD), Visor do Telescópio e Painel Pedagógico

**Files:**
- Create: `src/style.css`
- Create: `src/ui/educationalPanel.js`
- Create: `src/ui/timeline.js`
- Create: `src/ui/controls.js`
- Create: `src/ui/earthViewHUD.js`
- Modify: `index.html`

**Interfaces:**
- Consumes: `src/simulation/lunarCycle.js`
- Produces: Eventos interativos para alterar a posição orbital da Lua, pausar/retomar, mudar velocidade e exibir cartões explicativos para crianças de 6 a 10 anos.

- [ ] **Step 1: Escrever estilos em `src/style.css`**
  - Variáveis de cores temáticas: azul cósmico, dourado solar, branco lunar e tons escuros espaciais.
  - Design responsivo, tipografia amigável (Google Font *Outfit* ou *Fredoka*).
  - Moldura de telescópio / visor circular com anel metálico futurista e vidro translúcido para a visão da Terra.
  - Botões das 8 fases em carrossel horizontal com ícones, status ativo e animações táteis.
  - Card pedagógico com destaque em cards com emojis e fontes legíveis.

- [ ] **Step 2: Implementar `src/ui/educationalPanel.js`**
  - Dicionário com dados de cada fase:
    - Nome lúdico e formal.
    - O que está acontecendo (2 frases curtas).
    - Curiosidade divertida sobre a Lua.
    - Dica de observação no céu.

- [ ] **Step 3: Implementar `src/ui/timeline.js` e `src/ui/controls.js`**
  - Slider contínuo de 0 a 29.5 dias com atualização bidirecional (arrastar atualiza o 3D; o 3D atualiza a barra).
  - Botões Play/Pausa, velocidades (0.5x, 1x, 2x) e botão de reset.
  - 8 botões de fase que movem a Lua suavemente com interpolação angular.

- [ ] **Step 4: Implementar `src/ui/earthViewHUD.js`**
  - Badge dinâmico sobreposto ao visor com porcentagem visível ("100% Iluminada", "50% Iluminada", etc.) e botão de expandir/minimizar visor.

- [ ] **Step 5: Commit**

```powershell
git add src/style.css src/ui/ index.html
git commit -m "feat: criar interface visual amigavel, controles interativos e painel pedagogico"
```

---

### Task 6: Integração Principal e Loop de Animação

**Files:**
- Create: `src/main.js`

**Interfaces:**
- Conecta UI, Simulação e SceneManager em um loop contínuo de 60 FPS com suporte a delta time e controles orbitais.

- [ ] **Step 1: Implementar `src/main.js`**
  - Inicializar `SceneManager`.
  - Inicializar listeners da UI (`timeline`, `controls`, botões de fases).
  - Loop `requestAnimationFrame` que avança a rotação da Terra, a rotação da Lua e a órbita lunar quando `isPlaying = true`.
  - Atualização do painel educativo a cada mudança de fase.

- [ ] **Step 2: Commit**

```powershell
git add src/main.js
git commit -m "feat: conectar simulacao, cena 3d e controles no loop principal"
```

---

### Task 7: Verificação Funcional, Testes Automatizados e Validação no Navegador

**Files:**
- Run: `npm test`
- Run: `npm run build`
- Run: Navegador via subagente com captura de gravação de tela.

- [ ] **Step 1: Executar suite de testes unitários**

Comando: `npm test`
Expected: Todos os testes passando sem erros.

- [ ] **Step 2: Executar build de produção do Vite para validação de sintaxe e empacotamento**

Comando: `npm run build`
Expected: Build concluído com sucesso sem warnings ou erros de bundling.

- [ ] **Step 3: Iniciar servidor Vite local e testar no navegador com subagente**

Acessar `http://localhost:3000`, verificar:
1. Renderização do Sol com brilho, Terra e Lua.
2. Interação de arrasto e zoom com o mouse (OrbitControls).
3. Visor circular em tempo real da Visão da Terra refletindo as fases.
4. Clique nas 8 fases e arraste do slider de dias.
5. Painel educativo com textos pedagógicos em português para crianças de 6 a 10 anos.

- [ ] **Step 4: Commit final e relatório de walkthrough**
