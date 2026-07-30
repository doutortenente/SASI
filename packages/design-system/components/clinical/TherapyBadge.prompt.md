Therapy / device pill — drogas vasoativas, sedação, ventilação, ATB, pendências, Sepse-3.

```jsx
<TherapyBadge type="dva" count={2} />   {/* DVA 2 */}
<TherapyBadge type="vm" />
<TherapyBadge type="sepsis" pulse />    {/* red, attention pulse */}
```

- `type`: `dva | sed | vm | vni | atb | pend | sepsis`.
- `count` appends a number; `label` overrides text; `showIcon` toggles the Lucide glyph; `pulse` adds the critical animation.
