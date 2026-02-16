# Fortune Compass 要件定義書

## 1. プロジェクト概要

### 1.1 アプリ名
**Fortune Compass（総合占いアプリ）**

### 1.2 概要
16種の占術（4カテゴリ: 定番・誕生日・伝統・特殊）を統合し、総合運勢ダッシュボードを提供するWebアプリケーション。
AWS ECS Fargate 上で本番稼働中。

**URL**: https://d71oywvumn06c.cloudfront.net

### 1.3 目的
- ユーザーに多角的な占い体験を提供する
- Docker / AWS ECS (Fargate) を活用したコンテナデプロイの学習
- Terraform による IaC の実践
- GitHub Actions による CI/CD パイプラインの構築

### 1.4 ターゲットユーザー
- 占いに興味のある一般ユーザー（20〜40代を想定）

---

## 2. 対応占術と判定ロジック

### 2.1 定番（Classic）— 4占術

| # | 占術 | 入力 | 判定ロジック | 日替わり |
|---|------|------|-------------|---------|
| 1 | 星座占い | 生年月日 | 月日から12星座を判定、日付+星座シードで運勢スコアリング | はい |
| 2 | 数秘術 | 生年月日・名前 | 生年月日の各桁を加算して運命数（1〜9, 11, 22, 33）を算出。名前はローマ字→ピタゴリアン変換 | いいえ |
| 3 | 血液型占い | 血液型 | A/B/O/AB型ごとの性格・相性データ + 日替わりスコア | はい |
| 4 | タロット占い | なし（ランダム） | 大アルカナ22枚から3枚引き（過去・現在・未来）、正位置・逆位置あり | 毎回変動 |

### 2.2 誕生日（Birthday）— 8占術

| # | 占術 | 入力 | 判定ロジック | 日替わり |
|---|------|------|-------------|---------|
| 5 | 干支占い | 生年月日 | `(生年 - 4) % 12` で十二支を判定 | いいえ |
| 6 | 九星気学 | 生年月日 | 生年から本命星（一白水星〜九紫火星）を算出 | いいえ |
| 7 | 動物占い | 生年月日 | 換算テーブルで60パターンの動物キャラクターを判定（12動物×5色） | いいえ |
| 8 | 誕生花占い | 生年月日 | 365日分の誕生花データを参照 | いいえ |
| 9 | 誕生石占い | 生年月日 | 12月分の誕生石データを参照 | いいえ |
| 10 | 四柱推命 | 生年月日 | 天干地支 + ユリウス日から年柱・月柱・日柱を算出 | いいえ |
| 11 | 曜日占い | 生年月日 | ツェラーの合同式で曜日を算出 | いいえ |
| 12 | 風水占い | 生年月日・性別 | 本命卦（Gua Number）を算出、八方位の吉凶を判定 | いいえ |

### 2.3 伝統（Traditional）— 2占術

| # | 占術 | 入力 | 判定ロジック | 日替わり |
|---|------|------|-------------|---------|
| 13 | おみくじ | なし | 重み付きランダムで7段階（大吉〜大凶）を判定 | 毎回変動 |
| 14 | ルーン占い | なし | エルダーフサルク24ルーンから3石選択（過去・現在・未来） | 毎回変動 |

### 2.4 特殊（Special）— 2占術

| # | 占術 | 入力 | 判定ロジック | 日替わり |
|---|------|------|-------------|---------|
| 15 | 夢占い | キーワード | 夢辞典データベースからキーワード検索・部分一致 | いいえ |
| 16 | 手相占い（AI） | 手の画像 | Claude Vision API で画像解析、4大線（生命線・頭脳線・感情線・運命線）を診断 | いいえ |

---

## 3. 機能要件

### 3.1 画面一覧

| # | 画面名 | パス | 概要 |
|---|--------|------|------|
| 1 | トップページ | `/` | アプリ紹介、各占術への導線 |
| 2 | ユーザー情報入力 | `/profile` | 名前・生年月日・血液型の入力フォーム |
| 3 | 占術選択 | `/fortune` | 16種の占術から個別 or ダッシュボードを選択 |
| 4-19 | 個別占い結果 | `/fortune/:type` | 占術ごとの詳細結果表示（16画面） |
| 20 | 総合運勢ダッシュボード | `/fortune/dashboard` | 4占術一括実行 + SVGレーダーチャート |
| 21 | 占い履歴 | `/history` | 過去の占い結果一覧（最大50件） |
| 22 | ヘルスチェック | `/health` | フロントエンドヘルスチェック |
| 23 | 404エラー | `/*` | カスタム404ページ |

### 3.2 機能詳細

#### F-001: ユーザー情報入力
- **説明**: 占いに必要な個人情報を入力・保存する
- **入力項目**:
  - 名前（漢字 + フリガナ）— 必須
  - 生年月日 — 必須
  - 血液型（A / B / O / AB） — 任意
- **仕様**:
  - 入力データはブラウザの localStorage に保存
  - フリガナからローマ字への自動変換機能（外来語音対応）
  - バリデーション + アクセシビリティ対応

