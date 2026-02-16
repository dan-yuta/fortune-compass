"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loadProfile, hasProfile } from "@/lib/storage";
import { UserProfile } from "@/lib/types";

interface UseFortuneOptions<T> {
  fetcher: (profile: UserProfile) => Promise<T>;
  requireBloodType?: boolean;
}

interface UseFortuneResult<T> {
  profile: UserProfile | null;
  result: T | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useFortune<T>({ fetcher, requireBloodType = false }: UseFortuneOptions<T>): UseFortuneResult<T> {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResult = useCallback(async (p: UserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetcher(p);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "占い結果の取得に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (!hasProfile()) {
      router.replace("/profile");
      return;
    }
    const p = loadProfile();
    if (!p) return;
    if (requireBloodType && !p.bloodType) {
      router.replace("/fortune");
      return;
    }
    setProfile(p);
    fetchResult(p);
  }, [router, fetchResult, requireBloodType]);

  const retry = useCallback(() => {
    if (profile) {
      fetchResult(profile);
    }
  }, [profile, fetchResult]);

  return { profile, result, loading, error, retry };
}
