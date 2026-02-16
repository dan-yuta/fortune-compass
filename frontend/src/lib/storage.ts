import { UserProfile } from "./types";

const STORAGE_KEY = "fortune-compass-profile";

// Cached snapshot for useSyncExternalStore (avoids Object.is identity issues)
let _cachedRaw: string | null | undefined = undefined;
let _cachedProfile: UserProfile | null = null;

export function getProfileSnapshot(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw !== _cachedRaw) {
    _cachedRaw = raw;
    try {
      _cachedProfile = raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      _cachedProfile = null;
    }
  }
  return _cachedProfile;
}

export function getHasProfileSnapshot(): boolean {
  const p = getProfileSnapshot();
  return !!(p && p.name && p.birthday);
}

export function subscribeStorage(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function invalidateCache(): void {
  _cachedRaw = undefined;
  _cachedProfile = null;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    invalidateCache();
  } catch (error) {
    console.error("Failed to save profile to localStorage:", error);
  }
}

export function loadProfile(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as UserProfile;
  } catch (error) {
    console.error("Failed to load profile from localStorage:", error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal errors
    }
    return null;
  }
}

export function hasProfile(): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    const profile = JSON.parse(data) as UserProfile;
    return !!(profile.name && profile.birthday);
  } catch {
    return false;
  }
}
