const C='turath-202610301502';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest','icon-192.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!=='turath-daily'&&k!=='turath-off').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
const page=e.request.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname)||/\/coll\/index\.js$|\/quran\/tafsir\/index\.js$|\/daily\.js$|\/ticker\.json$|\/offline\.json$/.test(u.pathname);
if(page){e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));return;}
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(e.request,cp));}return res;})));});

// daily notifications: the app writes what to show into the 'turath-daily' cache; shown on Periodic Background Sync (or a test from the app)
const DQ='turath-daily';
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
async function dailyNotify(force){const c=await caches.open(DQ),r=await c.match('queue');if(!r)return;const q=await r.json(),now=new Date(),h=now.getHours();
const day=q[dk(now)];if(!day)return;const hh=h+now.getMinutes()/60,w=day.w,inW=r=>r&&hh>=r[0]&&hh<r[1];
const slot=force?(w?(inW(w.m)?'m':'e'):(h>=3&&h<14?'m':'e')):(w?(inW([w.m[0]+0.25,w.m[1]])?'m':inW([w.e[0]+0.25,w.e[1]])?'e':null):(h>=4&&h<13?'m':h>=15&&h<23?'e':null));if(!slot)return;
const sr=await c.match('shown'),shown=sr?await sr.json():{},key=dk(now)+slot;if(!force&&shown[key])return;
for(const it of day[slot]||[])await self.registration.showNotification(it.title,{body:it.body,tag:it.tag,icon:'icon-192.png',badge:'icon-192.png',dir:it.dir,lang:it.lang,data:{url:it.url}});
shown[key]=1;await c.put('shown',new Response(JSON.stringify(shown)));}
self.addEventListener('periodicsync',e=>{if(e.tag===DQ)e.waitUntil(dailyNotify(false));});
self.addEventListener('message',e=>{if(e.data==='daily-test')e.waitUntil(dailyNotify(true));});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=new URL('./'+((e.notification.data&&e.notification.data.url)||''),self.registration.scope).href;
e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{for(const w of ws){if('navigate' in w){return w.navigate(u).then(x=>(x||w).focus());}}return clients.openWindow(u);}));});
