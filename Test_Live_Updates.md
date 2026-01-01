# Test Live Updates

This note tests the live update feature. Edit the JSON or query below and the table should automatically re-render without needing to reload.

## Try This

1. Look at the table below
2. Edit the JSON data (add/remove rows, change values)
3. Watch the table update automatically as you type!

---

## Live Table Example

```jtable
fields: [name, score]
sort:
  - path: score
    dir: desc
```

```json
[
  {"name": "Alice", "score": 95},
  {"name": "Bob", "score": 87},
  {"name": "Cara", "score": 92},
  {"name": "David", "score": 78},
  {"name": "Lol", "score": 78},
  {"name": "haha", "score": 78},
  {"name": "new", "score": 78},
  {"name": "stuff", "score": 78}
]
```

---

## Try Editing

### Edit 1: Change the sort direction
Try changing `dir: desc` to `dir: asc` in the query above

### Edit 2: Add a filter
Try adding this under `sort:`:
```yaml
where:
  op: gte
  path: score
  value: 90
```

### Edit 3: Modify JSON
Try changing Alice's score from 95 to 88 in the JSON

---

The table should update automatically as you make changes!
