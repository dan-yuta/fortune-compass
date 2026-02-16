# Fortune Compass — システム全体解説書

> 本ドキュメントは Fortune Compass のシステム構成・仕組み・技術的詳細を人に説明するために作成したものです。
> アプリの画面フロー、占いロジック、バックエンド/フロントエンドの設計、インフラ構成、CI/CD まで網羅しています。

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [システム全体構成図](#2-システム全体構成図)
3. [画面フローと機能](#3-画面フローと機能)
4. [フロントエンド設計](#4-フロントエンド設計)
5. [バックエンド設計](#5-バックエンド設計)
6. [占いロジック詳細](#6-占いロジック詳細)
7. [データフロー](#7-データフロー)
8. [デザインシステム](#8-デザインシステム)
9. [Docker 構成](#9-docker-構成)
10. [AWS インフラ構成](#10-aws-インフラ構成)
11. [CI/CD パイプライン](#11-cicd-パイプライン)
12. [セキュリティ設計](#12-セキュリティ設計)
13. [ファイル一覧](#13-ファイル一覧)

---

## 1. プロジェクト概要

### 何を作ったか

**Fortune Compass** は、4 つの占術（星座占い・数秘術・血液型占い・タロット占い）で毎日の運勢を占える Web アプリケーションです。

### 基本情報

| 項目 | 内容 |
|------|------|
| アプリ名 | Fortune Compass |
| アプリURL | https://d71oywvumn06c.cloudfront.net |
| GitHub | https://github.com/dan-yuta/fortune-compass (private) |
| フロントエンド | Next.js 16.1.6 (App Router) + Tailwind CSS v4 |
| バックエンド | Express 5.x + TypeScript |
| インフラ | AWS (CloudFront / ALB / ECS Fargate / ECR / VPC) |
| IaC | Terraform（35 リソース） |
| CI/CD | GitHub Actions（OIDC 認証） |
| テスト | Jest + Supertest（75 テストケース / カバレッジ 90.17%） |

### 対応する占術

| 占術 | 入力 | 結果 | 日替わり |
|------|------|------|---------|
| 星座占い | 生年月日 | 星座・スコア・ラッキーカラー・ラッキーアイテム・アドバイス | はい |
| 数秘術 | 生年月日 + 名前 | 運命数・性格特徴・年運・相性数・アドバイス | いいえ（固定） |
| 血液型占い | 血液型 | 性格・スコア・相性ランキング・アドバイス | はい |
| タロット占い | なし | 3 枚のカード（過去・現在・未来）+ 総合メッセージ | 毎回変動 |

---

## 2. システム全体構成図

### 本番環境（AWS）

```
                        ┌──────────┐
                        │  ユーザー │
                        │(ブラウザ) │
                        └────┬─────┘
                             │ HTTPS
                    ┌────────▼────────┐
                    │   CloudFront    │
                    │   (CDN)         │
                    │                 │
                    │ /_next/static/* │→ キャッシュから返却（7日）
                    │ /api/*         │→ ALB に転送（キャッシュ無効）
                    │ /*             │→ ALB に転送（キャッシュ無効）
                    └────────┬────────┘
                             │ HTTP
                    ┌────────▼────────┐
                    │      ALB        │   Public Subnets (2 AZ)
                    │  (port 80)      │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │ Listener    │ │
                    │ │ Rules       │ │
                    │ └──┬──────┬──┘ │
                    └────┼──────┼────┘
               /api/*    │      │       /* (default)
              ┌──────────┘      └──────────┐
              ▼                            ▼
    ┌──────────────────┐       ┌──────────────────┐
    │  ECS Service     │       │  ECS Service     │
    │  Backend         │       │  Frontend        │
    │                  │       │                  │
    │  Express :8080   │       │  Next.js :3000   │
    │  0.25 vCPU       │       │  0.25 vCPU       │
    │  512 MB          │       │  512 MB          │
    └────────┬─────────┘       └────────┬─────────┘
             │    Private Subnets (2 AZ)    │
             └──────────┬───────────────────┘
                        │
                 ┌──────▼──────┐
                 │ NAT Gateway │ → Internet（ECR pull, ログ送信）
                 └─────────────┘
```

### ローカル開発環境

```
    ┌──────────────────┐
    │    ブラウザ        │
    │  localhost:3000   │
    └────────┬─────────┘
             │
    ┌────────▼─────────┐        ┌──────────────────┐
    │  Next.js (dev)   │        │  Express (dev)   │
    │  :3000           │───────→│  :8080           │
    │                  │ proxy  │                  │
    │  next dev        │/api/*  │  ts-node-dev     │
    └──────────────────┘        └──────────────────┘
             │
    ┌────────▼─────────┐
    │  localStorage    │
    │  プロフィール保存  │
    └──────────────────┘
```

**開発時と本番の違い:**
- 開発: Next.js の `rewrites` で `/api/*` をバックエンドにプロキシ
- 本番: ALB がパスベースで直接振り分け（プロキシ不要）

---

## 3. 画面フローと機能

### 画面遷移図

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  トップページ (/)                                                │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  ✦ Fortune Compass                                    │      │
│  │  あなたの運命を照らす総合占い                             │      │
│  │                                                       │      │
│  │  [占いを始める] ← プロフィール有無で遷移先が変わる        │      │
│  │                                                       │      │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │      │
│  │  │ 星座   │ │ 数秘術 │ │ 血液型 │ │ タロット│         │      │
│  │  │ 占い   │ │        │ │ 占い   │ │ 占い   │         │      │
│  │  └────────┘ └────────┘ └────────┘ └────────┘         │      │
│  └───────────────────────────────────────────────────────┘      │
│         │                                                       │
│         │ プロフィール未登録                                      │
│         ▼                                                       │
│  プロフィール入力 (/profile)                                      │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  名前:     [            ]                             │      │
│  │  フリガナ:  [            ] (カタカナ → ローマ字自動変換)  │      │
│  │  生年月日:  [年▼] [月▼] [日▼]                          │      │
│  │  血液型:   [A] [B] [O] [AB] (任意)                    │      │
│  │                                                       │      │
│  │  [保存して占う] → localStorage に保存                   │      │
│  └───────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  占術選択 (/fortune)                                             │
│  ┌───────────────────────────────────────────────────────┐      │
│  │  〇〇さん、今日の運勢を占いましょう                       │      │
│  │                                                       │      │
│  │  ┌──────────────┐  ┌──────────────┐                   │      │
│  │  │ ☆ 星座占い   │  │ # 数秘術    │                   │      │
│  │  │ 12星座で占う  │  │ 運命数で占う │                   │      │
│  │  └──────┬───────┘  └──────┬───────┘                   │      │
│  │  ┌──────┼───────┐  ┌──────┼───────┐                   │      │
│  │  │ 💧 血液型    │  │ 🂡 タロット  │                   │      │
│  │  │ 相性を占う   │  │ カードで占う │                   │      │
│  │  └──────┬───────┘  └──────┬───────┘                   │      │
│  │         │                 │                           │      │
│  │  ※血液型未登録時はグレーアウト                          │      │
│  └─────────┼─────────────────┼───────────────────────────┘      │
│            │                 │                                   │
│    ┌───────┼────┬────────────┼────┐                              │
│    ▼       ▼    ▼            ▼    │                              │
│  星座    数秘術  血液型    タロット │                              │
│  結果    結果    結果      結果    │                              │
│                                   │                              │
│         ←── 戻る ────────────────┘                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 各画面の詳細

| 画面 | パス | 説明 |
|------|------|------|
| トップ | `/` | ヒーローセクション + CTA ボタン + 4 占術アイコン |
| プロフィール | `/profile` | 名前・フリガナ・生年月日・血液型の入力フォーム |
| 占術選択 | `/fortune` | 4 占術のカード選択。プロフィール未登録なら `/profile` にリダイレクト |
| 星座結果 | `/fortune/zodiac` | 星座名・スコア（星 1〜5）・ラッキーカラー/アイテム・アドバイス |
| 数秘術結果 | `/fortune/numerology` | 運命数（大きな数字表示）・性格バッジ・年運・相性数 |
| 血液型結果 | `/fortune/blood-type` | 血液型・スコア・性格・相性ランキング（色分け）・アドバイス |
| タロット結果 | `/fortune/tarot` | 3 枚カード表示 + 正逆位置 + 各カード解釈 + 総合メッセージ |

---

## 4. フロントエンド設計

### 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | 16.1.6 | App Router ベースのフレームワーク |
| React | 19.2.3 | UI ライブラリ |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 4.x | ユーティリティファーストCSS |
| Lucide React | 0.564.x | アイコンライブラリ |

### ディレクトリ構成

```
frontend/src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                #   ルートレイアウト（Header + フォント + ダークテーマ）
│   ├── page.tsx                  #   トップページ（ヒーロー + CTA）
│   ├── globals.css               #   デザインシステム定義（@theme）
│   ├── health/
│   │   └── route.ts              #   ヘルスチェック API（ALB 用）
│   ├── profile/
│   │   └── page.tsx              #   プロフィール入力フォーム（268行）
│   └── fortune/
│       ├── page.tsx              #   占術選択画面
│       ├── zodiac/page.tsx       #   星座占い結果（138行）
│       ├── numerology/page.tsx   #   数秘術結果（153行）
│       ├── blood-type/page.tsx   #   血液型占い結果（158行）
│       └── tarot/page.tsx        #   タロット結果（165行）
│
├── components/
│   ├── Header.tsx                #   固定ヘッダー（ロゴ + プロフィールリンク）
│   └── fortune/
│       ├── FortuneCard.tsx       #   占術選択カード（有効/無効切替）
│       ├── ScoreDisplay.tsx      #   星スコア表示（1〜5、色分け）
│       ├── LoadingState.tsx      #   ローディングアニメーション
│       ├── ErrorState.tsx        #   エラー表示 + リトライボタン
│       └── ResultCard.tsx        #   結果セクションのカード枠
│
└── lib/
    ├── types.ts                  #   型定義（UserProfile, 各 Result 型）
    ├── storage.ts                #   localStorage 管理 + React 同期
    ├── api-client.ts             #   API 呼び出し（4 占術 + 汎用 POST）
    └── kana-to-romaji.ts         #   カタカナ → ローマ字変換（85+ マッピング）
```

### 状態管理

データベースを使わず、**localStorage** でユーザーのプロフィールを管理しています。

```
┌───────────────────────────────────────────────────────┐
│                    localStorage                       │
│                                                       │
│  Key: "fortune-compass-profile"                       │
│  Value: {                                             │
│    "name": "田中太郎",                                 │
│    "nameKana": "タナカタロウ",                          │
│    "nameRomaji": "tanakataroo",   ← 自動変換          │
│    "birthday": "1990-05-15",                          │
│    "bloodType": "A"               ← null の場合あり    │
│  }                                                    │
└───────────────────────────────────────────────────────┘
```

**React との同期方法:**

`useSyncExternalStore` フックを使い、localStorage の変更を React コンポーネントにリアルタイム反映しています。

```
storage.ts
├── getProfileSnapshot()     ← 現在のプロフィールを返す（キャッシュ付き）
├── getHasProfileSnapshot()  ← プロフィールの有無を返す
├── subscribeStorage(cb)     ← 変更イベントを購読
├── saveProfile(profile)     ← 保存 + キャッシュ無効化
└── loadProfile()            ← 読み込み
```

### カタカナ → ローマ字変換

数秘術の占いでは名前のローマ字が必要です。フリガナ（カタカナ）を自動でローマ字に変換する仕組みがあります。

```
入力: "タナカタロウ"

変換テーブル:
  タ→ta, ナ→na, カ→ka, タ→ta, ロ→ro, ウ→u

出力: "tanakataroo"
```

**対応パターン:**
- 基本カタカナ 85+ 文字（ア〜ン、濁音、半濁音）
- 拗音（シャ→sha、チャ→cha 等）30+ パターン
- 促音（ッ → 次の子音を重ねる）
- 長音（ー → 直前の母音を繰り返す）

---

## 5. バックエンド設計

### 技術スタック

| 技術 | バージョン | 用途 |
|------|----------|------|
| Express | 5.2.x | HTTP フレームワーク |
| TypeScript | 5.x | 型安全 |
| Jest | 30.x | テストフレームワーク |
| Supertest | - | API テスト |
| ts-node-dev | - | 開発時のホットリロード |

### ディレクトリ構成

```
backend/src/
├── index.ts                     # エントリポイント（Express 設定、ミドルウェア）
├── routes/
│   └── fortune.ts               # 4 エンドポイントのルーティング + バリデーション
├── services/                    # 占いロジック（ビジネスロジック層）
│   ├── zodiac.ts                #   星座占い
│   ├── numerology.ts            #   数秘術
│   ├── blood-type.ts            #   血液型占い
│   └── tarot.ts                 #   タロット占い
├── data/                        # マスターデータ（静的データ層）
│   ├── zodiac-data.ts           #   12 星座の境界日、エレメント、アドバイス文
│   ├── tarot-cards.ts           #   大アルカナ 22 枚のデータ
│   └── blood-type-data.ts       #   A/B/O/AB の性格・相性データ
└── utils/
    └── seed-random.ts           # djb2 ハッシュ + シード付き乱数
```

### API エンドポイント

すべて `POST` メソッド。

| エンドポイント | リクエストボディ | レスポンス |
|--------------|----------------|----------|
| `POST /api/fortune/zodiac` | `{ birthday: "1990-05-15" }` | 星座・スコア・ラッキー情報 |
| `POST /api/fortune/numerology` | `{ birthday: "1990-05-15", name: "tanakataroo" }` | 運命数・性格・年運 |
| `POST /api/fortune/blood-type` | `{ bloodType: "A" }` | 性格・スコア・相性ランキング |
| `POST /api/fortune/tarot` | `{}` | 3 枚カード + 総合メッセージ |
| `GET /api/health` | — | `{ status: "ok", timestamp: "..." }` |

### バリデーション

各エンドポイントで入力値を検証し、不正な値には `400 Bad Request` を返します。

```
POST /api/fortune/zodiac
├── birthday が存在するか？        → 400: "birthday is required"
├── Date パースが有効か？           → 400: "Invalid birthday format"
└── サービス内でエラー？            → 500: "Internal server error"

POST /api/fortune/blood-type
├── bloodType が存在するか？        → 400: "bloodType is required"
├── A/B/O/AB のいずれかか？        → 400: "Invalid blood type"
└── サービス内でエラー？            → 500: "Internal server error"
```

### ミドルウェア構成

```
Express App
  │
  ├── cors({ origin: CORS_ORIGIN })     ← CORS 制御
  ├── express.json()                     ← JSON パース
  ├── GET /api/health                    ← ヘルスチェック
  └── /api/fortune/*                     ← 占いルーター
        ├── POST /zodiac
        ├── POST /numerology
        ├── POST /blood-type
        └── POST /tarot
```

---

## 6. 占いロジック詳細

### 6.1 共通の仕組み: シード付き乱数

星座占い・血液型占いでは「日替わりだが同日同結果」を実現するため、**シード付き疑似乱数**を使っています。

```
┌─────────────────────────────────────────────────────────┐
│                  seed-random.ts                          │
│                                                         │
│  1. 今日の日付を取得 → "2026-02-16"                       │
│                                                         │
│  2. シード文字列を組み立て                                 │
│     例: "2026-02-16-aries-score"                         │
│                                                         │
│  3. djb2 ハッシュ関数でハッシュ値を算出                     │
│     hash = 5381                                          │
│     for each char: hash = (hash * 33) ^ charCode         │
│     hash = hash >>> 0  (符号なし32bit整数に変換)           │
│                                                         │
│  4. sin関数で 0〜1 の疑似乱数に変換                        │
│     x = Math.sin(hash) * 10000                           │
│     random = x - Math.floor(x)                           │
│                                                         │
│  5. スコア（1〜5）やリスト選択に使用                        │
│     score = Math.floor(random * 5) + 1                   │
│     choice = array[Math.floor(random * array.length)]    │
└─────────────────────────────────────────────────────────┘
```

**特徴:**
- 同じ日付 + 同じ入力 → 必ず同じ結果（再現性）
- 日付が変わると結果も変わる（日替わり感）
- データベース不要（計算のみで完結）

---

### 6.2 星座占い

**アルゴリズム:**

```
入力: birthday = "1990-05-15"
  │
  ▼
① 月日を抽出 → month=5, day=15
  │
  ▼
② 12星座テーブルから該当する星座を判定
   ┌──────────┬───────────────┬──────────┐
   │ 星座      │ 期間          │ エレメント │
   ├──────────┼───────────────┼──────────┤
   │ 牡羊座    │ 3/21 〜 4/19  │ 火        │
   │ 牡牛座    │ 4/20 〜 5/20  │ 地        │  ← 5/15 はここ
   │ 双子座    │ 5/21 〜 6/21  │ 風        │
   │ ...       │ ...           │ ...       │
   │ 山羊座    │ 12/22 〜 1/19 │ 地        │  ← 年跨ぎ対応あり
   └──────────┴───────────────┴──────────┘
  │
  ▼
③ シード付き乱数で日替わりスコア・ラッキー情報を算出
   seed = "2026-02-16-taurus"
   score      = seededScore(seed + "-score")      → 1〜5
   luckyColor = seededChoice(seed + "-color", 15色) → "パープル"
   luckyItem  = seededChoice(seed + "-item",  15品) → "手帳"
   advice     = seededChoice(seed + "-advice", 15文) → "直感を信じて..."
  │
  ▼
出力: { sign: "牡牛座", element: "地", score: 3,
        luckyColor: "パープル", luckyItem: "手帳", advice: "..." }
```

**山羊座の年跨ぎ処理:**
山羊座は 12/22〜1/19 と年を跨ぐため、他の星座より先に判定します（`findZodiacSign` 関数の先頭で処理）。

---

### 6.3 数秘術

**アルゴリズム:**

```
入力: birthday = "1990-05-15", name = "tanakataroo"
  │
  ├──────────────────────────────────────────────┐
  ▼                                              ▼
① 生年月日の運命数算出                          ② 名前のピタゴリアン変換
  "1990-05-15" → "19900515"                      ピタゴリアンテーブル:
  1+9+9+0+0+5+1+5 = 30                           a=1 b=2 c=3 d=4 e=5
  3+0 = 3                                         f=6 g=7 h=8 i=9
  → 運命数: 3                                     j=1 k=2 l=3 m=4 ...

  ※ マスターナンバー判定:                          t+a+n+a+k+a+t+a+r+o+o
  11, 22, 33 が出たら還元せず保持                    = 2+1+5+1+2+1+2+1+9+6+6
  例: 合計=29 → 2+9=11 → 停止（マスターナンバー）    = 36 → 3+6 = 9
  │                                              │
  ▼                                              ▼
③ 運命数に対応する固定データを返す              （現在は運命数のみ使用）
   運命数 3:
   ├── 性格: ["創造性", "表現力", "社交性"]
   ├── 年運: "表現力が輝く年..."
   ├── 相性: [1, 5]
   └── アドバイス: "創造力を存分に発揮しましょう..."
  │
  ▼
出力: { destinyNumber: 3, personalityTraits: [...],
        yearFortune: "...", compatibility: [1,5], advice: "..." }
```

**運命数の意味:**
| 運命数 | キーワード |
|--------|----------|
| 1 | リーダーシップ・独立心・開拓精神 |
| 2 | 協調性・感受性・思いやり |
| 3 | 創造性・表現力・社交性 |
| 4 | 堅実・忍耐力・組織力 |
| 5 | 自由・冒険心・適応力 |
| 6 | 愛情・責任感・調和 |
| 7 | 知的・分析的・内省的 |
| 8 | 野心・実行力・成功志向 |
| 9 | 博愛・理想主義・芸術性 |
| 11 | 直感力・スピリチュアル（マスターナンバー） |
| 22 | ビジョナリー・実現力（マスターナンバー） |
| 33 | マスターヒーラー・無条件の愛（マスターナンバー） |

---

### 6.4 血液型占い

**アルゴリズム:**

```
入力: bloodType = "A"
  │
  ▼
① 固定データから性格・相性を取得
   ┌────────┬────────────────────────┬──────────────┐
   │ 血液型  │ 性格                   │ 相性ランキング │
   ├────────┼────────────────────────┼──────────────┤
   │ A型     │ 几帳面で誠実、協調性が高い │ A → AB → O → B │
   │ B型     │ マイペースで好奇心旺盛    │ B → AB → O → A │
   │ O型     │ おおらかでリーダー気質     │ O → A → B → AB │
   │ AB型    │ 冷静で合理的、ミステリアス │ AB → B → A → O │
   └────────┴────────────────────────┴──────────────┘
  │
  ▼
② シード付き乱数で日替わりスコア・アドバイスを算出
   seed = "2026-02-16-A"
   score  = seededScore(seed + "-score")       → 1〜5
   advice = seededChoice(seed + "-advice", 12文) → "周囲との調和を..."
  │
  ▼
出力: { bloodType: "A", personality: "几帳面で...",
        score: 4, compatibilityRanking: ["A","AB","O","B"],
        advice: "周囲との調和を..." }
```

---

### 6.5 タロット占い

**アルゴリズム:**

```
入力: なし（毎回ランダム）
  │
  ▼
① 大アルカナ 22 枚を Fisher-Yates シャッフル
   [愚者, 魔術師, 女教皇, 女帝, 皇帝, 教皇, 恋人, 戦車,
    力, 隠者, 運命の輪, 正義, 吊るされた男, 死神, 節制,
    悪魔, 塔, 星, 月, 太陽, 審判, 世界]

   Fisher-Yates:
   for i = 21 → 1:
     j = random(0 〜 i)
     swap(cards[i], cards[j])   ← Math.random() 使用
  │
  ▼
② 上から 3 枚を抽出
   ┌───────────┬───────────┬───────────┐
   │  1枚目     │  2枚目     │  3枚目     │
   │  過去      │  現在      │  未来      │
   │  (past)    │ (present)  │ (future)   │
   └───────────┴───────────┴───────────┘
  │
  ▼
③ 各カードの正逆判定（50% の確率）
   isReversed = Math.random() < 0.5
   ├── 正位置 → meaning（正位置の意味）を表示
   └── 逆位置 → reversedMeaning（逆位置の意味）を表示
  │
  ▼
④ 総合メッセージをランダム選択（12 パターン）
  │
  ▼
出力: { spread: "three-card",
        cards: [
          { positionLabel: "過去", name: "塔", isReversed: false,
            meaning: "急激な変化、破壊と再生..." },
          { positionLabel: "現在", name: "星", isReversed: true,
            reversedMeaning: "希望の喪失、失望..." },
          { positionLabel: "未来", name: "太陽", isReversed: false,
            meaning: "成功、喜び、達成..." }
        ],
        overallMessage: "カードは内なる成長の道を示しています..." }
```

**タロットが他の占いと異なる点:**
- `Math.random()` を使用（シード付き乱数ではない）
- **毎回異なる結果**が出る（リロードで変わる）
- 「もう一度引く」ボタンで再抽選可能

---

## 7. データフロー

### API リクエスト〜レスポンスの全体フロー

```
┌──────────────┐   ┌──────────────────┐   ┌────────────────────────────┐
│  ブラウザ     │   │  フロントエンド    │   │  バックエンド               │
│              │   │  (Next.js)       │   │  (Express)                │
└──────┬───────┘   └────────┬─────────┘   └──────────┬─────────────────┘
       │                    │                        │
       │  1. 占術を選択      │                        │
       │ ────────────────→  │                        │
       │                    │                        │
       │                    │  2. localStorage から    │
       │                    │     プロフィール読込     │
       │                    │                        │
       │                    │  3. POST /api/fortune/  │
       │                    │     zodiac              │
       │                    │  ──────────────────→    │
       │                    │  { birthday: "..." }    │
       │                    │                        │
       │                    │                        │  4. バリデーション
       │                    │                        │
       │                    │                        │  5. 星座判定
       │                    │                        │     (zodiac-data.ts)
       │                    │                        │
       │                    │                        │  6. シード乱数で
       │                    │                        │     スコア等算出
       │                    │                        │     (seed-random.ts)
       │                    │                        │
       │                    │  7. JSON レスポンス     │
       │                    │  ←──────────────────   │
       │                    │  { sign, score, ... }   │
       │                    │                        │
       │  8. 結果画面を表示  │                        │
       │ ←────────────────  │                        │
       │  スコア（星）       │                        │
       │  ラッキーカラー     │                        │
       │  アドバイス         │                        │
       │                    │                        │
```

### 本番環境でのネットワークフロー

```
ブラウザ
  │
  │ GET https://d71oywvumn06c.cloudfront.net/fortune/zodiac
  ▼
CloudFront
  │ パス: /fortune/zodiac → キャッシュなし → ALB に転送
  ▼
ALB (Listener Rule: /* → Frontend TG)
  │
  ▼
Frontend コンテナ (Next.js :3000)
  │ HTML を返却
  ▼
ブラウザ（HTML レンダリング）
  │
  │ POST https://d71oywvumn06c.cloudfront.net/api/fortune/zodiac
  ▼
CloudFront
  │ パス: /api/* → キャッシュなし → ALB に転送
  ▼
ALB (Listener Rule: /api/* → Backend TG, 優先度 100)
  │
  ▼
Backend コンテナ (Express :8080)
  │ JSON を返却
  ▼
CloudFront → ブラウザ
```

---

## 8. デザインシステム

### カラーパレット

ダークテーマベースの神秘的な UI。`globals.css` の `@theme` で定義。

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  背景色                                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │ midnight  │  │deep-purple│  │ twilight  │           │
│  │ #0f0a1e   │  │ #1a1333   │  │ #251d3d   │           │
│  │ メイン背景 │  │ カード背景 │  │ 入力欄背景 │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  アクセントカラー                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  mystic-  │  │ celestial-│  │  aurora-  │           │
│  │  purple   │  │   gold    │  │  green    │           │
│  │ #8b5cf6   │  │ #f5c542   │  │ #34d399   │           │
│  │ プライマリ │  │ 強調・スコア│  │ 成功・高得点│           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
│  ┌───────────┐  ┌───────────┐                           │
│  │  ember-   │  │  crimson  │                           │
│  │  orange   │  │ #f43f5e   │                           │
│  │ #fb923c   │  │ エラー・   │                           │
│  │ 中間スコア │  │ 低スコア   │                           │
│  └───────────┘  └───────────┘                           │
│                                                         │
│  テキストカラー                                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  primary  │  │ secondary │  │  muted    │           │
│  │ #f0edf6   │  │ #a89ec4   │  │ #6b6183   │           │
│  │ メインテキスト│  │ 補足テキスト│  │ 薄いテキスト│           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### スコア表示の色分け

`ScoreDisplay` コンポーネントでスコアに応じて色が変わります。

| スコア | 星の数 | 色 | 印象 |
|--------|-------|-----|------|
| 5 | ★★★★★ | celestial-gold (#f5c542) | 最高 |
| 4 | ★★★★☆ | aurora-green (#34d399) | 好調 |
| 3 | ★★★☆☆ | mystic-purple (#8b5cf6) | 普通 |
| 2 | ★★☆☆☆ | ember-orange (#fb923c) | やや低調 |
| 1 | ★☆☆☆☆ | crimson (#f43f5e) | 要注意 |

### フォント

| フォント | 用途 |
|---------|------|
| Inter | 英字・数字 |
| Noto Sans JP | 日本語テキスト |

### アニメーション

- **fade-in**: ページ遷移時に下から 8px スライドしながらフェードイン（0.5 秒）
- **pulse**: ローディング中の星アイコンが脈動（3 つの星が 150ms ずつずれて表示）

---

## 9. Docker 構成

### バックエンド Dockerfile

```
┌─────────────────────────────────────────┐
│  Stage 1: builder                       │
│  node:20-alpine                         │
│                                         │
│  npm ci                                 │
│  tsc (TypeScript → JavaScript)          │
│  → /app/dist/ 生成                      │
└──────────────────┬──────────────────────┘
                   │ dist/ のみコピー
┌──────────────────▼──────────────────────┐
│  Stage 2: runner                        │
│  node:20-alpine                         │
│                                         │
│  npm ci --omit=dev (本番依存のみ)        │
│  COPY dist/ from builder                │
│  USER node (非root)                     │
│  EXPOSE 8080                            │
│  CMD ["node", "dist/index.js"]          │
│                                         │
│  → 軽量イメージ（devDependencies 除外）   │
└─────────────────────────────────────────┘
```

### フロントエンド Dockerfile

```
┌─────────────────────────────────────────┐
│  Stage 1: deps                          │
│  node:20-alpine                         │
│                                         │
│  npm ci (全依存インストール)              │
└──────────────────┬──────────────────────┘
                   │ node_modules
┌──────────────────▼──────────────────────┐
│  Stage 2: builder                       │
│  node:20-alpine                         │
│                                         │
│  next build                             │
│  → .next/standalone/ 生成               │
│  → .next/static/ 生成                   │
└──────────────────┬──────────────────────┘
                   │ standalone + static + public
┌──────────────────▼──────────────────────┐
│  Stage 3: runner                        │
│  node:20-alpine                         │
│                                         │
│  COPY standalone/server.js              │
│  COPY .next/static/                     │
│  COPY public/                           │
│  USER nextjs (非root, UID 1001)         │
│  EXPOSE 3000                            │
│  CMD ["node", "server.js"]              │
│                                         │
│  → 超軽量（standalone = 必要ファイルのみ） │
└─────────────────────────────────────────┘
```

**standalone モードのメリット:**
通常の Next.js ビルドでは `node_modules` 全体（数百 MB）が必要ですが、standalone モードでは必要なファイルのみをコピーするため、Docker イメージが大幅に軽量化されます。

---

## 10. AWS インフラ構成

### 使用 AWS サービス一覧

| # | サービス | 役割 | 月額概算 |
|---|---------|------|---------|
| 1 | VPC | 仮想ネットワーク（4 サブネット + ルーティング） | $0 |
| 2 | Internet Gateway | VPC ↔ インターネット通信 | $0 |
| 3 | NAT Gateway | Private Subnet → インターネット（ECR pull 等） | ~$32 |
| 4 | Elastic IP | NAT Gateway 用固定 IP | $0 |
| 5 | ALB | パスベースルーティング（/api/* → Backend, /* → Frontend） | ~$18 |
| 6 | CloudFront | HTTPS 終端 + 静的アセットキャッシュ | ~$0 |
| 7 | ECS Fargate | コンテナ実行（Frontend + Backend の 2 サービス） | ~$15 |
| 8 | ECR | Docker イメージ保管（2 リポジトリ） | ~$1 |
| 9 | CloudWatch Logs | コンテナログ収集（14 日保持） | ~$1 |
| 10 | S3 | Terraform ステートファイル保存 | < $1 |
| 11 | DynamoDB | Terraform ステートロック | < $1 |
| 12 | IAM | ロール・ポリシー管理 | $0 |
| | **合計** | | **~$68/月** |

### ネットワーク構成

```
┌─────────────────────────────────────────────────────────────┐
│  VPC: 10.0.0.0/16                                           │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ Public Subnet            │  │ Public Subnet            │  │
│  │ 10.0.0.0/24              │  │ 10.0.1.0/24              │  │
│  │ ap-northeast-1a          │  │ ap-northeast-1c          │  │
│  │                          │  │                          │  │
│  │ [ALB] [NAT GW] [EIP]    │  │ [ALB]                    │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ Private Subnet           │  │ Private Subnet           │  │
│  │ 10.0.10.0/24             │  │ 10.0.11.0/24             │  │
│  │ ap-northeast-1a          │  │ ap-northeast-1c          │  │
│  │                          │  │                          │  │
│  │ [Frontend] [Backend]     │  │ (ECS タスク配置可能)      │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**なぜ Private Subnet？**
- ECS コンテナが直接インターネットに公開されない（セキュリティ向上）
- ALB 経由でのみアクセス可能
- NAT Gateway 経由で ECR pull やログ送信は可能

### セキュリティグループ

```
┌─────────────────┐          ┌─────────────────┐
│  ALB SG          │          │  ECS SG          │
│                  │          │                  │
│  Inbound:        │   許可    │  Inbound:        │
│  80/tcp ← 全IP  │─────────→│  3000/tcp ← ALB │
│                  │          │  8080/tcp ← ALB │
│  Outbound:       │          │                  │
│  All ← anywhere │          │  Outbound:       │
└─────────────────┘          │  All ← anywhere │
                              └─────────────────┘
```

### Terraform モジュール構成

```
infra/terraform/
├── modules/
│   ├── networking/      # VPC, Subnet x4, IGW, NAT GW, EIP,
│   │                    # Route Table x2, Association x4 (12リソース)
│   │
│   ├── ecr/             # ECR Repository x2,
│   │                    # Lifecycle Policy x2 (4リソース)
│   │
│   ├── alb/             # ALB, SG, Target Group x2,
│   │                    # Listener, Listener Rule x2 (7リソース)
│   │
│   ├── ecs/             # Cluster, Task Def x2, Service x2,
│   │                    # IAM Role x2, Log Group x2, SG (11リソース)
│   │
│   └── cloudfront/      # CloudFront Distribution (1リソース)
│
└── environments/
    └── dev/             # モジュール結合 + 変数 + State設定
        ├── main.tf      #   5モジュールの結合
        ├── variables.tf #   変数定義
        ├── outputs.tf   #   出力定義（URL等）
        └── backend.tf   #   S3 State設定
```

**合計: 35 リソース**

---

## 11. CI/CD パイプライン

### パイプライン全体図

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  開発者が git push origin master                                 │
│     │                                                           │
│     ▼                                                           │
│  GitHub Actions トリガー                                         │
│     │                                                           │
│     ├─── Job 1: test-backend (約19秒) ──────────────────────┐   │
│     │    │                                                  │   │
│     │    ├── actions/checkout@v4                             │   │
│     │    ├── actions/setup-node@v4 (Node 20)                │   │
│     │    ├── npm ci (依存インストール)                        │   │
│     │    └── npm test (75テスト実行)                          │   │
│     │         ├── 星座占いテスト (境界値24パターン含む)        │   │
│     │         ├── 数秘術テスト (マスターナンバー含む)          │   │
│     │         ├── 血液型テスト                               │   │
│     │         ├── タロットテスト (重複チェック含む)            │   │
│     │         └── APIエンドポイントテスト                      │   │
│     │                                                       │   │
│     │    テスト失敗 → パイプライン停止（デプロイされない）      │   │
│     │                                                       │   │
│     └─── Job 2: build-and-deploy (約1分50秒) ←── 依存 ─────┘   │
│          │                                                      │
│          ├── AWS OIDC 認証                                       │
│          │   └── IAM Role: fortune-compass-github-actions        │
│          │       （長寿命アクセスキーは使用しない）               │
│          │                                                      │
│          ├── ECR ログイン                                        │
│          │                                                      │
│          ├── Backend Docker build & push                        │
│          │   tag: ${git_sha} + latest                           │
│          │                                                      │
│          ├── Frontend Docker build & push                       │
│          │   tag: ${git_sha} + latest                           │
│          │                                                      │
│          ├── Terraform init                                     │
│          │                                                      │
│          └── Terraform apply -auto-approve                      │
│               └── ECS Task Definition 更新                       │
│                    └── ECS ローリングデプロイ                      │
│                         （新コンテナ起動 → ヘルスチェック通過      │
│                          → 旧コンテナ停止）                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### OIDC 認証の仕組み

GitHub Actions と AWS を安全に接続するため、**OIDC（OpenID Connect）**を使用しています。

```
GitHub Actions                        AWS
     │                                 │
     │  1. GitHub が JWT トークン発行    │
     │  ──────────────────────────→    │
     │     sub: repo:dan-yuta/         │
     │          fortune-compass:*      │
     │     aud: sts.amazonaws.com      │
     │                                 │
     │                                 │  2. AWS が JWT を検証
     │                                 │     (OIDC Provider 経由)
     │                                 │
     │                                 │  3. 条件一致で一時認証情報を発行
     │                                 │     (15分間有効)
     │  4. 一時認証情報を受け取り       │
     │  ←──────────────────────────   │
     │                                 │
     │  5. ECR push, Terraform apply   │
     │  ──────────────────────────→    │
```

**メリット:** AWS のアクセスキーを GitHub に保存する必要がなく、セキュリティが高い。

### イメージタグ戦略

| タグ | 例 | 用途 |
|-----|-----|------|
| git SHA | `761ebaa9fd19...` | 特定コミットに対応。ロールバック時に使用 |
| latest | `latest` | 常に最新。開発・確認用 |

---

## 12. セキュリティ設計

| レイヤー | 対策 | 詳細 |
|---------|------|------|
| 通信暗号化 | CloudFront HTTPS | デフォルト証明書で SSL/TLS 終端 |
| ネットワーク隔離 | Private Subnet | ECS コンテナは外部から直接アクセス不可 |
| ファイアウォール | Security Group | ECS は ALB からのみ通信許可（3000/8080） |
| 最小権限 | IAM | ECS タスクロールは ECR pull + Logs 書き込みのみ |
| CORS | Express ミドルウェア | CloudFront ドメインからのみ API リクエスト許可 |
| CI/CD 認証 | GitHub OIDC | 長寿命アクセスキー不使用、一時認証のみ |
| コンテナ実行 | 非 root ユーザー | Backend: `node` ユーザー / Frontend: `nextjs` ユーザー |
| イメージ管理 | ECR ライフサイクル | 10 世代超の古いイメージを自動削除 |
| 入力検証 | Express バリデーション | 全 API エンドポイントで入力値を検証、不正値は 400 |

---

## 13. ファイル一覧

### バックエンド（14 ファイル）

| ファイル | 行数 | 役割 |
|---------|------|------|
| `backend/src/index.ts` | 25 | Express エントリポイント、CORS、ヘルスチェック |
| `backend/src/routes/fortune.ts` | 78 | 4 エンドポイントのルーティング + バリデーション |
| `backend/src/services/zodiac.ts` | 57 | 星座判定 + シード付きスコア生成 |
| `backend/src/services/numerology.ts` | 82 | 運命数計算 + ピタゴリアン変換 |
| `backend/src/services/blood-type.ts` | 32 | 血液型判定 + シード付きスコア生成 |
| `backend/src/services/tarot.ts` | 61 | Fisher-Yates シャッフル + 3 枚抽出 |
| `backend/src/data/zodiac-data.ts` | 54 | 12 星座マスターデータ |
| `backend/src/data/tarot-cards.ts` | 47 | 大アルカナ 22 枚マスターデータ |
| `backend/src/data/blood-type-data.ts` | 38 | 血液型性格・相性マスターデータ |
| `backend/src/utils/seed-random.ts` | 27 | djb2 ハッシュ + シード付き乱数 |
| `backend/Dockerfile` | 20 | マルチステージ Docker ビルド |
| `backend/.dockerignore` | 5 | Docker ビルド除外設定 |
| `backend/package.json` | - | 依存・スクリプト定義 |
| `backend/tsconfig.json` | - | TypeScript 設定 |

### フロントエンド（20 ファイル）

| ファイル | 行数 | 役割 |
|---------|------|------|
| `frontend/src/app/layout.tsx` | 41 | ルートレイアウト（フォント + ダークテーマ + Header） |
| `frontend/src/app/page.tsx` | 80 | トップページ（ヒーロー + CTA + 占術アイコン） |
| `frontend/src/app/globals.css` | 37 | デザインシステム定義（@theme + アニメーション） |
| `frontend/src/app/health/route.ts` | 5 | ヘルスチェック API Route（ALB 用） |
| `frontend/src/app/profile/page.tsx` | 268 | プロフィール入力フォーム |
| `frontend/src/app/fortune/page.tsx` | 82 | 占術選択画面（4 カード） |
| `frontend/src/app/fortune/zodiac/page.tsx` | 138 | 星座占い結果表示 |
| `frontend/src/app/fortune/numerology/page.tsx` | 153 | 数秘術結果表示 |
| `frontend/src/app/fortune/blood-type/page.tsx` | 158 | 血液型占い結果表示 |
| `frontend/src/app/fortune/tarot/page.tsx` | 165 | タロット占い結果表示 |
| `frontend/src/components/Header.tsx` | 28 | 固定ヘッダー |
| `frontend/src/components/fortune/FortuneCard.tsx` | 66 | 占術選択カード |
| `frontend/src/components/fortune/ScoreDisplay.tsx` | 49 | 星スコア表示（1〜5） |
| `frontend/src/components/fortune/LoadingState.tsx` | 22 | ローディングアニメーション |
| `frontend/src/components/fortune/ErrorState.tsx` | 26 | エラー + リトライ |
| `frontend/src/components/fortune/ResultCard.tsx` | 15 | 結果セクション枠 |
| `frontend/src/lib/types.ts` | 55 | 型定義 |
| `frontend/src/lib/storage.ts` | 75 | localStorage 管理 + React 同期 |
| `frontend/src/lib/api-client.ts` | 60 | API クライアント（4 占術） |
| `frontend/src/lib/kana-to-romaji.ts` | 217 | カタカナ → ローマ字変換 |

### インフラ（17 ファイル）

| ファイル | 役割 |
|---------|------|
| `infra/terraform/modules/networking/{main,variables,outputs}.tf` | VPC, Subnet, IGW, NAT GW |
| `infra/terraform/modules/ecr/{main,variables,outputs}.tf` | ECR リポジトリ x2 |
| `infra/terraform/modules/alb/{main,variables,outputs}.tf` | ALB, Target Group, Listener |
| `infra/terraform/modules/ecs/{main,variables,outputs}.tf` | ECS Cluster, Service, Task Def |
| `infra/terraform/modules/cloudfront/{main,variables,outputs}.tf` | CloudFront Distribution |
| `infra/terraform/environments/dev/main.tf` | モジュール結合 |
| `infra/terraform/environments/dev/variables.tf` | 変数定義 |
| `infra/terraform/environments/dev/outputs.tf` | 出力定義 |
| `infra/terraform/environments/dev/backend.tf` | S3 State 設定 |

### CI/CD（1 ファイル）

| ファイル | 役割 |
|---------|------|
| `.github/workflows/deploy.yml` | テスト → Docker build → ECR push → Terraform apply |

### テスト（75 ケース）

| テストファイル | ケース数 | 内容 |
|-------------|---------|------|
| `backend/__tests__/services/zodiac.test.ts` | ~20 | 星座境界値、年跨ぎ、スコア範囲 |
| `backend/__tests__/services/numerology.test.ts` | ~15 | 運命数、マスターナンバー、名前変換 |
| `backend/__tests__/services/blood-type.test.ts` | ~10 | 全血液型、無効値 |
| `backend/__tests__/services/tarot.test.ts` | ~15 | 3 枚抽出、重複なし、正逆判定 |
| `backend/__tests__/routes/fortune.test.ts` | ~15 | API レスポンス、バリデーション、エラー |

**カバレッジ: 90.17%**
