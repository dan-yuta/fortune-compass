# Fortune Compass インフラ設計書

## 1. 概要

Fortune Compass を AWS EC2 + k3s (lightweight Kubernetes) にデプロイするためのインフラ設計。
IaC には Terraform、CI/CD には GitHub Actions を採用する。

### 対象環境

| 項目 | 値 |
|------|-----|
| クラウド | AWS |
| リージョン | ap-northeast-1（東京） |
| IaC | Terraform >= 1.5 |
| CI/CD | GitHub Actions |
| コンテナレジストリ | Amazon ECR |
| コンピュート | EC2 (k3s) |
| ロードバランサー | Traefik Ingress (k3s built-in) |
| CDN / HTTPS | Amazon CloudFront |

---

## 2. アーキテクチャ全体図

```
                         Internet
                            │
                    ┌───────▼───────┐
                    │  CloudFront   │   ← HTTPS 終端 + キャッシュ
                    │  (CDN)        │
                    │               │
                    │  Cache Rules: │
                    │  /_next/*  →  │  積極キャッシュ (7日)
                    │  /api/*   →  │  キャッシュ無効
                    │  /*       →  │  キャッシュ無効
                    └───────┬──────┘
                            │  HTTP (origin)
                    ┌───────▼───────────────────┐
                    │  EC2 (t3.small)            │  ← Public Subnet
                    │  k3s (lightweight K8s)     │
                    │                            │
                    │  ┌──────────────────────┐  │
                    │  │  Traefik Ingress     │  │  ← k3s built-in
                    │  │  :80 / :443          │  │
                    │  │                      │  │
                    │  │  /api/* → backend    │  │
                    │  │  /*     → frontend   │  │
                    │  └──┬───────────┬───────┘  │
                    │     │           │           │
                    │  ┌──▼─────┐  ┌─▼────────┐  │
                    │  │  Pod   │  │  Pod      │  │
                    │  │Backend │  │ Frontend  │  │
                    │  │Express │  │ Next.js   │  │
                    │  │ :8080  │  │  :3000    │  │
                    │  └────────┘  └───────────┘  │
                    └───────────┬──────────────────┘
                                │
                    ┌───────────▼──────────┐
                    │   Internet Gateway   │
                    └──────────────────────┘
```

---

## 3. 設計判断

### 3.1 Traefik Ingress パスベースルーティング

**決定**: k3s に組み込みの Traefik Ingress が `/api/*` をバックエンドに、`/*` をフロントエンドにルーティングする。

**理由**:
- k3s にはデフォルトで Traefik Ingress Controller が含まれており、追加のロードバランサー（ALB 等）が不要
- Kubernetes の Ingress リソースでパスベースルーティングを宣言的に管理できる
- フロントエンドの API クライアント（`lib/api-client.ts`）は相対パス `/api/fortune/*` を使用しており、コード変更不要
- 余分なネットワークホップ（ブラウザ → Frontend → Backend）を排除し、レイテンシを削減

**代替案（不採用）**:
- ALB: パスベースルーティングは可能だが、月額 ~$18 のコストが発生。k3s の Traefik で同等の機能を無料で実現
- フロントエンド経由プロキシ: 開発環境と同じ構成だが、本番では無駄なオーバーヘッド

### 3.2 Next.js standalone 出力

**決定**: `next.config.ts` に `output: "standalone"` を設定。

**理由**:
- 通常の Next.js ビルドでは `node_modules` 全体（数百MB）が必要だが、standalone モードでは必要なファイルのみをコピーし、Docker イメージが約 120-150MB に削減される
- standalone は `server.js` 単体で起動可能で、Dockerfile がシンプルになる

### 3.3 Public Subnet + EC2

**決定**: EC2 インスタンス（k3s）を Public Subnet に配置する。NAT Gateway は使用しない。

