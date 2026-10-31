# Kitty Party

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/thejakia1.kitty-party?label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=thejakia1.kitty-party)

Five watermelon color themes for VS Code, plus an opt-in party: dancing cats, falling watermelon slices, and small decorations in your editor.

The themes are always on once you pick one. The party is off until you start it.

![Kitty Party demo](media/demo.gif)

## Themes

| Theme                         | Type  |
| ----------------------------- | ----- |
| Kitty Party: Melon Cream Rind | Light |
| Kitty Party: Melon Cream      | Light |
| Kitty Party: Garden Theme     | Dark  |
| Kitty Party: Midnight Melon   | Dark  |
| Kitty Party: Watermelon Patch | Dark  |

Pick one with `Preferences: Color Theme`, or run **Kitty Party: Choose Watermelon Theme** from the Command Palette.

### Melon Cream Rind
![Melon Cream Rind](media/melon-cream-rind.png)

### Melon Cream
![Melon Cream](media/melon-cream.png)

### Garden Theme
![Garden Theme](media/garden-theme.png)

### Midnight Melon
![Midnight Melon](media/midnight-melon.png)

### Watermelon Patch
![Watermelon Patch](media/watermelon-patch.png)

## The party

Click the cat icon in the Activity Bar (view name: **Meow Business**) and press **Start party**.

- **Three cats:** Mochi (orange tabby), Salem (black cat) and Pudding (calico). Click one to choose who comes.
- **Melon levels 1 to 5:** more melons means more falling slices in the panel and more decorations in your editor.
- **Editor decorations:** small watermelon icons appear at the end of some visible lines, and your cat shows in the gutter on others. Hover a decoration for a short message from your cat.
- **Status bar item:** click to start or stop.
- **Large view:** **Kitty Party: Open Large Kitty Party** opens the cats in an editor tab.
- **Save celebration:** optional burst of melons when you save a file.

Decorations are visual only. The extension never edits your files.

Animations respect your system's reduced-motion setting.

## Commands

| Command                                  | What it does                                          |
| ---------------------------------------- | ----------------------------------------------------- |
| Kitty Party: Start or Stop Kitty Party   | Toggle the party                                      |
| Kitty Party: More Melons                 | Raise the melon level (starts the party if it is off) |
| Kitty Party: Fewer Melons                | Lower the level. At level 1 this stops the party      |
| Kitty Party: Restore Editor (Stop Party) | Stop and clear all decorations                        |
| Kitty Party: Open Large Kitty Party      | Open the large panel                                  |
| Kitty Party: Choose Your Cat             | Pick Mochi, Salem or Pudding                          |
| Kitty Party: Choose Watermelon Theme     | Pick one of the five themes                           |

## Settings

| Setting                      | Default | Description                                |
| ---------------------------- | ------- | ------------------------------------------ |
| `kittyParty.autoStart`       | `false` | Start the party on first launch            |
| `kittyParty.defaultLevel`    | `2`     | Melon level when the party starts (1 to 5) |
| `kittyParty.gutterCats`      | `true`  | Show your cat in the gutter                |
| `kittyParty.hoverMessages`   | `true`  | Show cat messages on hover                 |
| `kittyParty.celebrateOnSave` | `false` | Melon burst and status bar message on save |
| `kittyParty.statusBar`       | `true`  | Show the status bar item                   |

To turn the party off completely, run **Restore Editor (Stop Party)**. To use only the themes, never start it.

## Install

**From a release (works now):**

1. Download `kitty-party-x.y.z.vsix` from the [Releases](https://github.com/thejakia1/kitty-party/releases) page.
2. Run:
   ```
   code --install-extension kitty-party-x.y.z.vsix
   ```

**From the Marketplace:**

1. Open VS Code, press `Ctrl+P`, and run:
   ```
   ext install thejakia1.kitty-party
   ```
2. Or open it on the [Marketplace page](https://marketplace.visualstudio.com/items?itemName=thejakia1.kitty-party) and click Install.

## Contributing

Issues and pull requests are welcome. Setup, scripts and how the project works are in [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE) © Jakia A.
