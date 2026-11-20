// Tafsir Ibn Kathir (Urdu): every quoted ayah is ﴿…﴾ followed by [سورت: آیت] (never "(…) 17۔ الاسراء :110)"), no raw ASCII digits / stray Quran-font glyph letters inside ﴿ ﴾; surah names in lists are written the Urdu way
const fs=require('fs');let bad=0;const ck=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
let all='';for(let i=1;i<=4;i++)all+=fs.readFileSync(__dirname+'/../quran/tafsir/ur_ibnkathir_'+i+'.js','utf8');
const o=(all.match(/﴿/g)||[]).length,c=(all.match(/﴾/g)||[]).length;
ck(o===c&&o>2900,'balanced ayah brackets '+o+'/'+c);
ck(!/\d+۔\s*[^:()\n]{1,30}:\s*\d/.test(all),'no old "17۔ الاسراء :110)" references');
ck((all.match(/﴾ \[[^\]\d:]+: [۰-۹]+(?: تا [۰-۹]+|(?:، [۰-۹]+)+)?\]/g)||[]).length>=2900,'references are [سورت: ۱۱۰] with Urdu digits');
const G=/[ڰښڎڮڏړڲڬڛڌڐڼۻڜڔٻڻڳۂڃڀېڸۋڂڍ۽]/;
let nd=0,ng=0;for(const m of all.matchAll(/﴿([^﴾]*)﴾/g)){if(/[0-9؀]/.test(m[1]))nd++;if(G.test(m[1]))ng++;}
ck(nd===0,'no ASCII digits inside ayahs ('+nd+')');ck(ng===0,'no stray glyph letters inside ayahs ('+ng+')');
ck(/﴿بِسْمِ اللّٰهِ مَجْــرٖ۩ىهَا وَمُرْسٰىهَا﴾ \[ہود: ۴۱\]/.test(all),'Hud 41 sample');
ck(/\[الرعد: ۳۵\]/.test(all)&&/\[المزمل: ۹\]/.test(all)&&/\[یونس: ۲۴\]/.test(all),'three hand-fixed references');
console.log(bad?'FAILED':'PASS ibnkathir_ayah_format');process.exit(bad?1:0);