**理由**:
- EC2 が直接インターネットアクセスを持つため、NAT Gateway（~$32/月）が不要
- セキュリティグループで必要なポート（80, 443, 22, 6443）のみ許可し、セキュリティを確保
- ECR からのイメージ pull や CloudWatch Logs への送信は EC2 の Public IP 経由で行う

**コスト影響**: NAT Gateway を廃止することで ~$32/月のコスト削減を実現。

### 3.4 シード付き乱数の日替わり整合性

**決定**: k3s の複数 Pod 間でも同一日に同一結果を返す。

**理由**:
- バックエンドの占いロジック（星座・数秘術・血液型）は djb2 ハッシュベースのシード付き乱数を使用しており、入力（誕生日 + 日付）が同じなら常に同じ結果を返す
- データベースやキャッシュ（Redis 等）は不要

**例外**: タロット占いは `Math.random()` を使用し、毎回異なる結果を返す（仕様通り）

### 3.5 CloudFront による HTTPS 対応

**決定**: CloudFront を EC2 (k3s) の前段に配置し、HTTPS 終端 + 静的アセットキャッシュを提供する。

**理由**:
- 無料でHTTPS対応が可能（CloudFront デフォルト証明書）
- `https://xxxx.cloudfront.net` という短縮URLで提供可能
- `/_next/static/*` の静的アセットを積極キャッシュし、レスポンス速度を向上
- カスタムドメイン不要でコスト増なし

**キャッシュ戦略**:
| パスパターン | キャッシュ | ヘッダー転送 | Cookie |
|------------|----------|-----------|--------|
| `/api/*` | 無効 (TTL=0) | 全ヘッダー | 全Cookie |
| `/_next/static/*` | 積極的 (7日) | なし | なし |
| `/*` (デフォルト) | 無効 (TTL=0) | Host, Origin, Accept, Accept-Language | なし |

### 3.6 Terraform モジュール分割

**決定**: 9モジュール構成（networking / ecr / ec2-k3s / cloudfront / management / mediaconvert / security / bedrock）+ k8s マニフェスト。

**理由**:
- ALB / ECS を廃止し、EC2 + k3s に統合したためモジュール数が削減
- k8s マニフェスト（Deployment, Service, Ingress）は Terraform 外で管理
- 環境追加（staging / production）時にモジュールを再利用可能
- management モジュールで EC2 ライフサイクル管理（Lambda, Step Functions, API Gateway, S3）を追加
- Phase 12 で非コンピュート系 AWS サービス（MediaConvert / Security / Bedrock）を追加

---

## 4. ネットワーク設計

### 4.1 VPC

| 項目 | 値 |
|------|-----|
| CIDR | 10.0.0.0/16 |
| DNS サポート | 有効 |
| DNS ホスト名 | 有効 |

### 4.2 サブネット

| 種別 | AZ | CIDR | 用途 |
|------|-----|------|------|
| Public | ap-northeast-1a | 10.0.0.0/24 | EC2 (k3s) |
| Public | ap-northeast-1c | 10.0.1.0/24 | （予備） |

### 4.3 ルーティング

| ルートテーブル | 宛先 | ターゲット |
|-------------|------|----------|
| Public | 0.0.0.0/0 | Internet Gateway |

### 4.4 セキュリティグループ

| SG | インバウンド | アウトバウンド |
|----|-----------|------------|
| k3s SG | 80/tcp from 0.0.0.0/0 | All traffic |
| k3s SG | 443/tcp from 0.0.0.0/0 | All traffic |
| k3s SG | 22/tcp from 管理者 IP | All traffic |
| k3s SG | 6443/tcp from 管理者 IP | All traffic |

---

## 5. コンテナ設計

### 5.1 Backend

| 項目 | 値 |
|------|-----|
| ベースイメージ | node:20-alpine |
| ビルド方式 | Multi-stage (builder → runner) |
| ポート | 8080 |
| ヘルスチェック | GET /api/health |
| 環境変数 | NODE_ENV, PORT, CORS_ORIGIN |
| 実行ユーザー | node (非 root) |

