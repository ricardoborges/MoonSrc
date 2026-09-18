# Especificação de Design: Simulador 3D das Fases da Lua para Crianças (6 a 10 Anos)

## 1. Visão Geral e Objetivos

O projeto tem como objetivo proporcionar uma experiência visual, intuitiva e lúdica em 3D para ensinar as fases da Lua a crianças na faixa etária de 6 a 10 anos.
A maior dificuldade no aprendizado das fases da Lua é a confusão entre o que ocorre no espaço (metade da Lua está sempre iluminada pelo Sol) e o que vemos aqui da Terra (a porção iluminada que é visível a partir do nosso ponto de observação).

Para resolver essa lacuna cognitiva de forma definitiva, o sistema emprega uma **Visão Dupla Simultânea**:
1. **Visão Espacial 3D (Visão Geral):** Mostra o Sol estático à esquerda emitindo luz, a Terra no centro e a Lua orbitando a Terra. A criança vê claramente que metade da esfera lunar está sempre branca/iluminada pelo Sol.
2. **Visão da Terra (Telescópio/Pip):** Uma câmera ancorada na Terra olha diretamente para a Lua. O renderizador exibe em tempo real o que uma pessoa na Terra enxerga no céu, demonstrando como a mudança de ângulo produz as fases da Lua.

---

## 2. Experiência do Usuário e Elementos Pedagógicos

### 2.1 Público-Alvo (Crianças de 6 a 10 anos)
* **Linguagem:** Português simples, claro e encorajador, sem terminologias astronômicas excessivamente densas, mas cientificamente corretas.
* **Identidade Visual:** Estética espacial amigável e deslumbrante, fontes arredondadas e legíveis (ex.: *Fredoka* / *Outfit*), botões grandes e táteis com micro-animações, cores vibrantes com alto contraste.

### 2.2 As 8 Fases da Lua
O sistema mapeia o ciclo lunar (~29.5 dias / 360°) em 8 fases principais:
1. **Lua Nova (0° / Dia 0):** A Lua está entre a Terra e o Sol. Sua face iluminada está voltada para o Sol; da Terra, vemos o lado escuro ("A Lua está invisível no céu diurno!").
2. **Crescente Côncava (45° / ~Dia 3.7):** Um fino sorriso de luz aparece do lado direito ("Parece uma fatia de melancia brilhante!").
3. **Quarto Crescente (90° / ~Dia 7.4):** Vemos exatamente a metade direita iluminada ("Parece a letra D no céu!").
4. **Crescente Gibosa (135° / ~Dia 11.1):** Quase toda a face está cheia de luz.
5. **Lua Cheia (180° / ~Dia 14.8):** A Terra está entre o Sol e a Lua. Vemos toda a face iluminada brilhando no céu noturno!
6. **Gibosa Minguante (225° / ~Dia 18.5):** A luz começa a diminuir lentamente pelo lado direito.
7. **Quarto Minguante (270° / ~Dia 22.1):** Vemos a metade esquerda iluminada ("Parece a letra C no céu!").
8. **Minguante Côncava (315° / ~Dia 25.8):** Um fino arco de luz do lado esquerdo antes do ciclo recomeçar.

### 2.3 Controles e Interatividades
* **Linha do Tempo Interativa:** Slider contínuo de 0 a 29.5 dias com indicador da fase atual.
* **Barra de Atalho das 8 Fases:** 8 botões com ícones da fase. Clicar em um botão anima a Lua suavemente até aquela posição orbital exata.
* **Controles de Reprodução:**
  * Botão Play / Pausa.
  * Seletor de Velocidade (Lenta: 0.5x, Normal: 1x, Rápida: 2.5x).
  * Botão de Reiniciar Ciclo.
* **Card Pedagógico "Explorador Espacial":**
  * Título da fase atual com emoji e status de visibilidade.
  * "Por que fica assim?": Explicação em 2 frases simples.
  * "Curiosidade Espacial": Fatos divertidos (ex.: pegadas na Lua que duram milhões de anos, ausência de vento, a Lua não tem luz própria).
* **Visor do Observatório ("Como Vemos da Terra"):**
  * Inset circular com moldura de telescópio moderno.
  * Renderiza a visão direta da Terra para a Lua com iluminação precisa.
  * Legenda com a porcentagem de iluminação visível (ex.: 0%, 50%, 100%).

---

## 3. Arquitetura Técnica e Gráfica

