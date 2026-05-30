// Core font catalog used by gallery, comparison, and filters.
const fonts = [
  { name: 'Roboto', category: 'sans-serif', popularity: 10, pairing: 'Merriweather' },
  { name: 'Open Sans', category: 'sans-serif', popularity: 9, pairing: 'Lora' },
  { name: 'Lato', category: 'sans-serif', popularity: 9, pairing: 'Playfair Display' },
  { name: 'Montserrat', category: 'sans-serif', popularity: 8, pairing: 'Source Serif Pro' },
  { name: 'Poppins', category: 'sans-serif', popularity: 8, pairing: 'Merriweather' },
  { name: 'Nunito', category: 'sans-serif', popularity: 7, pairing: 'PT Serif' },
  { name: 'Merriweather', category: 'serif', popularity: 8, pairing: 'Roboto' },
  { name: 'Playfair Display', category: 'serif', popularity: 8, pairing: 'Lato' },
  { name: 'Lora', category: 'serif', popularity: 7, pairing: 'Open Sans' },
  { name: 'PT Serif', category: 'serif', popularity: 6, pairing: 'Nunito' },
  { name: 'Bitter', category: 'serif', popularity: 6, pairing: 'Source Sans 3' },
  { name: 'Oswald', category: 'display', popularity: 8, pairing: 'Lora' },
  { name: 'Bebas Neue', category: 'display', popularity: 7, pairing: 'Roboto' },
  { name: 'Anton', category: 'display', popularity: 7, pairing: 'Open Sans' },
  { name: 'Abril Fatface', category: 'display', popularity: 6, pairing: 'Montserrat' },
  { name: 'Pacifico', category: 'handwriting', popularity: 6, pairing: 'Poppins' },
  { name: 'Dancing Script', category: 'handwriting', popularity: 7, pairing: 'Roboto' },
  { name: 'Caveat', category: 'handwriting', popularity: 6, pairing: 'Lato' },
  { name: 'Fira Code', category: 'monospace', popularity: 7, pairing: 'Inter' },
  { name: 'Source Code Pro', category: 'monospace', popularity: 6, pairing: 'Merriweather' },
  { name: 'JetBrains Mono', category: 'monospace', popularity: 7, pairing: 'Poppins' },
  { name: 'Inconsolata', category: 'monospace', popularity: 5, pairing: 'Lora' }
];

const storageKeys = {
  favorites: 'font-explorer-favorites',
  recent: 'font-explorer-recent',
  theme: 'font-explorer-theme'
};
const MAX_RECENT_FONTS = 8;

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const state = {
  query: '',
  preview: 'The quick brown fox jumps over the lazy dog.',
  size: 32,
  category: 'all',
  sort: 'popularity',
  favorites: new Set(readJson(storageKeys.favorites, [])),
  compare: new Set(),
  recent: readJson(storageKeys.recent, [])
};

const els = {
  gallery: document.getElementById('font-gallery'),
  template: document.getElementById('font-card-template'),
  previewInput: document.getElementById('preview-text'),
  sizeInput: document.getElementById('font-size'),
  sizeOutput: document.getElementById('font-size-output'),
  searchInput: document.getElementById('font-search'),
  categoryFilter: document.getElementById('category-filter'),
  sortBy: document.getElementById('sort-by'),
  resultCount: document.getElementById('result-count'),
  comparison: document.getElementById('comparison-grid'),
  favorites: document.getElementById('favorites-list'),
  recent: document.getElementById('recent-list'),
  themeToggle: document.getElementById('theme-toggle')
};

function importGoogleFonts() {
  // Load all selected Google Fonts in one stylesheet request.
  const families = fonts.map(({ name }) => name.replace(/ /g, '+') + ':wght@400;700').join('&family=');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
  document.head.appendChild(link);
}

function saveState() {
  localStorage.setItem(storageKeys.favorites, JSON.stringify([...state.favorites]));
  localStorage.setItem(storageKeys.recent, JSON.stringify(state.recent));
}

function filteredFonts() {
  let list = fonts.filter((font) => {
    const queryMatch = font.name.toLowerCase().includes(state.query.toLowerCase());
    const categoryMatch = state.category === 'all' || font.category === state.category;
    return queryMatch && categoryMatch;
  });

  list.sort((a, b) => {
    if (state.sort === 'az') return a.name.localeCompare(b.name);
    if (state.sort === 'za') return b.name.localeCompare(a.name);
    return b.popularity - a.popularity || a.name.localeCompare(b.name);
  });

  return list;
}

function genericFamily(category) {
  if (category === 'serif') return 'serif';
  if (category === 'monospace') return 'monospace';
  if (category === 'handwriting') return 'cursive';
  return 'sans-serif';
}

function markRecentlyViewed(fontName) {
  state.recent = [fontName, ...state.recent.filter((name) => name !== fontName)].slice(0, MAX_RECENT_FONTS);
  saveState();
  renderMetaPanels();
}

function toggleFavorite(fontName) {
  if (state.favorites.has(fontName)) state.favorites.delete(fontName);
  else state.favorites.add(fontName);
  saveState();
  renderGallery();
  renderMetaPanels();
}