**Dockerfile フロー**:
```
builder: npm ci → tsc → dist/ 生成
runner:  npm ci --omit=dev → dist/ コピー → node dist/index.js
```

### 5.2 Frontend

| 項目 | 値 |
|------|-----|
| ベースイメージ | node:20-alpine |
| ビルド方式 | 3-stage (deps → builder → runner) |
| ポート | 3000 |
| ヘルスチェック | GET /health |
| 環境変数 | NODE_ENV, PORT, HOSTNAME |
| 実行ユーザー | nextjs (UID 1001, 非 root) |

**Dockerfile フロー**:
```
deps:    npm ci → node_modules
builder: next build → .next/standalone + .next/static
runner:  standalone/ + public/ + static/ コピー → node server.js
```

### 5.3 k3s Pod 構成

| サービス | Deployment replicas | 備考 |
|---------|--------------------|----|
| Frontend | 1 | k3s Pod として実行 |
| Backend | 1 | k3s Pod として実行 |

---

## 6. Traefik Ingress 設計

### 6.1 Ingress ルーティングルール

| パスパターン | 転送先 Service | ポート |
|------------|---------------|-------|
| `/api/*` | backend-svc | 8080 |
| `/*` (デフォルト) | frontend-svc | 3000 |

Kubernetes Ingress リソースで宣言的に管理。k3s に組み込みの Traefik が自動的にルールを適用する。

### 6.2 ヘルスチェック

| Service | ヘルスチェックパス | 方式 |
|---------|----------------|------|
| Frontend | /health | k8s livenessProbe / readinessProbe |
| Backend | /api/health | k8s livenessProbe / readinessProbe |

---

## 7. CI/CD パイプライン

### 7.1 トリガー

- `master` ブランチへの push
- 手動実行（workflow_dispatch）

### 7.2 認証方式

GitHub Actions OIDC を使用。長寿命のアクセスキーは使用しない。

| 項目 | 値 |
|------|-----|
| OIDC Provider | token.actions.githubusercontent.com |
| IAM Role | fortune-compass-github-actions |
| 必要な権限 | ECR push, S3/DynamoDB (tfstate) |

### 7.3 パイプラインフロー

```
Push to master
     │
     ├─ Job: test-backend
     │    npm ci → npm test (75 テスト)
     │
     └─ Job: build-and-deploy (test 成功後)
          │
          ├─ AWS OIDC 認証
          ├─ ECR ログイン
          ├─ Backend Docker build & push (tag: git SHA + latest)
          ├─ Frontend Docker build & push (tag: git SHA + latest)
          └─ SSH → EC2
               └─ kubectl set image deployment/backend ...
               └─ kubectl set image deployment/frontend ...
```

### 7.4 イメージタグ戦略

| タグ | 用途 |
|-----|------|
| `<git SHA>` | イミュータブル。特定のコミットに対応。ロールバック可能 |
| `latest` | 常に最新。開発・デバッグ用 |

---

## 8. Terraform 構成

### 8.1 ステート管理

| 項目 | 値 |
|------|-----|
| Backend | S3 |
| バケット | fortune-compass-tfstate |
| キー | dev/terraform.tfstate |
| ロック | DynamoDB (fortune-compass-tflock) |
| 暗号化 | 有効 |

### 8.2 モジュール構成

