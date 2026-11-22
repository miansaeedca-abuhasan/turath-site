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
* **Takhrij in every translated (coll) book except the complete Al-Jami al-Kamil (owner ruling 22-11-2026)**: «book (number)», never «کتاب… باب… حدیث: N». Tool `tools/takhrij_short.py` (run it on any newly added book; it rewrites `coll/*_ur_*` + registry + offline). References with no hadith number keep kitab/bab as printed; Muslim «N/M» forms (two numbers, order unclear) are left as printed until the owner decides. Test `tests/takhrij_short.js`. (Silsila Sahiha and Bulugh al-Maram saada are scholarly Arabic-style takhrij and are not converted.)
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
9. Chapter-level text (khulasa, bab paragraphs, kitab introduction) of a hadith book: `ntx` files + `COLLNT` (see `tools/addbook/README.md`; example `muwattaansar`, test `tests/muwatta_ansar_full.js`).
Reminders: skip books already on the site (never replace existing ones with new copies); in every category all books of one author stay together; newly added items carry «نئی / New» badge for **1 month**.

## 5. Book list order (all UI languages — do not let it break again)
al-Jami al-Kamil, Talkhis, then translated books in that language (Bukhari, Muslim, other Sunan in usual order), then Jami sub-books in their Jami order, then other translated books/sharhs; Arabic UI keeps the Arabic order. Books translated into the current UI language come first. Every book must be findable in its proper place (Seerah, Fitan, Fazail as-Sahabah, Sahaba books in the Sahaba folder). Newly added books go at the end. Book names in Urdu UI: Urdu script/Urdu font, no double names, Urdu on the right, Arabic on the left. Tafsir names always show language in brackets (اردو / عربی), Urdu tafsirs first, Urdu and Arabic versions separate entries.
**«ذیلی مترجم کتب» (owner ruling, 19-11-2026)**: on the home of Al-Jami al-Kamil *and* of Talkhis the tile is called «ذیلی مترجم کتب» (not «مترجم کتب»). Its page (`#/hb/a/jami`) lists ONLY books taken from Al-Jami al-Kamil, and only those translated into the reader's UI language (Urdu UI: Urdu-translated ones). It never contains Al-Jami al-Kamil or Talkhis themselves, and never books that are not taken from Al-Jami (e.g. Silsila Sahiha, Darimi, Mu'jam). Test: `tests/silsila_in_translated_folder.js`. Main list «کتب حدیث»: Al-Jami al-Kamil, then Talkhis, then Bukhari and the other translated books of the same language, then Arabic etc.
Tafsir Noor al-Huda (`tafsirnoor`, 15 vols / 30 paras / 8096 rows) is listed in the «تفاسیر» page (Urdu group, first) and opens the prose reader `#/s/tafsirnoor`.
* **«تفاسیر» page rows (owner ruling 20-11-2026)**: every tafsir row has one style (`a.tfrow`: name with language in brackets, author small below, hadith count small below for books); newly added Urdu tafsirs carry «نئی» for 1 month; the 4 full Arabic tafsir books (`sh43 sh8658 sh12217 sh1503`) are in `HB_CAT` category 5 and stand in the Arabic group. Test: `tests/tafsir_hub_uniform.js`.

## 6. «اپڈیٹس» (news) rules
Lists ONLY: new books added, new audios/audiobooks, a new section (only when he says). Never reports of corrections, تصحیح, i'rab work, features or small changes; no error caveats.
One card per day (all books added that day in ONE card), one line per book (never several books on a line), 1–3 lines of detail; line = the book's full library name + its sub-title + translator(s) («… ترجمہ و شرح از X - دوسرا ترجمہ از Y»), hadith count in brackets after the name, one author's books together; each line links to the book. No separate news for a later volume of the same book. The «اپڈیٹ آگئی ہے» bar/popup at most once a day.

