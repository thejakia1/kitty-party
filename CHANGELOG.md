# Changelog

## 0.1.4 - 2026-10-29

### Themes

- All themes redesigned so each looks different from the others:
  - **Watermelon Patch**: indigo background with pink accents
  - **Midnight Melon**: burgundy background with pink accents and mint
  - **Garden Theme**: green interface with flesh-pink details (cursor, selection, active tab line, badges)
  - **Melon Cream**: warm cream editor with peach panels and red accents
- New light theme, **Melon Cream Rind**: cream editor, green title bar and activity bar, red status bar
- Now five themes. The theme picker lists them in this order: Melon Cream Rind, Melon Cream, Garden Theme, Midnight Melon, Watermelon Patch
- Better contrast for comments, borders and side panels. Code text is at least 4.5:1 against the editor background in all five themes
- Terminal is themed: the terminal background matches the panel and each theme sets its own ANSI colors

### Fixed

- The `type` field in the generated theme files held a color code instead of `light` or `dark`
- Shadow and overlay strength in dark themes was calculated as if they were light themes

### Changed

- Theme generator accepts per-theme color overrides and deletes theme files that are no longer defined
- README rewritten

## 0.1.2

- Theme names now use the "Kitty Party:" prefix in the picker
- Fixed packaging: removed `src/` and `themes/` from `.vscodeignore`
- Fixed module path for `art.js`
- Publisher set to `thejakia1`

## 0.1.1

- Themes and slice artwork use true watermelon red and green instead of pink.
- Added Fewer Melons (button, command, view title action). At the lowest level it stops the party.
- Stopping or restoring the party now resets the melon level to `kittyParty.defaultLevel`.

## 0.1.0

- Four themes: Watermelon Patch, Melon Cream, Midnight Melon, Kitty Garden.
- Dancing cats Mochi, Salem and Pudding in an Explorer view, an activity bar view and a large editor panel.
- Opt-in editor decorations (slices, melons, paw prints, gutter cats) with five melon levels and hover messages.
- Status bar item, cat picker, theme picker, optional save celebration.
