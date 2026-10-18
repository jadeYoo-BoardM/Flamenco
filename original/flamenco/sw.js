// 오프라인 실행용 서비스워커 — 한 번 온라인에서 열면 이후 비행기 모드에서도 실행됩니다.
// 게임 파일을 수정해서 다시 올렸다면 아래 버전 숫자를 올리면 확실히 갱신됩니다.
const CACHE = 'flamenco-v1';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', ...["./assets/back.webp", "./assets/box.webp", "./assets/castanets_1_0.webp", "./assets/castanets_1_1.webp", "./assets/castanets_2_2.webp", "./assets/castanets_2_3.webp", "./assets/castanets_3_4.webp", "./assets/castanets_3_5.webp", "./assets/castanets_4_6.webp", "./assets/castanets_5_7.webp", "./assets/castanets_6_8.webp", "./assets/castanets_7_9.webp", "./assets/comb_1_0.webp", "./assets/comb_1_1.webp", "./assets/comb_2_2.webp", "./assets/comb_2_3.webp", "./assets/comb_3_4.webp", "./assets/comb_3_5.webp", "./assets/comb_4_6.webp", "./assets/comb_5_7.webp", "./assets/comb_6_8.webp", "./assets/comb_7_9.webp", "./assets/fan_1_0.webp", "./assets/fan_1_1.webp", "./assets/fan_2_2.webp", "./assets/fan_2_3.webp", "./assets/fan_3_4.webp", "./assets/fan_3_5.webp", "./assets/fan_4_6.webp", "./assets/fan_5_7.webp", "./assets/fan_6_8.webp", "./assets/fan_7_9.webp", "./assets/guitar_1_0.webp", "./assets/guitar_1_1.webp", "./assets/guitar_2_2.webp", "./assets/guitar_2_3.webp", "./assets/guitar_3_4.webp", "./assets/guitar_3_5.webp", "./assets/guitar_4_6.webp", "./assets/guitar_5_7.webp", "./assets/guitar_6_8.webp", "./assets/guitar_7_9.webp", "./assets/rose.png", "./assets/rose_1_0.webp", "./assets/rose_1_1.webp", "./assets/rose_2_2.webp", "./assets/rose_2_3.webp", "./assets/rose_3_4.webp", "./assets/rose_3_5.webp", "./assets/rose_4_6.webp", "./assets/rose_5_7.webp", "./assets/rose_6_8.webp", "./assets/rose_7_9.webp", "./assets/tile1.png", "./assets/tile2.png", "./assets/tile3.png"]];
const FONT_CSS = ["https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Black+Han+Sans&family=Gowun+Dodum&display=swap"];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    // 글꼴은 실패해도 설치를 막지 않도록 따로 처리
    for (const cssUrl of FONT_CSS) {
      try {
        const res = await fetch(cssUrl);
        if (!res.ok) continue;
        await cache.put(cssUrl, res.clone());
        const css = await res.text();
        const files = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
        await Promise.all(files.map(async (f) => {
          try { const r = await fetch(f); if (r.ok) await cache.put(f, r); } catch (_) {}
        }));
      } catch (_) {}
    }
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const prefix = CACHE.replace(/-v\d+$/, '-v');
    for (const k of await caches.keys()) if (k.startsWith(prefix) && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && !FONT_HOSTS.includes(url.hostname)) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: sameOrigin });
    const refresh = fetch(req).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(refresh); return hit; }          // 캐시 우선, 뒤에서 조용히 갱신
    const res = await refresh;
    if (res) return res;
    if (req.mode === 'navigate') {
      const fallback = await cache.match('./index.html');
      if (fallback) return fallback;
    }
    return new Response('오프라인 상태입니다.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