```
infra/terraform/
├── modules/
│   ├── networking/     VPC, Subnets, IGW, Routes
│   ├── ecr/            ECR リポジトリ x2, ライフサイクルポリシー
│   ├── ec2-k3s/        EC2, SG, Key Pair, User Data (k3s install)
│   ├── cloudfront/     CloudFront Distribution, Cache Behaviors, CF Function (/admin)
│   ├── management/     Lambda, Step Functions, API Gateway, S3 (管理コンソール)
│   ├── mediaconvert/   S3 x2, Lambda, MediaConvert, EventBridge (動画変換)
│   ├── security/       Security Hub, GuardDuty, Inspector, Config, Access Analyzer
│   └── bedrock/        Bedrock Agent, Lambda (fortune-bridge), OpenAPI Schema
├── environments/
│   └── dev/            モジュール結合 + 環境固有設定
└── k8s/
    ├── frontend-deployment.yaml
    ├── backend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-service.yaml
    └── ingress.yaml        Traefik Ingress ルール
```

### 8.3 リソース一覧

| モジュール | リソース数 | 主なリソース |
|-----------|----------|------------|
| networking | 6 | VPC, Subnet x2, IGW, Route Table, Association x2 |
| ecr | 4 | ECR Repository x2, Lifecycle Policy x2 |
| ec2-k3s | 4 | EC2 Instance, SG, Key Pair, EBS Volume |
| cloudfront | ~3 | CloudFront Distribution, CF Function (admin_rewrite) |
| management | 28 | Lambda, Step Functions x2, API Gateway, S3, IAM Role/Policy 等 |
| mediaconvert | ~12 | S3 x2, Lambda, IAM Role x2, S3 Notification, EventBridge, CloudWatch |
| security | ~13 | Security Hub, GuardDuty, Inspector, Config Recorder/Channel/Rules, S3, IAM, Access Analyzer |
| bedrock | ~9 | Bedrock Agent, Agent Action Group, Agent Alias, Lambda, IAM Role x2 |
| **合計** | **~80** | |

### 8.4 主要変数

| 変数 | デフォルト | 説明 |
|-----|----------|------|
| project_name | fortune-compass | リソース名のプレフィックス |
| environment | dev | 環境名 |
| aws_region | ap-northeast-1 | リージョン |
| instance_type | t3.small | EC2 インスタンスタイプ |
| key_pair_name | (必須) | SSH キーペア名 |
| frontend_image | (必須) | フロントエンドの ECR イメージ URI |
| backend_image | (必須) | バックエンドの ECR イメージ URI |

---

## 9. 環境変数

### 9.1 Backend (k8s Deployment)

| 変数 | 値 | 説明 |
|-----|-----|------|
| NODE_ENV | production | 実行環境 |
| PORT | 8080 | リッスンポート |
| CORS_ORIGIN | https://<CloudFront_Domain> | CORS 許可オリジン（Terraform が CloudFront ドメインから自動設定） |
| ANTHROPIC_API_KEY | (Secrets Manager) | Claude Vision API キー（手相占い用） |

### 9.2 Frontend (k8s Deployment)

| 変数 | 値 | 説明 |
|-----|-----|------|
| NODE_ENV | production | 実行環境（rewrites 無効化のトリガー） |
| PORT | 3000 | リッスンポート |
| HOSTNAME | 0.0.0.0 | 全インターフェースでリッスン |

### 9.3 シークレット管理

現時点では機密情報（DB パスワード、API キー等）がないため、k8s Deployment の `env` ブロック（平文）で管理する。

将来的にシークレットが必要になった場合は Kubernetes Secret に移行する：
```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: db-password
```

---

## 10. コスト見積もり（月額）

| リソース | 概算 | 備考 |
|---------|------|------|
| EC2 (t3.small) | ~$9 | 1インスタンス（2 vCPU, 2 GB RAM）リザーブドでさらに削減可能 |
| EBS | ~$2 | gp3 20GB |
| CloudFront | ~$0 | 無料枠内（月間 1TB 転送 + 1,000万リクエスト） |
| ECR | ~$1 | イメージストレージ（10世代保持） |
| CloudWatch Logs | ~$1 | 14日保持 |
| S3 + DynamoDB | < $1 | Terraform ステート |
| Security Hub / GuardDuty / Inspector / Config | ~$5〜10 | 無料枠終了後 |
| MediaConvert | 従量課金 | 動画変換時のみ |
| Bedrock Agent | 従量課金 | 推論実行時のみ |
| **合計** | **~$19〜24/月** | |

