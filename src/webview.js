'use strict';
const crypto = require('crypto');
const { CATS, CAT_IDS, catSVG, sliceSVG, decoSVG } = require('./art');
const { LINES } = require('./messages');

function newNonce() { return crypto.randomBytes(16).toString('hex'); }

const CSS = `
:root { color-scheme: light dark; }
* { box-sizing: border-box; }
body { margin: 0; padding: 0; font-family: var(--vscode-font-family); font-size: var(--vscode-font-size); color: var(--vscode-foreground); overflow-x: hidden; }
.wrap { position: relative; padding: 8px 8px 10px; min-height: 100vh; display: flex; flex-direction: column; gap: 8px; }
.sky { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.stage, .bar, .bubble { position: relative; z-index: 1; }

.stage { display: flex; justify-content: center; align-items: flex-end; gap: 4px; padding-top: 6px; }
.cat { flex: 1 1 0; min-width: 0; max-width: 150px; background: none; border: 0; padding: 2px; margin: 0; color: inherit; font: inherit; cursor: pointer; border-radius: 10px; display: flex; flex-direction: column; align-items: center; }
.cat:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 1px; }
.cat svg { width: 100%; height: auto; display: block; overflow: visible; }
.cat .name { font-size: 11px; opacity: .75; margin-top: 2px; }
.cat[aria-pressed="true"] .name { opacity: 1; font-weight: 600; color: var(--vscode-textLink-foreground); }
.cat[aria-pressed="true"]::after { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--vscode-textLink-foreground); margin-top: 2px; }

.bubble { align-self: center; max-width: 100%; text-align: center; font-size: 12px; line-height: 1.35; padding: 5px 10px; border-radius: 12px; background: var(--vscode-editorWidget-background); border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, transparent)); min-height: 28px; }

.bar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
.btn { font: inherit; font-size: 12px; padding: 4px 10px; border-radius: 4px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); }
.btn:disabled { opacity: .5; cursor: default; }
.btn:hover:not(:disabled) { background: var(--vscode-button-secondaryHoverBackground); }
.btn.primary { background: var(--vscode-button-background); color: var(--vscode-button-foreground); }
.btn.primary:hover { background: var(--vscode-button-hoverBackground); }
.btn:focus-visible { outline: 2px solid var(--vscode-focusBorder); outline-offset: 1px; }
.level { display: inline-flex; gap: 3px; align-items: center; font-size: 11px; opacity: .85; }
.dot { width: 7px; height: 7px; border-radius: 50%; border: 1px solid var(--vscode-textLink-foreground); }
.dot.on { background: var(--vscode-textLink-foreground); }

.fall { position: absolute; top: 0; width: var(--size); height: calc(var(--size) * .625); will-change: transform; animation: fall var(--dur) linear forwards; }
.fall svg, .puff svg { width: 100%; height: 100%; display: block; }
.puff { position: absolute; width: 20px; height: 14px; will-change: transform, opacity; animation: burst .9s ease-out forwards; }
.puff.round { height: 20px; }

@keyframes fall { from { transform: translateY(-30px) rotate(0deg); } to { transform: translateY(var(--h)) rotate(var(--rot)); } }
@keyframes burst { from { transform: translate(0, 0) scale(.4); opacity: 1; } to { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(1.1); opacity: 0; } }
@keyframes bob { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-7px) rotate(2deg); } }
@keyframes wave { from { transform: rotate(-22deg); } to { transform: rotate(14deg); } }
@keyframes hold { from { transform: rotate(-4deg); } to { transform: rotate(5deg); } }
@keyframes wag { from { transform: rotate(-12deg); } to { transform: rotate(14deg); } }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }

.eye { transform-box: fill-box; transform-origin: center; animation: blink 4.4s infinite; }
.tail, .arm-r, .arm-l { transform-box: fill-box; }
.tail { transform-origin: left bottom; }
.arm-r { transform-origin: left bottom; }
.arm-l { transform-origin: right bottom; }

.on .bob { animation: bob .62s ease-in-out infinite alternate; }
.on .tail { animation: wag .5s ease-in-out infinite alternate; }
.on .arm-r { animation: wave .42s ease-in-out infinite alternate; }
.on .arm-l { animation: hold .62s ease-in-out infinite alternate; }
.on .cat:nth-child(2) * { animation-delay: -.2s; }
.on .cat:nth-child(3) * { animation-delay: -.4s; }
.paused *, .paused *::after { animation-play-state: paused !important; }
.off .bob { transform: translateY(3px); }
.off .cat svg { filter: saturate(.7); }

body.large .stage { gap: 16px; padding-top: 24px; }
body.large .cat { max-width: 230px; }
body.large .cat .name { font-size: 14px; }
body.large .bubble { font-size: 15px; padding: 9px 16px; }
body.large .btn { font-size: 14px; padding: 6px 14px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .fall, .puff { display: none; }
}
`;

