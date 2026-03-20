# Documentacao Tecnica - MHS3 Guia de Fraquezas

Documentacao completa do codigo-fonte do projeto **MHS3 - Guia de Fraquezas e Padroes de Ataque**.

---

## Indice

1. [Visao Geral da Arquitetura](#visao-geral-da-arquitetura)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [HTML - app/index.html](#html---appindexhtml)
4. [CSS - app/css/styles.css](#css---appcssstylescss)
5. [JavaScript - app/js/monsters.js](#javascript---appjsmonstersjs)
6. [JavaScript - app/js/app.js](#javascript---appjsappjs)
7. [PWA - manifest.json](#pwa---manifestjson)
8. [PWA - sw.js (Service Worker)](#pwa---swjs-service-worker)
9. [Modelo de Dados](#modelo-de-dados)
10. [Escalas e Mapeamentos](#escalas-e-mapeamentos)
11. [Fluxo da Aplicacao](#fluxo-da-aplicacao)
12. [Responsividade](#responsividade)
13. [Acessibilidade](#acessibilidade)
14. [Como Adicionar um Novo Monstro](#como-adicionar-um-novo-monstro)
15. [Como Modificar o Layout](#como-modificar-o-layout)
16. [Como Atualizar o Cache da PWA](#como-atualizar-o-cache-da-pwa)

---

## Visao Geral da Arquitetura

A aplicacao e uma **PWA (Progressive Web App) estatica** que roda inteiramente no navegador, sem backend. Toda a logica de filtragem e renderizacao acontece no client-side via JavaScript vanilla. Funciona offline gracas ao Service Worker.

```
Fluxo:
  index.html  -->  carrega styles.css (visual)
              -->  carrega monsters.js (dados)
              -->  carrega app.js (logica + PWA)
              -->  registra sw.js (Service Worker)
                      |
                      v
              IIFE auto-executavel
                      |
                      v
              filterAndRender() --> le filtros do DOM
                      |             filtra array MONSTERS
                      v             renderiza cards no grid
              Event Listeners (input, change, scroll, online/offline)
              Install Prompt (beforeinstallprompt)
              
  sw.js  -->  install: pre-cacheia todos os assets
         -->  activate: limpa caches antigos
         -->  fetch: stale-while-revalidate (cache first, atualiza em background)
```

Nao ha dependencias externas, frameworks ou build tools. Basta servir `app/` via HTTP (necessario para Service Worker).

---

## Estrutura de Arquivos

```
MHS3/
├── README.md              # Documentacao do projeto (visao geral)
├── DOCS.md                # Este arquivo (documentacao tecnica)
├── index.html             # Versao original (tudo inline, arquivo unico)
└── app/                   # Versao responsiva e organizada
    ├── index.html         # HTML semantico (117 linhas)
    ├── css/
    │   └── styles.css     # CSS modular com BEM (683 linhas)
    └── js/
        ├── monsters.js    # Base de dados - array MONSTERS (367 linhas)
        └── app.js         # Logica da aplicacao (189 linhas)
```

| Arquivo | Responsabilidade | Dependencias |
|---------|-----------------|--------------|
| `app/index.html` | Estrutura HTML, meta tags PWA, referencias a CSS/JS | Nenhuma |
| `app/manifest.json` | Web App Manifest (nome, icones, tema, orientacao) | Icones PNG |
| `app/sw.js` | Service Worker - cache offline e estrategia de fetch | Nenhuma |
| `app/css/styles.css` | Todo o visual, layout, responsividade | Nenhuma |
| `app/js/monsters.js` | Declara `const MONSTERS` (variavel global) | Nenhuma |
| `app/js/app.js` | Filtros, renderizacao, PWA install prompt, offline banner | `MONSTERS` de monsters.js |
| `app/icons/icon-192.png` | Icone PWA 192x192 (home screen) | - |
| `app/icons/icon-512.png` | Icone PWA 512x512 (splash screen) | - |
| `app/icons/icon.svg` | Icone vetorial (fonte de referencia) | - |
| `app/icons/generate.html` | Gerador auxiliar de icones PNG via Canvas | - |

Ordem de carregamento no HTML (importante):
```html
<script src="js/monsters.js"></script>  <!-- 1. declara MONSTERS -->
<script src="js/app.js"></script>       <!-- 2. consome MONSTERS, monta UI -->
<script>                                <!-- 3. registra Service Worker -->
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js');
    });
  }
</script>
```

---

## HTML - app/index.html

### Estrutura Semantica

```
<body>
├── <header class="header">           # Titulo e subtitulo
├── <main class="container">          # Conteudo principal
│   ├── <section class="filters">     # Barra de busca e filtros (sticky)
│   │   ├── <input id="searchInput">  # Campo de texto
│   │   ├── <select id="filterElement"># Dropdown de elementos
│   │   ├── <select id="filterGenus"> # Dropdown de genus
│   │   ├── <select id="filterTier">  # Dropdown de tiers
│   │   └── <div id="resultCount">    # Contador de resultados
│   ├── <details class="legend">      # Legenda expansivel
│   ├── <div id="monsterGrid">        # Grid de cards (populado via JS)
│   └── <div id="noResults">          # Estado vazio
├── <footer class="footer">           # Rodape com creditos
└── <button id="backToTop">           # Botao flutuante voltar ao topo
```

### IDs Utilizados pelo JavaScript

| ID | Elemento | Uso |
|----|----------|-----|
| `searchInput` | `<input>` | Captura texto digitado para filtrar por nome |
| `filterElement` | `<select>` | Filtra por elemento (Fire, Water, etc.) |
| `filterGenus` | `<select>` | Filtra por genus (Flying Wyvern, etc.) |
| `filterTier` | `<select>` | Filtra por tier (SS, S, A, B) |
| `monsterGrid` | `<div>` | Container onde os cards sao injetados via innerHTML |
| `noResults` | `<div>` | Exibido quando nenhum monstro passa nos filtros |
| `resultCount` | `<div>` | Exibe contagem "X monstros encontrados" |
| `backToTop` | `<button>` | Botao flutuante que aparece ao rolar >600px |

### Meta Tags

| Meta | Valor | Proposito |
|------|-------|-----------|
| `viewport` | `width=device-width, initial-scale=1.0, viewport-fit=cover` | Responsividade + safe area (notch) |
| `description` | Descricao do guia | SEO |
| `theme-color` | `#0d1117` | Cor da barra do navegador mobile |

---

## CSS - app/css/styles.css

### Metodologia: BEM (Block Element Modifier)

Todas as classes seguem a convencao BEM:

```
.block             → componente independente
.block__element    → parte interna do componente
.block--modifier   → variacao do componente
```

Exemplos:
- `.card` (block) → `.card__header` (element) → `.card__tier--ss` (modifier)
- `.filters` → `.filters__search`, `.filters__select`
- `.tag` → `.tag--elem`, `.tag--fire`

### Variaveis CSS (Custom Properties)

Definidas em `:root`, facilitam personalizacao do tema:

| Grupo | Variaveis | Uso |
|-------|-----------|-----|
| **Layout** | `--bg`, `--surface`, `--surface2`, `--border` | Fundos e bordas |
| **Texto** | `--text`, `--text2` | Texto primario e secundario |
| **Acentos** | `--accent`, `--accent2` | Links e destaques |
| **Elementos** | `--fire`, `--water`, `--thunder`, `--ice`, `--dragon`, `--nonelem` | Cores dos elementos do jogo |
| **Ataques** | `--power`, `--speed`, `--technical` | Cores P/S/T |
| **Tiers** | `--ss`, `--s`, `--a`, `--b` | Cores dos badges de tier |
| **Raios** | `--radius`, `--radius-sm`, `--radius-xs` | Border-radius padronizados |

### Componentes CSS

| Componente | Classes | Descricao |
|------------|---------|-----------|
| **Header** | `.header`, `.header__title`, `.header__subtitle` | Banner topo com gradiente |
| **Filters** | `.filters`, `.filters__row`, `.filters__search`, `.filters__select`, `.filters__count` | Barra sticky de busca/filtros |
| **Legend** | `.legend`, `.legend__grid`, `.legend__item`, `.legend__dot`, `.legend__note` | Legenda expansivel (`<details>`) |
| **Grid** | `.grid` | CSS Grid auto-fill responsivo |
| **Card** | `.card`, `.card__header`, `.card__name`, `.card__rank`, `.card__tier`, `.card__body`, `.card__footer`, `.card__egg`, `.card__link` | Card de monstro |
| **Tags** | `.tags`, `.tag`, `.tag--elem`, `.tag--fire/water/etc` | Tags de info (genus, elemento, ataque) |
| **Pattern Table** | `.pattern-table`, `.pt-header`, `.pt-state`, `.pt-uses`, `.pt-counter`, `.pt-P/S/T`, `.pt-counter-P/S/T` | Tabela de padroes de ataque |
| **Weakness Grid** | `.weakness-grid`, `.weakness-cell`, `.weakness-cell__name`, `.wk-immune/resist/neutral/weak/veryweak` | Grid 5 colunas de fraquezas |
| **Ailment Grid** | `.ailment-grid`, `.ailment-cell`, `.ailment-cell__name` | Grid 3 colunas de ailments |
| **Stat Bars** | `.stat`, `.stat__label`, `.stat__bar-bg`, `.stat__bar`, `.stat__val`, `.stat--hp/atk/spd/def` | Barras de progresso coloridas |
| **Empty** | `.empty`, `.empty__title` | Estado quando nao ha resultados |
| **Footer** | `.footer` | Rodape com creditos |
| **Back to Top** | `.back-to-top`, `.back-to-top.visible` | Botao flutuante fixo |

### Breakpoints Responsivos

| Media Query | Alvo | Alteracoes Principais |
|-------------|------|----------------------|
| `min-width: 1400px` | Desktop grande | Grid fixo em 3 colunas |
| `max-width: 768px` | Tablet | Selects ocupam 50%, grid min 300px |
| `max-width: 480px` | Mobile | Filtros em coluna, grid 1 coluna, padding reduzido |
| `max-width: 360px` | Mobile pequeno | Fontes menores, tags compactas |
| `hover: none` | Touch devices | Desabilita hover effects, font-size 16px nos inputs |
| `prefers-reduced-motion: reduce` | Acessibilidade | Desabilita transicoes |
| `print` | Impressao | Fundo branco, esconde filtros/footer, cards sem quebra |

---

## JavaScript - app/js/monsters.js

Este arquivo declara uma unica constante global:

```javascript
const MONSTERS = [ ... ];
```

Contem um array de **65 objetos**, cada um representando um monstro.  
Veja a secao [Modelo de Dados](#modelo-de-dados) para detalhes de cada campo.

### Fontes dos Dados

| Dado | Fonte Primaria | Fonte de Verificacao |
|------|----------------|---------------------|
| Nome, Genus, Rank | Game8 Wiki | NeonLightsMedia |
| Elemento, Attack Type | Game8 Wiki | GamerGuides |
| Patterns (P/S/T por estado) | GamerGuides | Game8 (imagens) |
| Fraquezas Elementais | Game8 Wiki | Conhecimento geral MH |
| Ailments | Game8 Wiki | - |
| Stats (HP/ATK/SPD/DEF) | Game8 Wiki | - |
| Egg Location | Game8 Wiki | - |
| Tier | Game8 Tier List | - |
| Link (ID Game8) | Game8 URL | - |

---

## JavaScript - app/js/app.js

### Estrutura

Todo o codigo esta encapsulado em uma **IIFE** (Immediately Invoked Function Expression) com `'use strict'`:

```javascript
(() => {
  'use strict';
  // ... todo o codigo ...
})();
```

Isso evita poluir o escopo global (exceto `MONSTERS` que precisa ser global).

### Constantes de Mapeamento

| Constante | Tipo | Descricao |
|-----------|------|-----------|
| `ELEM_LABELS` | `string[]` | Nomes dos elementos para exibicao: `['Fire', 'Water', 'Thunder', 'Ice', 'Dragon']` |
| `ELEM_KEYS` | `string[]` | Chaves do objeto `weakElem`: `['fire', 'water', 'thunder', 'ice', 'dragon']` |
| `AIL_LABELS` | `string[]` | Nomes dos ailments para exibicao |
| `AIL_KEYS` | `string[]` | Chaves do objeto `ailments`: `['poison', 'para', 'sleep', 'blast', 'stun', 'bleed']` |
| `WK_CLASSES` | `string[]` | Classes CSS indexadas por valor (0-4): `['wk-immune', ..., 'wk-veryweak']` |
| `WK_TEXT` | `string[]` | Textos indexados por valor (0-4): `['Immune', ..., 'V.Weak']` |
| `PAT_FULL` | `object` | `{P: 'Power', S: 'Speed', T: 'Technical'}` |
| `COUNTER` | `object` | Mapeia ataque para contra-ataque: `{P: 'S', S: 'T', T: 'P'}` |
| `COUNTER_LBL` | `object` | Labels do contra-ataque: `{P: 'Speed', S: 'Technical', T: 'Power'}` |
| `STAT_DEFS` | `object[]` | Definicoes dos stats: chave, label e classe CSS |
| `ELEM_CLASS_MAP` | `object` | Mapeia nome do elemento para sufixo da classe CSS |

### Funcoes

#### `elemClass(el) → string`

Retorna o sufixo da classe CSS para um elemento.

| Entrada | Saida |
|---------|-------|
| `"Fire"` | `"fire"` |
| `"Non-Elem"` | `"none"` |
| `undefined` | `"none"` |

#### `buildPatternHTML(patterns) → string`

Gera HTML de uma `<table>` com 3 colunas (Estado, Monstro usa, Voce usa) a partir do objeto `patterns`.

Para cada entrada `{estado: tipo}`:
1. Busca o nome completo do tipo em `PAT_FULL`
2. Calcula o contra-ataque via `COUNTER`
3. Aplica classes de cor: `.pt-P` (vermelho), `.pt-S` (azul), `.pt-T` (verde)

Exemplo de entrada/saida:
```javascript
// Entrada:
{ Normal: "S", Enraged: "P" }

// Saida (simplificada):
// | Estado   | Monstro usa | Voce usa      |
// | Normal   | Speed       | Use Technical  |
// | Enraged  | Power       | Use Speed      |
```

#### `buildWeaknessHTML(weakElem) → string`

Gera 5 `<div>` para a grid de fraquezas elementais. Cada div recebe:
- Classe de cor baseada no valor (0=immune, 1=resist, 2=neutral, 3=weak, 4=veryweak)
- Label do elemento
- Texto do nivel de fraqueza

#### `buildAilmentHTML(ailments) → string`

Gera 6 `<div>` para a grid de ailments, mesma logica de cores que weakness.

#### `buildStatsHTML(stats) → string`

Gera 4 barras de progresso. Cada barra:
- Label (HP/ATK/SPD/DEF)
- Barra com largura proporcional: `width = (valor / 10) * 100%`
- Valor numerico

#### `renderCard(m) → string`

Funcao principal que monta o HTML completo de um card de monstro. Chama todas as funcoes `build*` e compoe a estrutura:

```
<article class="card">
  ├── .card__header  (nome, rank, tier badge)
  ├── .card__body
  │   ├── .tags (genus, elemento, attack type)
  │   ├── section-label + pattern-table
  │   ├── section-label + weakness-grid
  │   ├── section-label + ailment-grid
  │   └── section-label + stat bars
  └── .card__footer (egg location, link Game8)
</article>
```

#### `filterAndRender()`

Funcao central que:
1. Le o valor de cada filtro do DOM
2. Filtra o array `MONSTERS` com `Array.filter()`
3. Se nao ha resultados: limpa o grid, mostra empty state
4. Se ha resultados: esconde empty state, gera HTML via `map(renderCard).join('')`
5. Atualiza o contador de resultados

Logica de filtragem:
```
- nome: busca parcial case-insensitive (includes)
- elemento: match exato
- genus: match exato
- tier: match exato (null nao passa no filtro de tier)
```

#### `debouncedFilter()`

Wrapper que aplica debounce de **150ms** no `filterAndRender`. Usado apenas no evento `input` do campo de busca para evitar re-renders a cada tecla.

#### `handleScroll()`

Monitora `window.scrollY`. Se > 600px, adiciona classe `.visible` no botao back-to-top. Listener registrado com `{ passive: true }` para performance.

#### `scrollToTop()`

Chama `window.scrollTo({ top: 0, behavior: 'smooth' })`.

### Event Listeners

| Evento | Elemento | Handler | Tipo |
|--------|----------|---------|------|
| `input` | `#searchInput` | `debouncedFilter` | Debounce 150ms |
| `change` | `#filterElement` | `filterAndRender` | Imediato |
| `change` | `#filterGenus` | `filterAndRender` | Imediato |
| `change` | `#filterTier` | `filterAndRender` | Imediato |
| `click` | `#backToTop` | `scrollToTop` | - |
| `scroll` | `window` | `handleScroll` | Passive |

### Inicializacao

Ao final da IIFE, `filterAndRender()` e chamado uma vez para renderizar todos os monstros no carregamento da pagina.

---

## PWA - manifest.json

O Web App Manifest define como a aplicacao se comporta quando instalada:

| Campo | Valor | Funcao |
|-------|-------|--------|
| `name` | "MHS3 - Guia de Fraquezas e Padroes de Ataque" | Nome completo (splash screen) |
| `short_name` | "MHS3 Guia" | Nome curto (home screen) |
| `start_url` | `./index.html` | Pagina inicial ao abrir o app |
| `display` | `standalone` | Abre sem barra de navegacao (parece app nativo) |
| `orientation` | `any` | Permite retrato e paisagem |
| `background_color` | `#0d1117` | Cor de fundo da splash screen |
| `theme_color` | `#0d1117` | Cor da barra de status do Android |
| `icons` | 192x192 + 512x512 | Icones para home screen e splash |

Os icones usam `purpose: "any maskable"`, o que significa que funcionam tanto como icone padrao quanto como icone adaptativo (Android recorta em circulo/quadrado conforme o launcher).

---

## PWA - sw.js (Service Worker)

### Estrategia de Cache: Stale-While-Revalidate

O Service Worker usa uma estrategia hibrida:

1. **Install**: Pre-cacheia todos os assets essenciais (HTML, CSS, JS, icones)
2. **Fetch**: Retorna do cache imediatamente (rapido), enquanto busca uma versao atualizada em background
3. **Activate**: Limpa caches de versoes anteriores

```
Requisicao do navegador
        |
        v
  Tem no cache? ----SIM----> Retorna cache imediatamente
        |                         |
        |                    Em background: busca do servidor
        |                         |
        |                    Atualiza cache com resposta nova
        |
       NAO
        |
        v
  Busca do servidor --> Salva no cache --> Retorna resposta
        |
  Se falhar (offline) --> Retorna cache antigo (se existir)
```

### Assets Pre-Cacheados

```javascript
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/monsters.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];
```

### Versionamento

O cache e versionado pela constante `CACHE_NAME`:

```javascript
const CACHE_NAME = 'mhs3-guia-v1';
```

Ao alterar para `v2`, o `activate` event deleta automaticamente o cache `v1`.

### Eventos do Service Worker

| Evento | Funcao |
|--------|--------|
| `install` | Abre cache, adiciona todos os ASSETS, chama `skipWaiting()` |
| `activate` | Deleta caches antigos, chama `clients.claim()` |
| `fetch` | Stale-while-revalidate para GETs. Ignora outros metodos |

---

### PWA Features no app.js

#### Offline Banner

Monitora eventos `online`/`offline` do navegador. Quando offline, exibe uma barra amarela no topo:

```
"Voce esta offline — dados carregados do cache"
```

#### Install Prompt (A2HS - Add to Home Screen)

Captura o evento `beforeinstallprompt` do Chrome e exibe um banner customizado com botao "Instalar":

```
Fluxo:
  Chrome dispara beforeinstallprompt
        |
        v
  Banner aparece: "Instalar o MHS3 Guia no seu dispositivo?"
        |
  [Instalar]  -->  prompt() --> userChoice --> esconde banner
  [Fechar X]  -->  esconde banner, descarta prompt
```

O banner e escondido automaticamente apos instalacao via evento `appinstalled`.

---

## Modelo de Dados

Cada objeto no array `MONSTERS` tem a seguinte estrutura:

```javascript
{
  name: string,        // "Rathalos"
  genus: string,       // "Flying Wyvern"
  element: string,     // "Fire" | "Water" | "Thunder" | "Ice" | "Dragon" | "Non-Elem"
  rank: string,        // "1★" a "7★"
  attackType: string,  // "Power" | "Speed" | "Technical"
  tier: string | null, // "SS" | "S" | "A" | "B" | null

  patterns: {
    [estado: string]: "P" | "S" | "T"
    // ex: { Normal: "P", Enraged: "T", "Enraged (Airborne)": "S" }
  },

  weakElem: {
    fire: number,      // 0 = immune, 1 = resist, 2 = neutral, 3 = weak
    water: number,
    thunder: number,
    ice: number,
    dragon: number
  },

  ailments: {
    poison: number,    // 0 = immune, 1 = neutral, 2 = weak
    para: number,
    sleep: number,
    blast: number,
    stun: number,
    bleed: number
  },

  stats: {
    hp: number,        // 1-10 (tendencia relativa)
    atk: number,
    spd: number,
    def: number
  },

  egg: string | null,  // "Azuria - Blessing Hill" ou null (nao obtivel)
  link: string | null   // ID do artigo Game8 (ex: "586309") ou null
}
```

### Campos Detalhados

#### `patterns` - Padroes de Ataque

Cada chave e o nome de um estado/transformacao do monstro (ex: "Normal", "Enraged", "Electric Charge").  
O valor e uma letra indicando o tipo de ataque dominante nesse estado:

| Valor | Tipo | Cor | Vencido por |
|-------|------|-----|-------------|
| `"P"` | Power | Vermelho | Speed |
| `"S"` | Speed | Azul | Technical |
| `"T"` | Technical | Verde | Power |

Exemplos de patterns:
```javascript
// Monstro simples (1 estado):
{ Normal: "S" }

// Monstro com 2 estados:
{ Normal: "P", Enraged: "T" }

// Monstro com 3 estados:
{ Normal: "S", "Hellfireblight Mantle": "P", "Hellfireblight Critical": "T" }
```

#### `weakElem` - Fraquezas Elementais

Escala de 0 a 3 (note: no codigo CSS existem 5 classes wk-*, mas os dados usam 0-3):

| Valor | Significado | Classe CSS | Cor |
|-------|------------|------------|-----|
| 0 | Immune | `.wk-immune` | Verde forte |
| 1 | Resist | `.wk-resist` | Verde claro |
| 2 | Neutral | `.wk-neutral` | Cinza |
| 3 | Weak | `.wk-weak` | Laranja |

#### `ailments` - Resistencia a Ailments

Escala de 0 a 2:

| Valor | Significado | Classe CSS |
|-------|------------|------------|
| 0 | Immune | `.wk-immune` |
| 1 | Neutral | `.wk-resist` |
| 2 | Weak | `.wk-neutral` |

#### `stats` - Tendencias de Stats

Valores de 1 a 10 representando a tendencia relativa do monstro. Renderizados como barras de progresso com `width: (valor/10)*100%`.

| Stat | Cor da Barra |
|------|-------------|
| HP | Verde (#22c55e → #4ade80) |
| ATK | Vermelho (#ef4444 → #f87171) |
| SPD | Azul (#3b82f6 → #60a5fa) |
| DEF | Amarelo (#f59e0b → #fbbf24) |

#### `egg` - Localizacao do Ovo

String com regiao e sub-area, ou `null` para monstros sem ovo obtivel (ex: bosses como Yama Tsukami).

#### `link` - ID Game8

Sufixo numerico da URL do Game8. O link completo e montado em `renderCard`:
```
https://game8.co/games/Monster-Hunter-Stories-3/archives/{link}
```

---

## Escalas e Mapeamentos

### Indice → Classe CSS (WK_CLASSES)

```
Indice 0 → .wk-immune    (verde forte)
Indice 1 → .wk-resist    (verde claro)
Indice 2 → .wk-neutral   (cinza)
Indice 3 → .wk-weak      (laranja)
Indice 4 → .wk-veryweak  (vermelho) -- reservado, nao usado nos dados atuais
```

### Contra-Ataque (COUNTER)

```
Monstro usa Power     → Voce usa Speed      (S vence P)
Monstro usa Speed     → Voce usa Technical  (T vence S)
Monstro usa Technical → Voce usa Power      (P vence T)
```

### Elemento → Classe CSS (ELEM_CLASS_MAP)

```
"Fire"     → .tag--fire    (laranja #ff6b35)
"Water"    → .tag--water   (azul   #4dabf7)
"Thunder"  → .tag--thunder (amarelo #ffd43b)
"Ice"      → .tag--ice     (azul claro #74c0fc)
"Dragon"   → .tag--dragon  (roxo   #c084fc)
"Non-Elem" → .tag--none    (cinza  #94a3b8)
```

---

## Fluxo da Aplicacao

```
1. Navegador carrega index.html
2. CSS (styles.css) e aplicado - pagina renderiza estrutura vazia
3. monsters.js carrega → MONSTERS disponivel globalmente
4. app.js carrega → IIFE executa:
   a. Define constantes e funcoes
   b. Cacheia referencias DOM ($search, $grid, etc.)
   c. Registra event listeners
   d. Chama filterAndRender() pela primeira vez
      → Filtros vazios = todos os 65 monstros renderizados
5. Usuario interage:
   - Digita no campo → debouncedFilter() (150ms delay) → filterAndRender()
   - Seleciona dropdown → filterAndRender() (imediato)
   - Rola a pagina → handleScroll() → mostra/esconde botao topo
   - Clica botao topo → scrollToTop() → smooth scroll ate y=0
```

---

## Responsividade

### Estrategia

A abordagem e **desktop-first** com media queries descendentes:

```
1400px+   → 3 colunas fixas
default   → auto-fill minmax(340px, 1fr) ≈ 2-3 colunas
768px     → auto-fill minmax(300px, 1fr), selects 50%
480px     → 1 coluna, filtros empilhados, padding reduzido
360px     → fontes minimas, tags compactas
```

### Otimizacoes por Dispositivo

| Feature | Implementacao |
|---------|--------------|
| Touch devices | `@media (hover: none)` - desabilita hover transform, font-size 16px nos inputs |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` - transicoes de 0.01ms |
| Notch/safe area | `viewport-fit=cover` no meta viewport |
| Print | Fundo branco, esconde filtros/footer, `break-inside: avoid` nos cards |
| Zoom prevention (iOS) | font-size 16px nos inputs em touch devices |

### Tipografia Fluida

O titulo usa `clamp()` para escalar suavemente:
```css
font-size: clamp(1.2rem, 4vw, 1.8rem);
```

---

## Acessibilidade

| Feature | Implementacao |
|---------|--------------|
| `aria-label` | Em todos os inputs e selects |
| `aria-live="polite"` | No contador de resultados (anuncia mudancas a screen readers) |
| Tags semanticas | `<header>`, `<main>`, `<section>`, `<article>`, `<footer>` |
| `rel="noopener"` | Em todos os links `target="_blank"` |
| Focus visible | Border-color muda para `--accent` em `:focus` |
| Reduced motion | Respeita `prefers-reduced-motion` |

---

## Como Adicionar um Novo Monstro

1. Abra `app/js/monsters.js`
2. Adicione um novo objeto ao array `MONSTERS`:

```javascript
{
  name: "Nome do Monstro",
  genus: "Flying Wyvern",         // deve coincidir com opcao do <select>
  element: "Fire",                // Fire|Water|Thunder|Ice|Dragon|Non-Elem
  rank: "5★",                     // 1★ a 7★
  attackType: "Power",            // Power|Speed|Technical
  tier: "A",                      // SS|S|A|B|null

  patterns: {
    Normal: "P",                  // P|S|T por estado
    Enraged: "S"
  },

  weakElem: {
    fire: 0,                      // 0=immune, 1=resist, 2=neutral, 3=weak
    water: 3,
    thunder: 1,
    ice: 2,
    dragon: 1
  },

  ailments: {
    poison: 1,                    // 0=immune, 1=neutral, 2=weak
    para: 2,
    sleep: 1,
    blast: 1,
    stun: 1,
    bleed: 1
  },

  stats: {
    hp: 7,                        // 1-10
    atk: 8,
    spd: 6,
    def: 5
  },

  egg: "Regiao - Sub-area",       // string ou null
  link: "123456"                  // ID Game8 ou null
}
```

3. Se o genus for novo (nao existe no dropdown), adicione uma `<option>` no `<select id="filterGenus">` em `app/index.html`.

---

## Como Modificar o Layout

### Alterar cores do tema

Edite as variaveis em `:root` no `app/css/styles.css`:
```css
:root {
  --bg: #0d1117;       /* fundo principal */
  --surface: #161b22;  /* fundo dos cards */
  --accent: #58a6ff;   /* cor de destaque */
  /* ... */
}
```

### Alterar numero de colunas do grid

Edite a regra `.grid`:
```css
.grid {
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  /* Mude 340px para ajustar largura minima dos cards */
}
```

### Adicionar uma nova secao ao card

1. Adicione dados ao objeto em `monsters.js`
2. Crie uma funcao `buildNovaSecaoHTML()` em `app.js`
3. Chame-a dentro de `renderCard()` entre as secoes existentes
4. Adicione classes CSS em `styles.css`

### Alterar estilo dos breakpoints

Os breakpoints estao no final de `styles.css`, organizados por tamanho descendente. Cada bloco `@media` contem apenas os overrides necessarios para aquele tamanho.

---

## Como Atualizar o Cache da PWA

Quando voce altera qualquer arquivo (monstros, CSS, HTML), os usuarios que ja instalaram o app precisam receber a atualizacao. O processo:

### 1. Incremente a versao do cache

Em `sw.js`, mude o nome do cache:

```javascript
// Antes
const CACHE_NAME = 'mhs3-guia-v1';

// Depois
const CACHE_NAME = 'mhs3-guia-v2';
```

### 2. O que acontece automaticamente

1. O navegador detecta que `sw.js` mudou (compara byte a byte)
2. Instala o novo Service Worker em background
3. No `activate`, o codigo deleta o cache `v1`
4. Pre-cacheia todos os assets atualizados no cache `v2`
5. Na proxima visita, o usuario recebe os arquivos novos

### 3. Se adicionou novos arquivos

Adicione-os ao array `ASSETS` em `sw.js`:

```javascript
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/monsters.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './novo-arquivo.js'      // adicione aqui
];
```

### Nota sobre desenvolvimento local

Durante o desenvolvimento, o Service Worker pode servir arquivos antigos do cache. Para forcar atualizacao:
- Chrome DevTools > Application > Service Workers > marque "Update on reload"
- Ou limpe o cache: Application > Storage > Clear site data
