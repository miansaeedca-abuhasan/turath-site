# English names for library books whose registry "en" was still the Arabic title (owner 25-11-2026)
import re,json,sys
EN={
'sh11236':"Questions of Abu Ubayd al-Ajurri to Abu Dawud as-Sijistani",
'sh5945':"Questions of Abu Dawud to Imam Ahmad",
'sh25873':"Questions of al-Athram to Ahmad ibn Hanbal",
'sh148':"Tarikh Ibn Ma‘in (narration of ad-Darimi)",
'sh5954':"Sayings of Ibn Ma‘in on the Narrators",
'sh9294':"Part Two of the Hadith of Ibn Ma‘in (narration of al-Marwazi)",
'sh11037':"Hadith of Ibn Ma‘in (narration of Abu Mansur ash-Shaybani)",
'sh101':"Tarikh Ibn Ma‘in (narration of Ibn Muhriz)",
'sh5947':"Questions of Ibn Abi Shaybah to Ibn al-Madini",
'sh810':"Questions of al-Barda‘i to Abu Zur‘ah ar-Razi (ed. al-Hashimi)",
'sh812':"Questions of al-Barda‘i to Abu Zur‘ah ar-Razi (ed. al-Azhari)",
'sh26':"Brothers and Sisters (Ad-Daraqutni)",
'sh597':"Names of the Companions on Whom Bukhari and Muslim Agree (Ad-Daraqutni)",
'sh1518':"Hadith of the Muwatta and the Agreement and Disagreement of Malik's Narrators (Ad-Daraqutni)",
'sh5651':"Hadith in Which Malik ibn Anas Was Contradicted (Ad-Daraqutni)",
'sh5881':"Names of the Tabi‘in and Those After Them Whose Narration From the Reliable Is Sound (Ad-Daraqutni)",
'sh5950':"Questions of al-Hakim to ad-Daraqutni",
'sh10843':"Comments of ad-Daraqutni on al-Majruhin of Ibn Hibban",
'sh13038':"Attributes (Ad-Daraqutni, ed. al-Ghunayman)",
'sh13074':"The Descent (Ad-Daraqutni)",
'sh21474':"Al-Ilzamat wa-t-Tatabbu‘ (Ad-Daraqutni)",
'sh21794':"Seeing Allah (Ad-Daraqutni)",
'sh26441':"Forty Hadith from the Musnad of Buraydah (Ad-Daraqutni)",
'sh30259':"Al-Afrad (Ad-Daraqutni)",
'sh8338':"The Eighty-Third of the Fawa’id al-Afrad (Ad-Daraqutni)",
'sh11331':"Attributes (Ad-Daraqutni, ed. al-Faqihi)",
'sh12581':"Al-Mu’talif wa-l-Mukhtalif (Ad-Daraqutni)",
'sh535':"Questions of as-Sijzi to al-Hakim",
'sh1680':"Questions of as-Sulami to ad-Daraqutni",
'sh1060':"Questions of al-Barqani to ad-Daraqutni (ed. Majdi as-Sayyid)",
'sh11237':"Questions of al-Barqani to ad-Daraqutni (ed. al-Qashqari)",
'sh2491':"Questions of Hamzah to ad-Daraqutni",
'sh26876':"Selected Anecdotes and Questions (Ibn Tahir al-Maqdisi)",
'sh26209':"Questions of as-Silafi to Khamis al-Hawzi",
'sh14242':"Al-Kanz ath-Thamin on the Questions of Ibn Sunayd (Ibn Uthaymin)",
'sh2754':"Questions of at-Tirmidhi to al-Bukhari on Hadith in Jami at-Tirmidhi",
}
if __name__=='__main__':
    for p in ['coll/index.js','offline.json']:
        s=open(p,encoding='utf-8').read();n=0
        for k,e in EN.items():
            if p.endswith('.js'):
                pat=re.compile(r'("key":"%s","ar":"[^"]*","ur":"[^"]*","en":")[^"]*(")'%k)
            else:
                pat=re.compile(r'("id":"c_%s","k":"books","n":\{"ur":"[^"]*","en":")[^"]*(")'%k)
            s,c=pat.subn(lambda m:m.group(1)+e+m.group(2),s);n+=c
        open(p,'w',encoding='utf-8').write(s);print(p,n)
