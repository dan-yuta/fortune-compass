# Fortune Compass

総合占いWebアプリケーション。16の占術を4カテゴリ（定番占い・誕生日占い・伝統占い・特殊占い）で提供し、毎日の運勢を占えます。

**URL**: https://d71oywvumn06c.cloudfront.net

## アーキテクチャ

```
┌──────────────────────────────────────────────────────────────────────┐
│                            Browser                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                  Next.js Frontend (:3000)                      │  │
│  │                                                                │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────────────────┐  │  │
│  │  │  トップ  │→│プロフィール│→│        占術選択               │  │  │
│  │  │ page.tsx │  │profile/  │  │  fortune/page.tsx             │  │  │
│  │  └─────────┘  └──────────┘  └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┘  │  │
│  │          fortune-registry.ts   │  │  │  │  │  │  │  │  │      │  │
│  │    ┌───────────────────────────┘  │  │  │  │  │  │  │  │      │  │
│  │    │  定番(4)     誕生日(8)       │ 伝統(2)  │  特殊(2)       │  │
│  │    ▼              ▼               ▼          ▼                │  │
│  │  ┌────────┐ ┌──────────┐ ┌────────────┐ ┌──────────┐        │  │
│  │  │zodiac  │ │eto       │ │omikuji     │ │dream     │        │  │
│  │  │numero- │ │kyusei    │ │rune        │ │palm      │        │  │
│  │  │logy    │ │animal    │ └────────────┘ └──────────┘        │  │
│  │  │blood-  │ │birth-    │                                     │  │
│  │  │type    │ │flower    │    + dashboard (定番4占術一括)       │  │
│  │  │tarot   │ │birthstone│                                     │  │
│  │  └────────┘ │shichuu   │                                     │  │
│  │             │weekday   │                                     │  │
│  │             │fengshui  │                                     │  │
│  │             └──────────┘                                     │  │
│  │              lib/api-client.ts                                │  │
│  │              fetch("/api/fortune/*")                           │  │
│  └───────────────────────┬───────────────────────────────────────┘  │
│                          │                                          │
│               Next.js Rewrites (/api/* → :8080)                     │
│                          │                                          │
│  ┌───────────────────────▼───────────────────────────────────────┐  │
│  │              Express Backend (:8080)                           │  │
│  │                                                               │  │
│  │  routes/fortune.ts                                            │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │ POST /api/fortune/zodiac      → zodiac.ts              │  │  │
│  │  │ POST /api/fortune/numerology  → numerology.ts           │  │  │
│  │  │ POST /api/fortune/blood-type  → blood-type.ts           │  │  │
│  │  │ POST /api/fortune/tarot       → tarot.ts                │  │  │
│  │  │ POST /api/fortune/eto         → eto.ts                  │  │  │
│  │  │ POST /api/fortune/kyusei      → kyusei.ts               │  │  │
│  │  │ POST /api/fortune/animal      → animal.ts               │  │  │
│  │  │ POST /api/fortune/birth-flower→ birth-flower.ts         │  │  │
│  │  │ POST /api/fortune/birthstone  → birthstone.ts           │  │  │
│  │  │ POST /api/fortune/shichuu     → shichuu.ts              │  │  │
│  │  │ POST /api/fortune/weekday     → weekday.ts              │  │  │
│  │  │ POST /api/fortune/fengshui    → fengshui.ts             │  │  │
│  │  │ POST /api/fortune/omikuji     → omikuji.ts              │  │  │
│  │  │ POST /api/fortune/rune        → rune.ts                 │  │  │
│  │  │ POST /api/fortune/dream       → dream.ts                │  │  │
│  │  │ POST /api/fortune/palm        → palm.ts                 │  │  │
│  │  │ POST /api/fortune/dashboard   → dashboard.ts            │  │  │
│  │  │ GET  /api/health                                        │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                          │                                    │  │
│  │       ┌──────────────────┼──────────────────┐                 │  │
│  │       ▼                  ▼                  ▼                 │  │
│  │  data/               utils/            services/              │  │
│  │  zodiac-data.ts      seed-random.ts    zodiac.ts              │  │
│  │  tarot-cards.ts      (djb2 hash +      numerology.ts          │  │
│  │  blood-type-data.ts   daily seed)      blood-type.ts          │  │
│  │  eto-data.ts                           tarot.ts               │  │
│  │  kyusei-data.ts                        eto.ts                 │  │
│  │  animal-data.ts                        kyusei.ts              │  │
│  │  birth-flower-data.ts                  animal.ts              │  │
│  │  birthstone-data.ts                    birth-flower.ts        │  │
│  │  shichuu-data.ts                       birthstone.ts          │  │
│  │  weekday-data.ts                       shichuu.ts             │  │
│  │  fengshui-data.ts                      weekday.ts             │  │
│  │  omikuji-data.ts                       fengshui.ts            │  │
│  │  rune-data.ts                          omikuji.ts             │  │
│  │  dream-data.ts                         rune.ts                │  │
│  │                                        dream.ts               │  │
│  │                                        palm.ts                │  │
│  │                                        dashboard.ts           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     localStorage                              │  │
│  │            プロフィール永続化 + 占い履歴保存                     │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.1.6 |
| UI ライブラリ | React | 19.2.3 |
| スタイリング | Tailwind CSS | 4.x |
| アイコン | Lucide React | 0.564.x |
| アニメーション | Framer Motion | 12.x |
| バックエンド | Express | 5.2.x |
| 言語 | TypeScript | 5.x |
| テスト (Backend) | Jest + Supertest | 30.x |
| テスト (Frontend) | Jest + React Testing Library | 30.x / 16.x |
| E2E テスト | Playwright | 1.58.x |
| モノレポ管理 | concurrently | 9.x |
| インフラ | Terraform | >= 1.5 |
| コンテナ | Docker + k3s on EC2 | - |
| CI/CD | GitHub Actions | - |
| サーバーレス | AWS Lambda (Python 3.12) | EC2 管理 |
| ワークフロー | AWS Step Functions | EC2 起動・停止 |
| API 管理 | Amazon API Gateway | REST API |

## ディレクトリ構成

```
fortune-compass/
├── package.json              # モノレポ設定 (concurrently)
├── docs/                     # 設計ドキュメント
│   ├── spec-v1.md            #   仕様書
│   ├── design-system.md      #   デザインシステム
│   ├── ui-design.md          #   UI設計
│   ├── test-design.md        #   テスト設計
│   ├── ssot-issue.md         #   SSOTイシュー
│   ├── ux-review.md          #   UXレビュー
│   ├── infra-design.md       #   インフラ設計書
│   └── aws-services.md       #   AWS サービス一覧・解説
│
├── .github/workflows/        # CI/CD
│   └── deploy.yml            #   GitHub Actions デプロイ
│
├── infra/terraform/          # AWS インフラ (Terraform)
│   ├── modules/
│   │   ├── networking/       #   VPC, Subnets
│   │   ├── ecr/              #   ECR リポジトリ
│   │   ├── ec2-k3s/          #   EC2, k3s, Security Group
│   │   ├── cloudfront/       #   CloudFront CDN
│   │   └── management/       #   Lambda, Step Functions, API Gateway, S3 (管理コンソール)
│   └── environments/
│       └── dev/              #   開発環境設定
│
├── k8s/                        #   Kubernetes マニフェスト
│
├── backend/                  # Express APIサーバー
│   ├── src/
│   │   ├── index.ts          #   エントリポイント (:8080)
│   │   ├── routes/
│   │   │   └── fortune.ts    #   18エンドポイントのルーティング (16占術+dashboard+health)
│   │   ├── services/         #   占いロジック (17ファイル)
│   │   │   ├── zodiac.ts     #     星座占い
│   │   │   ├── numerology.ts #     数秘術
│   │   │   ├── blood-type.ts #     血液型占い
│   │   │   ├── tarot.ts      #     タロット占い
│   │   │   ├── eto.ts        #     干支占い
│   │   │   ├── kyusei.ts     #     九星気学
│   │   │   ├── animal.ts     #     動物占い
│   │   │   ├── birth-flower.ts #   誕生花占い
│   │   │   ├── birthstone.ts #     誕生石占い
│   │   │   ├── shichuu.ts    #     四柱推命
│   │   │   ├── weekday.ts    #     曜日占い
│   │   │   ├── fengshui.ts   #     風水占い
│   │   │   ├── omikuji.ts    #     おみくじ
│   │   │   ├── rune.ts       #     ルーン占い
│   │   │   ├── dream.ts      #     夢占い
│   │   │   ├── palm.ts       #     手相占い (Claude Vision API)
│   │   │   └── dashboard.ts  #     総合ダッシュボード (定番4占術集約)
│   │   ├── data/             #   マスターデータ (14ファイル)
│   │   │   ├── zodiac-data.ts
│   │   │   ├── tarot-cards.ts
│   │   │   ├── blood-type-data.ts
│   │   │   ├── eto-data.ts
│   │   │   ├── kyusei-data.ts
│   │   │   ├── animal-data.ts
│   │   │   ├── birth-flower-data.ts
│   │   │   ├── birthstone-data.ts
│   │   │   ├── shichuu-data.ts
│   │   │   ├── weekday-data.ts
│   │   │   ├── fengshui-data.ts
│   │   │   ├── omikuji-data.ts
│   │   │   ├── rune-data.ts
│   │   │   └── dream-data.ts
│   │   └── utils/
│   │       └── seed-random.ts #  シード付き乱数 (日替わり)
│   └── __tests__/            #   テスト (75ケース)
│       ├── services/
│       └── routes/
│
└── frontend/                 # Next.js アプリ
    ├── __tests__/               # ユニットテスト (31ケース)
    │   ├── components/          #   コンポーネントテスト
    │   └── lib/                 #   ライブラリテスト
    ├── e2e/                     # E2Eテスト (25ケース, Playwright)
    │   ├── home.spec.ts
    │   ├── profile.spec.ts
    │   ├── fortune.spec.ts
    │   └── navigation.spec.ts
    ├── public/
    │   ├── favicon.svg          # ファビコン
    │   ├── manifest.json        # PWA マニフェスト
    │   └── icon-*.svg           # PWA アイコン
    └── src/
        ├── app/
        │   ├── layout.tsx        # ルートレイアウト (OGP, PWA)
        │   ├── page.tsx          # トップページ
        │   ├── not-found.tsx     # カスタム404ページ
        │   ├── opengraph-image.tsx # 動的OG画像生成
        │   ├── globals.css       # デザインシステム定義
        │   ├── sitemap.ts       # 動的sitemap.xml生成
        │   ├── robots.ts        # robots.txt生成
        │   ├── health/           # ヘルスチェック
        │   ├── profile/
        │   │   └── page.tsx      # プロフィール入力
        │   ├── history/
        │   │   └── page.tsx      # 占い履歴一覧
        │   └── fortune/
        │       ├── page.tsx      # 占術選択 (カテゴリ別表示)
        │       ├── dashboard/    # 総合運勢ダッシュボード
        │       ├── zodiac/       # 星座占い結果
        │       ├── numerology/   # 数秘術結果
        │       ├── blood-type/   # 血液型占い結果
        │       ├── tarot/        # タロット占い結果
        │       ├── eto/          # 干支占い結果
        │       ├── kyusei/       # 九星気学結果
        │       ├── animal/       # 動物占い結果
        │       ├── birth-flower/ # 誕生花占い結果
        │       ├── birthstone/   # 誕生石占い結果
        │       ├── shichuu/      # 四柱推命結果
        │       ├── weekday/      # 曜日占い結果
        │       ├── fengshui/     # 風水占い結果
        │       ├── omikuji/      # おみくじ結果
        │       ├── rune/         # ルーン占い結果
        │       ├── dream/        # 夢占い結果
        │       └── palm/         # 手相占い結果
        ├── components/
        │   ├── Header.tsx
        │   ├── LanguageSwitcher.tsx # 言語切替 (ja/en)
        │   ├── motion/           # アニメーション
        │   │   ├── PageTransition.tsx
        │   │   ├── StaggerChildren.tsx
        │   │   └── CardReveal.tsx
        │   └── fortune/          # 占い用共通コンポーネント
        │       ├── FortuneCard.tsx
        │       ├── ScoreDisplay.tsx
        │       ├── LoadingState.tsx
        │       ├── ErrorState.tsx
        │       ├── ResultCard.tsx
        │       ├── RadarChart.tsx     # SVGレーダーチャート
        │       ├── OtherFortunes.tsx  # 他占術へのショートカット (15占術)
        │       └── ShareButtons.tsx   # SNSシェアボタン
        └── lib/
            ├── types.ts          # 型定義
            ├── storage.ts        # localStorage管理 (プロフィール)
            ├── history.ts        # localStorage管理 (占い履歴)
            ├── api-client.ts     # API呼び出し
            ├── useFortune.ts     # 占い共通フック (結果自動保存)
            ├── fortune-registry.ts # 16占術メタ情報 (カテゴリ・アイコン・パス)
            ├── kana-to-romaji.ts # カタカナ→ローマ字変換 (外来語対応)
            └── i18n/             # 多言語対応
                ├── dictionaries.ts # 辞書 (ja/en)
                └── context.tsx     # I18nProvider
