# Changelog

Todas as mudancas notaveis deste projeto serao documentadas neste arquivo.

## [1.1.0] - 2026-03-20

### Removido
- **Tier system**: removido o campo `tier` de todos os monstros, o filtro "Todos os Tiers" da barra de filtros, o badge de tier no header dos cards e todo o CSS associado (variaveis `--ss`, `--s`, `--a`, `--b` e classes `.card__tier`, `.tier-badge`)
- **Grafico de Tendencias de Stats**: removido o campo `stats` (HP, ATK, SPD, DEF) de todos os monstros, as barras de progresso nos cards e todo o CSS associado (`.stat`, `.stat__bar`, `.stat__label`, `.stat__val`, `.stat-bar-container`, etc.)

### Alterado
- Cards agora exibem apenas: nome, rank, genus, elemento, attack type, padroes de ataque, fraquezas elementais, ailments, egg location e link Game8
- Service Worker atualizado para cache v2 (`mhs3-guia-v2`) para forcar refresh nos dispositivos que ja tinham a versao anterior instalada
- Ambas as versoes atualizadas: `app/` (PWA responsiva) e `index.html` (versao original single-file)

## [1.0.0] - 2026-03-19

### Adicionado
- Versao responsiva em `app/` com estrutura de pastas organizada (HTML, CSS, JS separados)
- PWA (Progressive Web App) com `manifest.json` e `sw.js` (Service Worker)
- Suporte offline com estrategia Stale-While-Revalidate
- Banner de instalacao (Add to Home Screen) com prompt customizado
- Banner de status offline
- Botao "Voltar ao topo"
- Filtros: busca por nome, elemento, tipo (genus) e tier
- Legenda de fraquezas/resistencias e padroes de ataque
- Deploy automatico via GitHub Actions para GitHub Pages
- Icones PWA (192x192, 512x512) em PNG e SVG source
- Servidor local customizado (`server.js`) para desenvolvimento
- Documentacao tecnica em `DOCS.md`
- Runbook completo em `README.md`

### Versao Original
- `index.html` na raiz: versao single-file com todos os dados, CSS e JS inline
- 65+ monstros com dados de fraquezas, ailments, padroes de ataque e egg locations
- Dados compilados de Game8, GamerGuides e NeonLightsMedia