## 7. Site design rules
* **Hadith number**: plain «12345 -» in red directly before the Arabic text (printed-Jami style, no oval); English digits in Urdu/other UIs, Arabic digits only in the Arabic UI. On Jami sub-books the main number is the Jami number, the book's own number sits above in a small circle; cross-reference pill «الجامع الکامل N». Copy/share: first line Jami number + book number (`12345/2`), Arabic, takhrij ending «الجامع الکامل (12345).», translation; no book-name header, no «2 (2)».
* **Hadith card**: takhrij + translation in one box, «تحقیق و تخریج» as a small coloured label; «ترجمہ :» followed by small pill tabs (one per translator); fawaid/sharh tabs same size; bab title in the header, not inside the translation; bookmark/share/poster/compare buttons under translation, then sharh, then fawaid. Narrator names in the isnad in their own colour, tappable.
* **Takhrij colours** (Jami + sub-books): ruling word red («متفق علیہ:» «حسن:»), «رواه البخاري» black, number in brackets green link; the reference whose wording is the hadith text = red; 2nd text blue/second colour, 3rd orange, more as needed. Ruling colours: sahih/hasan green, da'if orange, mawdu' red — colour only the ruling word, never the whole paragraph. Takhrij names only book + number, never kitab/bab. No footnote number on takhrij.
* Single open hadith keeps the bottom prev/next strip (number in the middle + 5–7 neighbours, English digits). Swipe prev/next only on single-hadith/page-order views (not on chapter lists or narrator tabs); going back returns to the same scroll place.
* Quran: ornate ﴿ ﴾ only around real Arabic verses; no «(( ))» or « » inside references like [الأنعام: ٩٢]; in the Urdu translation «علیہ السلام» goes in normal brackets; Urdu app labels in Urdu words («مطالعہ کریں»); tafsir chosen shows under each ayah's translation (with «no tafsir» choice); tafsir boxes wide on phone.
* Text rules: **dagger alif (کھڑی زبر) after yeh stays in Urdu text (تعالیٰ، موسیٰ، فتویٰ) — owner ruling 21-11-2026 reversed his earlier «no dagger alif» rule** (the Urdu word stays in the Urdu font, shape unchanged). Take it exactly from the supplied source file: never strip it when building a book; for older books it was restored from the sources by `tools/restore_dagger.py` (word-by-word, only where the source's own context shows it; unresolved/ambiguous words such as یحیی، الکبری، یعلی stay as they were); no copy via right-click/browser menu (own selection bar only); copy/share never carries stray boxes/face symbols.
* English words printed in a book (Quran Encyclopedia, Seerat Mustafa, Tafsir Noor al-Huda) STAY; remove only e-mail addresses and stray glyph letters.
* Language rule: no mixing languages in any UI language; a translation shows in its own language.
* Theme colour changes must not touch takhrij/hadith/translation/Quran colours.
* **Arabic inside Urdu/other-language text (owner ruling 20-11-2026)**: always shows in « » (Arabic font), also when the book data has no brackets (the site adds them when displaying). NO highlight band: the yellow/blue highlights he once sent were his own selection-bar marks, not a request. Never on Arabic UI text; copy/share carries the text with « ». Test: `tests/arabic_highlight_headings.js`.
* **Headings inside running text** (`h4.subh`, `.phead`): gold double line under the heading (printed-book look, owner liked the Tafsir title line). Ornament before the heading, CSS-only `::before` (never copied), gold; owner's picks 21-11-2026: **۞ (no.1)** tafsir headings; **✦ (no.2)** hadith-book introductions (عرض ناشر، مقدمہ، تقریظ…); **❖ (no.3)** sharh / fawaid / other headings of a hadith; **❁ (no.5)** headings of the other prose books (Seerah, Raheeq, Siyar…). Test: `tests/heading_ornaments.js`.
* **Tafsir Ibn Kathir (Urdu)** (owner 22-11-2026): no ؓ ؒ ؑ symbols (written out: رضی اللہ عنہ / عنہا / عنہما / عنہم, رحمہ اللہ, علیہ السلام), «حضرت» before a Companion = «سیدنا / سیدہ», durood in Urdu spelling (صلی اللہ علیہ وسلم). Tool `tools/tafsir_fix/ibnkathir_honorifics.py`, test `tests/ibnkathir_honorifics.js`.
* **Tafsir Bhatwi (Urdu)** (owner 22-11-2026): Arabic inside the Urdu text has no Urdu quote marks / (( )) around it (the site shows it in « »), and in this tafsir it is **light purple** (`.qtr.tf-ur_bhuttavi .arq`, brackets included); verses stay ﴿ ﴾; hadith references are «بخاری (۴۷۰۳)» (book + number; kitab/bab only when there is no number; Muslim: the Fuad number). Tool `tools/tafsir_fix/bhatwi_arabic.py`, test `tests/bhatwi_clean.js`.
* **Durood in every Urdu tafsir** (owner 22-11-2026): one written form «صلی اللہ علیہ وسلم» everywhere (also «وآلہ», «صلعم», «صل عم», Arabic spelling «صلى الله عليه وسلم», glued/broken forms). The Quranic pause mark ؐ is NOT a durood – never touch it. Tool `tools/tafsir_fix/durood_all.py`, test `tests/durood_all_tafsirs.js`.
* **Verses in tafsirs** (owner 22-11-2026): a verse is ﴿ ﴾ with the reference `[سورۃ: ۱۲]` after it (Urdu digits, Urdu spelling of the surah); old forms «(…) 032:002», «( … 98 ؀) 16۔ النحل :98)», «(…) [ النحل : ۹۸ ]», ««…» ( 39-الزمر : 10 )» are converted and the verse letters get Arabic shapes. Parenthesised Arabic WITHOUT a verse reference (hadith, duas, word citations) is left as it is. Tool `tools/tafsir_fix/verse_brackets.py`. The ayah-number circle in tafsirs is small (`.qtr .ayn`). Test `tests/tafsir_verses_noor_lines.js`.
* **Tafsir Noor al-Huda Arabic**: fully vocalized words typed with Urdu letters get Arabic shapes (so they show in the Arabic font); Urdu quote marks around Arabic-only text are removed. Tool `tools/tafsir_fix/noor_arabic.py` (rewrites `coll/tafsirnoor_ur_*`, registry, offline).
* **Heading gold double line** (owner 22-11-2026): only a little longer than the heading (`.subh,.phead{width:fit-content;padding-inline-end:1.6em}`), not full width.
* **Owner rulings 22-11-2026 (later)**: «صلی اللہ علیہ وآلہ وسلم» (with «وآلہ») stays as written in the tafsirs – do not shorten it. Muslim «N/M» are both hadith numbers: written `مسلم (1803/3045)` in ONE bracket (`tools/takhrij_short.py`, only when «رقم/حدیث:» precedes; volume/page forms like Shamail «(3/68)» are not touched). «حضرت» before a clear Companion → «سیدنا / سیدہ» in all Urdu tafsirs (`tools/tafsir_fix/sayyidna_all.py`; Tabi'in, prophets and ambiguous names are left; test `tests/tafsir_sayyidna_all.js`). Tafsir Saadi had InPage glyph letters glued to names (u/p = علیہ السلام, t = رضی اللہ عنہ, y = عنہم, w = عنہما, r = عنہا, g = عنہن, a = رحمہ اللہ, S = رحمہم اللہ, E = صلی اللہ علیہ وسلم) – converted by `tools/tafsir_fix/saadi_glyphs.py`; unresolved «i» (10) and «m» (31) are left for the owner.
* **Home date strip** (owner 22-11-2026): the share button is a small round icon between the Hijri and Gregorian dates (no green share bar); the date strip and the ticker strip have the same height; ticker text fades at both edges. Test `tests/home_share_strip.js`.
* **One author's tafsirs stand together** on the «تفاسیر» page (Arabic group grouped by author).
* Stray tatweel (ـ) inside Urdu words (justification leftovers, e.g. «آیاتـ») is removed; Arabic words with harakat keep theirs.
* Icons must fit their meaning and look worthy of an Islamic app. Visuals Islamic in style (no rainbows/balloons, nothing Shia-style).
* Splash video: plays on first open, then not again for 3 hours. Resume rule: back to same place after app switch; after ~30 min idle opens main page with «جہاں چھوڑا تھا وہیں سے پڑھیں».
* Hidden for now: «اسلام سوال و جواب».
* Al-Jami al-Kamil / Talkhis: hadith text and i'rab are already corrected — **never touch them**; the 2 deliberate Talkhis arrangements (5420–5422, 5555–5567) stay.

## 8. Service worker / caching (learned the hard way)
`sw.js` serves pages/indexes stale-while-revalidate, but `coll/index.js`, `coll/lite.js`, `offline.json` are **network-first** (6 s timeout, cache fallback) so a phone never keeps an old book registry. If a data file fails to load, `needRange0` in `index.html` re-fetches a fresh `coll/index.js` once and retries (test `tests/stale_registry_opens.js`). Bump the `C='turath-…'` cache name in `sw.js` when its logic changes.

Lesson 22-11-2026: `quran/tafsir/*.js` are CACHE-FIRST (no hash in the name). After changing any of them: run `python3 tools/offline_sync.py` (refreshes their hash/size in `offline.json`) AND bump the `C='turath-…'` name in `sw.js`, otherwise phones keep showing the old text.

## 9. Useful commands
```
python3 -m http.server 8765 &          # then: node tests/<name>.js   (playwright)
python3 tools/rehash.py                # after data / registry edits
git add -A && git commit … && git push
```

## 10. «AI ترجمہ» (owner request 22-11-2026; label changed from «ترجمہ جیمنائی» the same day)
Hadith books (coll books only, never Al-Jami al-Kamil/Talkhis) WITHOUT a translation in the reader's UI language (all UI languages except Arabic; `GEM_LANGS`; `HB_CAT` in {1,3,6,7,9,14,15,16,17,18}, not prose/parts, not narrator books) show a button named «AI ترجمہ» (per-language names in `GEM_TT`) in the hadith card (`gemBox` in index.html). The note under the translation says the same name («یہ مشینی ترجمہ ہے (AI ترجمہ)»); the word Gemini is not shown. Books that already have a translation in the UI language are never touched.
Tap → `POST /api/htrans {ar, lang}` (`functions/api/htrans.js`): saved copy from D1 table `htrans` (key = SHA-256 of the Arabic letters without harakat; non-Urdu languages prefix `lang|`) is returned to everybody; otherwise Gemini translates and the result is saved. Limits for NEW translations only: `HTRANS_USER` (40/person/day), `HTRANS_DAILY` (3000/site/day); owner unlimited. Key only as Cloudflare secret `GEMINI_API_KEY`. No «اپڈیٹس» entry. Live check: GET `/api/htrans`. Test `tests/gemini_translation.js`.
Open (owner idea, not yet approved/built): automatic daily background translation incl. bab titles.
