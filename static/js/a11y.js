// a11y.js — доступность: focus trap, Escape, overlay controls
let focusBeforeModal = null;

export function getFocusableIn(el) {
  const sel = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(el.querySelectorAll(sel)).filter((e) => !e.disabled && e.offsetParent !== null);
}

export function trapFocus(e, container) {
  if (e.key !== 'Tab') return;
  const focusable = getFocusableIn(container);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

export function openOverlay(overlayId, focusFirst = true) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  focusBeforeModal = document.activeElement;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  overlay.addEventListener('keydown', (overlay._trapHandler = (e) => trapFocus(e, overlay)));
  if (focusFirst) {
    const focusable = getFocusableIn(overlay);
    if (focusable.length) focusable[0].focus();
  }
}

export function closeOverlay(overlayId) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.removeEventListener('keydown', overlay._trapHandler);
  if (focusBeforeModal && focusBeforeModal.focus) focusBeforeModal.focus();
}