// Client script. Runs inside the webview; uses only CSSOM (no inline style attributes) so it passes the CSP.
const CLIENT = `
(function () {
  const vscode = acquireVsCodeApi();
  const data = JSON.parse(document.getElementById('kp-data').textContent);
  const root = document.getElementById('root');
  const sky = document.getElementById('sky');
  const bubble = document.getElementById('bubble');
  const btnMain = document.getElementById('btn-main');
  const btnMore = document.getElementById('btn-more');
  const btnLess = document.getElementById('btn-less');
  const btnRestore = document.getElementById('btn-restore');
  const levelEl = document.getElementById('level');
  const cats = Array.from(document.querySelectorAll('.cat'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const RATE = [0, 2600, 1700, 1100, 700, 420];
  const MAX_NODES = 40;
  let state = { enabled: false, level: 2, cat: 'mochi' };
  let paused = false;
  let timer = null;
  let bubbleTimer = null;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function say(text, ms) {
    bubble.textContent = text;
    clearTimeout(bubbleTimer);
    if (ms) bubbleTimer = setTimeout(idleText, ms);
  }
  function idleText() {
    say(state.enabled ? (paused ? 'Party paused.' : 'Party time!') : 'The cats are napping. Press start.');
  }
  function drop(node, ms) {
    sky.appendChild(node);
    node.addEventListener('animationend', function () { node.remove(); }, { once: true });
    setTimeout(function () { node.remove(); }, ms);
  }
  function room() { return sky.childElementCount < MAX_NODES; }
  function fall() {
    if (reduced || !room() || document.hidden) return;
    const el = document.createElement('div');
    el.className = 'fall';
    el.innerHTML = Math.random() < 0.22 ? data.melon : (Math.random() < 0.5 ? data.sliceFace : data.slice);
    const size = rand(16, data.large ? 34 : 26);
    el.style.setProperty('--size', size + 'px');
    el.style.setProperty('--dur', rand(3.2, 6.4).toFixed(2) + 's');
    el.style.setProperty('--h', (root.clientHeight + 60) + 'px');
    el.style.setProperty('--rot', rand(-360, 360).toFixed(0) + 'deg');
    el.style.left = rand(0, 94).toFixed(1) + '%';
    drop(el, 7500);
  }
  function burst(x, y) {
    if (reduced) return;
    const n = 7;
    for (let i = 0; i < n && room(); i++) {
      const el = document.createElement('div');
      const round = Math.random() < 0.3;
      el.className = 'puff' + (round ? ' round' : '');
      el.innerHTML = round ? data.melon : data.sliceFace;
      const a = rand(-Math.PI, 0.1 * Math.PI) - 0.2;
      const d = rand(40, data.large ? 150 : 90);
      el.style.setProperty('--dx', (Math.cos(a) * d).toFixed(0) + 'px');
      el.style.setProperty('--dy', (Math.sin(a) * d - 10).toFixed(0) + 'px');
      el.style.setProperty('--rot', rand(-200, 200).toFixed(0) + 'deg');
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      drop(el, 1500);
    }
  }
  function schedule() {
    clearInterval(timer);
    timer = null;
    const rate = RATE[state.level] || 0;
    if (state.enabled && !paused && rate && !reduced) timer = setInterval(fall, rate);
  }
  function render() {
    root.classList.toggle('on', state.enabled);
    root.classList.toggle('off', !state.enabled);
    root.classList.toggle('paused', paused);
    cats.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)); });
    btnMain.textContent = !state.enabled ? 'Start party' : (paused ? 'Resume' : 'Pause');
    btnMain.classList.toggle('primary', !state.enabled);
    btnRestore.disabled = !state.enabled;
    btnLess.disabled = !state.enabled;
    let dots = '';
    for (let i = 1; i <= 5; i++) dots += '<span class="dot' + (i <= state.level ? ' on' : '') + '"></span>';
    levelEl.innerHTML = '<span>Melons</span>' + dots;
    levelEl.setAttribute('aria-label', 'Melon level ' + state.level + ' of 5');
    schedule();
    idleText();
  }

  cats.forEach(function (b) {
    b.addEventListener('click', function () {
      const id = b.dataset.cat;
      const lines = data.lines[id];
      const r = b.getBoundingClientRect();
      const o = root.getBoundingClientRect();
      say(data.names[id] + ': ' + lines[Math.floor(Math.random() * lines.length)], 4500);
      burst(r.left - o.left + r.width / 2, r.top - o.top + r.height / 3);
      vscode.postMessage({ type: 'cat', id: id });
    });
  });
  btnMain.addEventListener('click', function () {
    if (!state.enabled) { vscode.postMessage({ type: 'start' }); return; }
    paused = !paused;
    render();
  });
  btnMore.addEventListener('click', function () { vscode.postMessage({ type: 'more' }); });
  btnLess.addEventListener('click', function () { vscode.postMessage({ type: 'less' }); });
  btnRestore.addEventListener('click', function () { paused = false; vscode.postMessage({ type: 'restore' }); });

  window.addEventListener('message', function (e) {
    const m = e.data;
    if (m.type === 'state') {
      const wasOff = !state.enabled;
      state = m.state;
      if (wasOff && state.enabled) paused = false;
      render();
    } else if (m.type === 'burst') {
      burst(root.clientWidth / 2, root.clientHeight / 3);
      if (m.text) say(m.text, 4000);
    }
  });
  render();
  vscode.postMessage({ type: 'ready' });
})();
`;

