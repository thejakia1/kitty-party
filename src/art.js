'use strict';
// Original artwork for Kitty Party: three cats and a watermelon, drawn as inline SVG.
// No inline style attributes are used, so the markup works under a strict webview CSP.
// Animations are applied from CSS classes (see webview.js).

const CATS = {
  mochi: {
    id: 'mochi', name: 'Mochi', trait: 'orange tabby',
    fur: '#ffb46b', furDark: '#e98a3c', belly: '#fff1dc', ear: '#ff9eb5',
    iris: '#4a2c2a', whisker: '#fff6e8', pattern: 'tabby', bow: false,
  },
  salem: {
    id: 'salem', name: 'Salem', trait: 'black cat',
    fur: '#3b3547', furDark: '#26212f', belly: '#5a5370', ear: '#ff8fb1',
    iris: '#ffd84d', whisker: '#efe8ff', pattern: 'none', bow: false,
  },
  pudding: {
    id: 'pudding', name: 'Pudding', trait: 'calico',
    fur: '#fffaf2', furDark: '#e2d0b6', belly: '#ffffff', ear: '#ffb3c6',
    iris: '#4f8fd9', whisker: '#c9b79c', pattern: 'calico', bow: true,
  },
};
const CAT_IDS = Object.keys(CATS);

// ---- watermelon ----------------------------------------------------------

function sliceInner(face) {
  const seeds = [
    [10.6, 12.4, -25], [21.4, 12.4, 25], [16, 15.4, 0],
  ].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="0.95" ry="1.55" fill="#3a1220" transform="rotate(${r} ${x} ${y})"/>`).join('');
  const faceBits = face
    ? '<circle cx="12" cy="8.6" r="1.05" fill="#4a1022"/><circle cx="20" cy="8.6" r="1.05" fill="#4a1022"/>' +
      '<path d="M14.3 10.4Q16 12.1 17.7 10.4" fill="none" stroke="#4a1022" stroke-width=".8" stroke-linecap="round"/>' +
      '<circle cx="9.4" cy="10.2" r="1.3" fill="#ff8a8a" opacity=".8"/><circle cx="22.6" cy="10.2" r="1.3" fill="#ff8a8a" opacity=".8"/>'
    : '';
  return (
    '<path d="M2 4A14 14 0 0 0 30 4Z" fill="#2f9e4f"/>' +
    '<path d="M3.7 4A12.3 12.3 0 0 0 28.3 4Z" fill="#eaf6c6"/>' +
    '<path d="M5.2 4A10.8 10.8 0 0 0 26.8 4Z" fill="#f23645"/>' +
    '<path d="M8 4A8 8 0 0 0 24 4Z" fill="#ff5a5f" opacity=".6"/>' +
    seeds + faceBits
  );
}

function sliceSVG(face = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20">${sliceInner(face)}</svg>`;
}

function meloSVG() {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">' +
    '<path d="M12 3.2Q13 1.4 15 1.6" fill="none" stroke="#2f7d3f" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="12" cy="13.2" r="10" fill="#3fb866"/>' +
    '<path d="M12 3.4Q6.6 13 12 23" fill="none" stroke="#1f8a45" stroke-width="1.7" stroke-linecap="round"/>' +
    '<path d="M12 3.4Q17.4 13 12 23" fill="none" stroke="#1f8a45" stroke-width="1.7" stroke-linecap="round"/>' +
    '<path d="M5 7Q2.6 13 5.6 19.2" fill="none" stroke="#1f8a45" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M19 7Q21.4 13 18.4 19.2" fill="none" stroke="#1f8a45" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M6.4 8.2Q8 5.8 10.6 5" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".4"/>' +
    '</svg>'
  );
}

function pawSVG() {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="#ff5a5f">' +
    '<ellipse cx="12" cy="15.6" rx="5.6" ry="4.6"/>' +
    '<ellipse cx="5.6" cy="10.6" rx="2.1" ry="2.7"/><ellipse cx="9.6" cy="6.4" rx="2.1" ry="2.8"/>' +
    '<ellipse cx="14.4" cy="6.4" rx="2.1" ry="2.8"/><ellipse cx="18.4" cy="10.6" rx="2.1" ry="2.7"/>' +
    '</g></svg>'
  );
}

const DECO = {
  slice: () => sliceSVG(false),
  sliceFace: () => sliceSVG(true),
  melon: meloSVG,
  paw: pawSVG,
};
const DECO_KINDS = Object.keys(DECO);
function decoSVG(kind) { return (DECO[kind] || DECO.slice)(); }

// ---- cats ----------------------------------------------------------------

function eye(cx, cy, c, side) {
  return (
    `<g class="eye ${side}">` +
    `<ellipse cx="${cx}" cy="${cy}" rx="6" ry="7" fill="${c.iris}"/>` +
    `<ellipse cx="${cx}" cy="${cy + 0.5}" rx="3" ry="5.4" fill="#1d1524"/>` +
    `<circle cx="${cx - 1.9}" cy="${cy - 2.6}" r="2" fill="#fff"/>` +
    `<circle cx="${cx + 2}" cy="${cy + 2.4}" r="1" fill="#fff" opacity=".85"/>` +
    '</g>'
  );
}

