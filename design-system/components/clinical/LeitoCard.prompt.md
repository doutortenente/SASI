Patient bed card — the dashboard's atomic tile; composes gravity, SOFA, the hero problem with vetor, and therapy pills. Use it anywhere you list ICU beds.

```jsx
<LeitoCard
  bed="09" uti="UTI3" name="Carlos Mendes" age={71}
  gravity="critical" sofa={13} deltaSofa={3} septic
  problems={[
    { text: 'Choque séptico SCAI C, foco pulmonar', vetor: '↑' },
    { text: 'IRA KDIGO 3 em HD', vetor: '=' },
  ]}
  dva={2} sed={1} vm atb pend={3}
  onClick={() => openFicha(id)}
/>
```

- `gravity`: `stable | watcher | unstable | critical | deceased` → left accent + badge; `critical` (or `septic`) adds the attention pulse.
- `problems[0]` becomes the giant hero line; the rest list compactly.
- `compact` → dense form for the Round side-list.
- Therapy flags/counts: `dva`, `sed` (counts), `vm`, `vni`, `atb` (booleans), `pend` (count).
