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
  /* chapter (bab) title audio of the English Talkhis: direct archive.org links, counts checked against the site's chapters (owner file 24-11-2026); kitabs 47 48 49 60 66 67 are held back until the owner decides */
  var BAB_BASE = 'https://archive.org/download/book1-67_chapter1-end/', BAB = {"1":13,"2":359,"3":77,"4":52,"5":19,"6":19,"7":45,"8":9,"9":421,"10":48,"11":22,"12":46,"13":216,"14":131,"15":145,"16":248,"17":186,"18":14,"19":10,"20":21,"21":27,"22":17,"23":23,"24":139,"25":29,"26":4,"27":15,"28":4,"29":11,"30":8,"31":44,"32":49,"33":41,"34":6,"35":49,"36":30,"37":13,"38":17,"39":3,"40":50,"41":20,"42":46,"43":149,"44":22,"45":41,"46":32,"50":19,"51":5,"52":52,"53":30,"54":199,"55":23,"56":15,"57":46,"58":15,"59":46,"61":467,"62":55,"63":91,"64":16,"65":113};
  /* kitabs 60, 66, 67 (owner report 25-11-2026): the archive files are not 1:1 with the site's chapters. 60: the 19 Arabic-only verse headings (pe56/pe57) have no audio and 3 files («Hadiths of the Surah» 100/103/104) have no site chapter; 66/67: three Paradise/Fire chapters sit in book 66's files and Resurrection ch.49 in book 67's last file. 47 48 49 67 (interleaved order) stay held back until the owner's full-book chapter list is checked. */
  var PE60 = [13, 14, 15, 23, 24, 25, 26, 27, 28, 36, 37, 38, 47, 48, 52, 104, 735, 774, 787], SKIP60 = [1093, 1096, 1097], R67 = {68: [66, 8], 78: [66, 7], 100: [66, 5]};
  /* chapter audio by content (owner files 25-11-2026, every kitab 2-67 except 1/60/66 checked: the chapter transcripts inside the Word_Timings zips matched to the site chapters by spoken title, checked by chapter number and order; 0 = no audio). Books not listed here are linked by position (checked by title and number: 3-11 13-15 18-37 39 41 42 44-46 50 51 55-58 64; book 1 has no chapter transcripts). */
  var MAPB = {"2":"3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,87,86,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,1,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,262,263,261,264,265,266,267,268,269,270,271,272,4,274,275,276,273,277,278,279,280,281,282,283,284,285,286,288,289,290,291,287,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,2,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359","12":"46,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45","16":"1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,208,209,211,214,216,218,206,207,210,212,213,215,217,219,220,221,222,223,224,225,226,227,228,229,231,230,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248","17":"1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,42,44,46,48,51,40,41,43,45,49,50,47,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,75,73,74,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186","38":"2,3,6,8,9,12,14,1,4,5,7,10,11,13,15,16,17","40":"2,6,7,11,13,16,21,22,25,27,29,32,34,35,3,4,8,12,14,18,20,23,26,28,30,31,33,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,1,5,9,10,15,17,19,24","43":"8,15,24,28,33,42,50,58,64,67,72,74,79,82,85,87,1,14,23,29,40,44,49,55,63,69,71,77,78,81,84,88,91,93,95,96,98,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,2,11,21,32,37,41,53,57,62,65,73,76,7,10,20,25,34,6,13,22,26,35,46,48,3,16,17,27,39,43,52,59,61,66,70,75,80,83,86,89,90,92,94,97,99,4,9,19,31,36,47,54,5,12,18,30,38,45,51,56,60,68","47":"2,9,18,27,29,40,42,47,56,58,62,63,68,69,74,76,77,79,82,84,85,88,90,4,14,16,26,31,35,43,49,55,59,61,64,67,70,72,75,78,80,81,83,86,87,89,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,3,13,19,25,34,36,45,52,54,57,60,65,66,71,73,12,20,24,33,37,41,48,6,11,15,23,32,38,44,50,5,10,17,22,30,39,46,51,53,7,8,21,28","48":"46,119,161,169,221,258,273,314,340,346,388,410,412,447,463,466,494,509,510,537,545,552,579,590,591,610,619,0,620,631,635,640,650,653,658,16,80,92,125,194,206,245,280,311,331,359,384,392,428,438,454,474,490,498,515,528,548,559,566,585,599,603,618,626,632,639,643,649,654,656,659,27,63,102,136,197,211,247,289,307,336,360,373,398,430,433,461,467,488,508,516,532,544,556,567,588,594,607,615,15,78,98,146,192,213,251,281,303,0,337,28,70,105,143,195,212,235,279,302,325,363,372,404,421,444,451,470,493,503,518,533,538,553,575,586,592,605,612,622,633,638,641,647,652,657,661,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,25,60,100,135,178,218,250,294,298,326,362,368,10,62,107,134,198,217,249,288,297,333,356,370,403,426,434,460,468,489,507,513,536,543,564,568,582,598,602,611,4,68,86,129,193,219,17,72,85,139,190,210,254,287,32,58,121,155,166,209,262,272,312,339,351,389,406,411,446,464,43,44,115,148,164,223,259,42,61,101,144,183,208,260,277,310,327,352,379,397,419,439,24,81,87,132,187,220,239,284,306,323,364,374,400,416,442,452,480,484,501,517,531,546,560,577,20,75,104,142,184,205,241,285,300,324,353,382,399,422,435,456,471,492,504,519,534,550,555,572,41,94,133,189,207,246,290,315,8,74,96,6,71,103,22,45,89,157,180,19,82,91,138,185,199,244,278,18,66,109,26,67,110,128,191,215,252,275,318,342,345,369,405,429,443,449,476,491,496,511,524,540,565,578,581,593,604,613,621,628,637,644,648,651,655,660,662,14,69,99,159,165,224,39,47,116,150,167,225,238,282,299,330,365,377,409,413,448,465,469,481,505,514,535,549,562,571,38,48,118,158,171,226,36,50,120,160,173,227,253,276,295,338,347,387,408,414,3,51,114,127,170,216,242,292,12,65,95,126,163,222,37,49,117,156,177,228,257,269,296,321,358,383,390,425,445,453,475,495,506,521,527,542,561,570,583,595,608,614,625,627,634,642,7,76,1,35,52,122,145,162,230,256,266,316,344,348,385,407,53,123,229,265,33,54,124,153,168,231,255,268,313,343,349,386,393,423,11,59,108,137,188,201,248,291,301,334,366,381,391,420,436,450,472,483,500,520,525,547,558,576,580,597,23,64,93,147,181,214,237,283,304,328,354,380,402,418,432,458,478,486,499,512,526,551,557,573,589,600,606,617,623,630,30,84,90,131,196,200,236,293,320,332,361,376,396,424,431,455,479,487,29,77,106,130,174,232,263,271,317,31,55,112,151,186,204,243,286,309,322,357,378,401,427,441,462,473,485,502,522,529,541,563,569,584,596,5,79,88,140,179,203,240,274,308,329,367,371,395,415,437,457,477,482,497,523,530,539,554,574,587,601,609,616,624,629,636,645,646,21,56,113,154,176,233,261,270,305,335,355,375,394,417,440,459,9,57,111,149,172,234,13,73,97,141,182,202,264,267,319,341,350","49":"12,29,34,48,59,73,81,3,21,40,45,58,74,77,87,101,104,116,120,129,4,20,43,44,57,72,78,88,102,103,112,124,126,135,137,143,2,18,42,46,55,75,80,6,17,32,53,65,71,83,90,97,108,118,7,28,31,13,27,35,9,30,33,54,60,67,84,89,95,107,117,121,8,26,36,52,64,70,15,16,5,19,11,25,37,50,62,66,85,91,100,105,111,123,127,132,139,140,144,149,150,153,158,159,162,166,168,170,171,174,175,178,180,181,184,185,188,190,192,194,196,198,199,1,22,41,47,56,76,79,92,99,109,114,119,130,133,136,142,146,148,151,155,156,160,163,165,167,169,172,173,176,177,179,182,183,186,187,189,191,193,195,197,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,14,24,38,49,63,69,86,93,96,106,115,122,128,134,138,141,145,147,152,154,157,161,164,10,23,39,51,61,68,82,94,98,110,113,125,131","52":"2,6,9,16,19,23,4,5,11,13,18,21,26,27,30,32,34,35,37,39,42,44,1,8,12,15,17,22,25,28,29,31,33,36,38,40,41,43,45,46,47,48,49,50,51,52,3,7,10,14,20,24","53":"3,6,9,11,14,15,17,20,2,4,8,10,13,16,18,19,21,22,23,24,25,26,27,28,29,30,1,5,7,12","54":"8,26,50,61,68,84,95,100,116,123,131,142,150,151,16,25,49,64,67,88,94,101,115,125,130,138,146,152,9,24,51,60,10,23,43,62,69,87,96,99,114,122,129,139,147,153,11,22,44,63,70,86,98,103,113,126,128,140,148,154,161,165,166,173,176,177,182,185,187,15,19,45,12,21,46,65,13,20,47,66,71,85,97,102,117,124,127,141,149,155,160,164,169,172,175,179,180,183,188,2,30,39,56,75,81,93,104,110,121,132,135,145,5,34,35,57,72,83,90,107,112,119,133,137,144,157,158,163,168,171,4,29,42,54,76,1,33,38,55,3,32,37,58,73,79,91,108,6,31,41,59,77,82,92,105,111,118,14,28,40,53,74,7,27,36,52,78,80,89,106,109,120,134,136,143,156,159,162,167,170,174,178,181,184,186,189,190,191,192,193,194,195,196,197,198,199,17,18,48","59":"2,3,6,8,9,12,14,15,18,20,21,24,26,27,30,32,33,35,36,37,38,39,40,41,42,43,44,45,46,1,4,5,7,10,11,13,16,17,19,22,23,25,28,29,31,34","61":"16,29,47,77,85,102,127,141,154,183,186,202,218,225,239,254,262,273,288,292,304,315,320,330,338,346,351,362,364,370,376,380,384,390,394,400,406,409,413,421,423,428,434,437,440,447,449,452,457,458,459,460,461,462,463,464,465,466,467,17,28,44,79,88,106,129,150,162,176,185,203,221,226,241,255,258,272,289,291,302,318,323,329,339,343,354,18,27,43,78,86,101,128,135,152,184,191,198,220,227,237,257,261,271,290,295,303,317,319,328,341,347,19,26,42,73,83,20,25,45,76,81,105,133,138,155,15,24,46,72,82,100,131,140,158,181,187,201,222,228,236,252,260,270,287,293,305,316,322,327,340,344,352,360,365,369,377,379,385,391,395,399,407,408,414,422,425,14,23,49,75,84,103,134,139,153,182,188,199,219,13,22,48,80,89,104,130,137,157,180,189,204,217,229,238,253,259,269,286,294,301,314,321,331,342,345,353,361,363,368,375,378,383,392,393,398,405,410,415,420,424,429,435,436,441,446,448,453,456,12,21,41,74,87,107,132,136,156,179,190,200,223,224,240,256,263,277,285,296,309,311,326,334,337,350,356,6,37,52,63,90,113,1,32,53,68,91,111,124,147,161,177,193,208,211,231,243,247,267,276,284,297,310,9,36,55,65,92,114,120,151,166,175,194,205,214,233,244,249,265,279,280,298,306,312,324,332,336,349,357,358,366,372,374,382,387,388,396,401,403,411,416,419,426,430,433,439,442,444,451,10,34,50,67,93,112,122,146,167,178,8,40,51,69,94,116,125,148,168,170,5,30,60,64,95,117,119,144,164,171,11,39,59,62,96,108,121,143,159,172,197,210,215,234,245,248,266,275,281,2,38,58,70,97,110,123,149,160,173,196,209,212,232,242,251,264,274,283,300,308,4,33,57,71,3,31,56,61,98,115,126,145,165,174,192,206,216,230,246,250,268,278,282,299,307,313,325,333,335,348,355,359,367,371,373,381,386,389,397,402,404,412,417,418,427,431,432,438,443,445,450,454,455,7,35,54,66,99,109,118,142,163,169,195,207,213,235","62":"3,5,10,14,19,23,25,27,28,31,33,35,37,38,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,1,6,9,16,17,4,8,12,15,20,21,24,26,29,30,32,34,36,39,2,7,11,13,18,22","63":"5,7,11,19,25,28,31,39,44,49,50,56,58,61,63,66,69,71,73,75,76,78,79,80,81,82,83,84,85,86,87,88,89,90,91,1,10,13,17,24,29,35,37,41,48,51,54,59,60,64,3,9,14,16,23,27,34,38,45,46,52,55,57,62,65,67,68,70,72,74,77,4,6,12,20,22,26,32,36,42,47,53,2,8,15,18,21,30,33,40,43","65":"4,6,9,12,15,19,22,23,26,30,34,37,38,42,45,47,49,51,52,54,56,58,60,63,65,67,68,71,73,74,76,79,81,82,84,87,88,91,93,95,96,99,100,103,104,105,106,107,108,109,110,111,112,113,3,5,8,13,14,17,21,25,28,31,33,36,39,41,44,46,48,50,53,55,57,59,61,62,64,66,69,70,72,75,77,78,80,83,85,86,89,90,92,94,97,98,101,102,1,2,7,10,11,16,18,20,24,27,29,32,35,40,43","67":"1,12,15,19,24,31,34,40,43,47,54,56,58,61,65,66,69,70,73,75,77,79,81,82,85,87,2,11,18,22,26,30,32,37,42,49,53,55,59,62,64,67,68,71,72,74,76,78,80,83,84,86,88,89,90,91,92,93,94,95,96,97,3,10,17,21,25,0,33,38,45,50,52,4,9,16,20,0,29,35,39,46,48,51,57,60,63,5,8,14,23,27,28,36,41,44,6,7,13,0"};
  var fileOf = function (book, ord) {
    book = +book; if (!(ord >= 1)) return null;
    if (book === 67 && R67[ord]) return R67[ord];
    if (MAPB[book]) { var q = MAPB[book].split(','), v = +q[ord - 1]; return v ? [book, v] : null; }
    if (book === 60) { if (ord > 1135 || PE60.indexOf(ord) >= 0) return null; var f = ord; PE60.forEach(function (p) { if (p < ord) f--; }); SKIP60.forEach(function (x) { if (f >= x) f++; }); return f <= 1119 ? [60, f] : null; }
    if (book === 66) { if (ord > 51) return null; if (ord === 49) return [67, 98]; return [66, ord <= 4 ? ord : ord === 5 ? 6 : ord <= 48 ? ord + 3 : ord + 2]; }
    if (book === 67) return R67[ord] || null;
    var n = BAB[book]; return n && ord <= n ? [book, ord] : null;
  };
  var babUrl = function (book, ord) { var f = fileOf(book, ord); return f ? BAB_BASE + 'book' + ('0' + f[0]).slice(-2) + '_chapter' + ('000' + f[1]).slice(-4) + '.mp3' : null; };
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
      else if (lg === 'en' && babUrl(book, ord)) Q.push({url: babUrl(book, ord), label: T('title')});
      nums.forEach(function (n) { var pk = pick(n); if (pk) Q.push({url: hurl(pk.lg, n), label: T('had') + ' ' + DG(n), num: n}); });
      if (Q.length) play(0);
    },
    chapterInfo: async function (book, ord, nums) {
      await idx(); var b = (cfg(chLang(book, ord)).books || {})[String(book)], own = !!(b && b.c && b.c[ord]);
      if (!own && !(chLang(book, ord) === 'en' && babUrl(book, ord))) return null;
      var sec = own ? b.c[ord] : 0, k = 0; nums.forEach(function (n) { var s = b && b.h && b.h[n]; if (s) { sec += s; k++; } });
      return {minutes: sec ? Math.max(1, Math.round(sec / 60)) : 0, count: k};
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
      bt.textContent = '🔊 ' + T('ch') + (info.minutes ? ' — ' + DG(info.minutes) + ' ' + T('min') : '');
      bt.addEventListener('click', function () { window.ENAUD.chapter(String(book), ord, nums); });
      return bt;
    },
    babUrl: babUrl,
    stop: stopAll
  };
  idx();
})();
