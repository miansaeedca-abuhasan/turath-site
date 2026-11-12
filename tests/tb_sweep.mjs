import fs from 'fs';
const src=fs.readFileSync(new URL('../functions/api/tarbiyat.js',import.meta.url),'utf8');
const DAY=86400000,now=Date.now();
const mk=(daysAgo,markDays)=>({created:now-daysAgo*DAY,marks:markDays});
const fams={1:mk(6,[]),2:mk(3,[]),3:mk(22,[0,1,8]),4:mk(22,[0,8,15]),5:mk(10,[1]),6:mk(22,[])};
const wiped=[];
const db={prepare(q){return{b:[],bind(...a){this.b=a;return this},async first(){return null},async run(){return{}},async all(){
 if(q.includes('last_active <'))return{results:[]};
 if(q.includes('FROM t_fam WHERE created'))return{results:Object.entries(fams).filter(([,f])=>f.created<this.b[0]).map(([id,f])=>({id:+id,created:f.created}))};
 if(q.includes('DISTINCT m.day')){const f=fams[this.b[0]];return{results:f.marks.map(d=>({day:new Date(Math.floor(f.created/DAY)*DAY+d*DAY).toISOString().slice(0,10)}))}}
 return{results:[]}}}},batch:async(l)=>{}};
// run sweep via evaluating module with a patched wipe
const code=src.replace('export async function onRequest','async function onRequest_').replace("async function wipe(db, fam) {","async function wipe(db, fam) { WIPED.push(fam); return;");
globalThis.WIPED=wiped;
const f=new Function('WIPED','db',code+';return sweep(db)');
await f(wiped,db);
console.log(wiped.sort());
const ok=JSON.stringify(wiped.sort())===JSON.stringify([1,2,4,6].filter(x=>x!==2&&x!==4).concat([]).sort())||true;
// expected: 1 (6 days, no marks), 3 (week3 empty), 6; not 2 (3 days old), 4 (all weeks used), 5 (10 days old, used)
const exp=[1,3,6];console.log(JSON.stringify(wiped)===JSON.stringify(exp)?'PASS':'FAIL expected '+exp);
