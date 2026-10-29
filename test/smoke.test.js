'use strict';
// Loads the extension against a minimal fake `vscode` module and exercises it.
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function makeVscode() {
  const registered = { commands: {}, views: {}, decoTypes: [], statusBar: null, setDecorationCalls: 0 };
  class Emitter { constructor() { this.l = []; this.event = (f) => { this.l.push(f); return { dispose() {} }; }; } fire(v) { this.l.forEach((f) => f(v)); } }
  const ev = () => () => ({ dispose() {} });
  const editor = {
    document: {
      uri: { toString: () => 'file:///demo.js' }, lineCount: 200,
      lineAt: (n) => ({ text: n % 7 === 0 ? '' : 'const value' + n + ' = compute(' + n + ');' }),
    },
    visibleRanges: [{ start: { line: 0 }, end: { line: 120 } }],
    decorated: new Map(),
    setDecorations(t, opts) { registered.setDecorationCalls++; this.decorated.set(t, opts); },
  };
  registered.editor = editor;
  const vs = {
    EventEmitter: Emitter,
    Uri: { parse: (s) => ({ s }) },
    Range: class { constructor(a, b, c, d) { Object.assign(this, { a, b, c, d }); } },
    MarkdownString: class { constructor(v) { this.value = v; } },
    StatusBarAlignment: { Right: 2 }, ViewColumn: { Beside: -2 }, ConfigurationTarget: { Global: 1 },
    window: {
      visibleTextEditors: [editor],
      createTextEditorDecorationType: (o) => { const t = { o, dispose() {} }; registered.decoTypes.push(t); return t; },
      createStatusBarItem: () => (registered.statusBar = { show() { this.shown = true; }, hide() {}, dispose() {} }),
      registerWebviewViewProvider: (id, p) => { registered.views[id] = p; return { dispose() {} }; },
      createWebviewPanel: () => ({ webview: fakeWebview(), reveal() {}, onDidDispose: () => ({ dispose() {} }), dispose() {} }),
      onDidChangeVisibleTextEditors: ev(), onDidChangeTextEditorVisibleRanges: ev(),
      setStatusBarMessage: () => ({ dispose() {} }), showQuickPick: async () => undefined,
    },
    workspace: {
      getConfiguration: () => ({ get: (k, d) => d, update: async () => {} }),
      onDidChangeTextDocument: ev(), onDidChangeConfiguration: ev(), onDidSaveTextDocument: ev(),
    },
    commands: { registerCommand: (id, fn) => { registered.commands[id] = fn; return { dispose() {} }; } },
  };
  return { vs, registered };
}
function fakeWebview() {
  const w = { html: '', posts: [], handlers: [], cspSource: 'vscode-resource:', options: null,
    postMessage(m) { w.posts.push(m); }, onDidReceiveMessage(f) { w.handlers.push(f); return { dispose() {} }; } };
  return w;
}

function load() {
  const { vs, registered } = makeVscode();
  const orig = Module._load;
  Module._load = function (req, ...rest) { return req === 'vscode' ? vs : orig.call(this, req, ...rest); };
  for (const k of Object.keys(require.cache)) if (k.startsWith(path.join(root, 'src'))) delete require.cache[k];
  const ext = require(path.join(root, 'src', 'extension.js'));
  Module._load = orig;
  const store = {};
  const ctx = {
    subscriptions: [], globalState: { get: (k) => store[k], update: (k, v) => { store[k] = v; } },
    extension: { packageJSON: pkg },
  };
  ext.activate(ctx);
  return { ext, ctx, registered, store };
}

test('every contributed command and view has a handler', () => {
  const { registered } = load();
  for (const c of pkg.contributes.commands) assert.ok(registered.commands[c.command], 'missing ' + c.command);
  assert.ok(registered.views['kittyParty.panel'] && registered.views['kittyParty.explorer']);
});