### コスト削減オプション

| 施策 | 削減額 | トレードオフ |
|-----|-------|------------|
| Management Console で EC2 停止 | ~-$9 | 未使用時に手動で停止/起動が必要 |
| EC2 リザーブドインスタンス（1年） | ~-$3 | 前払いが必要 |
| Spot インスタンス | ~-$6 | インスタンスが中断される可能性 |

---

## 11. デプロイ手順

### 11.1 初回セットアップ（手動）

1. **Terraform State 用リソース作成**
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

2. **GitHub Actions 用 IAM OIDC Provider 作成**
   ```bash
   aws iam create-open-id-connect-provider \
     --url https://token.actions.githubusercontent.com \
     --client-id-list sts.amazonaws.com \
     --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
   ```

3. **GitHub Actions 用 IAM Role 作成**
   - 信頼ポリシー: GitHub OIDC Provider + リポジトリ条件
   - 権限: ECR push, S3/DynamoDB アクセス

4. **GitHub Secret 設定**
   - `AWS_ACCOUNT_ID`: AWS アカウント ID

### 11.2 通常デプロイ（自動）

`master` ブランチに push するだけで GitHub Actions が自動実行：

```
git push origin master
  → test-backend (75 テスト)
  → build-and-deploy (Docker build → ECR push → SSH + kubectl set image)
  → k3s ローリングアップデート
```

### 11.3 ロールバック

```bash
# 前のイメージタグ（git SHA）を指定して kubectl set image
ssh ec2-user@<EC2_IP>
kubectl set image deployment/frontend frontend=<ECR_URI>:<previous_git_sha>
kubectl set image deployment/backend backend=<ECR_URI>:<previous_git_sha>
```

---

## 12. EC2 ライフサイクル管理（Management Console）

### 12.1 概要

EC2 インスタンスを使用しないときに停止し、コンピュートコストを削減するための管理コンソール。
Lambda + Step Functions で EC2 の起動・停止ワークフローを実装し、S3 静的ウェブサイトで管理画面を提供する。

### 12.2 アーキテクチャ

```
                    管理者
                      │
          ┌───────────▼───────────┐
          │  S3 Static Website    │  ← 管理コンソール UI
          │  (mgmt-console)       │
          └───────────┬───────────┘
                      │ API Key 認証
          ┌───────────▼───────────┐
          │  API Gateway          │  ← REST API
          │  /prod/manage         │
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │  Step Functions       │  ← start / stop ワークフロー
          │  (State Machine x2)   │
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │  Lambda Function      │  ← EC2 操作
          │  (Python 3.12)        │     start / stop / status /
          │                       │     health-check / ecr-refresh
          └───────────┬───────────┘
                      │
          ┌───────────▼───────────┐
          │  EC2 (k3s)            │  ← SSM Agent + ECR token refresh
          └───────────────────────┘
```

### 12.3 主要コンポーネント

| コンポーネント | 説明 |
|--------------|------|
| Lambda (Python 3.12) | EC2 start/stop/status/health-check/ECR token refresh を実行 |
| Step Functions (start) | EC2 起動 → ステータス確認待ち → ヘルスチェック → ECR トークンリフレッシュ |
| Step Functions (stop) | EC2 停止 → ステータス確認待ち |
| API Gateway | REST API（API Key 認証）で Step Functions / Lambda を呼び出し |
| S3 Static Website | 管理コンソール UI（HTML/CSS/JS） |
| SSM Agent (EC2) | Lambda からのリモートコマンド実行（ECR トークンリフレッシュ等） |
| ECR token refresh (systemd) | EC2 起動時に自動で ECR 認証トークンを更新する systemd サービス |

