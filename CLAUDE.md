# تراث خیرالقرون — Turath Khair Al-Quroon  (project instructions for every Claude session)

Owner / founder: Abu Hasan Mian Saeed (ابو حسن میاں سعید), Malton, Ontario. Free hadith + Quran web app/PWA (fi sabilillah, no ads, no fees ever).
Live at turathkhairalquroon.com (Cloudflare Pages, deployed from GitHub `miansaeedca-abuhasan/turath-site`, branch `main`; every push deploys).
Static site: `index.html` + data files. No build step except the small tools in `tools/`.

READ THIS WHOLE FILE BEFORE TOUCHING ANYTHING. These are the owner's standing instructions; he has repeated many of them many times and is
very angry when they are broken.

## 1. How to talk to him
* Reply in **Urdu**, numbers with **English digits** (1, 2, 3). No English words inside Urdu sentences (words get jumbled for him); put English file/button names on their own line.
* Never say «آئٹم» (say «احادیث» / «عبارتیں»). Respectful wording: اذان «دی جائے گی / سنائی دے گی» (never «بجتی»), قرآن «پڑھا جائے گا».
* Step-by-step instructions: numbered, one step at a time, with ↓ between steps. Text he must paste into a form: each in its own code block with the field name above (forms/Play Console text in English).
* Say plainly when something is **unverified**; never state a guess as a fact. When a figure changes, tell him what was counted before and what is counted now.
* When a printed-book text is doubtful, give him the **printed page number** (he has the physical books/PDFs and will send the page).
* Easier task first, finish it completely. Give complete answers, not partial.

## 2. Working rules (most important)
1. **Change only what he asked.** If you notice another fault, fix it too, but never alter finished/approved things. For any big change **tell him first and wait for his yes**.
2. **Regression guard:** every fix gets a test in `tests/` (node + playwright against `python3 -m http.server 8765`); run the related tests before every push; never break already-correct things. He once said: «ایک چیز درست کرواؤں اور پھر ساری ترتیب خراب» — this is the worst thing you can do.
3. **No guesswork.** Check everything fully against the supplied files/PDF/sources before saying «not found / not in the library». Report empty fields, do not invent.
4. Files he supplied (Word/PDF/EPUB/InPage) are the source: never ask him to send them again; work from what he gave. Work on copies.
5. Commit + push after tests pass. Commit message ends with:
   `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` and `Claude-Session: <session url>`.
6. After editing any `data/*.js`, `jstruct.js`, `coll/index.js`: run `python3 tools/rehash.py` (refreshes `?h=` hashes, `offline.json`, `coll/lite.js`).
7. Do **not** put corrections/تصحیح/feature reports in «اپڈیٹس» (see §6).
8. Phone must be light and fast; nothing heavy fetched needlessly. Check phone AND desktop layouts separately (each its own polished style).

