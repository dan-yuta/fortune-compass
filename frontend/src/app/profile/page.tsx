"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { saveProfile, getProfileSnapshot, subscribeStorage } from "@/lib/storage";
import { kanaToRomaji } from "@/lib/kana-to-romaji";

const BLOOD_TYPES = ["A", "B", "O", "AB"] as const;
const CURRENT_YEAR = 2025;
const START_YEAR = 1920;

interface FormErrors {
  name?: string;
  nameKana?: string;
  birthday?: string;
}

function parseBirthdayPart(birthday: string | undefined, index: number): string {
  if (!birthday) return "";
  const parts = birthday.split("-");
  if (parts.length !== 3) return "";
  return index === 0 ? parts[0] : String(Number(parts[index]));
}

export default function ProfilePage() {
  const router = useRouter();
  const existing = useSyncExternalStore(
    subscribeStorage,
    getProfileSnapshot,
    () => null
  );

  const [name, setName] = useState(existing?.name ?? "");
  const [nameKana, setNameKana] = useState(existing?.nameKana ?? "");
  const [birthYear, setBirthYear] = useState(parseBirthdayPart(existing?.birthday, 0));
  const [birthMonth, setBirthMonth] = useState(parseBirthdayPart(existing?.birthday, 1));
  const [birthDay, setBirthDay] = useState(parseBirthdayPart(existing?.birthday, 2));
  const [bloodType, setBloodType] = useState<string | null>(existing?.bloodType ?? null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isKatakana = (str: string): boolean => {
    return /^[ァ-ヶー\s]+$/.test(str);
  };

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "名前を入力してください";
    }

    if (!nameKana.trim()) {
      newErrors.nameKana = "フリガナを入力してください";
    } else if (!isKatakana(nameKana.trim())) {
      newErrors.nameKana = "カタカナで入力してください";
    }

    if (!birthYear || !birthMonth || !birthDay) {
      newErrors.birthday = "生年月日を選択してください";
    }

    return newErrors;
  }, [name, nameKana, birthYear, birthMonth, birthDay]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ name: true, nameKana: true, birthday: true });

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const birthday = `${birthYear}-${String(Number(birthMonth)).padStart(2, "0")}-${String(Number(birthDay)).padStart(2, "0")}`;
    const nameRomaji = kanaToRomaji(nameKana.trim());

    const profile: UserProfile = {
      name: name.trim(),
      nameKana: nameKana.trim(),
      nameRomaji,
      birthday,
      bloodType,
    };

    saveProfile(profile);
    router.push("/fortune");
  };

  const years = Array.from(
    { length: CURRENT_YEAR - START_YEAR + 1 },
    (_, i) => CURRENT_YEAR - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-text-secondary hover:text-text-primary transition-colors duration-200 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">トップに戻る</span>
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
        プロフィール設定
      </h1>
      <p className="text-text-secondary mb-8">
        占いに必要な情報を入力してください
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            名前 <span className="text-crimson">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="山田 太郎"
            className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-mystic-purple/60 transition-colors duration-200"
          />
          {touched.name && errors.name && (
            <p className="text-crimson text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Name Kana field */}
        <div>
          <label
            htmlFor="nameKana"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            フリガナ（カタカナ） <span className="text-crimson">*</span>
          </label>
          <input
            id="nameKana"
            type="text"
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            onBlur={() => handleBlur("nameKana")}
            placeholder="ヤマダ タロウ"
            className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-mystic-purple/60 transition-colors duration-200"
          />
          {touched.nameKana && errors.nameKana && (
            <p className="text-crimson text-sm mt-1">{errors.nameKana}</p>
          )}
        </div>

        {/* Birthday field */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            生年月日 <span className="text-crimson">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
              >
                <option value="" className="text-text-muted">
                  年
                </option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
              >
                <option value="" className="text-text-muted">
                  月
                </option>
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
              >
                <option value="" className="text-text-muted">
                  日
                </option>
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}日
                  </option>
                ))}
              </select>
            </div>
          </div>
          {touched.birthday && errors.birthday && (
            <p className="text-crimson text-sm mt-1">{errors.birthday}</p>
          )}
        </div>

        {/* Blood Type field */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            血液型（任意）
          </label>
          <div className="flex gap-3">
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setBloodType(bloodType === type ? null : type)
                }
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 border ${
                  bloodType === type
                    ? "bg-mystic-purple text-white border-mystic-purple"
                    : "bg-twilight text-text-secondary border-mystic-purple/20 hover:border-mystic-purple/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 mt-8"
        >
          <Save className="w-5 h-5" />
          保存して占いをはじめる
        </button>
      </form>
    </div>
  );
}
