const slug = document.body.dataset.language;
const catalog = window.languageCatalog || {};
const meta = catalog[slug];

const els = {
  title: document.getElementById('language-title'),
  subtitle: document.getElementById('language-subtitle'),
  description: document.getElementById('language-description'),
  scriptLabel: document.getElementById('language-script'),
  count: document.getElementById('font-count'),
  gallery: document.getElementById('font-gallery'),
  resultCount: document.getElementById('result-count'),
  template: document.getElementById('font-card-template')
};

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function genericFamily(category) {
  if (category === 'serif') return 'serif';
  if (category === 'monospace') return 'monospace';
  if (category === 'handwriting') return 'cursive';
  return 'sans-serif';
}

function deriveCategory(font) {
  if (font.category) return font.category;
  if (font.style === 'Handwriting') return 'handwriting';
  if (font.style === 'Display') return 'display';
  if (/Serif/i.test(font.name)) return 'serif';
  if (/Mono|Code/i.test(font.name)) return 'monospace';
  return 'sans-serif';
}

function importGoogleFonts(fonts) {
  if (!fonts.length) return;
  const families = fonts.map(({ name }) => `family=${name.replace(/ /g, '+')}:wght@400;700`).join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}

function renderGallery(fonts) {
  els.gallery.textContent = '';
  fonts.forEach((font) => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    const category = deriveCategory(font);
    node.querySelector('.font-name').textContent = font.name;
    node.querySelector('.font-preview').textContent = meta.sample;
    node.querySelector('.font-preview').style.fontFamily = `'${font.name}', ${genericFamily(category)}`;
    node.querySelector('.category-pill').textContent = titleCase(category.replace('-', ' '));
    node.querySelector('.script-pill').textContent = meta.script;
    node.querySelector('.style-pill').textContent = font.style || 'Text';

    const viewLink = node.querySelector('.view-btn');
    viewLink.href = `https://fonts.google.com/?query=${encodeURIComponent(font.name)}`;

    els.gallery.appendChild(node);
  });
}

function bootstrap() {
  if (!meta) return;
  document.title = `${meta.name} Fonts | Font Explorer`;
  els.title.textContent = `${meta.name} Fonts`;
  els.subtitle.textContent = meta.tagline;
  els.description.textContent = meta.description;
  els.scriptLabel.textContent = meta.script;
  els.count.textContent = `${meta.fonts.length} fonts`;
  els.resultCount.textContent = `${meta.fonts.length} fonts available`;
  importGoogleFonts(meta.fonts);
  renderGallery(meta.fonts);
}

bootstrap();