## 3. Content policy (what may be on the site)
Only translations/tafsir by Salafi Ahl-e-Hadith scholars. Nothing by innovators (bid'ati), Shia, Maududi, Israr Ahmed, Tahir-ul-Qadri, Wahiduddin Khan. Reciters: no Mishary Alafasy, no Adel Kalbani; no Yasser Al-Dosari. Reciter lists order: Haram Makkah imams, Haram Madinah imams, then the rest alphabetically. Urdu Quran default translation: Junagarhi. No robotic/phone voice readers. No user city/location shown anywhere; no prayer-reminder or location-permission buttons.

## 4. Adding books — standing instructions (apply to EVERY new book)
**Arranging the text**
* Arrange the supplied text in the site's own structure, **exactly as much content as the text has — nothing added, nothing removed**. Follow the book's own printed order (ask first if it differs from earlier books).
* Translated hadith books: each hadith = number, kitab, bab, Arabic, Urdu translation, hukm, takhrij, fawaid, sharh (follow the book's own order where a field differs). Layout on the site: Arabic → «تحقیق و تخریج» (one heading only) → translation → fawaid; footnote marks clickable both ways.
* Add a **complete volume only**, never a partial one. Page numbers are the printed book's, not the PDF's.
* Honorifics written in full everywhere: رضی اللہ عنہ / صلی اللہ علیہ وسلم / علیہ السلام (علیہا for one woman, علیہما for two; حفظہ اللہ only for a living scholar). **No ﷺ ﷻ ؓ ؒ ؑ symbols, no abbreviations.** «سیدنا / سیدہ» for Companions instead of «حضرت»; for Tabi'in/imams/muhaddithin use «امام» or «محدث».
* **No English letters/words inside Urdu or Arabic text.** Stray Latin letters/symbols (K, G, t, a, S, @ # $ [ ] …) are InPage glyph codes (honorifics or ayah numbers) and must be turned into the real wording/number. Never delete them silently.
* Urdu words must show in the Urdu font (even with shadda/marks); Quran verses inside Urdu text: own paragraph as ﴿vocalized Arabic﴾ then its translation (’’ ‘‘ quotes), other Arabic phrases in « ». Verse numbers inside ﴿…﴾ show as small circles in the verse colour (maroon); never raw «۰۰۱». Copy gives (1) (2).
* References/takhrij: Arabic digits, each book in its own bracket separated by «،», e.g. `بخاري (97)، مسلم (1666)`; several numbers of one book in one bracket `(3551، 5848)`; volume/page `(5/88، 96)`; no «کتاب… باب…» when a hadith number exists; Muslim numbering = Fuad Abdul Baqi. Urdu site text uses Urdu digits (۳۵۵۱) for these references. Fix translation spellings by comparing with the text — never blind single-word replacement.
* Footnotes: small blue circled call-marks, same style in text and in the notes list; notes of a chapter in one bordered box, one running paragraph (Raheeq style); one subject's footnotes together at the end, not per page.
* Translator name goes on the translator tab («ترجمہ: name», normal Urdu font); one tab per translator (+English). A translated book lists after its name only: Arabic + current UI language (+English).
* Quality: check strictly against the supplied PDFs, especially رضی اللہ عنہ / صلی اللہ علیہ وسلم and spellings; one book at a time. Hadith text keeps its punctuation; Arabic hadith text ends with a full stop, no double brackets.
* i'rab: never generate it yourself and never assemble words from different sources; take one complete vocalized hadith from our own books (match via takhrij) and list doubtful matches for him (book + number in red).

**Technical procedure (coll books)** — see `tools/addbook/README.md` and the two example scripts there
1. Rows: `[id, "§title\nparagraph\nparagraph…"]` (title line starts with `§`).
2. Files `coll/<key>_<lang>_<n>_<md5-6>.js` = `COLLDATA("<key>","<lang>",[[id,text],…])`, ~180 KB each.
3. Entry in `coll/index.js` (`COLLS([…])`): `key, ar, ur, en, sub{ur,ar,en}, sections[[id,title,start,end,arabicName]], files{ur:[[start,end,filename]]}, count, intro, pub, prose:true, langs`; put it next to its neighbours in the order (see §5).
4. `offline.json`: group `{"id":"c_<key>","k":"books","n":{ur,en,ar},"f":[[path,hash,path,size]],"b":total}`.
5. Category: `HB_CAT` map in `index.html` (e.g. `tafsirnoor:5`).
6. `python3 tools/rehash.py` → rebuilds `coll/lite.js` and hashes.
7. Tests (`tests/<book>_full.js` pattern: counts, ids sequential, no glued/stray glyphs, first row text). Run neighbours too.
8. «اپڈیٹس» entry (§6); commit; push.
Reminders: skip books already on the site (never replace existing ones with new copies); in every category all books of one author stay together; newly added items carry «نئی / New» badge for **1 month**.

## 5. Book list order (all UI languages — do not let it break again)
al-Jami al-Kamil, Talkhis, then translated books in that language (Bukhari, Muslim, other Sunan in usual order), then Jami sub-books in their Jami order, then other translated books/sharhs; Arabic UI keeps the Arabic order. Books translated into the current UI language come first. Every book must be findable in its proper place (Seerah, Fitan, Fazail as-Sahabah, Sahaba books in the Sahaba folder). Newly added books go at the end. Book names in Urdu UI: Urdu script/Urdu font, no double names, Urdu on the right, Arabic on the left. Tafsir names always show language in brackets (اردو / عربی), Urdu tafsirs first, Urdu and Arabic versions separate entries.
**«ذیلی مترجم کتب» (owner ruling, 19-11-2026)**: on the home of Al-Jami al-Kamil *and* of Talkhis the tile is called «ذیلی مترجم کتب» (not «مترجم کتب»). Its page (`#/hb/a/jami`) lists ONLY books taken from Al-Jami al-Kamil, and only those translated into the reader's UI language (Urdu UI: Urdu-translated ones). It never contains Al-Jami al-Kamil or Talkhis themselves, and never books that are not taken from Al-Jami (e.g. Silsila Sahiha, Darimi, Mu'jam). Test: `tests/silsila_in_translated_folder.js`. Main list «کتب حدیث»: Al-Jami al-Kamil, then Talkhis, then Bukhari and the other translated books of the same language, then Arabic etc.
Tafsir Noor al-Huda (`tafsirnoor`, 15 vols / 30 paras / 8096 rows) is listed in the «تفاسیر» page (Urdu group, first) and opens the prose reader `#/s/tafsirnoor`.

## 6. «اپڈیٹس» (news) rules
Lists ONLY: new books added, new audios/audiobooks, a new section (only when he says). Never reports of corrections, تصحیح, i'rab work, features or small changes; no error caveats.
One card per day (all books added that day in ONE card), one line per book (never several books on a line), 1–3 lines of detail; line = the book's full library name + its sub-title + translator(s) («… ترجمہ و شرح از X - دوسرا ترجمہ از Y»), hadith count in brackets after the name, one author's books together; each line links to the book. No separate news for a later volume of the same book. The «اپڈیٹ آگئی ہے» bar/popup at most once a day.

## 7. Site design rules
* **Hadith number**: plain «12345 -» in red directly before the Arabic text (printed-Jami style, no oval); English digits in Urdu/other UIs, Arabic digits only in the Arabic UI. On Jami sub-books the main number is the Jami number, the book's own number sits above in a small circle; cross-reference pill «الجامع الکامل N». Copy/share: first line Jami number + book number (`12345/2`), Arabic, takhrij ending «الجامع الکامل (12345).», translation; no book-name header, no «2 (2)».
* **Hadith card**: takhrij + translation in one box, «تحقیق و تخریج» as a small coloured label; «ترجمہ :» followed by small pill tabs (one per translator); fawaid/sharh tabs same size; bab title in the header, not inside the translation; bookmark/share/poster/compare buttons under translation, then sharh, then fawaid. Narrator names in the isnad in their own colour, tappable.
* **Takhrij colours** (Jami + sub-books): ruling word red («متفق علیہ:» «حسن:»), «رواه البخاري» black, number in brackets green link; the reference whose wording is the hadith text = red; 2nd text blue/second colour, 3rd orange, more as needed. Ruling colours: sahih/hasan green, da'if orange, mawdu' red — colour only the ruling word, never the whole paragraph. Takhrij names only book + number, never kitab/bab. No footnote number on takhrij.
* Single open hadith keeps the bottom prev/next strip (number in the middle + 5–7 neighbours, English digits). Swipe prev/next only on single-hadith/page-order views (not on chapter lists or narrator tabs); going back returns to the same scroll place.
* Quran: ornate ﴿ ﴾ only around real Arabic verses; no «(( ))» or « » inside references like [الأنعام: ٩٢]; in the Urdu translation «علیہ السلام» goes in normal brackets; Urdu app labels in Urdu words («مطالعہ کریں»); tafsir chosen shows under each ayah's translation (with «no tafsir» choice); tafsir boxes wide on phone.
* Text rules: he once ruled «no dagger alif (کھڑی زبر) after yeh in Urdu text (تعالیٰ → تعالی, موسیٰ → موسی)» because it showed as a stray mark on his phone (not yet applied to Tafsir Noor al-Huda, which keeps the printed spelling — ask him before changing); no copy via right-click/browser menu (own selection bar only); copy/share never carries stray boxes/face symbols.
* English words printed in a book (Quran Encyclopedia, Seerat Mustafa, Tafsir Noor al-Huda) STAY; remove only e-mail addresses and stray glyph letters.
* Language rule: no mixing languages in any UI language; a translation shows in its own language.
* Theme colour changes must not touch takhrij/hadith/translation/Quran colours.
* **Arabic inside Urdu/other-language text (owner ruling 20-11-2026)**: keeps its « » brackets AND gets a soft highlight band (class `.arq`): gold for a phrase, blue for a single word (`.arq1`); never on Arabic UI text; copy/share carries only the text (no highlight, no symbols). Test: `tests/arabic_highlight_headings.js`.
* **Headings inside running text** (`h4.subh`, `.phead`): gold double line under the heading (printed-book look, owner liked the Tafsir title line). An Islamic ornament before headings only after he picks one; it must be CSS-only so copy never carries it.
* Stray tatweel (ـ) inside Urdu words (justification leftovers, e.g. «آیاتـ») is removed; Arabic words with harakat keep theirs.
* Icons must fit their meaning and look worthy of an Islamic app. Visuals Islamic in style (no rainbows/balloons, nothing Shia-style).
* Splash video: plays on first open, then not again for 3 hours. Resume rule: back to same place after app switch; after ~30 min idle opens main page with «جہاں چھوڑا تھا وہیں سے پڑھیں».
* Hidden for now: «اسلام سوال و جواب».
* Al-Jami al-Kamil / Talkhis: hadith text and i'rab are already corrected — **never touch them**; the 2 deliberate Talkhis arrangements (5420–5422, 5555–5567) stay.

## 8. Service worker / caching (learned the hard way)
`sw.js` serves pages/indexes stale-while-revalidate, but `coll/index.js`, `coll/lite.js`, `offline.json` are **network-first** (6 s timeout, cache fallback) so a phone never keeps an old book registry. If a data file fails to load, `needRange0` in `index.html` re-fetches a fresh `coll/index.js` once and retries (test `tests/stale_registry_opens.js`). Bump the `C='turath-…'` cache name in `sw.js` when its logic changes.

## 9. Useful commands
```
python3 -m http.server 8765 &          # then: node tests/<name>.js   (playwright)
python3 tools/rehash.py                # after data / registry edits
git add -A && git commit … && git push
```
