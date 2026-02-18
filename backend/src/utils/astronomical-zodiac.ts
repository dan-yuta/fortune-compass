// Astronomical zodiac calculation based on sun's ecliptic longitude

/**
 * Calculate the sun's ecliptic longitude for a given date.
 * Uses simplified astronomical formula (mean sun + equation of center).
 */
export function getSunLongitude(date: Date): number {
  // Days since J2000.0 (2000-01-01 12:00 TT)
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;

  // Mean longitude (degrees)
  const L = (280.46646 + 0.9856474 * n) % 360;
  // Mean anomaly (degrees)
  const M = (357.52911 + 0.9856003 * n) % 360;
  const Mrad = (M * Math.PI) / 180;

  // Equation of center
  const C =
    1.9146 * Math.sin(Mrad) +
    0.02 * Math.sin(2 * Mrad) +
    0.0003 * Math.sin(3 * Mrad);

  let sunLong = (L + C) % 360;
  if (sunLong < 0) sunLong += 360;
  return sunLong;
}

interface AstronomicalSignInfo {
  sign: string;
  signEn: string;
  startLongitude: number;
}

const ASTRONOMICAL_SIGNS: AstronomicalSignInfo[] = [
  { sign: '牡羊座', signEn: 'aries', startLongitude: 0 },
  { sign: '牡牛座', signEn: 'taurus', startLongitude: 30 },
  { sign: '双子座', signEn: 'gemini', startLongitude: 60 },
  { sign: '蟹座', signEn: 'cancer', startLongitude: 90 },
  { sign: '獅子座', signEn: 'leo', startLongitude: 120 },
  { sign: '乙女座', signEn: 'virgo', startLongitude: 150 },
  { sign: '天秤座', signEn: 'libra', startLongitude: 180 },
  { sign: '蠍座', signEn: 'scorpio', startLongitude: 210 },
  { sign: '射手座', signEn: 'sagittarius', startLongitude: 240 },
  { sign: '山羊座', signEn: 'capricorn', startLongitude: 270 },
  { sign: '水瓶座', signEn: 'aquarius', startLongitude: 300 },
  { sign: '魚座', signEn: 'pisces', startLongitude: 330 },
];

/**
 * Get the astronomical zodiac sign based on sun's ecliptic longitude.
 * Returns { sign, signEn } based on which 30-degree segment the sun is in.
 */
export function getAstronomicalSign(date: Date): { sign: string; signEn: string } {
  const longitude = getSunLongitude(date);

  // Find which sign the sun longitude falls in
  for (let i = ASTRONOMICAL_SIGNS.length - 1; i >= 0; i--) {
    if (longitude >= ASTRONOMICAL_SIGNS[i].startLongitude) {
      return {
        sign: ASTRONOMICAL_SIGNS[i].sign,
        signEn: ASTRONOMICAL_SIGNS[i].signEn,
      };
    }
  }

  // Fallback (should not happen)
  return { sign: ASTRONOMICAL_SIGNS[0].sign, signEn: ASTRONOMICAL_SIGNS[0].signEn };
}
