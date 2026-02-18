// Approximate solar longitude calculation for solar terms
// Solar term dates are based on the sun's ecliptic longitude

function getSunLongitudeForDate(date: Date): number {
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

  // Sun's ecliptic longitude
  let sunLong = (L + C) % 360;
  if (sunLong < 0) sunLong += 360;
  return sunLong;
}

/**
 * Get the approximate date of a solar term for a given year.
 * termIndex: 0-23, where 0 = Spring Begins (Lichun, ~315 degrees)
 * Solar term longitudes: Lichun=315, Yushui=330, ..., Dahan=300
 */
export function getSolarTermDate(year: number, termIndex: number): Date {
  // Each solar term corresponds to a 15-degree increment of solar longitude
  // Lichun (termIndex=0) = 315 degrees
  const targetLongitude = (315 + termIndex * 15) % 360;

  // Start search around expected date
  // Lichun is around Feb 4, so termIndex=0 -> ~Feb 4
  const baseMonth = ((termIndex * 15.2) + 35) / 30; // rough month estimate
  const searchStart = new Date(Date.UTC(year, Math.floor(baseMonth) - 1, 1));

  let date = new Date(searchStart);
  let prevDiff = 999;

  // Binary search for the date
  let lo = new Date(Date.UTC(year - 1, 11, 1)).getTime();
  let hi = new Date(Date.UTC(year + 1, 1, 1)).getTime();

  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    date = new Date(mid);
    const sunLong = getSunLongitudeForDate(date);

    let diff = targetLongitude - sunLong;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.001) break;

    if (diff > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
    prevDiff = diff;
  }

  return date;
}

/**
 * Get the Lichun (Start of Spring) date for a given year.
 * Lichun is typically around February 3-5.
 */
export function getLiChunDate(year: number): Date {
  return getSolarTermDate(year, 0);
}

/**
 * Get the year for Kyusei calculation, accounting for Lichun boundary.
 * If birthday is before Lichun of the birth year, use the previous year.
 */
export function getKyuseiYear(birthday: Date): number {
  const year = birthday.getUTCFullYear();
  const lichun = getLiChunDate(year);

  // Compare just the dates (ignore time)
  const birthdayTime = Date.UTC(year, birthday.getUTCMonth(), birthday.getUTCDate());
  const lichunTime = Date.UTC(year, lichun.getUTCMonth(), lichun.getUTCDate());

  if (birthdayTime < lichunTime) {
    return year - 1;
  }
  return year;
}

/**
 * Get the year for Fengshui calculation, same logic as Kyusei.
 */
export function getFengshuiYear(birthday: Date): number {
  return getKyuseiYear(birthday);
}
