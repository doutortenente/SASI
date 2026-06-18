// templates/comando-uti-dashboard/ds-base.js
// Loads the SASI · Comando UTI design system (styles + compiled component bundle)
// with a single line. In a consuming project, repoint `base` at the bound
// _ds/<folder> tree relative to this page.
(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error(
    'ds-base.js: failed to load ' + s.src +
    ' — point the base line at the bound _ds/<folder> tree relative to this page' +
    ' (e.g. _ds/<folder> at the project root, ../_ds/<folder> one level down).' +
    ' In a fresh design system this just means the bundle is not compiled yet.'
  );
  document.head.appendChild(s);
})();
