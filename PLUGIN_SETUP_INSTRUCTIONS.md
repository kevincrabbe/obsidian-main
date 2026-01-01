# JSON Table Query Plugin - Setup Instructions

## ✅ Installation Complete

The JSON Table Query plugin has been successfully installed and is ready to use!

### What Was Done

1. **Plugin Created** at `.obsidian/plugins/json-table-query/`
2. **Dependencies Installed** - All npm packages configured
3. **Plugin Built** - TypeScript compiled and bundled into `main.js`
4. **Plugin Registered** - Added to `.obsidian/community-plugins.json`
5. **Styling Applied** - CSS stylesheet included
6. **Documentation Created** - Comprehensive guides and examples

### Files to Reference

- **README.md** - Full feature documentation
- **Quick Reference** - `JSON_Table_Query_Quick_Reference.md`
- **Test Examples** - `JSON_Table_Query_Tests.md`
- **Implementation Details** - `.obsidian/plugins/json-table-query/IMPLEMENTATION_SUMMARY.md`

## Getting Started

### Step 1: Reload Obsidian (If Needed)

If you have Obsidian open, reload it to load the new plugin:
- macOS: Cmd+R
- Windows/Linux: Ctrl+R
- Or: Restart the Obsidian application

### Step 2: Verify Installation

1. Open Obsidian Settings → Community Plugins
2. Look for "JSON Table Query" in the installed plugins list
3. Confirm it's enabled (toggle should be ON)

### Step 3: Create Your First Query

Create a new note or edit an existing one. Write:

````markdown
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
````

Switch to Reading view (Preview mode) and you should see a table!

## First Query Success Checklist

- [ ] Obsidian has been reloaded
- [ ] Plugin appears in Community Plugins list
- [ ] Plugin is enabled
- [ ] You can see a table above the JSON block
- [ ] The table shows the correct columns (name, score)
- [ ] Raw JSON block remains visible below the table

## Common Next Steps

### Try Filtering
Add a `where` clause to filter results:

```jtable
fields: [name, score]
where:
  op: gte
  path: score
  value: 8
```

### Try Sorting
Add `sort` to order results:

```jtable
fields: [name, score]
sort:
  - path: score
    dir: desc
```

### Try Pagination
Add `limit` to show top results:

```jtable
fields: [name, score]
sort:
  - path: score
    dir: desc
limit: 3
```

## Need Help?

### Check the Test File
Open `JSON_Table_Query_Tests.md` - it has 16 different query examples you can copy and modify.

### Quick Reference
See `JSON_Table_Query_Quick_Reference.md` for a fast lookup of common operations.

### Full Documentation
Read `README.md` in the plugin folder for detailed documentation.

### View Source Code
All source code is in `.obsidian/plugins/json-table-query/src/` (TypeScript)

## Development Mode

### To Make Changes to the Plugin

1. Edit files in `.obsidian/plugins/json-table-query/src/`
2. Run `npm run dev` in the plugin directory to watch for changes
3. Or run `npm run build` to rebuild manually
4. Reload Obsidian (Cmd+R / Ctrl+R) to see changes

### Build Commands

```bash
cd /Users/kevincrabbe/Documents/obsidian-main/.obsidian/plugins/json-table-query

# Development mode (watch for changes)
npm run dev

# Production build
npm run build

# Watch mode
npm run watch
```

## Plugin Settings

Access from Obsidian Settings → Community Plugins → JSON Table Query → Options

Available settings:
- **Enable JavaScript functions** - For advanced filtering/sorting (disabled by default)
- **Enable data caching** - For performance with large datasets
- **Show table borders** - Visual preference
- **Alternate row colors** - Visual preference
- **Show error details** - For debugging

## Troubleshooting

### No table appears
1. Check that you have both `jtable` and `json` code blocks
2. Ensure the `json` block comes immediately after the `jtable` block
3. Check for any error messages in the red error panel
4. Verify JSON is valid JSON (use a JSON validator if unsure)

### Error: "No JSON data block found"
- The plugin looks for the next `json` code block after your query
- Make sure your JSON block is below the jtable block
- Verify the JSON block language is set to `json` (not `javascript` or `code`)

### Error: "JSON parse error"
- Your JSON has syntax errors
- Common issues: missing commas, trailing commas, unquoted keys
- Use an online JSON validator to check

### Query doesn't show expected results
- Check field names in `fields:` match your JSON keys
- Verify filter operators and values
- Check for typos in field paths
- Use the Quick Reference guide to verify syntax

### Plugin doesn't load
1. Check `.obsidian/community-plugins.json` includes `json-table-query`
2. Verify `main.js` exists in plugin folder
3. Reload Obsidian
4. Check console for errors (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows)

## Next Phase Features (Phase 2)

Coming soon:
- Explicit dataset linking with marker comments
- Advanced caching system
- Computed columns
- Click-to-sort headers
- More aggregation functions

## Files Location Reference

| File | Location | Purpose |
|------|----------|---------|
| Plugin folder | `.obsidian/plugins/json-table-query/` | Main plugin directory |
| Compiled code | `.obsidian/plugins/json-table-query/main.js` | Bundled plugin (auto-loaded) |
| Metadata | `.obsidian/plugins/json-table-query/manifest.json` | Plugin info |
| Styles | `.obsidian/plugins/json-table-query/styles.css` | Plugin styling |
| Source code | `.obsidian/plugins/json-table-query/src/` | TypeScript source |
| Docs | `.obsidian/plugins/json-table-query/README.md` | Full documentation |
| Test file | `JSON_Table_Query_Tests.md` | Example queries |
| Quick ref | `JSON_Table_Query_Quick_Reference.md` | Quick lookup guide |

## Support Resources

1. **Plugin README** - `.obsidian/plugins/json-table-query/README.md`
2. **Quick Reference** - `JSON_Table_Query_Quick_Reference.md` in vault
3. **Examples** - `JSON_Table_Query_Tests.md` with 16 different scenarios
4. **Source Code** - Well-commented TypeScript in `src/` directory

## Ready to Use! 🎉

Your JSON Table Query plugin is ready. Start creating powerful queryable tables in your notes!

Try the examples in `JSON_Table_Query_Tests.md` to explore all the features.
