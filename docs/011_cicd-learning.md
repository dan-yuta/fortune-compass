# Fortune Compass — CI/CD 学習ガイド

> このドキュメントは、Fortune Compass プロジェクトの CI/CD（自動テスト・自動デプロイ）の仕組みを、
> プログラミング初心者（中学生レベル）にもわかるように解説したものです。
> 実際のワークフローファイル（`deploy.yml`）を一行ずつ読み解きながら、CI/CD の全体像を学びます。

---

## 目次

1. [CI/CD とは何か（中学生にもわかる説明）](#1-cicd-とは何か中学生にもわかる説明)
2. [Fortune Compass の CI/CD パイプライン全体像](#2-fortune-compass-の-cicd-パイプライン全体像)
3. [GitHub Actions の仕組み（ワークフローファイル解説）](#3-github-actions-の仕組みワークフローファイル解説)
4. [Job 1: テスト（自動テストの重要性）](#4-job-1-テスト自動テストの重要性)
5. [Job 2: ビルド＆デプロイ（Docker → ECR → k3s）](#5-job-2-ビルドデプロイdocker--ecr--k3s)
6. [OIDC 認証の仕組み（なぜパスワードを保存しないのか）](#6-oidc-認証の仕組みなぜパスワードを保存しないのか)
7. [実際に確認してみよう（コマンド集）](#7-実際に確認してみようコマンド集)
8. [よくあるエラーと対処法](#8-よくあるエラーと対処法)
9. [用語集](#9-用語集)

---

## 1. CI/CD とは何か（中学生にもわかる説明）

### そもそも CI/CD って何？

**CI/CD** という言葉は、2つの言葉を組み合わせたものです。

| 略語 | 正式名称 | 意味 |
|------|---------|------|
| **CI** | Continuous Integration（継続的インテグレーション） | コードを書いたら自動でテストする仕組み |
| **CD** | Continuous Delivery / Deployment（継続的デリバリー / デプロイ） | テストに合格したら自動で本番に届ける仕組み |

### 身近な例で考えてみよう

#### 例え話：学校の給食センター

プログラムを作ってインターネットに公開するまでの流れを、**給食センター**に例えてみましょう。

```
あなた（開発者）= 料理のレシピを書く人
コード         = レシピ
CI（テスト）   = 味見係（まずくないかチェックする人）
CD（デプロイ） = 配達トラック（学校まで届ける仕組み）
本番サーバー   = 学校の食堂（みんなが食べる場所）
```

**CI/CD がない世界**（手作業の世界）：
1. レシピを書く（コードを書く）
2. 自分で味見する（手動でテストする）← 忘れることがある！
3. 自分で車を運転して届ける（手動でサーバーにアップする）← 間違えることがある！
4. 学校に着いたら自分で盛り付ける（手動で設定する）← 疲れてミスする！

**CI/CD がある世界**（自動化された世界）：
1. レシピを書く（コードを書く）
2. レシピを提出する（コードを GitHub に push する）
3. あとは**全部自動**！ 味見 → 盛り付け → 配達 → 食堂に並べるまで、全部ロボットがやってくれる！

### なぜ CI/CD が大事なの？

| CI/CD なし | CI/CD あり |
|-----------|-----------|
| テストを忘れてバグが本番に出る | 毎回必ず自動テストされる |
| 手作業でアップするので時間がかかる | push するだけで数分で完了 |
| 手順を間違えてサーバーが壊れる | 毎回同じ手順が正確に実行される |
| 「自分のパソコンでは動くのに...」問題 | 毎回クリーンな環境でテストされる |
| 深夜にサーバー作業が必要 | push したら自動でやってくれる |

> **一言でまとめると**: CI/CD は「コードを書いた後の面倒な作業を、全部ロボットにやらせる仕組み」です。

---

## 2. Fortune Compass の CI/CD パイプライン全体像

### パイプラインとは？

**パイプライン**とは、水道管（パイプ）のように、作業が順番に流れていく仕組みのことです。
Fortune Compass では、コードを push してからアプリが更新されるまで、以下のような流れになっています。

### 全体フロー図

```
  開発者（あなた）
    │
    │  git push（コードを GitHub に送る）
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Actions                          │
│                   （自動化ロボットの司令塔）                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Job 1: test-backend （テスト係）                          │  │
│  │                                                           │  │
│  │  1. コードをダウンロード                                    │  │
│  │  2. Node.js をセットアップ                                  │  │
│  │  3. npm ci（必要なライブラリをインストール）                   │  │
│  │  4. npm test（テストを実行）                                │  │
│  │                                                           │  │
│  │  → テストに失敗したら、ここで全部ストップ！ ✕               │  │
│  │  → テストに合格したら、次の Job へ！ ✓                     │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │ 合格！                            │
│                             ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Job 2: build-and-deploy （ビルド＆配達係）                 │  │
│  │                                                           │  │
│  │  Step 1: AWS にログイン（OIDC 認証）                       │  │
│  │          │                                                │  │
│  │  Step 2: ECR にログイン                                    │  │
│  │          │                                                │  │
│  │  Step 3: バックエンドの Docker イメージをビルド＆送信       │  │
│  │          │                                                │  │
│  │  Step 4: フロントエンドの Docker イメージをビルド＆送信     │  │
│  │          │                                                │  │
│  │  Step 5: EC2 に SSH 接続してデプロイ実行                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
    │
    │  SSH（リモート接続）
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EC2 サーバー（k3s）                            │
│                 （アプリが動いている場所）                         │
│                                                                 │
│  1. ECR から新しいイメージを取得する準備（認証情報を更新）       │
│  2. バックエンドを新しいバージョンに切り替え                     │
│  3. フロントエンドを新しいバージョンに切り替え                   │
│  4. 正常に起動するまで待機                                       │
│  5. 完了！新しいアプリがユーザーに届く                           │
└─────────────────────────────────────────────────────────────────┘
```

### 登場するサービスの関係図

```
┌──────────┐     push     ┌──────────────┐
│  GitHub  │◄────────────│   開発者の    │
│  (コード │              │  パソコン    │
│   倉庫)  │              └──────────────┘
└────┬─────┘
     │ コードが更新されたことを検知
     ▼
┌──────────────┐    OIDC認証    ┌──────────┐
│GitHub Actions │──────────────►│   AWS    │
│(自動化ロボ)  │               │ (IAM)    │
└──┬───┬───────┘               └──────────┘
   │   │
   │   │ Docker イメージを送信
   │   ▼
   │  ┌──────────┐
   │  │  Amazon  │  ← Docker イメージの倉庫
   │  │   ECR    │
   │  └────┬─────┘
   │       │ イメージを取得
   │       ▼
   │  ┌──────────────────┐
   │  │  EC2 サーバー     │
   └─►│  (k3s で管理)    │  ← SSH で接続してデプロイ指示
      │                  │
      │  backend Pod     │  ← バックエンド（API サーバー）
      │  frontend Pod    │  ← フロントエンド（画面表示）
      └──────────────────┘
```

---

## 3. GitHub Actions の仕組み（ワークフローファイル解説）

### GitHub Actions とは？

GitHub Actions は、**GitHub が提供する自動化ロボット**です。
「コードが push されたら〇〇をやって」というお願いを書いておくと、GitHub が代わりにやってくれます。

#### 例え話：自動販売機

GitHub Actions は自動販売機のようなものです。

- **お金を入れる** = コードを push する
- **ボタンを押す** = ワークフローが起動する
- **飲み物が出てくる** = テストが実行され、デプロイが完了する

自動販売機が「お金を入れたらどの飲み物を出すか」の設計図を持っているように、
GitHub Actions にも**設計図**があります。それが**ワークフローファイル**（YAML ファイル）です。

### ワークフローファイルの場所

```
fortune-compass/
  └── .github/
       └── workflows/
            └── deploy.yml    ← これが設計図！
```

GitHub は `.github/workflows/` フォルダの中にある YAML ファイルを自動的に見つけて実行します。

### YAML ファイルとは？

**YAML**（ヤムル）は、設定を書くためのファイル形式です。
人間が読みやすいように作られていて、**インデント（字下げ）が意味を持つ**のが特徴です。

```yaml
# これが YAML の例
名前: 田中太郎
年齢: 14
趣味:
  - サッカー
  - プログラミング
```

> **注意**: YAML ではインデント（スペース何個分ずらすか）がとても重要です。
> タブ文字は使えず、スペースを使います。ずれると動かなくなります。

### ワークフローファイルの全体構造

ワークフローファイルは、大きく分けて以下の部分で構成されています。

```
deploy.yml の構造:

┌─ name:        ← ワークフローの名前
├─ on:          ← いつ実行するか（トリガー）
├─ permissions: ← どんな権限が必要か
├─ env:         ← 共通の設定値
└─ jobs:        ← 実際にやること
    ├─ test-backend:       ← Job 1: テスト
    └─ build-and-deploy:   ← Job 2: ビルド＆デプロイ
```

それでは、一つずつ見ていきましょう。

### 3.1 ワークフローの名前とトリガー

```yaml
name: Deploy to k3s
```

これはワークフローの**名前**です。GitHub の画面に表示されるだけで、動作には影響しません。
「k3s にデプロイする」という意味です。

```yaml
on:
  push:
    branches: [master]
  workflow_dispatch:
```

**`on:`** は「いつこのワークフローを動かすか」を指定します。

| 設定 | 意味 |
|------|------|
| `push: branches: [master]` | master ブランチにコードが push されたとき |
| `workflow_dispatch:` | GitHub の画面から手動で「実行」ボタンを押したとき |

> **例え話**: 「玄関のチャイムが鳴ったら（push）ドアを開ける」「自分でドアノブを回しても（手動）ドアは開く」
> という2つの開け方があるようなものです。

### 3.2 権限の設定

```yaml
permissions:
  id-token: write
  contents: read
```

この部分は、GitHub Actions のロボットに**どんな権限を与えるか**を決めています。

| 設定 | 意味 | なぜ必要か |
|------|------|-----------|
| `id-token: write` | 身分証明書を発行できる | AWS に「自分は GitHub Actions です」と証明するため（OIDC 認証） |
| `contents: read` | コードを読める | リポジトリのコードをダウンロードするため |

> **例え話**: 図書館のカード（`contents: read`）があれば本を借りられるし、
> 学生証（`id-token: write`）があれば身分を証明できる。
> ここでは「学生証を発行してもらう権限」と「本を読む権限」をロボットに渡しています。

### 3.3 環境変数（共通設定）

```yaml
env:
  AWS_REGION: ap-northeast-1
  PROJECT_NAME: fortune-compass
  ENVIRONMENT: dev
```

**`env:`** は、ワークフロー全体で使う**共通の設定値**です。
何度も同じ値を書くのは面倒なので、ここで一度定義して使い回します。

| 変数名 | 値 | 意味 |
|--------|-----|------|
| `AWS_REGION` | `ap-northeast-1` | AWS の東京リージョン（サーバーの場所） |
| `PROJECT_NAME` | `fortune-compass` | プロジェクトの名前 |
| `ENVIRONMENT` | `dev` | 環境の種類（dev = 開発環境） |

> **例え話**: 学校のプリントに「3年2組 田中太郎」と毎回書くのは面倒ですよね。
> ゴム印を作っておけば、ポンと押すだけで済みます。
> 環境変数は、このゴム印のようなものです。

---

## 4. Job 1: テスト（自動テストの重要性）

### テストって何？

**テスト**とは、「プログラムが正しく動くかどうかを確認すること」です。

#### 例え話：数学のテストの答え合わせ

あなたが数学の問題を解いたとします。

- **テストなし**: 提出してから先生に「全部間違ってるよ」と言われる（悲しい）
- **テストあり**: 提出前に答え合わせして、間違いを直してから提出する（安心）

プログラムのテストも同じです。本番にデプロイする前に、自動で「答え合わせ」をしてくれます。

### テスト Job の解説

```yaml
jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: backend/package-lock.json
      - run: cd backend && npm ci
      - run: cd backend && npm test
```

これを一行ずつ見ていきましょう。

#### `jobs:`

「ここから実際の仕事を書くよ」という宣言です。

#### `test-backend:`

仕事（Job）の名前です。「バックエンドのテスト」という意味で名前を付けています。

#### `runs-on: ubuntu-latest`

**「どんなコンピューターで作業するか」** を指定しています。
`ubuntu-latest` は「最新の Ubuntu（Linux）マシンを使って」という意味です。

> **例え話**: 料理をするとき「キッチンを借りる」必要がありますよね。
> `runs-on` は「どのキッチンを借りるか」を決めています。
> GitHub が無料で貸してくれるキッチン（仮想マシン）を使います。

#### `steps:`

「やることリスト」の始まりです。上から順番に実行されます。

#### `- uses: actions/checkout@v4`

リポジトリのコードを**ダウンロード**します。
GitHub Actions のマシンは毎回まっさらな状態から始まるので、まずコードを取得する必要があります。

> **例え話**: 調理実習の最初に「食材を冷蔵庫から出す」ようなものです。

#### `- uses: actions/setup-node@v4`

**Node.js**（JavaScript を実行する環境）をインストールします。

```yaml
with:
  node-version: 20                              # Node.js のバージョン 20 を使う
  cache: npm                                     # npm のキャッシュを使う（高速化）
  cache-dependency-path: backend/package-lock.json  # キャッシュの基準ファイル
```

> **キャッシュとは**: 前回ダウンロードしたものを覚えておいて、次回から素早く使えるようにする仕組みです。
> スマホのアプリが「一度読み込んだ画像を保存しておく」のと同じです。

#### `- run: cd backend && npm ci`

`backend` フォルダに移動して、必要なライブラリ（パッケージ）をインストールします。

- `cd backend` → backend フォルダに移動
- `npm ci` → `package-lock.json` に書かれた通りのバージョンのライブラリをインストール

> **`npm ci` と `npm install` の違い**: `npm ci` は「レシピ通りに正確に」作ります。
> `npm install` は「だいたい同じ材料で」作ります。CI/CD では正確さが大事なので `npm ci` を使います。

#### `- run: cd backend && npm test`

テストを実行します。Fortune Compass のバックエンドには約 75 個のテストケースがあり、
占いロジック、API のレスポンス、エラーハンドリングなどが正しく動くかを自動でチェックします。

> **テストが失敗するとどうなる？**
> この Job が失敗すると、次の「ビルド＆デプロイ」Job は**実行されません**。
> バグのあるコードが本番に出るのを防いでくれる**門番**の役割です。

### テスト Job の流れ（図解）

```
  ┌───────────────────────────────────────────────┐
  │           test-backend Job                     │
  │                                                │
  │  [1] コードをダウンロード (checkout)            │
  │       │                                        │
  │       ▼                                        │
  │  [2] Node.js をセットアップ                     │
  │       │                                        │
  │       ▼                                        │
  │  [3] ライブラリをインストール (npm ci)          │
  │       │                                        │
  │       ▼                                        │
  │  [4] テスト実行 (npm test)                     │
  │       │                                        │
  │       ├─── 合格 ✓ ──► build-and-deploy へ     │
  │       │                                        │
  │       └─── 失敗 ✕ ──► ここでストップ！         │
  │                       (デプロイされない)        │
  └───────────────────────────────────────────────┘
```

---

## 5. Job 2: ビルド＆デプロイ（Docker → ECR → k3s）

### この Job の全体像

テストに合格したら、いよいよアプリを本番サーバーに届けます。
この Job では、大きく分けて 5 つのことをやります。

```
  ┌────────────────────────────────────────────────────────────┐
  │              build-and-deploy Job                           │
  │                                                            │
  │  Step 1: AWS にログイン（OIDC 認証）                       │
  │     │                                                      │
  │     ▼                                                      │
  │  Step 2: ECR にログイン                                    │
  │     │                                                      │
  │     ▼                                                      │
  │  Step 3: バックエンドの Docker イメージをビルド → ECR に送信│
  │     │                                                      │
  │     ▼                                                      │
  │  Step 4: フロントエンドの Docker イメージをビルド → ECR に送信│
  │     │                                                      │
  │     ▼                                                      │
  │  Step 5: EC2 に SSH 接続して k3s のデプロイを更新           │
  └────────────────────────────────────────────────────────────┘
```

### `needs: [test-backend]` について

```yaml
build-and-deploy:
    needs: [test-backend]
    runs-on: ubuntu-latest
```

**`needs: [test-backend]`** は「test-backend Job が成功してから実行して」という意味です。
テストに失敗したコードを本番にデプロイしてしまわないための安全装置です。

> **例え話**: 給食で味見係が「OK」を出さないと、配達トラックが出発しないルールです。

### Step 1: AWS にログイン（OIDC 認証）

```yaml
      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/fortune-compass-github-actions
          aws-region: ${{ env.AWS_REGION }}
```

AWS のサービス（ECR や EC2）を使うために、まず**ログイン**します。
ここでは OIDC（オーアイディーシー）という仕組みを使っています（詳しくは[セクション 6](#6-oidc-認証の仕組みなぜパスワードを保存しないのか) で解説）。

| 設定 | 意味 |
|------|------|
| `role-to-assume` | 「この役割（ロール）でログインしてください」 |
| `${{ secrets.AWS_ACCOUNT_ID }}` | AWS アカウント ID（GitHub Secrets に安全に保管されている） |
| `aws-region` | どの地域のサーバーを使うか（東京） |

> **`${{ secrets.xxx }}` とは？**: GitHub に安全に保管された秘密の値です。
> パスワードやアカウント ID など、コードに直接書くと危険な情報をここに保存します。
> GitHub の設定画面からのみ登録・変更でき、ワークフローログにも表示されません。

### Step 2: ECR にログイン

```yaml
      - name: Login to Amazon ECR
        id: ecr-login
        uses: aws-actions/amazon-ecr-login@v2
```

**ECR（Elastic Container Registry）** は、Docker イメージを保管する倉庫です。
この Step で ECR にログインし、イメージを送信できる状態にします。

> **例え話**: 宅配便を送るとき、まず宅配業者の窓口で「送り状」を書きますよね。
> ECR ログインは、その「送り状の準備」のようなものです。

**`id: ecr-login`** という部分は、このステップに名前を付けています。
後のステップで `${{ steps.ecr-login.outputs.registry }}` と書くと、
ECR のアドレス（例: `123456789.dkr.ecr.ap-northeast-1.amazonaws.com`）を取得できます。

### Step 3 & 4: Docker イメージのビルドと送信

```yaml
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build \
            -t $ECR_REGISTRY/${{ env.PROJECT_NAME }}-${{ env.ENVIRONMENT }}-backend:$IMAGE_TAG \
            -t $ECR_REGISTRY/${{ env.PROJECT_NAME }}-${{ env.ENVIRONMENT }}-backend:latest \
            backend/
          docker push $ECR_REGISTRY/${{ env.PROJECT_NAME }}-${{ env.ENVIRONMENT }}-backend --all-tags
```

#### Docker イメージって何？

**Docker イメージ**は、アプリを動かすために必要なもの全部を1つの箱に詰めたものです。

> **例え話**: 引っ越しのダンボール箱を想像してください。
> 服、食器、本...全部1つの箱に詰めれば、どこに持って行っても同じ生活ができます。
> Docker イメージは「アプリのコード」「必要なライブラリ」「設定ファイル」を全部1つの箱に詰めたものです。

#### コマンドの意味

**`docker build`（ダンボール箱を作る）:**

```
docker build \
  -t $ECR_REGISTRY/fortune-compass-dev-backend:abc123 \    ← 名前とバージョンを付ける
  -t $ECR_REGISTRY/fortune-compass-dev-backend:latest \    ← 「最新版」タグも付ける
  backend/                                                  ← backend/ フォルダからビルド
```

- `-t` はタグ（名札）を付けるオプションです
- `$IMAGE_TAG` は `${{ github.sha }}`、つまり Git のコミット ID（例: `a1b2c3d4...`）です
- 同じイメージに 2 つのタグを付けています：コミット ID 版と `latest`（最新）版

> **なぜ 2 つのタグを付けるの？**
> - コミット ID タグ: 「この箱は 2024年1月15日の a1b2c3 版」と特定できる
> - latest タグ: 「これが一番新しい箱」とすぐわかる

**`docker push`（ダンボール箱を倉庫に送る）:**

```
docker push $ECR_REGISTRY/fortune-compass-dev-backend --all-tags
```

ビルドしたイメージを ECR（倉庫）に送信します。`--all-tags` で両方のタグを一度に送ります。

フロントエンドも全く同じ流れで、`backend/` の代わりに `frontend/` をビルドして送信します。

### Step 5: EC2 に SSH 接続してデプロイ

```yaml
      - name: Deploy to k3s via SSH
        uses: appleboy/ssh-action@v1
        env:
          ECR_REGISTRY: ${{ steps.ecr-login.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ubuntu
          key: ${{ secrets.EC2_SSH_KEY }}
          envs: ECR_REGISTRY,IMAGE_TAG,AWS_REGION
          script: |
            ...（サーバー上で実行するコマンド）
```

#### SSH って何？

**SSH**（Secure Shell）は、**遠くにあるコンピューターに安全に接続する方法**です。

> **例え話**: 自分の部屋から、学校の先生のパソコンを遠隔操作できるリモコンのようなものです。
> ただし、正しい「鍵（key）」を持っている人しか操作できません。

| 設定 | 意味 |
|------|------|
| `host` | 接続先サーバーの住所（IP アドレス） |
| `username: ubuntu` | ログインするユーザー名 |
| `key` | SSH の秘密鍵（サーバーに入るための合い鍵） |
| `envs` | サーバーに渡す環境変数 |

#### サーバー上で実行されるコマンド

SSH で接続した後、EC2 サーバー上で以下のコマンドが実行されます。

**1. ECR のプルシークレットを更新する:**

```bash
TOKEN=$(aws ecr get-login-password --region $AWS_REGION)
sudo k3s kubectl create secret docker-registry ecr-secret \
  --docker-server=$ECR_REGISTRY \
  --docker-username=AWS \
  --docker-password="$TOKEN" \
  -n fortune-compass \
  --dry-run=client -o yaml | sudo k3s kubectl apply -f -
```

k3s が ECR から Docker イメージを取得（プル）するには、認証情報が必要です。
ECR のパスワード（トークン）は 12 時間で期限切れになるため、デプロイのたびに更新します。

> **例え話**: 会員制倉庫（ECR）から荷物を受け取るには、有効期限付きの入館証が必要です。
> デプロイするたびに新しい入館証を発行して、k3s に渡しています。

- `aws ecr get-login-password` → ECR の一時パスワードを取得
- `kubectl create secret` → k3s にパスワードを登録
- `--dry-run=client -o yaml | kubectl apply -f -` → 既に存在しても上書きするテクニック

**2. デプロイメントのイメージを更新する:**

```bash
sudo k3s kubectl set image deployment/backend \
  backend=$ECR_REGISTRY/fortune-compass-dev-backend:$IMAGE_TAG \
  -n fortune-compass

sudo k3s kubectl set image deployment/frontend \
  frontend=$ECR_REGISTRY/fortune-compass-dev-frontend:$IMAGE_TAG \
  -n fortune-compass
```

k3s に「新しいバージョンのイメージを使って」と指示します。
k3s は古いコンテナを止めて、新しいコンテナを起動してくれます。

> **例え話**: お店の商品棚を想像してください。
> 「古い商品を下げて、新しい商品を並べて」とお願いしているようなものです。
> k3s は自動で古い商品を片付けて、新しい商品を並べてくれます。

**3. ロールアウトの完了を待つ:**

```bash
sudo k3s kubectl rollout status deployment/backend -n fortune-compass --timeout=120s
sudo k3s kubectl rollout status deployment/frontend -n fortune-compass --timeout=120s
```

新しいコンテナが正常に起動するまで待ちます（最大 120 秒）。
もし 120 秒以内に起動しなければ、エラーになります。

> **例え話**: レストランでお料理を注文した後、「お料理が出てくるまで待つ」のと同じです。
> あまりにも時間がかかったら「何か問題があるのでは？」と気づけます。

**4. Pod の状態を確認する:**

```bash
sudo k3s kubectl get pods -n fortune-compass
```

最後に、Pod（コンテナ）の状態を表示して、すべてが正常に動いていることを確認します。

---

## 6. OIDC 認証の仕組み（なぜパスワードを保存しないのか）

### 従来の方法の問題点

昔は、AWS にログインするために**アクセスキー**（長期間使えるパスワードのようなもの）を
GitHub Secrets に保存していました。

```
【従来の方法（危険）】

GitHub Secrets に保存:
  AWS_ACCESS_KEY_ID = AKIA1234567890EXAMPLE
  AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

→ この鍵が漏れたら、誰でも AWS を操作できてしまう！
→ 鍵は永久に有効なので、漏洩に気づかないリスクがある
```

> **例え話**: 家の合い鍵をポストの裏に隠しておくようなものです。
> 見つかったら誰でも家に入れてしまいます。
> しかも合い鍵を変えない限り、ずっと使えてしまいます。

### OIDC 認証とは

**OIDC（OpenID Connect）** は、「自分が何者か」を安全に証明する仕組みです。
パスワードを保存する代わりに、**一時的な証明書**を使います。

```
【OIDC の仕組み（安全）】

  GitHub Actions                    AWS
      │                              │
      │  ① 「私は GitHub Actions    │
      │     の fortune-compass      │
      │     リポジトリです」         │
      │  ────────────────────────►  │
      │                              │
      │  ② AWS が GitHub に確認     │
      │     「本当にその人？」       │
      │  ◄────────────────────────  │
      │                              │  GitHub
      │                              │  ──────►  「はい、本物です」
      │                              │  ◄──────
      │                              │
      │  ③ 「OK、1時間だけ使える    │
      │     仮パスワードをあげる」   │
      │  ◄────────────────────────  │
      │                              │
      │  ④ 仮パスワードで作業する   │
      │  ────────────────────────►  │
      │                              │
      │  ⑤ 1時間後、仮パスワードは  │
      │     自動で無効になる         │
      │                              │
```

> **例え話**: ホテルのカードキーを想像してください。
> - チェックイン時に身分証明書（パスポート）を見せる → 本人確認
> - チェックアウトの日まで使えるカードキーをもらう → 一時的なアクセス権
> - チェックアウト後、カードキーは自動で無効になる → 安全
>
> 家の合い鍵を渡すのと違い、期限が切れたら自動で使えなくなるので安全です。

### OIDC と従来方法の比較

| 比較項目 | 従来（アクセスキー） | OIDC |
|---------|---------------------|------|
| パスワードの保管 | GitHub Secrets に保存 | 保存しない |
| 有効期限 | 永久（手動で無効化するまで） | 1時間程度で自動失効 |
| 漏洩リスク | 高い（漏れたらずっと使える） | 低い（漏れてもすぐ失効する） |
| 管理の手間 | 定期的にキーを更新する必要 | 自動更新なので手間なし |
| AWS の推奨 | 非推奨 | 推奨 |

### ワークフローでの OIDC の設定

OIDC を使うには、以下の 2 つの設定が必要です。

**1. 権限の宣言（ワークフローの冒頭）:**

```yaml
permissions:
  id-token: write    # ← OIDC トークン（身分証明書）を発行する権限
```

**2. AWS 認証の設定（Step）:**

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::${{ secrets.AWS_ACCOUNT_ID }}:role/fortune-compass-github-actions
```

`role-to-assume` は「この役割（ロール）を使ってログインして」という指定です。
AWS 側で事前に「GitHub Actions の fortune-compass リポジトリからのログインだけ許可する」
というルールを設定してあります。

---

## 7. 実際に確認してみよう（コマンド集）

ここでは、CI/CD の状態を実際に確認するためのコマンドを紹介します。
手を動かしながら学ぶと、理解が深まります。

### 7.1 GitHub Actions の実行状況を確認する

#### 直近のワークフロー実行一覧を見る

```bash
# 最新のワークフロー実行一覧を表示
gh run list --repo dan-yuta/fortune-compass

# 出力例:
# STATUS  TITLE              WORKFLOW        BRANCH  EVENT  ID          ELAPSED  AGE
# ✓       Fix typo in API    Deploy to k3s   master  push   1234567890  3m45s    5m
# ✓       Add tarot feature  Deploy to k3s   master  push   1234567889  4m12s    2h
# ✕       WIP: debug         Deploy to k3s   master  push   1234567888  1m30s    5h
```

| 記号 | 意味 |
|------|------|
| ✓ | 成功（全ステップ完了） |
| ✕ | 失敗（どこかでエラー） |
| ○ | 実行中 |

#### 特定の実行の詳細を見る

```bash
# run ID を指定して詳細を表示
gh run view 1234567890 --repo dan-yuta/fortune-compass

# Job ごとの結果が見られる:
# JOBS
# ✓ test-backend in 1m30s
# ✓ build-and-deploy in 2m15s
```

#### 失敗した実行のログを確認する

```bash
# 失敗した run のログを見る（失敗した Job のみ表示）
gh run view 1234567888 --repo dan-yuta/fortune-compass --log-failed

# 全ログを見る（長いので通常はログファイルに保存）
gh run view 1234567888 --repo dan-yuta/fortune-compass --log > run_log.txt
```

> **ポイント**: `--log-failed` オプションを使うと、失敗したステップのログだけが表示されるので、
> エラーの原因を素早く見つけられます。

#### 手動でワークフローを実行する

```bash
# 手動で Deploy to k3s ワークフローを実行
gh workflow run deploy.yml --repo dan-yuta/fortune-compass

# 実行が開始されたか確認
gh run list --repo dan-yuta/fortune-compass --limit 1
```

> **いつ使う？**: コードを変更していないけど、デプロイをやり直したい場合に使います。
> 例えば、サーバーの設定を変更した後にアプリを再デプロイしたいときなど。

### 7.2 ECR（Docker イメージの倉庫）を確認する

#### 保存されている Docker イメージの一覧を見る

```bash
# バックエンドのイメージ一覧
aws ecr list-images \
  --repository-name fortune-compass-dev-backend \
  --region ap-northeast-1

# 出力例:
# {
#     "imageIds": [
#         {
#             "imageDigest": "sha256:abc123...",
#             "imageTag": "a1b2c3d4e5f6..."
#         },
#         {
#             "imageDigest": "sha256:abc123...",
#             "imageTag": "latest"
#         }
#     ]
# }

# フロントエンドのイメージ一覧
aws ecr list-images \
  --repository-name fortune-compass-dev-frontend \
  --region ap-northeast-1
```

#### 最新のイメージのタグを確認する

```bash
# 最新のイメージ情報を詳しく見る
aws ecr describe-images \
  --repository-name fortune-compass-dev-backend \
  --region ap-northeast-1 \
  --query 'sort_by(imageDetails,& imagePushedAt)[-1]' \
  --output table
```

### 7.3 EC2 サーバー上のデプロイ状態を確認する

まず、EC2 サーバーに SSH で接続します。

```bash
# EC2 サーバーに SSH 接続
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2のIPアドレス>
```

接続した後、以下のコマンドで状態を確認できます。

#### Pod（コンテナ）の状態を確認

```bash
# fortune-compass の Pod 一覧を表示
sudo k3s kubectl get pods -n fortune-compass

# 出力例:
# NAME                        READY   STATUS    RESTARTS   AGE
# backend-6d4f5b7c8-x9z2w    1/1     Running   0          5m
# frontend-7e5g6c9d1-a3b4c   1/1     Running   0          5m
```

| STATUS | 意味 |
|--------|------|
| `Running` | 正常に動作中 |
| `CrashLoopBackOff` | 起動に失敗して再起動を繰り返している |
| `ImagePullBackOff` | Docker イメージの取得に失敗 |
| `Pending` | 起動待ち（リソース不足の可能性） |
| `ContainerCreating` | コンテナを作成中 |

#### デプロイメントの状態を確認

```bash
# デプロイメントの詳細を確認
sudo k3s kubectl get deployments -n fortune-compass

# 出力例:
# NAME       READY   UP-TO-DATE   AVAILABLE   AGE
# backend    1/1     1            1           30d
# frontend   1/1     1            1           30d
```

#### Pod のログを確認

```bash
# バックエンドのログを見る（直近 50 行）
sudo k3s kubectl logs deployment/backend -n fortune-compass --tail=50

# フロントエンドのログを見る（直近 50 行）
sudo k3s kubectl logs deployment/frontend -n fortune-compass --tail=50

# リアルタイムでログを流し続ける（Ctrl+C で停止）
sudo k3s kubectl logs deployment/backend -n fortune-compass -f
```

#### 現在使われているイメージのバージョンを確認

```bash
# バックエンドのイメージ情報を確認
sudo k3s kubectl get deployment backend -n fortune-compass -o jsonpath='{.spec.template.spec.containers[0].image}'

# フロントエンドのイメージ情報を確認
sudo k3s kubectl get deployment frontend -n fortune-compass -o jsonpath='{.spec.template.spec.containers[0].image}'
```

#### デプロイの履歴を確認

```bash
# デプロイメントのロールアウト履歴
sudo k3s kubectl rollout history deployment/backend -n fortune-compass
```

### 7.4 コマンドまとめ表

| やりたいこと | コマンド |
|-------------|---------|
| ワークフロー実行一覧 | `gh run list` |
| 実行の詳細を見る | `gh run view <ID>` |
| 失敗ログを見る | `gh run view <ID> --log-failed` |
| 手動で実行する | `gh workflow run deploy.yml` |
| ECR のイメージ一覧 | `aws ecr list-images --repository-name <名前>` |
| Pod の状態を見る | `sudo k3s kubectl get pods -n fortune-compass` |
| Pod のログを見る | `sudo k3s kubectl logs deployment/<名前> -n fortune-compass` |
| 使用中のイメージを確認 | `sudo k3s kubectl get deployment <名前> -n fortune-compass -o jsonpath='{...image}'` |

---

## 8. よくあるエラーと対処法

CI/CD でエラーが出ても慌てないでください。よくあるエラーには決まった対処法があります。

### 8.1 テストが失敗する

```
Error: Tests failed
  FAIL backend/src/__tests__/fortune.test.ts
  Expected: 200
  Received: 500
```

**原因**: コードにバグがある。

**対処法**:
1. `gh run view <ID> --log-failed` でどのテストが失敗したか確認する
2. ローカルで `cd backend && npm test` を実行して、同じエラーが出るか確認する
3. テストが期待する結果と実際の結果を比べて、コードを修正する
4. 修正をコミットして push する（自動で CI/CD が再実行される）

### 8.2 Docker ビルドが失敗する

```
Error: failed to solve: process "/bin/sh -c npm ci" did not complete successfully
```

**原因**: `package-lock.json` と `package.json` の整合性が取れていない、
または Dockerfile に問題がある。

**対処法**:
1. ローカルで `docker build backend/` を実行してみる
2. `package-lock.json` を再生成する: `cd backend && rm package-lock.json && npm install`
3. 修正をコミットして push する

### 8.3 OIDC 認証が失敗する

```
Error: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

**原因**: AWS 側の IAM ロール設定に問題がある、またはリポジトリ名が変更された。

**対処法**:
1. AWS の IAM ロール `fortune-compass-github-actions` の信頼ポリシーを確認する
2. 信頼ポリシーのリポジトリ名が正しいか確認する
3. `permissions: id-token: write` がワークフローに書かれているか確認する

### 8.4 ECR へのプッシュが失敗する

```
Error: denied: Your authorization token has expired. Reauthenticate and try again.
```

**原因**: ECR のログイントークンが期限切れ。

**対処法**:
1. 通常は自動で処理されるので、ワークフローを再実行する
2. 繰り返し発生する場合は、`aws-actions/amazon-ecr-login@v2` のバージョンを確認する

### 8.5 SSH 接続が失敗する

```
Error: ssh: connect to host x.x.x.x port 22: Connection timed out
```

**原因**: EC2 サーバーが停止している、またはセキュリティグループの設定が問題。

**対処法**:
1. AWS コンソールで EC2 インスタンスが `Running` 状態か確認する
2. セキュリティグループで SSH（ポート 22）が GitHub Actions の IP から許可されているか確認する
3. EC2 のパブリック IP が変更されていないか確認する（`secrets.EC2_HOST` を更新する必要があるかも）

### 8.6 デプロイ後に Pod が起動しない（CrashLoopBackOff）

```
NAME                        READY   STATUS             RESTARTS   AGE
backend-6d4f5b7c8-x9z2w    0/1     CrashLoopBackOff   5          3m
```

**原因**: アプリケーションの起動に失敗している（環境変数の不足、ポート設定ミスなど）。

**対処法**:
1. Pod のログを確認する:
   ```bash
   sudo k3s kubectl logs deployment/backend -n fortune-compass
   ```
2. Pod の詳細情報を確認する:
   ```bash
   sudo k3s kubectl describe pod <Pod名> -n fortune-compass
   ```
3. 必要な環境変数が ConfigMap や Secret に設定されているか確認する
4. コードを修正して再デプロイする

### 8.7 デプロイ後に Pod がイメージを取得できない（ImagePullBackOff）

```
NAME                        READY   STATUS              RESTARTS   AGE
backend-6d4f5b7c8-x9z2w    0/1     ImagePullBackOff    0          2m
```

**原因**: ECR からイメージを取得するための認証情報（ecr-secret）が期限切れ、
またはイメージ名が間違っている。

**対処法**:
1. ecr-secret の状態を確認する:
   ```bash
   sudo k3s kubectl get secret ecr-secret -n fortune-compass
   ```
2. ワークフローを再実行する（ecr-secret が自動更新される）
3. イメージ名が正しいか確認する:
   ```bash
   aws ecr list-images --repository-name fortune-compass-dev-backend --region ap-northeast-1
   ```

### 8.8 ロールアウトがタイムアウトする

```
error: timed out waiting for the condition
```

**原因**: 新しい Pod が 120 秒以内に起動しなかった。

**対処法**:
1. Pod の状態とログを確認して、起動が遅い原因を調べる
2. EC2 のリソース（CPU、メモリ）が不足していないか確認する:
   ```bash
   # EC2 上で実行
   free -h          # メモリの使用状況
   df -h            # ディスクの使用状況
   ```
3. 必要に応じてインスタンスタイプを大きくする

### トラブルシューティングのフローチャート

```
ワークフローが失敗した！
    │
    ├── test-backend が失敗？
    │     └── → ログを見てテストを修正 → push
    │
    ├── OIDC 認証が失敗？
    │     └── → IAM ロールの設定を確認
    │
    ├── Docker ビルドが失敗？
    │     └── → ローカルで docker build してみる
    │
    ├── ECR プッシュが失敗？
    │     └── → ワークフローを再実行
    │
    ├── SSH 接続が失敗？
    │     └── → EC2 の状態を確認
    │
    └── デプロイ後に Pod が動かない？
          ├── CrashLoopBackOff → kubectl logs でログ確認
          ├── ImagePullBackOff → ecr-secret を更新（再デプロイ）
          └── Timeout → EC2 のリソースを確認
```

---

## 9. 用語集

CI/CD に関連する用語をアイウエオ順・アルファベット順で解説します。

### あ行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **イメージ（Docker イメージ）** | いめーじ | アプリとその動作環境をまとめたパッケージ。引っ越しのダンボール箱のようなもの。 |
| **インスタンス** | いんすたんす | クラウド上の仮想コンピューター。EC2 インスタンス = AWS が貸してくれるコンピューター。 |

### か行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **環境変数（env）** | かんきょうへんすう | プログラムに渡す設定値。ゴム印のように、何度でも使い回せる共通の値。 |
| **キャッシュ** | きゃっしゅ | 一度取得したデータを一時的に保存しておく仕組み。2回目以降の処理が速くなる。 |
| **コンテナ** | こんてな | Docker イメージを実際に動かした状態。ダンボール箱を開けて中身を使っている状態。 |
| **コミット** | こみっと | コードの変更を記録すること。セーブポイントのようなもの。 |

### さ行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **シークレット（Secrets）** | しーくれっと | GitHub に安全に保管される秘密の値。パスワードや API キーなどを保存する金庫。 |
| **ジョブ（Job）** | じょぶ | ワークフロー内の仕事の単位。「テスト係」「ビルド係」のように役割ごとに分かれている。 |
| **ステップ（Step）** | すてっぷ | Job の中の個々の作業。「食材を出す」「切る」「焼く」のような1つ1つの作業。 |

### た行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **タグ** | たぐ | Docker イメージに付けるラベル。バージョンを区別するための名札。 |
| **デプロイ** | でぷろい | アプリケーションをサーバーに配置して使えるようにすること。お店に商品を並べること。 |
| **トリガー** | とりがー | ワークフローを開始させるきっかけ。push やボタン操作など。 |

### な行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **ネームスペース（Namespace）** | ねーむすぺーす | Kubernetes 上でアプリを整理するフォルダ。`fortune-compass` という名前の区画を使っている。 |

### は行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **パイプライン** | ぱいぷらいん | 作業が順番に流れていく仕組み。水道管のように、入口から出口まで作業が流れる。 |
| **ビルド** | びるど | ソースコードを実行可能な形に変換すること。材料を組み立てて完成品にすること。 |
| **プッシュ（push）** | ぷっしゅ | ローカルの変更を GitHub に送信すること。手紙をポストに投函するようなもの。 |
| **プル（pull）** | ぷる | 外部からデータを取得すること。ECR から Docker イメージをダウンロードするなど。 |
| **ポッド（Pod）** | ぽっど | Kubernetes でコンテナを動かす最小単位。1つのアプリが動いている部屋のようなもの。 |

### ま行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **マニフェスト** | まにふぇすと | Kubernetes に「どんなアプリをどう動かすか」を伝える設定ファイル。設計図。 |

### や行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **YAML** | やむる | 設定ファイルの形式。人間が読みやすいように設計されている。インデントが意味を持つ。 |

### ら行

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **リポジトリ** | りぽじとり | コードを保管する場所。プロジェクトの本棚のようなもの。 |
| **ロールアウト** | ろーるあうと | 新しいバージョンのアプリを段階的に展開すること。古い商品を新しい商品に入れ替える作業。 |
| **ロール（IAM Role）** | ろーる | AWS での役割・権限セット。「この人は ECR だけ使える」などの権限を定義したもの。 |

### アルファベット

| 用語 | 読み方 | 説明 |
|------|--------|------|
| **CI** | しーあい | Continuous Integration。コードを push するたびに自動テストする仕組み。 |
| **CD** | しーでぃー | Continuous Delivery / Deployment。テスト後に自動でデプロイする仕組み。 |
| **Docker** | どっかー | アプリを「コンテナ」という箱に詰めて、どこでも同じように動かせるツール。 |
| **EC2** | いーしーつー | AWS の仮想サーバー。クラウド上に借りたコンピューター。 |
| **ECR** | いーしーあーる | Elastic Container Registry。Docker イメージを保管する AWS の倉庫。 |
| **GitHub Actions** | ぎっとはぶ あくしょんず | GitHub が提供する CI/CD サービス。ワークフローを自動実行するロボット。 |
| **IAM** | あいえいえむ | Identity and Access Management。AWS の「誰が何をできるか」を管理するサービス。 |
| **k3s** | けーすりーえす | 軽量版 Kubernetes。少ないリソースで Kubernetes の機能を使える。小さなサーバーに最適。 |
| **kubectl** | くーべくとる | Kubernetes を操作するコマンドラインツール。k3s では `k3s kubectl` として使う。 |
| **Kubernetes** | くーばねてぃす | コンテナを管理・運用するためのシステム。たくさんのコンテナを自動で管理してくれる司令塔。 |
| **Node.js** | のーどじぇいえす | JavaScript をサーバーで動かすための環境。Fortune Compass のバックエンドで使用。 |
| **npm** | えぬぴーえむ | Node.js のパッケージ管理ツール。必要なライブラリをインストール・管理する。 |
| **OIDC** | おーあいでぃーしー | OpenID Connect。一時的な証明書でログインする安全な認証方式。 |
| **SSH** | えすえすえいち | Secure Shell。遠くのコンピューターに安全に接続するための仕組み。暗号化されたリモコン。 |

---

> **おつかれさまでした！** ここまで読めば、Fortune Compass の CI/CD がどう動いているか、
> 大まかなイメージが掴めたはずです。
> 最初はわからないことが多くても、実際にコマンドを打ったり、ワークフローのログを読んだりしているうちに、
> 自然と理解が深まっていきます。焦らず、一つずつ確認していきましょう。
