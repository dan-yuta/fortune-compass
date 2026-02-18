import {
  UserProfile,
  ZodiacResult,
  NumerologyResult,
  BloodTypeResult,
  TarotResult,
  DashboardResult,
  EtoResult,
  BirthFlowerResult,
  BirthstoneResult,
  WeekdayResult,
  KyuseiResult,
  AnimalResult,
  ShichuuResult,
  OmikujiResult,
  RuneResult,
  FengshuiResult,
  DreamResult,
  PalmResult,
  CompatibilityResult,
  TrendsResult,
  AiReadingResult,
} from "./types";

async function postFortune<T>(
  type: string,
  body: Record<string, unknown>
): Promise<T> {
  const response = await fetch(`/api/fortune/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Fortune API error (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

export async function fetchZodiacFortune(
  profile: UserProfile
): Promise<ZodiacResult> {
  return postFortune<ZodiacResult>("zodiac", {
    birthday: profile.birthday,
  });
}

export async function fetchNumerologyFortune(
  profile: UserProfile
): Promise<NumerologyResult> {
  return postFortune<NumerologyResult>("numerology", {
    birthday: profile.birthday,
    name: profile.nameRomaji,
  });
}

export async function fetchBloodTypeFortune(
  profile: UserProfile
): Promise<BloodTypeResult> {
  return postFortune<BloodTypeResult>("blood-type", {
    bloodType: profile.bloodType,
  });
}

export async function fetchTarotFortune(
  _profile: UserProfile
): Promise<TarotResult> {
  return postFortune<TarotResult>("tarot", {});
}

export async function fetchDashboardFortune(
  profile: UserProfile
): Promise<DashboardResult> {
  return postFortune<DashboardResult>("dashboard", {
    birthday: profile.birthday,
    name: profile.nameRomaji,
    bloodType: profile.bloodType,
  });
}

export async function fetchEtoFortune(
  profile: UserProfile
): Promise<EtoResult> {
  return postFortune<EtoResult>("eto", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchBirthFlowerFortune(
  profile: UserProfile
): Promise<BirthFlowerResult> {
  return postFortune<BirthFlowerResult>("birth-flower", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchBirthstoneFortune(
  profile: UserProfile
): Promise<BirthstoneResult> {
  return postFortune<BirthstoneResult>("birthstone", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchWeekdayFortune(
  profile: UserProfile
): Promise<WeekdayResult> {
  return postFortune<WeekdayResult>("weekday", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchKyuseiFortune(
  profile: UserProfile
): Promise<KyuseiResult> {
  return postFortune<KyuseiResult>("kyusei", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchAnimalFortune(
  profile: UserProfile
): Promise<AnimalResult> {
  return postFortune<AnimalResult>("animal", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchShichuuFortune(
  profile: UserProfile
): Promise<ShichuuResult> {
  return postFortune<ShichuuResult>("shichuu", {
    birthday: profile.birthday,
    name: profile.name,
    birthTime: profile.birthTime,
  });
}

export async function fetchOmikujiFortune(
  profile: UserProfile
): Promise<OmikujiResult> {
  return postFortune<OmikujiResult>("omikuji", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchRuneFortune(
  profile: UserProfile
): Promise<RuneResult> {
  return postFortune<RuneResult>("rune", {
    birthday: profile.birthday,
    name: profile.name,
  });
}

export async function fetchFengshuiFortune(
  profile: UserProfile,
  gender?: "male" | "female"
): Promise<FengshuiResult> {
  return postFortune<FengshuiResult>("fengshui", {
    birthday: profile.birthday,
    name: profile.name,
    gender: gender || profile.gender || "male",
  });
}

export async function fetchDreamFortune(
  keyword: string
): Promise<DreamResult> {
  return postFortune<DreamResult>("dream", {
    keyword,
  });
}

export async function fetchPalmFortune(
  image: string
): Promise<PalmResult> {
  return postFortune<PalmResult>("palm", {
    image,
  });
}

export async function fetchCompatibilityFortune(
  birthday1: string,
  birthday2: string,
  name1?: string,
  name2?: string,
  bloodType1?: string,
  bloodType2?: string,
): Promise<CompatibilityResult> {
  return postFortune<CompatibilityResult>("compatibility", {
    birthday1,
    birthday2,
    name1,
    name2,
    bloodType1,
    bloodType2,
  });
}

export async function fetchTrendsFortune(
  profile: UserProfile
): Promise<TrendsResult> {
  return postFortune<TrendsResult>("trends", {
    birthday: profile.birthday,
    name: profile.nameRomaji,
    bloodType: profile.bloodType,
  });
}

export async function fetchAiReadingFortune(
  profile: UserProfile
): Promise<AiReadingResult> {
  return postFortune<AiReadingResult>("ai-reading", {
    birthday: profile.birthday,
    name: profile.nameRomaji,
    bloodType: profile.bloodType,
    birthTime: profile.birthTime,
    gender: profile.gender,
  });
}