function toggleCompare(fontName) {
  if (state.compare.has(fontName)) {
    state.compare.delete(fontName);
  } else if (state.compare.size < 3) {
    state.compare.add(fontName);
    markRecentlyViewed(fontName);
  }
  renderGallery();
  renderComparison();
}

function renderGallery() {
  const data = filteredFonts();
  els.resultCount.textContent = `${data.length} font${data.length === 1 ? '' : 's'} shown`;
  els.gallery.textContent = '';

  data.forEach((font) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.querySelector('.font-name').textContent = font.name;
    node.querySelector('.font-preview').textContent = state.preview;
    node.querySelector('.font-preview').style.fontFamily = `'${font.name}', ${genericFamily(font.category)}`;
    node.querySelector('.font-preview').style.fontSize = `${state.size}px`;
    node.querySelector('.category-pill').textContent = font.category;
    node.querySelector('.popularity-badge').textContent = `Popularity ${font.popularity}/10`;
    node.querySelector('.pairing').textContent = `Pairs with ${font.pairing}`;

    const favoriteBtn = node.querySelector('.favorite-btn');
    favoriteBtn.textContent = state.favorites.has(font.name) ? '★ Favorited' : '☆ Favorite';
    favoriteBtn.classList.toggle('active', state.favorites.has(font.name));
    favoriteBtn.setAttribute('aria-pressed', String(state.favorites.has(font.name)));
    favoriteBtn.addEventListener('click', () => toggleFavorite(font.name));

    const compareBtn = node.querySelector('.compare-btn');
    compareBtn.textContent = state.compare.has(font.name) ? '✓ Selected' : 'Compare';
    compareBtn.classList.toggle('active', state.compare.has(font.name));
    compareBtn.setAttribute('aria-pressed', String(state.compare.has(font.name)));
    compareBtn.disabled = !state.compare.has(font.name) && state.compare.size >= 3;
    compareBtn.addEventListener('click', () => toggleCompare(font.name));

    const copyBtn = node.querySelector('.copy-btn');
    copyBtn.addEventListener('click', async () => {
      const value = `font-family: '${font.name}', ${genericFamily(font.category)};`;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        copyBtn.textContent = 'Copy unavailable';
        return;
      }
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy CSS';
      }, 1000);
      markRecentlyViewed(font.name);
    });

    const viewLink = node.querySelector('.view-btn');
    viewLink.href = `https://fonts.google.com/specimen/${font.name.replace(/ /g, '+')}`;
    viewLink.textContent = 'Download/View';
    viewLink.addEventListener('click', () => markRecentlyViewed(font.name));

    els.gallery.appendChild(node);
  });
}

function renderComparison() {
  els.comparison.textContent = '';
  const selected = [...state.compare];

  if (!selected.length) {
    const empty = document.createElement('p');
    empty.className = 'sample-block';
    empty.textContent = 'Select up to 3 fonts to compare alphabet, numbers, and paragraph samples.';
    els.comparison.appendChild(empty);
    return;
  }

  selected.forEach((name) => {
    const card = document.createElement('article');
    card.className = 'compare-card';
    const family = fonts.find((font) => font.name === name);
    const fallback = genericFamily(family ? family.category : 'sans-serif');
    card.innerHTML = `
      <h3>${name}</h3>
      <p style="font-family: '${name}', ${fallback}; font-size: ${Math.max(20, state.size - 4)}px;">Aa Bb Cc Dd Ee Ff Gg</p>
      <p style="font-family: '${name}', ${fallback}; font-size: ${Math.max(16, state.size - 8)}px;">0123456789 !@#$%</p>
      <p style="font-family: '${name}', ${fallback}; font-size: ${Math.max(14, state.size - 10)}px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    `;
    els.comparison.appendChild(card);
  });
}

function renderMetaPanels() {
  els.favorites.innerHTML = [...state.favorites]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `<li>${name}</li>`)
    .join('') || '<li>No favorites yet.</li>';

  els.recent.innerHTML = state.recent.map((name) => `<li>${name}</li>`).join('') || '<li>No recent views yet.</li>';
}

function applyTheme() {
  const theme = localStorage.getItem(storageKeys.theme) || 'light';
  document.body.classList.toggle('dark', theme === 'dark');
  els.themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function bindEvents() {
  els.previewInput.addEventListener('input', (event) => {
    state.preview = event.target.value || 'Type something...';
    renderGallery();
    renderComparison();
  });

  els.sizeInput.addEventListener('input', (event) => {
    state.size = Number(event.target.value);
    els.sizeOutput.textContent = `${state.size}px`;
    renderGallery();
    renderComparison();
  });

  els.searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim();
    renderGallery();
  });

  els.categoryFilter.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderGallery();
  });

  els.sortBy.addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderGallery();
  });

  els.themeToggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    localStorage.setItem(storageKeys.theme, dark ? 'dark' : 'light');
    applyTheme();
  });
}

importGoogleFonts();
applyTheme();
bindEvents();
renderGallery();
renderComparison();
renderMetaPanels();
