# Test: Plugin is Working!

This is a simple test to verify the JSON Table Query plugin is rendering tables correctly.

## Example 1: Basic Table

```jtable
fields: [name, score]
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```

**Expected**: Table with 2 columns (name, score) and 3 rows

---

## Example 2: With Filtering

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

**Expected**: Table with only Alice and Cara (scores 10 and 9)

---

## Example 3: With Sorting

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
  {"name": "Cara", "score": 9}
]
```

**Expected**: Sorted by score descending: Alice (10), Cara (9), Bob (7)

---

## Example 4: With Limit

```jtable
fields: [name, score]
limit: 2
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```

**Expected**: Only first 2 rows shown

---

## Success Indicators

If you see tables above each JSON block without error messages, the plugin is working! ✅

If you see red error panels, the plugin is loaded but there's an issue with the query or data.