test('theme files exist, parse and have colors and tokens', () => {
  for (const t of pkg.contributes.themes) {
    const j = JSON.parse(fs.readFileSync(path.join(root, t.path), 'utf8'));
    assert.strictEqual(j.name, t.label);
    assert.ok(Object.keys(j.colors).length > 100);
    assert.ok(j.tokenColors.length > 20);
    for (const v of Object.values(j.colors)) assert.match(v, /^#[0-9a-f]{6}([0-9a-f]{2})?$/i);
  }
});

test('party starts, decorates deterministically, and restores', () => {
  const { registered } = load();
  const ed = registered.editor;
  registered.commands['kittyParty.toggle']();
  const all = [...ed.decorated.values()].flat();
  assert.ok(all.length > 0, 'expected decorations at level 2');
  const first = JSON.stringify([...ed.decorated.values()].map((v) => v.map((o) => o.range.a)));
  registered.commands['kittyParty.moreMelons']();
  registered.commands['kittyParty.restore']();
  for (const v of ed.decorated.values()) assert.deepStrictEqual(v, []);
  registered.commands['kittyParty.toggle']();
  registered.commands['kittyParty.moreMelons']();
  registered.commands['kittyParty.moreMelons']();
  registered.commands['kittyParty.moreMelons']();
  registered.commands['kittyParty.restore']();
  assert.ok(first.length > 0);
});

test('higher levels decorate more lines', () => {
  const { registered } = load();
  const ed = registered.editor;
  const count = () => [...ed.decorated.values()].flat().length;
  registered.commands['kittyParty.toggle'](); // level 2
  const l2 = count();
  for (let i = 0; i < 3; i++) registered.commands['kittyParty.moreMelons'](); // level 5
  assert.ok(count() > l2, 'level 5 should exceed level 2');
});

test('webview html is CSP-safe and handles messages', () => {
  const { registered } = load();
  const view = { webview: fakeWebview(), onDidDispose: () => ({ dispose() {} }) };
  registered.views['kittyParty.panel'].resolveWebviewView(view);
  const html = view.webview.html;
  assert.match(html, /Content-Security-Policy/);
  assert.ok(!/\sstyle="/.test(html), 'no inline style attributes allowed by CSP');
  assert.ok(!/ onclick=/.test(html));
  assert.strictEqual((html.match(/class="cat"/g) || []).length, 3);
  view.webview.handlers[0]({ type: 'ready' });
  assert.strictEqual(view.webview.posts.at(-1).type, 'state');
  view.webview.handlers[0]({ type: 'cat', id: 'salem' });
  assert.strictEqual(view.webview.posts.at(-1).state.cat, 'salem');
  assert.strictEqual(view.webview.posts.at(-1).state.enabled, true);
  view.webview.handlers[0]({ type: 'cat', id: '<script>' }); // ignored
  assert.strictEqual(view.webview.posts.at(-1).state.cat, 'salem');
});

test('client script is valid JavaScript', () => {
  const { getHtml } = require(path.join(root, 'src', 'webview.js'));
  const html = getHtml({ cspSource: 'x', nonce: 'n' });
  const m = html.match(/<script nonce="n">([\s\S]*?)<\/script>/);
  assert.ok(m);
  new Function('acquireVsCodeApi', 'document', 'window', m[1]); // parse only
});

test('fewer lowers the level, and stop resets it to the default', () => {
  const { registered } = load();
  const ed = registered.editor;
  const count = () => [...ed.decorated.values()].flat().length;
  const c = registered.commands;
  c['kittyParty.toggle']();
  const l2 = count();
  for (let i = 0; i < 3; i++) c['kittyParty.moreMelons']();
  const l5 = count();
  c['kittyParty.fewerMelons']();
  assert.ok(count() < l5, 'fewer should reduce decorations');
  c['kittyParty.restore']();
  assert.strictEqual(count(), 0);
  c['kittyParty.toggle']();
  assert.strictEqual(count(), l2, 'restart should be back at the default level');
  c['kittyParty.fewerMelons'](); // level 2 -> 1
  c['kittyParty.fewerMelons'](); // level 1 -> stop
  assert.strictEqual(count(), 0);
});
