'use strict';
// Generates themes/*.json from the palettes below so all five themes stay consistent.
// Watermelon anatomy: rind green, pale rind, red flesh, black seeds.
//   Watermelon Patch : indigo night + melon pink     (dark)
//   Melon Cream      : warm cream + red accents      (light)
//   Melon Cream Rind : cream editor, green frame     (light)
//   Midnight Melon   : burgundy flesh + mint         (dark)
//   Kitty Garden     : green rind UI + pink details  (dark)
const fs = require('fs');
const path = require('path');

const a = (hex, alpha) => hex + Math.round(alpha * 255).toString(16).padStart(2, '0');

// `mode` is light/dark. `type` is the syntax color for types and classes.
const PALETTES = {
  'watermelon-patch': {
    name: 'Kitty Party: Watermelon Patch', mode: 'dark',
    bg: '#161340', side: '#110f33', deep: '#0c0a26', raised: '#241f5c', fg: '#fff0f5', dim: '#bdb6e8', faint: '#7d76b8',
    border: '#322c7a', accent: '#ff5c8a', accent2: '#5cf5b0', onAccent: '#1a0614',
    comment: '#8a84c4', keyword: '#ff6f9b', string: '#a6f58a', number: '#ffb078', func: '#5cf5b0', type: '#ffe27a',
    variable: '#fff0f5', prop: '#e0d9ff', tag: '#ff6f9b', attr: '#ffb078', punct: '#a39dd8', op: '#ff8fb0', constant: '#ffb078',
    regex: '#7fe6ff', param: '#ffc8dc', err: '#ff5c7a', warn: '#ffc46b', info: '#7fc8ff', ok: '#5cf5b0',
    ansi: ['#241f5c', '#ff5c8a', '#5cf5b0', '#ffe27a', '#8fa8ff', '#d9a0ff', '#7fe6ff', '#fff0f5'],
  },
  'melon-cream': {
    name: 'Kitty Party: Melon Cream', mode: 'light',
    bg: '#fffaf4', side: '#fbece6', deep: '#f4d9d1', raised: '#fdeee3', fg: '#2a1d1b', dim: '#5d4540', faint: '#82655c',
    border: '#e5c3b8', accent: '#d62a47', accent2: '#1d8540', onAccent: '#ffffff',
    comment: '#7a5d54', keyword: '#c9243f', string: '#1c7a36', number: '#b84d00', func: '#0b6e62', type: '#7f5400',
    variable: '#2a1d1b', prop: '#5e3f38', tag: '#c9243f', attr: '#b84d00', punct: '#75594f', op: '#c9243f', constant: '#b84d00',
    regex: '#0b7a6f', param: '#9b2f4a', err: '#d11a4a', warn: '#a85f00', info: '#1a5fb0', ok: '#1d8540',
    ansi: ['#2a1d1b', '#c9243f', '#1c7a36', '#7f5400', '#1a5fb0', '#9a3fbf', '#0b6e62', '#82655c'],
  },
  'melon-cream-rind': {
    name: 'Kitty Party: Melon Cream Rind', mode: 'light',
    bg: '#fffef8', side: '#e3f4d8', deep: '#c9ebb9', raised: '#eaf7dc', fg: '#1c2a1b', dim: '#3f5a3b', faint: '#66815f',
    border: '#9fd08a', accent: '#e0193f', accent2: '#1d8540', onAccent: '#ffffff',
    comment: '#547548', keyword: '#d4163c', string: '#1c7a36', number: '#c24d00', func: '#0b6b5c', type: '#7a5600',
    variable: '#1c2a1b', prop: '#36502f', tag: '#d4163c', attr: '#c24d00', punct: '#5d7a52', op: '#d4163c', constant: '#c24d00',
    regex: '#0b7a6f', param: '#9a3322', err: '#d11a4a', warn: '#a85f00', info: '#1a5fb0', ok: '#1d8540',
    ansi: ['#1c2a1b', '#d4163c', '#1c7a36', '#7a5600', '#1a5fb0', '#9a3fbf', '#0b6b5c', '#66815f'],
    ui: {
      'activityBar.background': '#1d8540',
      'activityBar.foreground': '#ffffff',
      'activityBar.inactiveForeground': '#c4ecd0',
      'activityBar.activeBorder': '#ffffff',
      'activityBar.border': '#1d8540',
      'activityBarBadge.background': '#e0193f',
      'activityBarBadge.foreground': '#ffffff',
      'titleBar.activeBackground': '#1d8540',
      'titleBar.activeForeground': '#ffffff',
      'titleBar.inactiveBackground': '#1d8540',
      'titleBar.inactiveForeground': '#eafaf0',
      'titleBar.border': '#1d8540',
      'menubar.selectionBackground': a('#ffffff', 0.22),
    },
  },
  'midnight-melon': {
    name: 'Kitty Party: Midnight Melon', mode: 'dark',
    bg: '#380f20', side: '#2b0b18', deep: '#1f0710', raised: '#4f1a2f', fg: '#fff3ee', dim: '#e0b4bc', faint: '#a8707e',
    border: '#6a2640', accent: '#ff7a8c', accent2: '#8cf08a', onAccent: '#2a0610',
    comment: '#b5808c', keyword: '#ff8fa3', string: '#a8f08a', number: '#ffc27a', func: '#7af0b8', type: '#ffe6a0',
    variable: '#fff3ee', prop: '#f7d4d8', tag: '#ff8fa3', attr: '#ffc27a', punct: '#c898a2', op: '#ffa3b3', constant: '#ffc27a',
    regex: '#7fe6e0', param: '#ffd0b8', err: '#ff6b7a', warn: '#ffc46b', info: '#7fd1ff', ok: '#7af0b8',
    ansi: ['#4f1a2f', '#ff7a8c', '#7af0b8', '#ffe6a0', '#8fb8ff', '#e0a8ff', '#7fe6e0', '#fff3ee'],
  },
  'kitty-garden': {
    name: 'Kitty Party: Garden Theme', mode: 'dark',
    bg: '#0d2b1f', side: '#09221a', deep: '#051812', raised: '#16402f', fg: '#e9fbe0', dim: '#9fcdb0', faint: '#5f9a78',
    border: '#1f5c42', accent: '#4ddb7a', accent2: '#ff5c7c', onAccent: '#05150d',
    comment: '#6fa588', keyword: '#ff6b88', string: '#b9f27c', number: '#ffb35c', func: '#5be3c0', type: '#ffe58a',
    variable: '#e9fbe0', prop: '#c9efd2', tag: '#ff6b88', attr: '#ffb35c', punct: '#8fbfa2', op: '#ff8aa0', constant: '#ffb35c',
    regex: '#7fe9e0', param: '#ffcdbf', err: '#ff5c70', warn: '#ffc46b', info: '#7fd1ff', ok: '#4ddb7a',
    ansi: ['#16402f', '#ff5c7c', '#4ddb7a', '#ffe58a', '#7fb8ff', '#e0a8ff', '#7fe9e0', '#e9fbe0'],
    // Green rind UI with flesh-pink details (cursor, selection, active tab line, badges).
    ui: {
      'editor.selectionBackground': a('#ff5c7c', 0.28),
      'editor.inactiveSelectionBackground': a('#ff5c7c', 0.14),
      'selection.background': a('#ff5c7c', 0.4),
      'editorCursor.foreground': '#ff5c7c',
      'terminalCursor.foreground': '#ff5c7c',
      'editorLineNumber.activeForeground': '#ff5c7c',
      'editorBracketMatch.border': '#ff5c7c',
      'editorBracketMatch.background': a('#ff5c7c', 0.2),
      'tab.activeBorderTop': '#ff5c7c',
      'list.activeSelectionBackground': a('#ff5c7c', 0.24),
      'list.focusBackground': a('#ff5c7c', 0.24),
      'list.highlightForeground': '#ff6b88',
      'activityBarBadge.background': '#ff5c7c',
      'activityBarBadge.foreground': '#1a0509',
      'badge.background': '#ff5c7c',
      'badge.foreground': '#1a0509',
    },
  },
};

