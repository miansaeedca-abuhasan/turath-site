// YouTube videos of the project. channel: the channel's address (empty = the button is hidden until it is set).
// items: one video per category: k = category key, t = title in each language, u = the video's address.
window.VIDEOS = {
  channel: '',
  items: [
    {k: 'intro', t: {ur: 'مختصر تعارف', ar: 'تعريف موجز', en: 'Short introduction', bn: 'সংক্ষিপ্ত পরিচিতি', hi: 'संक्षिप्त परिचय', gu: 'ટૂંકો પરિચય', fr: 'Brève présentation'}, u: 'https://youtu.be/s2rYvrofrUo'}
  ],
  // the video of one category (null when there is none yet)
  for(k) { return this.items.find(i => i.k === k) || null; },
  label(ui) { return {ur: 'ویڈیوز', ar: 'فيديوهات', en: 'Videos', bn: 'ভিডিও', hi: 'वीडियो', gu: 'વિડિઓ', fr: 'Vidéos'}[ui] || 'Videos'; },
  open(ui) {
    const chan = {ur: 'یوٹیوب چینل', ar: 'قناة يوتيوب', en: 'YouTube channel', bn: 'ইউটিউব চ্যানেল', hi: 'यूट्यूब चैनल', gu: 'યુટ્યુબ ચેનલ', fr: 'Chaîne YouTube'}[ui] || 'YouTube channel';
    const a = (u, t) => el('a', {class: 'btn lbtn', href: u, target: '_blank', rel: 'noopener', style: 'display:block;margin:.4rem 0;text-align:start'}, '▶ ' + t);
    const rows = this.items.map(i => a(i.u, i.t[ui] || i.t.en));
    if (this.channel) rows.push(a(this.channel, chan));
    window.sheet(this.label(ui), rows, [[{ur: 'بند کریں', ar: 'إغلاق', en: 'Close', bn: 'বন্ধ', hi: 'बंद', gu: 'બંધ', fr: 'Fermer'}[ui] || 'Close', null]]);
  }
};

// a small «watch the video» button at the top of a category page, when that category has a video
(function () {
  const KEY = h => /^#\/q\/tafsir/.test(h) ? 'tafsir' : /^#\/q\/audio/.test(h) ? 'audio' : /^#\/q(\/|$)/.test(h) ? 'quran' : /^#\/s\/seerah/.test(h) ? 'seerah' : /^#\/s\/fazail/.test(h) ? 'fazail' : /^#\/s\/siyar/.test(h) ? 'siyar'
    : /^#\/s\/shadharat/.test(h) ? 'shadharat' : /^#\/s\/rijal/.test(h) ? 'rijal' : /^#\/hb/.test(h) ? 'hadithbooks' : /^#\/(nar|n\/)/.test(h) ? 'narrators' : /^#\/hifz/.test(h) ? 'hifz' : /^#\/quiz/.test(h) ? 'quiz' : /^#\/verify/.test(h) ? 'verify' : /^#\/tarbiyat/.test(h) ? 'tarbiyat' : /^#\/(b|k|c|h)(\/|$)/.test(h) ? 'hadith' : '';
  const put = () => {
    document.querySelectorAll('.vidchip').forEach(n => n.remove());
    const k = KEY(location.hash), v = k && window.VIDEOS && VIDEOS.for(k); if (!v || !window.el) return;
    const host = [document.getElementById('qv'), document.getElementById('view'), document.getElementById('list')].find(x => x && !x.hidden && x.offsetParent !== null); if (!host) return;
    const ui = document.documentElement.lang || 'ur';
    host.prepend(el('a', {class: 'btn lbtn vidchip', href: v.u, target: '_blank', rel: 'noopener', style: 'display:inline-block;margin:.3rem 0'}, '▶ ' + (v.t[ui] || v.t.en)));
  };
  addEventListener('hashchange', () => { setTimeout(put, 400); setTimeout(put, 1500); });
  addEventListener('load', () => setTimeout(put, 1500));
})();
