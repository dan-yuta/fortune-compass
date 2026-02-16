# Fortune Compass v1 仕様書（MVP）

## 1. スコープ

今回実装する最小限のプロダクト。ローカル環境で動作するWebアプリ。

### 実装する機能
- ユーザー情報入力フォーム
- 星座占い
- 数秘術
- 血液型占い
- タロット占い（3枚引き）
- 占術選択画面
- 個別占い結果表示

### 実装しない機能（将来対応）
- 四柱推命、九星気学、手相AI
- AI総合診断（Claude API連携）
- 今日の運勢バッチ処理
- 履歴・お気に入り・SNSシェア
- DynamoDB / Docker / AWS インフラ
- ユーザー認証

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 15.x |
| UI | Tailwind CSS + shadcn/ui | - |
| バックエンド | Node.js + Express + TypeScript | - |
| データ保持 | ブラウザ localStorage | - |
| 開発実行 | `npm run dev`（concurrentlyで同時起動） | - |

- フロントエンド: ポート 3000
- バックエンド: ポート 8080

---

## 3. 画面一覧

| # | 画面名 | パス | 概要 |
|---|--------|------|------|
| 1 | トップページ | `/` | アプリ紹介、各占術への導線 |
| 2 | ユーザー情報入力 | `/profile` | 名前・生年月日・血液型の入力 |
| 3 | 占術選択 | `/fortune` | 4種の占術から選択 |
| 4 | 星座占い結果 | `/fortune/zodiac` | 星座占いの結果表示 |
| 5 | 数秘術結果 | `/fortune/numerology` | 数秘術の結果表示 |
| 6 | 血液型占い結果 | `/fortune/blood-type` | 血液型占いの結果表示 |
| 7 | タロット結果 | `/fortune/tarot` | タロット3枚引きの結果表示 |

---

## 4. API設計

### 4.1 エンドポイント

| Method | Path | 概要 |
|--------|------|------|
| POST | `/api/fortune/zodiac` | 星座占い実行 |
| POST | `/api/fortune/numerology` | 数秘術実行 |
| POST | `/api/fortune/blood-type` | 血液型占い実行 |
| POST | `/api/fortune/tarot` | タロット占い実行 |

※ プロフィールはlocalStorageのみで管理するため、プロフィールAPIは不要。

### 4.2 リクエスト / レスポンス

#### POST `/api/fortune/zodiac`
```json
// Request
{
  "birthday": "1990-05-15"
}

// Response
{
  "fortuneType": "zodiac",
  "sign": "牡牛座",
  "signEn": "taurus",
  "element": "地",
  "score": 4,
  "luckyColor": "グリーン",
  "luckyItem": "観葉植物",
  "advice": "新しい出会いに恵まれる一日です。"
}
```

#### POST `/api/fortune/numerology`
```json
// Request
{
  "birthday": "1990-05-15",
  "name": "yamada taro"
}

// Response
{
  "fortuneType": "numerology",
  "destinyNumber": 7,
  "personalityTraits": ["知的", "分析的", "内省的"],
  "yearFortune": "成長と学びの年",
  "compatibility": [2, 4],
  "advice": "自分の直感を信じて行動しましょう。"
}
```

#### POST `/api/fortune/blood-type`
```json
// Request
{
  "bloodType": "A"
}

// Response
{
  "fortuneType": "blood-type",
  "bloodType": "A",
  "personality": "几帳面で真面目、協調性が高い",
  "score": 4,
  "compatibilityRanking": ["A", "AB", "O", "B"],
  "advice": "周囲との調和を大切にする一日です。"
}
```

#### POST `/api/fortune/tarot`
```json
// Request
{}

// Response
{
  "fortuneType": "tarot",
  "spread": "three-card",
  "cards": [
    {
      "position": "past",
      "positionLabel": "過去",
      "name": "愚者",
      "nameEn": "The Fool",
      "number": 0,
      "arcana": "major",
      "isReversed": false,
      "meaning": "新しい始まり、自由、冒険心",
      "reversedMeaning": "無謀、不注意、愚かさ"
    },
    {
      "position": "present",
      "positionLabel": "現在",
      "name": "女帝",
      "nameEn": "The Empress",
      "number": 3,
      "arcana": "major",
      "isReversed": true,
      "meaning": "豊かさ、母性、創造性",
      "reversedMeaning": "過保護、依存、停滞"
    },
    {
      "position": "future",
      "positionLabel": "未来",
      "name": "星",
      "nameEn": "The Star",
      "number": 17,
      "arcana": "major",
      "isReversed": false,
      "meaning": "希望、インスピレーション、再生",
      "reversedMeaning": "失望、悲観、自信喪失"
    }
  ],
  "overallMessage": "過去の冒険心が今の試練を経て、未来に希望の光をもたらすでしょう。"
}
```

