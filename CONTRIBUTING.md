# Contributing

## Development

```
git clone https://github.com/thejakia1/kitty-party.git
cd kitty-party
npm install
```

Open the folder in VS Code and press **F5** to launch an Extension Development Host.

| Script                 | What it does                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run build:themes` | Regenerate `themes/*.json` from the palettes in `scripts/build-themes.js` |
| `npm run build:assets` | Rebuild media assets                                                      |
| `npm test`             | Run the smoke tests                                                       |
| `npm run package`      | Build the `.vsix`                                                         |

### How it works

- **Themes** are generated from one palette object per theme, so all five share the same set of workbench and syntax token rules. Edit a palette, run `build:themes`, and the JSON is rewritten.
- **Art** (cats, slices, melons, paws) is drawn as inline SVG in `src/art.js`. There are no image files for the characters.
- **Editor decorations** are placed by hashing the file URI and line number (FNV-1a), so the same lines get the same decorations every time instead of jumping around on each refresh. Only visible lines are processed, and refreshes are debounced.
- **Webviews** use a strict Content Security Policy with nonces and no inline style attributes.

### Project layout

```
src/
  extension.js   activation, state, commands, decorations
  art.js         SVG cats, slices, melons
  webview.js     panel HTML, CSS and client script
  messages.js    cat dialogue lines
scripts/         theme and asset generators
themes/          generated theme JSON
media/           icon, activity bar icon, preview
test/            smoke tests
```

## Contributing

Issues and pull requests are welcome. For theme changes, edit the palette in `scripts/build-themes.js` and run `npm run build:themes` rather than editing the JSON by hand.

