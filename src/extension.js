'use strict';
const vscode = require('vscode');
const { CATS, CAT_IDS, DECO_KINDS, catFaceSVG, decoSVG, svgToDataUri } = require('./art');
const { getHtml, newNonce } = require('./webview');
const { lineFor, saveLineFor } = require('./messages');

const STATE_KEY = 'kittyParty.state.v1';
// Share of visible lines that get a decoration at each melon level (0 = off).
const PROB = [0, 0.02, 0.05, 0.09, 0.15, 0.24];

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

function fnv(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ---- shared state --------------------------------------------------------

class PartyState {
  constructor(memento) {
    this.memento = memento;
    this._emitter = new vscode.EventEmitter();
    this.onDidChange = this._emitter.event;
    const cfg = vscode.workspace.getConfiguration('kittyParty');
    const saved = memento.get(STATE_KEY) || {};
    this.s = {
      enabled: typeof saved.enabled === 'boolean' ? saved.enabled : !!cfg.get('autoStart', false),
      level: clamp(Number.isFinite(saved.level) ? saved.level : cfg.get('defaultLevel', 2), 0, 5),
      cat: CATS[saved.cat] ? saved.cat : 'mochi',
    };
  }
  get() { return { ...this.s }; }
  set(patch) {
    this.s = { ...this.s, ...patch };
    this.s.level = clamp(this.s.level, 0, 5);
    this.memento.update(STATE_KEY, this.s);
    this._emitter.fire(this.get());
  }
  start() { this.set({ enabled: true, level: this.s.level === 0 ? 1 : this.s.level }); }
  defaultLevel() {
    return clamp(vscode.workspace.getConfiguration('kittyParty').get('defaultLevel', 2), 1, 5);
  }
  // Stopping always resets the melon level, so the next start is back to the default.
  stop() { this.set({ enabled: false, level: this.defaultLevel() }); }
  toggle() { this.s.enabled ? this.stop() : this.start(); }
  more() {
    if (!this.s.enabled) { this.start(); return; }
    this.set({ level: Math.min(5, this.s.level + 1) });
  }
  // One step fewer. At the lowest level this stops the party.
  fewer() {
    if (!this.s.enabled) return;
    if (this.s.level <= 1) { this.stop(); return; }
    this.set({ level: this.s.level - 1 });
  }
}

// ---- webviews --------------------------------------------------------------

class WebviewHub {
  constructor(state) {
    this.state = state;
    this.webviews = new Set();
  }
  post(msg) { for (const w of this.webviews) w.postMessage(msg); }
  attach(webview, large, disposeEvent) {
    webview.options = { enableScripts: true };
    webview.html = getHtml({ cspSource: webview.cspSource, nonce: newNonce(), large });
    this.webviews.add(webview);
    const sub = webview.onDidReceiveMessage((m) => this.handle(webview, m));
    disposeEvent(() => { this.webviews.delete(webview); sub.dispose(); });
  }
  handle(webview, m) {
    if (!m || typeof m.type !== 'string') return;
    switch (m.type) {
      case 'ready': webview.postMessage({ type: 'state', state: this.state.get() }); break;
      case 'start': this.state.start(); break;
      case 'more': this.state.more(); break;
      case 'less': this.state.fewer(); break;
      case 'restore': this.state.stop(); break;
      case 'cat':
        if (typeof m.id === 'string' && CATS[m.id]) {
          this.state.set({ cat: m.id });
          if (!this.state.get().enabled) this.state.start();
        }
        break;
      default: break;
    }
  }
}

class PartyViewProvider {
  constructor(hub) { this.hub = hub; }
  resolveWebviewView(view) {
    this.hub.attach(view.webview, false, (fn) => view.onDidDispose(fn));
  }
}

// ---- editor decorations ----------------------------------------------------

class Decorator {
  constructor(state) {
    this.state = state;
    this.afterTypes = DECO_KINDS.map((kind) => vscode.window.createTextEditorDecorationType({
      after: {
        contentIconPath: vscode.Uri.parse(svgToDataUri(decoSVG(kind))),
        margin: '0 0 0 1.2em',
        width: '1.1em',
        height: '1.1em',
      },
    }));
    this.gutterType = null;
    this.gutterCat = null;
    this.timer = null;
  }
  ensureGutter(catId) {
    if (this.gutterCat === catId && this.gutterType) return;
    if (this.gutterType) this.gutterType.dispose();
    this.gutterType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.parse(svgToDataUri(catFaceSVG(catId))),
      gutterIconSize: 'contain',
    });
    this.gutterCat = catId;
  }
  schedule() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refreshAll(), 120);
  }
  refreshAll() {
    for (const editor of vscode.window.visibleTextEditors) this.refresh(editor);
  }
  clear(editor) {
    for (const t of this.afterTypes) editor.setDecorations(t, []);
    if (this.gutterType) editor.setDecorations(this.gutterType, []);
  }
  refresh(editor) {
    const s = this.state.get();
    if (!s.enabled || s.level === 0) { this.clear(editor); return; }
    const cfg = vscode.workspace.getConfiguration('kittyParty');
    const hover = cfg.get('hoverMessages', true);
    const gutterOn = cfg.get('gutterCats', true);
    const cat = CATS[s.cat];
    this.ensureGutter(s.cat);

    const doc = editor.document;
    const prob = PROB[s.level];
    const docKey = fnv(doc.uri.toString());
    const buckets = DECO_KINDS.map(() => []);
    const gutter = [];
    const seen = new Set();

    for (const vr of editor.visibleRanges) {
      const last = Math.min(vr.end.line, doc.lineCount - 1);
      for (let ln = vr.start.line; ln <= last; ln++) {
        if (seen.has(ln)) continue;
        seen.add(ln);
        const h = fnv(docKey + ':' + ln);
        const r = (h % 1000) / 1000;
        const text = doc.lineAt(ln).text;
        if (r < prob && text.trim().length > 0) {
          const kind = (h >>> 10) % DECO_KINDS.length;
          const opt = { range: new vscode.Range(ln, Math.max(0, text.length - 1), ln, text.length) };
          if (hover) opt.hoverMessage = new vscode.MarkdownString(`**${cat.name}** says: ${lineFor(s.cat, h >>> 4)}`);
          buckets[kind].push(opt);
        } else if (gutterOn && ((h >>> 12) % 1000) / 1000 < prob * 0.5) {
          gutter.push({ range: new vscode.Range(ln, 0, ln, 0) });
        }
      }
    }
    this.afterTypes.forEach((t, i) => editor.setDecorations(t, buckets[i]));
    editor.setDecorations(this.gutterType, gutter);
  }
  dispose() {
    clearTimeout(this.timer);
    this.afterTypes.forEach((t) => t.dispose());
    if (this.gutterType) this.gutterType.dispose();
  }
}

