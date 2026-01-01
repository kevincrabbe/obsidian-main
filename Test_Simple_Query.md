# Simple Test Query

This is a simple test to verify the plugin is working.

## Test 1: Show All Data

```jtable
fields: [name, score]
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9},
  {"name": "fda", "score": 9}
]
```

## Test 2: Filter with Greater Than

Show only students with score >= 8:

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

## Test 3: Sort by Score Descending

```jtable
fields: [name, score]
sort:
  - path: score
    dir: desc
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9},
  {"name": "David", "score": 6}
]
```

## Test 4: Limit Results

Show top 2:

```jtable
fields: [name, score]
sort:
  - path: score
    dir: desc
limit: 2
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9},
  {"name": "David", "score": 6}
]
```
