Command button — primary drives the one decisive action per surface.

```jsx
<Button variant="primary" icon={<i data-lucide="file-down"></i>}>Exportar PDF</Button>
<Button variant="success" icon={<i data-lucide="plus"></i>}>Novo Leito</Button>
<Button variant="secondary" size="sm">Copiar</Button>
<Button variant="ghost">Editar</Button>
```

- `variant`: `primary | secondary | ghost | soft | danger | success`.
- `size`: `sm | md | lg`. `block` for full width. `icon` / `iconRight` take nodes. `as="a"` to render a link.
