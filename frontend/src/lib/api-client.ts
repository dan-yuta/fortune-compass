import {
  UserProfile,
  ZodiacResult,
  NumerologyResult,
  BloodTypeResult,
  TarotResult,
  DashboardResult,
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
