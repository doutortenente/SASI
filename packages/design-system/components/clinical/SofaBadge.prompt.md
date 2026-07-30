SOFA score chip with threshold coloring and optional Δ24h — the Sepsis-3 signal.

```jsx
<SofaBadge score={13} delta={3} />   {/* red value + ↑+3 */}
<SofaBadge score={2} />
<SofaBadge score={8} delta={-1} showIcon={false} />
```

- `score`: 0–24 (null → em dash), colored low→critical.
- `delta`: Δ24h; positive = worsening (red), negative = improving (emerald).
- `showIcon`: leading activity glyph (needs Lucide on the page).
- Helper `sofaColor(score)` returns the matching CSS-var color.
