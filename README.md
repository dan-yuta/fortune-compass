# Fortune Compass

総合占いWebアプリケーション。4つの占術（星座占い・数秘術・血液型占い・タロット占い）で毎日の運勢を占えます。

**URL**: https://d71oywvumn06c.cloudfront.net

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (:3000)                  │  │
│  │                                                       │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │  │  トップ  │→│プロフィール│→│    占術選択          │  │  │
│  │  │ page.tsx │  │profile/  │  │  fortune/page.tsx    │  │  │
│  │  └─────────┘  └──────────┘  └──┬──┬──┬──┬─────────┘  │  │
│  │                                │  │  │  │             │  │
│  │              ┌─────────────────┘  │  │  └──────┐      │  │
│  │              ▼        ▼           ▼          ▼        │  │
│  │         ┌────────┐┌────────┐┌────────┐┌────────┐     │  │
│  │         │星座占い││数秘術  ││血液型  ││タロット│     │  │
│  │         │zodiac/ ││numero- ││blood-  ││tarot/  │     │  │
│  │         │        ││logy/   ││type/   ││        │     │  │
│  │         └───┬────┘└───┬────┘└───┬────┘└───┬────┘     │  │
│  │             │         │         │         │           │  │
│  │             └─────┬───┴────┬────┘         │           │  │
│  │                   ▼        ▼              ▼           │  │
│  │              lib/api-client.ts                        │  │
│  │              fetch("/api/fortune/*")                   │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                   │
│              Next.js Rewrites (/api/* → :8080)              │
│                         │                                   │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │            Express Backend (:8080)                     │  │
│  │                                                       │  │
│  │  routes/fortune.ts                                    │  │
│  │  ┌──────────────────────────────────────────────────┐ │  │
│  │  │ POST /api/fortune/zodiac     → zodiac.ts         │ │  │
│  │  │ POST /api/fortune/numerology → numerology.ts     │ │  │
│  │  │ POST /api/fortune/blood-type → blood-type.ts     │ │  │
│  │  │ POST /api/fortune/tarot      → tarot.ts          │ │  │
│  │  └──────────────────────────────────────────────────┘ │  │
│  │                         │                             │  │
│  │       ┌─────────────────┼─────────────────┐           │  │
│  │       ▼                 ▼                 ▼           │  │
│  │  data/            utils/             services/        │  │
│  │  zodiac-data.ts   seed-random.ts     zodiac.ts       │  │
│  │  tarot-cards.ts   (djb2 hash +       numerology.ts   │  │
│  │  blood-type-      daily seed)        blood-type.ts   │  │
│  │    data.ts                           tarot.ts        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  localStorage                         │  │
│  │         プロフィール永続化 + 占い履歴保存               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
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
| コンテナ | Docker + ECS Fargate | - |
| CI/CD | GitHub Actions | - |

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
│   │   ├── networking/       #   VPC, Subnets, NAT GW
│   │   ├── ecr/              #   ECR リポジトリ
│   │   ├── alb/              #   ALB, Target Groups
│   │   ├── ecs/              #   ECS Cluster, Services
│   │   └── cloudfront/       #   CloudFront CDN
│   └── environments/
│       └── dev/              #   開発環境設定
│
├── backend/                  # Express APIサーバー
│   ├── src/
│   │   ├── index.ts          #   エントリポイント (:8080)
│   │   ├── routes/
│   │   │   └── fortune.ts    #   4占術のルーティング
│   │   ├── services/         #   占いロジック
│   │   │   ├── zodiac.ts     #     星座占い
│   │   │   ├── numerology.ts #     数秘術
│   │   │   ├── blood-type.ts #     血液型占い
│   │   │   └── tarot.ts      #     タロット占い
│   │   ├── data/             #   マスターデータ
│   │   │   ├── zodiac-data.ts
│   │   │   ├── tarot-cards.ts
│   │   │   └── blood-type-data.ts
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
        │       ├── page.tsx      # 占術選択
        │       ├── zodiac/       # 星座占い結果
        │       ├── numerology/   # 数秘術結果
        │       ├── blood-type/   # 血液型占い結果
        │       └── tarot/        # タロット占い結果
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
        │       ├── OtherFortunes.tsx  # 他占術へのショートカット
        │       └── ShareButtons.tsx   # SNSシェアボタン
        └── lib/
            ├── types.ts          # 型定義
            ├── storage.ts        # localStorage管理 (プロフィール)
            ├── history.ts        # localStorage管理 (占い履歴)
            ├── api-client.ts     # API呼び出し
            ├── useFortune.ts     # 占い共通フック (結果自動保存)
            ├── kana-to-romaji.ts # カタカナ→ローマ字変換 (外来語対応)
            └── i18n/             # 多言語対応
                ├── dictionaries.ts # 辞書 (ja/en)
                └── context.tsx     # I18nProvider
```

## セットアップ

### 前提条件

- Node.js 20 以上

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
| 4占術 | 星座占い・数秘術・血液型占い・タロット |
| SNSシェア | 結果をX(Twitter)/LINE/Facebookでシェア + リンクコピー |
| 占い履歴 | localStorage に過去の結果を保存・一覧表示 (最大50件) |
| 結果→他占術遷移 | 結果画面下部に他3占術へのショートカット |
| PWA | ホーム画面追加対応 (manifest.json) |
| OGP / SNS Card | Open Graph + Twitter Card メタデータ |
| SEO | sitemap.xml, robots.txt, JSON-LD 構造化データ |
| 多言語対応 (i18n) | 日本語 / English 切替 |
| アニメーション | Framer Motion (ページ遷移・カード表示) |
| アクセシビリティ | WCAG AA準拠カラーコントラスト・ARIA属性・スキップナビ・フォーカスリング |
| カスタム404 | 独自エラーページ |
| ヘルスチェック | `/health` (Frontend), `/api/health` (Backend) |

## API エンドポイント

すべて `POST` メソッド。フロントエンドからは Next.js の rewrites 経由でアクセスします。

| エンドポイント | リクエストボディ | 説明 |
|--------------|----------------|------|
| `/api/fortune/zodiac` | `{ birthday: "YYYY-MM-DD" }` | 星座占い |
| `/api/fortune/numerology` | `{ birthday: "YYYY-MM-DD", name: "ROMAJI" }` | 数秘術 |
| `/api/fortune/blood-type` | `{ bloodType: "A" \| "B" \| "O" \| "AB" }` | 血液型占い |
| `/api/fortune/tarot` | `{}` | タロット占い |

## 占いロジック

| 占術 | アルゴリズム | 日替わり |
|-----|------------|---------|
| 星座占い | 誕生日→12星座判定 + djb2シードでスコア算出 | はい（同日同結果） |
| 数秘術 | 生年月日の各桁合計→運命数（マスターナンバー11/22/33保持）+ ピタゴリアン変換 | はい |
| 血液型占い | 固定性格データ + djb2シードで日替わりスコア | はい |
| タロット | Fisher-Yates シャッフル → 大アルカナ22枚から3枚抽出 + 50%正逆判定 | いいえ（毎回ランダム） |

## 画面フロー

```
トップ (/)
  │
  ├── プロフィール未登録 → プロフィール入力 (/profile)
  │                              │
  │                              ▼
  └── プロフィール登録済み ──→ 占術選択 (/fortune)
                                 │
                    ┌────┬───────┼───────┬────┐
                    ▼    ▼       ▼       ▼    │
                  星座  数秘術  血液型  タロット│
                    │    │       │       │    │
                    │   [SNSシェア + 他占術ショートカット]
                    │    │       │       │    │
                    └──→ 履歴に自動保存 ←──┘    │
                              │               │
                         履歴 (/history)       │
                                              │
                        ← 戻る ───────────────┘
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
                    ┌─────────────┐
                    │  Internet   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ CloudFront  │  ← HTTPS 終端 + 静的アセットキャッシュ
                    │   (CDN)     │
                    └──────┬──────┘
                           │ HTTP (origin)
                    ┌──────▼──────┐
                    │     ALB     │  ← Public Subnets (2 AZs)
                    │   (port 80) │
                    └──┬───────┬──┘
         /api/*        │       │        /*
          ┌────────────┘       └────────────┐
          ▼                                 ▼
┌─────────────────┐              ┌─────────────────┐
│  ECS Service    │              │  ECS Service    │
│  Backend        │              │  Frontend       │
│  Express :8080  │              │  Next.js :3000  │
│  0.25 vCPU      │              │  0.25 vCPU      │
│  512 MB         │              │  512 MB         │
└────────┬────────┘              └────────┬────────┘
         │      Private Subnets (2 AZs)   │
         └────────────┬───────────────────┘
                      │
               ┌──────▼──────┐
               │ NAT Gateway │  → Internet (ECR pull等)
               └─────────────┘
```

CloudFront → ALB → ECS の3層構成:
- CloudFront が HTTPS を終端し、静的アセットをキャッシュ
- ALB がパスベースでルーティング: `/api/*` → Backend, `/*` → Frontend
- ECS Fargate が Private Subnet 上でコンテナを実行

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

`main` ブランチへの push で自動デプロイされます。

必要な設定:
- **GitHub Secret**: `AWS_ACCOUNT_ID`
- **AWS**: IAM OIDC Provider + `fortune-compass-github-actions` ロール

### 推定コスト（月額）

| リソース | 概算 |
|---------|------|
| Fargate (2タスク) | ~$15 |
| ALB | ~$18 |
| NAT Gateway | ~$32 |
| CloudFront | ~$0（無料枠内） |
| その他 (ECR, CloudWatch, S3) | ~$3 |
| **合計** | **~$68/月** |
