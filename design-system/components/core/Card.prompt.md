Surface container — panels, sub-cards, leito tiles. Supports the numbered 1–5 workflow header and a gravity left-accent.

```jsx
<Card number="3" eyebrow="Eixo Estado" title="Situação Atual"
      action={<Button size="sm" variant="soft">Editar</Button>}>
  …
</Card>

<Card gravity="critical" interactive>…</Card>
```

- `title` / `eyebrow` / `number` / `action` build the common header.
- `gravity` adds the colored left bar; `interactive` adds hover-lift; `padded` (default true).