function getHtml({ cspSource, nonce, large = false }) {
  const catButtons = CAT_IDS.map((id) =>
    `<button class="cat" data-cat="${id}" aria-pressed="false" title="${CATS[id].name}, the ${CATS[id].trait}">` +
    `${catSVG(CATS[id])}<span class="name">${CATS[id].name}</span></button>`).join('');
  const payload = {
    large,
    slice: sliceSVG(false),
    sliceFace: sliceSVG(true),
    melon: decoSVG('melon'),
    names: Object.fromEntries(CAT_IDS.map((id) => [id, CATS[id].name])),
    lines: LINES,
  };
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource} data:; style-src 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Kitty Party</title>
<style nonce="${nonce}">${CSS}</style>
</head>
<body class="${large ? 'large' : ''}">
<div class="wrap off" id="root">
  <div class="sky" id="sky" aria-hidden="true"></div>
  <div class="stage">${catButtons}</div>
  <div class="bubble" id="bubble" role="status" aria-live="polite"></div>
  <div class="bar">
    <button class="btn primary" id="btn-main">Start party</button>
    <button class="btn" id="btn-less" title="Fewer melons (at the lowest level this stops the party)">Fewer melons</button>
    <button class="btn" id="btn-more" title="Add more melons">More melons</button>
    <button class="btn" id="btn-restore" title="Stop the party and clear editor decorations">Restore editor</button>
    <span class="level" id="level"></span>
  </div>
</div>
<script id="kp-data" type="application/json" nonce="${nonce}">${json}</script>
<script nonce="${nonce}">${CLIENT}</script>
</body>
</html>`;
}

module.exports = { getHtml, newNonce };
