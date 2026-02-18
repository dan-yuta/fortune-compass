export interface MoonPhaseInfo {
  age: number;
  phase: string;
  phaseEn: string;
  illumination: number;
}

// Known new moon: 2000-01-06T18:14Z
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
const SYNODIC_MONTH = 29.53059; // days

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const diffMs = date.getTime() - KNOWN_NEW_MOON;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Illumination approximation (0-1)
  const illumination = (1 - Math.cos((2 * Math.PI * age) / SYNODIC_MONTH)) / 2;

  // 8 phases
  const phaseIndex = Math.floor((age / SYNODIC_MONTH) * 8) % 8;
  const phases: { phase: string; phaseEn: string }[] = [
    { phase: '新月', phaseEn: 'new_moon' },
    { phase: '三日月', phaseEn: 'waxing_crescent' },
    { phase: '上弦', phaseEn: 'first_quarter' },
    { phase: '十三夜', phaseEn: 'waxing_gibbous' },
    { phase: '満月', phaseEn: 'full_moon' },
    { phase: '十六夜', phaseEn: 'waning_gibbous' },
    { phase: '下弦', phaseEn: 'last_quarter' },
    { phase: '晦日月', phaseEn: 'waning_crescent' },
  ];

  return {
    age: Math.round(age * 100) / 100,
    phase: phases[phaseIndex].phase,
    phaseEn: phases[phaseIndex].phaseEn,
    illumination: Math.round(illumination * 100) / 100,
  };
}
