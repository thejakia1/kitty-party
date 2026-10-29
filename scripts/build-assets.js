'use strict';
// Generates media/icon.png, media/preview.png and media/cat.svg from src/art.js.
// Dev-only: needs `npm i --no-save @resvg/resvg-js`.
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');
const { CATS, CAT_IDS, catSVG, catFaceSVG, decoSVG } = require('../src/art');

const media = path.join(__dirname, '..', 'media');
const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const png = (svg, width) => new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng();

// Activity bar icon: monochrome cat head (VS Code recolors it).
fs.writeFileSync(path.join(media, 'cat.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000" fill-rule="evenodd" ' +
  'd="M4 3L9 7Q12 6.5 15 7L20 3L20.6 12Q20.6 20 12 20Q3.4 20 3.4 12Z' +
  'M9 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0Z' +
  'M15 12m-1.5 0a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0Z' +
  'M10.8 15.2H13.2L12 16.6Z"/></svg>\n');

// Marketplace icon: Mochi's face over a watermelon-slice backdrop.
const icon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a5f"/><stop offset="1" stop-color="#e8202f"/></linearGradient></defs>' +
  '<rect width="256" height="256" rx="56" fill="#143325"/>' +
  '<circle cx="128" cy="128" r="104" fill="#3fb866"/><circle cx="128" cy="128" r="92" fill="#eaf6c6"/><circle cx="128" cy="128" r="82" fill="url(#g)"/>' +
  '<g fill="#3a1220"><ellipse cx="58" cy="168" rx="5" ry="8" transform="rotate(-25 58 168)"/><ellipse cx="198" cy="168" rx="5" ry="8" transform="rotate(25 198 168)"/><ellipse cx="128" cy="204" rx="5" ry="8"/></g>' +
  `<svg x="44" y="48" width="168" height="150" viewBox="22 6 96 86">${inner(catFaceSVG(CATS.mochi))}</svg>` +
  '</svg>';
fs.writeFileSync(path.join(media, 'icon.png'), png(icon, 256));

// Preview sheet for the README.
const cats = CAT_IDS.map((id, i) =>
  `<svg x="${30 + i * 190}" y="30" width="170" height="195" viewBox="0 0 140 160">${inner(catSVG(CATS[id]))}</svg>`).join('');
const decos = ['slice', 'sliceFace', 'melon', 'paw'].map((k, i) =>
  `<svg x="${40 + i * 90}" y="250" width="60" height="42" viewBox="${k === 'melon' || k === 'paw' ? '0 0 24 24' : '0 0 32 20'}">${inner(decoSVG(k))}</svg>`).join('');
const faces = CAT_IDS.map((id, i) =>
  `<svg x="${440 + i * 56}" y="246" width="48" height="44" viewBox="22 6 96 86">${inner(catFaceSVG(CATS[id]))}</svg>`).join('');
const sheet =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 320"><rect width="620" height="320" rx="20" fill="#13201a"/>' +
  cats + decos + faces + '</svg>';
fs.writeFileSync(path.join(media, 'preview.png'), png(sheet, 1240));
console.log('assets built');
