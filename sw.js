const CACHE='cs-classroom-v16';
const CORE=['./','./index.html','./teacher.html','./board.html','./studio.js','./studio.css','./references.js','./references.css','./charts.js','./charts.css','./offline.js','./assets/computer.jpg','./assets/history.jpg','./assets/writer.png','./assets/presentation.png','./assets/spreadsheet.png','./assets/web.jpg','./assets/logic.svg','./assets/network.jpg','./assets/programming.png','./assets/ml.svg','./assets/abacus.jpg','./assets/pascaline.jpg','./assets/difference-engine.jpg','./assets/lovelace.jpg','./assets/transistor.jpg','./assets/microprocessor.jpg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;
 const url=new URL(req.url);if(url.origin===self.location.origin){event.respondWith(fetch(req).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res}).catch(()=>caches.match(req)));return}
 if(url.hostname==='commons.wikimedia.org'||url.hostname==='unpkg.com'){event.respondWith(caches.match(req).then(cached=>cached||fetch(req,{mode:'no-cors'}).then(response=>{caches.open(CACHE).then(cache=>cache.put(req,response.clone()));return response})));}
});