```

## Management Console（EC2 ライフサイクル管理）

EC2 を未使用時に停止し、コンピュートコストを削減するための管理コンソール。

| コンポーネント | 説明 |
|--------------|------|
| Lambda (Python 3.12) | EC2 start/stop/status/health-check/ecr-refresh |
| Step Functions | 起動ワークフロー / 停止ワークフロー |
| API Gateway | REST API（API Key 認証） |
| S3 Static Website | 管理コンソール UI |

**管理コンソール URL**: http://fortune-compass-dev-mgmt-console.s3-website-ap-northeast-1.amazonaws.com
**API エンドポイント**: https://4s30b1da8k.execute-api.ap-northeast-1.amazonaws.com/prod/manage

EC2 停止時のコスト: ~$4/月（EBS + ECR + S3 のみ。EC2 コンピュート ~$9/月 を削減）

## セットアップ

### 前提条件

- Node.js 20 以上
- `ANTHROPIC_API_KEY` 環境変数（手相占い用。Claude Vision API を使用）

### インストール

```bash
cd fortune-compass
npm run install:all
```

### 開発サーバー起動

```bash
npm run dev
```

フロントエンド（http://localhost:3000）とバックエンド（http://localhost:8080）が同時に起動します。

### テスト実行

```bash
# バックエンドテスト (75ケース)
cd backend && npm test

