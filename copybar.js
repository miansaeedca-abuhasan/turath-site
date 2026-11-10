/* Same rule as the main site: the browser's own copy (right-click, long-press, Ctrl+C) is closed; selected text is copied only from this small bar. Typing fields keep their normal menu. */
(function(){
  function typing(t){return !!(t&&t.closest&&t.closest('input,textarea,select,[contenteditable="true"]'))}
  ['contextmenu','copy','cut','dragstart'].forEach(function(n){document.addEventListener(n,function(e){var t=e.target&&e.target.nodeType===3?e.target.parentElement:e.target;if(!typing(t))e.preventDefault()},true)});
  var ui='ur';try{ui=localStorage.ui||'ur'}catch(e){}
  var L={ur:['کاپی','کاپی ہو گیا'],ar:['نسخ','تم النسخ'],en:['Copy','Copied']}[ui]||['Copy','Copied'];
  var st=document.createElement('style');st.textContent='.cpbar{position:fixed;z-index:9999;padding:.35rem .9rem;border-radius:999px;background:#fff;color:#1f3d2f;border:1px solid #cfd6cc;box-shadow:0 4px 18px rgba(0,0,0,.22);font:600 14px system-ui,sans-serif;cursor:pointer}.cpbar[hidden]{display:none}';document.head.append(st);
  var bar=document.createElement('button');bar.type='button';bar.className='cpbar';bar.hidden=true;bar.textContent=L[0];document.body.append(bar);
  var cur='';
  function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t).then(function(){return true},function(){return false});var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return Promise.resolve(ok)}
  function show(){var s=getSelection();if(!s||s.isCollapsed||!s.rangeCount){bar.hidden=true;return}var a=s.anchorNode&&(s.anchorNode.nodeType===3?s.anchorNode.parentElement:s.anchorNode);if(typing(a)){bar.hidden=true;return}var t=String(s).trim();if(t.length<2){bar.hidden=true;return}cur=t;bar.textContent=L[0];bar.hidden=false;var r=s.getRangeAt(0).getBoundingClientRect(),w=bar.offsetWidth||70,h=bar.offsetHeight||34;var top=r.top-h-10;if(top<8)top=Math.min(r.bottom+16,innerHeight-h-8);bar.style.top=top+'px';bar.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2))+'px'}
  var tm;document.addEventListener('selectionchange',function(){clearTimeout(tm);tm=setTimeout(show,180)});
  bar.addEventListener('mousedown',function(e){e.preventDefault()});
  bar.addEventListener('click',function(){copy(cur).then(function(ok){bar.textContent=ok?L[1]:'—';setTimeout(function(){bar.hidden=true;try{getSelection().removeAllRanges()}catch(e){}},700)})});
})();
