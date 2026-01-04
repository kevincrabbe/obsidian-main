# Claude Code Rules

## Markdown Table Formatting

When editing markdown tables, use minimal alignment (simple pipes and dashes only) to avoid large git diffs:

**DO:**
```
| Header 1 | Header 2 | Header 3 |
|---|---|---|
| value | value | value |
```

**DON'T:**
```
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| value    | value    | value    |
```

This prevents unnecessary whitespace changes that make diffs harder to read and obscure the actual content changes.