# フロントエンド ユニットテスト (31ケース)
cd frontend && npm test

# フロントエンド E2Eテスト (25ケース, 要Playwright)
cd frontend && npm run test:e2e
```

### ビルド

```bash
# フロントエンド
cd frontend && npm run build

# バックエンド
cd backend && npm run build
```

## 機能一覧

| 機能 | 説明 |
|-----|------|
| 16占術 (4カテゴリ) | **定番**: 星座占い・数秘術・血液型占い・タロット / **誕生日**: 干支・九星気学・動物占い・誕生花・誕生石・四柱推命・曜日占い・風水 / **伝統**: おみくじ・ルーン / **特殊**: 夢占い・手相占い |
| 総合運勢ダッシュボード | 定番4占術一括実行 + レーダーチャート (総合運/恋愛運/仕事運/金運) |
| SNSシェア | 結果をX(Twitter)/LINE/Facebookでシェア + リンクコピー |
| 占い履歴 | localStorage に過去の結果を保存・一覧表示 (最大50件) |
| 結果→他占術遷移 | 結果画面下部に他15占術へのショートカット |
| PWA | ホーム画面追加対応 (manifest.json) |
| OGP / SNS Card | Open Graph + Twitter Card メタデータ |
| SEO | sitemap.xml, robots.txt, JSON-LD 構造化データ |
| 多言語対応 (i18n) | 日本語 / English 切替 |
| アニメーション | Framer Motion (ページ遷移・カード表示) |
| アクセシビリティ | WCAG AA準拠カラーコントラスト・ARIA属性・スキップナビ・フォーカスリング |
| カスタム404 | 独自エラーページ |
| ヘルスチェック | `/health` (Frontend), `/api/health` (Backend) |

## API エンドポイント

`POST` 17エンドポイント + `GET` 1エンドポイント。フロントエンドからは Next.js の rewrites 経由でアクセスします。

| エンドポイント | リクエストボディ | 説明 |
|--------------|----------------|------|
| `/api/fortune/zodiac` | `{ birthday: "YYYY-MM-DD" }` | 星座占い |
| `/api/fortune/numerology` | `{ birthday: "YYYY-MM-DD", name: "ROMAJI" }` | 数秘術 |
| `/api/fortune/blood-type` | `{ bloodType: "A" \| "B" \| "O" \| "AB" }` | 血液型占い |
| `/api/fortune/tarot` | `{}` | タロット占い |
| `/api/fortune/eto` | `{ birthday: "YYYY-MM-DD" }` | 干支占い |
| `/api/fortune/kyusei` | `{ birthday: "YYYY-MM-DD" }` | 九星気学 |
| `/api/fortune/animal` | `{ birthday: "YYYY-MM-DD" }` | 動物占い |
| `/api/fortune/birth-flower` | `{ birthday: "YYYY-MM-DD" }` | 誕生花占い |
| `/api/fortune/birthstone` | `{ birthday: "YYYY-MM-DD" }` | 誕生石占い |
| `/api/fortune/shichuu` | `{ birthday: "YYYY-MM-DD" }` | 四柱推命 |
| `/api/fortune/weekday` | `{ birthday: "YYYY-MM-DD" }` | 曜日占い |
| `/api/fortune/fengshui` | `{ birthday: "YYYY-MM-DD", gender?: "male" \| "female" }` | 風水占い |
| `/api/fortune/omikuji` | `{ birthday: "YYYY-MM-DD", name?: "ROMAJI" }` | おみくじ |
| `/api/fortune/rune` | `{ birthday: "YYYY-MM-DD", name?: "ROMAJI" }` | ルーン占い |
| `/api/fortune/dream` | `{ keyword: "キーワード" }` | 夢占い |
| `/api/fortune/palm` | `{ image: "base64データ" }` | 手相占い (Claude Vision API) |
| `/api/fortune/dashboard` | `{ birthday: "YYYY-MM-DD", name?: "ROMAJI", bloodType?: "A" }` | 総合ダッシュボード |
| `GET /api/health` | - | ヘルスチェック |

## 占いロジック

| 占術 | アルゴリズム | 日替わり |
|-----|------------|---------|
| 星座占い | 誕生日→12星座判定 + djb2シードでスコア算出 | はい（同日同結果） |
| 数秘術 | 生年月日の各桁合計→運命数（マスターナンバー11/22/33保持）+ ピタゴリアン変換 | はい |
| 血液型占い | 固定性格データ + djb2シードで日替わりスコア | はい |
| タロット | Fisher-Yates シャッフル → 大アルカナ22枚から3枚抽出 + 50%正逆判定 | いいえ（毎回ランダム） |
| 干支占い | 生年→十二支判定 + djb2シードスコア | はい |
| 九星気学 | 生年→九星判定 + djb2シードスコア | はい |
| 動物占い | 生年月日→JDN→Excelシリアル値→`(serial+8)%60+1`で個性心理學60キャラ判定 + SUN/EARTH/MOONグループ分類 + djb2シードスコア | はい |
| 誕生花占い | 生年月日→365日誕生花データ + djb2シードスコア | はい |
| 誕生石占い | 生月→12月誕生石データ + djb2シードスコア | はい |
| 曜日占い | 生年月日→ツェラーの合同式で曜日算出 + djb2シードスコア | はい |
| 風水占い | 生年+性別→本命卦(Gua)算出 + djb2シードスコア | はい |
| 四柱推命 | 生年月日→天干地支 + ユリウス日算出 + djb2シードスコア | はい |
| おみくじ | 重み付きランダム(大吉〜凶7段階) + djb2シード | はい |
| ルーン占い | 24ルーンから3石選択 + 正逆判定 + djb2シード | はい |
| 夢占い | キーワード完全一致/部分一致検索 + djb2シードスコア | いいえ（キーワード依存） |
| 手相占い | Claude Vision API による画像解析 | いいえ（毎回異なる） |

## 画面フロー

```
トップ (/)
  │
  ├── プロフィール未登録 → プロフィール入力 (/profile)
  │                              │
  │                              ▼
  └── プロフィール登録済み ──→ 占術選択 (/fortune)
                                 │
               fortune-registry.ts でカテゴリ別表示
                                 │
         ┌──── 定番占い ─────────┼──── 誕生日占い ──────────────────┐
         │                      │                                  │
         ▼                      ▼                                  ▼
  ┌────────────┐   ┌──────────────────────────────┐   ┌────────────────┐
  │ Star 星座  │   │ Dog    干支                   │   │ Dice5 おみくじ │
  │ Hash 数秘術│   │ Compass九星気学               │   │ Shield ルーン  │
  │ Droplet血液│   │ Cat    動物占い               │   ├────────────────┤
  │ Layers タロ│   │ Flower2誕生花                 │   │ 伝統占い (2)   │
  ├────────────┤   │ Gem    誕生石                 │   └────────────────┘
  │ 定番 (4)   │   │ Scroll 四柱推命              │
  └────────────┘   │ Calendar曜日                  │   ┌────────────────┐
                   │ Shrub  風水                   │   │ Eye   夢占い   │
  ダッシュボード    │                               │   │ Hand  手相占い │
  (/fortune/       ├──────────────────────────────┤   ├────────────────┤
   dashboard)      │ 誕生日占い (8)                │   │ 特殊占い (2)   │
  定番4占術一括     └──────────────────────────────┘   └────────────────┘
         │
         ▼
  [SNSシェア + 他占術ショートカット (15占術)]
         │
         ▼
  履歴に自動保存 → 履歴 (/history)
