# Fortune Compass — デプロイの仕組み（中学生向けガイド）

> 「git push したら、どうやってアプリが更新されるの？」
> この疑問に、中学生でもわかるように答えるドキュメントです。

---

## 目次

1. [全体のイメージ（1枚の絵で理解する）](#1-全体のイメージ1枚の絵で理解する)
2. [登場人物の紹介](#2-登場人物の紹介)
3. [ソースコードマップ（どのファイルが何をしているか）](#3-ソースコードマップどのファイルが何をしているか)
4. [Step 1: git push — 「手紙をポストに入れる」](#4-step-1-git-push--手紙をポストに入れる)
5. [Step 2: テスト — 「答え合わせ」](#5-step-2-テスト--答え合わせ)
6. [Step 3: Docker ビルド — 「お弁当箱に詰める」](#6-step-3-docker-ビルド--お弁当箱に詰める)
7. [Step 4: ECR に送信 — 「冷蔵倉庫に預ける」](#7-step-4-ecr-に送信--冷蔵倉庫に預ける)
8. [Step 5: SSH 接続 — 「遠くのサーバーにリモコンで指示」](#8-step-5-ssh-接続--遠くのサーバーにリモコンで指示)
9. [Step 6: k3s がコンテナを入れ替え — 「お店の商品を入れ替える」](#9-step-6-k3s-がコンテナを入れ替え--お店の商品を入れ替える)
10. [Step 7: CloudFront 経由でユーザーに届く](#10-step-7-cloudfront-経由でユーザーに届く)
11. [API キーはどうやって安全に渡すの？](#11-api-キーはどうやって安全に渡すの)
12. [全体フロー図（まとめ）](#12-全体フロー図まとめ)
13. [ハンズオン: 実際に push して GitHub Actions を体験しよう](#13-ハンズオン-実際に-push-して-github-actions-を体験しよう)
14. [よくある質問](#14-よくある質問)

---

## 1. 全体のイメージ（1枚の絵で理解する）

まずは全体像をつかみましょう。難しいことは後で説明するので、今は「ふーん、こんな流れなんだ」と思うだけで大丈夫です。

```
あなたのパソコン          インターネットの世界                    ユーザー
 ┌──────────┐           ┌──────────────────────────────────┐
 │          │  git push │                                  │
 │  コード  │──────────►│  GitHub（コードの倉庫）            │
 │          │           │     │                            │
 └──────────┘           │     │ 「新しいコードが来た！」     │
                        │     ▼                            │
                        │  GitHub Actions（ロボット）       │
                        │     │                            │
                        │     │ ① テスト（答え合わせ）       │
                        │     │ ② お弁当箱に詰める（Docker） │
                        │     │ ③ 冷蔵倉庫に送る（ECR）     │
                        │     │ ④ サーバーに指示（SSH）      │
                        │     ▼                            │
                        │  AWS（アマゾンのクラウド）         │      ┌──────────┐
                        │     │                            │      │          │
                        │     │ ⑤ 古いアプリ → 新しいアプリ │─────►│ スマホ/PC │
                        │     │    に入れ替え（k3s）        │      │          │
                        │                                  │      └──────────┘
                        └──────────────────────────────────┘
```

**一言でまとめると**: あなたが `git push` するだけで、ロボット（GitHub Actions）が全部やってくれる。

---

## 2. 登場人物の紹介

デプロイには、いくつかの「登場人物」が関わっています。一人ずつ紹介します。

### 登場人物一覧

| 登場人物 | 役割 | 身近な例え |
|---------|------|-----------|
| **GitHub** | コードを保管する倉庫 | 図書館（本＝コードを預ける場所） |
| **GitHub Actions** | 自動で仕事をするロボット | 給食センターの全自動調理マシン |
| **Docker** | アプリをお弁当箱に詰める道具 | お弁当箱（中身と容器がセット） |
| **ECR** | お弁当箱を保管する冷蔵倉庫 | 冷蔵倉庫（何個でも保管できる） |
| **EC2** | アプリが動いているコンピューター | 学校の給食室（実際に料理を出す場所） |
| **k3s** | EC2 の中でアプリを管理する司令官 | 給食室の責任者（料理の入れ替えを指示） |
| **CloudFront** | ユーザーに素早くアプリを届ける | 各教室への配膳係（速い） |
| **GitHub Secrets** | パスワードや秘密を保管する金庫 | 鍵付きの金庫（中身は誰にも見えない） |

### 図で見る関係

```
┌─────────────────────────────────────────────────────────────┐
│  あなたのパソコン                                            │
│  ┌──────────────────────┐                                   │
│  │ fortune-compass/     │  ← ここでコードを書く              │
│  │   backend/           │                                   │
│  │   frontend/          │                                   │
│  └──────────────────────┘                                   │
└─────────────────────────────────────────────────────────────┘
         │
         │ git push（コードを送る）
         ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub                                                      │
│  ┌────────────────┐  ┌────────────────────────────────────┐ │
│  │ コードの倉庫    │  │ GitHub Actions（ロボット）          │ │
│  │ (リポジトリ)    │  │                                    │ │
│  │                │  │  テスト → ビルド → 送信 → デプロイ   │ │
│  └────────────────┘  └────────────────────────────────────┘ │
│  ┌────────────────┐                                         │
│  │ Secrets（金庫） │  ← パスワードや API キーを安全に保管    │
│  └────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
         │
         │ ビルド結果を送信 & SSH でデプロイ指示
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AWS（アマゾンのクラウド）                                     │
│                                                              │
│  ┌──────────┐    ┌──────────────────────────────────────┐   │
│  │   ECR    │    │  EC2 サーバー                          │   │
│  │ (冷蔵   │───►│  ┌──────────────────────────────────┐ │   │
│  │  倉庫)   │    │  │  k3s（司令官）                    │ │   │
│  └──────────┘    │  │  ┌────────┐  ┌────────────────┐ │ │   │
│                  │  │  │backend │  │   frontend     │ │ │   │
│                  │  │  │ (API)  │  │   (画面)       │ │ │   │
│                  │  │  └────────┘  └────────────────┘ │ │   │
│                  │  └──────────────────────────────────┘ │   │
│                  └──────────────────────────────────────┘   │
│                           │                                  │
│  ┌────────────────────────┘                                  │
│  │                                                           │
│  ▼                                                           │
│  ┌──────────────┐                                            │
│  │ CloudFront   │───► ユーザーのスマホ・PC                    │
│  │ (配膳係)     │                                            │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. ソースコードマップ（どのファイルが何をしているか）

デプロイに関わるファイルは、大きく **3つのフォルダ** に分かれています。
それぞれのファイルが「デプロイのどのステップ」で使われるかを一覧にしました。

### ファイル配置図

```
fortune-compass/
│
├── .github/workflows/
│   └── deploy.yml              ★ CI/CD パイプラインの設計図（これが全体の司令塔）
│
├── backend/
│   ├── Dockerfile              ★ バックエンドの Docker イメージの作り方
│   ├── src/
│   │   ├── index.ts            ★ ヘルスチェック（/api/health）の定義
│   │   ├── routes/
│   │   │   └── fortune.ts      　 19占術の API ルーティング
│   │   └── services/
│   │       ├── ai-reading.ts   ★ ANTHROPIC_API_KEY を使う（AI総合鑑定）
│   │       └── palm.ts         ★ ANTHROPIC_API_KEY を使う（手相占い）
│   └── __tests__/              　 テストファイル群（75ケース）
│
├── frontend/
│   └── Dockerfile              ★ フロントエンドの Docker イメージの作り方
│
└── k8s/                        ★ Kubernetes の設計図フォルダ
    ├── namespace.yaml          　 「fortune-compass」という区画を作る
    ├── backend-deployment.yaml ★ バックエンドの起動設定・ヘルスチェック・Secret参照
    ├── frontend-deployment.yaml　 フロントエンドの起動設定・ヘルスチェック
    ├── backend-service.yaml    　 バックエンドの通信設定（ポート8080）
    ├── frontend-service.yaml   　 フロントエンドの通信設定（ポート3000）
    └── ingress.yaml            ★ URL振り分け（/api → backend, / → frontend）
```

> **★マーク**が付いたファイルが、デプロイの仕組みに直接関わる重要ファイルです。

### デプロイステップ × ファイル対応表

| ステップ | 関連ファイル | 該当行 | 何をしているか |
|---------|------------|--------|--------------|
| ① トリガー | `.github/workflows/deploy.yml` | 3〜6行目 | `on: push: branches: [master]` で master push を検知 |
| ② テスト | `.github/workflows/deploy.yml` | 17〜28行目 | `npm test` を実行する Job の定義 |
| ② テスト | `backend/__tests__/` | 全体 | 75個のテストケース（占いロジック＋API） |
| ③ Docker ビルド | `.github/workflows/deploy.yml` | 46〜66行目 | `docker build` & `docker push` コマンド |
| ③ Docker ビルド | `backend/Dockerfile` | 全体(21行) | バックエンドの箱詰めレシピ |
| ③ Docker ビルド | `frontend/Dockerfile` | 全体(33行) | フロントエンドの箱詰めレシピ |
| ④ ECR 送信 | `.github/workflows/deploy.yml` | 42〜44行目 | ECR ログイン |
| ④ ECR 送信 | `.github/workflows/deploy.yml` | 55, 66行目 | `docker push --all-tags` |
| ⑤ SSH＆デプロイ | `.github/workflows/deploy.yml` | 68〜113行目 | SSH 接続してサーバー上でコマンド実行 |
| ⑤ Secret作成 | `.github/workflows/deploy.yml` | 80〜84行目 | `kubectl create secret` で API キー金庫を作成 |
| ⑤ イメージ更新 | `.github/workflows/deploy.yml` | 95〜101行目 | `kubectl set image` で新バージョン指定 |
| ⑤ API キー注入 | `.github/workflows/deploy.yml` | 103〜106行目 | `kubectl set env --from=secret` で Pod に注入 |
| ⑥ ヘルスチェック | `backend/src/index.ts` | 11〜13行目 | `/api/health` → `{"status":"ok"}` を返す |
| ⑥ ヘルスチェック | `k8s/backend-deployment.yaml` | 37〜48行目 | k3s が `/api/health` を定期的に叩く設定 |
| ⑥ Secret参照 | `k8s/backend-deployment.yaml` | 32〜36行目 | `secretKeyRef` で API キーを環境変数に |
| ⑦ URL振り分け | `k8s/ingress.yaml` | 12〜25行目 | `/api` → backend:8080、`/` → frontend:3000 |

### deploy.yml の全体像（行番号つき）

ファイル全体は 114 行で、こう分かれています:

```
.github/workflows/deploy.yml

  1〜16行:   ワークフロー名・トリガー・権限・環境変数
             ├── name: Deploy to k3s
             ├── on: push (master) / workflow_dispatch
             ├── permissions: id-token, contents
             └── env: AWS_REGION, PROJECT_NAME, ENVIRONMENT

 17〜28行:   Job 1 — テスト
             └── npm ci → npm test（75テスト実行）

 30〜66行:   Job 2 前半 — ビルド
             ├── AWS OIDC 認証（36〜40行）
             ├── ECR ログイン（42〜44行）
             ├── backend Docker ビルド＆push（46〜55行）
             └── frontend Docker ビルド＆push（57〜66行）

 68〜113行:  Job 2 後半 — SSH でデプロイ
             ├── ANTHROPIC_API_KEY Secret 作成（80〜84行）
             ├── ECR プルSecret 更新（86〜93行）
             ├── イメージ更新 kubectl set image（95〜101行）
             ├── API キー注入 kubectl set env（103〜106行）
             ├── ロールアウト待機（108〜110行）
             └── Pod 状態確認（112〜113行）
```

---

## 4. Step 1: git push — 「手紙をポストに入れる」

### 何が起きるか

あなたがコードを書いて `git push` すると、コードが GitHub に送られます。

```bash
# あなたがターミナルで打つコマンド
git add .
git commit -m "新しい機能を追加"
git push
```

### 例え話

手紙（コード）をポスト（GitHub）に投函するようなものです。
ポストに入れた瞬間、郵便局員（GitHub Actions）が「お、新しい手紙が来た！仕事開始！」と動き出します。

### 具体的な仕組み

```
あなたのパソコン                    GitHub
┌──────────────┐                 ┌──────────────────────┐
│ git push     │────────────────►│ master ブランチに     │
│              │   インターネット  │ 新しいコードが到着    │
└──────────────┘                 │                      │
                                 │ → deploy.yml を発見  │
                                 │ → 「on: push」に     │
                                 │   該当する！          │
                                 │ → ロボット起動！      │
                                 └──────────────────────┘
```

GitHub は `.github/workflows/deploy.yml` というファイルを見て、「master ブランチに push が来たらこの作業をやる」というルールに従って動きます。

### 対応するコード

> **ファイル**: `.github/workflows/deploy.yml` の **3〜6行目**

```yaml
on:
  push:
    branches: [master]    # ← master に push されたら起動
  workflow_dispatch:       # ← GitHub画面から手動実行も可能
```

---

## 5. Step 2: テスト — 「答え合わせ」

### 何が起きるか

GitHub Actions のロボットが、まずテストを実行します。
「このコード、ちゃんと動く？」を自動でチェックします。

```
┌─────────────────────────────────────────────┐
│  GitHub Actions のロボット                    │
│                                              │
│  「テストを始めるよ！」                        │
│                                              │
│  ✅ 星座占いのテスト ............ 合格         │
│  ✅ 数秘術のテスト .............. 合格         │
│  ✅ 血液型占いのテスト .......... 合格         │
│  ✅ タロットのテスト ............ 合格         │
│  ✅ API ルーティングのテスト .... 合格         │
│                                              │
│  結果: 75個のテスト、全部合格！ → 次へ進む     │
└─────────────────────────────────────────────┘
```

### もしテストに失敗したら？

```
┌─────────────────────────────────────────────┐
│  GitHub Actions のロボット                    │
│                                              │
│  ❌ 星座占いのテスト ............ 不合格！     │
│                                              │
│  「テストに落ちたので、デプロイは中止します」  │
│  「バグのあるコードを本番に出すわけにはいかない」│
│                                              │
│  → ここで全部ストップ。本番には影響なし。      │
└─────────────────────────────────────────────┘
```

テストが失敗すると、ここで止まります。壊れたアプリがユーザーに届くことはありません。
これがテストの一番大事な役割：**門番**です。

### 例え話

学校の給食で、味見係（テスト）が「まずい！」と言ったら、その料理は教室に届けない。
味見係が「おいしい！OK！」と言ったら、次の工程（配達）に進む。

### 対応するコード

> **ファイル**: `.github/workflows/deploy.yml` の **17〜28行目**

```yaml
jobs:
  test-backend:               # ← Job名
    runs-on: ubuntu-latest    # ← Ubuntuマシンを借りる
    steps:
      - uses: actions/checkout@v4           # コードをダウンロード
      - uses: actions/setup-node@v4         # Node.js をセットアップ
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: cd backend && npm ci           # ライブラリをインストール
      - run: cd backend && npm test         # ★ テスト実行（75ケース）
```

> テストのコード本体は `backend/__tests__/` フォルダにあります。
> （例: `__tests__/services/zodiac.test.ts`, `__tests__/routes/fortune.test.ts` など）

---

## 6. Step 3: Docker ビルド — 「お弁当箱に詰める」

### 何が起きるか

テストに合格したら、アプリを **Docker イメージ** という「お弁当箱」に詰めます。

### Docker イメージって何？

普通にアプリを動かすには、こんなものが必要です:

- Node.js（JavaScript を動かす環境）
- npm のライブラリ（何十個ものパッケージ）
- アプリのコード
- 設定ファイル

これらを**全部1つの箱にまとめたもの**が Docker イメージです。

```
┌─────────────────────────────────────┐
│        Docker イメージ（お弁当箱）     │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ Node.js 20                   │   │  ← ごはん（土台）
│  ├──────────────────────────────┤   │
│  │ npm ライブラリ群              │   │  ← おかず（材料）
│  ├──────────────────────────────┤   │
│  │ fortune-compass のコード     │   │  ← メインディッシュ
│  ├──────────────────────────────┤   │
│  │ 起動コマンド: npm start      │   │  ← 食べ方の説明
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### なぜ Docker を使うの？

| Docker なし | Docker あり |
|------------|------------|
| 「自分の PC では動くのに、サーバーでは動かない！」 | どこでも同じように動く |
| Node.js のバージョンが違って動かない | バージョンも箱の中に含まれる |
| 必要なライブラリを入れ忘れた | 全部箱の中に入っている |

> **例え話**: 友達の家でカレーを作ろうとしたら、「ルーがない」「鍋がない」「コンロが違う」...。
> でもお弁当箱に完成品を詰めて持っていけば、どこでもすぐ食べられます。Docker はそういうものです。

### Fortune Compass では2つのお弁当箱を作る

```
GitHub Actions のロボット:

「バックエンドのお弁当箱を作るよ」
  backend/ フォルダのコードを詰める
  → fortune-compass-dev-backend:abc123 完成！

「フロントエンドのお弁当箱を作るよ」
  frontend/ フォルダのコードを詰める
  → fortune-compass-dev-frontend:abc123 完成！
```

`abc123` の部分は Git のコミット ID で、「いつ作ったお弁当箱か」がわかるようになっています。

### 対応するコード

Docker ビルドには **3つのファイル** が関わります。

> **ファイル 1**: `.github/workflows/deploy.yml` の **46〜66行目**（ビルド指示）

```yaml
- name: Build and push backend image
  run: |
    docker build \
      -t $ECR_REGISTRY/fortune-compass-dev-backend:$IMAGE_TAG \  # ← コミットID版
      -t $ECR_REGISTRY/fortune-compass-dev-backend:latest \       # ← 最新版
      backend/                                                     # ← このフォルダをビルド
    docker push ... --all-tags
```

> **ファイル 2**: `backend/Dockerfile`（バックエンドの箱詰めレシピ 全21行）

```dockerfile
FROM node:20-alpine AS builder    # ← Node.js 20 環境を用意
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                         # ← ライブラリをインストール
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build                  # ← TypeScript → JavaScript に変換

FROM node:20-alpine AS runner      # ← 軽量な実行用イメージ
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev              # ← 本番に必要なライブラリだけ入れる
COPY --from=builder /app/dist ./dist  # ← ビルド結果をコピー

EXPOSE 8080                        # ← ポート8080を公開
USER node
CMD ["node", "dist/index.js"]      # ← 起動コマンド
```

> **ファイル 3**: `frontend/Dockerfile`（フロントエンドの箱詰めレシピ 全33行）
> バックエンドと同じ構造ですが、Next.js の `standalone` モードでビルドし、ポート3000で起動します。

---

## 7. Step 4: ECR に送信 — 「冷蔵倉庫に預ける」

### 何が起きるか

作ったお弁当箱（Docker イメージ）を、AWS の ECR（冷蔵倉庫）に送ります。

```
GitHub Actions                           AWS
┌──────────────────┐                   ┌──────────────────────┐
│                  │   docker push     │  ECR（冷蔵倉庫）      │
│  backend:abc123  │──────────────────►│                      │
│  frontend:abc123 │                   │  backend:abc123  ✅  │
│                  │                   │  backend:latest  ✅  │
└──────────────────┘                   │  frontend:abc123 ✅  │
                                       │  frontend:latest ✅  │
                                       │                      │
                                       │  （過去のバージョンも │
                                       │    保管されている）   │
                                       │  backend:def456  📦 │
                                       │  backend:ghi789  📦 │
                                       └──────────────────────┘
```

### なぜ ECR に保管するの？

EC2 サーバー（給食室）がお弁当箱を取りに来るための「倉庫」が必要だからです。
GitHub Actions のロボットは仕事が終わったら消えてしまうので、お弁当箱を安全な場所に置いておく必要があります。

> **例え話**: 工場で作ったお弁当を、配送センター（ECR）に一旦預ける。
> お店（EC2）は配送センターからお弁当を受け取って、お客さん（ユーザー）に届ける。

### 対応するコード

> **ファイル**: `.github/workflows/deploy.yml` の **42〜44行目**（ECR ログイン）と **55, 66行目**（push）

```yaml
- name: Login to Amazon ECR        # ← ECR（倉庫）にログイン
  id: ecr-login
  uses: aws-actions/amazon-ecr-login@v2

# ... ビルド後 ...
docker push $ECR_REGISTRY/fortune-compass-dev-backend --all-tags   # ← 55行目: 倉庫に送信
docker push $ECR_REGISTRY/fortune-compass-dev-frontend --all-tags  # ← 66行目: 倉庫に送信
```

---

## 8. Step 5: SSH 接続 — 「遠くのサーバーにリモコンで指示」

### 何が起きるか

GitHub Actions のロボットが、EC2 サーバーに SSH で接続して「新しいアプリに切り替えて！」と指示します。

```
GitHub Actions                              EC2 サーバー
┌──────────────────┐                      ┌──────────────────┐
│                  │   SSH（暗号化通信）   │                  │
│  「新しい        │─────────────────────►│  「了解！         │
│   バージョンに   │   秘密の鍵で認証     │   切り替え        │
│   切り替えて！」 │                      │   開始します」    │
│                  │                      │                  │
└──────────────────┘                      └──────────────────┘
```

### SSH って何？

**SSH** = 遠くのコンピューターを安全に操作する方法。

> **例え話**: 自分の部屋にいながら、学校のコンピューターを操作できるリモコンです。
> ただし、正しい「鍵」を持っている人しか操作できません。
> この鍵は GitHub Secrets（金庫）に入っているので、ロボットだけが使えます。

### SSH で送るコマンド（3つの仕事）

SSH 接続後、EC2 サーバー上で以下の3つの仕事が実行されます:

```
EC2 サーバー上で実行される仕事:

仕事 1: 「ECR の入館証を更新して」
   → ECR からお弁当箱を取るための一時パスワードを更新

仕事 2: 「API キーの金庫を更新して」
   → ANTHROPIC_API_KEY を Kubernetes Secret に保存

仕事 3: 「新しいお弁当箱に切り替えて」
   → k3s に「バージョン abc123 を使って」と指示
```

### 対応するコード

> **ファイル**: `.github/workflows/deploy.yml` の **68〜113行目**

```yaml
- name: Deploy to k3s via SSH
  uses: appleboy/ssh-action@v1       # ← SSH接続ツール
  env:
    ECR_REGISTRY: ...
    IMAGE_TAG: ${{ github.sha }}      # ← GitコミットID
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # ← 73行目: 金庫から取り出す
  with:
    host: ${{ secrets.EC2_HOST }}     # ← 75行目: サーバーのIPアドレス
    username: ubuntu
    key: ${{ secrets.EC2_SSH_KEY }}   # ← 77行目: SSH秘密鍵
    envs: ECR_REGISTRY,IMAGE_TAG,AWS_REGION,ANTHROPIC_API_KEY
    script: |
      # 80〜84行目: API キーの金庫を作成/更新
      sudo k3s kubectl create secret generic anthropic-api-key \
        --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" ...

      # 86〜93行目: ECR の入館証を更新
      TOKEN=$(aws ecr get-login-password --region $AWS_REGION)
      sudo k3s kubectl create secret docker-registry ecr-secret ...

      # 95〜101行目: イメージを新バージョンに切り替え
      sudo k3s kubectl set image deployment/backend \
        backend=$ECR_REGISTRY/fortune-compass-dev-backend:$IMAGE_TAG ...

      # 103〜106行目: API キーを Pod に注入
      sudo k3s kubectl set env deployment/backend \
        --from=secret/anthropic-api-key ...

      # 108〜113行目: ロールアウト完了待ち & 状態確認
      sudo k3s kubectl rollout status deployment/backend ...
```

---

## 9. Step 6: k3s がコンテナを入れ替え — 「お店の商品を入れ替える」

### 何が起きるか

k3s（司令官）が、古いアプリを止めて、新しいアプリを起動します。

```
k3s の作業（ローリングアップデート）:

【Before】古いバージョンが動いている
┌────────────────────────────────────┐
│  EC2 サーバー                       │
│  ┌─────────────┐ ┌──────────────┐ │
│  │ backend     │ │ frontend     │ │
│  │ (ver: old)  │ │ (ver: old)   │ │
│  │ Running ✅  │ │ Running ✅   │ │
│  └─────────────┘ └──────────────┘ │
└────────────────────────────────────┘
          │
          │  k3s:「新しいバージョンに切り替えるよ」
          ▼
【途中】新しいのを起動して、ヘルスチェック
┌────────────────────────────────────┐
│  EC2 サーバー                       │
│  ┌─────────────┐ ┌──────────────┐ │
│  │ backend     │ │ backend      │ │
│  │ (ver: old)  │ │ (ver: NEW)   │ │
│  │ Running     │ │ Starting...  │ │
│  └─────────────┘ └──────────────┘ │
│                                    │
│  k3s:「新しい方、健康チェック！」    │
│  新 backend:「/api/health → OK！」 │
│  k3s:「よし、健康だな。切り替え！」 │
└────────────────────────────────────┘
          │
          │  ヘルスチェック合格！
          ▼
【After】新しいバージョンに完全切り替え
┌────────────────────────────────────┐
│  EC2 サーバー                       │
│  ┌─────────────┐ ┌──────────────┐ │
│  │ backend     │ │ frontend     │ │
│  │ (ver: NEW)  │ │ (ver: NEW)   │ │
│  │ Running ✅  │ │ Running ✅   │ │
│  └─────────────┘ └──────────────┘ │
│                                    │
│  古いバージョンは自動で削除される    │
└────────────────────────────────────┘
```

### ヘルスチェックとは？

k3s は新しいアプリを起動した後、「ちゃんと動いてる？」と確認します。

```
k3s → 新しい backend に聞く:「/api/health は OK？」
新しい backend → 「{"status":"ok"} です！」
k3s → 「よし、健康だ。古い方は止めていいぞ」
```

もし新しいアプリが壊れていたら、k3s は古いアプリを止めません。
ユーザーには何の影響もなく、管理者にエラーが通知されます。

> **例え話**: レストランのシェフ交代。新しいシェフが「試しに一品作って」と言われて、
> ちゃんと作れたら交代 OK。作れなかったら、前のシェフがそのまま続ける。
> お客さんは何も気づかない。

### 対応するコード

**ヘルスチェックの実装**:

> **ファイル**: `backend/src/index.ts` の **11〜13行目**

```typescript
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

> これが k3s に「自分は元気だよ」と伝える部分です。

**ヘルスチェックの設定（いつ・どう確認するか）**:

> **ファイル**: `k8s/backend-deployment.yaml` の **37〜48行目**

```yaml
readinessProbe:           # ← 「受付可能？」チェック
  httpGet:
    path: /api/health     # ← このURLを叩く
    port: 8080
  initialDelaySeconds: 5  # ← 起動後5秒待ってから開始
  periodSeconds: 10       # ← 10秒ごとにチェック
livenessProbe:            # ← 「生きてる？」チェック
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 30       # ← 30秒ごとにチェック
```

**デプロイメント設計図（k3s に渡す設計図）**:

> **ファイル**: `k8s/backend-deployment.yaml` 全体（56行）
> **ファイル**: `k8s/frontend-deployment.yaml` 全体（51行）

これらのファイルが「どんなコンテナを、何個、どう起動するか」を k3s に伝えます。

---

## 10. Step 7: CloudFront 経由でユーザーに届く

### 何が起きるか

ユーザーがブラウザで Fortune Compass にアクセスすると、CloudFront がリクエストを受け取り、EC2 サーバーに転送します。

```
ユーザー           CloudFront            EC2 (k3s)
┌──────┐         ┌──────────┐         ┌──────────────┐
│      │  HTTPS  │          │  HTTP   │              │
│ PC/  │────────►│ 配膳係   │────────►│  backend     │
│ スマホ│◄────────│          │◄────────│  frontend    │
│      │  応答   │          │  応答   │              │
└──────┘         └──────────┘         └──────────────┘

URL: https://d71oywvumn06c.cloudfront.net/
```

### CloudFront の役割

| 役割 | 説明 |
|------|------|
| HTTPS 通信 | 通信を暗号化して安全にする（鍵マーク） |
| キャッシュ | よく使うデータを覚えておいて速く返す |
| 振り分け | `/api/*` → backend、それ以外 → frontend |

> **例え話**: CloudFront は学校の配膳係のような存在です。
> 給食室（EC2）から料理を受け取り、各教室（ユーザー）に配ります。
> よく頼まれるメニューは覚えておいて、給食室に聞かなくてもすぐ出せます。

### 対応するコード

**URL の振り分けルール**:

> **ファイル**: `k8s/ingress.yaml` の **12〜25行目**

```yaml
rules:
  - http:
      paths:
        - path: /api           # ← /api で始まるURL
          pathType: Prefix
          backend:
            service:
              name: backend    # ← → backend（ポート8080）に転送
              port:
                number: 8080
        - path: /              # ← それ以外のURL
          pathType: Prefix
          backend:
            service:
              name: frontend   # ← → frontend（ポート3000）に転送
              port:
                number: 3000
```

> `/api/fortune/zodiac` → backend の Express サーバーが処理
> `/fortune/zodiac`（画面）→ frontend の Next.js が処理

**ルーティングの先（API エンドポイント）**:

> **ファイル**: `backend/src/routes/fortune.ts`（全311行）

```typescript
// 33行目: 星座占い
router.post('/zodiac', (req, res) => { ... });
// 255行目: 相性占い
router.post('/compatibility', (req, res) => { ... });
// 288行目: AI総合鑑定
router.post('/ai-reading', async (req, res) => { ... });
// ... 全19占術 + dashboard
```

---

## 11. API キーはどうやって安全に渡すの？

AI総合鑑定や手相占いでは、外部の AI サービス（Anthropic Claude API）を使います。
このサービスを使うには **API キー**（パスワードのようなもの）が必要です。

### API キーの流れ

```
あなた（1回だけ手動で設定）
  │
  │ GitHub の設定画面で API キーを登録
  ▼
┌─────────────────────────────────────────┐
│  GitHub Secrets（金庫）                   │
│  ┌───────────────────────────────────┐  │
│  │ ANTHROPIC_API_KEY = sk-ant-...    │  │  ← 暗号化されて保管
│  │ EC2_HOST = 13.xxx.xxx.xx         │  │     誰にも見えない
│  │ EC2_SSH_KEY = -----BEGIN...      │  │
│  │ AWS_ACCOUNT_ID = 12345...        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
  │
  │ デプロイ時に GitHub Actions が金庫を開ける
  ▼
┌─────────────────────────────────────────┐
│  GitHub Actions（ロボット）               │
│                                          │
│  ANTHROPIC_API_KEY を SSH で EC2 に送る  │
└─────────────────────────────────────────┘
  │
  │ SSH 経由（暗号化通信）
  ▼
┌─────────────────────────────────────────┐
│  EC2 サーバー                             │
│                                          │
│  kubectl create secret で                │
│  Kubernetes Secret（もう1つの金庫）に保管  │
│  ┌───────────────────────────────────┐  │
│  │ k8s Secret: anthropic-api-key     │  │
│  │ ANTHROPIC_API_KEY = sk-ant-...    │  │
│  └───────────────────────────────────┘  │
│           │                              │
│           │ kubectl set env で           │
│           │ Pod の環境変数に注入          │
│           ▼                              │
│  ┌───────────────────────────────────┐  │
│  │ backend Pod                        │  │
│  │ process.env.ANTHROPIC_API_KEY      │  │  ← コードからはこれを読むだけ
│  │ = "sk-ant-..."                     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### なぜこんなに面倒なことをするの？

API キーが漏れると、**あなたのお金が勝手に使われてしまう**からです。

| やり方 | 安全度 | 問題点 |
|--------|--------|--------|
| コードに直接書く | ❌ 最悪 | GitHub で世界中の人に見える |
| .env ファイルに書いて Git に入れる | ❌ 危険 | 同上 |
| GitHub Secrets → k8s Secret | ✅ 安全 | 手間はかかるが誰にも見えない |

> **例え話**: 家の鍵を玄関のドアに貼り付けておく人はいませんよね。
> 鍵は金庫（GitHub Secrets）に入れて、必要なとき（デプロイ時）だけ取り出して、
> 信頼できる人（ロボット）に渡す。使い終わったら金庫に戻す。これが安全な方法です。

### 対応するコード（API キーが流れる4つのファイル）

**1. GitHub Secrets から取り出す**:
> **ファイル**: `.github/workflows/deploy.yml` の **73行目**
```yaml
ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # 金庫からロボットに渡す
```

**2. EC2 上で k8s Secret を作成**:
> **ファイル**: `.github/workflows/deploy.yml` の **80〜84行目**
```bash
sudo k3s kubectl create secret generic anthropic-api-key \
  --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" ...  # サーバー上の金庫に保管
```

**3. Pod の環境変数に注入**:
> **ファイル**: `.github/workflows/deploy.yml` の **103〜106行目**
```bash
sudo k3s kubectl set env deployment/backend \
  --from=secret/anthropic-api-key ...  # 金庫からPodに渡す
```

> **ファイル**: `k8s/backend-deployment.yaml` の **32〜36行目**（宣言的な定義）
```yaml
- name: ANTHROPIC_API_KEY
  valueFrom:
    secretKeyRef:
      name: anthropic-api-key    # ← k8s Secretの名前
      key: ANTHROPIC_API_KEY     # ← Secretの中のキー名
```

**4. コードから読み取る**:
> **ファイル**: `backend/src/services/ai-reading.ts`（AI総合鑑定で使用）
> **ファイル**: `backend/src/services/palm.ts`（手相占いで使用）
```typescript
const apiKey = process.env.ANTHROPIC_API_KEY;  // ← 環境変数から読むだけ
```

---

## 12. 全体フロー図（まとめ）

最初から最後まで、番号順に追ってみましょう。

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Fortune Compass デプロイの全体フロー（所要時間: 約3分）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

① git push（あなた → GitHub）                          [0:00]
   │  コードを GitHub に送信
   │
② テスト実行（GitHub Actions）                         [0:00〜0:30]
   │  75個のテストを自動実行
   │  失敗したら → ここでストップ（本番に影響なし）
   │
③ Docker ビルド（GitHub Actions）                      [0:30〜1:30]
   │  backend と frontend の Docker イメージを作成
   │
④ ECR に送信（GitHub Actions → AWS ECR）               [1:30〜2:00]
   │  Docker イメージを AWS の倉庫にアップロード
   │
⑤ SSH 接続 & デプロイ指示（GitHub Actions → EC2）      [2:00〜2:30]
   │  EC2 に接続して以下を実行:
   │  ├── ECR の認証情報を更新
   │  ├── API キーの Secret を作成/更新
   │  ├── backend イメージを新バージョンに変更
   │  ├── frontend イメージを新バージョンに変更
   │  └── API キーを Pod に注入
   │
⑥ ローリングアップデート（k3s）                        [2:30〜3:00]
   │  古い Pod を停止 → 新しい Pod を起動
   │  ヘルスチェック（/api/health）で健康確認
   │
⑦ 完了！                                              [3:00]
   ユーザーが次にアクセスしたとき、新しいアプリが表示される

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  あなたがやること: git push（1回、10秒）
  ロボットがやること: 上記の②〜⑦（全自動、約3分）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 13. ハンズオン: 実際に push して GitHub Actions を体験しよう

ここまでの説明を読んだら、**実際にやってみましょう**。
手を動かすのが一番の学びです。所要時間は約10分です。

### 13.1 準備（必要なもの）

| ツール | 確認コマンド | なければ |
|--------|-------------|---------|
| Git | `git --version` | `sudo apt install git` |
| GitHub CLI | `gh --version` | [cli.github.com](https://cli.github.com/) |

### 13.2 ヘルスチェックの応答メッセージを変更してみよう

バックエンドのヘルスチェックに一言メッセージを追加する、小さな変更をしてみます。

#### Step 1: 変更前のヘルスチェックを確認する

```bash
# 今の本番のヘルスチェック応答を見る
curl -s https://d71oywvumn06c.cloudfront.net/api/health

# 出力例:
# {"status":"ok","timestamp":"2026-02-18T12:00:00.000Z"}
```

#### Step 2: コードを変更する

対象ファイル: `backend/src/index.ts` の **11〜13行目**

変更前:
```typescript
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

変更後（`version` を追加）:
```typescript
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: 'v2.3' });
});
```

> **変更するのは1行だけ**です。`version: 'v2.3'` を追加するだけ。

#### Step 3: テストをローカルで実行する（任意だが推奨）

```bash
cd ~/work/my-project/fortune-compass/backend
npm test

# 出力例:
# Test Suites: 5 passed, 5 total
# Tests:       75 passed, 75 total
# → 全部合格なら安心して push できる
```

#### Step 4: コミットして push する

```bash
cd ~/work/my-project/fortune-compass

# 変更をステージング
git add backend/src/index.ts

# コミット
git commit -m "feat: add version to health check response"

# push → ★ この瞬間に GitHub Actions が起動する！
git push
```

#### Step 5: GitHub Actions の実行をリアルタイムで見る

```bash
# push 直後に実行（数秒待ってから）
gh run list --limit 1

# 出力例:
# STATUS  TITLE                                      WORKFLOW       BRANCH  EVENT  ID           ELAPSED
# *       feat: add version to health check response  Deploy to k3s  master  push   22130000000  10s
#
# STATUS が * = 実行中！
```

```bash
# リアルタイムでログを見る（IDは上の出力からコピー）
gh run watch 22130000000

# ↑ テスト → ビルド → デプロイの進行状況が流れていきます
# 完了すると自動で表示が止まります（約3分）
```

> **見どころ**: 以下のステップが順番に実行される様子を観察してください
> 1. `test-backend` が始まる（テスト実行）
> 2. テスト合格後、`build-and-deploy` が始まる
> 3. Docker イメージがビルドされる
> 4. SSH でデプロイが実行される
> 5. ロールアウト完了

#### Step 6: デプロイ完了後に確認する

```bash
# ワークフローの結果を確認
gh run list --limit 1

# STATUS が ✓ なら成功！
```

```bash
# 新しいヘルスチェック応答を確認
curl -s https://d71oywvumn06c.cloudfront.net/api/health

# 出力例:
# {"status":"ok","timestamp":"2026-02-18T12:05:00.000Z","version":"v2.3"}
#                                                        ^^^^^^^^^^^^^^
#                                                        ← これが追加された！
```

```bash
# 占いAPIも動いているか確認
curl -s -X POST https://d71oywvumn06c.cloudfront.net/api/fortune/zodiac \
  -H 'Content-Type: application/json' \
  -d '{"birthday":"1990-05-15"}'

# → 星座占いの結果が返ってくれば、全機能正常
```

#### おめでとうございます！

あなたは今、以下を体験しました:

```
あなたがやったこと                    自動で起きたこと
─────────────────────────────────────────────────────────────
コード1行変更 + git push（30秒）  →  テスト自動実行（75ケース）
                                  →  Docker イメージ 2個ビルド
                                  →  ECR に送信
                                  →  EC2 に SSH 接続
                                  →  API キー Secret 更新
                                  →  コンテナ入れ替え
                                  →  ヘルスチェック確認
                                  →  本番に反映！

あなたの作業時間: 約30秒
ロボットの作業時間: 約3分
ロボットがやったステップ数: 10以上
```

### 13.3 もし失敗したら？

CI/CD が失敗しても慌てないでください。**本番は壊れません**。

```bash
# 失敗したログを見る
gh run view <run-ID> --log-failed

# よくある失敗:
# - テスト失敗 → コードにタイプミスがある → 修正して再push
# - Docker ビルド失敗 → import文が間違っている → 修正して再push
# - SSH タイムアウト → EC2 が停止中 → AWS コンソールで起動
```

失敗した場合のリカバリーの流れ:

```
テスト失敗 → コードを修正 → git add → git commit → git push → 自動で再実行
```

何度 push してもOKです。テストに合格するまでデプロイされないので安心です。

---

## 14. よくある質問

### Q1: push したのに何も起きないんだけど？

**A**: `master` ブランチに push しましたか？ 別のブランチ（feature/xxx など）に push した場合、ワークフローは起動しません。

```bash
# 今いるブランチを確認
git branch

# master に切り替えて push
git checkout master
git push
```

### Q2: テストに失敗した。本番のアプリは壊れる？

**A**: 壊れません。テストに失敗した場合、デプロイは実行されないので、本番は前のバージョンのまま動き続けます。安心してコードを修正して、もう一度 push してください。

### Q3: デプロイ中にユーザーがアクセスしたらどうなる？

**A**: 問題ありません。k3s は「ローリングアップデート」という方法で、古いアプリが動いている間に新しいアプリを起動します。新しいアプリの準備ができてから切り替えるので、ユーザーがエラーを見ることはほとんどありません。

### Q4: 間違ったコードを push してしまった！戻せる？

**A**: はい。コードを修正して再度 push すれば、自動で新しいバージョンがデプロイされます。

```bash
# 間違いを修正して
git add .
git commit -m "fix: 間違いを修正"
git push
# → 自動でテスト → デプロイが走る
```

### Q5: API キーが漏れたかもしれない。どうすれば？

**A**: すぐに以下を実行してください:

1. Anthropic Console (https://console.anthropic.com/) で古いキーを無効化（Revoke）
2. 新しいキーを発行
3. GitHub Secrets を更新
4. 再デプロイ（push または手動実行）

詳しくは [011_cicd-learning.md](./011_cicd-learning.md) のセクション 9 を参照。

### Q6: このデプロイの仕組みにお金はかかる？

**A**: 以下の部分に費用がかかります:

| サービス | 費用 |
|---------|------|
| GitHub Actions | 無料（パブリックリポジトリ）/ 月2000分無料（プライベート） |
| ECR | ほぼ無料（保存容量に応じて微小な課金） |
| EC2 | 月 $10〜20 程度（t3.small の場合） |
| CloudFront | ほぼ無料（無料枠内） |
| Anthropic API | 従量課金（AI機能の利用量に応じて） |

---

> **おつかれさまでした！** ここまで読めば、「git push したらどうやってアプリが更新されるか」の全体像がわかったはずです。
> 最初は複雑に見えますが、やっていることは「テスト → 箱詰め → 倉庫に送る → サーバーで開ける」というシンプルな流れです。
