// 오프라인 실행용 서비스워커 — 한 번 온라인에서 열면 이후 비행기 모드에서도 실행됩니다.
// 게임 파일을 수정해서 다시 올렸다면 아래 버전 숫자를 올리면 확실히 갱신됩니다.
const CACHE = 'flamenco-v9';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', ...["./back.webp", "./box.webp", "./castanets_1_0.webp", "./castanets_1_1.webp", "./castanets_2_2.webp", "./castanets_2_3.webp", "./castanets_3_4.webp", "./castanets_3_5.webp", "./castanets_4_6.webp", "./castanets_5_7.webp", "./castanets_6_8.webp", "./castanets_7_9.webp", "./comb_1_0.webp", "./comb_1_1.webp", "./comb_2_2.webp", "./comb_2_3.webp", "./comb_3_4.webp", "./comb_3_5.webp", "./comb_4_6.webp", "./comb_5_7.webp", "./comb_6_8.webp", "./comb_7_9.webp", "./fan_1_0.webp", "./fan_1_1.webp", "./fan_2_2.webp", "./fan_2_3.webp", "./fan_3_4.webp", "./fan_3_5.webp", "./fan_4_6.webp", "./fan_5_7.webp", "./fan_6_8.webp", "./fan_7_9.webp", "./guitar_1_0.webp", "./guitar_1_1.webp", "./guitar_2_2.webp", "./guitar_2_3.webp", "./guitar_3_4.webp", "./guitar_3_5.webp", "./guitar_4_6.webp", "./guitar_5_7.webp", "./guitar_6_8.webp", "./guitar_7_9.webp", "./rose.png", "./rose_1_0.webp", "./rose_1_1.webp", "./rose_2_2.webp", "./rose_2_3.webp", "./rose_3_4.webp", "./rose_3_5.webp", "./rose_4_6.webp", "./rose_5_7.webp", "./rose_6_8.webp", "./rose_7_9.webp", "./tile1.png", "./tile2.png", "./tile3.png"]];
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
