# Kubernetes / k3s 学習ガイド & 障害テスト手順書

> Fortune Compass プロジェクトの Kubernetes 環境を使って、Kubernetes の基礎から障害テストまでを体験するためのガイドです。
> プログラミングや Kubernetes を触ったことがない人でも理解できるように、身近な例えを使って説明します。

---

## 目次

0. [前提条件（はじめに確認すること）](#前提条件はじめに確認すること)
1. [Part 1: Kubernetes とは何か（基礎知識）](#part-1-kubernetes-とは何か基礎知識)
2. [Part 2: Fortune Compass の構成を確認しよう](#part-2-fortune-compass-の構成を確認しよう)
3. [Part 3: Kubernetes の機能を体験しよう](#part-3-kubernetes-の機能を体験しよう)
4. [Part 4: 障害テスト（わざとエラーを起こしてみよう）](#part-4-障害テストわざとエラーを起こしてみよう)
5. [Part 5: トラブルシューティングガイド](#part-5-トラブルシューティングガイド)
6. [Part 6: 用語集](#part-6-用語集)

---

## 前提条件（はじめに確認すること）

このガイドを進めるために、以下のツールがインストールされている必要があります。
ターミナル（コマンドプロンプト）を開いて、それぞれのコマンドを実行してバージョンが表示されれば OK です。

### 必要なツール一覧

| ツール | 確認コマンド | 用途 |
|--------|-------------|------|
| **AWS CLI** | `aws --version` | EC2 接続、ECR イメージ確認 |
| **Terraform** | `terraform --version` | SSH 秘密鍵の取得、EC2 の IP 確認 |
| **SSH** | `ssh -V` | EC2 サーバーへの接続 |

> **kubectl は不要です**: k3s には kubectl が内蔵されているため、EC2 に SSH 接続した後は
> `sudo k3s kubectl ...` で Kubernetes の操作ができます。ローカルに kubectl をインストールする必要はありません。

### インストールされていない場合

```bash
# AWS CLI
# https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html
# インストール後に設定：
aws configure
# → AWS Access Key ID、Secret Access Key、Region（ap-northeast-1）を入力

# Terraform
# https://developer.hashicorp.com/terraform/install

# SSH（通常はプリインストール済み）
```

### AWS CLI の設定確認

```bash
# 現在の設定を確認（アカウント情報が表示されれば OK）
aws sts get-caller-identity

# 出力例:
# {
#     "UserId": "AIDA...",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/your-name"
# }
```

> **エラーが出たら**: `aws configure` を実行して、アクセスキーとリージョン（`ap-northeast-1`）を設定してください。

---

## Part 1: Kubernetes とは何か（基礎知識）

### 1.1 Kubernetes を中学生に説明する

**Kubernetes（クバネティス）** は、「アプリケーションを自動で管理してくれるシステム」です。

身近な例えで考えてみましょう。

```
あなたは大きなマンションの管理会社だとします。

マンションには何十もの部屋があり、それぞれの部屋で
いろんなお店（アプリ）が営業しています。

管理会社であるあなたの仕事は：
  - お店が営業しているか定期的にチェックする（ヘルスチェック）
  - お店が閉まったら自動で新しいお店を入れる（自動復旧）
  - お客さんが増えたら部屋を増やす（スケーリング）
  - お店の入れ替えをお客さんに気づかれないようにする（ローリングアップデート）

Kubernetes は、この「管理会社」の仕事を全部自動でやってくれるんです！
```

手動で管理する場合と比べてみましょう。

```
【手動管理の場合】

  深夜2時にアプリが止まる
       ↓
  誰かが気づくまで待つ（数時間かも...）
       ↓
  担当者に電話する
       ↓
  担当者がPCを開いてサーバーにログイン
       ↓
  原因を調べて再起動
       ↓
  やっと復旧（数時間ダウン）

【Kubernetes の場合】

  深夜2時にアプリが止まる
       ↓
  Kubernetes が即座に検知（ヘルスチェック）
       ↓
  自動で新しいアプリを起動（数秒〜数十秒）
       ↓
  復旧完了！（人間は寝たまま）
```

### 1.2 k3s とは（軽量版 Kubernetes）

**k3s（ケースリー）** は、Kubernetes の「軽量版」です。

```
【普通の Kubernetes】
  - サーバーが最低3台必要
  - インストールが大変
  - メモリを 2GB 以上使う
  - 大企業向け

【k3s】
  - サーバー1台でOK          ← Fortune Compass はこれ！
  - 1つのコマンドでインストール完了
  - メモリ 512MB で動く
  - 個人開発や小規模プロジェクト向け
```

Fortune Compass では、1台の EC2 インスタンス（t3.small: CPU 2コア、メモリ 2GB）で k3s を動かしています。小規模なプロジェクトには十分な性能です。

k3s には **Traefik** というロードバランサーも最初から入っているので、追加の設定なしでウェブサイトを公開できます。

### 1.3 Kubernetes の重要な用語を「マンション」で理解する

Fortune Compass で使っている Kubernetes の構成要素を、マンションに例えて説明します。

```
┌─────────────────────────────────────────────────────────┐
│  マンション全体 = Kubernetes クラスター（k3s）            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  3階: fortune-compass フロア = Namespace           │  │
│  │                                                   │  │
│  │  ┌──────────────┐        ┌──────────────┐         │  │
│  │  │  301号室      │        │  302号室      │         │  │
│  │  │  (Pod)       │        │  (Pod)       │         │  │
│  │  │              │        │              │         │  │
│  │  │  バックエンド  │        │  フロントエンド │         │  │
│  │  │  Express     │        │  Next.js     │         │  │
│  │  │  :8080       │        │  :3000       │         │  │
│  │  └──────┬───────┘        └──────┬───────┘         │  │
│  │         │                       │                 │  │
│  │  ┌──────▼───────┐        ┌──────▼───────┐         │  │
│  │  │  受付A       │        │  受付B       │         │  │
│  │  │ (Service)    │        │ (Service)    │         │  │
│  │  │ backend:8080 │        │ frontend:3000│         │  │
│  │  └──────┬───────┘        └──────┬───────┘         │  │
│  │         │                       │                 │  │
│  │  ┌──────▼───────────────────────▼───────┐         │  │
│  │  │  正面玄関 (Ingress - Traefik)         │         │  │
│  │  │                                      │         │  │
│  │  │   /api/* のお客さん → 受付A → 301号室  │         │  │
│  │  │   /*     のお客さん → 受付B → 302号室  │         │  │
│  │  └──────────────────────────────────────┘         │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  2階: kube-system フロア = Namespace               │  │
│  │  （Kubernetes の管理用。普段は触らない）              │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  1階: default フロア = Namespace                   │  │
│  │  （何も指定しないとここに入る。今は空）               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

それぞれの用語を詳しく見ていきましょう。

#### Pod（ポッド）= マンションの部屋

Pod は、アプリケーションが動いている「部屋」です。

```
┌─────────── Pod ───────────┐
│                            │
│  ┌──────────────────────┐  │
│  │  コンテナ              │  │
│  │  （アプリ本体）         │  │
│  │                      │  │
│  │  例: Express サーバー  │  │
│  │  ポート: 8080         │  │
│  └──────────────────────┘  │
│                            │
│  IPアドレス: 10.42.0.15    │
│  （部屋には住所がある）      │
└────────────────────────────┘
```

- 1つの Pod には通常1つのアプリ（コンテナ）が入っている
- Pod には固有の IP アドレスがある（ただし、Pod が再起動すると IP は変わる）
- Pod は壊れたら捨てて新しく作る「使い捨て」の存在

#### Deployment（デプロイメント）= フロアマネージャー

Deployment は、「Pod を管理するマネージャー」です。

```
┌───────── Deployment ─────────┐
│                               │
│  名前: backend                │
│  指示: 「Pod を 1個 維持せよ」  │
│                               │
│  常にチェック:                  │
│  「今 Pod は何個ある？」        │
│  「1個？ OK！」                │
│  「0個？ 大変！すぐ作る！」     │
│  「2個？ 多い！1個減らす！」    │
│                               │
│  管理対象:                     │
│  ┌─────────┐                  │
│  │  Pod    │                  │
│  │ backend │                  │
│  └─────────┘                  │
└───────────────────────────────┘
```

- Deployment は「Pod が何個あるべきか（replicas）」を知っている
- Pod が消えたら自動で新しい Pod を作ってくれる（これが Kubernetes の最大の特長！）
- アプリの更新（アップデート）も Deployment が担当する

#### Service（サービス）= 受付デスク

Service は、Pod への「受付デスク」です。

```
Pod の IP アドレスは変わるという問題:

  Pod A (10.42.0.15) が壊れた！
       ↓
  新しい Pod B (10.42.0.23) が作られた
       ↓
  IP が変わってしまった...
  他のアプリは Pod A の IP を知っているのに...

Service が解決:

  ┌────────── Service ──────────┐
  │  名前: backend               │
  │  固定アドレス: backend:8080   │ ← この名前は変わらない！
  │                              │
  │  「backend に来たリクエストは  │
  │   今動いている Pod に         │
  │   転送するよ！」              │
  └──────────────────────────────┘
```

- Service は固定の名前とアドレスを持つ
- Pod が再起動して IP が変わっても、Service の名前は変わらない
- 他のアプリは Service の名前を使ってアクセスする

Fortune Compass には2つの Service がある:
| Service名 | 転送先 | ポート |
|-----------|--------|-------|
| backend | backend Pod | 8080 |
| frontend | frontend Pod | 3000 |

#### Ingress（イングレス）= マンションの正面玄関

Ingress は、外部（インターネット）からのアクセスを正しい Service に振り分ける「正面玄関」です。

```
インターネットからのリクエスト
         │
         ▼
┌─────── Ingress (Traefik) ────────┐
│                                   │
│  ルール:                           │
│  ┌─────────────────────────────┐  │
│  │  /api/* → backend Service   │  │
│  │  /*     → frontend Service  │  │
│  └─────────────────────────────┘  │
│                                   │
│  例:                               │
│  /api/health   → backend:8080     │
│  /api/fortune  → backend:8080     │
│  /             → frontend:3000    │
│  /fortune/zodiac → frontend:3000  │
│                                   │
└───────────────────────────────────┘
```

- Ingress がないと、外部からアプリにアクセスできない
- URL のパス（`/api` や `/`）を見て、どの Service に転送するか決める
- Fortune Compass では、k3s に最初から入っている **Traefik** が Ingress Controller として動いている

#### Namespace（ネームスペース）= マンションのフロア

Namespace は、Kubernetes の中を区切る「フロア」です。

```
┌─────────── Kubernetes クラスター ───────────┐
│                                              │
│  fortune-compass フロア（Namespace）          │
│  → 私たちのアプリが動いている                   │
│                                              │
│  kube-system フロア（Namespace）              │
│  → Kubernetes 自体の管理ツールが動いている      │
│                                              │
│  default フロア（Namespace）                  │
│  → 何も指定しないとここに入る（今は空）          │
│                                              │
└──────────────────────────────────────────────┘
```

- Namespace でアプリをグループ分けできる
- 違う Namespace のアプリは互いに干渉しにくい
- Fortune Compass のアプリはすべて `fortune-compass` Namespace に入っている

### 1.4 全体の流れをまとめると

ユーザーが Fortune Compass にアクセスするとき、裏側ではこんなことが起きています。

```
ユーザーのブラウザ
    │
    │ https://d71oywvumn06c.cloudfront.net/
    ▼
CloudFront (CDN)
    │
    │ HTTP でオリジン（EC2）にリクエストを転送
    ▼
EC2 (t3.small, Ubuntu 24.04)
    │
    │ ポート 80 で受信
    ▼
Traefik Ingress Controller
    │
    ├── /api/* のリクエスト
    │        ↓
    │   backend Service (ClusterIP:8080)
    │        ↓
    │   backend Pod (Express, ポート 8080)
    │        ↓
    │   占い結果の JSON を返す
    │
    └── /* のリクエスト
             ↓
        frontend Service (ClusterIP:3000)
             ↓
        frontend Pod (Next.js, ポート 3000)
             ↓
        HTML/CSS/JS のページを返す
```

---

## Part 2: Fortune Compass の構成を確認しよう

### 2.1 EC2 への SSH 接続方法

まず、Kubernetes が動いている EC2 サーバーに接続しましょう。

#### 方法1: SSH キーを使って接続

**事前準備**: SSH 鍵は Terraform で自動生成されています。まだ取得していない場合は、ローカル PC で以下を実行してください。

```bash
# SSH 鍵をまだ取得していない場合
cd /home/dangi/work/my-project/fortune-compass/infra/terraform/environments/dev
terraform output -raw k3s_ssh_private_key > ~/.ssh/fortune-compass-k3s.pem
chmod 600 ~/.ssh/fortune-compass-k3s.pem
```

鍵を取得したら、以下のコマンドで EC2 に接続します。

```bash
ssh -i ~/.ssh/fortune-compass-k3s.pem ubuntu@13.192.182.54
```

> **IP アドレスの確認方法**: `terraform output ec2_public_ip` で確認できます（Terraform ディレクトリで実行）。
> EC2 の IP は Elastic IP（EIP）なので、EC2 を停止・起動しても変わりません。

```
出力例:
Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-1234-aws x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

Last login: Mon Feb 16 10:30:00 2026 from xxx.xxx.xxx.xxx
ubuntu@ip-10-0-0-xxx:~$
```

#### 方法2: AWS SSM Session Manager を使って接続

SSH キーがなくても、AWS コンソールから接続できます。

```bash
# AWS CLI がインストールされている場合

# まずインスタンス ID を確認
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=fortune-compass-dev-k3s" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text

# 上で確認したインスタンス ID を使って接続（例: i-0abc1234def56789a）
aws ssm start-session --target i-0abc1234def56789a --region ap-northeast-1
```

```
出力例:
Starting session with SessionId: user-0abc1def2ghi3jklm
sh-5.2$
```

> **ポイント**: SSM Session Manager は AWS コンソールの「EC2 > インスタンス > 接続」からも使えます。

### 2.2 重要な注意点

k3s では、通常の `kubectl` コマンドの代わりに `sudo k3s kubectl` を使います。

```
通常の Kubernetes:  kubectl get pods
k3s の場合:        sudo k3s kubectl get pods
                   ^^^^^^^^^^^^
                   ここが違う！
```

`sudo` が必要な理由は、k3s の設定ファイルが root 権限でしか読めないためです。

### 2.3 基本コマンド集

EC2 に接続できたら、以下のコマンドを順番に試してみましょう。

#### (1) ノード（サーバー）の確認

ノードとは、Kubernetes が動いているサーバーのことです。Fortune Compass では EC2 1台 = ノード1台です。

```bash
sudo k3s kubectl get nodes
```

```
出力例:
NAME              STATUS   ROLES                  AGE   VERSION
ip-10-0-0-123    Ready    control-plane,master   30d   v1.31.4+k3s1
```

| 列 | 意味 |
|----|------|
| NAME | サーバーの名前（EC2 の内部 IP から自動生成） |
| STATUS | `Ready` = 正常に動いている |
| ROLES | `control-plane,master` = このサーバーが全体を管理している |
| AGE | 起動してからの経過時間 |
| VERSION | k3s のバージョン |

#### (2) Namespace の確認

今あるフロア（Namespace）の一覧を見てみましょう。

```bash
sudo k3s kubectl get namespaces
```

```
出力例:
NAME              STATUS   AGE
default           Active   30d
kube-system       Active   30d
kube-public       Active   30d
kube-node-lease   Active   30d
fortune-compass   Active   30d
```

`fortune-compass` が私たちのアプリ用の Namespace です。

#### (3) すべてのリソースを一覧表示

Fortune Compass の Namespace にある全リソースをまとめて見てみましょう。

```bash
sudo k3s kubectl get all -n fortune-compass
```

```
出力例:
NAME                            READY   STATUS    RESTARTS   AGE
pod/backend-5d8f9b7c4a-x2k9j   1/1     Running   0          2d
pod/frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d

NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
service/backend    ClusterIP   10.43.45.123    <none>        8080/TCP   30d
service/frontend   ClusterIP   10.43.67.234    <none>        3000/TCP   30d

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/backend    1/1     1            1           30d
deployment.apps/frontend   1/1     1            1           30d

NAME                                  DESIRED   CURRENT   READY   AGE
replicaset.apps/backend-5d8f9b7c4a    1         1         1       2d
replicaset.apps/frontend-7b6c4d8e5f   1         1         1       2d
```

これを図で表すとこうなります。

```
fortune-compass Namespace
├── Pod
│   ├── backend-5d8f9b7c4a-x2k9j   (Running)
│   └── frontend-7b6c4d8e5f-m3n7p  (Running)
├── Service
│   ├── backend    (ClusterIP, ポート 8080)
│   └── frontend   (ClusterIP, ポート 3000)
├── Deployment
│   ├── backend    (1/1 Ready)
│   └── frontend   (1/1 Ready)
└── ReplicaSet
    ├── backend-5d8f9b7c4a    (1個管理中)
    └── frontend-7b6c4d8e5f   (1個管理中)
```

#### (4) Pod の詳細を確認

Pod（動いているアプリ）の一覧を見てみましょう。

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Running   0          2d
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

| 列 | 意味 |
|----|------|
| NAME | Pod の名前（Deployment名 + ランダム文字列） |
| READY | `1/1` = コンテナ1個中1個が準備完了 |
| STATUS | `Running` = 正常に動いている |
| RESTARTS | 再起動した回数（0 = 一度も再起動していない） |
| AGE | Pod が作られてからの経過時間 |

#### (5) Deployment の確認

Deployment（マネージャー）の状態を見てみましょう。

```bash
sudo k3s kubectl get deployments -n fortune-compass
```

```
出力例:
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
backend    1/1     1            1           30d
frontend   1/1     1            1           30d
```

| 列 | 意味 |
|----|------|
| READY | `1/1` = 目標1個に対して1個が Ready |
| UP-TO-DATE | 最新の設定で動いている Pod の数 |
| AVAILABLE | 利用可能な Pod の数 |

#### (6) Service の確認

Service（受付デスク）の状態を見てみましょう。

```bash
sudo k3s kubectl get services -n fortune-compass
```

```
出力例:
NAME       TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
backend    ClusterIP   10.43.45.123   <none>        8080/TCP   30d
frontend   ClusterIP   10.43.67.234   <none>        3000/TCP   30d
```

| 列 | 意味 |
|----|------|
| TYPE | `ClusterIP` = クラスター内部からのみアクセス可能 |
| CLUSTER-IP | クラスター内での固定 IP アドレス |
| EXTERNAL-IP | `<none>` = 外部からは直接アクセスできない（Ingress 経由でアクセス） |
| PORT(S) | 待ち受けているポート番号 |

#### (7) Ingress の確認

Ingress（正面玄関）の設定を見てみましょう。

```bash
sudo k3s kubectl get ingress -n fortune-compass
```

```
出力例:
NAME              CLASS     HOSTS   ADDRESS        PORTS   AGE
fortune-compass   traefik   *       10.0.0.123     80      30d
```

| 列 | 意味 |
|----|------|
| CLASS | `traefik` = Traefik Ingress Controller を使用 |
| HOSTS | `*` = すべてのホスト名を受け付ける |
| ADDRESS | Ingress のアドレス |
| PORTS | `80` = HTTP ポートでリッスン |

#### (8) Pod の詳細情報を確認

特定の Pod について、もっと詳しく見てみましょう。

```bash
# まず Pod 名を確認（Pod 名は毎回変わるため、必ず最新を取得）
sudo k3s kubectl get pods -n fortune-compass
# 出力例の NAME 列（例: backend-5d8f9b7c4a-x2k9j）を使用

# Pod の詳細を表示（Pod 名は上で確認した実際の名前に置き換える）
sudo k3s kubectl describe pod backend-xxxxx-xxxxx -n fortune-compass
#                              ^^^^^^^^^^^^^^^^^^^^
#                              上で確認した実際の Pod 名に置き換え
```

```
出力例（一部抜粋）:
Name:             backend-5d8f9b7c4a-x2k9j
Namespace:        fortune-compass
Status:           Running
IP:               10.42.0.15
Node:             ip-10-0-0-123/10.0.0.123
Containers:
  backend:
    Image:          123456789012.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:abc123
    Port:           8080/TCP
    State:          Running
      Started:      Sat, 15 Feb 2026 10:00:00 +0000
    Ready:          True
    Restart Count:  0
    Limits:
      cpu:     256m
      memory:  512Mi
    Requests:
      cpu:     128m
      memory:  256Mi
    Liveness:   http-get http://:8080/api/health delay=10s timeout=1s period=30s #success=1 #failure=3
    Readiness:  http-get http://:8080/api/health delay=5s timeout=1s period=10s #success=1 #failure=3
    Environment:
      NODE_ENV:     production
      PORT:         8080
      CORS_ORIGIN:  *
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  2d    default-scheduler  Successfully assigned fortune-compass/backend-... to ip-10-0-0-123
  Normal  Pulled     2d    kubelet            Container image "..." already present on machine
  Normal  Created    2d    kubelet            Created container backend
  Normal  Started    2d    kubelet            Started container backend
```

> **読み方のコツ**: `describe` コマンドの出力は長いですが、特に重要なのは以下の部分です。
> - **State**: `Running` なら正常
> - **Ready**: `True` なら準備完了
> - **Restart Count**: 再起動回数。0 以外なら何かあった証拠
> - **Liveness / Readiness**: ヘルスチェックの設定
> - **Events**: 最近起きたイベント。エラーがあればここに表示される

#### (9) Pod のログを確認

アプリが出力しているログ（記録）を見てみましょう。

```bash
# Pod のログを表示（Pod 名は get pods で確認した実際の名前に置き換える）
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass
#                      ^^^^^^^^^^^^^^^^^^^^
#                      上で確認した実際の Pod 名に置き換え
```

```
出力例:
Server is running on port 8080
Environment: production
Health check endpoint: /api/health
```

#### (10) リソース使用量の確認

各 Pod が CPU やメモリをどれくらい使っているか確認できます。

```bash
sudo k3s kubectl top pods -n fortune-compass
```

```
出力例:
NAME                        CPU(cores)   MEMORY(bytes)
backend-5d8f9b7c4a-x2k9j   3m           85Mi
frontend-7b6c4d8e5f-m3n7p  5m           120Mi
```

| 列 | 意味 |
|----|------|
| CPU(cores) | `3m` = 0.003 CPU コア使用中（上限: 256m = 0.256 コア） |
| MEMORY(bytes) | `85Mi` = 約 85MB のメモリ使用中（上限: 512Mi = 512MB） |

> **注意**: metrics-server がインストールされていない場合、このコマンドはエラーになります。
> エラーが出た場合は、この手順はスキップしてください。

#### (11) イベントの確認

Kubernetes で最近起きたイベント（出来事）を時系列で見てみましょう。

```bash
sudo k3s kubectl get events -n fortune-compass --sort-by=.metadata.creationTimestamp
```

```
出力例:
LAST SEEN   TYPE     REASON      OBJECT                           MESSAGE
2d          Normal   Scheduled   pod/backend-5d8f9b7c4a-x2k9j    Successfully assigned fortune-compass/backend-... to ip-10-0-0-123
2d          Normal   Pulled      pod/backend-5d8f9b7c4a-x2k9j    Container image "..." already present on machine
2d          Normal   Created     pod/backend-5d8f9b7c4a-x2k9j    Created container backend
2d          Normal   Started     pod/backend-5d8f9b7c4a-x2k9j    Started container backend
2d          Normal   Scheduled   pod/frontend-7b6c4d8e5f-m3n7p   Successfully assigned fortune-compass/frontend-... to ip-10-0-0-123
2d          Normal   Pulled      pod/frontend-7b6c4d8e5f-m3n7p   Container image "..." already present on machine
2d          Normal   Created     pod/frontend-7b6c4d8e5f-m3n7p   Created container frontend
2d          Normal   Started     pod/frontend-7b6c4d8e5f-m3n7p   Started container frontend
```

| 列 | 意味 |
|----|------|
| TYPE | `Normal` = 正常、`Warning` = 警告 |
| REASON | 何が起きたか（Scheduled, Pulled, Created, Started など） |
| MESSAGE | 詳細なメッセージ |

---

## Part 3: Kubernetes の機能を体験しよう

### 3.1 ヘルスチェックの確認

**ヘルスチェック**とは、アプリが正常に動いているかを定期的に確認する仕組みです。

Fortune Compass では、Kubernetes が各 Pod に対して定期的に HTTP リクエストを送り、応答があるかチェックしています。

```
Kubernetes のヘルスチェック:

  ┌──────────┐    GET /api/health    ┌──────────┐
  │Kubernetes│  ─────────────────→  │ backend  │
  │          │  ←─────────────────  │  Pod     │
  │          │    200 OK             │          │
  └──────────┘                       └──────────┘
     10秒ごと                         「元気だよ！」

  もし応答がなかったら...
  ┌──────────┐    GET /api/health    ┌──────────┐
  │Kubernetes│  ─────────────────→  │ backend  │
  │          │        ×              │  Pod     │
  │          │    タイムアウト！       │ (異常)   │
  └──────────┘                       └──────────┘
     → 3回連続で失敗したら Pod を再起動する
```

Fortune Compass のヘルスチェック設定:

| 項目 | backend | frontend |
|------|---------|----------|
| チェック先 | /api/health:8080 | /health:3000 |
| 開始までの待ち時間 (readiness) | 5秒 | 5秒 |
| チェック間隔 (readiness) | 10秒 | 10秒 |
| 開始までの待ち時間 (liveness) | 10秒 | 10秒 |
| チェック間隔 (liveness) | 30秒 | 30秒 |

2種類のヘルスチェックの違い:

| 種類 | 役割 | 失敗したらどうなる？ |
|------|------|---------------------|
| **readinessProbe** | 「このPodにリクエストを送ってもいい？」 | リクエストが来なくなる（Pod は消えない） |
| **livenessProbe** | 「このPodは生きてる？」 | Pod のコンテナが再起動される |

#### EC2 内部からヘルスチェックしてみよう

EC2 にSSH接続した状態で、実際にヘルスチェックのエンドポイントにアクセスしてみましょう。

```bash
# ※ EC2 に SSH 接続した状態で実行
# バックエンドのヘルスチェック
curl localhost/api/health
```

```
出力例:
{"status":"ok","timestamp":"2026-02-17T10:00:00.000Z"}
```

```bash
# ※ EC2 に SSH 接続した状態で実行
# フロントエンドのヘルスチェック
curl localhost/health
```

```
出力例（Next.js のヘルスチェックレスポンス）:
OK
```

#### Pod のヘルスチェック状態を確認

```bash
# Pod 名を確認
sudo k3s kubectl get pods -n fortune-compass

# describe で Liveness / Readiness の状態を確認（Pod 名は上で確認した実際の名前に置き換え）
sudo k3s kubectl describe pod backend-xxxxx-xxxxx -n fortune-compass | grep -A 3 "Liveness\|Readiness"
```

```
出力例:
    Liveness:   http-get http://:8080/api/health delay=10s timeout=1s period=30s #success=1 #failure=3
    Readiness:  http-get http://:8080/api/health delay=5s timeout=1s period=10s #success=1 #failure=3
```

この出力の意味:

```
Liveness:  http-get http://:8080/api/health
  delay=10s    → Pod 起動後 10秒待ってからチェック開始
  timeout=1s   → 1秒以内に応答がなければ失敗とみなす
  period=30s   → 30秒ごとにチェック
  #success=1   → 1回成功したら「正常」と判定
  #failure=3   → 3回連続で失敗したら「異常」と判定 → コンテナ再起動
```

### 3.2 スケーリング（Pod の数を増減させる）

**スケーリング**とは、Pod の数を増やしたり減らしたりすることです。

```
スケーリング前（replicas=1）:

  ┌──────────┐
  │ backend  │
  │  Pod 1   │
  └──────────┘

スケーリング後（replicas=2）:

  ┌──────────┐  ┌──────────┐
  │ backend  │  │ backend  │
  │  Pod 1   │  │  Pod 2   │  ← 新しく作られた！
  └──────────┘  └──────────┘

  Service がリクエストを2つの Pod に分散する（ロードバランシング）
```

#### やってみよう: backend の Pod を2個に増やす

```bash
# 現在の状態を確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Running   0          2d
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

```bash
# backend を2個にスケールアップ
sudo k3s kubectl scale deployment backend --replicas=2 -n fortune-compass
```

```
出力例:
deployment.apps/backend scaled
```

```bash
# Pod が増える様子をリアルタイムで観察（Ctrl+C で停止）
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Running   0          2d
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
backend-5d8f9b7c4a-h7t4w   0/1     Pending   0          0s
backend-5d8f9b7c4a-h7t4w   0/1     ContainerCreating   0          1s
backend-5d8f9b7c4a-h7t4w   0/1     Running             0          3s
backend-5d8f9b7c4a-h7t4w   1/1     Running             0          8s
```

Pod の状態が次のように変化します。

```
Pending → ContainerCreating → Running (0/1) → Running (1/1)

Pending:            「どのサーバーで動かすか決めている...」
ContainerCreating:  「コンテナ（Docker イメージ）を準備中...」
Running (0/1):      「起動したけど、まだヘルスチェックに合格していない」
Running (1/1):      「ヘルスチェック合格！リクエストを受け付けられる状態」
```

```bash
# 状態を確認（Pod が2つになっているはず）
sudo k3s kubectl get deployments -n fortune-compass
```

```
出力例:
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
backend    2/2     2            2           30d
frontend   1/1     1            1           30d
```

`2/2` に変わりました。Pod が2個になっています。

```bash
# 元に戻す（1個にスケールダウン）
sudo k3s kubectl scale deployment backend --replicas=1 -n fortune-compass
```

```
出力例:
deployment.apps/backend scaled
```

```bash
# 確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS        RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Running       0          2d
backend-5d8f9b7c4a-h7t4w   1/1     Terminating   0          2m
frontend-7b6c4d8e5f-m3n7p  1/1     Running       0          2d
```

`Terminating`（終了中）の Pod がしばらくすると消えて、1個に戻ります。

### 3.3 ローリングアップデート（無停止更新）

**ローリングアップデート**とは、アプリを更新するとき、古い Pod と新しい Pod を少しずつ入れ替えることで、サービスを止めずに更新する仕組みです。

```
ローリングアップデートの流れ:

Step 1: 旧バージョンが動いている
  ┌──────────┐
  │ v1 (旧)  │  ← リクエストを処理中
  └──────────┘

Step 2: 新バージョンの Pod を作成
  ┌──────────┐  ┌──────────┐
  │ v1 (旧)  │  │ v2 (新)  │  ← 起動中...ヘルスチェック待ち
  └──────────┘  └──────────┘

Step 3: 新バージョンが準備完了
  ┌──────────┐  ┌──────────┐
  │ v1 (旧)  │  │ v2 (新)  │  ← ヘルスチェック OK！
  └──────────┘  └──────────┘

Step 4: 旧バージョンを終了
                ┌──────────┐
                │ v2 (新)  │  ← リクエストを処理中
                └──────────┘

  サービスは一度も止まっていない！
```

Fortune Compass では、GitHub に `master` ブランチへ push すると、GitHub Actions が自動で以下を実行します。

```
git push origin master
    ↓
GitHub Actions が起動
    ↓
テスト実行（75テスト）
    ↓
Docker イメージをビルド
    ↓
ECR（イメージ保管庫）にプッシュ
    ↓
SSH で EC2 に接続
    ↓
sudo k3s kubectl set image deployment/backend backend=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:新しいタグ
sudo k3s kubectl set image deployment/frontend frontend=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:新しいタグ
    ↓
Kubernetes がローリングアップデートを実行
    ↓
sudo k3s kubectl rollout status で完了を確認
```

#### ローリングアップデートの履歴を確認

```bash
sudo k3s kubectl rollout history deployment/backend -n fortune-compass
```

```
出力例:
deployment.apps/backend
REVISION  CHANGE-CAUSE
1         <none>
2         <none>
3         <none>
```

各リビジョン（バージョン）は、CI/CD で新しいイメージがデプロイされるたびに増えます。

```bash
# 現在のデプロイ状態を確認
sudo k3s kubectl rollout status deployment/backend -n fortune-compass
```

```
出力例:
deployment "backend" successfully rolled out
```

この表示が出れば、最新のデプロイが正常に完了しています。

---

## Part 4: 障害テスト（わざとエラーを起こしてみよう）

ここからが一番大事なセクションです。わざとエラーを起こして、Kubernetes がどう対処するか体験しましょう。

**注意**: これらのテストは EC2 に SSH 接続した状態で実行します。テスト後は必ず元に戻す手順を実行してください。

---

### テスト1: Pod を手動で削除する（自動復旧を確認）

#### なぜこのテストをするのか

Kubernetes の最大の特長は「自動復旧」です。Pod が消えても、Deployment が自動で新しい Pod を作ってくれることを確認します。

```
テストの概要:

  Deployment「backend の Pod は1個あるべき」
       │
       │ 監視中...
       ▼
  ┌──────────┐
  │ backend  │  ← これを手動で削除する
  │  Pod     │
  └──────────┘
       ↓ 削除！
       ×
       ↓ Deployment が検知
  ┌──────────┐
  │ backend  │  ← 自動で新しい Pod が作られる！
  │  Pod     │
  │  (新)    │
  └──────────┘
```

#### テスト前の状態確認

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Running   0          2d
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

Pod が2つ（backend, frontend）あり、両方とも `Running` であることを確認します。

#### 手順

**Step 1**: Pod の名前を確認してメモする

```bash
sudo k3s kubectl get pods -n fortune-compass
```

出力された backend Pod の名前（例: `backend-5d8f9b7c4a-x2k9j`）をメモしてください。

**Step 2**: backend Pod を削除する

```bash
# Step 1 でメモした実際の Pod 名に置き換えてください
sudo k3s kubectl delete pod backend-xxxxx-xxxxx -n fortune-compass
#                           ^^^^^^^^^^^^^^^^^^^^
#                           Step 1 で確認した実際の Pod 名に置き換え
```

```
出力例:
pod "backend-xxxxx-xxxxx" deleted
```

**Step 3**: Pod の復旧をリアルタイムで観察する

```bash
# -w オプションでリアルタイム監視（Ctrl+C で停止）
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS        RESTARTS   AGE
backend-5d8f9b7c4a-x2k9j   1/1     Terminating   0          2d
frontend-7b6c4d8e5f-m3n7p  1/1     Running       0          2d
backend-5d8f9b7c4a-r9p2q   0/1     Pending       0          0s
backend-5d8f9b7c4a-r9p2q   0/1     ContainerCreating   0          1s
backend-5d8f9b7c4a-r9p2q   0/1     Running             0          3s
backend-5d8f9b7c4a-r9p2q   1/1     Running             0          8s
```

#### 期待される結果

1. 削除された Pod は `Terminating` になる
2. **ほぼ同時に**、新しい Pod が `Pending` → `ContainerCreating` → `Running` と状態変化する
3. 数秒〜十数秒で新しい Pod が `1/1 Running` になる

#### 観察ポイント

- 新しい Pod の名前が変わっている（末尾のランダム文字列が違う）
- Pod は「使い捨て」。同じ Pod が復活するのではなく、新しい Pod が作られる
- 復旧にかかった時間を計ってみよう（通常は10秒以内）

#### 元に戻す方法

このテストでは自動で元に戻るので、特に操作は不要です。新しい Pod が `Running` になれば復旧完了です。

```bash
# 確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-r9p2q   1/1     Running   0          30s
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

#### 学んだこと

```
1. Deployment は常に Pod の数を監視している
2. Pod が消えると、Deployment は即座に新しい Pod を作る
3. Pod は「使い捨て」の存在。同じ Pod が蘇るのではなく、新しい Pod が作られる
4. だから、Pod の中に大事なデータを保存してはいけない
   （Pod が消えたら、データも消えるから）
5. これが Kubernetes の「自己修復」（Self-healing）という機能
```

---

### テスト2: 存在しないイメージを指定する（ImagePullBackOff）

#### なぜこのテストをするのか

CI/CD で間違ったイメージ名を指定してしまった場合にどうなるかを確認します。Kubernetes のローリングアップデート戦略により、旧バージョンが動き続けることも確認します。

```
テストの概要:

  「nginx:nonexistent-tag-12345 というイメージを使え」と指示する
       ↓
  Kubernetes: 「そんなイメージは見つからない...」
       ↓
  新しい Pod が ImagePullBackOff エラーになる
       ↓
  でも旧バージョンの Pod はまだ動いている！（サービスは止まらない）
       ↓
  ロールバック（元に戻す）コマンドで修復
```

#### テスト前の状態確認

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-r9p2q   1/1     Running   0          10m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

正常に動いていることを確認。

#### 手順

**Step 1**: 存在しないイメージを指定する

```bash
sudo k3s kubectl set image deployment/backend backend=nginx:nonexistent-tag-12345 -n fortune-compass
```

```
出力例:
deployment.apps/backend image updated
```

**Step 2**: Pod の状態をリアルタイムで観察する

```bash
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS              RESTARTS   AGE
backend-5d8f9b7c4a-r9p2q   1/1     Running             0          10m
frontend-7b6c4d8e5f-m3n7p  1/1     Running             0          2d
backend-6f7a8b9c0d-k4l5m   0/1     ContainerCreating   0          2s
backend-6f7a8b9c0d-k4l5m   0/1     ErrImagePull        0          5s
backend-6f7a8b9c0d-k4l5m   0/1     ImagePullBackOff    0          20s
```

ここで重要なのは、**旧バージョンの Pod（backend-5d8f9b7c4a-r9p2q）がまだ Running** であることです。

**Step 3**: エラーの詳細を確認する

```bash
# 新しい Pod（エラーが出ている Pod）の名前を使う
sudo k3s kubectl describe pod backend-6f7a8b9c0d-k4l5m -n fortune-compass
```

```
出力例（Events セクション）:
Events:
  Type     Reason     Age   From               Message
  ----     ------     ----  ----               -------
  Normal   Scheduled  30s   default-scheduler  Successfully assigned fortune-compass/backend-6f7a8b9c0d-k4l5m to ip-10-0-0-123
  Normal   Pulling    29s   kubelet            Pulling image "nginx:nonexistent-tag-12345"
  Warning  Failed     25s   kubelet            Failed to pull image "nginx:nonexistent-tag-12345": tag does not exist
  Warning  Failed     25s   kubelet            Error: ErrImagePull
  Normal   BackOff    10s   kubelet            Back-off pulling image "nginx:nonexistent-tag-12345"
  Warning  Failed     10s   kubelet            Error: ImagePullBackOff
```

**Step 4**: ロールバック（元に戻す）

```bash
sudo k3s kubectl rollout undo deployment/backend -n fortune-compass
```

```
出力例:
deployment.apps/backend rolled back
```

**Step 5**: 復旧を確認する

```bash
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS        RESTARTS   AGE
backend-6f7a8b9c0d-k4l5m   0/1     Terminating   0          2m
backend-5d8f9b7c4a-t8u3v   0/1     ContainerCreating   0          2s
frontend-7b6c4d8e5f-m3n7p  1/1     Running             0          2d
backend-5d8f9b7c4a-t8u3v   1/1     Running             0          10s
```

#### 期待される結果

1. 新しい Pod が `ErrImagePull` → `ImagePullBackOff` になる
2. 旧バージョンの Pod は **Running のまま**（サービスは止まらない！）
3. `rollout undo` でロールバックすると、エラーの Pod が消え、正常な Pod が再度作られる

#### 観察ポイント

- `ImagePullBackOff` は「イメージの取得に失敗して、しばらく待ってから再試行する」という意味
- Kubernetes のローリングアップデート戦略は、新しい Pod が正常に起動するまで旧 Pod を削除しない
- だから、イメージ名を間違えてもサービスが止まることはない（安心！）

#### 元に戻す方法

Step 4 で `rollout undo` を実行済みです。以下で正常を確認してください。

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   0          30s
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

#### 学んだこと

```
1. 存在しないイメージを指定すると ImagePullBackOff エラーになる
2. ローリングアップデートでは、新しい Pod が正常になるまで旧 Pod は削除されない
   → 間違ったデプロイをしてもサービスが止まらない！
3. rollout undo コマンドで簡単に前のバージョンに戻せる
4. describe コマンドの Events セクションでエラーの原因がわかる
```

---

### テスト3: リソース制限超過（OOMKilled）

#### なぜこのテストをするのか

Pod にはメモリ（RAM）の使用量制限を設定できます。制限を超えるとどうなるかを確認します。

```
テストの概要:

  「メモリ上限 64MB の Pod を作って、128MB のメモリを使わせる」
       ↓
  Pod がメモリ上限を超える
       ↓
  Linux の OOM Killer がプロセスを強制終了
       ↓
  Pod のステータスが OOMKilled になる

  OOM = Out Of Memory（メモリ不足）
```

#### テスト前の状態確認

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   0          5m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

#### 手順

**Step 1**: メモリを大量に使うテスト用 Pod を作成する

```bash
sudo k3s kubectl run memory-bomb -n fortune-compass --image=polinux/stress \
  --limits="memory=64Mi" --requests="memory=32Mi" \
  --command -- stress --vm 1 --vm-bytes 128M --vm-hang 0
```

```
出力例:
pod/memory-bomb created
```

このコマンドの意味:
- `memory-bomb` という名前の Pod を作る
- メモリ上限を 64MB に設定
- `stress` コマンドで 128MB のメモリを使おうとする（上限の2倍！）

**Step 2**: Pod の状態を観察する

```bash
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS      RESTARTS   AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running     0          5m
frontend-7b6c4d8e5f-m3n7p  1/1     Running     0          2d
memory-bomb                 0/1     ContainerCreating   0          2s
memory-bomb                 1/1     Running             0          5s
memory-bomb                 0/1     OOMKilled           0          8s
memory-bomb                 1/1     Running             1 (3s ago) 12s
memory-bomb                 0/1     OOMKilled           1 (1s ago) 13s
memory-bomb                 0/1     CrashLoopBackOff    2 (15s ago) 30s
```

**Step 3**: Pod の詳細を確認する

```bash
sudo k3s kubectl describe pod memory-bomb -n fortune-compass
```

```
出力例（抜粋）:
Containers:
  memory-bomb:
    State:          Waiting
      Reason:       CrashLoopBackOff
    Last State:     Terminated
      Reason:       OOMKilled
      Exit Code:    137
    Limits:
      memory:  64Mi
    Requests:
      memory:  32Mi
    Restart Count:  3
```

**Step 4**: 後片付け（テスト用 Pod を削除する）

```bash
sudo k3s kubectl delete pod memory-bomb -n fortune-compass
```

```
出力例:
pod "memory-bomb" deleted
```

#### 期待される結果

1. Pod が起動して数秒で `OOMKilled` になる
2. Kubernetes が Pod を再起動する
3. また `OOMKilled` になる
4. 何度も繰り返すと `CrashLoopBackOff`（再起動の待ち時間がどんどん長くなる）

#### 観察ポイント

- `OOMKilled` の `Exit Code: 137` は「メモリ不足で強制終了」を意味する
- `CrashLoopBackOff` は「何度再起動しても失敗するので、再試行間隔を伸ばしている」状態
- RESTARTS の数が増えていくのを確認しよう

```
OOMKilled が起きる仕組み:

  Pod「128MB のメモリを使いたい！」
       ↓
  Linux カーネル「おまえの上限は 64MB だ。ダメ！」
       ↓
  Linux カーネルが OOM Killer を起動
       ↓
  プロセスを強制終了（Exit Code 137）
       ↓
  Kubernetes「Pod が死んだ。再起動しよう」
       ↓
  また 128MB 使おうとする → また OOMKilled
       ↓
  繰り返し... → CrashLoopBackOff
```

#### 元に戻す方法

Step 4 でテスト用 Pod を削除済みです。元のアプリには影響しません。

```bash
# 確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   0          10m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

#### 学んだこと

```
1. Pod にはメモリの使用量制限（limits）を設定できる
2. 制限を超えると OOMKilled（メモリ不足で強制終了）になる
3. Kubernetes は OOMKilled になった Pod を自動で再起動する
4. 何度も失敗すると CrashLoopBackOff になり、再起動間隔が長くなる
5. Fortune Compass の各 Pod はメモリ上限 512Mi が設定されている
   → アプリが 512MB を超えるメモリを使おうとすると OOMKilled になる
```

---

### テスト4: ヘルスチェック失敗をシミュレート

#### なぜこのテストをするのか

アプリのプロセスが異常終了した場合、Kubernetes の liveness probe がそれを検知してコンテナを再起動することを確認します。

```
テストの概要:

  backend Pod の中のプロセスを手動で kill する
       ↓
  liveness probe の HTTP リクエストが失敗する
       ↓
  Kubernetes がコンテナを再起動する
       ↓
  アプリが復旧する
```

#### テスト前の状態確認

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   0          10m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

RESTARTS が `0` であることをメモしてください。

#### 手順

**Step 1**: backend Pod の中のメインプロセスを終了させる

```bash
# Pod 名を確認
sudo k3s kubectl get pods -n fortune-compass

# Pod 内のプロセスを kill する（Pod 名は上で確認した実際の名前に置き換え）
sudo k3s kubectl exec -it backend-xxxxx-xxxxx -n fortune-compass -- /bin/sh -c "kill 1"
#                         ^^^^^^^^^^^^^^^^^^^^
#                         上で確認した実際の Pod 名に置き換え
```

```
出力例:
command terminated with exit code 137
```

> **説明**: `kill 1` は、Pod 内のメインプロセス（PID 1 = Node.js/Express サーバー）を終了させるコマンドです。

**Step 2**: Pod の状態を観察する

```bash
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS    RESTARTS      AGE
backend-5d8f9b7c4a-t8u3v   0/1     Error     0             10m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0             2d
backend-5d8f9b7c4a-t8u3v   1/1     Running   1 (3s ago)    10m
```

**Step 3**: Pod の詳細を確認する

```bash
sudo k3s kubectl describe pod backend-5d8f9b7c4a-t8u3v -n fortune-compass
```

```
出力例（抜粋）:
Containers:
  backend:
    State:          Running
      Started:      Mon, 17 Feb 2026 10:30:05 +0000
    Last State:     Terminated
      Reason:       Error
      Exit Code:    137
      Started:      Mon, 17 Feb 2026 10:20:00 +0000
      Finished:     Mon, 17 Feb 2026 10:30:02 +0000
    Restart Count:  1
Events:
  Type     Reason     Age   From     Message
  ----     ------     ----  ----     -------
  Normal   Pulled     10s   kubelet  Container image "..." already present on machine
  Normal   Created    10s   kubelet  Created container backend
  Normal   Started    9s    kubelet  Started container backend
```

#### 期待される結果

1. プロセスを kill すると、コンテナの状態が `Error` になる
2. Kubernetes がすぐにコンテナを再起動する
3. `RESTARTS` の数が `0` → `1` に増える
4. 数秒後にまた `1/1 Running` に戻る

#### 観察ポイント

- Pod 自体は削除されない。Pod の中のコンテナだけが再起動する
- Pod の名前は変わらない（テスト1の自動復旧とは違う！）
- `Last State: Terminated` で、前回の終了理由がわかる
- `Restart Count: 1` で再起動された回数がわかる

```
テスト1（Pod 削除）との違い:

  テスト1: Pod を削除 → 新しい Pod が作られる（名前が変わる）
  テスト4: プロセスを kill → 同じ Pod 内でコンテナが再起動（名前は同じ）

  ┌──────────── Pod ────────────┐
  │                              │
  │  ┌────────────────────────┐  │
  │  │  コンテナ (v1)   ×     │  │  ← kill でコンテナが終了
  │  └────────────────────────┘  │
  │           ↓ 再起動            │
  │  ┌────────────────────────┐  │
  │  │  コンテナ (v1)  再起動  │  │  ← 同じ Pod 内で新しいコンテナが起動
  │  └────────────────────────┘  │
  │                              │
  └──────────────────────────────┘
  Pod の名前は変わらない！
```

#### 元に戻す方法

Kubernetes が自動でコンテナを再起動するため、操作は不要です。

```bash
# 確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS      AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   1 (60s ago)   11m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0             2d
```

RESTARTS が `1` になっていますが、アプリは正常に動いています。

#### 学んだこと

```
1. コンテナ内のプロセスが終了すると、Kubernetes がコンテナを再起動する
2. Pod は削除されない（テスト1とは違う）。同じ Pod 内で再起動する
3. RESTARTS の数で「何回再起動したか」がわかる
4. liveness probe があるおかげで、アプリの異常を自動で検知・復旧できる
5. readiness probe は「トラフィックを送っていいか」を判断する
   → 再起動中の Pod にはリクエストが来ない（ユーザーにエラーが見えにくい）
```

---

### テスト5: レプリカ数を0にする（サービスダウン）

#### なぜこのテストをするのか

Pod の数を0にすると、そのサービスは完全に停止します。Deployment の replicas を0にするとどうなるか、そして復旧方法を確認します。

```
テストの概要:

  backend の replicas を 0 にする
       ↓
  backend Pod が全部消える
       ↓
  /api/* へのリクエストが失敗する
       ↓
  replicas を 1 に戻すと復旧する
```

#### テスト前の状態確認

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS      AGE
backend-5d8f9b7c4a-t8u3v   1/1     Running   1 (5m ago)    15m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0             2d
```

```bash
# ※ EC2 に SSH 接続した状態で実行
# バックエンドが動いていることを確認
curl localhost/api/health
```

```
出力例:
{"status":"ok","timestamp":"2026-02-17T10:45:00.000Z"}
```

#### 手順

**Step 1**: backend のレプリカ数を0にする

```bash
sudo k3s kubectl scale deployment/backend --replicas=0 -n fortune-compass
```

```
出力例:
deployment.apps/backend scaled
```

**Step 2**: Pod が消えることを確認する

```bash
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

backend Pod がなくなりました。

**Step 3**: バックエンドにアクセスしてみる

```bash
# ※ EC2 に SSH 接続した状態で実行
curl localhost/api/health
```

```
出力例:
502 Bad Gateway
```

バックエンドが存在しないので、502 エラー（Bad Gateway）が返ってきます。Ingress（Traefik）は backend Service にリクエストを転送しようとしますが、転送先の Pod がないのでエラーになります。

```
リクエストの流れ（※ EC2 に SSH 接続した状態で実行）:

  curl localhost/api/health
       ↓
  Traefik Ingress: 「/api だから backend Service に転送」
       ↓
  backend Service: 「転送先の Pod が... ない！」
       ↓
  502 Bad Gateway を返す
```

**Step 4**: Deployment の状態を確認する

```bash
sudo k3s kubectl get deployments -n fortune-compass
```

```
出力例:
NAME       READY   UP-TO-DATE   AVAILABLE   AGE
backend    0/0     0            0           30d
frontend   1/1     1            1           30d
```

backend が `0/0` になっています。「目標0個に対して0個」なので、Kubernetes 的には正常な状態です。Deployment に「0個にしてね」と指示したので、Kubernetes はその指示通りに動いているだけです。

**Step 5**: 復旧する

```bash
sudo k3s kubectl scale deployment/backend --replicas=1 -n fortune-compass
```

```
出力例:
deployment.apps/backend scaled
```

```bash
# Pod が起動するのを確認
sudo k3s kubectl get pods -n fortune-compass -w
```

```
出力例:
NAME                        READY   STATUS              RESTARTS   AGE
frontend-7b6c4d8e5f-m3n7p  1/1     Running             0          2d
backend-5d8f9b7c4a-w6x8y   0/1     ContainerCreating   0          1s
backend-5d8f9b7c4a-w6x8y   0/1     Running             0          3s
backend-5d8f9b7c4a-w6x8y   1/1     Running             0          8s
```

**Step 6**: 復旧を確認する

```bash
# ※ EC2 に SSH 接続した状態で実行
curl localhost/api/health
```

```
出力例:
{"status":"ok","timestamp":"2026-02-17T10:50:00.000Z"}
```

#### 期待される結果

1. `replicas=0` にすると、backend Pod が全て削除される
2. `/api/*` へのリクエストが 502 エラーになる
3. `replicas=1` に戻すと、新しい Pod が作られて復旧する

#### 観察ポイント

- `replicas=0` は Deployment を「削除」するのとは違う。Deployment 自体は残っている
- `replicas=0` の状態は Kubernetes 的には「正常」。Kubernetes は指示通りに Pod を0個にしている
- テスト1（Pod 削除）では Deployment が自動復旧したが、今回は復旧しない。なぜなら「Pod を0個にせよ」という指示を Deployment が忠実に守っているから

```
テスト1との重要な違い:

  テスト1: Pod を削除 → Deployment「replicas=1 なのに0個だ！作り直す！」→ 自動復旧
  テスト5: replicas=0  → Deployment「replicas=0 で0個。指示通り！」→ 復旧しない

  つまり: Deployment は「指示された数」を維持する。
         Pod が消えても復旧するのは、「指示された数」と実際の数が違うときだけ。
```

#### 元に戻す方法

Step 5 で `replicas=1` に戻し済みです。

#### 学んだこと

```
1. replicas=0 にすると Pod が全て消え、サービスが完全停止する
2. Deployment 自体は残っているので、replicas を戻せば復旧する
3. Deployment は「指示された数」を維持するのが仕事
4. Pod 削除による自動復旧は「指示された数と実際の数が違う」ときに起きる
5. メンテナンス時に意図的に replicas=0 にすることもある
```

---

### テスト6: ログの確認方法

#### なぜこのテストをするのか

問題が起きたとき、最も重要な手がかりは「ログ（記録）」です。ログの見方をマスターしましょう。

```
ログとは:

  アプリが動いている間、こんな記録を残しています。

  [10:00:00] サーバーを起動しました
  [10:00:01] ポート 8080 でリッスン開始
  [10:05:23] GET /api/health → 200 OK
  [10:05:45] GET /api/fortune/zodiac → 200 OK
  [10:10:00] エラー: データベースに接続できません  ← こういうのを見つけたい！

  ログを読めると、問題の原因がわかるようになります。
```

#### テスト前の状態確認

```bash
# Pod の名前を確認
sudo k3s kubectl get pods -n fortune-compass
```

```
出力例:
NAME                        READY   STATUS    RESTARTS   AGE
backend-5d8f9b7c4a-w6x8y   1/1     Running   0          5m
frontend-7b6c4d8e5f-m3n7p  1/1     Running   0          2d
```

#### 手順

**Step 1**: 通常のログを表示する

```bash
# backend Pod のログ（Pod 名は get pods で確認した実際の名前に置き換える）
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass
#                      ^^^^^^^^^^^^^^^^^^^^
#                      上で確認した実際の Pod 名に置き換え
```

```
出力例:
Server is running on port 8080
Environment: production
Health check endpoint: /api/health
GET /api/health 200 3ms
GET /api/health 200 2ms
GET /api/fortune/zodiac 200 15ms
```

**Step 2**: ログをリアルタイムで追跡する

```bash
# -f オプションで、新しいログが出るたびにリアルタイムで表示される
# 停止するには Ctrl+C を押す
sudo k3s kubectl logs -f backend-xxxxx-xxxxx -n fortune-compass
#                        ← 上で確認した実際の Pod 名に置き換え
```

```
出力例:
GET /api/health 200 2ms
GET /api/health 200 3ms
（ここで別のターミナルから EC2 に SSH 接続して curl localhost/api/fortune/zodiac を実行すると...）
GET /api/fortune/zodiac 200 12ms     ← リアルタイムで表示される！
```

> **使いどころ**: 問題を再現しながらログを見たいときに便利です。

**Step 3**: 前回のコンテナのログを表示する

テスト4でプロセスを kill したとき、コンテナが再起動しました。再起動前のログを見てみましょう。

```bash
# --previous オプションで、前回（再起動前）のコンテナのログを表示
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass --previous
#                      ← 上で確認した実際の Pod 名に置き換え
```

```
出力例:
Server is running on port 8080
Environment: production
Health check endpoint: /api/health
GET /api/health 200 2ms
GET /api/health 200 3ms
（プロセスが kill される直前までのログ）
```

> **注意**: `--previous` は直前の1世代分のログしか見られません。また、Pod が再起動されていない場合はエラーになります。

**Step 4**: Deployment のすべての Pod のログを表示する

```bash
# Deployment 名を指定すると、その Deployment に属する Pod のログが表示される
sudo k3s kubectl logs deployment/backend -n fortune-compass
```

```
出力例:
Found 1 pods, using pod/backend-5d8f9b7c4a-w6x8y
Server is running on port 8080
Environment: production
Health check endpoint: /api/health
```

> **ポイント**: Pod が複数ある場合（replicas=2 のとき）、このコマンドはそのうち1つの Pod のログだけを表示します。すべての Pod のログを見たい場合は `--all-containers` オプションや個別に Pod 名を指定して確認します。

**Step 5**: 最新のN行だけ表示する

```bash
# 最新の20行だけ表示
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass --tail=20
#                      ← 上で確認した実際の Pod 名に置き換え
```

```
出力例（最新20行のみ）:
GET /api/health 200 2ms
GET /api/health 200 3ms
GET /api/fortune/zodiac 200 15ms
GET /api/health 200 2ms
...
```

#### 観察ポイント

ログの中で特に注目すべきキーワード:

| キーワード | 意味 |
|-----------|------|
| `ERROR` / `Error` | エラーが発生した |
| `WARN` / `Warning` | 警告（今すぐ問題ではないが注意） |
| `500` | サーバー内部エラー |
| `404` | ページが見つからない |
| `Connection refused` | 接続が拒否された |
| `ECONNREFUSED` | Node.js で接続が拒否されたとき |
| `timeout` | タイムアウト（時間内に応答がなかった） |

#### 元に戻す方法

ログの確認だけなので、元に戻す操作は不要です。

#### 学んだこと

```
1. logs コマンドで Pod のログを確認できる
2. -f オプションでリアルタイム追跡ができる（Ctrl+C で停止）
3. --previous で再起動前のログが見られる（障害原因の調査に必須！）
4. --tail=N で最新のN行だけ表示できる
5. deployment/名前 で Deployment 単位でログを見られる
6. ログは問題解決の最も重要な手がかり！
```

---

## Part 5: トラブルシューティングガイド

### 5.1 よくあるエラーメッセージと対処法

| エラー | 意味 | 原因 | 対処法 |
|--------|------|------|--------|
| `ImagePullBackOff` | イメージの取得に失敗 | イメージ名の間違い、ECR の認証切れ | イメージ名を確認、ECR シークレットを更新 |
| `CrashLoopBackOff` | Pod が起動→クラッシュを繰り返し | アプリのバグ、設定ミス | `logs --previous` でクラッシュ前のログを確認 |
| `OOMKilled` | メモリ不足で強制終了 | メモリ使用量が limits を超えた | limits を増やす or メモリリークを修正 |
| `Pending` | Pod がどこにもスケジュールされない | リソース不足（CPU/メモリが足りない） | 他の Pod を減らす or ノードを追加 |
| `ContainerCreating` が長い | コンテナの準備に時間がかかっている | イメージのダウンロード中 | 待つ。大きなイメージは時間がかかる |
| `ErrImagePull` | イメージの取得エラー | レジストリ認証失敗、ネットワーク問題 | `describe pod` で詳細を確認 |
| `CreateContainerConfigError` | コンテナ設定エラー | Secret/ConfigMap が見つからない | 必要な Secret/ConfigMap が存在するか確認 |
| `Evicted` | ノードから退去させられた | ノードのディスクやメモリが不足 | ノードのリソースを確認 |

### 5.2 トラブルシューティングの手順

問題が起きたとき、以下の手順で原因を調べましょう。

```
トラブルシューティングフローチャート:

  問題発生！
       │
       ▼
  Step 1: Pod の状態を確認
  $ sudo k3s kubectl get pods -n fortune-compass
       │
       ├── Running だけど動作がおかしい → Step 4 (ログを確認)
       │
       ├── CrashLoopBackOff → Step 3 (前回のログを確認)
       │
       ├── ImagePullBackOff → Step 2 (イメージとシークレットを確認)
       │
       ├── Pending → Step 5 (リソースとイベントを確認)
       │
       ├── OOMKilled → Step 6 (メモリ制限を確認)
       │
       └── Pod が存在しない → Step 7 (Deployment を確認)
       │
       ▼
  ※ 以下の <Pod名> はすべて get pods で確認した実際の Pod 名に置き換えてください
  $ sudo k3s kubectl get pods -n fortune-compass  ← まずこれで Pod 名を確認

  Step 2: ImagePullBackOff の対処
  $ sudo k3s kubectl describe pod <Pod名> -n fortune-compass
  → Events セクションでエラー詳細を確認
  → イメージ名は正しい？ ECR シークレットは有効？
  → ECR シークレットの更新: sudo /usr/local/bin/refresh-ecr-secret.sh
       │
       ▼
  Step 3: CrashLoopBackOff の対処
  $ sudo k3s kubectl logs <Pod名> -n fortune-compass --previous
  → 前回のクラッシュ時のログでエラーメッセージを確認
  → アプリのバグ？ 環境変数の設定ミス？
       │
       ▼
  Step 4: ログの確認
  $ sudo k3s kubectl logs <Pod名> -n fortune-compass
  → ERROR や Warning を探す
  → リアルタイム追跡: -f オプション
       │
       ▼
  Step 5: Pending の対処
  $ sudo k3s kubectl describe pod <Pod名> -n fortune-compass
  → Events セクションで「Insufficient cpu」や「Insufficient memory」を探す
  → ノードのリソースが足りない可能性
  $ sudo k3s kubectl top nodes
       │
       ▼
  Step 6: OOMKilled の対処
  $ sudo k3s kubectl describe pod <Pod名> -n fortune-compass
  → Limits のメモリ値を確認
  → アプリのメモリ使用量が limits を超えていないか確認
  → 必要なら limits を増やす
       │
       ▼
  Step 7: Deployment の確認
  $ sudo k3s kubectl get deployments -n fortune-compass
  → replicas が 0 になっていない？
  → Deployment 自体が存在する？
```

### 5.3 よく使うトラブルシューティングコマンド一覧

```bash
# 1. 全体の状態をざっくり確認
sudo k3s kubectl get all -n fortune-compass

# 2. Pod の状態を確認（Pod 名は毎回変わるため、必ず最新を取得）
sudo k3s kubectl get pods -n fortune-compass
# 出力例の NAME 列（例: backend-5d8f9b7c4a-x2k9j）を以下のコマンドで使用

# 3. Pod の詳細情報（Events が重要！）
sudo k3s kubectl describe pod backend-xxxxx-xxxxx -n fortune-compass
#                              ← 上で確認した実際の Pod 名に置き換え

# 4. Pod のログ
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass
#                      ← 上で確認した実際の Pod 名に置き換え

# 5. 前回のコンテナのログ（再起動後に見る）
sudo k3s kubectl logs backend-xxxxx-xxxxx -n fortune-compass --previous
#                      ← 上で確認した実際の Pod 名に置き換え

# 6. リアルタイムログ追跡
sudo k3s kubectl logs -f backend-xxxxx-xxxxx -n fortune-compass
#                        ← 上で確認した実際の Pod 名に置き換え

# 7. イベント一覧（時系列）
sudo k3s kubectl get events -n fortune-compass --sort-by=.metadata.creationTimestamp

# 8. ノードのリソース状況
sudo k3s kubectl top nodes
sudo k3s kubectl top pods -n fortune-compass

# 9. Pod 内でコマンドを実行（デバッグ用）
sudo k3s kubectl exec -it backend-xxxxx-xxxxx -n fortune-compass -- /bin/sh
#                         ← 上で確認した実際の Pod 名に置き換え

# 10. Ingress の状態確認
sudo k3s kubectl describe ingress fortune-compass -n fortune-compass

# 11. Service のエンドポイント確認（Pod が正しく紐づいているか）
sudo k3s kubectl get endpoints -n fortune-compass

# 12. ECR シークレットの状態確認
sudo k3s kubectl get secret ecr-secret -n fortune-compass -o yaml
```

### 5.4 Fortune Compass 固有のトラブルシューティング

#### ECR シークレットの有効期限切れ

ECR（Amazon Elastic Container Registry）の認証トークンは12時間で期限切れになります。6時間ごとに自動更新されますが、EC2 を停止・起動した直後は更新が必要な場合があります。

```bash
# 症状: ImagePullBackOff が出る
sudo k3s kubectl get pods -n fortune-compass

# ECR シークレットを手動で更新
sudo /usr/local/bin/refresh-ecr-secret.sh

# Pod を再起動して新しいシークレットでイメージを取得
sudo k3s kubectl rollout restart deployment/backend -n fortune-compass
sudo k3s kubectl rollout restart deployment/frontend -n fortune-compass
```

#### EC2 再起動後にアプリが動かない

EC2 を停止して再起動した場合、k3s は自動で起動しますが、ECR シークレットの更新が必要な場合があります。

```bash
# k3s が動いているか確認
sudo systemctl status k3s

# Pod の状態を確認
sudo k3s kubectl get pods -n fortune-compass

# ImagePullBackOff が出ていたら ECR シークレットを更新
sudo /usr/local/bin/refresh-ecr-secret.sh

# Deployment を再起動
sudo k3s kubectl rollout restart deployment/backend -n fortune-compass
sudo k3s kubectl rollout restart deployment/frontend -n fortune-compass
```

---

## Part 6: 用語集

Kubernetes に関する用語を、わかりやすく説明します。

| 用語 | 読み方 | 簡単な説明 |
|------|--------|-----------|
| **Kubernetes** | クバネティス | コンテナを自動で管理するシステム。略して「K8s（ケーエイツ）」とも呼ぶ |
| **k3s** | ケースリー | 軽量版 Kubernetes。1台のサーバーで動く |
| **Pod** | ポッド | アプリが動いている最小単位。マンションの「部屋」 |
| **Container** | コンテナ | アプリとその実行環境をパッケージしたもの。Pod の中に入っている |
| **Deployment** | デプロイメント | Pod の数と状態を管理するマネージャー |
| **Service** | サービス | Pod への固定のアクセスポイント（受付デスク） |
| **Ingress** | イングレス | 外部からのアクセスを正しい Service に振り分ける（正面玄関） |
| **Namespace** | ネームスペース | Kubernetes 内を区切るグループ（マンションのフロア） |
| **Node** | ノード | Kubernetes が動いているサーバー。Fortune Compass では EC2 1台 |
| **Cluster** | クラスター | Node の集まり。Fortune Compass では Node 1台のクラスター |
| **ReplicaSet** | レプリカセット | Deployment が内部で使う。指定した数の Pod を維持する |
| **replicas** | レプリカ | Pod の目標数。replicas=2 なら Pod を2個維持する |
| **kubectl** | キューブコントロール | Kubernetes を操作するコマンドラインツール |
| **ClusterIP** | クラスターアイピー | クラスター内部からのみアクセスできる Service の種類 |
| **Traefik** | トラエフィク | k3s に組み込まれた Ingress Controller（リクエスト振り分け役） |
| **ECR** | イーシーアール | Amazon Elastic Container Registry。Docker イメージの保管庫 |
| **Image** | イメージ | アプリを動かすための設計図。Docker イメージ |
| **Rolling Update** | ローリングアップデート | 旧 Pod と新 Pod を少しずつ入れ替える無停止更新方式 |
| **Rollback** | ロールバック | 前のバージョンに戻すこと |
| **Liveness Probe** | ライブネスプローブ | 「アプリは生きてる？」を確認するヘルスチェック。失敗するとコンテナ再起動 |
| **Readiness Probe** | レディネスプローブ | 「リクエストを受け付けられる？」を確認するヘルスチェック。失敗するとトラフィック停止 |
| **OOMKilled** | オーオーエムキルド | Out Of Memory Killed。メモリ不足で強制終了されたこと |
| **CrashLoopBackOff** | クラッシュループバックオフ | Pod が起動→クラッシュを繰り返している状態 |
| **ImagePullBackOff** | イメージプルバックオフ | Docker イメージの取得に失敗している状態 |
| **Pending** | ペンディング | Pod がまだどのノードにもスケジュールされていない状態 |
| **Terminating** | ターミネイティング | Pod が終了処理中の状態 |
| **Events** | イベント | Kubernetes で起きた出来事の記録 |
| **describe** | ディスクライブ | リソースの詳細情報を表示するコマンド |
| **Scale** | スケール | Pod の数を増減させること |
| **Secret** | シークレット | パスワードや認証トークンなどの機密情報を保存するリソース |
| **Resource Requests** | リソースリクエスト | Pod が最低限必要とする CPU/メモリの量 |
| **Resource Limits** | リソースリミット | Pod が使える CPU/メモリの上限 |
| **YAML** | ヤムル | Kubernetes の設定ファイルの形式（人間が読みやすい設定ファイル） |
| **Manifest** | マニフェスト | Kubernetes に「こういうリソースを作って」と指示する設定ファイル |

---

## 付録: Fortune Compass の Kubernetes マニフェスト

参考として、Fortune Compass で実際に使っている Kubernetes の設定（マニフェスト）を掲載します。

### Backend Deployment & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: fortune-compass
  labels:
    app: backend
spec:
  replicas: 1                    # Pod を1個維持する
  selector:
    matchLabels:
      app: backend               # app=backend のラベルがついた Pod を管理
  template:
    metadata:
      labels:
        app: backend
    spec:
      imagePullSecrets:
        - name: ecr-secret       # ECR からイメージを取得するための認証情報
      containers:
        - name: backend
          image: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-backend:タグ
          # ↑ ECR のイメージ URI（CI/CD で自動設定）
          # AWSアカウントID は aws sts get-caller-identity --query Account --output text で確認
          # または terraform output ecr_backend_url で URI 全体を確認できます
          ports:
            - containerPort: 8080
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "8080"
            - name: CORS_ORIGIN
              value: "*"
          readinessProbe:        # リクエストを受け付けられるか確認
            httpGet:
              path: /api/health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:         # アプリが生きているか確認
            httpGet:
              path: /api/health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 30
          resources:
            requests:            # 最低限必要なリソース
              cpu: 128m          # 0.128 CPU コア
              memory: 256Mi      # 256 MB メモリ
            limits:              # 使える上限
              cpu: 256m          # 0.256 CPU コア
              memory: 512Mi      # 512 MB メモリ
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: fortune-compass
spec:
  selector:
    app: backend                 # app=backend の Pod にトラフィックを転送
  ports:
    - port: 8080
      targetPort: 8080
      protocol: TCP
```

### Frontend Deployment & Service

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: fortune-compass
  labels:
    app: frontend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      imagePullSecrets:
        - name: ecr-secret
      containers:
        - name: frontend
          image: <AWSアカウントID>.dkr.ecr.ap-northeast-1.amazonaws.com/fortune-compass-dev-frontend:タグ
          # ↑ ECR のイメージ URI（CI/CD で自動設定）
          # terraform output ecr_frontend_url で URI を確認できます
          ports:
            - containerPort: 3000
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3000"
            - name: HOSTNAME
              value: "0.0.0.0"   # 全インターフェースでリッスン
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          resources:
            requests:
              cpu: 128m
              memory: 256Mi
            limits:
              cpu: 256m
              memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: fortune-compass
spec:
  selector:
    app: frontend
  ports:
    - port: 3000
      targetPort: 3000
      protocol: TCP
```

### Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: fortune-compass
  namespace: fortune-compass
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web
spec:
  rules:
    - http:
        paths:
          - path: /api           # /api で始まるリクエスト → backend
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8080
          - path: /              # それ以外のリクエスト → frontend
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 3000
```

---

> このガイドを通じて、Kubernetes の基本概念と障害対応のスキルを身につけることができます。
> 実際に手を動かしてコマンドを実行し、結果を観察することが一番の勉強になります。
> 失敗を恐れず、たくさん実験してみてください！