#### F-002〜F-017: 各占術（16種）
- **仕様**: 各占術ごとに専用のバックエンドサービスで結果を算出
- **共通出力**: スコア（1-5段階）、アドバイス文（2〜3文）、占術固有のデータ
- **共通機能**: 他占術への遷移ショートカット（OtherFortunes）、SNSシェアボタン

#### F-018: 総合運勢ダッシュボード
- **説明**: 4占術（星座・数秘術・血液型・タロット）を一括実行し、総合運勢を表示
- **出力**: SVGレーダーチャート（4軸: 総合運/恋愛運/仕事運/金運）、各占術サマリー、総合アドバイス
- **仕様**: カスタムSVG（外部ライブラリ不使用）

#### F-019: 占い履歴
- **説明**: 占い結果の閲覧履歴を自動保存・表示
- **仕様**: localStorage に自動保存（FIFO、最大50件）

#### F-020: SNSシェア機能
- **説明**: 占い結果をSNSにシェアする
- **対応SNS**: X（Twitter）、LINE、Facebook、クリップボード
- **仕様**: OGP / Twitter Card メタデータ + 動的OG画像生成

#### F-021: 多言語対応
- **説明**: 日本語 / English の切替機能
- **仕様**: クライアントサイド Context で言語切替

#### F-022: PWA対応
- **説明**: ホーム画面追加対応
- **仕様**: manifest.json + アイコン

---

## 4. 非機能要件

### 4.1 パフォーマンス
| 項目 | 目標値 |
|------|--------|
| ページ初期表示 | 3秒以内（LCP） |
| API応答時間 | 500ms以内（AI系を除く） |
| 同時接続数 | 100ユーザー（学習用のため小規模） |

### 4.2 品質
- フォントウェイト指定による最適化（Noto Sans JP: 400/500/700）
- DNS prefetch による外部リソース読み込み高速化
- WCAG AA 色コントラスト準拠
- ARIA属性、スキップナビ、フォーカスリング、セマンティックHTML

### 4.3 テスト
| 種別 | ツール | テスト数 |
|------|-------|---------|
| バックエンド単体 + API | Jest + Supertest | 75 |
| フロントエンド単体 | Jest + React Testing Library | 31 |
| E2E | Playwright (Chromium) | 25 |
| **合計** | | **131** |

### 4.4 可用性
- 目標稼働率: 99%（学習用途のため厳密なSLAは設けない）
- ECS Fargateのタスク数: 最小1、最大3（オートスケーリング）

### 4.5 セキュリティ
- HTTPS通信必須（CloudFront で終端）
- CORS設定でフロントエンドドメインのみ許可
- カメラ撮影画像（手相）はサーバー処理後に即時削除

### 4.6 ユーザー認証
- 認証なし（localStorage ベースのゲスト利用）

---

## 5. 技術構成

### 5.1 アーキテクチャ図

```
[ユーザー]
    |
    v
[CloudFront] ── HTTPS 終端 + 静的アセットキャッシュ
    |
    v
[ALB] ── パスベースルーティング
    |
    ├── /* → [Frontend Service]  (Next.js 16.x コンテナ)
    └── /api/* → [Backend Service]   (Express 5.x コンテナ)
                    |
                    └── [Claude Vision API] (手相AI占い)

[ECS Fargate Cluster] ── Private Subnets (2 AZ)
[VPC] ── Public/Private Subnets + NAT Gateway
[ECR] ── Docker イメージ保存
[CloudWatch Logs] ── コンテナログ（14日保持）
[S3 + DynamoDB] ── Terraform ステート管理
```

### 5.2 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.1.6 |
| UI | Tailwind CSS v4 + Lucide React | - |
| アニメーション | Framer Motion | 12.x |
| バックエンド | Express + TypeScript | 5.2.x |
| データ保持 | ブラウザ localStorage | - |
| AI | Claude Vision API (Anthropic) | 手相占い |
| テスト (Backend) | Jest + Supertest | 30.x |
| テスト (Frontend) | Jest + React Testing Library | 30.x |
| E2E テスト | Playwright (Chromium) | 1.58.x |
| IaC | Terraform | >= 1.5 |
| コンテナ | Docker | マルチステージビルド |
| オーケストレーション | ECS (Fargate) | サーバーレスコンテナ |
| CI/CD | GitHub Actions | OIDC認証 → ECR → ECS |
| CDN / HTTPS | Amazon CloudFront | - |
| モニタリング | CloudWatch Logs | 14日保持 |

### 5.3 AWS サービス構成

| サービス | 用途 | 月額概算 |
|---------|------|---------|
| VPC + Subnets | ネットワーク（2AZ、Public/Private） | $0 |
| NAT Gateway | Private Subnet からの外向き通信 | ~$32 |
| ALB | パスベースルーティング | ~$18 |
| CloudFront | HTTPS終端 + CDN | ~$0（無料枠内） |
| ECS Fargate | コンテナ実行（2サービス、各0.25vCPU/512MB） | ~$15 |
| ECR | Docker イメージ保存（2リポジトリ） | ~$1 |
| CloudWatch Logs | ログ収集 | ~$1 |
| S3 + DynamoDB | Terraform ステート管理 | < $1 |
| **合計** | | **~$68/月** |

