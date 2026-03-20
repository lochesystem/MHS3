# Monster Hunter Stories 3: Twisted Reflection - Guia de Fraquezas e Padroes de Ataque

Guia interativo de consulta de fraquezas e padroes de ataque (Head-to-Head) dos monstros de **Monster Hunter Stories 3: Twisted Reflection** (MHS3).

**Acesse online:** https://lochesystem.github.io/MHS3/

## Sobre o Jogo

| Info | Detalhe |
|------|---------|
| **Titulo** | Monster Hunter Stories 3: Twisted Reflection |
| **Desenvolvedora** | CAPCOM Co., Ltd. |
| **Lancamento** | 13 de Marco de 2026 |
| **Genero** | JRPG, Acao-Aventura, Monster Taming |
| **Plataformas** | Nintendo Switch 2, PlayStation 5, Xbox Series X\|S, Steam |
| **Preco** | Standard: $69.99 / Deluxe: $89.99 / Premium: $99.99 |

## Estrutura do Projeto

```
MHS3/
├── README.md              # Este arquivo - documentacao do projeto
├── DOCS.md                # Documentacao tecnica do codigo
├── index.html             # Versao original (arquivo unico, tudo inline)
└── app/                   # Versao responsiva + PWA
    ├── index.html         # HTML semantico com meta tags PWA e acessibilidade
    ├── manifest.json      # Web App Manifest (nome, icones, cores, display)
    ├── sw.js              # Service Worker (cache offline)
    ├── css/
    │   └── styles.css     # CSS modular com BEM, breakpoints responsivos
    ├── js/
    │   ├── monsters.js    # Base de dados dos monstros (array MONSTERS)
    │   └── app.js         # Logica da aplicacao (filtros, render, PWA, UI)
    └── icons/
        ├── icon-192.png   # Icone PWA 192x192
        ├── icon-512.png   # Icone PWA 512x512
        ├── icon.svg       # Icone vetorial (fonte)
        └── generate.html  # Gerador de icones PNG via Canvas (auxiliar)
```

### Duas versoes

| Versao | Arquivo | Descricao |
|--------|---------|-----------|
| **Original** | `index.html` | Tudo em um arquivo so (HTML + CSS + JS inline). Pratico para compartilhar |
| **PWA Responsiva** | `app/index.html` | Separada em arquivos, responsiva, instalavel, funciona offline |

## Funcionalidades (app/index.html)

- **Busca por nome**: Digite o nome do monstro (parcial ou completo) para filtrar
- **Filtro por elemento**: Filtre monstros por seu elemento principal (Fire, Water, Thunder, Ice, Dragon, Non-Elem)
- **Filtro por tipo/genus**: Filtre por categoria (Flying Wyvern, Brute Wyvern, Fanged Wyvern, etc.)
- **Filtro por tier**: Filtre por ranking de tier (SS, S, A, B)
- **Exibicao completa**: Para cada monstro sao exibidos:
  - Nome, Rank (1★ a 7★) e Tier
  - Tipo (Genus), Elemento e Tipo de Ataque primario
  - **Padroes de Ataque (Head-to-Head)**: Tabela mostrando por estado de transformacao qual tipo de ataque o monstro usa e qual tipo voce deve usar para vencer
  - Fraquezas elementais (Fire, Water, Thunder, Ice, Dragon) em escala de 0-3
  - Resistencias a ailments (Poison, Paralysis, Sleep, Blast, Stun, Bleed)
  - Tendencias de stats (HP, ATK, SPD, DEF) em barra visual
  - Localizacao dos ovos
  - Link direto para o guia completo no Game8
- **Responsivo**: Layout adapta-se a desktop, tablet e celular
- **Acessibilidade**: aria-labels, aria-live, HTML semantico
- **Botao Voltar ao Topo**: Aparece ao rolar a pagina
- **Debounce na busca**: Evita re-renders desnecessarios ao digitar
- **Touch-friendly**: Inputs com 16px em dispositivos touch (sem zoom indesejado)
- **Print-ready**: Esconde filtros e rodape ao imprimir
- **PWA (Progressive Web App)**: Instalavel no Android/iOS como app nativo
- **Offline**: Funciona sem internet apos primeiro acesso (Service Worker com cache)
- **Install Prompt**: Banner convida o usuario a instalar o app
- **Offline Banner**: Indica quando o usuario esta sem conexao

### Sistema Head-to-Head (Pedra-Papel-Tesoura)

O combate em MHS3 utiliza um sistema de tipos de ataque:

| Tipo | Cor | Vence | Perde para |
|------|-----|-------|------------|
| **Power** | Vermelho | Technical | Speed |
| **Speed** | Azul | Power | Technical |
| **Technical** | Verde | Speed | Power |

Cada monstro usa um tipo de ataque dominante que pode mudar dependendo do seu estado (Normal, Enraged, Airborne, etc.). A tabela de padroes de ataque no guia mostra exatamente qual tipo usar em cada situacao.

## Dados dos Monstros

### Fontes de Dados

Os dados foram compilados e cruzados a partir de multiplas fontes:

