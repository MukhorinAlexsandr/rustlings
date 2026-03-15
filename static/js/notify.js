// notify.js — уведомления и конфетти
let notifTimer = null;

export function notify(icon, text) {
  const el = document.getElementById('notification');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent = text;
  el.classList.add('show');
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

export function fireConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.getElementById('confetti-container');
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#f97316', '#fb923c', '#fbbf24', '#4ade80', '#60a5fa'];
  const count = 50;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const startX = Math.random() * 100;
    const drift = (Math.random() - 0.5) * 100;
    p.style.cssText = `
      left: ${startX}%;
      animation-delay: ${Math.random() * 0.4}s;
      animation-duration: ${2 + Math.random() * 1}s;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --drift: ${drift}px;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 3500);
  }
}
