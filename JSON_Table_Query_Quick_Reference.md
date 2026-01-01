# JSON Table Query - Quick Reference Guide

A quick reference for using the JSON Table Query Obsidian plugin.

## Basic Template

```jtable
fields: [field1, field2]
where:
  op: eq
  path: fieldName
  value: compareValue
sort:
  - path: fieldName
    dir: asc
limit: 10
```

```json
[
  {"field1": "value", "field2": "value"},
  {"field1": "value", "field2": "value"},
{"field1": "value", "field2": "value"},
{"field1": "value", "field2": "value"}
]
```

## Common Filter Operations

### Equality
```yaml
where:
  op: eq
  path: status
  value: active
```

### Comparison
```yaml
where:
  op: gte
  path: score
  value: 80
```

### Multiple Conditions (AND)
```yaml
where:
  op: and
  args:
    - op: gte
      path: score
      value: 80
    - op: eq
      path: grade
      value: A
```

### Multiple Conditions (OR)
```yaml
where:
  op: or
  args:
    - op: eq
      path: grade
      value: A
    - op: eq
      path: grade
      value: B
```

### In List
```yaml
where:
  op: in
  path: category
  value: [tech, science, math]
```

### Regular Expression
```yaml
where:
  op: regex
  path: email
  value: "@example\\.com$"
  flags: i
```

### Field Exists
```yaml
where:
  op: exists
  path: optionalField
```

## Sorting

### Single Field
```yaml
sort:
  - path: name
    dir: asc
```

### Multiple Fields
```yaml
sort:
  - path: priority
    dir: desc
  - path: date
    dir: desc
  - path: name
    dir: asc
```

## Pagination

### Limit Only
```yaml
limit: 10
```

### Offset + Limit
```yaml
limit: 10
offset: 20
```

## Field Specifications

### Simple Fields
```yaml
fields: [name, email, score]
```

### Nested Fields (Dot Path)
```yaml
fields: [name, "user.email", "company.address.city"]
```

### Array Access
```yaml
fields: ["tags[0]", "items[1].name"]
```

### With Labels and Formatting
```yaml
fields:
  - path: name
    label: Full Name
  - path: score
    label: Test Score
    format: number
  - path: date
    label: Date
    format: date
    default: "N/A"
```

## Rendering Options

```yaml
render:
  title: Students
  footer: count
  showDataBlock: true
  collapseData: false
```

## Operators Reference

| Operator | Path Required? | Value Required? | Description |
|----------|---|---|---|
| `eq` | Yes | Yes | Equal to |
| `ne` | Yes | Yes | Not equal |
| `gt` | Yes | Yes | Greater than |
| `gte` | Yes | Yes | Greater than or equal |
| `lt` | Yes | Yes | Less than |
| `lte` | Yes | Yes | Less than or equal |
| `in` | Yes | Yes (array) | Value in array |
| `contains` | Yes | Yes | String/array contains |
| `exists` | Yes | No | Field exists |
| `regex` | Yes | Yes | Regex match |
| `and` | No | Yes (args) | All conditions true |
| `or` | No | Yes (args) | Any condition true |
| `not` | No | Yes (arg) | Negate condition |

## Format Options

| Format | Use For | Example |
|--------|---------|---------|
| `auto` | Any data | Smart formatting |
| `json` | Complex objects | Pretty-printed JSON |
| `date` | Date strings | `2024-01-15` → 1/15/2024 |
| `number` | Numeric values | `1000` → 1,000 |
| `md` | Markdown text | (coming soon) |

## Tips & Tricks

### Get Unique Values
```yaml
fields: [category]
distinct: true
```

### Show Top N Results
```yaml
sort:
  - path: score
    dir: desc
limit: 5
```

### Skip First N Results
```yaml
offset: 10
limit: 10
```

### Complex Filter - Active Users with High Score
```yaml
where:
  op: and
  args:
    - op: eq
      path: status
      value: active
    - op: gte
      path: score
      value: 90
```

### Date Range Query
```yaml
where:
  op: and
  args:
    - op: gte
      path: date
      value: "2024-01-01"
    - op: lte
      path: date
      value: "2024-12-31"
```

### Search (Partial Name Match)
```yaml
where:
  op: regex
  path: name
  value: "john"
  flags: i
```

## JSON Format Alternative

If you prefer JSON syntax for queries:

```jtable
{
  "fields": ["name", "score"],
  "where": {
    "op": "gte",
    "path": "score",
    "value": 80
  },
  "sort": [{"path": "score", "dir": "desc"}],
  "limit": 10
}
```

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No JSON data block found" | Missing JSON block after query | Add a `json` code block after the query |
| "JSON parse error" | Malformed JSON data | Check JSON syntax, use validator |
| "Unknown field: fieldname" | Field doesn't exist in data | Check field name spelling, use correct path |
| "Invalid YAML in jtable block" | Syntax error in query | Verify YAML indentation and syntax |

## Debug Mode

Enable debug logging in plugin settings to see query execution details in the console.

1. Open plugin settings
2. Enable "Show query logs (dev mode)"
3. Open Obsidian console (Ctrl+Shift+I on Windows/Linux, Cmd+Option+I on Mac)
4. Run your queries to see execution details