---

## 6. API設計

### 6.1 エンドポイント一覧

| Method | Path | 概要 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（ALB用） |
| POST | `/api/fortune/zodiac` | 星座占い |
| POST | `/api/fortune/numerology` | 数秘術 |
| POST | `/api/fortune/blood-type` | 血液型占い |
| POST | `/api/fortune/tarot` | タロット占い |
| POST | `/api/fortune/eto` | 干支占い |
| POST | `/api/fortune/kyusei` | 九星気学 |
| POST | `/api/fortune/animal` | 動物占い |
| POST | `/api/fortune/birth-flower` | 誕生花占い |
| POST | `/api/fortune/birthstone` | 誕生石占い |
| POST | `/api/fortune/weekday` | 曜日占い |
| POST | `/api/fortune/fengshui` | 風水占い |
| POST | `/api/fortune/shichuu` | 四柱推命 |
| POST | `/api/fortune/omikuji` | おみくじ |
| POST | `/api/fortune/rune` | ルーン占い |
| POST | `/api/fortune/dream` | 夢占い |
| POST | `/api/fortune/palm` | 手相占い（AI） |
| POST | `/api/fortune/dashboard` | 総合ダッシュボード |

※ プロフィールは localStorage のみで管理するため、プロフィールAPIは不要。

---

## 7. 開発フェーズ（実績）

### Phase 1: 要件定義・設計
- [x] 要件定義書作成
- [x] 仕様書（spec-v1）作成
- [x] デザインシステム策定
- [x] UI設計方針策定
- [x] テスト設計書作成
- [x] UXレビュー
- [x] SSOT Issue 作成

### Phase 2: 基盤構築
- [x] モノレポ構成（concurrently で同時起動）
- [x] Next.js フロントエンド初期化（App Router, TypeScript）
- [x] Express バックエンド初期化（TypeScript）
- [x] Tailwind CSS v4 セットアップ
- [x] デザインシステムの Tailwind 設定反映

### Phase 3: 実装（4占術 MVP）
- [x] 星座占い・数秘術・血液型占い・タロット占い
- [x] ユーザー情報入力フォーム
- [x] 占術選択画面・個別結果画面
- [x] バックエンドテスト（75テスト）
- [x] フロントエンドテスト（31テスト）
- [x] E2Eテスト（25テスト）

### Phase 4: インフラ・デプロイ
- [x] Terraform でAWSインフラ構築（35リソース）
- [x] Docker 化（マルチステージビルド）
- [x] ECR push + ECS Fargate デプロイ
- [x] CloudFront 追加（HTTPS + CDN）
- [x] GitHub Actions CI/CD パイプライン

### Phase 5: 機能拡充（8機能追加）
- [x] WCAG AA 色コントラスト修正
- [x] 結果→他占術遷移ショートカット
- [x] アドバイス文拡充（2〜3文）
- [x] カタカナ→ローマ字変換精度向上（外来語音対応）
- [x] SEO（sitemap.xml, robots.txt, JSON-LD）
- [x] パフォーマンス最適化（フォントウェイト、DNS prefetch）
- [x] SNSシェア機能（X/LINE/Facebook/クリップボード）
- [x] 占い履歴（localStorage、最大50件）

### Phase 6: 総合運勢ダッシュボード
- [x] バックエンドAPI（4占術一括実行 + レーダースコア算出）
- [x] カスタムSVGレーダーチャート
- [x] ダッシュボードページ

### Phase 7: 12占術追加 + 機能強化
- [x] 干支占い・九星気学・動物占い・誕生花占い・誕生石占い
- [x] 曜日占い・風水占い・四柱推命
- [x] おみくじ・ルーン占い・夢占い
- [x] 手相AI占い（Claude Vision API）
- [x] PWA対応
- [x] 多言語対応（日本語 / English）
- [x] OGP / Twitter Card + 動的OG画像生成
- [x] カスタム404ページ
- [x] Framer Motion アニメーション

### 未実装（将来対応）
- [ ] AI総合診断（Claude API連携によるテキスト生成）
- [ ] 今日の運勢バッチ処理
- [ ] DynamoDB / ユーザー認証

---

## 8. 学習ポイントとの対応

| 学習目的 | 対応する実装 |
|---------|-------------|
| Dockerコンテナの基礎 | Dockerfile作成、マルチステージビルド、フロントエンド/バックエンドの2コンテナ構成 |
| ECS/Fargateでのコンテナデプロイ | Terraformによるクラスタ・タスク定義・サービス作成、ALB連携 |
| IaC (Terraform) | HCLでのインフラ定義（35リソース）、ステート管理（S3 + DynamoDB） |
| CI/CD | GitHub ActionsでのDockerビルド → ECRプッシュ → ECSデプロイ（OIDC認証） |
| AI連携 | Claude Vision APIの活用（手相画像解析） |
| フロントエンド | Next.js App Router、Tailwind CSS v4、Framer Motion、PWA、i18n |
| テスト | Jest + Supertest（Backend）、React Testing Library（Frontend）、Playwright（E2E） |