### 12.4 URL

| リソース | URL |
|---------|-----|
| 管理コンソール | http://fortune-compass-dev-mgmt-console.s3-website-ap-northeast-1.amazonaws.com |
| API エンドポイント | https://4s30b1da8k.execute-api.ap-northeast-1.amazonaws.com/prod/manage |

### 12.5 コスト影響

すべての新サービス（Lambda, Step Functions, API Gateway, S3）は AWS 無料枠内で運用可能（追加コスト $0）。
EC2 を未使用時に停止することで、コンピュートコスト（~$9/月）をアイドル期間中ほぼ $0 に削減可能。

---

## 13. Phase 12: AWS 非コンピュート系サービス拡張

### 13.1 CloudFront `/admin` パス

管理コンソール URL を `https://d71oywvumn06c.cloudfront.net/admin` に短縮 + HTTPS 化。

- CloudFront Function でパスリライト（`/admin*` → `/index.html`）
- S3 website endpoint を第2オリジンとして追加
- `dynamic` ブロックで `enable_admin_origin` フラグによる ON/OFF 制御

### 13.2 MediaConvert（動画変換）

S3 アップロードをトリガーに動画を MP4 + HLS に自動変換。

```
S3 (input) → Lambda (transcode_trigger) → MediaConvert → S3 (output)
                                                     ↓
                                              EventBridge → CloudWatch Logs
```

- Input/Output S3 バケットにライフサイクルポリシー（7日/30日で自動削除）
- `.mp4` アップロードで Lambda が MediaConvert ジョブを作成
- QVBR モードで品質ベースのエンコーディング（720p H.264 + AAC）
- EventBridge でジョブ完了/エラーをロギング

### 13.3 Security（セキュリティ監査）

5つの AWS セキュリティサービスを有効化し、既存インフラを監査。

| サービス | 役割 |
|---------|------|
| Security Hub | セキュリティ統合ダッシュボード + AWS 基礎ベストプラクティス標準 |
| GuardDuty | 脅威検出（不正アクセス・マルウェア検知） |
| Inspector | EC2 / ECR 脆弱性スキャン |
| AWS Config | リソース設定記録 + コンプライアンスルール（S3公開禁止, ポート制限） |
| IAM Access Analyzer | IAM ポリシーの外部アクセス分析 |

- 全サービス `count` ベースで個別 ON/OFF 可能
- Config Recorder はリージョンに1つのみ制限あり（`enable_config = false` で回避可能）

### 13.4 Bedrock Agent（対話型占いコンシェルジュ）

自然言語で占いを実行する AI エージェント。

```
ユーザー → Bedrock Agent → Claude (推論) → Lambda (fortune-bridge) → App Backend API
```

- Bedrock Agent に占いコンシェルジュの instruction を設定
- OpenAPI schema で 7 つの占い API を定義（dashboard, zodiac, tarot, omikuji, dream, blood-type, fengshui）
- Lambda (fortune-bridge) が Agent の Action Group 呼び出しを Backend API に橋渡し
- デフォルトモデル: `anthropic.claude-3-haiku-20240307-v1:0`（コスト最小）

---

## 14. 今後の拡張

| 項目 | 優先度 | 概要 |
|-----|-------|------|
| カスタムドメイン | 高 | Route 53 + ACM 証明書 + CloudFront Alternate Domain |
| staging 環境 | 中 | `environments/staging/` を追加し、同一モジュールを再利用 |
| オートスケーリング | 中 | Kubernetes HPA (Horizontal Pod Autoscaler) |
| モニタリング | 低 | Prometheus + Grafana on k3s |
| WAF | 低 | CloudFront 前段に AWS WAF を配置 |
| Blue/Green デプロイ | 低 | Kubernetes Deployment strategy で無停止デプロイ |

> **Note**: HTTPS 対応は CloudFront により実現済み（デフォルト証明書）。
