'use strict';
// Short, friendly lines each cat says on hover, on click, and when you save.

const LINES = {
  mochi: [
    'Purr-fect code! Have a slice.',
    'That function is the cat\'s pajamas.',
    'Seeds of greatness, planted right here.',
    'You\'re one in a melon!',
    'Meow-gnificent commit energy.',
    'Refactor if you like. I believe in you. Also, snacks.',
    'Zero bugs, maximum zoomies.',
    'Rind and shine, developer!',
  ],
  salem: [
    'I knocked a bug off the table. You\'re welcome.',
    'Suspiciously good code. I approve.',
    'Spit the seeds, ship the build.',
    'Nine lives, zero merge conflicts.',
    'I am sitting on your keyboard. Ship it.',
    'This line has strong "cat on a warm laptop" energy.',
    'Compile first, nap later.',
    'Sharp claws, sharper logic.',
  ],
  pudding: [
    'So proud of you! Mew!',
    'Sweet as a melon, clean as a whisker.',
    'Tiny paws, big commits.',
    'You\'ve got this. Snack break soon!',
    'Whisker-clean code!',
    'Pawsitively brilliant.',
    'Drink some water, then eat some melon.',
    'Rest your eyes. I\'ll watch the cursor.',
  ],
};

const SAVE_LINES = {
  mochi: ['Saved! Time for a slice.', 'Purr-fect save!', 'Saved. Melon break?'],
  salem: ['Saved. I\'m mildly impressed.', 'Saved. Nap time.', 'Saved. Nothing exploded. Yet.'],
  pudding: ['Saved! Good job!', 'Saved, and so cute.', 'Saved. Mew mew!'],
};

function pick(list, n) { return list[Math.abs(n | 0) % list.length]; }
function lineFor(catId, n) { return pick(LINES[catId] || LINES.mochi, n); }
function saveLineFor(catId, n) { return pick(SAVE_LINES[catId] || SAVE_LINES.mochi, n); }

module.exports = { LINES, SAVE_LINES, lineFor, saveLineFor };
