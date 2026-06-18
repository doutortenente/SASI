Patient-acuity badge — the core gravity language. Five levels with fixed Portuguese labels and colors.

```jsx
<GravityBadge level="critical" />        {/* Crítico */}
<GravityBadge level="watcher" size="sm" />
<GravityBadge level="stable" dot />      {/* dot + label, transparent bg */}
```

- `level`: `stable` (Estável) · `watcher` · `unstable` (Instável) · `critical` (Crítico) · `deceased` (Óbito).
- `size`: `sm | md | lg`. `label` overrides the default text. `dot` renders the minimal dot form.
