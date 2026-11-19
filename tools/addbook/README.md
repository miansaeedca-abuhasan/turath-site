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
