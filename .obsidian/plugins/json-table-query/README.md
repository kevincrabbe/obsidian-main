# JSON Table Query - Obsidian Plugin

Query and render tables from JSON datasets embedded directly in your Obsidian notes.

## Features

- **Queryable Tables**: Write queries to filter, sort, and limit JSON data
- **Live Preview**: See results in both Reading and Live Preview modes
- **YAML & JSON Syntax**: Query blocks support both YAML and JSON formats
- **Flexible Filtering**: Support for equality, comparison, regex, and logical operators
- **Sorting & Pagination**: Sort by multiple fields, apply limit and offset
- **Dot-Path Access**: Query nested object properties with dot notation (e.g., `user.profile.name`)
- **Error Handling**: Clear error messages for syntax and data issues
- **Native Styling**: Uses Obsidian's theme colors and styling

## Quick Start

### Basic Example

Write a query block followed by a JSON data block:

````markdown
```jtable
fields: [name, score]
where:
  op: gte
  path: score
  value: 8
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```
````

The plugin will render a table showing only Alice and Cara (score >= 8).

## Query Syntax

### Query Block Format

Query blocks use the `jtable` language identifier:

````markdown
```jtable
fields: [name, score]
```
````

### Query Options

#### `fields` - Select Columns

Specify which fields to display:

```yaml
fields: [name, score, grade]
```

Or with full field specs:

```yaml
fields:
  - path: name
    label: Student Name
  - path: score
    label: Score
    format: number
```

#### `where` / `filter` - Filter Data

Both `where` and `filter` work the same way. Use filter expressions:

```yaml
where:
  op: gte
  path: score
  value: 8
```

**Supported operators:**
- `eq` - Equal
- `ne` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal
- `in` - Value in array
- `contains` - String/array contains value
- `exists` - Field exists
- `regex` - Regex match (with optional `flags`)

**Logical operators:**
- `and` - All conditions must match
- `or` - Any condition must match
- `not` - Negate a condition

Example with AND:

```yaml
where:
  op: and
  args:
    - op: gte
      path: score
      value: 8
    - op: eq
      path: grade
      value: A
```

#### `sort` - Sort Results

Sort by one or more fields:

```yaml
sort:
  - path: score
    dir: desc
  - path: name
    dir: asc
```

Direction: `asc` (default) or `desc`

#### `limit` / `offset` - Pagination

```yaml
limit: 10
offset: 5
```

#### `distinct` - Remove Duplicates

```yaml
distinct: true
```

Removes duplicate rows based on selected fields.

#### `render` - Customize Display

```yaml
render:
  title: "My Table"
  footer: count
  showDataBlock: true
  collapseData: false
```

Options:
- `title` - Display a title above the table
- `footer` - Show footer: `count` (row count) or `none`
- `showDataBlock` - Show the raw JSON block (default: true)
- `collapseData` - Make JSON block collapsible (default: false)

### Field Specification

Full field spec with formatting:

```yaml
fields:
  - path: user.email
    label: Email Address
    format: auto
    default: "No email"
```

Formats:
- `auto` (default) - Smart formatting
- `json` - Display as JSON
- `date` - Format as date
- `number` - Format as number with locale
- `md` - Render as markdown (future)

## Data Block Format

Data blocks use standard `json` language:

````markdown
```json
[
  {"id": 1, "name": "Alice", "score": 10},
  {"id": 2, "name": "Bob", "score": 7}
]
```
````

### Data Types

**Array of objects** (most common):
```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7}
]
```

**Single object** (converted to single row):
```json
{"name": "Alice", "score": 10}
```

**Object with primitives** (converted to key-value rows):
```json
{"setting1": "value1", "setting2": "value2"}
```

## Advanced Features

### Nested Object Access

Access nested properties with dot notation:

```yaml
fields: [name, "user.profile.email", "user.settings.theme"]
```

Supports bracket notation for arrays:
```yaml
fields: ["tags[0]", "metadata.tags[0].name"]
```

### JSON Format for Queries

If you prefer JSON syntax for queries:

```json
{
  "fields": ["name", "score"],
  "where": {
    "op": "gte",
    "path": "score",
    "value": 8
  },
  "sort": [{"path": "score", "dir": "desc"}],
  "limit": 10
}
```

### Marker-Based Dataset Linking

Link queries to specific datasets using markers (Phase 2 feature):

```markdown
<!-- jtable:data id=students -->
```json
[...]
```

```jtable
data:
  ref: students
fields: [name, score]
```
```

## Settings

Access settings from Obsidian's plugin settings:

- **Enable JavaScript functions** - Allow `js.filterFn`, `js.sortFn`, `js.mapFn` (disabled by default for security)
- **Enable data caching** - Cache parsed JSON for performance
- **Cache size** - Number of data blocks to cache
- **Show table borders** - Display cell borders
- **Alternate row colors** - Striped row styling
- **Show error details** - Display detailed error messages

## Error Handling

The plugin provides clear error messages:

- **Syntax errors**: JSON/YAML parsing issues
- **Data errors**: Missing datasets or invalid JSON
- **Validation errors**: Invalid field references
- **Execution errors**: Runtime issues during filtering/sorting

All errors display in an error panel. The raw JSON block remains visible.

## Performance

- JSON data is parsed once and cached
- Rendering is optimized with document fragments
- Supports datasets with 1000+ rows
- Configurable row limit for very large datasets

## Examples

See `JSON_Table_Query_Tests.md` in your vault for comprehensive examples covering:
- Basic queries
- Filtering with various operators
- Sorting and pagination
- Nested object access
- Error cases

## Limitations (MVP v1)

- No join/merge across datasets
- No custom computed columns (planned for v2)
- No clickable headers for sorting (planned for v2)
- No CSV export (planned for v2)

## Roadmap

- Phase 2: Explicit dataset linking, advanced filtering UI
- Phase 3: Computed columns, aggregations, groupBy
- Phase 4: CSV/JSON export, query builder UI, virtualization

## Security

- **JavaScript functions disabled by default**
- No `eval()` or dynamic code execution
- Use `new Function()` with restricted scope when enabled
- Clear warning when enabling JS functions

## Support

For issues, feature requests, or documentation:
- Check the [GitHub repository](https://github.com/anthropics/claude-code)
- See example test file: `JSON_Table_Query_Tests.md`

## License

MIT
