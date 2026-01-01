# JSON Table Query Plugin - Test Cases

This note demonstrates the JSON Table Query plugin with various test scenarios.

## Test 1: Simple Field Selection

Query the next JSON block to display specific columns.

```jtable
fields: [name, score]
```

# JSON
```json
[
  {"name": "Alice", "score": 40, "grade": "A"},
  {"name": "Bob", "score": 7, "grade": "B"},
  {"name": "Cara", "score": 9, "grade": "A"},
  {"name": "David", "score": 6, "grade": "C"},
  {"name": "stfuf", "score": 6, "grade": "C"},
  {"name": "haha", "score": 6, "grade": "C"},
  {"name": "haha", "score": 6, "grade": "C"},
  {"name": "hello world", "score": 6, "grade": "C"},
  {"name": "Bob", "score": 7, "grade": "B"},
  {"name": "lala", "score": 7, "grade": "B"},
  {"name": "bloom", "score": 7, "grade": "B"},
  {"name": "duh", "score": 7, "grade": "B"},
  {"name": "hmm", "score": 7, "grade": "B"}
  
]
```

---

## Test 2: Filtering with Comparison Operators

Show only students with a score >= 8.

```jtable
fields: [name, score, grade]
where:
  op: gte
  path: score
  value: 8
```

```json
[
  {"name": "Alice", "score": 10, "grade": "A"},
  {"name": "Bob", "score": 7, "grade": "B"},
  {"name": "Cara", "score": 9, "grade": "A"},
  {"name": "David", "score": 6, "grade": "C"},
  {"name": "lol", "score": 6, "grade": "C"}
]
```

---

## Test 3: Sorting

Sort by score in descending order.

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

---

## Test 4: Limit and Offset

Show the top 2 students by score.

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

---

## Test 5: Nested Object Access (Dot-Path)

Query nested user objects with profile information.

```jtable
fields: [name, "user.email", "user.profile.age"]
```

```json
[
  {"name": "Alice", "user": {"email": "alice@example.com", "profile": {"age": 25}}},
  {"name": "Bob", "user": {"email": "bob@example.com", "profile": {"age": 30}}},
  {"name": "Cara", "user": {"email": "cara@example.com", "profile": {"age": 28}}}
]
```

---

## Test 6: Complex Filtering (OR Logic)

Show students who either have an "A" grade OR a score above 8.

```jtable
fields: [name, score, grade]
where:
  op: or
  args:
    - op: eq
      path: grade
      value: A
    - op: gt
      path: score
      value: 8
```

```json
[
  {"name": "Alice", "score": 10, "grade": "A"},
  {"name": "Bob", "score": 7, "grade": "B"},
  {"name": "Cara", "score": 9, "grade": "A"},
  {"name": "David", "score": 6, "grade": "C"}
]
```

---

## Test 7: IN Operator

Find students in the list: Alice, Cara.

```jtable
fields: [name, score, grade]
where:
  op: in
  path: name
  value: [Alice, Cara]
```

```json
[
  {"name": "Alice", "score": 10, "grade": "A"},
  {"name": "Bob", "score": 7, "grade": "B"},
  {"name": "Cara", "score": 9, "grade": "A"},
  {"name": "David", "score": 6, "grade": "C"}
]
```

---

## Test 8: Regex Filtering

Show students whose name contains 'a' (case-insensitive).

```jtable
fields: [name, score]
where:
  op: regex
  path: name
  value: a
  flags: i
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9},
  {"name": "David", "score": 6}
]
```

---

## Test 9: With Table Footer

Show data with a row count footer.

```jtable
fields: [name, score]
render:
  footer: count
  title: Students Table
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```

---

## Test 10: Empty Result

Query that returns no results.

```jtable
fields: [name, score]
where:
  op: gt
  path: score
  value: 100
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```

---

## Test 11: Multiple Sorts

Sort by grade ascending, then by score descending.

```jtable
fields: [name, grade, score]
sort:
  - path: grade
    dir: asc
  - path: score
    dir: desc
```

```json
[
  {"name": "Alice", "grade": "A", "score": 10},
  {"name": "Cara", "grade": "A", "score": 9},
  {"name": "Bob", "grade": "B", "score": 7},
  {"name": "David", "grade": "C", "score": 6}
]
```

---

## Test 12: Distinct Values

Show distinct grades.

```jtable
fields: [grade]
distinct: true
```

```json
[
  {"name": "Alice", "grade": "A"},
  {"name": "Cara", "grade": "A"},
  {"name": "Bob", "grade": "B"},
  {"name": "David", "grade": "C"},
  {"name": "Eva", "grade": "B"}
]
```

---

## Test 13: Error Case - Invalid JSON

This query should display an error because the JSON below is malformed.

```jtable
fields: [name]
```

```json
{
  "invalid": json here
}
```

---

## Test 14: Error Case - No JSON Block Found

This query has no JSON block following it, so it should show an error.

```jtable
fields: [name, score]
```

---

## Test 15: Large Dataset

Query with larger dataset to test performance.

```jtable
fields: [id, name, score]
where:
  op: gte
  path: score
  value: 50
limit: 10
```

```json
[
  {"id": 1, "name": "User1", "score": 95},
  {"id": 2, "name": "User2", "score": 45},
  {"id": 3, "name": "User3", "score": 87},
  {"id": 4, "name": "User4", "score": 62},
  {"id": 5, "name": "User5", "score": 73},
  {"id": 6, "name": "User6", "score": 55},
  {"id": 7, "name": "User7", "score": 88},
  {"id": 8, "name": "User8", "score": 41},
  {"id": 9, "name": "User9", "score": 76},
  {"id": 10, "name": "User10", "score": 52}
]
```

---

## Test 16: JSON Format - Alternative Syntax

Using JSON object instead of YAML.

```jtable
{"fields": ["name", "score"], "limit": 2}
```

```json
[
  {"name": "Alice", "score": 10},
  {"name": "Bob", "score": 7},
  {"name": "Cara", "score": 9}
]
```

---

## Notes for Testing

- The tables above should render immediately in Obsidian's preview/reading mode
- Errors should display clearly with helpful messages
- All raw JSON blocks should remain visible below their corresponding tables
- The plugin should handle edge cases gracefully (empty data, missing fields, etc.)