// ---- activation ------------------------------------------------------------

function activate(context) {
  const state = new PartyState(context.globalState);
  const hub = new WebviewHub(state);
  const decorator = new Decorator(state);
  const sub = (d) => context.subscriptions.push(d);
  sub(decorator);

  // Status bar
  const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 90);
  status.command = 'kittyParty.toggle';
  sub(status);
  const renderStatus = () => {
    const s = state.get();
    const show = vscode.workspace.getConfiguration('kittyParty').get('statusBar', true);
    status.text = s.enabled ? `\u{1F349} ${CATS[s.cat].name}` : '\u{1F349} Kitty Party';
    status.tooltip = s.enabled
      ? `${CATS[s.cat].name} is partying (melon level ${s.level}/5). Click to stop.`
      : 'Click to start the Kitty Party';
    if (show) status.show(); else status.hide();
  };

  // Webview views + large panel
  const provider = new PartyViewProvider(hub);
  sub(vscode.window.registerWebviewViewProvider('kittyParty.panel', provider));
  sub(vscode.window.registerWebviewViewProvider('kittyParty.explorer', provider));

  let largePanel = null;
  function openLarge() {
    if (largePanel) { largePanel.reveal(); return; }
    largePanel = vscode.window.createWebviewPanel(
      'kittyParty.large', 'Kitty Party', vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true });
    hub.attach(largePanel.webview, true, (fn) => largePanel.onDidDispose(fn));
    largePanel.onDidDispose(() => { largePanel = null; });
    sub(largePanel);
  }

  // Keep everything in sync
  sub(state.onDidChange((s) => {
    hub.post({ type: 'state', state: s });
    renderStatus();
    decorator.refreshAll();
  }));
  renderStatus();

  sub(vscode.window.onDidChangeVisibleTextEditors(() => decorator.schedule()));
  sub(vscode.window.onDidChangeTextEditorVisibleRanges(() => decorator.schedule()));
  sub(vscode.workspace.onDidChangeTextDocument(() => decorator.schedule()));
  sub(vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('kittyParty')) { renderStatus(); decorator.refreshAll(); }
  }));
  decorator.refreshAll();

  // Optional save celebration (opt-in, with a cooldown)
  let lastCelebrate = 0;
  sub(vscode.workspace.onDidSaveTextDocument(() => {
    const cfg = vscode.workspace.getConfiguration('kittyParty');
    const s = state.get();
    if (!cfg.get('celebrateOnSave', false) || !s.enabled) return;
    const now = Date.now();
    if (now - lastCelebrate < 8000) return;
    lastCelebrate = now;
    const text = saveLineFor(s.cat, now / 1000);
    vscode.window.setStatusBarMessage(`\u{1F349} ${CATS[s.cat].name}: ${text}`, 4000);
    hub.post({ type: 'burst', text: `${CATS[s.cat].name}: ${text}` });
  }));

  // Commands
  const cmd = (id, fn) => sub(vscode.commands.registerCommand(id, fn));
  cmd('kittyParty.toggle', () => state.toggle());
  cmd('kittyParty.moreMelons', () => state.more());
  cmd('kittyParty.fewerMelons', () => state.fewer());
  cmd('kittyParty.restore', () => state.stop());
  cmd('kittyParty.openLarge', () => { state.start(); openLarge(); });
  cmd('kittyParty.chooseCat', async () => {
    const pick = await vscode.window.showQuickPick(
      CAT_IDS.map((id) => ({ label: CATS[id].name, description: CATS[id].trait, id })),
      { placeHolder: 'Who is coming to the party?' });
    if (pick) state.set({ cat: pick.id });
  });
  cmd('kittyParty.chooseTheme', async () => {
    const themes = (context.extension.packageJSON.contributes || {}).themes || [];
    const pick = await vscode.window.showQuickPick(
      themes.map((t) => ({ label: t.label, description: t.uiTheme === 'vs' ? 'light' : 'dark' })),
      { placeHolder: 'Pick a watermelon theme' });
    if (pick) {
      await vscode.workspace.getConfiguration('workbench')
        .update('colorTheme', pick.label, vscode.ConfigurationTarget.Global);
    }
  });
}

function deactivate() { }

module.exports = { activate, deactivate, fnv, PROB };
