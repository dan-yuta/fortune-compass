# Fortune Compass — AWS サービス一覧・解説

本プロジェクトで使用している AWS サービスの一覧と、各サービスの役割・解説をまとめる。

---

## 1. 使用サービス一覧

| # | サービス名 | カテゴリ | 本プロジェクトでの用途 | 月額概算 |
|---|-----------|---------|---------------------|---------|
| 1 | Amazon VPC | ネットワーク | 仮想ネットワーク（サブネット・ルーティング） | $0 |
| 2 | Internet Gateway | ネットワーク | VPC とインターネット間の通信 | $0 |
| 3 | NAT Gateway | ネットワーク | Private Subnet からの外向き通信 | ~$32 |
| 4 | Elastic IP | ネットワーク | NAT Gateway 用の固定 IP | $0（NAT GW利用時） |
| 5 | Application Load Balancer (ALB) | ネットワーク | パスベースルーティング（/api/* → Backend, /* → Frontend） | ~$18 |
| 6 | Amazon CloudFront | CDN | HTTPS 終端 + 静的アセットキャッシュ | ~$0（無料枠内） |
| 7 | Amazon ECS (Fargate) | コンピュート | コンテナ実行環境（Frontend + Backend の2サービス） | ~$15 |
| 8 | Amazon ECR | コンテナレジストリ | Docker イメージの保存・管理 | ~$1 |
| 9 | Amazon CloudWatch Logs | モニタリング | コンテナのログ収集・閲覧 | ~$1 |
| 10 | Amazon S3 | ストレージ | Terraform ステートファイルの保存 | < $1 |
| 11 | Amazon DynamoDB | データベース | Terraform ステートのロック管理 | < $1 |
| 12 | AWS IAM | セキュリティ | ロール・ポリシー管理（ECS タスク実行、CI/CD） | $0 |

**合計: 約 $68/月**

---

## 2. 各サービスの解説

### 2.1 Amazon VPC（Virtual Private Cloud）

**概要**: AWS 上に作成する仮想ネットワーク。独自の IP アドレス範囲、サブネット、ルーティングテーブル、セキュリティグループを設定できる。

**本プロジェクトでの構成**:
- CIDR: `10.0.0.0/16`（65,536 IP アドレス）
- Public Subnet x2: ALB と NAT Gateway を配置（2つの AZ に分散）
- Private Subnet x2: ECS タスクを配置（外部から直接アクセス不可）

**なぜ使うか**: コンテナを直接インターネットに露出させず、ALB 経由でのみアクセスを許可するため。

---

### 2.2 Internet Gateway (IGW)

**概要**: VPC とインターネット間の通信を可能にするゲートウェイ。Public Subnet 内のリソースがインターネットと通信するために必要。

**本プロジェクトでの役割**: ALB がインターネットからのリクエストを受け取れるようにする。

---

### 2.3 NAT Gateway

**概要**: Private Subnet 内のリソースがインターネットにアクセスするためのゲートウェイ。外部からの通信は受け付けないが、内部から外部への通信は許可する。

**本プロジェクトでの役割**:
- ECS タスクが ECR から Docker イメージを pull する
- ECS タスクが CloudWatch Logs にログを送信する

**コスト**: ~$32/月（最もコストが高いリソース）。コスト削減のため Public Subnet + Public IP で代替可能だが、セキュリティが低下する。

---

### 2.4 Application Load Balancer (ALB)

**概要**: HTTP/HTTPS レイヤー（L7）で動作するロードバランサー。URL パスやホスト名に基づいてトラフィックを振り分けられる。

**本プロジェクトでの役割**:
- **パスベースルーティング**: `/api/*` → Backend (Express :8080), `/*` → Frontend (Next.js :3000)
- **ヘルスチェック**: 各ターゲットの `/health` と `/api/health` を定期的に確認
- **2 AZ に配置**: 高可用性を確保

**リスナールール**:
| 優先度 | パスパターン | 転送先 |
|-------|-----------|--------|
| 100 | `/api/*` | Backend Target Group |
| default | `/*` | Frontend Target Group |

---

### 2.5 Amazon CloudFront

**概要**: AWS のグローバル CDN（Content Delivery Network）。世界中のエッジロケーションからコンテンツを配信し、レイテンシを削減する。HTTPS 終端も提供。

**本プロジェクトでの役割**:
- **HTTPS 提供**: CloudFront デフォルト証明書による自動 HTTPS
- **短縮 URL**: `https://d71oywvumn06c.cloudfront.net` という CloudFront ドメインで提供
- **静的アセットキャッシュ**: `/_next/static/*` を積極的にキャッシュ（デフォルト TTL: 7日）
- **API リクエスト転送**: `/api/*` はキャッシュ無効で ALB に直接転送

**キャッシュ戦略**:
| パスパターン | キャッシュ TTL | 説明 |
|------------|-------------|------|
| `/_next/static/*` | 7日（最大365日） | Next.js の静的アセット（JS, CSS, 画像） |
| `/api/*` | 0（無効） | API リクエストは毎回オリジンに転送 |
| `/*` | 0（無効） | HTML ページは毎回オリジンに転送 |

**コスト**: 無料枠（月間 1TB データ転送 + 1,000万 HTTP/HTTPS リクエスト）の範囲内で運用。

---

### 2.6 Amazon ECS（Elastic Container Service）+ Fargate

**概要**: コンテナオーケストレーションサービス。Fargate は ECS のサーバーレス起動タイプで、EC2 インスタンスの管理が不要。

**本プロジェクトでの構成**:

| サービス | コンテナ | CPU | メモリ | ポート |
|---------|---------|-----|-------|--------|
| Frontend | Next.js (standalone) | 256 (0.25 vCPU) | 512 MB | 3000 |
| Backend | Express | 256 (0.25 vCPU) | 512 MB | 8080 |

**主要コンポーネント**:
- **Cluster**: `fortune-compass-dev` — サービスをグループ化する論理単位
- **Task Definition**: コンテナの設定（イメージ、CPU、メモリ、環境変数、ログ設定）を定義
- **Service**: Task Definition に基づいてタスクを起動・維持（希望タスク数: 各1）
- **IAM Role**: タスク実行ロール（ECR pull + CloudWatch Logs 書き込み権限）

**なぜ Fargate か**:
- EC2 インスタンスの管理不要（パッチ適用、スケーリング等）
- 使用分だけの課金（小規模アプリに最適）
- デプロイが単純（イメージ更新 → サービス更新 → ローリングデプロイ）

---

### 2.7 Amazon ECR（Elastic Container Registry）

**概要**: Docker イメージを保存・管理するフルマネージドコンテナレジストリ。Docker Hub の AWS 版。

**本プロジェクトでの構成**:
| リポジトリ名 | 保持世代数 | 用途 |
|------------|----------|------|
| `fortune-compass-dev-frontend` | 10 | Next.js イメージ |
| `fortune-compass-dev-backend` | 10 | Express イメージ |

**ライフサイクルポリシー**: 10世代を超えるイメージは自動削除（ストレージコスト削減）。

---

### 2.8 Amazon CloudWatch Logs

**概要**: ログの収集、監視、分析を行うサービス。ECS コンテナの stdout/stderr を自動的に収集。

**本プロジェクトでの構成**:
| ロググループ | 保持期間 | 内容 |
|------------|---------|------|
| `/ecs/fortune-compass-dev-frontend` | 14日 | Next.js のアプリケーションログ |
| `/ecs/fortune-compass-dev-backend` | 14日 | Express のアプリケーションログ |

**活用例**: エラー調査、リクエストログ確認、パフォーマンス分析。

---

### 2.9 Amazon S3（Simple Storage Service）

**概要**: オブジェクトストレージサービス。任意のファイルを高耐久性で保存・取得できる。

**本プロジェクトでの用途**: Terraform のステートファイル（`terraform.tfstate`）を保存。ステートファイルにはインフラの現在状態が記録されており、複数人での作業やCI/CD で共有するために S3 に保存する。

| バケット名 | 用途 |
|-----------|------|
| `fortune-compass-tfstate` | Terraform ステート保存（暗号化有効） |

---

### 2.10 Amazon DynamoDB

**概要**: フルマネージドの NoSQL データベースサービス。キーバリュー型で高速なアクセスが可能。

**本プロジェクトでの用途**: Terraform のステートロック。複数の `terraform apply` が同時に実行されるのを防ぐために使用。

| テーブル名 | 用途 |
|-----------|------|
| `fortune-compass-tflock` | Terraform ステートロック管理 |

---

### 2.11 AWS IAM（Identity and Access Management）

**概要**: AWS リソースへのアクセスを管理するサービス。ユーザー、ロール、ポリシーを作成して権限を制御する。

**本プロジェクトでの構成**:

| ロール名 | 用途 | 権限 |
|---------|------|------|
| `fortune-compass-dev-ecs-execution` | ECS タスク実行 | ECR pull, CloudWatch Logs 書き込み |
| `fortune-compass-github-actions`* | CI/CD | ECR push, ECS update, S3/DynamoDB |

*GitHub Actions 用ロールは OIDC 連携（長寿命アクセスキー不使用）。

---

## 3. ネットワーク構成図

```
┌─────────────────────────────────────────────────────────────────┐
│  VPC: 10.0.0.0/16                                               │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │  Public Subnet           │  │  Public Subnet           │    │
│  │  10.0.0.0/24             │  │  10.0.1.0/24             │    │
│  │  ap-northeast-1a         │  │  ap-northeast-1c         │    │
│  │                          │  │                          │    │
│  │  ┌─────────┐  ┌──────┐  │  │  ┌─────────┐            │    │
│  │  │   ALB   │  │ NAT  │  │  │  │   ALB   │            │    │
│  │  │ (node)  │  │  GW  │  │  │  │ (node)  │            │    │
│  │  └─────────┘  └──────┘  │  │  └─────────┘            │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │  Private Subnet          │  │  Private Subnet          │    │
│  │  10.0.10.0/24            │  │  10.0.11.0/24            │    │
│  │  ap-northeast-1a         │  │  ap-northeast-1c         │    │
│  │                          │  │                          │    │
│  │  ┌─────────┐┌─────────┐ │  │  (ECS タスクが配置      │    │
│  │  │Frontend ││Backend  │ │  │   される可能性あり)      │    │
│  │  │ :3000   ││ :8080   │ │  │                          │    │
│  │  └─────────┘└─────────┘ │  │                          │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         │                              ▲
         │  Internet Gateway            │  CloudFront (HTTPS)
         ▼                              │
    ┌──────────┐                   ┌──────────┐
    │ Internet │                   │  Users   │
    └──────────┘                   └──────────┘
```

---

## 4. リクエストフロー

ユーザーのブラウザからアプリを利用する際のリクエストフロー:

```
1. ユーザーが https://d71oywvumn06c.cloudfront.net にアクセス

2. CloudFront がリクエストを受信
   ├─ /_next/static/* → キャッシュから返却（キャッシュヒット時）
   └─ その他 → ALB にフォワード

3. ALB がパスで振り分け
   ├─ /api/* → Backend Target Group → Express コンテナ
   └─ /*     → Frontend Target Group → Next.js コンテナ

4. レスポンスが CloudFront → ユーザーに返却
```

---

## 5. セキュリティ設計

| レイヤー | 対策 |
|---------|------|
| HTTPS | CloudFront がデフォルト証明書で SSL/TLS 終端 |
| ネットワーク隔離 | ECS タスクは Private Subnet に配置（外部から直接アクセス不可） |
| セキュリティグループ | ECS は ALB からのみ通信許可（ポート 3000/8080） |
| IAM | 最小権限の原則。ECS タスクロールは ECR pull + Logs のみ |
| CORS | バックエンドは CloudFront ドメインからのみリクエスト許可 |
| CI/CD 認証 | GitHub Actions OIDC（長寿命アクセスキー不使用） |
| コンテナ | 非 root ユーザーで実行（node / nextjs） |
| イメージ | ECR ライフサイクルポリシーで古いイメージを自動削除 |
