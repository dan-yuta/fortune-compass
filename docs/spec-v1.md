# Fortune Compass v1 仕様書（MVP）

## 1. スコープ

総合占いWebアプリケーション。AWS ECS Fargate 上で本番稼働中。

**URL**: https://d71oywvumn06c.cloudfront.net

### 実装済み機能
- ユーザー情報入力フォーム（バリデーション・アクセシビリティ対応）
- 星座占い
- 数秘術
- 血液型占い
- タロット占い（3枚引き・フリップアニメーション付き）
- 占術選択画面
- 個別占い結果表示
- PWA 対応（manifest.json、アイコン）
- 多言語対応（日本語 / English）
- OGP / Twitter Card メタデータ + 動的OG画像生成
- カスタム404ページ
- Framer Motion アニメーション（ページ遷移、カード表示）
- Docker 化 + AWS ECS Fargate デプロイ
- GitHub Actions CI/CD

### 未実装（将来対応）
- 四柱推命、九星気学、手相AI
- AI総合診断（Claude API連携）
- 今日の運勢バッチ処理
- 履歴・お気に入り・SNSシェア
- DynamoDB / ユーザー認証

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.1.6 |
| UI | Tailwind CSS + Lucide React | 4.x / 0.564.x |
| アニメーション | Framer Motion | 12.x |
| バックエンド | Express + TypeScript | 5.2.x |
| データ保持 | ブラウザ localStorage | - |
| テスト (Backend) | Jest + Supertest | 30.x |
| テスト (Frontend) | Jest + React Testing Library | 30.x / 16.x |
| E2E テスト | Playwright (Chromium) | 1.58.x |
| インフラ | Terraform + AWS ECS Fargate | >= 1.5 |
| CI/CD | GitHub Actions (OIDC → ECR → ECS) | - |
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
| 8 | 404エラー | `/*` (不明パス) | カスタム404ページ |

---

## 4. API設計

### 4.1 エンドポイント

| Method | Path | 概要 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（ALB用） |
| POST | `/api/fortune/zodiac` | 星座占い実行 |
| POST | `/api/fortune/numerology` | 数秘術実行 |
| POST | `/api/fortune/blood-type` | 血液型占い実行 |
| POST | `/api/fortune/tarot` | タロット占い実行 |

フロントエンドヘルスチェック: `GET /health`（Next.js Route Handler）

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
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions CI/CD
├── infra/terraform/          # AWS インフラ (Terraform)
├── docs/                     # 設計ドキュメント
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── jest.config.ts        # Jest 設定
│   ├── playwright.config.ts  # Playwright E2E 設定
│   ├── Dockerfile            # 本番コンテナ
│   ├── __tests__/            # ユニットテスト (31ケース)
│   ├── e2e/                  # E2Eテスト (25ケース)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.json     # PWA マニフェスト
│   │   └── icon-*.svg        # PWA アイコン
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # ルートレイアウト (OGP, PWA, viewport)
│       │   ├── page.tsx          # トップページ
│       │   ├── not-found.tsx     # カスタム404
│       │   ├── opengraph-image.tsx # 動的OG画像
│       │   ├── health/           # ヘルスチェック
│       │   ├── profile/
│       │   │   └── page.tsx      # プロフィール入力
│       │   └── fortune/
│       │       ├── page.tsx      # 占術選択
│       │       ├── zodiac/       # 星座占い結果
│       │       ├── numerology/   # 数秘術結果
│       │       ├── blood-type/   # 血液型占い結果
│       │       └── tarot/        # タロット結果
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── LanguageSwitcher.tsx # 言語切替
│       │   ├── motion/           # Framer Motion
│       │   └── fortune/          # 占い関連
│       └── lib/
│           ├── api-client.ts     # API呼び出し
│           ├── storage.ts        # localStorage操作
│           ├── useFortune.ts     # 占い共通フック
│           ├── kana-to-romaji.ts # カタカナ→ローマ字変換
│           └── i18n/             # 多言語対応 (ja/en)
├── backend/
│   ├── package.json
│   ├── Dockerfile            # 本番コンテナ
│   ├── src/
│   │   ├── index.ts          # Express (:8080) + ヘルスチェック
│   │   ├── routes/
│   │   ├── services/
│   │   └── data/
│   └── __tests__/            # テスト (75ケース)
└── docs/
```

---

## 8. UI方針

- **テーマ:** 神秘的・宇宙的な雰囲気（ダークベース + 紫/金のアクセント）
- **レスポンシブ:** モバイルファースト
- **アニメーション:** Framer Motion（ページ遷移、カードスタガー表示、タロットフリップ）
- **フォント:** Inter（英数字）+ Noto Sans JP（日本語）
- **アクセシビリティ:** ARIA属性、スキップナビ、フォーカスリング、セマンティックHTML
- **多言語:** 日本語 / English 切替（クライアントサイドContext）
- **PWA:** ホーム画面追加対応（manifest.json）

---

## 9. テスト

| 種別 | ツール | 件数 |
|------|-------|------|
| バックエンド単体 + API | Jest + Supertest | 75 |
| フロントエンド単体 | Jest + React Testing Library | 31 |
| E2E | Playwright (Chromium) | 25 |
| **合計** | | **131** |

```bash
# バックエンドテスト
cd backend && npm test

# フロントエンド ユニットテスト
cd frontend && npm test

# フロントエンド E2Eテスト
cd frontend && npm run test:e2e
```

---

## 10. デプロイ

AWS ECS Fargate + CloudFront 構成。GitHub Actions で CI/CD。

- `master` ブランチへの push で自動デプロイ
- バックエンドテスト → Docker ビルド → ECR push → Terraform apply
- URL: https://d71oywvumn06c.cloudfront.net