function headParts(c, uid) {
  const stripes = c.pattern === 'tabby'
    ? `<g stroke="${c.furDark}" stroke-width="3" stroke-linecap="round">` +
      '<path d="M70 29.5V38"/><path d="M61.5 31.5L63.5 39"/><path d="M78.5 31.5L76.5 39"/></g>'
    : '';
  const calico = c.pattern === 'calico'
    ? `<g clip-path="url(#${uid}-hc)">` +
      '<ellipse cx="50" cy="42" rx="15" ry="12" fill="#ff9d4d"/>' +
      '<ellipse cx="96" cy="40" rx="12" ry="11" fill="#4a4150"/></g>'
    : '';
  const bow = c.bow
    ? '<path d="M96 27L83 19V35Z" fill="#f23645"/><path d="M96 27L109 19V35Z" fill="#f23645"/>' +
      '<circle cx="96" cy="27" r="4.2" fill="#c8202e"/>'
    : '';
  return (
    '<g class="ears">' +
    `<path d="M38 44L35 11Q52 15 64 30Z" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M102 44L105 11Q88 15 76 30Z" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5" stroke-linejoin="round"/>` +
    `<path d="M43 36L41.5 20Q51 23 58 31Z" fill="${c.ear}"/>` +
    `<path d="M97 36L98.5 20Q89 23 82 31Z" fill="${c.ear}"/>` +
    '</g>' +
    `<defs><clipPath id="${uid}-hc"><ellipse cx="70" cy="56" rx="34" ry="29"/></clipPath></defs>` +
    `<ellipse cx="70" cy="56" rx="34" ry="29" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5"/>` +
    calico + stripes + bow +
    eye(56, 56, c, 'l') + eye(84, 56, c, 'r') +
    '<circle cx="47" cy="68" r="5" fill="#ff8fa8" opacity=".5"/><circle cx="93" cy="68" r="5" fill="#ff8fa8" opacity=".5"/>' +
    '<path d="M66.5 65.5H73.5L70 70Z" fill="#ff7a9c" stroke="#ff7a9c" stroke-width="1" stroke-linejoin="round"/>' +
    '<path d="M70 70Q66.5 76 62 72.5M70 70Q73.5 76 78 72.5" fill="none" stroke="#4a2c2a" stroke-width="1.6" stroke-linecap="round"/>' +
    `<g stroke="${c.whisker}" stroke-width="1.3" stroke-linecap="round" opacity=".9">` +
    '<path d="M39 64L25 61"/><path d="M39 69L25 71"/><path d="M101 64L115 61"/><path d="M101 69L115 71"/></g>'
  );
}

function bodyParts(c, uid) {
  const tabby = c.pattern === 'tabby'
    ? `<g stroke="${c.furDark}" stroke-width="3" stroke-linecap="round">` +
      '<path d="M45 104L52 106"/><path d="M44 114L52 114"/><path d="M46 124L53 122"/>' +
      '<path d="M95 104L88 106"/><path d="M96 114L88 114"/><path d="M94 124L87 122"/></g>'
    : '';
  const calico = c.pattern === 'calico'
    ? `<g clip-path="url(#${uid}-bc)"><ellipse cx="88" cy="108" rx="13" ry="15" fill="#ff9d4d"/>` +
      '<ellipse cx="52" cy="128" rx="9" ry="8" fill="#4a4150"/></g>'
    : '';
  const tailStripes = c.pattern === 'tabby'
    ? `<path d="M95 130C126 132 130 98 117 84" fill="none" stroke="${c.furDark}" stroke-width="10" stroke-linecap="round" stroke-dasharray="3 8"/>`
    : '';
  return (
    `<path class="tail" d="M95 130C126 132 130 98 117 84" fill="none" stroke="${c.fur}" stroke-width="10" stroke-linecap="round"/>` +
    tailStripes +
    `<defs><clipPath id="${uid}-bc"><ellipse cx="70" cy="112" rx="28" ry="30"/></clipPath></defs>` +
    `<ellipse cx="70" cy="112" rx="28" ry="30" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5"/>` +
    calico +
    `<ellipse cx="70" cy="118" rx="16" ry="19" fill="${c.belly}"/>` +
    tabby +
    `<ellipse cx="54" cy="143" rx="11" ry="6" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5"/>` +
    `<ellipse cx="86" cy="143" rx="11" ry="6" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.5"/>`
  );
}

function armParts(c) {
  const right =
    '<g class="arm-r">' +
    `<path d="M93 102L110 84" stroke="${c.fur}" stroke-width="11" stroke-linecap="round" fill="none"/>` +
    `<circle cx="111" cy="83" r="6.5" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.2"/></g>`;
  const left =
    '<g class="arm-l">' +
    '<g transform="rotate(-20 25 82)">' +
    `<svg x="6" y="70" width="38" height="24" viewBox="0 0 32 20">${sliceInner(true)}</svg></g>` +
    `<path d="M47 104L32 93" stroke="${c.fur}" stroke-width="11" stroke-linecap="round" fill="none"/>` +
    `<circle cx="31" cy="92" r="6.5" fill="${c.fur}" stroke="${c.furDark}" stroke-width="1.2"/></g>`;
  return { right, left };
}

function catSVG(cat, opts = {}) {
  const c = typeof cat === 'string' ? CATS[cat] : cat;
  const uid = opts.uid || c.id;
  const arms = armParts(c);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 160" class="cat-svg" role="img" aria-label="${c.name}, a ${c.trait} holding a watermelon slice">` +
    '<ellipse class="shadow" cx="70" cy="153" rx="34" ry="5" fill="#000" opacity=".2"/>' +
    '<g class="bob">' +
    bodyParts(c, uid) + arms.right + headParts(c, uid) + arms.left +
    '</g></svg>'
  );
}

function catFaceSVG(cat) {
  const c = typeof cat === 'string' ? CATS[cat] : cat;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="22 6 96 86">${headParts(c, c.id + '-f')}</svg>`;
}

function svgToDataUri(svg) {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
}

module.exports = { CATS, CAT_IDS, DECO_KINDS, catSVG, catFaceSVG, sliceSVG, decoSVG, svgToDataUri };
