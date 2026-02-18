"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { saveProfile, loadProfile } from "@/lib/storage";
import { kanaToRomaji } from "@/lib/kana-to-romaji";

const BLOOD_TYPES = ["A", "B", "O", "AB"] as const;
const CURRENT_YEAR = new Date().getFullYear();
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

function getDaysInMonth(year: string, month: string): number {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function getInitialProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  return loadProfile();
}

export default function ProfilePage() {
  const router = useRouter();
  const [existing] = useState(getInitialProfile);

  const [name, setName] = useState(existing?.name ?? "");
  const [nameKana, setNameKana] = useState(existing?.nameKana ?? "");
  const [birthYear, setBirthYear] = useState(parseBirthdayPart(existing?.birthday, 0));
  const [birthMonth, setBirthMonth] = useState(parseBirthdayPart(existing?.birthday, 1));
  const [birthDay, setBirthDay] = useState(parseBirthdayPart(existing?.birthday, 2));
  const [bloodType, setBloodType] = useState<string | null>(existing?.bloodType ?? null);
  const [birthHour, setBirthHour] = useState(existing?.birthTime ? existing.birthTime.split(":")[0] : "");
  const [birthMinute, setBirthMinute] = useState(existing?.birthTime ? existing.birthTime.split(":")[1] : "");
  const [gender, setGender] = useState<"male" | "female" | "">(existing?.gender ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const maxDays = getDaysInMonth(birthYear, birthMonth);

  const handleMonthChange = (newMonth: string) => {
    setBirthMonth(newMonth);
    const newMaxDays = getDaysInMonth(birthYear, newMonth);
    if (birthDay && Number(birthDay) > newMaxDays) {
      setBirthDay(String(newMaxDays));
    }
  };

  const handleYearChange = (newYear: string) => {
    setBirthYear(newYear);
    const newMaxDays = getDaysInMonth(newYear, birthMonth);
    if (birthDay && Number(birthDay) > newMaxDays) {
      setBirthDay(String(newMaxDays));
    }
  };

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

    const birthTime = birthHour && birthMinute ? `${birthHour.padStart(2, "0")}:${birthMinute.padStart(2, "0")}` : undefined;

    const profile: UserProfile = {
      name: name.trim(),
      nameKana: nameKana.trim(),
      nameRomaji,
      birthday,
      bloodType,
      birthTime,
      gender: gender || undefined,
    };

    saveProfile(profile);
    router.push("/fortune");
  };

  const years = Array.from(
    { length: CURRENT_YEAR - START_YEAR + 1 },
    (_, i) => CURRENT_YEAR - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: maxDays }, (_, i) => i + 1);

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

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            名前 <span className="text-crimson" aria-hidden="true">*</span>
            <span className="sr-only">（必須）</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="山田 太郎"
            required
            aria-required="true"
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={touched.name && errors.name ? "name-error" : undefined}
            className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-colors duration-200"
          />
          {touched.name && errors.name && (
            <p id="name-error" role="alert" className="text-crimson text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Name Kana field */}
        <div>
          <label
            htmlFor="nameKana"
            className="block text-sm font-medium text-text-primary mb-2"
          >
            フリガナ（カタカナ） <span className="text-crimson" aria-hidden="true">*</span>
            <span className="sr-only">（必須）</span>
          </label>
          <input
            id="nameKana"
            type="text"
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            onBlur={() => handleBlur("nameKana")}
            placeholder="ヤマダ タロウ"
            required
            aria-required="true"
            aria-invalid={touched.nameKana && !!errors.nameKana}
            aria-describedby={touched.nameKana && errors.nameKana ? "nameKana-error" : undefined}
            className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-colors duration-200"
          />
          {touched.nameKana && errors.nameKana && (
            <p id="nameKana-error" role="alert" className="text-crimson text-sm mt-1">{errors.nameKana}</p>
          )}
        </div>

        {/* Birthday field */}
        <fieldset>
          <legend className="block text-sm font-medium text-text-primary mb-2">
            生年月日 <span className="text-crimson" aria-hidden="true">*</span>
            <span className="sr-only">（必須）</span>
          </legend>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="birthYear" className="sr-only">年</label>
              <select
                id="birthYear"
                value={birthYear}
                onChange={(e) => handleYearChange(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                aria-required="true"
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
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
              <label htmlFor="birthMonth" className="sr-only">月</label>
              <select
                id="birthMonth"
                value={birthMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                aria-required="true"
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
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
              <label htmlFor="birthDay" className="sr-only">日</label>
              <select
                id="birthDay"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value)}
                onBlur={() => handleBlur("birthday")}
                aria-required="true"
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 focus:border-mystic-purple/60 transition-colors duration-200 appearance-none"
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
            <p role="alert" className="text-crimson text-sm mt-1">{errors.birthday}</p>
          )}
        </fieldset>

        {/* Blood Type field */}
        <fieldset>
          <legend className="block text-sm font-medium text-text-primary mb-2">
            血液型（任意）
          </legend>
          <div className="flex gap-3" role="group" aria-label="血液型選択">
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setBloodType(bloodType === type ? null : type)
                }
                aria-pressed={bloodType === type}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 ${
                  bloodType === type
                    ? "bg-mystic-purple text-white border-mystic-purple"
                    : "bg-twilight text-text-secondary border-mystic-purple/20 hover:border-mystic-purple/40"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Birth Time field */}
        <fieldset>
          <legend className="block text-sm font-medium text-text-primary mb-2">
            生まれ時刻（任意）
          </legend>
          <p className="text-text-muted text-xs mb-2">
            四柱推命の時柱計算に使用します
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="birthHour" className="sr-only">時</label>
              <select
                id="birthHour"
                value={birthHour}
                onChange={(e) => setBirthHour(e.target.value)}
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 transition-colors duration-200 appearance-none"
              >
                <option value="" className="text-text-muted">時</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i)}>
                    {i}時
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="birthMinute" className="sr-only">分</label>
              <select
                id="birthMinute"
                value={birthMinute}
                onChange={(e) => setBirthMinute(e.target.value)}
                className="w-full bg-twilight border border-mystic-purple/20 rounded-lg px-3 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 transition-colors duration-200 appearance-none"
              >
                <option value="" className="text-text-muted">分</option>
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={String(i)}>
                    {i}分
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Gender field */}
        <fieldset>
          <legend className="block text-sm font-medium text-text-primary mb-2">
            性別（任意）
          </legend>
          <p className="text-text-muted text-xs mb-2">
            風水占いの本命卦計算に使用します
          </p>
          <div className="flex gap-3" role="group" aria-label="性別選択">
            <button
              type="button"
              onClick={() => setGender(gender === "male" ? "" : "male")}
              aria-pressed={gender === "male"}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 ${
                gender === "male"
                  ? "bg-mystic-purple text-white border-mystic-purple"
                  : "bg-twilight text-text-secondary border-mystic-purple/20 hover:border-mystic-purple/40"
              }`}
            >
              男性
            </button>
            <button
              type="button"
              onClick={() => setGender(gender === "female" ? "" : "female")}
              aria-pressed={gender === "female"}
              className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 ${
                gender === "female"
                  ? "bg-mystic-purple text-white border-mystic-purple"
                  : "bg-twilight text-text-secondary border-mystic-purple/20 hover:border-mystic-purple/40"
              }`}
            >
              女性
            </button>
          </div>
        </fieldset>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-mystic-purple to-purple-700 text-white rounded-lg px-6 py-3 font-semibold hover:opacity-90 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-mystic-purple/60 flex items-center justify-center gap-2 mt-8"
        >
          <Save className="w-5 h-5" aria-hidden="true" />
          保存して占いをはじめる
        </button>
      </form>
    </div>
  );
}
