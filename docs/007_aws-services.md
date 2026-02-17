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
| 12 | AWS Lambda | コンピュート | EC2 ライフサイクル管理（start/stop/status/health-check/ECR refresh） | $0（無料枠内） |
| 13 | AWS Step Functions | オーケストレーション | EC2 起動・停止ワークフロー（状態遷移管理） | $0（無料枠内） |
| 14 | Amazon API Gateway | API | 管理コンソール REST API（API Key 認証） | $0（無料枠内） |
| 15 | Amazon S3（管理コンソール） | ホスティング | 管理コンソール静的ウェブサイト | $0（無料枠内） |
| 16 | AWS Systems Manager (SSM) | 管理 | EC2 へのリモートコマンド実行（ECR トークンリフレッシュ等） | $0 |
| 17 | CloudFront Function | CDN | `/admin` パスリライト（管理コンソール HTTPS 配信） | $0 |
| 18 | AWS MediaConvert | メディア | S3 アップロードトリガーで動画を MP4 + HLS に自動変換 | 従量課金 |
| 19 | AWS Security Hub | セキュリティ | セキュリティ統合ダッシュボード + ベストプラクティス標準 | ~$0〜5 |
| 20 | Amazon GuardDuty | セキュリティ | 脅威検出（不正アクセス・マルウェア） | ~$0〜3 |
| 21 | Amazon Inspector | セキュリティ | EC2 / ECR 脆弱性スキャン | ~$0〜2 |
| 22 | AWS Config | セキュリティ | リソース設定記録 + コンプライアンスルール | ~$0〜2 |
| 23 | IAM Access Analyzer | セキュリティ | IAM ポリシーの外部アクセス分析 | $0 |
| 24 | Amazon Bedrock Agent | AI | 対話型占い AI コンシェルジュ | 従量課金 |
| 25 | Amazon EventBridge | イベント | MediaConvert ジョブ完了通知 → CloudWatch Logs | $0 |

**合計: 約 $19〜24/月**（セキュリティサービスは無料枠終了後課金、MediaConvert/Bedrock は従量課金）

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

**概要**: ログの収集、監視、分析を行うサービス。Lambda 関数やイベントのログを自動的に収集。

**本プロジェクトでの構成**:
| ロググループ | 保持期間 | 内容 |
|------------|---------|------|
| `/aws/lambda/fortune-compass-dev-*` | 14日 | Lambda 関数の実行ログ（EC2 管理、動画変換トリガー等） |
| `/aws/events/fortune-compass-dev-mediaconvert` | 14日 | MediaConvert ジョブ完了/エラーイベント |

**活用例**: Lambda エラー調査、MediaConvert ジョブ監視。k3s コンテナログは `kubectl logs` で直接確認。

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

### 2.12 AWS Lambda

**概要**: サーバーレスのコンピュートサービス。コードをアップロードするだけで実行環境を自動管理してくれる。

**本プロジェクトでの役割**:
- EC2 インスタンスの起動・停止・ステータス確認・ヘルスチェック
- EC2 上の ECR 認証トークンリフレッシュ（SSM 経由）
- Python 3.12 ランタイムで実装

**コスト**: 無料枠（月間 100万リクエスト + 40万GB-秒）の範囲内で運用。

---

### 2.13 AWS Step Functions

**概要**: サーバーレスのワークフローオーケストレーションサービス。複数の AWS サービスを順序立てて実行するステートマシンを構築できる。

**本プロジェクトでの役割**:
- **起動ワークフロー**: EC2 起動 → running 待機 → ヘルスチェック → ECR トークンリフレッシュ
- **停止ワークフロー**: EC2 停止 → stopped 待機

**コスト**: 無料枠（月間 4,000 状態遷移）の範囲内で運用。

---

### 2.14 Amazon API Gateway

**概要**: REST / HTTP / WebSocket API を作成・管理するフルマネージドサービス。

**本プロジェクトでの役割**:
- 管理コンソールの REST API エンドポイント（`/prod/manage`）
- API Key 認証で不正アクセスを防止
- Lambda / Step Functions の呼び出しをプロキシ

**コスト**: 無料枠（月間 100万 API コール）の範囲内で運用。

---

### 2.15 Amazon S3（管理コンソール）

**概要**: S3 の静的ウェブサイトホスティング機能を使用して、管理コンソールの HTML/CSS/JS を配信。

**本プロジェクトでの役割**:
- EC2 の起動・停止・ステータス確認を行う管理画面を提供
- URL: `http://fortune-compass-dev-mgmt-console.s3-website-ap-northeast-1.amazonaws.com`

---

### 2.16 AWS Systems Manager (SSM)

