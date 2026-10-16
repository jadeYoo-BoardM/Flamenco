// Flamenco offline cache. Bump VERSION whenever you upload changed files.
const VERSION='flamenco-v1';
const FILES=[
 "./",
 "index.html",
 "manifest.webmanifest",
 "icon-180.png",
 "icon-192.png",
 "icon-512.png",
 "back.webp",
 "box.webp",
 "castanets_1_0.webp",
 "castanets_1_1.webp",
 "castanets_2_2.webp",
 "castanets_2_3.webp",
 "castanets_3_4.webp",
 "castanets_3_5.webp",
 "castanets_4_6.webp",
 "castanets_5_7.webp",
 "castanets_6_8.webp",
 "castanets_7_9.webp",
 "comb_1_0.webp",
 "comb_1_1.webp",
 "comb_2_2.webp",
 "comb_2_3.webp",
 "comb_3_4.webp",
 "comb_3_5.webp",
 "comb_4_6.webp",
 "comb_5_7.webp",
 "comb_6_8.webp",
 "comb_7_9.webp",
 "fan_1_0.webp",
 "fan_1_1.webp",
 "fan_2_2.webp",
 "fan_2_3.webp",
 "fan_3_4.webp",
 "fan_3_5.webp",
 "fan_4_6.webp",
 "fan_5_7.webp",
 "fan_6_8.webp",
 "fan_7_9.webp",
 "guitar_1_0.webp",
 "guitar_1_1.webp",
 "guitar_2_2.webp",
 "guitar_2_3.webp",
 "guitar_3_4.webp",
 "guitar_3_5.webp",
 "guitar_4_6.webp",
 "guitar_5_7.webp",
 "guitar_6_8.webp",
 "guitar_7_9.webp",
 "rose.png",
 "rose_1_0.webp",
 "rose_1_1.webp",
 "rose_2_2.webp",
 "rose_2_3.webp",
 "rose_3_4.webp",
 "rose_3_5.webp",
 "rose_4_6.webp",
 "rose_5_7.webp",
 "rose_6_8.webp",
 "rose_7_9.webp",
 "tile1.png",
 "tile2.png",
 "tile3.png"
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  e.respondWith(caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{
    // keep Google Fonts and anything else fetched once, so it works offline next time
    if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy))}
    return res;
  }).catch(()=>caches.match('index.html'))));
});
