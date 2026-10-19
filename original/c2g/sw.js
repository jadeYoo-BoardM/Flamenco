// Offline cache for CRADLE 2 GRAVE. The version changes whenever index.html changes.
const CACHE="c2g-d136dd499f";
const FILES=["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512.png"];
const FONT_CACHE="c2g-fonts-v1";
const FONT_CSS=["https://fonts.googleapis.com/css2?family=Jua&family=IBM+Plex+Sans+KR:wght@400;500;700&display=swap"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith("c2g-")&&k!==CACHE&&k!==FONT_CACHE)await caches.delete(k);await self.clients.claim();cacheFonts()})())});
async function cacheFonts(){try{const c=await caches.open(FONT_CACHE);for(const u of FONT_CSS){let r=await c.match(u);if(!r){r=await fetch(u,{mode:"cors"});if(!r.ok)continue;await c.put(u,r.clone())}const css=await r.text();for(const m of css.matchAll(/url\((https:[^)]+)\)/g)){if(await c.match(m[1]))continue;try{const f=await fetch(m[1],{mode:"cors"});if(f.ok)await c.put(m[1],f)}catch(_){}}}}catch(_){}}
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const u=new URL(req.url);
 if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){e.respondWith(caches.open(FONT_CACHE).then(async c=>{const h=await c.match(req.url);if(h)return h;try{const r=await fetch(req.url,{mode:"cors"});if(r.ok)c.put(req.url,r.clone());return r}catch(_){return new Response("",{status:504})}}));return}
 if(u.origin!==location.origin)return;
 e.respondWith((async()=>{const c=await caches.open(CACHE);
  // network first so an updated game shows up as soon as you're online; cache when offline
  try{const r=await fetch(req);if(r.ok&&FILES.some(f=>u.pathname.endsWith(f.replace("./",""))))c.put(req,r.clone());return r}
  catch(_){return (await c.match(req,{ignoreSearch:true}))||(await c.match("./"))||new Response("Offline",{status:503})}})())});
