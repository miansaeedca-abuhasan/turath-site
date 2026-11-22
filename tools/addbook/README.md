# Adding a book (coll format) — reference scripts

These two scripts show exactly how a prose/commentary book (e.g. Tafsir Noor al-Huda) was written into the site.
They are examples (paths inside them point to a scratch folder): copy, change the input rows and the entry, run.

* `example_register_prose_book.py` — first registration: writes `coll/<key>_<lang>_<n>_<md5-6>.js` (about 180 KB each,
  `COLLDATA("<key>","ur",[[id,"§title\nparagraph\n…"],…])`), inserts the entry into `coll/index.js` (`COLLS([...])`),
  adds the group `c_<key>` to `offline.json`.
* `example_reinstall_rows.py` — replace the rows of an already registered book (deletes the old files, writes new ones,
  updates `files`, `count`, `sections`, offline group).

After either one: `python3 tools/rehash.py` (also rebuilds `coll/lite.js`), run the tests, commit, push.
See `/CLAUDE.md` for all rules about what a book must look like.

## Dagger alif (کھڑی زبر) — owner ruling 21-11-2026
Never strip the dagger alif (U+0670 after yeh: تعالیٰ، موسیٰ، فتویٰ) from the supplied Urdu text. The old `seg_fix` that removed it must not be used. Older books built with that rule were repaired with `tools/restore_dagger.py` (source-based, word by word; see CLAUDE.md §7).


## Chapter notes (`ntx`) — Muwatta Imam Malik (Ansar as-Sunnah)
A hadith book whose printed chapters carry text of their own (khulasa, introductory paragraphs, Malik's statements, a kitab introduction) keeps it
out of `coll/index.js`: the paragraphs are written to `coll/<key>_nt_<n>_<md5-6>.js` = `COLLNT("<key>",{"<chapter no>":[paragraphs]})` (~180 KB each)
and the entry lists them as `ntx:[[firstChapter,lastChapter,file]]`. `showSection` (index.html) loads the file of the opened chapter and shows
the paragraphs in a card above the hadith. A chapter that has only such text has an empty hadith range (`start > end`); it opens without the
«could not be loaded» note. Reproduce with `tools/addbook/muwatta/` (parse.py → build_mw.py → register_mw.py; sources are the 3 JSON volumes).
Printed numbering is kept: ids = printed hadith numbers (the printed book has no number 1635, the reader shows «this number is not in the book»).