```

## デザインシステム

ダークテーマベースの神秘的なUI。

| トークン | カラー | 用途 |
|---------|--------|------|
| `midnight` | `#0f0a1e` | 背景 |
| `deep-purple` | `#1a1333` | カード背景 |
| `twilight` | `#251d3d` | 入力フィールド背景 |
| `mystic-purple` | `#8b5cf6` | プライマリアクセント |
| `celestial-gold` | `#f5c542` | 強調・スコア |
| `aurora-green` | `#34d399` | 成功・高スコア |
| `crimson` | `#f43f5e` | エラー・低スコア |

| `text-primary` | `#f0edf6` | メインテキスト |
| `text-secondary` | `#b8b0d0` | サブテキスト (WCAG AA準拠) |
| `text-muted` | `#8a80a0` | ミュートテキスト (WCAG AA準拠) |

フォント: Inter + Noto Sans JP (400/500/700 サブセット最適化)

## AWS デプロイ

### インフラ構成図

```
┌─────────────────────────────────────────────┐
│                  CloudFront                  │  ← HTTPS 終端 + CDN
│          (d71oywvumn06c.cloudfront.net)       │
└──────────────────────┬──────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────┐
│              EC2 (t3.small)                  │  ← Public Subnet
│  ┌────────────────────────────────────────┐  │
│  │         k3s + Traefik Ingress          │  │
│  │   /api/* → backend:8080                │  │
│  │   /*     → frontend:3000               │  │
│  ├────────────────────────────────────────┤  │
│  │  Pod: backend   │  Pod: frontend       │  │
│  │  (Express 5.x)  │  (Next.js 16.1.6)   │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

CloudFront → EC2 (k3s) の2層構成（**5モジュール / 43リソース**）:
- CloudFront が HTTPS 終端と静的アセットキャッシュ
- k3s の Traefik Ingress がパスベースルーティング: `/api/*` → Backend, `/*` → Frontend
- EC2 (t3.small) が Public Subnet 上で k3s クラスタを実行
- Management Console（Lambda + Step Functions + API Gateway + S3）で EC2 ライフサイクルを管理

### デプロイ手順

#### 1. 前提条件

- AWS CLI 設定済み
- Terraform >= 1.5 インストール済み
- Docker インストール済み

#### 2. Terraform State 用リソースを作成（初回のみ）

```bash
aws s3api create-bucket \
  --bucket fortune-compass-tfstate \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1

aws dynamodb create-table \
  --table-name fortune-compass-tflock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-northeast-1
```

#### 3. インフラ構築

```bash
cd infra/terraform/environments/dev
terraform init
terraform apply \
  -var="frontend_image=<ECR_REGISTRY>/fortune-compass-dev-frontend:latest" \
  -var="backend_image=<ECR_REGISTRY>/fortune-compass-dev-backend:latest"
```

#### 4. CI/CD (GitHub Actions)

`master` ブランチへの push で自動デプロイされます。

必要な設定:
- **GitHub Secret**: `AWS_ACCOUNT_ID`, `ANTHROPIC_API_KEY`
- **AWS**: IAM OIDC Provider + `fortune-compass-github-actions` ロール

### 推定コスト（月額）

| リソース | 概算 |
|---------|------|
| EC2 t3.small (k3s) | ~$9（停止時 $0） |
| EBS 20GB (gp3) | ~$2 |
| CloudFront | ~$0（無料枠内） |
| その他 (ECR, CloudWatch, S3) | ~$3 |
| Management Console (Lambda, Step Functions, API GW, S3) | $0（無料枠内） |
| **合計** | **~$14/月**（EC2 停止時は ~$5/月） |
