# Fortune Compass — 環境の削除と再作成ガイド

> このドキュメントは、Fortune Compass の AWS インフラを **完全削除（terraform destroy）** して
> **再作成（terraform apply）** する手順を、初心者向けにステップバイステップで解説したものです。
> 使わない期間の AWS 料金を **$0/月** にするための運用ガイドです。

---

## 目次

1. [このドキュメントの目的](#1-このドキュメントの目的)
2. [前提条件](#2-前提条件)
3. [コスト比較（なぜ削除するのか）](#3-コスト比較なぜ削除するのか)
4. [削除しても残るもの・消えるもの](#4-削除しても残るもの消えるもの)
5. [再作成後に変わるもの（重要）](#5-再作成後に変わるもの重要)
6. [環境の削除手順（terraform destroy）](#6-環境の削除手順terraform-destroy)
7. [環境の再作成手順（terraform apply）](#7-環境の再作成手順terraform-apply)
8. [再作成後の設定更新](#8-再作成後の設定更新)
9. [動作確認チェックリスト](#9-動作確認チェックリスト)
10. [トラブルシューティング](#10-トラブルシューティング)
11. [よくある質問（FAQ）](#11-よくある質問faq)

---

## 1. このドキュメントの目的

### どんなときに使うの？

```
【使うときだけ動かして、使わないときは消す】

平日（勉強中）：terraform apply → 環境を作る → 勉強する
週末（お休み）：terraform destroy → 環境を消す → 料金 $0

     月   火   水   木   金   土   日
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ON   ON   ON   ON   ON   OFF  OFF
     ↑ apply                  ↑ destroy
```

### なぜ「削除して再作成」なの？

EC2 を**停止**しても、一部のリソースに料金がかかり続けます。
**完全に削除**すれば、料金は **$0** になります。

> **例え話**: 使わない部屋の電気を消す（EC2 停止）のではなく、
> 部屋そのものを解約する（terraform destroy）イメージです。
> また使いたくなったら、新しく契約（terraform apply）し直します。

---

## 2. 前提条件

### 必要なツール

以下のツールがインストール・設定済みであることを確認してください。

| ツール | 確認コマンド | 必要な設定 |
|--------|-------------|-----------|
| **AWS CLI** | `aws --version` | `aws configure` でアクセスキー + リージョン設定済み |
| **Terraform** | `terraform --version` | v1.5 以上 |
| **Git** | `git --version` | GitHub にアクセスできること |
| **GitHub CLI** | `gh --version` | `gh auth login` でログイン済み |
| **SSH** | `ssh -V` | — |

### 設定確認

```bash
# AWS 認証が通るか確認
aws sts get-caller-identity

# 出力例（アカウント情報が表示されれば OK）:
# {
#     "UserId": "AIDA...",
#     "Account": "813469361929",
#     "Arn": "arn:aws:iam::813469361929:user/dangi-yuta-terraform"
# }
```

```bash
# Terraform の作業ディレクトリに移動できるか確認
ls /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev/main.tf

# ファイルが表示されれば OK
```

---

## 3. コスト比較（なぜ削除するのか）

### 月額コストの比較

| 状態 | EC2 | EBS | EIP | セキュリティ系 | S3 他 | 合計 |
|------|-----|-----|-----|-------------|-------|------|
| **常時起動** | ~$9 | ~$2.4 | ~$3.6 | ~$5-10 | <$1 | **~$19-24/月** |
| **EC2 停止のみ** | $0 | ~$2.4 | ~$3.6 | ~$5-10 | <$1 | **~$12-17/月** |
| **terraform destroy** | $0 | $0 | $0 | $0 | $0 | **$0/月** |

### 料金の内訳説明

| リソース | なぜ料金がかかるのか | 停止で消えるか |
|---------|-------------------|-------------|
| EC2 (t3.small) | サーバーの稼働時間に課金 | 停止で $0 |
| EBS (20GB gp3) | ディスクの確保量に課金 | **停止しても課金** |
| EIP | パブリック IPv4 アドレスに課金 | **停止しても課金** |
| Security Hub 等 | サービスの有効化に課金 | **停止しても課金** |
| S3 | 保存データ量に課金 | **停止しても課金** |

> **結論**: EC2 を止めるだけでは **月 $12-17 かかり続ける**。
> 完全に $0 にするには `terraform destroy` が必要。

---

## 4. 削除しても残るもの・消えるもの

### 残るもの（削除されない）

```
【Terraform が管理していないもの = 手動で作ったもの】

✓ Terraform ステート用 S3 バケット（fortune-compass-tfstate）
✓ Terraform ロック用 DynamoDB テーブル（fortune-compass-tflock）
✓ GitHub Actions 用 OIDC プロバイダー（IAM）
✓ GitHub Actions 用 IAM ロール（fortune-compass-github-actions）
✓ GitHub リポジトリ（ソースコード）
✓ GitHub Secrets（AWS_ACCOUNT_ID, EC2_HOST, EC2_SSH_KEY）
✓ ローカルのソースコード（あなたのパソコン上のファイル）
✓ IAM ユーザー（dangi-yuta-terraform）
```

> **安心ポイント**: ソースコードや Terraform の設定ファイルは一切消えません。
> 消えるのは **AWS 上に作ったリソース**だけです。

### 消えるもの（削除される）

```
【Terraform が管理しているもの = terraform apply で作ったもの】

✗ VPC / サブネット / セキュリティグループ
✗ EC2 インスタンス（k3s クラスター丸ごと）
✗ Elastic IP（パブリック IP アドレス）
✗ ECR リポジトリ（Docker イメージも全て）
✗ CloudFront ディストリビューション
✗ CloudFront Function
✗ Lambda 関数（3つ全て）
✗ Step Functions ステートマシン
✗ API Gateway
✗ S3 バケット（管理コンソール用、MediaConvert 用、Config 用）
✗ Security Hub / GuardDuty / Inspector / Config / Access Analyzer
✗ Bedrock Agent
✗ IAM ロール（Terraform が作ったもの）
✗ SSH キーペア（EC2 接続用）
```

> **注意**: ECR の Docker イメージは `force_delete = true` が設定されているため、
> 中身ごと削除されます。再作成後はイメージを再ビルド・再プッシュする必要があります。

---

## 5. 再作成後に変わるもの（重要）

### 変わるもの一覧

再作成すると、以下の値が**すべて新しくなります**。
ブックマーク、メモ、ドキュメント等を更新する必要があります。

| 項目 | 削除前の例 | 再作成後 | 確認方法 |
|------|----------|---------|---------|
| **CloudFront ドメイン** | `d71oywvumn06c.cloudfront.net` | `dXXXXXXXXXXX.cloudfront.net`（新規） | `terraform output app_url` |
| **アプリ URL** | `https://d71oywvumn06c.cloudfront.net` | 新しい CloudFront URL | `terraform output app_url` |
| **管理コンソール URL** | `https://d71oywvumn06c.cloudfront.net/admin` | 新しい CloudFront URL + `/admin` | `terraform output management_console_url` |
| **EC2 パブリック IP** | `13.192.182.54` | 新しい IP アドレス | `terraform output ec2_public_ip` |
| **SSH 秘密鍵** | `~/.ssh/fortune-compass-k3s.pem` | 新しい鍵に差し替え必要 | `terraform output -raw k3s_ssh_private_key` |
| **API Gateway エンドポイント** | `https://4s30b1da8k.execute-api...` | 新しい URL | `terraform output management_api_endpoint` |
| **管理 API キー** | （シークレット） | 新しいキー | `terraform output -raw management_api_key` |
| **Bedrock Agent ID** | `S9VLGUCXNQ` | 新しい ID | `terraform output bedrock_agent_id` |
| **GuardDuty Detector ID** | `5821ef4f...` | 新しい ID | `terraform output guardduty_detector_id` |

### 変わらないもの

| 項目 | 値 | 理由 |
|------|-----|------|
| ECR リポジトリ**名** | `fortune-compass-dev-backend` 等 | プロジェクト名 + 環境名から決定的に生成 |
| S3 バケット**名** | `fortune-compass-dev-mgmt-console` 等 | 同上 |
| AWS アカウント ID | `813469361929` | アカウント固有 |
| GitHub リポジトリ | `dan-yuta/fortune-compass` | 変更なし |

### GitHub Secrets で更新が必要なもの

| Secret 名 | 変更の必要性 | 理由 |
|-----------|-------------|------|
| `AWS_ACCOUNT_ID` | **不要** | アカウント ID は変わらない |
| `EC2_HOST` | **必要** | EC2 の IP アドレスが変わるため |
| `EC2_SSH_KEY` | **必要** | SSH 鍵が新しく生成されるため |

---

## 6. 環境の削除手順（terraform destroy）

### 概要図

```
[Step 1] S3 バケットを空にする
    ↓
[Step 2] terraform destroy を実行する
    ↓
[Step 3] 削除完了を確認する
    ↓
[Step 4] ローカルファイルを整理する
    ↓
完了！ AWS 料金 → $0/月
```

### Step 1: S3 バケットを空にする（必須）

**なぜこの作業が必要？**

Terraform は「中身が入っている S3 バケット」を削除できません。
事前に中身を空にしておく必要があります。

> **例え話**: ゴミ箱を捨てるとき、中のゴミを先に出してからでないと捨てられないのと同じです。

```bash
# 1. 管理コンソール用バケットを空にする
aws s3 rm s3://fortune-compass-dev-mgmt-console --recursive

# 2. MediaConvert 入力バケットを空にする
aws s3 rm s3://fortune-compass-dev-media-input --recursive

# 3. MediaConvert 出力バケットを空にする
aws s3 rm s3://fortune-compass-dev-media-output --recursive

# 4. AWS Config ログバケットを空にする
aws s3 rm s3://fortune-compass-dev-config-logs --recursive
```

> **出力例**:
> ```
> delete: s3://fortune-compass-dev-mgmt-console/index.html
> ```
> 何も表示されない場合は、そのバケットが既に空か、存在しないかのどちらかです。問題ありません。

### Step 2: terraform destroy を実行する

```bash
# Terraform の作業ディレクトリに移動
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
```

```bash
# 削除の計画を確認する（まだ削除されません）
terraform plan -destroy
```

> **出力の見方**:
> ```
> Plan: 0 to add, 0 to change, XX to destroy.
>                                ↑ 削除されるリソースの数
> ```
> この時点では「計画」を表示しているだけで、まだ何も削除されていません。

```bash
# 削除を実行する
terraform destroy
```

> **確認メッセージが表示されます**:
> ```
> Do you really want to destroy all resources?
>   Terraform will destroy all your managed infrastructure, as shown above.
>   There is no undo. Only 'yes' will be accepted to confirm.
>
>   Enter a value: yes
> ```
> **`yes` と入力して Enter** を押してください。`y` や `Y` ではなく、必ず **`yes`**（小文字3文字）です。

### 所要時間の目安

| リソース | 削除にかかる時間 |
|---------|---------------|
| EC2 インスタンス | ~1 分 |
| CloudFront ディストリビューション | **~10-15 分**（最も時間がかかる） |
| Security Hub / GuardDuty 等 | ~1-2 分 |
| その他（VPC, Lambda, S3 等） | ~1-2 分 |
| **合計** | **約 15-20 分** |

> **注意**: CloudFront の削除には時間がかかります。
> `Still destroying...` と表示されても、焦らずに待ってください。

### Step 3: 削除完了を確認する

```bash
# 成功した場合の出力:
# Destroy complete! Resources: XX destroyed.
```

```bash
# 現在の Terraform 管理リソースを確認（0 件なら OK）
terraform state list

# 何も表示されなければ、全リソースが削除されています
```

### Step 4: ローカルファイルを整理する

```bash
# 古い SSH 鍵ファイルを削除（再作成時に新しい鍵が生成されるため）
rm -f ~/.ssh/fortune-compass-k3s.pem
```

### 削除完了！

これで AWS 上のリソースは全て削除されました。**月額料金は $0 です。**

> **Terraform ステート用の S3 + DynamoDB は残っています**が、
> 料金はほぼ $0 です（S3: 数 KB のファイル、DynamoDB: オンデマンド読み書き）。
> これらは次回の `terraform apply` に必要なので、削除しないでください。

---

## 7. 環境の再作成手順（terraform apply）

### 概要図

```
[Step 1] terraform apply を実行する（~10-15 分）
    ↓
[Step 2] 新しい値を確認する（URL, IP, 鍵）
    ↓
[Step 3] SSH 鍵を保存する
    ↓
[Step 4] k3s の起動を待つ（~2-3 分）
    ↓
[Step 5] Docker イメージをビルド＆プッシュする
    ↓
[Step 6] GitHub Secrets を更新する
    ↓
[Step 7] k3s にデプロイする
    ↓
[Step 8] CloudFront の反映を待つ（~5-10 分）
    ↓
完了！ アプリが新しい URL で動作中
```

### Step 1: terraform apply を実行する

```bash
# Terraform の作業ディレクトリに移動
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
```

```bash
# 作成の計画を確認する（まだ作成されません）
terraform plan
```

> **出力の見方**:
> ```
> Plan: XX to add, 0 to change, 0 to destroy.
>       ↑ 作成されるリソースの数（約 80 個）
> ```

```bash
# 作成を実行する
terraform apply
```

> **確認メッセージが表示されます**:
> ```
> Do you want to perform these actions?
>   Enter a value: yes
> ```
> **`yes` と入力して Enter** を押してください。

### 所要時間の目安

| リソース | 作成にかかる時間 |
|---------|---------------|
| VPC / サブネット / SG | ~1 分 |
| EC2 インスタンス + k3s セットアップ | ~3-5 分 |
| CloudFront ディストリビューション | **~5-10 分** |
| Security Hub / GuardDuty 等 | ~2-3 分 |
| Bedrock Agent | ~2-3 分 |
| その他（ECR, Lambda, S3 等） | ~1-2 分 |
| **合計** | **約 10-15 分** |

### Step 2: 新しい値を確認する

`terraform apply` が完了すると、新しいリソースの情報が表示されます。

```bash
# 全出力値を一覧表示
terraform output
```

> **出力例**（値は毎回異なります）:
> ```
> app_url = "https://dABC123XYZ.cloudfront.net"
> cloudfront_domain = "dABC123XYZ.cloudfront.net"
> ec2_public_ip = "54.238.xxx.xxx"
> management_console_url = "https://dABC123XYZ.cloudfront.net/admin"
> bedrock_agent_id = "XXXXXXXXXX"
> ...
> ```

**以下のコマンドで個別に確認できます:**

```bash
# アプリ URL（ブックマーク更新用）
terraform output app_url

# EC2 の IP アドレス（SSH 接続 + GitHub Secrets 更新用）
terraform output ec2_public_ip

# 管理コンソール URL
terraform output management_console_url

# Bedrock Agent のテストコマンド
terraform output bedrock_agent_invoke_command
```

> **重要**: これらの値をメモしておいてください。
> 特に `app_url` と `ec2_public_ip` は後の手順で使います。

### Step 3: SSH 鍵を保存する

```bash
# 新しい SSH 秘密鍵をファイルに保存
terraform output -raw k3s_ssh_private_key > ~/.ssh/fortune-compass-k3s.pem

# 権限を設定（自分だけが読めるように）
chmod 600 ~/.ssh/fortune-compass-k3s.pem
```

> **なぜ必要？**: 再作成時に新しい SSH 鍵が生成されます。
> 以前の鍵は使えなくなるため、新しい鍵をファイルに保存する必要があります。

### Step 4: k3s の起動を待つ

EC2 インスタンスが起動すると、自動的に k3s のインストールが始まります。
完了するまで **2-3 分** 待ってください。

```bash
# EC2 の IP アドレスを変数に保存（以降のコマンドで使用）
EC2_IP=$(terraform output -raw ec2_public_ip)
echo "EC2 IP: $EC2_IP"
```

```bash
# SSH で接続してk3s の状態を確認
ssh -i ~/.ssh/fortune-compass-k3s.pem -o StrictHostKeyChecking=no ubuntu@$EC2_IP \
  "sudo k3s kubectl get nodes"
```

> **期待する出力**:
> ```
> NAME          STATUS   ROLES                  AGE   VERSION
> ip-10-0-...   Ready    control-plane,master   2m    v1.34.4+k3s1
> ```
> `STATUS` が `Ready` になっていれば OK です。

> **`NotReady` と表示された場合**: まだ初期化中です。30 秒待ってから再度実行してください。

> **`Connection refused` と表示された場合**: EC2 がまだ起動中です。1 分待ってから再度実行してください。

### Step 5: Docker イメージをビルド＆プッシュする

ECR リポジトリは再作成されますが、**中身は空**です。
Docker イメージをビルドして ECR に送信する必要があります。

```bash
# fortune-compass のリポジトリルートに移動
cd /home/dangi/work/my-project/fortune-compass
```

```bash
# ECR にログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  813469361929.dkr.ecr.ap-northeast-1.amazonaws.com
```

> **出力**: `Login Succeeded` と表示されれば OK。

```bash
# バックエンドの Docker イメージをビルド＆プッシュ
docker build -t 813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:latest backend/
docker push 813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:latest
```

```bash
# フロントエンドの Docker イメージをビルド＆プッシュ
docker build -t 813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:latest frontend/
docker push 813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:latest
```

> **所要時間**: 各イメージのビルドに 2-5 分、プッシュに 1-2 分かかります。
>
> **エラーが出た場合**: `docker login` のセッションが切れている可能性があります。
> ECR ログインコマンドを再実行してください。

### Step 6: GitHub Secrets を更新する

新しい EC2 の IP アドレスと SSH 鍵を GitHub Secrets に登録します。

```bash
# Terraform 作業ディレクトリに移動（SSH 鍵の取得に必要）
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
```

```bash
# EC2_HOST を更新
gh secret set EC2_HOST \
  --repo dan-yuta/fortune-compass \
  --body "$(terraform output -raw ec2_public_ip)"
```

> **出力**: `✓ Set secret EC2_HOST for dan-yuta/fortune-compass`

```bash
# EC2_SSH_KEY を更新
gh secret set EC2_SSH_KEY \
  --repo dan-yuta/fortune-compass \
  --body "$(terraform output -raw k3s_ssh_private_key)"
```

> **出力**: `✓ Set secret EC2_SSH_KEY for dan-yuta/fortune-compass`

```bash
# 確認: Secrets が設定されているか（値は表示されません）
gh secret list --repo dan-yuta/fortune-compass
```

> **出力例**:
> ```
> AWS_ACCOUNT_ID  Updated 2026-XX-XX
> EC2_HOST        Updated 2026-XX-XX  ← 今更新した
> EC2_SSH_KEY     Updated 2026-XX-XX  ← 今更新した
> ```

### Step 7: k3s にデプロイする

Docker イメージを k3s にデプロイします。2つの方法があります。

#### 方法 A: GitHub Actions を手動実行する（推奨）

CI/CD パイプライン経由でデプロイします。テスト → ビルド → デプロイが全自動で実行されます。

```bash
cd /home/dangi/work/my-project/fortune-compass

# ワークフローを手動実行
gh workflow run deploy.yml --repo dan-yuta/fortune-compass

# 実行状況をリアルタイムで確認
gh run list --repo dan-yuta/fortune-compass --limit 1
```

```bash
# run ID を確認して進捗を監視（数分で完了）
gh run watch <run-ID> --repo dan-yuta/fortune-compass
```

#### 方法 B: SSH で直接デプロイする

GitHub Actions を使わず、手動でデプロイする方法です。

```bash
# Terraform 作業ディレクトリで IP を取得
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
EC2_IP=$(terraform output -raw ec2_public_ip)
```

```bash
# EC2 に SSH 接続
ssh -i ~/.ssh/fortune-compass-k3s.pem ubuntu@$EC2_IP
```

```bash
# ※ 以下は EC2 に SSH 接続した状態で実行

# ECR 認証トークンを更新
TOKEN=$(aws ecr get-login-password --region ap-northeast-1)
sudo k3s kubectl create secret docker-registry ecr-secret \
  --docker-server=813469361929.dkr.ecr.ap-northeast-1.amazonaws.com \
  --docker-username=AWS \
  --docker-password="$TOKEN" \
  -n fortune-compass \
  --dry-run=client -o yaml | sudo k3s kubectl apply -f -

# デプロイメントのイメージを更新
sudo k3s kubectl set image deployment/backend \
  backend=813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:latest \
  -n fortune-compass

sudo k3s kubectl set image deployment/frontend \
  frontend=813469361929.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:latest \
  -n fortune-compass

# ロールアウト完了を待つ
sudo k3s kubectl rollout status deployment/backend -n fortune-compass --timeout=120s
sudo k3s kubectl rollout status deployment/frontend -n fortune-compass --timeout=120s

# Pod の状態を確認
sudo k3s kubectl get pods -n fortune-compass
```

> **期待する出力**:
> ```
> NAME                        READY   STATUS    RESTARTS   AGE
> backend-xxxxx-xxxxx         1/1     Running   0          1m
> frontend-xxxxx-xxxxx        1/1     Running   0          1m
> ```
> 両方とも `Running` になっていれば成功です。

### Step 8: CloudFront の反映を待つ

CloudFront ディストリビューションが世界中のエッジサーバーに配信されるまで、
**5-10 分** かかることがあります。

```bash
# Terraform 作業ディレクトリで URL を取得
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
APP_URL=$(terraform output -raw app_url)
echo "アプリ URL: $APP_URL"
```

```bash
# ヘルスチェック（200 OK が返れば成功）
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" $APP_URL/api/health
```

> **`HTTP Status: 200`** と表示されれば、アプリが正常に動作しています。
>
> **`HTTP Status: 502` や `503`** の場合は、CloudFront のデプロイがまだ完了していません。
> 2-3 分待ってから再度実行してください。

---

## 8. 再作成後の設定更新

### 更新が必要な場所チェックリスト

再作成後、以下の場所を新しい値に更新してください。

| 更新場所 | 更新内容 | 必須/任意 |
|---------|---------|---------|
| GitHub Secrets（EC2_HOST） | 新しい EC2 IP | **必須** |
| GitHub Secrets（EC2_SSH_KEY） | 新しい SSH 鍵 | **必須** |
| ブラウザのブックマーク | 新しいアプリ URL | 任意 |
| ブラウザのブックマーク | 新しい管理コンソール URL | 任意 |
| ローカルの SSH 鍵 | `~/.ssh/fortune-compass-k3s.pem` | **必須**（SSH する場合） |
| 学習ドキュメント内の IP / URL | `docs/011_*.md`, `docs/012_*.md` | 任意（学習時に読み替え） |

> **学習ドキュメントの IP / URL について**:
> `docs/011_cicd-learning.md` と `docs/012_kubernetes-learning.md` には
> 以前の IP アドレス（`13.192.182.54`）やコマンド例が記載されています。
> 実行時は `terraform output ec2_public_ip` で取得した新しい IP に読み替えてください。

### 新しい値の一括確認コマンド

```bash
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev

echo "=== 再作成後の新しい値 ==="
echo ""
echo "アプリ URL:        $(terraform output -raw app_url)"
echo "管理コンソール:     $(terraform output -raw management_console_url)"
echo "EC2 IP:            $(terraform output -raw ec2_public_ip)"
echo "Bedrock Agent ID:  $(terraform output -raw bedrock_agent_id)"
echo ""
echo "=== GitHub Secrets 更新コマンド ==="
echo "gh secret set EC2_HOST --repo dan-yuta/fortune-compass --body \"$(terraform output -raw ec2_public_ip)\""
echo "gh secret set EC2_SSH_KEY --repo dan-yuta/fortune-compass --body \"\$(terraform output -raw k3s_ssh_private_key)\""
```

---

## 9. 動作確認チェックリスト

再作成後、以下の項目を上から順番に確認してください。

### 基本確認

```bash
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev

# 1. EC2 が起動しているか
aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=fortune-compass" "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].{ID:InstanceId,IP:PublicIpAddress,State:State.Name}' \
  --output table
```

```bash
# 2. k3s が正常か（SSH 接続して確認）
EC2_IP=$(terraform output -raw ec2_public_ip)
ssh -i ~/.ssh/fortune-compass-k3s.pem ubuntu@$EC2_IP "sudo k3s kubectl get nodes"
```

```bash
# 3. Pod が動いているか
ssh -i ~/.ssh/fortune-compass-k3s.pem ubuntu@$EC2_IP "sudo k3s kubectl get pods -n fortune-compass"
```

### アプリ確認

```bash
APP_URL=$(terraform output -raw app_url)

# 4. ヘルスチェック API
curl -s $APP_URL/api/health
# 期待値: {"status":"ok","timestamp":"..."}

# 5. メインアプリ
curl -s -o /dev/null -w "%{http_code}" $APP_URL
# 期待値: 200

# 6. 管理コンソール
curl -s -o /dev/null -w "%{http_code}" $APP_URL/admin
# 期待値: 200
```

### セキュリティサービス確認

```bash
# 7. GuardDuty
aws guardduty list-detectors --region ap-northeast-1 --query 'DetectorIds[0]' --output text
# 期待値: 何らかの ID が表示される

# 8. Security Hub
aws securityhub describe-hub --region ap-northeast-1 --query 'HubArn' --output text
# 期待値: arn:aws:securityhub:... が表示される
```

### Bedrock Agent 確認

```bash
# 9. Bedrock Agent
terraform output bedrock_agent_invoke_command
# 表示されたコマンドをコピーして実行すると、占い結果が返ってくる
```

### チェックリスト表

| # | 確認項目 | 期待する結果 | OK? |
|---|---------|-------------|-----|
| 1 | EC2 インスタンス | `running` 状態 | |
| 2 | k3s ノード | `Ready` 状態 | |
| 3 | Pod（backend / frontend） | 両方 `Running` | |
| 4 | `/api/health` | `{"status":"ok"}` | |
| 5 | メインアプリ `/` | HTTP 200 | |
| 6 | 管理コンソール `/admin` | HTTP 200 | |
| 7 | GuardDuty | Detector ID 表示 | |
| 8 | Security Hub | Hub ARN 表示 | |
| 9 | Bedrock Agent | 占い結果が返る | |
| 10 | GitHub Actions | CI/CD が成功 | |

---

## 10. トラブルシューティング

### 10.1 terraform destroy が途中で失敗する

#### 症状: `BucketNotEmpty` エラー

```
Error: deleting S3 Bucket (fortune-compass-dev-mgmt-console):
  BucketNotEmpty: The bucket you tried to delete is not empty
```

**原因**: S3 バケットの中にファイルが残っている。

**解決方法**:

```bash
# エラーメッセージに表示されたバケット名で中身を削除
aws s3 rm s3://fortune-compass-dev-mgmt-console --recursive

# 他のバケットも念のため確認
aws s3 rm s3://fortune-compass-dev-media-input --recursive
aws s3 rm s3://fortune-compass-dev-media-output --recursive
aws s3 rm s3://fortune-compass-dev-config-logs --recursive

# 再度 destroy を実行
terraform destroy
```

#### 症状: `DependencyViolation` エラー

```
Error: deleting EC2 Security Group: DependencyViolation
```

**原因**: セキュリティグループに依存するリソースがまだ削除中。

**解決方法**:

```bash
# 1-2 分待ってから再度実行
terraform destroy
```

> Terraform は削除順序を自動で管理しますが、AWS 側の削除処理に
> 時間がかかると一時的にエラーが出ることがあります。
> ほとんどの場合、再実行で解決します。

#### 症状: CloudFront の削除に非常に時間がかかる

```
Still destroying... [10m elapsed]
aws_cloudfront_distribution.main: Still destroying...
```

**原因**: CloudFront はグローバルサービスで、世界中のエッジサーバーから
設定を削除する必要があるため、10-15 分かかることがあります。

**解決方法**: 正常な動作です。そのまま待ってください。

---

### 10.2 terraform apply が途中で失敗する

#### 症状: Security Hub が既に存在する

```
Error: creating Security Hub Account: AlreadyEnabledException
```

**原因**: 前回の `terraform destroy` で Security Hub が完全に無効化される前に
`terraform apply` を実行した。

**解決方法**:

```bash
# Security Hub を手動で無効化
aws securityhub disable-security-hub --region ap-northeast-1

# 1 分待ってから再度 apply
terraform apply
```

#### 症状: GuardDuty / Inspector が既に有効

同様のエラーが出た場合:

```bash
# GuardDuty を無効化
DETECTOR_ID=$(aws guardduty list-detectors --region ap-northeast-1 --query 'DetectorIds[0]' --output text)
aws guardduty delete-detector --detector-id $DETECTOR_ID --region ap-northeast-1

# Inspector を無効化
aws inspector2 disable --resource-types EC2 ECR --region ap-northeast-1

# 再度 apply
terraform apply
```

#### 症状: Config Recorder が既に存在する

```
Error: creating Configuration Recorder: MaxNumberOfConfigurationRecordersExceededException
```

**原因**: リージョンに Config Recorder は1つしか作れない。前回の削除が不完全。

**解決方法**:

```bash
# 既存の Config Recorder を削除
aws configservice delete-configuration-recorder \
  --configuration-recorder-name fortune-compass-dev-recorder \
  --region ap-northeast-1

# Delivery channel も削除
aws configservice delete-delivery-channel \
  --delivery-channel-name fortune-compass-dev-delivery \
  --region ap-northeast-1

# 再度 apply
terraform apply
```

---

### 10.3 再作成後にアプリにアクセスできない

#### 症状: `502 Bad Gateway`

**原因 1**: k3s がまだ初期化中。

```bash
# EC2 に SSH して確認
EC2_IP=$(terraform output -raw ec2_public_ip)
ssh -i ~/.ssh/fortune-compass-k3s.pem ubuntu@$EC2_IP

# ※ EC2 に SSH 接続した状態で実行
sudo k3s kubectl get pods -n fortune-compass
```

Pod が `Running` でない場合は、まだ初期化中です。2-3 分待ってください。

**原因 2**: Docker イメージがまだプッシュされていない。

```bash
# ※ EC2 に SSH 接続した状態で実行
sudo k3s kubectl get pods -n fortune-compass

# 出力例（イメージが無い場合）:
# NAME                        READY   STATUS             RESTARTS   AGE
# backend-xxxxx-xxxxx         0/1     ImagePullBackOff   0          5m
```

`ImagePullBackOff` の場合は、[Step 5: Docker イメージをビルド＆プッシュする](#step-5-docker-イメージをビルドプッシュする) に戻ってください。

**原因 3**: CloudFront がまだデプロイ中。

```bash
# EC2 に直接アクセスして確認（CloudFront を通さない）
EC2_IP=$(terraform output -raw ec2_public_ip)
curl -s http://$EC2_IP/api/health
```

EC2 直接で `{"status":"ok"}` が返るなら、CloudFront のデプロイ完了を待つだけです。

#### 症状: GitHub Actions が `SSH connection timed out` で失敗

**原因**: GitHub Secrets の `EC2_HOST` が古い IP のまま。

**解決方法**: [Step 6: GitHub Secrets を更新する](#step-6-github-secrets-を更新する) を実行してください。

---

### 10.4 Docker ビルドが失敗する

#### 症状: `docker: command not found`

**原因**: WSL で Docker が起動していない。

**解決方法**:

```bash
# Docker Desktop が起動しているか確認（Windows の場合）
docker info

# エラーが出る場合は Docker Desktop を起動して再試行
# または WSL 内で:
sudo service docker start
```

#### 症状: ECR ログインエラー

```
Error: Cannot perform an interactive login from a non TTY device
```

**解決方法**:

```bash
# パイプを使った正しいログイン方法
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin \
  813469361929.dkr.ecr.ap-northeast-1.amazonaws.com
```

---

## 11. よくある質問（FAQ）

### Q1. 削除と再作成を何回でも繰り返せますか？

**A. はい、何回でも繰り返せます。**
Terraform は「あるべき状態」を定義しているので、何度 destroy → apply しても
同じ構成が再現されます。ただし、URL や IP などの動的な値は毎回変わります。

---

### Q2. terraform destroy で、ソースコードは消えませんか？

**A. 消えません。**
`terraform destroy` は **AWS 上のリソース**だけを削除します。
ローカルのファイル（ソースコード、Terraform 設定ファイル、Git 履歴）は一切影響を受けません。

---

### Q3. 再作成にどれくらい時間がかかりますか？

**A. 全体で約 30-40 分です。**

| 作業 | 所要時間 |
|------|---------|
| `terraform apply` | ~10-15 分 |
| k3s 起動待ち | ~2-3 分 |
| Docker イメージのビルド＆プッシュ | ~5-10 分 |
| GitHub Secrets 更新 | ~1 分 |
| デプロイ＆ CloudFront 反映 | ~5-10 分 |
| **合計** | **~30-40 分** |

---

### Q4. Terraform のステート用 S3 / DynamoDB も削除していいですか？

**A. 削除しないでください。**
これらは Terraform が「何を作ったか」を記録している場所です。
削除すると、次回の `terraform apply` で Terraform が過去の状態を認識できなくなり、
リソースの二重作成や管理不能な状態になる可能性があります。

ただし、料金はほぼ $0 です（S3: 数 KB、DynamoDB: オンデマンド）。

---

### Q5. OIDC プロバイダーと IAM ロールも削除していいですか？

**A. 削除しないでください。**
`fortune-compass-github-actions` IAM ロールと OIDC プロバイダーは
手動で作成したもので、Terraform 管理外です。
GitHub Actions の CI/CD に必要なため、残しておいてください。

---

### Q6. 管理コンソールの API キーは再作成後に変わりますか？

**A. はい、変わります。**
ただし、管理コンソールの HTML は Terraform が自動で生成・アップロードするため、
新しい API キーが自動的に埋め込まれます。手動で更新する必要はありません。

```bash
# 新しい API キーを確認したい場合
terraform output -raw management_api_key
```

---

### Q7. Bedrock Agent の会話履歴は引き継がれますか？

**A. 引き継がれません。**
Bedrock Agent は新規作成されるため、以前の会話履歴は消えます。
ただし、Agent の設定（instruction、OpenAPI schema、対応占い）は
Terraform の設定ファイルから自動で再現されます。

---

### Q8. セキュリティサービスの Findings（検出結果）はどうなりますか？

**A. 消えます。**
Security Hub、GuardDuty、Inspector、Config の検出結果は
サービスごと削除されるため、過去の Findings は消えます。
再作成後に改めてスキャンが開始されます。

---

### Q9. 削除せずに、もっとコストを下げる方法はありますか？

**A. いくつかあります。**

| 方法 | 削減額 | やり方 |
|------|-------|-------|
| EC2 を停止する | -$9/月 | 管理コンソールから「停止」ボタン |
| セキュリティ系を無効化 | -$5-10/月 | `enable_*` を `false` にして `terraform apply` |
| EIP を手動で解放 | -$3.6/月 | AWS コンソールから解放（ただし IP が変わる） |

**一番手軽なのは管理コンソールでの EC2 停止**ですが、月 $12-17 は残ります。
長期間使わない場合は、`terraform destroy` が最もコスト効率が良いです。

---

> **おつかれさまでした！**
> このガイドに沿って操作すれば、いつでも環境を安全に削除・再作成できます。
> 初めての操作で不安な場合は、各ステップの「期待する出力」を確認しながら
> 一つずつ進めてください。
