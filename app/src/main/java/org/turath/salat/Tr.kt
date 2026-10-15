package org.turath.salat

/** the app's words in Urdu, Arabic and English (no Urdu in the Arabic or English screens) */
object Tr {
    var lang = "ur"
    val rtl get() = lang != "en"

    private val W: Map<String, Array<String>> = mapOf(
        // name of the app
        "app" to arrayOf("صلاۃ خیرالقرون", "صلاة خير القرون", "Salat Khair al-Quroon"),
        // prayers and times
        "FAJR" to arrayOf("فجر", "الفجر", "Fajr"), "SUNRISE" to arrayOf("طلوعِ آفتاب", "الشروق", "Sunrise"),
        "ISHRAQ" to arrayOf("اشراق", "الإشراق", "Ishraq"), "CHASHT" to arrayOf("چاشت (ضحیٰ)", "الضحى", "Duha (Chasht)"),
        "ZAWAL" to arrayOf("زوال", "الزوال", "Zawal"), "DHUHR" to arrayOf("ظہر", "الظهر", "Dhuhr"),
        "ASR" to arrayOf("عصر", "العصر", "Asr"), "MAGHRIB" to arrayOf("مغرب", "المغرب", "Maghrib"),
        "ISHA" to arrayOf("عشاء", "العشاء", "Isha"), "TAHAJJUD" to arrayOf("تہجد (رات کا آخری تہائی)", "التهجد (الثلث الأخير)", "Tahajjud (last third)"),
        "JUMUAH" to arrayOf("جمعہ", "الجمعة", "Jumu'ah"),
        // tabs
        "tHome" to arrayOf("آج", "اليوم", "Today"), "tTimes" to arrayOf("اوقات", "المواقيت", "Times"),
        "tRem" to arrayOf("یاد دہانی", "التنبيهات", "Reminders"), "tCal" to arrayOf("کیلنڈر", "التقويم", "Calendar"),
        "tQibla" to arrayOf("قبلہ", "القبلة", "Qibla"), "settings" to arrayOf("ترتیبات", "الإعدادات", "Settings"),
        // home
        "now" to arrayOf("اب", "الآن", "Now"), "next" to arrayOf("اگلی نماز", "الصلاة القادمة", "Next prayer"),
        "since" to arrayOf("وقت شروع ہوئے", "منذ دخول الوقت", "Since the time began"),
        "until" to arrayOf("باقی وقت", "الوقت المتبقي", "Time left"),
        "forbidden" to arrayOf("ممنوع وقت — اس وقت نماز ادا نہیں کی جاتی", "وقت نهي — لا تُصلّى فيه صلاة", "Forbidden time — no prayer is offered now"),
        "forbiddenUntil" to arrayOf("ختم:", "ينتهي:", "Ends:"),
        "afterAsr" to arrayOf("عصر کے بعد نفل نہیں", "لا نافلة بعد العصر", "No voluntary prayer after Asr"),
        "afterFajr" to arrayOf("فجر کے بعد نفل نہیں", "لا نافلة بعد الفجر", "No voluntary prayer after Fajr"),
        "world" to arrayOf("دنیا کے شہر", "مدن العالم", "World cities"),
        "addCity" to arrayOf("شہر شامل کریں", "أضف مدينة", "Add a city"),
        "hoursAhead" to arrayOf("گھنٹے آگے", "ساعات متقدمة", "hours ahead"),
        "hoursBehind" to arrayOf("گھنٹے پیچھے", "ساعات متأخرة", "hours behind"),
        "sameTime" to arrayOf("ایک ہی وقت", "نفس التوقيت", "same time"),
        "nafl" to arrayOf("نوافل کے اوقات", "أوقات النوافل", "Voluntary prayers"),
        "fasting" to arrayOf("روزہ", "الصيام", "Fasting"),
        "fastToday" to arrayOf("آج روزہ ہے — افطار", "صائم اليوم — الإفطار", "Fasting today — iftar"),
        // reminders
        "monThu" to arrayOf("پیر اور جمعرات کے روزے", "صيام الاثنين والخميس", "Monday and Thursday fasts"),
        "beed" to arrayOf("ایامِ بیض کے روزے (13، 14، 15)", "صيام الأيام البيض (13، 14، 15)", "The white days' fasts (13th, 14th, 15th)"),
        "beedNote" to arrayOf("ہر مہینے 12 تاریخ کی رات پوچھا جائے گا؛ قبول کرنے پر سحری کا الارم اور افطار کی یاد دہانی لگ جائے گی۔",
            "يُسأل ليلة الثاني عشر من كل شهر؛ وعند القبول يُضبط منبّه السحور وتذكير الإفطار.",
            "You are asked on the night of the 12th each month; if you accept, the suhoor alarm and iftar reminder are set."),
        "suhoor" to arrayOf("سحری کا الارم", "منبّه السحور", "Suhoor alarm"),
        "iftar" to arrayOf("افطار سے پہلے دعا کی یاد دہانی", "تذكير الدعاء قبل الإفطار", "Reminder to make du'a before iftar"),
        "minBeforeFajr" to arrayOf("منٹ فجر سے پہلے", "دقيقة قبل الفجر", "min before Fajr"),
        "minBeforeMaghrib" to arrayOf("منٹ مغرب سے پہلے", "دقيقة قبل المغرب", "min before Maghrib"),
        "before" to arrayOf("پہلے", "قبل", "before"), "after" to arrayOf("بعد", "بعد", "after"),
        "min" to arrayOf("منٹ", "دقيقة", "min"), "hr" to arrayOf("گھنٹہ", "ساعة", "h"),
        "prePost" to arrayOf("نمازوں سے پہلے اور بعد یاد دہانی", "تذكير قبل الصلوات وبعدها", "Reminders before and after prayers"),
        "prePostNote" to arrayOf("ہر نماز کے لیے منٹ چنیں؛ صفر کا مطلب بند ہے", "اختر الدقائق لكل صلاة؛ الصفر يعني إيقافه", "Choose minutes for each prayer; zero means off"),
        "custom" to arrayOf("اپنی یاد دہانیاں", "تنبيهاتي", "My reminders"),
        "newRem" to arrayOf("نئی یاد دہانی", "تنبيه جديد", "New reminder"),
        "label" to arrayOf("نام", "الاسم", "Name"), "save" to arrayOf("محفوظ کریں", "حفظ", "Save"),
        "delete" to arrayOf("حذف کریں", "حذف", "Delete"), "cancel" to arrayOf("رہنے دیں", "إلغاء", "Cancel"),
        "sound" to arrayOf("آواز", "الصوت", "Sound"),
        "days" to arrayOf("پ،م،ب،ج،جم،ہ،ا", "ن،ث،ر،خ،ج،س،ح", "M,T,W,T,F,S,S"),
        // sounds
        "ADHAN_MAKKAH" to arrayOf("اذان — مسجد الحرام: شیخ علی احمد ملا", "أذان المسجد الحرام: الشيخ علي أحمد ملا", "Adhan — Masjid al-Haram: Shaikh Ali Ahmad Mulla"),
        "ADHAN_DAGHRIRI" to arrayOf("اذان — مسجد الحرام: شیخ حمد الدغریری", "أذان المسجد الحرام: الشيخ حمد الدغريري", "Adhan — Masjid al-Haram: Shaikh Hamad al-Daghriri"),
        "ADHAN_DAGHRIRI2" to arrayOf("اذان — مسجد الحرام: شیخ حمد الدغریری (2)", "أذان المسجد الحرام: الشيخ حمد الدغريري (2)", "Adhan — Masjid al-Haram: Shaikh Hamad al-Daghriri (2)"),
        "ADHAN_MADINAH" to arrayOf("اذان — مسجد نبوی: شیخ عصام بخاری", "أذان المسجد النبوي: الشيخ عصام بخاري", "Adhan — Masjid an-Nabawi: Shaikh Essam Bukhari"),
        "ADHAN_AQSA" to arrayOf("اذان — مسجد اقصیٰ، بیت المقدس", "أذان المسجد الأقصى", "Adhan — al-Aqsa, al-Quds"),
        "ADHAN_BASIT" to arrayOf("اذان — شیخ عبدالباسط عبدالصمد", "أذان الشيخ عبد الباسط عبد الصمد", "Adhan — Shaikh Abdul Basit Abdus Samad"),
        "ADHAN_NABET" to arrayOf("اذان — شیخ صالح النبت", "أذان الشيخ صالح النبت", "Adhan — Shaikh Saleh al-Nabet"),
        "ADHAN_MAGHRIBI" to arrayOf("اذان — شیخ نور الدین حمزہ المغربی", "أذان الشيخ نور الدين حمزة المغربي", "Adhan — Shaikh Nur ad-Din Hamza al-Maghribi"),
        // short calls and the muezzins
        "khayr" to arrayOf("«الصلاة خير من النوم»", "«الصلاة خير من النوم»", "«As-salatu khairun min an-nawm»"),
        "hayya" to arrayOf("«حي على الصلاة»", "«حيّ على الصلاة»", "«Hayya ala as-salah»"),
        "shahada" to arrayOf("«أشهد أن لا إله إلا الله»", "«أشهد أن لا إله إلا الله»", "«Ash-hadu an la ilaha illallah»"),
        "takbir" to arrayOf("«الله أكبر، الله أكبر»", "«الله أكبر، الله أكبر»", "«Allahu akbar, Allahu akbar»"),
        "takbirat" to arrayOf("تکبیرات", "التكبيرات", "Takbirat"),
        "MULLA" to arrayOf("شیخ علی احمد ملا (مکہ)", "الشيخ علي أحمد ملا (مكة)", "Shaikh Ali Ahmad Mulla (Makkah)"),
        "DAGHRIRI" to arrayOf("شیخ حمد الدغریری (مکہ)", "الشيخ حمد الدغريري (مكة)", "Shaikh Hamad al-Daghriri (Makkah)"),
        "BUKHARI" to arrayOf("شیخ عصام بخاری (مدینہ)", "الشيخ عصام بخاري (المدينة)", "Shaikh Essam Bukhari (Madinah)"),
        "NABET" to arrayOf("شیخ صالح النبت", "الشيخ صالح النبت", "Shaikh Saleh al-Nabet"),
        "MAGHRIBI" to arrayOf("شیخ نور الدین حمزہ المغربی", "الشيخ نور الدين حمزة المغربي", "Shaikh Nur ad-Din Hamza al-Maghribi"),
        "BASIT" to arrayOf("شیخ عبدالباسط عبدالصمد", "الشيخ عبد الباسط عبد الصمد", "Shaikh Abdul Basit Abdus Samad"),
        // birdsong
        "BIRDS1" to arrayOf("صبح کے پرندے", "عصافير الصباح", "Morning birds"),
        "NIGHTINGALE" to arrayOf("بلبل (نائٹنگیل)", "العندليب", "Nightingale"),
        "BLACKBIRD" to arrayOf("کالی چڑیا (بلیک برڈ)", "الشحرور", "Blackbird"),
        "ROBIN" to arrayOf("رابن", "أبو الحناء", "Robin"),
        "SKYLARK" to arrayOf("چنڈول (اسکائی لارک)", "القبّرة", "Skylark"),
        "WREN" to arrayOf("ممولا (رین)", "النمنمة", "Wren"),
        "CHORUS" to arrayOf("سحر کے وقت پرندوں کا نغمہ", "تغريد الطيور عند الفجر", "Dawn chorus"),
        "TONE" to arrayOf("فون کا الارم", "منبّه الهاتف", "Phone alarm tone"),
        "NOTIFY" to arrayOf("اطلاع کی آواز", "صوت الإشعار", "Notification sound"),
        "SILENT" to arrayOf("خاموش", "صامت", "Silent"),
        // settings
        "language" to arrayOf("زبان", "اللغة", "Language"),
        "location" to arrayOf("مقام", "الموقع", "Location"), "changeCity" to arrayOf("شہر بدلیں", "غيّر المدينة", "Change city"),
        "useGps" to arrayOf("فون کے GPS سے مقام لیں", "تحديد الموقع بـ GPS", "Use the phone's location"),
        "country" to arrayOf("ملک", "الدولة", "Country"), "city" to arrayOf("شہر", "المدينة", "City"),
        "search" to arrayOf("تلاش", "بحث", "Search"),
        "school" to arrayOf("فقہی مسلک (عصر کا وقت)", "المذهب (وقت العصر)", "School (Asr time)"),
        "hanafi" to arrayOf("حنفی", "حنفي", "Hanafi"),
        "shafii" to arrayOf("شافعی/مالکی/حنبلی/سلفی", "شافعي/مالكي/حنبلي/سلفي", "Shafi'i/Maliki/Hanbali/Salafi"),
        "method" to arrayOf("فجر و عشاء کا حساب", "طريقة حساب الفجر والعشاء", "Fajr and Isha calculation"),
        "mAuto" to arrayOf("ملک کے مطابق", "حسب الدولة", "As in the country"),
        "mwl" to arrayOf("رابطہ عالم اسلامی (18°، 17°)", "رابطة العالم الإسلامي (18°، 17°)", "Muslim World League (18°, 17°)"),
        "isna" to arrayOf("شمالی امریکہ ISNA (15°، 15°)", "أمريكا الشمالية ISNA (15°، 15°)", "North America ISNA (15°, 15°)"),
        "karachi" to arrayOf("جامعہ علوم اسلامیہ کراچی (18°، 18°)", "جامعة العلوم الإسلامية بكراتشي (18°، 18°)", "Karachi (18°, 18°)"),
        "makkah" to arrayOf("ام القریٰ، مکہ (18.5°، مغرب کے 90 منٹ بعد)", "أم القرى، مكة (18.5°، 90 دقيقة بعد المغرب)", "Umm al-Qura, Makkah (18.5°, 90 min)"),
        "egypt" to arrayOf("مصر (19.5°، 17.5°)", "الهيئة المصرية (19.5°، 17.5°)", "Egypt (19.5°, 17.5°)"),
        "gulf" to arrayOf("خلیجی ممالک (19.5°، 90 منٹ)", "دول الخليج (19.5°، 90 دقيقة)", "Gulf (19.5°, 90 min)"),
        "kuwait" to arrayOf("کویت (18°، 17.5°)", "الكويت (18°، 17.5°)", "Kuwait (18°, 17.5°)"),
        "qatar" to arrayOf("قطر (18°، 90 منٹ)", "قطر (18°، 90 دقيقة)", "Qatar (18°, 90 min)"),
        "singapore" to arrayOf("سنگاپور، ملائیشیا، انڈونیشیا (20°، 18°)", "سنغافورة وماليزيا وإندونيسيا (20°، 18°)", "Singapore, Malaysia, Indonesia (20°, 18°)"),
        "turkey" to arrayOf("ترکی (18°، 17°)", "تركيا (18°، 17°)", "Turkey (18°, 17°)"),
        "france" to arrayOf("فرانس (12°، 12°)", "فرنسا (12°، 12°)", "France (12°, 12°)"),
        "russia" to arrayOf("روس (16°، 15°)", "روسيا (16°، 15°)", "Russia (16°, 15°)"),
        "adjust" to arrayOf("اوقات میں کمی بیشی (منٹ)", "تعديل المواقيت (دقائق)", "Adjust times (minutes)"),
        "naflTimes" to arrayOf("نوافل کے اوقات", "أوقات النوافل", "Voluntary prayer times"),
        "ishraqAfter" to arrayOf("اشراق: طلوع کے بعد (منٹ)", "الإشراق: بعد الشروق (دقائق)", "Ishraq: after sunrise (min)"),
        "chashtAfter" to arrayOf("چاشت: طلوع کے بعد (منٹ)", "الضحى: بعد الشروق (دقائق)", "Duha: after sunrise (min)"),
        "zawalBefore" to arrayOf("زوال: ظہر سے پہلے (منٹ)", "الزوال: قبل الظهر (دقائق)", "Zawal: before Dhuhr (min)"),
        "hijriAdj" to arrayOf("ہجری تاریخ درست کریں (دن)", "تصحيح التاريخ الهجري (أيام)", "Correct the hijri date (days)"),
        "dst" to arrayOf("ڈے لائٹ سیونگ", "التوقيت الصيفي", "Daylight saving"),
        "dstAuto" to arrayOf("ملک کے مطابق خودکار", "تلقائي حسب الدولة", "Automatic (country's rules)"),
        "dstOn" to arrayOf("ہمیشہ ایک گھنٹہ آگے", "دائمًا ساعة إضافية", "Always +1 hour"),
        "dstOff" to arrayOf("بند", "معطّل", "Off"),
        "h24" to arrayOf("24 گھنٹے والا وقت", "نظام 24 ساعة", "24-hour clock"),
        "vibMode" to arrayOf("نماز کے وقت فون خود بخود وائبریشن پر", "الهاتف على الاهتزاز وقت الصلاة", "Phone on vibrate at prayer time"),
        "vibMin" to arrayOf("وائبریشن کی مدت (منٹ)", "مدة الاهتزاز (دقائق)", "Vibrate for (minutes)"),
        "vibNeed" to arrayOf("اس کے لیے «Do Not Disturb» کی اجازت دیں", "اسمح بإذن «عدم الإزعاج»", "Allow «Do Not Disturb» access for this"),
        "allow" to arrayOf("اجازت دیں", "اسمح", "Allow"),
        "permNotif" to arrayOf("الارم اور اذان کے لیے اطلاعات کی اجازت ضروری ہے", "يلزم إذن الإشعارات للأذان والمنبّه", "Notifications are needed for the adhan and alarms"),
        "permAlarm" to arrayOf("وقت پر الارم کے لیے «Alarms & reminders» کی اجازت دیں", "اسمح بـ«المنبهات والتذكيرات» ليصدح في وقته", "Allow «Alarms & reminders» so alarms ring on time"),
        "permBattery" to arrayOf("بیٹری کی پابندی ہٹائیں تاکہ اذان کبھی نہ رکے", "ألغِ قيود البطارية حتى لا يتوقف الأذان", "Remove battery limits so the adhan is never stopped"),
        "credits" to arrayOf("ماخذ و اجازت", "المصادر والتراخيص", "Sources and licences"),
        "test" to arrayOf("سن کر دیکھیں", "استمع", "Listen"), "stop" to arrayOf("بند کریں", "إيقاف", "Stop"),
        "welcome" to arrayOf("خوش آمدید — اپنا ملک اور شہر چنیں", "مرحبًا — اختر دولتك ومدينتك", "Welcome — choose your country and city"),
        "done" to arrayOf("ٹھیک ہے", "تم", "Done"),
        "accept" to arrayOf("ان شاء اللہ، روزہ رکھوں گا", "إن شاء الله سأصوم", "In sha Allah, I will fast"),
        "decline" to arrayOf("اس بار نہیں", "ليس هذه المرة", "Not this time"),
        "beedAsk" to arrayOf("کل سے ایامِ بیض (13، 14، 15) کے روزے ہیں", "غدًا تبدأ الأيام البيض (13، 14، 15)", "The white days (13th–15th) begin tomorrow"),
        "iftarDua" to arrayOf("ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ", "ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ"),
        "iftarDuaSrc" to arrayOf("افطار کے وقت کی دعا (سنن ابی داود 2357)", "دعاء الإفطار (سنن أبي داود 2357)", "Du'a at iftar (Sunan Abi Dawud 2357)"),
        "iftarIn" to arrayOf("افطار میں باقی", "باقٍ على الإفطار", "Iftar in"),
        "duaTime" to arrayOf("افطار قریب ہے — دعا کا وقت", "اقترب الإفطار — وقت الدعاء", "Iftar is near — time for du'a"),
        "suhoorTitle" to arrayOf("سحری کا وقت", "وقت السحور", "Time for suhoor"),
        "suhoorEnds" to arrayOf("سحری ختم (فجر):", "ينتهي السحور (الفجر):", "Suhoor ends (Fajr):"),
        "qiblaHint" to arrayOf("فون کو سیدھا رکھیں اور 8 کی شکل میں گھمائیں تاکہ قطب نما درست ہو", "ضع الهاتف مستويًا وحرّكه على شكل 8 لمعايرة البوصلة", "Hold the phone flat and move it in a figure 8 to calibrate"),
        "qiblaOn" to arrayOf("آپ قبلہ رخ ہیں", "أنت باتجاه القبلة", "You are facing the Qibla"),
        "qiblaDeg" to arrayOf("قبلہ کی سمت", "اتجاه القبلة", "Qibla direction"),
        "fromNorth" to arrayOf("شمال سے", "من الشمال", "from north"),
        "distance" to arrayOf("مکہ سے فاصلہ", "المسافة إلى مكة", "Distance to Makkah"),
        "km" to arrayOf("کلومیٹر", "كم", "km"),
        "noCompass" to arrayOf("اس فون میں قطب نما (سینسر) نہیں ہے", "لا توجد بوصلة في هذا الهاتف", "This phone has no compass sensor"),
        "accLow" to arrayOf("قطب نما کمزور ہے — فون کو 8 کی شکل میں گھمائیں", "دقة البوصلة ضعيفة — حرّك الهاتف على شكل 8", "Compass accuracy is low — move the phone in a figure 8"),
        "today" to arrayOf("آج", "اليوم", "Today"),
        "ramadan" to arrayOf("رمضان", "رمضان", "Ramadan"), "eid" to arrayOf("عید", "عيد", "Eid"),
        "arafah" to arrayOf("یومِ عرفہ", "يوم عرفة", "Day of Arafah"), "ashura" to arrayOf("عاشوراء (9، 10 محرم)", "عاشوراء (9، 10 محرم)", "Ashura (9th, 10th Muharram)"),
        "whiteDays" to arrayOf("ایامِ بیض", "الأيام البيض", "White days"),
        "hijriChange" to arrayOf("ہجری تاریخ مغرب کے ساتھ بدلتی ہے", "يتغيّر التاريخ الهجري عند المغرب", "The hijri date changes at Maghrib"),
        "vibOn" to arrayOf("فون وائبریشن پر ہے", "الهاتف على الاهتزاز", "Phone is on vibrate"),
        "until2" to arrayOf("تک", "حتى", "until"),
        "widgetNext" to arrayOf("اگلی:", "القادمة:", "Next:"),
        "remTitle" to arrayOf("یاد دہانی", "تذكير", "Reminder"),
        "naflRem" to arrayOf("نوافل کا وقت شروع", "دخل وقت النافلة", "Voluntary prayer time has begun"),
        "prayerTime" to arrayOf("نماز کا وقت ہو گیا", "حان وقت الصلاة", "It is time for prayer"),
    )

