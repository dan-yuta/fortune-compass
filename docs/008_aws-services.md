# Fortune Compass — AWS サービス一覧・解説

本プロジェクトで使用している AWS サービスの一覧と、各サービスの役割・解説をまとめる。

---

## 1. 使用サービス一覧

| # | サービス名 | カテゴリ | 本プロジェクトでの用途 | 月額概算 |
|---|-----------|---------|---------------------|---------|
| 1 | Amazon VPC | ネットワーク | 仮想ネットワーク（サブネット・ルーティング） | $0 |
| 2 | Internet Gateway | ネットワーク | VPC とインターネット間の通信 | $0 |
| 3 | Amazon EC2 | コンピュート | k3s (lightweight Kubernetes) 実行環境（t3.small） | ~$9 |
| 4 | Amazon EBS | ストレージ | EC2 インスタンスのブロックストレージ（gp3 20GB） | ~$2 |
| 5 | Traefik Ingress (k3s built-in) | ネットワーク | パスベースルーティング（/api/* → Backend, /* → Frontend） | $0（k3s 組み込み） |
| 6 | Amazon CloudFront | CDN | HTTPS 終端 + 静的アセットキャッシュ | ~$0（無料枠内） |
| 7 | Amazon ECR | コンテナレジストリ | Docker イメージの保存・管理 | ~$1 |
| 8 | Amazon CloudWatch Logs | モニタリング | コンテナのログ収集・閲覧 | ~$1 |
| 9 | Amazon S3 | ストレージ | Terraform ステートファイルの保存 | < $1 |
| 10 | Amazon DynamoDB | データベース | Terraform ステートのロック管理 | < $1 |
| 11 | AWS IAM | セキュリティ | ロール・ポリシー管理（EC2、CI/CD） | $0 |

**合計: 約 $14/月**

---

## 2. 各サービスの解説

### 2.1 Amazon VPC（Virtual Private Cloud）

**概要**: AWS 上に作成する仮想ネットワーク。独自の IP アドレス範囲、サブネット、ルーティングテーブル、セキュリティグループを設定できる。

**本プロジェクトでの構成**:
- CIDR: `10.0.0.0/16`（65,536 IP アドレス）
- Public Subnet x2: EC2 (k3s) を配置

**なぜ使うか**: EC2 インスタンスをセキュリティグループで保護しつつ、CloudFront 経由でアクセスを制御するため。

---

### 2.2 Internet Gateway (IGW)

**概要**: VPC とインターネット間の通信を可能にするゲートウェイ。Public Subnet 内のリソースがインターネットと通信するために必要。

**本プロジェクトでの役割**: EC2 (k3s) がインターネットからのリクエストを受け取り、ECR からイメージを pull できるようにする。

---

### 2.3 NAT Gateway（廃止済み）

> **Note**: EC2 を Public Subnet に配置する構成に移行したため、NAT Gateway は不要となり廃止した。これにより ~$32/月のコスト削減を実現。EC2 は Public IP を持ち、ECR からのイメージ pull や CloudWatch Logs への送信は直接インターネット経由で行う。

---

### 2.4 Traefik Ingress（k3s built-in）

**概要**: k3s に組み込みの Ingress Controller。Kubernetes Ingress リソースに基づいて HTTP/HTTPS レイヤー（L7）でトラフィックをルーティングする。ALB の代替として機能し、追加コスト不要。

**本プロジェクトでの役割**:
- **パスベースルーティング**: `/api/*` → Backend (Express :8080), `/*` → Frontend (Next.js :3000)
- **ヘルスチェック**: Kubernetes の livenessProbe / readinessProbe で各 Pod の `/health` と `/api/health` を監視

**Ingress ルール**:
| パスパターン | 転送先 Service | ポート |
|------------|---------------|-------|
| `/api/*` | backend-svc | 8080 |
| `/*` | frontend-svc | 3000 |

---

### 2.5 Amazon CloudFront

**概要**: AWS のグローバル CDN（Content Delivery Network）。世界中のエッジロケーションからコンテンツを配信し、レイテンシを削減する。HTTPS 終端も提供。

**本プロジェクトでの役割**:
- **HTTPS 提供**: CloudFront デフォルト証明書による自動 HTTPS
- **短縮 URL**: `https://d71oywvumn06c.cloudfront.net` という CloudFront ドメインで提供
- **静的アセットキャッシュ**: `/_next/static/*` を積極的にキャッシュ（デフォルト TTL: 7日）
- **API リクエスト転送**: `/api/*` はキャッシュ無効で EC2 (k3s) に直接転送

**キャッシュ戦略**:
| パスパターン | キャッシュ TTL | 説明 |
|------------|-------------|------|
| `/_next/static/*` | 7日（最大365日） | Next.js の静的アセット（JS, CSS, 画像） |
| `/api/*` | 0（無効） | API リクエストは毎回オリジンに転送 |
| `/*` | 0（無効） | HTML ページは毎回オリジンに転送 |

**コスト**: 無料枠（月間 1TB データ転送 + 1,000万 HTTP/HTTPS リクエスト）の範囲内で運用。

---

### 2.6 Amazon EC2 + k3s

**概要**: EC2 インスタンス上に k3s（軽量 Kubernetes）をインストールし、コンテナオーケストレーションを行う。ECS Fargate と比較して大幅にコストを削減できる。

**本プロジェクトでの構成**:

| 項目 | 値 |
|------|-----|
| インスタンスタイプ | t3.small (2 vCPU, 2 GB RAM) |
| OS | Amazon Linux 2023 |
| k3s バージョン | 最新安定版 |
| EBS | gp3 20GB |

**k8s リソース**:

| リソース | 名前 | 説明 |
|---------|------|------|
| Deployment | frontend | Next.js (standalone) Pod x1 (:3000) |
| Deployment | backend | Express Pod x1 (:8080) |
| Service | frontend-svc | ClusterIP → frontend Pod |
| Service | backend-svc | ClusterIP → backend Pod |
| Ingress | app-ingress | Traefik によるパスベースルーティング |

**なぜ EC2 + k3s か**:
- ECS Fargate + ALB + NAT Gateway（~$68/月）から EC2 + k3s（~$14/月）に移行し、約80%のコスト削減
- k3s は単一バイナリで軽量、t3.small でも十分に動作
- Kubernetes の標準的な Deployment / Service / Ingress で管理でき、学習コストが汎用的
- デプロイが単純（kubectl set image でローリングアップデート）

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
| `fortune-compass-dev-ec2-role` | EC2 インスタンスプロファイル | ECR pull, CloudWatch Logs 書き込み |
| `fortune-compass-github-actions`* | CI/CD | ECR push, S3/DynamoDB |

*GitHub Actions 用ロールは OIDC 連携（長寿命アクセスキー不使用）。

---

## 3. ネットワーク構成図

```
┌─────────────────────────────────────────────────────────────────┐
│  VPC: 10.0.0.0/16                                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Public Subnet                                            │   │
│  │  10.0.0.0/24                                              │   │
│  │  ap-northeast-1a                                          │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐  │   │
│  │  │  EC2 (t3.small) — k3s                               │  │   │
│  │  │                                                     │  │   │
│  │  │  ┌───────────┐                                      │  │   │
│  │  │  │  Traefik  │  Ingress Controller                  │  │   │
│  │  │  │  :80/:443 │  /api/* → backend, /* → frontend     │  │   │
│  │  │  └─────┬─────┘                                      │  │   │
│  │  │        │                                            │  │   │
│  │  │  ┌─────▼─────┐  ┌───────────┐                      │  │   │
│  │  │  │ Frontend  │  │ Backend   │                       │  │   │
│  │  │  │ Pod :3000 │  │ Pod :8080 │                       │  │   │
│  │  │  └───────────┘  └───────────┘                       │  │   │
│  │  └─────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
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
   └─ その他 → EC2 (k3s) にフォワード

3. Traefik Ingress がパスで振り分け
   ├─ /api/* → backend-svc → Express Pod
   └─ /*     → frontend-svc → Next.js Pod

4. レスポンスが CloudFront → ユーザーに返却
```

---

## 5. セキュリティ設計

| レイヤー | 対策 |
|---------|------|
| HTTPS | CloudFront がデフォルト証明書で SSL/TLS 終端 |
| ネットワーク制御 | EC2 はセキュリティグループで必要ポート（80, 443, 22, 6443）のみ許可 |
| セキュリティグループ | k3s SG で HTTP/HTTPS のみ公開、SSH/K8s API は管理者 IP に限定 |
| IAM | 最小権限の原則。EC2 ロールは ECR pull + Logs のみ |
| CORS | バックエンドは CloudFront ドメインからのみリクエスト許可 |
| CI/CD 認証 | GitHub Actions OIDC（長寿命アクセスキー不使用） |
| コンテナ | 非 root ユーザーで実行（node / nextjs） |
| イメージ | ECR ライフサイクルポリシーで古いイメージを自動削除 |
