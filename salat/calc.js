/* Prayer times from the position of the sun (the method of praytimes.org), the same calculation as the Android app. */
const PC = (() => {
  const METHODS = {
    mwl: [18, 17, 0], isna: [15, 15, 0], karachi: [18, 18, 0], makkah: [18.5, 0, 90], egypt: [19.5, 17.5, 0], gulf: [19.5, 0, 90],
    kuwait: [18, 17.5, 0], qatar: [18, 0, 90], singapore: [20, 18, 0], turkey: [18, 17, 0], france: [12, 12, 0], russia: [16, 15, 0]
  };
  const defaultMethod = c => {
    c = (c || '').toUpperCase();
    if (['SA', 'YE'].includes(c)) return 'makkah'; if (['AE', 'OM', 'BH'].includes(c)) return 'gulf'; if (c === 'KW') return 'kuwait'; if (c === 'QA') return 'qatar';
    if (['EG', 'SD', 'LY', 'SY', 'LB', 'JO', 'PS', 'IQ'].includes(c)) return 'egypt'; if (['PK', 'IN', 'BD', 'AF', 'NP', 'LK'].includes(c)) return 'karachi';
    if (['US', 'CA', 'MX'].includes(c)) return 'isna'; if (['MY', 'SG', 'ID', 'BN'].includes(c)) return 'singapore'; if (c === 'TR') return 'turkey';
    if (c === 'FR') return 'france'; if (c === 'RU') return 'russia'; return 'mwl';
  };
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI, mod = (a, n) => ((a % n) + n) % n;
  function julian(y, m, d) {
    if (m <= 2) { y -= 1; m += 12 }
    const a = Math.floor(y / 100), b = 2 - a + Math.floor(a / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
  }
  function sun(jd) {
    const d = jd - 2451545.0, g = mod(357.529 + 0.98560028 * d, 360), q = mod(280.459 + 0.98564736 * d, 360);
    const l = mod(q + 1.915 * Math.sin(rad(g)) + 0.020 * Math.sin(rad(2 * g)), 360), e = 23.439 - 0.00000036 * d;
    const ra = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(l)), Math.cos(rad(l)))) / 15;
    const decl = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(l))));
    let eqt = q / 15 - mod(ra, 24); eqt = mod(eqt + 12, 24) - 12;
    return [decl, eqt];
  }
  /** hours of local clock time for each prayer; tz = offset from UTC in hours on that day */
  function compute(y, m, d, lat, lng, tz, method, asrFactor) {
    const [fajrA, ishaA, ishaMin] = METHODS[method] || METHODS.mwl;
    const jd = julian(y, m, d) - lng / 360;
    const noon = t => mod(12 - sun(jd + t / 24)[1], 24);
    const angleTime = (angle, t, before) => {
      const decl = sun(jd + t / 24)[0];
      const x = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
      if (x > 1 || x < -1) return NaN;
      const h = deg(Math.acos(x)) / 15;
      return noon(t) + (before ? -h : h);
    };
    const asrTime = t => { const decl = sun(jd + t / 24)[0]; const a = -deg(Math.atan(1 / (asrFactor + Math.tan(rad(Math.abs(lat - decl)))))); return angleTime(a, t, false); };
    let fa = 5, sr = 6, dh = 12, asr = 13, ss = 18, ish = 18;
    for (let i = 0; i < 2; i++) {
      fa = angleTime(fajrA, isNaN(fa) ? 5 : fa, true); sr = angleTime(0.833, isNaN(sr) ? 6 : sr, true); dh = noon(dh);
      asr = asrTime(isNaN(asr) ? 13 : asr); ss = angleTime(0.833, isNaN(ss) ? 18 : ss, false);
      ish = ishaMin > 0 ? NaN : angleTime(ishaA, isNaN(ish) ? 18 : ish, false);
    }
    const off = tz - lng / 15;
    fa += off; sr += off; dh += off; asr += off; ss += off;
    ish = ishaMin > 0 ? ss + ishaMin / 60 : ish + off;
    const night = 24 - (ss - sr);
    if (!isNaN(sr) && !isNaN(ss)) {
      const fp = fajrA / 60 * night; if (isNaN(fa) || sr - fa > fp) fa = sr - fp;
      if (ishaMin === 0) { const ip = ishaA / 60 * night; if (isNaN(ish) || ish - ss > ip) ish = ss + ip; }
    }
    return { fajr: fa, sunrise: sr, dhuhr: dh, asr, maghrib: ss, isha: ish };
  }
  /** the direction of the Kaaba in degrees from north */
  function qibla(lat, lng) {
    const k = [rad(21.4225), rad(39.8262)], p = rad(lat), dl = k[1] - rad(lng);
    return mod(deg(Math.atan2(Math.sin(dl), Math.cos(p) * Math.tan(k[0]) - Math.sin(p) * Math.cos(dl))), 360);
  }
  function distanceKm(lat, lng) {
    const k = [rad(21.4225), rad(39.8262)], p = rad(lat), dl = k[1] - rad(lng);
    return 6371 * Math.acos(Math.min(1, Math.sin(p) * Math.sin(k[0]) + Math.cos(p) * Math.cos(k[0]) * Math.cos(dl)));
  }
  return { METHODS, defaultMethod, compute, qibla, distanceKm };
})();
if (typeof module !== 'undefined') module.exports = PC;