    val MONTHS_H = mapOf(
        "ur" to listOf("محرم", "صفر", "ربیع الاول", "ربیع الثانی", "جمادی الاولیٰ", "جمادی الآخرہ", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"),
        "ar" to listOf("محرّم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوّال", "ذو القعدة", "ذو الحجة"),
        "en" to listOf("Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Akhir", "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'dah", "Dhu al-Hijjah"))

    operator fun get(k: String): String {
        val a = W[k] ?: return k
        return a[when (lang) { "ar" -> 1; "en" -> 2; else -> 0 }]
    }

    fun p(p: P) = get(p.name)

    /** name of a sound: an adhan, or a short call with its muezzin, or a bird */
    fun snd(s: Snd): String = when {
        s.phrase != null -> get(s.phrase) + " — " + get(s.mu!!.name)
        else -> get(s.name)
    }
    fun hijriMonth(m: Int) = MONTHS_H[lang]!![m - 1]
    fun hijri(h: Hijri) = num(h.day) + " " + hijriMonth(h.month) + " " + num(h.year) + when (lang) { "en" -> " AH"; "ar" -> " هـ"; else -> " ھ" }

    /** numbers: Arabic-Indic digits in the Arabic screens, European digits elsewhere (as most phones show) */
    fun num(n: Int): String = num(n.toString())
    fun num(s: String): String = if (lang == "ar") s.map { if (it in '0'..'9') '٠' + (it - '0') else it }.joinToString("") else s
}
