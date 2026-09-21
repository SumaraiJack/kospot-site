/* assets/js/kospot.js — the only JavaScript on this site.
 *
 * It does exactly one thing: tells a card where the pointer is, so the CSS
 * spotlight in kospot.css can follow it. Everything else on the page —
 * reveals, parallax, the progress bar, the nav condensing, page transitions —
 * is native CSS with no JS involved at all.
 *
 * The page is COMPLETE WITHOUT THIS FILE. If it fails to load, or scripting is
 * off, or the browser is old, nothing breaks: --mx/--my simply keep their CSS
 * fallbacks and the cards still lift on hover.
 *
 * Deliberately skipped on touch devices and for anyone who asked for reduced
 * motion. A spotlight that chases a finger is pointless, and pointermove is
 * the most expensive event on the page to listen to.
 */
(function () {
  'use strict';

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!fine.matches || calm.matches) return;

  var cards = document.querySelectorAll('.card, .quote');
  if (!cards.length) return;

  // One rAF in flight at a time. pointermove can fire well over a hundred
  // times a second; writing a custom property on every one of those forces
  // style recalculation far more often than the screen can show it.
  var queued = false;
  var pending = null;

  function flush() {
    queued = false;
    if (!pending) return;
    pending.el.style.setProperty('--mx', pending.x + '%');
    pending.el.style.setProperty('--my', pending.y + '%');
    pending = null;
  }

  function track(event) {
    var el = event.currentTarget;
    var box = el.getBoundingClientRect();
    if (!box.width || !box.height) return;

    pending = {
      el: el,
      x: Math.round(((event.clientX - box.left) / box.width) * 100),
      y: Math.round(((event.clientY - box.top) / box.height) * 100)
    };

    if (!queued) {
      queued = true;
      requestAnimationFrame(flush);
    }
  }

  // Recentre on the way out, so a card that is hovered again from the other
  // side does not start with the highlight stuck where the pointer last left.
  function reset(event) {
    var el = event.currentTarget;
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    if (pending && pending.el === el) pending = null;
  }

  for (var i = 0; i < cards.length; i++) {
    cards[i].addEventListener('pointermove', track, { passive: true });
    cards[i].addEventListener('pointerleave', reset, { passive: true });
  }
})();
