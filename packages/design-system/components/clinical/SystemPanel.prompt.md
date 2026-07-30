Organ-system summary panel — colored left accent + system glyph + key/value rows. The unit of the Round preview and Avaliação por Sistemas.

```jsx
<SystemPanel system="hemo" rows={[
  { k: 'PAM', v: '58' }, { k: 'Lactato', v: '4.1' }, { k: 'DVA', v: 'Nora 0.16' },
]} />

{/* or pass a flat object, or nest children */}
<SystemPanel system="resp" data={{ modo: 'VCV', peep: 10, spo2: '91%' }} />
```

- `system`: `neuro | resp | hemo | tgi | renal | hemato | infecto` → sets color, glyph, default title.
- Provide `rows` (`[{k,v}]`), `data` (flat object), and/or `children`.