---

## 5. 占いロジック詳細

### 5.1 星座占い

**判定ロジック:**
| 星座 | 期間 |
|------|------|
| 牡羊座 | 3/21 - 4/19 |
| 牡牛座 | 4/20 - 5/20 |
| 双子座 | 5/21 - 6/21 |
| 蟹座 | 6/22 - 7/22 |
| 獅子座 | 7/23 - 8/22 |
| 乙女座 | 8/23 - 9/22 |
| 天秤座 | 9/23 - 10/23 |
| 蠍座 | 10/24 - 11/22 |
| 射手座 | 11/23 - 12/21 |
| 山羊座 | 12/22 - 1/19 |
| 水瓶座 | 1/20 - 2/18 |
| 魚座 | 2/19 - 3/20 |

**運勢スコア生成:** 日付 + 星座をシードとした擬似ランダム（毎日変わるが同日同星座なら同じ結果）

**出力項目:** 星座名、エレメント（火/地/風/水）、スコア(1-5)、ラッキーカラー、ラッキーアイテム、アドバイス

### 5.2 数秘術

**運命数算出:**
1. 生年月日の各桁を合計（例: 1990-05-15 → 1+9+9+0+0+5+1+5 = 30 → 3+0 = 3）
2. マスターナンバー（11, 22, 33）はそのまま保持
3. 1桁になるまで繰り返す

**名前の数値化（任意）:**
- ローマ字の各文字をピタゴリアン変換（A=1, B=2, ... Z=8 のサイクル）
- 合計して1桁にする → ソウルナンバー

**出力項目:** 運命数、性格特徴、年運メッセージ、相性の良い運命数、アドバイス

### 5.3 血液型占い

**判定:** 入力された血液型（A/B/O/AB）に対応する固定データ + 日替わり運勢スコア

**出力項目:** 性格特徴、スコア(1-5)、相性ランキング、アドバイス

### 5.4 タロット占い

**カード構成（MVP）:** 大アルカナ22枚のみ（小アルカナは将来対応）

**スプレッド:** 3枚引き（過去・現在・未来）
- 22枚から重複なしで3枚をランダム抽出
- 各カードに50%の確率で正位置/逆位置を付与

**出力項目:** 3枚のカード情報（名前・番号・正逆・意味）、総合メッセージ

---

## 6. データ構造（localStorage）

### ユーザープロフィール
```json
{
  "key": "fortune-compass-profile",
  "value": {
    "name": "山田太郎",
    "nameKana": "ヤマダタロウ",
    "nameRomaji": "yamada tarou",
    "birthday": "1990-05-15",
    "bloodType": "A"
  }
}
```

---

## 7. ディレクトリ構成

```
fortune-compass/
├── package.json              # ルート（concurrently）
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # トップページ
│   │   │   ├── profile/
│   │   │   │   └── page.tsx          # プロフィール入力
│   │   │   └── fortune/
│   │   │       ├── page.tsx          # 占術選択
│   │   │       ├── zodiac/
│   │   │       │   └── page.tsx
│   │   │       ├── numerology/
│   │   │       │   └── page.tsx
│   │   │       ├── blood-type/
│   │   │       │   └── page.tsx
│   │   │       └── tarot/
│   │   │           └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui
│   │   │   └── fortune/              # 占い関連
│   │   └── lib/
│   │       ├── api-client.ts         # バックエンドAPI呼び出し
│   │       └── storage.ts            # localStorage操作
│   └── tsconfig.json
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts                  # Expressエントリポイント
│   │   ├── routes/
│   │   │   └── fortune.ts            # 占いルート
│   │   ├── services/
│   │   │   ├── zodiac.ts
│   │   │   ├── numerology.ts
│   │   │   ├── blood-type.ts
│   │   │   └── tarot.ts
│   │   └── data/
│   │       ├── zodiac-data.ts
│   │       ├── tarot-cards.ts
│   │       └── blood-type-data.ts
│   └── tsconfig.json
└── docs/
    └── spec-v1.md                    # この仕様書
```

---

## 8. UI方針

- **テーマ:** 神秘的・宇宙的な雰囲気（ダークベース + 紫/金のアクセント）
- **レスポンシブ:** モバイルファースト
- **アニメーション:** 最小限（ページ遷移程度）
- **フォント:** Noto Sans JP（日本語）

---

## 9. 開発手順

1. プロジェクト初期セットアップ（Next.js + Express + モノレポ）
2. バックエンド: 占いロジック + APIエンドポイント実装
3. フロントエンド: 画面実装（トップ → プロフィール → 占術選択 → 結果画面）
4. フロントエンド ↔ バックエンド 結合
5. 動作確認・微調整