function brighten(hex) {
  // Slightly lift a color for the "bright" ANSI row.
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.min(255, Math.round(v + (255 - v) * 0.22));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function workbench(p) {
  const dark = p.mode === 'dark';
  const ansiNames = ['Black', 'Red', 'Green', 'Yellow', 'Blue', 'Magenta', 'Cyan', 'White'];
  const ansi = {};
  p.ansi.forEach((c, i) => {
    ansi[`terminal.ansi${ansiNames[i]}`] = c;
    ansi[`terminal.ansiBright${ansiNames[i]}`] = i === 0 ? p.faint : brighten(c);
  });
  const colors = {
    focusBorder: p.accent,
    foreground: p.fg,
    descriptionForeground: p.dim,
    errorForeground: p.err,
    'icon.foreground': p.dim,
    'widget.shadow': a('#000000', dark ? 0.45 : 0.12),
    'selection.background': a(p.accent, 0.4),
    'textLink.foreground': p.accent,
    'textLink.activeForeground': p.accent2,
    'textCodeBlock.background': p.deep,
    'textBlockQuote.background': p.deep,
    'textBlockQuote.border': p.accent,
    'textPreformat.foreground': p.accent2,
    'textSeparator.foreground': p.border,

    'editor.background': p.bg,
    'editor.foreground': p.fg,
    'editorLineNumber.foreground': p.faint,
    'editorLineNumber.activeForeground': p.accent,
    'editorCursor.foreground': p.accent,
    'editor.selectionBackground': a(p.accent, 0.3),
    'editor.inactiveSelectionBackground': a(p.accent, 0.15),
    'editor.selectionHighlightBackground': a(p.accent2, 0.2),
    'editor.wordHighlightBackground': a(p.accent2, 0.18),
    'editor.wordHighlightStrongBackground': a(p.accent, 0.22),
    'editor.findMatchBackground': a(p.accent2, 0.45),
    'editor.findMatchHighlightBackground': a(p.accent2, 0.22),
    'editor.findRangeHighlightBackground': a(p.accent, 0.12),
    'editor.lineHighlightBackground': a(p.raised, dark ? 0.7 : 0.8),
    'editor.rangeHighlightBackground': a(p.accent, 0.1),
    'editor.hoverHighlightBackground': a(p.accent2, 0.15),
    'editor.foldBackground': a(p.accent, 0.1),
    'editorWhitespace.foreground': a(p.faint, 0.5),
    'editorIndentGuide.background1': a(p.faint, 0.35),
    'editorIndentGuide.activeBackground1': p.accent2,
    'editorRuler.foreground': a(p.faint, 0.4),
    'editorBracketMatch.background': a(p.accent, 0.2),
    'editorBracketMatch.border': p.accent,
    'editorBracketHighlight.foreground1': p.accent,
    'editorBracketHighlight.foreground2': p.accent2,
    'editorBracketHighlight.foreground3': p.type,
    'editorBracketHighlight.foreground4': p.func,
    'editorBracketHighlight.foreground5': p.number,
    'editorBracketHighlight.foreground6': p.param,
    'editorLink.activeForeground': p.accent,
    'editorCodeLens.foreground': p.faint,
    'editorInlayHint.foreground': p.dim,
    'editorInlayHint.background': a(p.raised, 0.8),
    'editorGutter.background': p.bg,
    'editorGutter.addedBackground': p.ok,
    'editorGutter.modifiedBackground': p.info,
    'editorGutter.deletedBackground': p.err,
    'editorOverviewRuler.border': p.bg,
    'editorError.foreground': p.err,
    'editorWarning.foreground': p.warn,
    'editorInfo.foreground': p.info,
    'editorHint.foreground': p.accent2,
    'editorWidget.background': p.raised,
    'editorWidget.border': p.border,
    'editorSuggestWidget.background': p.raised,
    'editorSuggestWidget.border': p.border,
    'editorSuggestWidget.selectedBackground': a(p.accent, 0.22),
    'editorSuggestWidget.highlightForeground': p.accent,
    'editorHoverWidget.background': p.raised,
    'editorHoverWidget.border': p.border,
    'diffEditor.insertedTextBackground': a(p.ok, 0.16),
    'diffEditor.removedTextBackground': a(p.err, 0.16),
    'diffEditor.insertedLineBackground': a(p.ok, 0.1),
    'diffEditor.removedLineBackground': a(p.err, 0.1),
    'editorGroup.border': p.border,
    'editorGroupHeader.tabsBackground': p.deep,
    'editorGroupHeader.noTabsBackground': p.bg,
    'editorGroup.dropBackground': a(p.accent, 0.18),
    'editorOverviewRuler.errorForeground': p.err,
    'editorOverviewRuler.warningForeground': p.warn,
    'editorOverviewRuler.findMatchForeground': a(p.accent2, 0.7),
    'editorOverviewRuler.selectionHighlightForeground': a(p.accent2, 0.6),
    'minimap.selectionHighlight': a(p.accent, 0.6),
    'minimap.findMatchHighlight': a(p.accent2, 0.7),
    'minimapSlider.background': a(p.accent, 0.12),
    'minimapSlider.hoverBackground': a(p.accent, 0.22),
    'minimapSlider.activeBackground': a(p.accent, 0.32),

    'tab.activeBackground': p.bg,
    'tab.activeForeground': p.fg,
    'tab.activeBorderTop': p.accent,
    'tab.inactiveBackground': p.deep,
    'tab.inactiveForeground': p.dim,
    'tab.unfocusedActiveBackground': p.bg,
    'tab.unfocusedActiveForeground': p.dim,
    'tab.unfocusedActiveBorderTop': a(p.accent, 0.5),
    'tab.hoverBackground': p.raised,
    'tab.border': p.deep,
    'tab.lastPinnedBorder': p.accent2,
    'breadcrumb.foreground': p.dim,
    'breadcrumb.focusForeground': p.accent,
    'breadcrumb.activeSelectionForeground': p.accent,
    'breadcrumbPicker.background': p.raised,

    'activityBar.background': p.deep,
    'activityBar.foreground': p.accent,
    'activityBar.inactiveForeground': p.faint,
    'activityBar.activeBorder': p.accent,
    'activityBar.border': p.border,
    'activityBarBadge.background': p.accent,
    'activityBarBadge.foreground': p.onAccent,
    'sideBar.background': p.side,
    'sideBar.foreground': p.dim,
    'sideBar.border': p.border,
    'sideBarTitle.foreground': p.fg,
    'sideBarSectionHeader.background': p.deep,
    'sideBarSectionHeader.foreground': p.fg,
    'sideBarSectionHeader.border': p.border,

    'list.activeSelectionBackground': a(p.accent, 0.26),
    'list.activeSelectionForeground': p.fg,
    'list.inactiveSelectionBackground': a(p.accent, 0.14),
    'list.inactiveSelectionForeground': p.fg,
    'list.hoverBackground': a(p.accent2, 0.12),
    'list.focusBackground': a(p.accent, 0.26),
    'list.highlightForeground': p.accent,
    'list.errorForeground': p.err,
    'list.warningForeground': p.warn,
    'tree.indentGuidesStroke': p.border,

    'titleBar.activeBackground': p.deep,
    'titleBar.activeForeground': p.fg,
    'titleBar.inactiveBackground': p.deep,
    'titleBar.inactiveForeground': p.faint,
    'titleBar.border': p.border,
    'menubar.selectionBackground': a(p.accent, 0.22),
    'menu.background': p.raised,
    'menu.foreground': p.fg,
    'menu.selectionBackground': a(p.accent, 0.26),
    'menu.separatorBackground': p.border,

    'statusBar.background': p.accent,
    'statusBar.foreground': p.onAccent,
    'statusBar.noFolderBackground': p.accent2,
    'statusBar.noFolderForeground': p.onAccent,
    'statusBar.debuggingBackground': p.accent2,
    'statusBar.debuggingForeground': p.onAccent,
    'statusBar.border': a(p.onAccent, 0),
    'statusBarItem.hoverBackground': a(p.onAccent, 0.15),
    'statusBarItem.remoteBackground': p.accent2,
    'statusBarItem.remoteForeground': p.onAccent,
    'statusBarItem.prominentBackground': a(p.onAccent, 0.2),

    'panel.background': p.side,
    'panel.border': p.border,
    'panelTitle.activeForeground': p.fg,
    'panelTitle.activeBorder': p.accent,
    'panelTitle.inactiveForeground': p.dim,
    'panelSectionHeader.background': p.deep,

    'input.background': p.deep,
    'input.foreground': p.fg,
    'input.border': p.border,
    'input.placeholderForeground': p.faint,
    'inputOption.activeBorder': p.accent,
    'inputOption.activeBackground': a(p.accent, 0.25),
    'inputValidation.errorBorder': p.err,
    'inputValidation.warningBorder': p.warn,
    'inputValidation.infoBorder': p.info,
    'dropdown.background': p.raised,
    'dropdown.foreground': p.fg,
    'dropdown.border': p.border,
    'button.background': p.accent,
    'button.foreground': p.onAccent,
    'button.hoverBackground': p.accent2,
    'button.secondaryBackground': p.raised,
    'button.secondaryForeground': p.fg,
    'button.secondaryHoverBackground': a(p.accent, 0.25),
    'badge.background': p.accent2,
    'badge.foreground': p.onAccent,
    'progressBar.background': p.accent,
    'checkbox.background': p.deep,
    'checkbox.border': p.border,
    'scrollbar.shadow': a('#000000', dark ? 0.3 : 0.06),
    'scrollbarSlider.background': a(p.accent, 0.16),
    'scrollbarSlider.hoverBackground': a(p.accent, 0.28),
    'scrollbarSlider.activeBackground': a(p.accent, 0.4),
    'pickerGroup.foreground': p.accent,
    'pickerGroup.border': p.border,
    'quickInput.background': p.raised,
    'quickInputList.focusBackground': a(p.accent, 0.26),
    'notifications.background': p.raised,
    'notifications.border': p.border,
    'notificationCenterHeader.background': p.deep,
    'notificationLink.foreground': p.accent,
    'peekView.border': p.accent,
    'peekViewEditor.background': p.deep,
    'peekViewResult.background': p.side,
    'peekViewTitle.background': p.deep,
    'peekViewTitleLabel.foreground': p.fg,
    'peekViewResult.selectionBackground': a(p.accent, 0.25),
    'peekViewEditor.matchHighlightBackground': a(p.accent2, 0.35),

    'gitDecoration.addedResourceForeground': p.ok,
    'gitDecoration.modifiedResourceForeground': p.info,
    'gitDecoration.deletedResourceForeground': p.err,
    'gitDecoration.untrackedResourceForeground': p.accent2,
    'gitDecoration.ignoredResourceForeground': p.faint,
    'gitDecoration.conflictingResourceForeground': p.warn,
    'gitDecoration.submoduleResourceForeground': p.type,

    'terminal.background': p.deep,
    'terminal.foreground': p.fg,
    'terminal.selectionBackground': a(p.accent, 0.3),
    'terminalCursor.foreground': p.accent,
    ...ansi,

    'debugToolBar.background': p.raised,
    'debugConsole.errorForeground': p.err,
    'testing.iconPassed': p.ok,
    'testing.iconFailed': p.err,
    'settings.headerForeground': p.fg,
    'settings.modifiedItemIndicator': p.accent,
    'extensionButton.prominentBackground': p.accent,
    'extensionButton.prominentForeground': p.onAccent,
    'extensionButton.prominentHoverBackground': p.accent2,
    'charts.red': p.err, 'charts.green': p.ok, 'charts.blue': p.info, 'charts.yellow': p.warn, 'charts.purple': p.accent,
  };
  return { ...colors, ...(p.ui || {}) };
}

function tokenColors(p) {
  const t = (name, scope, foreground, fontStyle) => {
    const settings = { foreground };
    if (fontStyle) settings.fontStyle = fontStyle;
    return { name, scope, settings };
  };
  return [
    t('Comments', ['comment', 'punctuation.definition.comment'], p.comment, 'italic'),
    t('Strings', ['string', 'string.quoted', 'punctuation.definition.string'], p.string),
    t('Template expression', ['punctuation.definition.template-expression', 'punctuation.section.embedded'], p.accent),
    t('Numbers', ['constant.numeric'], p.number),
    t('Constants', ['constant.language', 'constant.character', 'constant.other', 'support.constant'], p.constant),
    t('Keywords', ['keyword', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python', 'storage', 'storage.type', 'storage.modifier'], p.keyword),
    t('Operators', ['keyword.operator', 'punctuation.separator.key-value'], p.op),
    t('Functions', ['entity.name.function', 'meta.function-call', 'support.function', 'variable.function'], p.func),
    t('Types and classes', ['entity.name.type', 'entity.name.class', 'entity.other.inherited-class', 'support.type', 'support.class', 'storage.type.class'], p.type),
    t('Variables', ['variable', 'variable.other.readwrite', 'meta.definition.variable'], p.variable),
    t('Parameters', ['variable.parameter', 'meta.parameters'], p.param, 'italic'),
    t('This and self', ['variable.language', 'variable.language.this', 'variable.language.self'], p.keyword, 'italic'),
    t('Properties', ['variable.other.property', 'variable.other.object.property', 'meta.object-literal.key', 'support.type.property-name'], p.prop),
    t('Punctuation', ['punctuation', 'meta.brace', 'meta.delimiter'], p.punct),
    t('Tags', ['entity.name.tag', 'support.class.component'], p.tag),
    t('Attributes', ['entity.other.attribute-name'], p.attr, 'italic'),
    t('Decorators', ['meta.decorator', 'entity.name.function.decorator', 'punctuation.decorator'], p.accent2),
    t('Regex', ['string.regexp'], p.regex),
    t('Escapes', ['constant.character.escape'], p.accent),
    t('Imports and modules', ['keyword.control.import', 'keyword.control.export', 'keyword.control.from'], p.keyword),
    t('JSON keys', ['support.type.property-name.json'], p.func),
    t('CSS properties', ['support.type.property-name.css', 'meta.property-name.css'], p.prop),
    t('CSS selectors', ['entity.name.tag.css', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css'], p.accent),
    t('CSS values', ['support.constant.property-value.css', 'meta.property-value.css'], p.number),
    t('Markdown headings', ['markup.heading', 'entity.name.section.markdown'], p.accent, 'bold'),
    t('Markdown bold', ['markup.bold'], p.number, 'bold'),
    t('Markdown italic', ['markup.italic'], p.type, 'italic'),
    t('Markdown code', ['markup.inline.raw', 'markup.fenced_code.block'], p.accent2),
    t('Markdown links', ['markup.underline.link', 'string.other.link'], p.func),
    t('Markdown quote', ['markup.quote'], p.comment, 'italic'),
    t('Diff added', ['markup.inserted'], p.ok),
    t('Diff removed', ['markup.deleted'], p.err),
    t('Diff changed', ['markup.changed'], p.info),
    t('Invalid', ['invalid', 'invalid.illegal'], p.err),
  ];
}

function semantic(p) {
  return {
    class: p.type, interface: p.type, enum: p.type, typeParameter: p.type,
    function: p.func, method: p.func, property: p.prop, parameter: { foreground: p.param, italic: true },
    namespace: p.type, variable: p.variable, 'variable.readonly': p.constant, enumMember: p.constant,
    'keyword.controlFlow': p.keyword, decorator: p.accent2,
  };
}

const outDir = path.join(__dirname, '..', 'themes');
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) {
  if (f.endsWith('-color-theme.json') && !(f.replace('-color-theme.json', '') in PALETTES)) {
    fs.unlinkSync(path.join(outDir, f));
    console.log('removed', f);
  }
}
for (const [slug, p] of Object.entries(PALETTES)) {
  const theme = {
    $schema: 'vscode://schemas/color-theme',
    name: p.name,
    type: p.mode,
    semanticHighlighting: true,
    colors: workbench(p),
    tokenColors: tokenColors(p),
    semanticTokenColors: semantic(p),
  };
  fs.writeFileSync(path.join(outDir, `${slug}-color-theme.json`), JSON.stringify(theme, null, 2) + '\n');
  console.log('wrote', slug);
}