# Permission Patterns

Canonical format:
- `view <resource>`
- `create <resource>`
- `edit <resource>`
- `delete <resource>`

Examples used in this project:
- `view user`
- `create product`
- `edit order`
- `delete purchase`

Avoid:
- Pluralized alternates (`edit users`) when singular exists (`edit user`).
- Synonyms for same capability across modules.
