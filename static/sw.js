/* RustLings Service Worker — кэширование для офлайн-режима */
const CACHE_NAME = 'rustlings-v5';

const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/js/main.js',
  '/js/data.js',
  '/js/state.js',
  '/js/utils.js',
  '/icons.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/data/textbook.json',
  '/data/textbook-parts.json',
  '/data/part-quizzes.json',
  '/data/lesson-parts.json',
  '/data/lessons.json',
  '/data/first-projects.json',
  '/data/daily-quests.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/') || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(
        (response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        },
        () => caches.match(request).then((c) => c || caches.match('/index.html'))
      );
    })
  );
});