- **[Game8 - MHS3 Wiki](https://game8.co/games/Monster-Hunter-Stories-3)**: Ranks, stats, estados de transformacao, localizacao de ovos, genus
- **[GamerGuides](https://www.gamerguides.com/monster-hunter-stories-3-twisted-reflection)**: Tipos de ataque (P/S/T) por fase de combate
- **[NeonLightsMedia](https://www.neonlightsmedia.com/blog/mhs3-monster-weakness-locations)**: Cross-reference de ranks, elementos e fraquezas

### Cobertura

- **65 monsties** catalogados com dados completos
- **Padroes de ataque** verificados por estado de transformacao (Normal, Enraged, Airborne, etc.)
- **Fraquezas elementais** em escala 0 (Imune) a 3 (Muito Fraco)
- **Resistencias a ailments** em escala 0 (Imune) a 2 (Fraco)
- **Tendencias de stats** (HP, ATK, SPD, DEF) em escala de 1-10
- **Localizacoes de ovos** por regiao
- **Tier list** dos melhores Monsties (SS, S, A, B)

### Regioes do Jogo

| Regiao | Capitulo | Monstros Notaveis |
|--------|----------|-------------------|
| **Azuria** | Capitulo 1 | Velocidrome, Rathian, Lagiacrus, Namielle |
| **Canalta Timberland** | Capitulo 2 | Nargacuga, Mizutsune, Seregios, Aknosom |
| **Tarkuan** | Capitulo 3 | Diablos, Espinas, Zinogre, Rey Dau |
| **Serathis** | Capitulo 4 | Deviljho, Malzeno, Velkhana, Arkveld |

### Principais Categorias de Monstros

- **Monsties**: Monstros que podem ser chocados, montados e usados em batalha (85 no lancamento)
- **Feral Monsters**: Versoes agressivas com cristais que aparecem como bosses de campo
- **Invasive Monsters**: Monstros invasores noturnos que ameacam especies locais
- **Elder Dragons**: Dragoes ancioes extremamente poderosos (Namielle, Velkhana, Malzeno, etc.)
- **Deviant Monsters**: Variantes obtidas via Habitat Restoration rank S (Dreadking, Silverwind, etc.)

## Pre-requisitos

| Ferramenta | Versao Testada | Como Instalar |
|------------|---------------|---------------|
| **Node.js** | v24.14.0 LTS | `winget install OpenJS.NodeJS.LTS` |
| **npm** | 11.9.0 | Vem junto com o Node.js |
| **serve** | 14.2.6 | Instalado automaticamente via `npx` |

> Apos instalar o Node.js, feche e reabra o terminal para que o PATH seja atualizado.

## Como Rodar o Servidor Local

### Passo a passo

1. Abra um terminal (PowerShell, CMD ou terminal do Cursor) na pasta do projeto:

   ```
   cd C:\Users\adria\OneDrive\Documentos\Cursor\MHS3
   ```

2. Inicie o servidor apontando para a pasta `app`:

   ```
   npx serve app
   ```

3. O terminal ira exibir:

   ```
   INFO  Accepting connections at http://localhost:3000
   ```

4. Abra no navegador: **http://localhost:3000**

### Acessar pelo celular (mesma rede Wi-Fi)

1. Com o servidor rodando no PC, descubra seu IP local:

   ```
   ipconfig
   ```

   Procure a linha `Endereco IPv4` (ex: `10.0.0.151`)

2. No celular, conecte na mesma rede Wi-Fi do PC

3. Abra o Chrome no celular e acesse:

   ```
   http://10.0.0.151:3000
   ```

   (substitua pelo seu IP)

4. O Chrome ira exibir o banner **"Instalar o MHS3 Guia no seu dispositivo?"** - toque em **Instalar**

5. O app aparecera na home screen do celular com o icone MHS3 e funcionara offline

### Parar o servidor

Pressione `Ctrl+C` no terminal onde o `npx serve` esta rodando.

## Como Instalar no Celular (PWA) - Outras Opcoes

### GitHub Pages (ja configurado)

O app esta publicado em: **https://lochesystem.github.io/MHS3/**

1. Acesse a URL acima no Chrome do celular
2. O banner **"Instalar o MHS3 Guia"** aparecera automaticamente (HTTPS)
3. Toque em **Instalar** — o app fica na home screen e funciona offline

Qualquer push na branch `master` faz deploy automatico via GitHub Actions.

### Arquivo unico (sem instalacao, sem servidor)

1. Envie o `index.html` (da raiz) via WhatsApp, Drive ou cabo USB
2. Abra no Chrome do celular - funciona direto, sem servidor
3. Nao tera funcionalidade PWA/offline, mas todo o conteudo esta no arquivo

## Links Uteis

- [Game8 Wiki - MHS3](https://game8.co/games/Monster-Hunter-Stories-3)
- [Todas as Fraquezas e Tipos de Ataque (Game8)](https://game8.co/games/Monster-Hunter-Stories-3/archives/585975)
- [Tier List de Monsties (Game8)](https://game8.co/games/Monster-Hunter-Stories-3/archives/586383)
- [Localizacao de Ovos (Game8)](https://game8.co/games/Monster-Hunter-Stories-3/archives/585665)
- [Mapa Interativo (Game8)](https://game8.co/games/Monster-Hunter-Stories-3/archives/584831)
- [Padroes de Ataque - GamerGuides](https://www.gamerguides.com/monster-hunter-stories-3-twisted-reflection/guide/getting-started/gameplay/all-monster-attack-types-power-technique-or-speed)
- [Guia de Fraquezas - NeonLightsMedia](https://www.neonlightsmedia.com/blog/mhs3-monster-weakness-locations)

## Creditos

Dados compilados do [Game8](https://game8.co/games/Monster-Hunter-Stories-3), [GamerGuides](https://www.gamerguides.com/monster-hunter-stories-3-twisted-reflection) e [NeonLightsMedia](https://www.neonlightsmedia.com/blog/mhs3-monster-weakness-locations).
Todos os direitos dos assets e conteudo do jogo pertencem a **CAPCOM Co., Ltd.**
