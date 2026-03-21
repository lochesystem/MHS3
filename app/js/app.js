(() => {
  'use strict';

  const ELEM_LABELS = ['Fire', 'Water', 'Thunder', 'Ice', 'Dragon'];
  const ELEM_KEYS   = ['fire', 'water', 'thunder', 'ice', 'dragon'];
  const AIL_LABELS  = ['Poison', 'Paralysis', 'Sleep', 'Blast', 'Stun', 'Bleed'];
  const AIL_KEYS    = ['poison', 'para', 'sleep', 'blast', 'stun', 'bleed'];
  const WK_CLASSES  = ['wk-immune', 'wk-resist', 'wk-neutral', 'wk-weak', 'wk-veryweak'];
  const WK_TEXT     = ['Immune', 'Resist', 'Normal', 'Weak', 'V.Weak'];
  const PAT_FULL    = { P: 'Power', S: 'Speed', T: 'Technical' };
  const COUNTER     = { P: 'S', S: 'T', T: 'P' };
  const COUNTER_LBL = { P: 'Speed', S: 'Technical', T: 'Power' };
  const ELEM_CLASS_MAP = {
    Fire: 'fire', Water: 'water', Thunder: 'thunder',
    Ice: 'ice', Dragon: 'dragon', 'Non-Elem': 'none'
  };

  function elemClass(el) {
    return ELEM_CLASS_MAP[el] || 'none';
  }

  function buildPatternHTML(patterns) {
    if (!patterns) return '';
    let rows = '';
    for (const [state, type] of Object.entries(patterns)) {
      const c = COUNTER[type];
      rows += `<tr>
        <td class="pt-state">${state}</td>
        <td class="pt-uses pt-${type}">${PAT_FULL[type]}</td>
        <td class="pt-counter pt-counter-${c}">Use ${COUNTER_LBL[type]}</td>
      </tr>`;
    }
    return `<table class="pattern-table">
      <tr>
        <td class="pt-header">Estado</td>
        <td class="pt-header" style="text-align:center">Monstro usa</td>
        <td class="pt-header" style="text-align:center">Voce usa</td>
      </tr>
      ${rows}
    </table>`;
  }

  function buildWeaknessHTML(weakElem) {
    return ELEM_KEYS.map((k, i) => {
      const v = weakElem[k];
      return `<div class="weakness-cell ${WK_CLASSES[v]}">
        <span class="weakness-cell__name">${ELEM_LABELS[i]}</span>${WK_TEXT[v]}
      </div>`;
    }).join('');
  }

  function buildAilmentHTML(ailments) {
    return AIL_KEYS.map((k, i) => {
      const v = ailments[k];
      return `<div class="ailment-cell ${WK_CLASSES[v]}">
        <span class="ailment-cell__name">${AIL_LABELS[i]}</span>${WK_TEXT[v]}
      </div>`;
    }).join('');
  }

  function renderCard(m) {
    const eggText = m.egg || 'N/A';
    const linkHTML = m.link
      ? `<a class="card__link" href="https://game8.co/games/Monster-Hunter-Stories-3/archives/${m.link}" target="_blank" rel="noopener">Game8 Wiki &rarr;</a>`
      : '';

    return `<article class="card">
      <div class="card__header">
        <h3 class="card__name">
          ${m.name}
          <span class="card__rank">${m.rank}</span>
        </h3>
      </div>
      <div class="card__body">
        <div class="tags">
          <span class="tag">${m.genus}</span>
          <span class="tag tag--elem tag--${elemClass(m.element)}">${m.element}</span>
          <span class="tag">${m.attackType}</span>
        </div>

        <div class="section-label">Padroes de Ataque (Head-to-Head)</div>
        ${buildPatternHTML(m.patterns)}

        <div class="section-label">Fraquezas Elementais</div>
        <div class="weakness-grid">${buildWeaknessHTML(m.weakElem)}</div>

        <div class="section-label">Resistencia a Ailments</div>
        <div class="ailment-grid">${buildAilmentHTML(m.ailments)}</div>
      </div>
      <div class="card__footer">
        <span class="card__egg">${eggText}</span>
        ${linkHTML}
      </div>
    </article>`;
  }

  /* --- State & DOM refs --- */
  let debounceTimer = null;
  const $search  = document.getElementById('searchInput');
  const $elem    = document.getElementById('filterElement');
  const $genus   = document.getElementById('filterGenus');
  const $grid    = document.getElementById('monsterGrid');
  const $empty   = document.getElementById('noResults');
  const $count   = document.getElementById('resultCount');
  const $top     = document.getElementById('backToTop');

  function filterAndRender() {
    const q      = $search.value.toLowerCase().trim();
    const elemF  = $elem.value;
    const genusF = $genus.value;

    const filtered = MONSTERS.filter(m => {
      if (q && !m.name.toLowerCase().includes(q)) return false;
      if (elemF && m.element !== elemF) return false;
      if (genusF && m.genus !== genusF) return false;
      return true;
    });

    if (filtered.length === 0) {
      $grid.innerHTML = '';
      $empty.style.display = 'block';
      $count.textContent = '0 monstros encontrados';
    } else {
      $empty.style.display = 'none';
      $grid.innerHTML = filtered.map(renderCard).join('');
      const s = filtered.length > 1 ? 's' : '';
      $count.textContent = `${filtered.length} monstro${s} encontrado${s}`;
    }
  }

  function debouncedFilter() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(filterAndRender, 150);
  }

  /* --- Back to Top --- */
  function handleScroll() {
    if (window.scrollY > 600) {
      $top.classList.add('visible');
    } else {
      $top.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* --- Offline Banner --- */
  const $offline = document.getElementById('offlineBanner');

  function updateOnlineStatus() {
    if (!navigator.onLine) {
      $offline.classList.add('visible');
    } else {
      $offline.classList.remove('visible');
    }
  }

  /* --- Install Prompt (A2HS) --- */
  let deferredPrompt = null;
  const $installBanner = document.getElementById('installBanner');
  const $installBtn    = document.getElementById('installBtn');
  const $installClose  = document.getElementById('installClose');

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    $installBanner.classList.add('visible');
  });

  $installBtn.addEventListener('click', () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      $installBanner.classList.remove('visible');
    });
  });

  $installClose.addEventListener('click', () => {
    $installBanner.classList.remove('visible');
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    $installBanner.classList.remove('visible');
    deferredPrompt = null;
  });

  /* --- Init --- */
  $search.addEventListener('input', debouncedFilter);
  $elem.addEventListener('change', filterAndRender);
  $genus.addEventListener('change', filterAndRender);
  $top.addEventListener('click', scrollToTop);
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  updateOnlineStatus();
  filterAndRender();
})();
