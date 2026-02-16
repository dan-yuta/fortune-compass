# Fortune Compass インフラ設計書

## 1. 概要

Fortune Compass を AWS ECS Fargate にデプロイするためのインフラ設計。
IaC には Terraform、CI/CD には GitHub Actions を採用する。

### 対象環境

| 項目 | 値 |
|------|-----|
| クラウド | AWS |
| リージョン | ap-northeast-1（東京） |
| IaC | Terraform >= 1.5 |
| CI/CD | GitHub Actions |
| コンテナレジストリ | Amazon ECR |
| コンピュート | ECS Fargate |
| ロードバランサー | ALB (Application Load Balancer) |
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
                    ┌───────▼───────┐
                    │   ALB (:80)   │   ← Public Subnets (2 AZs)
                    │               │
                    │  ┌──────────┐ │
                    │  │ Listener │ │
                    │  │ Rules    │ │
                    │  └──┬───┬──┘ │
                    └─────┼───┼────┘
                /api/*    │   │       /* (default)
                ┌─────────┘   └─────────┐
                ▼                       ▼
    ┌───────────────────┐   ┌───────────────────┐
    │  Target Group     │   │  Target Group     │
    │  Backend (:8080)  │   │  Frontend (:3000) │
    └────────┬──────────┘   └────────┬──────────┘
             │                       │
    ┌────────▼──────────┐   ┌────────▼──────────┐
    │  ECS Service      │   │  ECS Service      │
    │  Backend          │   │  Frontend         │
    │  ┌──────────────┐ │   │  ┌──────────────┐ │
    │  │  Fargate     │ │   │  │  Fargate     │ │
    │  │  Express     │ │   │  │  Next.js     │ │
    │  │  :8080       │ │   │  │  :3000       │ │
    │  │  256 CPU     │ │   │  │  256 CPU     │ │
    │  │  512 MB      │ │   │  │  512 MB      │ │
    │  └──────────────┘ │   │  └──────────────┘ │
    └───────────────────┘   └───────────────────┘
             │    Private Subnets (2 AZs)   │
             └──────────┬───────────────────┘
                        │
                 ┌──────▼──────┐
                 │ NAT Gateway │  → Internet (ECR pull 等)
                 └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │   Internet  │
                 │   Gateway   │
                 └─────────────┘
```

---

## 3. 設計判断

### 3.1 ALB パスベースルーティング

**決定**: ALB が `/api/*` をバックエンドに、`/*` をフロントエンドに直接ルーティングする。

**理由**:
- 開発環境では Next.js の rewrites でフロントエンド → バックエンドにプロキシしているが、本番では ALB が直接振り分ける方が効率的
- フロントエンドの API クライアント（`lib/api-client.ts`）は相対パス `/api/fortune/*` を使用しており、ブラウザからのリクエストは ALB のドメインに対して行われるため、コード変更不要
- 余分なネットワークホップ（ブラウザ → Frontend → Backend）を排除し、レイテンシを削減

**代替案（不採用）**:
- Cloud Map（サービスディスカバリ）: SSR でサーバーサイドから API を呼ぶ場合に必要だが、現在は全 API 呼び出しがクライアントサイドなので不要
- フロントエンド経由プロキシ: 開発環境と同じ構成だが、本番では無駄なオーバーヘッド

### 3.2 Next.js standalone 出力

**決定**: `next.config.ts` に `output: "standalone"` を設定。

**理由**:
- 通常の Next.js ビルドでは `node_modules` 全体（数百MB）が必要だが、standalone モードでは必要なファイルのみをコピーし、Docker イメージが約 120-150MB に削減される
- standalone は `server.js` 単体で起動可能で、Dockerfile がシンプルになる

### 3.3 Private Subnet + NAT Gateway

**決定**: ECS タスクを Private Subnet に配置し、NAT Gateway 経由でインターネットアクセスする。

**理由**:
- コンテナが直接インターネットに公開されないため、セキュリティが向上
- ECR からのイメージ pull や CloudWatch Logs への送信には外向きインターネットアクセスが必要

**コスト影響**: NAT Gateway は ~$32/月。コスト削減が必要な場合は Public Subnet + `assignPublicIp = true` で代替可能だが、ネットワーク隔離が失われる。

### 3.4 シード付き乱数の日替わり整合性

**決定**: ECS の複数タスク間でも同一日に同一結果を返す。

**理由**:
- バックエンドの占いロジック（星座・数秘術・血液型）は djb2 ハッシュベースのシード付き乱数を使用しており、入力（誕生日 + 日付）が同じなら常に同じ結果を返す
- データベースやキャッシュ（Redis 等）は不要

**例外**: タロット占いは `Math.random()` を使用し、毎回異なる結果を返す（仕様通り）

### 3.5 CloudFront による HTTPS 対応

**決定**: CloudFront を ALB の前段に配置し、HTTPS 終端 + 静的アセットキャッシュを提供する。

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

**決定**: 5モジュール構成（networking / ecr / alb / ecs / cloudfront）。

**理由**:
- MVP として十分な粒度で、過度な分割を避ける
- 環境追加（staging / production）時にモジュールを再利用可能
- 各モジュールの責務が明確

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
| Public | ap-northeast-1a | 10.0.0.0/24 | ALB, NAT Gateway |
| Public | ap-northeast-1c | 10.0.1.0/24 | ALB |
| Private | ap-northeast-1a | 10.0.10.0/24 | ECS タスク |
| Private | ap-northeast-1c | 10.0.11.0/24 | ECS タスク |

### 4.3 ルーティング

| ルートテーブル | 宛先 | ターゲット |
|-------------|------|----------|
| Public | 0.0.0.0/0 | Internet Gateway |
| Private | 0.0.0.0/0 | NAT Gateway |

### 4.4 セキュリティグループ

| SG | インバウンド | アウトバウンド |
|----|-----------|------------|
| ALB SG | 80/tcp from 0.0.0.0/0 | All traffic |
| ECS SG | 3000/tcp from ALB SG | All traffic |
| ECS SG | 8080/tcp from ALB SG | All traffic |

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

### 5.3 ECS タスク定義

| サービス | CPU | メモリ | 希望タスク数 |
|---------|-----|-------|------------|
| Frontend | 256 (0.25 vCPU) | 512 MB | 1 |
| Backend | 256 (0.25 vCPU) | 512 MB | 1 |

---

## 6. ALB 設計

### 6.1 リスナールール

| 優先度 | 条件 | 転送先 |
|-------|------|-------|
| 100 | path-pattern: `/api/*` | Backend Target Group |
| default | (なし) | Frontend Target Group |

### 6.2 ターゲットグループ

| TG | ポート | ヘルスチェックパス | 間隔 | 閾値 (healthy/unhealthy) |
|----|-------|----------------|------|------------------------|
| Frontend | 3000 | /health | 30s | 2 / 3 |
| Backend | 8080 | /api/health | 30s | 2 / 3 |

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
| 必要な権限 | ECR push, ECS update, S3/DynamoDB (tfstate) |

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
          ├─ terraform init
          └─ terraform apply -auto-approve
               └─ ECS タスク定義更新 → ローリングデプロイ
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
│   ├── networking/     VPC, Subnets, IGW, NAT, Routes
│   ├── ecr/            ECR リポジトリ x2, ライフサイクルポリシー
│   ├── alb/            ALB, SG, Target Groups, Listener Rules
│   ├── ecs/            Cluster, Task Defs, Services, IAM, Logs, SG
│   └── cloudfront/     CloudFront Distribution, Cache Behaviors
└── environments/
    └── dev/            モジュール結合 + 環境固有設定
```

### 8.3 リソース一覧

| モジュール | リソース数 | 主なリソース |
|-----------|----------|------------|
| networking | 12 | VPC, Subnet x4, IGW, NAT GW, EIP, Route Table x2, Association x4 |
| ecr | 4 | ECR Repository x2, Lifecycle Policy x2 |
| alb | 7 | ALB, SG, Target Group x2, Listener, Listener Rule x2 |
| ecs | 11 | Cluster, IAM Role x2, Log Group x2, SG, Task Def x2, Service x2 |
| cloudfront | 1 | CloudFront Distribution（3 Cache Behaviors 含む） |
| **合計** | **35** | |

### 8.4 主要変数

| 変数 | デフォルト | 説明 |
|-----|----------|------|
| project_name | fortune-compass | リソース名のプレフィックス |
| environment | dev | 環境名 |
| aws_region | ap-northeast-1 | リージョン |
| frontend_image | (必須) | フロントエンドの ECR イメージ URI |
| backend_image | (必須) | バックエンドの ECR イメージ URI |
| frontend_cpu / memory | 256 / 512 | フロントエンドのリソース割当 |
| backend_cpu / memory | 256 / 512 | バックエンドのリソース割当 |

---

## 9. 環境変数

### 9.1 Backend (ECS Task Definition)

| 変数 | 値 | 説明 |
|-----|-----|------|
| NODE_ENV | production | 実行環境 |
| PORT | 8080 | リッスンポート |
| CORS_ORIGIN | https://<CloudFront_Domain> | CORS 許可オリジン（Terraform が CloudFront ドメインから自動設定） |
| ANTHROPIC_API_KEY | (Secrets Manager) | Claude Vision API キー（手相占い用） |

### 9.2 Frontend (ECS Task Definition)

| 変数 | 値 | 説明 |
|-----|-----|------|
| NODE_ENV | production | 実行環境（rewrites 無効化のトリガー） |
| PORT | 3000 | リッスンポート |
| HOSTNAME | 0.0.0.0 | 全インターフェースでリッスン |

### 9.3 シークレット管理

現時点では機密情報（DB パスワード、API キー等）がないため、ECS Task Definition の `environment` ブロック（平文）で管理する。

将来的にシークレットが必要になった場合は AWS Secrets Manager + ECS の `secrets` ブロックに移行する：
```json
"secrets": [
  { "name": "DB_PASSWORD", "valueFrom": "arn:aws:secretsmanager:..." }
]
```

---

## 10. コスト見積もり（月額）

| リソース | 概算 | 備考 |
|---------|------|------|
| Fargate | ~$15 | 2タスク x 0.25vCPU x 0.5GB |
| ALB | ~$18 | 固定料金 + LCU |
| NAT Gateway | ~$32 | 固定料金 + データ転送 |
| CloudFront | ~$0 | 無料枠内（月間 1TB 転送 + 1,000万リクエスト） |
| ECR | ~$1 | イメージストレージ（10世代保持） |
| CloudWatch Logs | ~$1 | 14日保持 |
| S3 + DynamoDB | < $1 | Terraform ステート |
| **合計** | **~$68/月** | |

### コスト削減オプション

| 施策 | 削減額 | トレードオフ |
|-----|-------|------------|
| NAT Gateway 廃止 → Public Subnet + Public IP | -$32 | ネットワーク隔離が失われる |
| Fargate Spot | ~-$10 | タスクが中断される可能性 |
| 単一 AZ 構成 | ~-$5 | 可用性が低下 |

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
   - 権限: ECR push, ECS update-service, S3/DynamoDB アクセス

4. **GitHub Secret 設定**
   - `AWS_ACCOUNT_ID`: AWS アカウント ID

### 11.2 通常デプロイ（自動）

`master` ブランチに push するだけで GitHub Actions が自動実行：

```
git push origin master
  → test-backend (75 テスト)
  → build-and-deploy (Docker build → ECR push → terraform apply)
  → ECS ローリングデプロイ
```

### 11.3 ロールバック

```bash
# 前のイメージタグ（git SHA）を指定して terraform apply
cd infra/terraform/environments/dev
terraform apply \
  -var="frontend_image=<ECR_URI>:<previous_git_sha>" \
  -var="backend_image=<ECR_URI>:<previous_git_sha>"
```

---

## 12. 今後の拡張

| 項目 | 優先度 | 概要 |
|-----|-------|------|
| カスタムドメイン | 高 | Route 53 + ACM 証明書 + CloudFront Alternate Domain |
| staging 環境 | 中 | `environments/staging/` を追加し、同一モジュールを再利用 |
| オートスケーリング | 中 | ECS Service Auto Scaling (CPU/メモリベース) |
| Container Insights | 低 | ECS クラスターの詳細メトリクス |
| WAF | 低 | CloudFront 前段に AWS WAF を配置 |
| Blue/Green デプロイ | 低 | CodeDeploy 連携で無停止デプロイ |

> **Note**: HTTPS 対応は CloudFront により実現済み（デフォルト証明書）。
