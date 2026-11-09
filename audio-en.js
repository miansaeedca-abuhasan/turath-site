/* English recorded audio: one hadith at a time (with read-along highlight) and a whole chapter (no highlight).
   Data: audio/en/idx.js (which books/hadith have audio), audio/en/w<book>.js (word times per hadith).
   Hadith audio is streamed from the audio host (idx.hbase + number + .mp3); chapter-title audio is in audio/en/ch/<book>/NN.mp3 */
(function () {
  'use strict';
  var IDX = null, W = {}, WP = {}, IP = null;
  var A = new Audio(); A.preload = 'none';
  var Q = [], qi = -1, mode = '', bar = null, ra = null, raNum = 0, raLg = 'en', raf = 0;
  var UI = function () { try { return localStorage.ui || 'ur'; } catch (e) { return 'ur'; } };
  var L = {
    ur: {hd: 'انگریزی آڈیو', ch: 'پورا باب سنیں (انگریزی)', stop: 'بند کریں', nx: 'اگلی', pv: 'پچھلی', title: 'باب کا عنوان', had: 'حدیث', min: 'منٹ'},
    en: {hd: 'English audio', ch: 'Play the whole chapter (English)', stop: 'Stop', nx: 'Next', pv: 'Previous', title: 'Chapter title', had: 'Hadith', min: 'min'},
    bn: {hd: 'অডিও', ch: 'পুরো অধ্যায় শুনুন', stop: 'বন্ধ করুন', nx: 'পরবর্তী', pv: 'আগের', title: 'অধ্যায়ের শিরোনাম', had: 'হাদীস', min: 'মিনিট'}
  };
  var T = function (k) { return (L[UI()] || L.en)[k]; };
  var DG = function (n) { return UI() === 'ur' ? String(n).replace(/\d/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'[d]; }) : String(n); };
  function load(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = cb; s.onerror = function () { cb(); }; document.head.append(s); }
  function idx() {
    return IP || (IP = new Promise(function (ok) {
      window.ENAUD_IDX = function (x) { IDX = x; };
      load('audio/en/idx.js', function () { IDX = IDX || {books: {}}; ok(IDX); });
    }));
  }
  /* audio language: Bengali when the app is in Bengali and that book has Bengali audio, otherwise English */
  function cfg(lg) { return lg === 'bn' ? IDX.bn : IDX; }
  function inBook(lg, num) {
    var c = IDX && cfg(lg); if (!c || !c.books) return null;
    if (IDX.skip && IDX.skip.indexOf(num) >= 0) return null;
    for (var k in c.books) { var b = c.books[k]; if (num >= b.from && num <= b.to) return k; }
    return null;
  }
  function pick(num) {
    if (!IDX) return null;
    if (UI() === 'bn') { var kb = inBook('bn', num); if (kb) return {lg: 'bn', book: kb}; }
    var ke = inBook('en', num); return ke ? {lg: 'en', book: ke} : null;
  }
  function words(lg, book) {
    var key = lg + book;
    if (WP[key]) return WP[key];
    return WP[key] = new Promise(function (ok) {
      window.ENAUD_W = function (x) { for (var n in x) W[lg + ':' + n] = x[n]; };
      var b = IDX && cfg(lg).books[book];
      if (!b || !b.w) return ok();
      load('audio/' + lg + '/w' + book + '.js', ok);
    });
  }
  function chLang(book, ord) {
    var b = IDX && IDX.bn && IDX.bn.books && IDX.bn.books[String(book)];
    return UI() === 'bn' && b && b.c && b.c[ord] ? 'bn' : 'en';
  }
  var has = function (num) { return !!pick(num); };
  var hurl = function (lg, num) { return cfg(lg).hbase + num + '.mp3'; };
  var fmt = function (s) { s = Math.round(s || 0); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); };

  function css() {
    if (document.getElementById('enaud-css')) return;
    var s = document.createElement('style'); s.id = 'enaud-css';
    s.textContent =
      '.enbar{position:fixed;inset-inline:0;bottom:0;z-index:60;display:flex;align-items:center;gap:.5rem;padding:.55rem .8rem calc(.55rem + env(safe-area-inset-bottom));background:#0f3d33;color:#fff;box-shadow:0 -4px 18px rgba(0,0,0,.25);direction:ltr;font-family:var(--sans,system-ui)}' +
      '.enbar b{flex:1;min-width:0;font-weight:600;font-size:.95rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
      '.enbar small{opacity:.8;font-size:.8rem;min-width:5.5em;text-align:end}' +
      '.enbar button{background:rgba(255,255,255,.14);color:#fff;border:0;border-radius:2rem;min-width:2.4rem;height:2.4rem;font-size:1rem;cursor:pointer}' +
      '.enbar button.go{background:#c9a24a;color:#10281f}' +
      '.enbar i{position:absolute;left:0;top:0;height:3px;background:#c9a24a;width:0}' +
      '.enra{margin:.5rem 0;padding:.7rem .9rem;border:1px solid var(--line,#ddd);border-inline-start:4px solid #c9a24a;border-radius:.7rem;background:var(--card,#fff);direction:ltr;text-align:left;font-family:var(--sans,system-ui);font-size:1.08rem;line-height:2}' +
      '.enra span{cursor:pointer;padding:.05rem .1rem;border-radius:.3rem;transition:background .12s}' +
      '.enra span.on{background:#c9a24a;color:#10281f}.enra span.done{opacity:.55}' +
      '.cardnow{outline:2px solid #c9a24a;outline-offset:2px;border-radius:.7rem}' +
      'body.enbar-on{padding-bottom:4.2rem}';
    document.head.append(s);
  }
  function stopAll() {
    A.pause(); A.removeAttribute('src'); try { A.load(); } catch (e) {}
    cancelAnimationFrame(raf); Q = []; qi = -1; mode = '';
    if (bar) { bar.remove(); bar = null; document.body.classList.remove('enbar-on'); }
    if (ra) { ra.remove(); ra = null; raNum = 0; }
    document.querySelectorAll('.cardnow').forEach(function (n) { n.classList.remove('cardnow'); });
  }
  function mkBar() {
    css();
    if (bar) return bar;
    bar = document.createElement('div'); bar.className = 'enbar';
    bar.innerHTML = '<i></i><button class="pv" type="button">⏮</button><button class="go" type="button">⏸</button><button class="nx" type="button">⏭</button><b></b><small></small><button class="x" type="button">✕</button>';
    var q = function (c) { return bar.querySelector(c); };
    q('.go').onclick = function () { if (A.paused) A.play(); else A.pause(); };
    q('.x').onclick = stopAll; q('.x').title = T('stop');
    q('.nx').onclick = function () { step(1); }; q('.nx').title = T('nx');
    q('.pv').onclick = function () { step(-1); }; q('.pv').title = T('pv');
    q('.pv').hidden = q('.nx').hidden = (mode === 'one');
    var nv = document.getElementById('bnav'), nh = nv && nv.offsetParent && nv.getBoundingClientRect().width > 200 ? nv.offsetHeight : 0;
    bar.style.bottom = nh + 'px'; bar.style.paddingBottom = nh ? '.55rem' : '';
    document.body.append(bar); document.body.classList.add('enbar-on');
    return bar;
  }
  function paintBar() {
    if (!bar) return;
    var it = Q[qi]; if (!it) return;
    bar.querySelector('b').textContent = it.label;
    bar.querySelector('.go').textContent = A.paused ? '▶' : '⏸';
    bar.querySelector('small').textContent = fmt(A.currentTime) + ' / ' + fmt(A.duration);
    bar.querySelector('i').style.width = (A.duration ? 100 * A.currentTime / A.duration : 0) + '%';
  }
  function tick() {
    paintBar();
    if (ra && raNum) {
      var ws = W[raLg + ':' + raNum] || [], t = A.currentTime, on = -1;
      for (var i = 0; i < ws.length; i++) { if (t >= ws[i][1]) on = i; else break; }
      var sp = ra.children;
      for (var j = 0; j < sp.length; j++) { var c = j === on ? 'on' : j < on ? 'done' : ''; if (sp[j].className !== c) sp[j].className = c; }
    }
    if (!A.paused) raf = requestAnimationFrame(tick);
  }
  function node(num) { return document.querySelector('[data-n="' + num + '"]') || null; }
  function play(i) {
    qi = i; var it = Q[i]; if (!it) { stopAll(); return; }
    mkBar(); A.src = it.url; A.playbackRate = 1;
    document.querySelectorAll('.cardnow').forEach(function (n) { n.classList.remove('cardnow'); });
    if (it.num && mode === 'chapter') { var n = node(it.num); if (n) { n.classList.add('cardnow'); try { n.scrollIntoView({block: 'center', behavior: 'smooth'}); } catch (e) {} } }
    A.play().catch(function () { paintBar(); });
    paintBar();
  }
  function step(d) { var n = qi + d; if (n < 0 || n >= Q.length) { if (d > 0) stopAll(); return; } play(n); }
  A.addEventListener('play', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); paintBar(); });
  A.addEventListener('pause', function () { paintBar(); });
  A.addEventListener('ended', function () { if (mode === 'chapter') step(1); else { paintBar(); } });
  A.addEventListener('loadedmetadata', paintBar);
  A.addEventListener('error', function () { if (mode === 'chapter' && qi < Q.length - 1) step(1); else if (bar) bar.querySelector('b').textContent = '⚠ ' + (Q[qi] ? Q[qi].label : ''); });

  function showRA(anchor, num, lg) {
    if (ra) ra.remove();
    ra = document.createElement('div'); ra.className = 'enra'; raNum = num; raLg = lg;
    var ws = W[lg + ':' + num] || [];
    ws.forEach(function (w, i) {
      var s = document.createElement('span'); s.textContent = w[0]; s.onclick = function () { A.currentTime = w[1]; A.play(); };
      ra.append(s, ' ');
    });
    if (!ws.length) { ra.remove(); ra = null; raNum = 0; return; }
    anchor.append(ra);
  }

  window.ENAUD = {
    ready: idx,
    has: has,
    /* one hadith with read-along; card = the .card element */
    hadith: async function (num, card) {
      await idx(); var pk = pick(num); if (!pk) return;
      if (mode === 'one' && Q[0] && Q[0].num === num && !A.paused) { stopAll(); return; }
      stopAll(); await words(pk.lg, pk.book); mode = 'one';
      Q = [{url: hurl(pk.lg, num), label: T('had') + ' ' + DG(num), num: num}];
      play(0); if (card) showRA(card, num, pk.lg);
    },
    /* a whole chapter: title audio, then every hadith that has audio, in order */
    chapter: async function (book, ord, nums) {
      await idx(); var lg = chLang(book, ord), c = cfg(lg), b = c.books[book]; stopAll(); mode = 'chapter'; Q = [];
      if (b && b.c && b.c[ord]) Q.push({url: c.cbase + book + '/' + ('0' + ord).slice(-2) + '.mp3', label: T('title')});
      nums.forEach(function (n) { var pk = pick(n); if (pk) Q.push({url: hurl(pk.lg, n), label: T('had') + ' ' + DG(n), num: n}); });
      if (Q.length) play(0);
    },
    chapterInfo: async function (book, ord, nums) {
      await idx(); var b = (cfg(chLang(book, ord)).books || {})[String(book)]; if (!b || !b.c || !b.c[ord]) return null;
      var sec = b.c[ord], k = 0; nums.forEach(function (n) { var s = b.h && b.h[n]; if (s) { sec += s; k++; } });
      return {minutes: Math.max(1, Math.round(sec / 60)), count: k};
    },
    btn: function (d, card) {
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'ab'; bt.title = T('hd'); bt.setAttribute('aria-label', T('hd'));
      bt.textContent = '🔊'; bt.style.fontSize = '1.05rem';
      bt.hidden = true; idx().then(function () { bt.hidden = !has(d.num); });
      bt.addEventListener('click', function () { window.ENAUD.hadith(d.num, card && card()); });
      return bt;
    },
    chapterBtn: async function (book, ord, nums) {
      await idx(); var info = await window.ENAUD.chapterInfo(book, ord, nums); if (!info) return null;
      var bt = document.createElement('button'); bt.type = 'button'; bt.className = 'btn lbtn';
      bt.textContent = '🔊 ' + T('ch') + ' — ' + DG(info.minutes) + ' ' + T('min');
      bt.addEventListener('click', function () { window.ENAUD.chapter(String(book), ord, nums); });
      return bt;
    },
    stop: stopAll
  };
  idx();
})();
