// The signed pledge as a document: used for the e-mail, the principal's screen and the owner's proof list. All user text is escaped.
import {TERMS, PLEDGE, TERMS_V} from './terms.js';
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const UD = n => String(n).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
export const dateUr = ts => { const d = new Date(ts); return UD(d.getUTCDate()) + ' ' + MONTHS[d.getUTCMonth()] + ' ' + UD(d.getUTCFullYear()); };
export const serialOf = (iid, ts) => 'HD-' + new Date(ts).getUTCFullYear() + '-' + String(iid).padStart(5, '0');
const FONT = "font-family:'Noto Nastaliq Urdu','Jameel Noori Nastaleeq','Noto Naskh Arabic',Tahoma,serif";
export function pledgeDoc(p, base) {
  const logo = (base || 'https://turathkhairalquroon.com') + '/icon-192.png';
  const li = TERMS.map((t, i) => '<tr><td style="vertical-align:top;padding:4px 0 4px 8px;width:2.2em;color:#0a5c4b">(' + UD(i + 1) + ')-</td><td style="padding:4px 0;line-height:2.1">' + esc(t) + '</td></tr>').join('');
  return '<div dir="rtl" style="' + FONT + ';max-width:680px;margin:0 auto;background:#fff;color:#1c2733;border:2px solid #0a5c4b;border-radius:10px;padding:22px 24px;font-size:16px">' +
    '<table role="presentation" width="100%" style="border-collapse:collapse"><tr><td style="text-align:right;font-size:14px">سیریل نمبر: <b dir="ltr" style="font-family:Arial,sans-serif">' + esc(p.serial) + '</b></td><td style="text-align:left;font-size:14px">تاریخ: ' + dateUr(p.ts) + '</td></tr></table>' +
    '<div style="text-align:center;margin:10px 0"><img src="' + logo + '" width="84" height="84" alt="تراث خیرالقرون" style="border-radius:16px"></div>' +
    '<div style="text-align:center;font-size:22px;line-height:2.2;margin-bottom:6px">بسم اللہ الرحمن الرحیم</div>' +
    '<div style="text-align:center;font-size:19px;font-weight:bold;color:#0a5c4b;margin:4px 0 12px">حفظ ڈائری — شرائط و ضوابط اور اقرار نامہ</div>' +
    '<table role="presentation" width="100%" style="border-collapse:collapse">' + li + '</table>' +
    '<div style="border:1px solid #0a5c4b;border-radius:8px;padding:10px 14px;margin:16px 0;line-height:2.2;background:#f3faf7"><b>اقرار نامہ</b><br>' + PLEDGE[0] + ' <b>' + esc(p.signer) + '</b> ' + PLEDGE[1] + ' <b>' + esc(p.inst_name) + '</b> ' + PLEDGE[2] +
    '<br><span style="font-size:14px">تصدیق شدہ ای میل: <b dir="ltr" style="font-family:Arial,sans-serif">' + esc(p.email) + '</b> — حفظ کے بچوں کی تعداد: <b>' + UD(p.kids) + '</b></span></div>' +
    '<div style="text-align:center;line-height:2.1;margin-top:14px;border-top:1px solid #cfd8d4;padding-top:10px"><b>منجانب: انتظامیہ تراث خیرالقرون</b><br>بانی: ابو حسن میاں سعید عفی اللہ عنہ</div></div>';
}
export const pledgeMailHtml = (p, base) => '<!doctype html><html lang="ur" dir="rtl"><body style="margin:0;padding:14px;background:#eef2f1">' + pledgeDoc(p, base) + '<p dir="rtl" style="text-align:center;color:#667;font-size:13px;font-family:Tahoma,sans-serif">یہ اقرار نامہ آپ کے ادارے کے ریکارڈ کے ساتھ محفوظ ہے۔ اسے ڈائری کے اندر «اقرار نامہ» سے بھی دیکھا اور چھاپا جا سکتا ہے۔</p></body></html>';
export {TERMS_V};