**概要**: AWS リソースの運用管理サービス。Run Command 機能で EC2 にリモートコマンドを実行できる。

**本プロジェクトでの役割**:
- Lambda から EC2 上の ECR 認証トークンリフレッシュコマンドを実行
- EC2 に SSM Agent をインストールし、SSH 不要でのリモート管理を実現

---

### 2.17 CloudFront Function

**概要**: CloudFront エッジロケーションで実行される軽量な JavaScript 関数。リクエスト/レスポンスの変換に使用。Lambda@Edge より高速・低コスト。

**本プロジェクトでの役割**:
- `/admin*` パスへのリクエストを `/index.html` にリライトし、管理コンソールを CloudFront 経由で HTTPS 配信
- ランタイム: `cloudfront-js-2.0`

---

### 2.18 AWS MediaConvert

**概要**: ファイルベースの動画変換サービス。H.264/H.265 等のコーデックで高品質なトランスコードを提供。

**本プロジェクトでの構成**:
- S3 に `.mp4` がアップロードされると Lambda がトリガーされ、MediaConvert ジョブを作成
- 出力: MP4（H.264 720p QVBR）+ HLS（セグメント6秒）
- EventBridge でジョブ完了/エラーを CloudWatch Logs に記録

**コスト**: 従量課金。ベーシックティアで $0.024/分（SD）〜$0.048/分（HD）。

---

### 2.19 AWS Security Hub

**概要**: AWS セキュリティサービスの統合ダッシュボード。GuardDuty、Inspector、Config 等の findings を一元管理。

**本プロジェクトでの役割**:
- AWS 基礎セキュリティのベストプラクティス標準（FSBP v1.0.0）を有効化
- 既存インフラのセキュリティ posture を可視化

---

### 2.20 Amazon GuardDuty

**概要**: 機械学習ベースの脅威検出サービス。VPC フローログ、DNS ログ、CloudTrail イベントを分析し、不正アクセスやマルウェアを検出。

**本プロジェクトでの役割**: EC2 / IAM に対する脅威をリアルタイムで検出。

**コスト**: 30日間無料。その後はイベント量に応じた従量課金。

---

### 2.21 Amazon Inspector

**概要**: 自動脆弱性スキャンサービス。EC2 インスタンスと ECR コンテナイメージの CVE 脆弱性を検出。

**本プロジェクトでの構成**:
- EC2 スキャン: k3s インスタンスの OS パッケージ脆弱性をチェック
- ECR スキャン: frontend / backend コンテナイメージの脆弱性をチェック

**コスト**: EC2 スキャン $0.32/インスタンス/月、ECR スキャン $0.09/イメージ/月。

---

### 2.22 AWS Config

**概要**: AWS リソースの設定変更を記録・監査するサービス。コンプライアンスルールで設定違反を検出。

**本プロジェクトでの構成**:
- Configuration Recorder: 全リソースの設定変更を記録
- Delivery Channel: S3 バケットに設定スナップショットを配信
- ルール1: `S3_BUCKET_PUBLIC_READ_PROHIBITED` — S3 バケットのパブリック読み取りを禁止
- ルール2: `RESTRICTED_INCOMING_TRAFFIC` — 危険なポート（20, 21, 3389, 3306, 4333）の開放をチェック

**注意**: Config Recorder はリージョンに1つのみ。既存がある場合は `enable_config = false` で回避。

---

### 2.23 IAM Access Analyzer

**概要**: IAM ポリシーを分析し、外部からアクセス可能なリソースを検出するサービス。

**本プロジェクトでの構成**: ACCOUNT タイプのアナライザーを作成。S3 バケットや IAM ロールの外部公開を検出。

**コスト**: 無料。

---

### 2.24 Amazon Bedrock Agent

**概要**: 基盤モデルを使用して対話型の AI エージェントを構築するサービス。Action Group で外部 API を呼び出し可能。

**本プロジェクトでの構成**:
- Agent: 占いコンシェルジュ（日本語対応の instruction 付き）
- Action Group: OpenAPI schema で 7 つの占い API を定義
- Lambda (fortune-bridge): Agent → Backend API の橋渡し
- モデル: `anthropic.claude-3-haiku-20240307-v1:0`（コスト最小）

**コスト**: Haiku — 入力 $0.00025/1K tokens、出力 $0.00125/1K tokens。

---

### 2.25 Amazon EventBridge

**概要**: サーバーレスのイベントバスサービス。AWS サービス間のイベント駆動アーキテクチャを構築。

**本プロジェクトでの役割**: MediaConvert ジョブの状態変更（COMPLETE / ERROR）を検知し、CloudWatch Logs に記録。

**コスト**: 無料（AWS サービスイベントは課金対象外）。

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