### 3.1 Pilha de Tecnologias
* **Vite:** Ferramenta de build moderna, rápida e sem dependências pesadas.
* **Three.js (r128+ ou versão moderna estável):** Biblioteca WebGL para renderização dos corpos celestes, iluminação e múltiplas câmeras.
* **OrbitControls:** Para rotação livre, pan e zoom pelo usuário na visão espacial 3D.
* **Vanilla CSS:** Variáveis CSS, design system próprio, glassmorphism, flexbox/grid responsivo, tipografia Google Fonts, sem frameworks CSS externos.
* **Gerador Procedural de Texturas em Canvas 2D:**
  * Textura do Sol com gradiente radial incandescente e manchas solares.
  * Textura da Terra com oceanos azuis, continentes verdes/marrons e calotas de gelo.
  * Textura da Lua com fundo cinza rochoso, crateras sombreadas e mares lunares (*maria*).
  * *Garantia:* Zero dependência de URLs externas de imagens ou falhas de CORS/rede. 100% autônomo e offline.

### 3.2 Sistema de Câmeras e Renderização
* **Renderizador WebGL Único:** Utiliza a técnica `scissor` e `viewport` do Three.js ou renderização para textura/segundo viewport para desempenho máximo de 60 FPS:
  * **Câmera 1 (Espaço):** `PerspectiveCamera` livre com `OrbitControls`, campo de visão amplo (50°), permitindo visualizar Sol, Terra e Lua de qualquer ângulo.
  * **Câmera 2 (Visão Terrestre):** `PerspectiveCamera` com campo de visão estreito (zoom tipo telescópio, ~15-20°), posicionada na Terra e fixada no vetor de direção para a Lua (`camera.lookAt(moon.position)`).
* **Iluminação:**
  * `PointLight` e `DirectionalLight` colocados na posição do Sol.
  * `AmbientLight` fraca (para que o lado escuro da Terra e da Lua não fique 100% breu ininteligível para crianças, mas suficientemente escuro para demonstrar a sombra).
  * Sol com `MeshBasicMaterial` auto-emissivo + partículas ou sprite de brilho suave (*lens flare / aura*).
  * Guia de raio de sol com linha/feixe semi-transparente para reforçar visualmente a direção da luz.

---

## 4. Estrutura de Arquivos do Projeto

```
MoonSrc/
├── index.html                     # HTML estrutural com HUD espacial, canvas e viewport da Terra
├── package.json                   # Configurações do Vite e dependência Three.js
├── vite.config.js                 # Configurações do Vite
├── src/
│   ├── style.css                  # Estilo espacial, temas, glassmorphism, responsividade
│   ├── main.js                    # Bootstrap da aplicação e loop de animação
│   ├── scene/
│   │   ├── sceneManager.js        # Configuração da cena, renderizador, viewports e resize
│   │   ├── celestialBodies.js     # Sol, Terra, Lua, eixos e órbita
│   │   ├── lighting.js            # Luzes do Sol e ambiente
│   │   └── cameras.js             # Câmera espacial (orbit) e câmera do telescópio terrestre
│   ├── simulation/
│   │   └── lunarCycle.js          # Cálculos de translação, rotação sincronizada e dias do ciclo
│   ├── ui/
│   │   ├── controls.js            # Play, pause, velocidade e reset
│   │   ├── timeline.js            # Slider de dias e botões das 8 fases
│   │   └── educationalPanel.js    # Textos, explicações didáticas e curiosidades infantis
│   └── utils/
│       └── proceduralTextures.js  # Gerador de texturas de alta resolução da Terra, Lua e Sol
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-09-18-fases-da-lua-3d-design.md
```

---

## 5. Plano de Verificação e Qualidade
1. **Precisão Astronômica Didática:**
   * Garantir que no ângulo 0° (Lua entre Terra e Sol) a visão da Terra mostre a Lua Nova (100% escura).
   * Garantir que no ângulo 180° (Terra entre Sol e Lua) a visão da Terra mostre a Lua Cheia (100% iluminada).
   * Garantir que a face visível da Lua seja sincronizada (*tidal locking*).
2. **Responsividade e Usabilidade Infantil:**
   * Testar em resoluções desktop e tablets/mobile.
   * Botões e controles com tamanho mínimo de toque de 44x44px.
   * Feedback visual imediato ao passar o mouse ou tocar em cada fase.
3. **Verificação no Navegador com Subagente:**
   * Abrir no navegador local para testar a renderização WebGL em 60 FPS, cliques nos botões de fase, slider e visualizador do telescópio.
