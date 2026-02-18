# Fortune Compass MVP — SSOT Issue

> **Single Source of Truth**: このドキュメントはプロジェクト全体の進捗・タスク・判断履歴を一元管理する。
> 全メンバーはこのIssueを起点に作業状況を確認・更新すること。

---

## 1. プロジェクト概要

| 項目 | 内容 |
|------|------|
| プロダクト名 | Fortune Compass |
| バージョン | v2.3（Phase 13 完了） |
| 目的 | 19占術（4カテゴリ: 定番・誕生日・伝統・特殊）+ 総合ダッシュボード + AI総合鑑定を提供する総合占いWebアプリ |
| 想定作業時間 | 2〜3時間 |
| 実行環境 | AWS EC2 + k3s（CloudFront 経由） |
| 技術スタック | Next.js 16.x + Express 5.x + TypeScript + Tailwind CSS v4 |
| インフラ | AWS (CloudFront / EC2 + k3s / ECR / VPC / MediaConvert / Security Hub / Bedrock) |
| IaC | Terraform（~80 リソース） |
| CI/CD | GitHub Actions |

---

## 2. 関連ドキュメント

| # | フェーズ | ドキュメント | パス | 概要 |
|---|---------|------------|------|------|
| 1 | Phase 1: 要件定義 | 要件定義書 | [`001_requirements.md`](./001_requirements.md) | プロジェクト概要・対応占術・機能要件・技術構成 |
| 2 | Phase 2: 設計 | 仕様書 | [`002_spec-v1.md`](./002_spec-v1.md) | 機能要件・API設計・占いロジック・ディレクトリ構成 |
| 3 | Phase 2: 設計 | デザインシステム | [`003_design-system.md`](./003_design-system.md) | カラー・タイポグラフィ・コンポーネント仕様・Tailwind設定 |
| 4 | Phase 2: 設計 | UI設計方針 | [`004_ui-design.md`](./004_ui-design.md) | 画面別ワイヤーフレーム・遷移フロー・状態設計 |
| 5 | Phase 3: 計画 | SSOT Issue | [`005_ssot-issue.md`](./005_ssot-issue.md) | 進捗管理・タスク・判断記録・マイルストーン |
| 6 | Phase 4: 実装 | インフラ設計書 | [`006_infra-design.md`](./006_infra-design.md) | AWS インフラ設計・アーキテクチャ・コスト |
| 7 | Phase 4: 実装 | AWS サービス一覧 | [`007_aws-services.md`](./007_aws-services.md) | 使用 AWS サービスの解説 |
| 8 | Phase 5: テスト | テスト設計書 | [`008_test-design.md`](./008_test-design.md) | 単体テスト・APIテスト・手動テストケース |
| 9 | Phase 5.5: 品質ゲート | UXレビュー | [`009_ux-review.md`](./009_ux-review.md) | UX観点のレビュー・改善提案 |
| 10 | Phase 6: ドキュメント | システム全体解説 | [`010_system-overview.md`](./010_system-overview.md) | システム構成・技術詳細の総合解説 |
| 11 | Phase 6: ドキュメント | CI/CD 学習ガイド | [`011_cicd-learning.md`](./011_cicd-learning.md) | CI/CD パイプラインの初心者向け解説 |
| 12 | Phase 6: ドキュメント | Kubernetes 学習ガイド | [`012_kubernetes-learning.md`](./012_kubernetes-learning.md) | k3s / Kubernetes の学習 + 障害テスト手順 |
| 13 | Phase 6: ドキュメント | 環境の削除と再作成ガイド | [`013_destroy-recreate-guide.md`](./013_destroy-recreate-guide.md) | terraform destroy/apply 手順・コスト削減運用 |

---

## 3. マイルストーン

### M1: プロジェクト初期セットアップ
| タスク | 状態 | 備考 |
|--------|------|------|
| モノレポ構成（ルート package.json + concurrently） | ✅ 完了 | |
| Next.js フロントエンド初期化 | ✅ 完了 | App Router, TypeScript |
| Express バックエンド初期化 | ✅ 完了 | TypeScript, ts-node-dev |
| Tailwind CSS セットアップ | ✅ 完了 | v4（@theme in CSS） |
| デザインシステムの Tailwind 設定反映 | ✅ 完了 | カスタムカラー・フォント・アニメーション |
| `npm run dev` で同時起動確認 | ✅ 完了 | frontend:3000 / backend:8080 |

### M2: バックエンド — 占いロジック + API
| タスク | 状態 | 備考 |
|--------|------|------|
| 星座判定ロジック（zodiac.ts） | ✅ 完了 | 12星座境界値、エレメント、日替わりスコア |
| 数秘術ロジック（numerology.ts） | ✅ 完了 | 運命数算出、マスターナンバー、ピタゴリアン変換 |
| 血液型占いロジック（blood-type.ts） | ✅ 完了 | 固定データ + 日替わりスコア |
| タロット占いロジック（tarot.ts） | ✅ 完了 | 大アルカナ22枚データ、3枚抽出、正逆判定 |
| 占いマスターデータ作成（data/） | ✅ 完了 | zodiac-data, tarot-cards, blood-type-data |
| Express ルーティング（routes/fortune.ts） | ✅ 完了 | 4エンドポイント + バリデーション |
| CORS設定 | ✅ 完了 | 環境変数 CORS_ORIGIN 対応 |

### M3: バックエンド — テスト
| タスク | 状態 | 備考 |
|--------|------|------|
| Jest + ts-jest + supertest セットアップ | ✅ 完了 | |
| 星座占い単体テスト | ✅ 完了 | TC-Z001〜Z004 |
| 数秘術単体テスト | ✅ 完了 | TC-N001〜N004 |
| 血液型占い単体テスト | ✅ 完了 | TC-B001〜B002 |
| タロット占い単体テスト | ✅ 完了 | TC-T001〜T004 |
| APIエンドポイントテスト | ✅ 完了 | TC-API001〜API004 |

### M4: フロントエンド — 画面実装
| タスク | 状態 | 備考 |
|--------|------|------|
| 共通レイアウト（layout.tsx） | ✅ 完了 | ヘッダー、背景、フォント |
| トップページ（/） | ✅ 完了 | ヒーロー、CTA、占術アイコン |
| プロフィール入力（/profile） | ✅ 完了 | フォーム、バリデーション、localStorage保存 |
| 占術選択（/fortune） | ✅ 完了 | ユーザーサマリ、4占術カード |
| 星座占い結果（/fortune/zodiac） | ✅ 完了 | API呼び出し、結果表示 |
| 数秘術結果（/fortune/numerology） | ✅ 完了 | |
| 血液型占い結果（/fortune/blood-type） | ✅ 完了 | |
| タロット結果（/fortune/tarot） | ✅ 完了 | 3枚カード横並び + 詳細 |
| localStorage ユーティリティ（storage.ts） | ✅ 完了 | |
| APIクライアント（api-client.ts） | ✅ 完了 | |
| ローディング / エラー状態 | ✅ 完了 | |

### M5: 結合 + 動作確認
| タスク | 状態 | 備考 |
|--------|------|------|
| フロント ↔ バックエンド結合テスト | ✅ 完了 | |
| 全画面遷移フローの手動確認 | ✅ 完了 | TC-FE001 |
| プロフィール入力の手動確認 | ✅ 完了 | TC-FE002 |
| 各占い結果表示の手動確認 | ✅ 完了 | TC-FE003 |
| レスポンシブ確認 | ✅ 完了 | TC-FE004（Tailwind レスポンシブ対応済み） |
| 最終微調整 | ✅ 完了 | ESLint クリーン |

### M6: AWS デプロイ
| タスク | 状態 | 備考 |
|--------|------|------|
| Dockerfile 作成（frontend / backend） | ✅ 完了 | Multi-stage build |
| ヘルスチェックエンドポイント追加 | ✅ 完了 | /health, /api/health |
| Terraform モジュール作成（4モジュール） | ✅ 完了 | networking, ecr, ec2-k3s, cloudfront |
| ECR リポジトリ作成 + イメージ push | ✅ 完了 | frontend / backend |
| k3s (EC2) デプロイ | ✅ 完了 | 2サービス稼働中 |
| CloudFront 配置 (HTTPS) | ✅ 完了 | d71oywvumn06c.cloudfront.net |
| GitHub Actions CI/CD 設定 | ✅ 完了 | deploy.yml |

---

## 4. 受け入れ基準（Acceptance Criteria）

### 機能要件
- [ ] ユーザーが名前・生年月日・血液型を入力し、localStorageに保存できる
- [ ] 保存済みプロフィールがフォームに復元される
- [ ] 星座占い: 生年月日から正しい星座を判定し、スコア・ラッキー情報・アドバイスを表示する
- [ ] 数秘術: 運命数を正しく算出し（マスターナンバー対応）、性格特徴・年運・相性を表示する
- [ ] 血液型占い: 4血液型に対応した性格・スコア・相性ランキング・アドバイスを表示する
- [ ] タロット占い: 大アルカナ22枚から重複なし3枚を抽出し、正逆位置付きで過去・現在・未来を表示する
- [ ] 血液型未登録時、血液型占いが適切に制御される（グレーアウト or 誘導）

### 非機能要件
- [ ] `npm run dev` 一発でフロント（:3000）+ バック（:8080）が起動する
- [ ] バックエンドの単体テスト・APIテストが全てパスする
- [ ] モバイル（375px）〜デスクトップ（1024px）でレイアウトが崩れない
- [ ] API レスポンスタイムが 200ms 以内（ローカル環境）

---

## 5. 技術的な判断記録

| # | 日付 | 判断内容 | 理由 |
|---|------|---------|------|
| 1 | — | プロフィールAPIを作らずlocalStorageのみ | MVPスコープ縮小。サーバーにユーザーデータを持たない |
| 2 | — | 小アルカナ（56枚）は対象外 | MVP範囲。大アルカナ22枚で十分な体験を提供 |
| 3 | — | フロントエンドテストは手動確認 | 2〜3時間の制約内ではバックエンドロジックのテストを優先 |
| 4 | — | タロットカードは画像なし（テキスト表現） | 素材準備の工数を削減 |
| 5 | — | フリガナ → ローマ字変換はフロント側で実施 | 数秘術APIにはローマ字を送る設計 |
| 6 | — | 日替わり運勢はシード付き擬似ランダム | 同日・同条件で同じ結果を保証しつつ日替わりを実現 |

---

## 6. 実装順序（推奨）

```
M1 セットアップ（20分）
  ↓
M2 バックエンドロジック + API（50分）
  ↓
M3 バックエンドテスト（20分）
  ↓
M4 フロントエンド画面（50分）
  ↓
M5 結合 + 動作確認（20分）
```

合計: 約2時間40分

### M7: Phase 7 — 機能拡充（8機能追加）
| タスク | 状態 | 備考 |
|--------|------|------|
| 色コントラスト修正（WCAG AA準拠） | ✅ 完了 | text-secondary #a89ec4→#b8b0d0, text-muted #6b6183→#8a80a0 |
| 結果→他占術遷移（OtherFortunes） | ✅ 完了 | 全4結果ページに他3占術ショートカット追加 |
| アドバイス文拡充（2〜3文化） | ✅ 完了 | 星座・数秘術・血液型・タロット全占術のアドバイス拡充 |
| カタカナ→ローマ字変換精度向上 | ✅ 完了 | 外来語音 + 小書き文字対応追加 |
| SEO改善 | ✅ 完了 | sitemap.xml, robots.txt, JSON-LD構造化データ |
| パフォーマンス最適化 | ✅ 完了 | Noto Sans JP weight指定(400/500/700), DNS prefetch |
| SNSシェア機能 | ✅ 完了 | X(Twitter)/LINE/Facebook/クリップボード |
| 占い履歴 | ✅ 完了 | localStorage保存(最大50件) + /history ページ |

### M8: Phase 8 — 総合運勢ダッシュボード
| タスク | 状態 | 備考 |
|--------|------|------|
| ダッシュボードAPI（POST /api/fortune/dashboard） | ✅ 完了 | 4占術一括実行 + レーダースコア算出 |
| SVGレーダーチャート（RadarChart.tsx） | ✅ 完了 | 4軸（総合運/恋愛運/仕事運/金運）、外部ライブラリ不使用 |
| ダッシュボードページ（/fortune/dashboard） | ✅ 完了 | レーダーチャート + 4占術サマリー + 総合アドバイス + SNSシェア |
| 占術選択ページにダッシュボードバナー追加 | ✅ 完了 | /fortune ページ上部にグラデーションバナー |

### M9: Phase 9 — 占術拡充（12占術追加）
| タスク | 状態 | 備考 |
|--------|------|------|
| 干支占い (eto.ts) | ✅ 完了 | 十二支判定 + djb2シードスコア |
| 九星気学 (kyusei.ts) | ✅ 完了 | 生年→九星判定 |
| 動物占い (animal.ts) | ✅ 完了 | 60パターン動物キャラ判定 |
| 誕生花占い (birth-flower.ts) | ✅ 完了 | 365日誕生花データ |
| 誕生石占い (birthstone.ts) | ✅ 完了 | 12月誕生石データ |
| 曜日占い (weekday.ts) | ✅ 完了 | ツェラーの合同式 |
| 風水占い (fengshui.ts) | ✅ 完了 | 本命卦(Gua)算出 |
| 四柱推命 (shichuu.ts) | ✅ 完了 | 天干地支 + ユリウス日 |
| おみくじ (omikuji.ts) | ✅ 完了 | 重み付き7段階 |
| ルーン占い (rune.ts) | ✅ 完了 | 24ルーン3石選択 |
| 夢占い (dream.ts) | ✅ 完了 | キーワード検索 |
| 手相占い (palm.ts) | ✅ 完了 | Claude Vision API |
| 占術レジストリ (fortune-registry.ts) | ✅ 完了 | 16占術メタデータ管理 |
| カテゴリ分類UI | ✅ 完了 | 定番/誕生日/伝統/特殊の4カテゴリ |
| Sitemapに全占術追加 | ✅ 完了 | SEO対策 |

### M10: Phase 11 — Management Console（EC2 ライフサイクル管理）
| タスク | 状態 | 備考 |
|--------|------|------|
| Lambda 関数作成（Python 3.12） | ✅ 完了 | EC2 start/stop/status/health-check/ecr-refresh |
| Step Functions ステートマシン（start workflow） | ✅ 完了 | 起動→待機→ヘルスチェック→ECR refresh |
| Step Functions ステートマシン（stop workflow） | ✅ 完了 | 停止→待機 |
| API Gateway REST API | ✅ 完了 | API Key 認証、Lambda/Step Functions 連携 |
| S3 静的ウェブサイト（管理コンソール UI） | ✅ 完了 | HTML/CSS/JS |
| ECR トークンリフレッシュ systemd サービス | ✅ 完了 | EC2 起動時に自動実行 |
| SSM Agent 設定 | ✅ 完了 | Lambda からのリモートコマンド実行 |
| Terraform management モジュール | ✅ 完了 | 28 リソース追加（0 destroy） |

### M11: Phase 12 — AWS非コンピュート系サービス拡張
| タスク | 状態 | 備考 |
|--------|------|------|
| CloudFront /admin パス（CF Function リライト） | ✅ 完了 | 管理コンソール HTTPS 化 + URL 短縮 |
| MediaConvert 動画変換パイプライン | ✅ 完了 | S3 → Lambda → MP4+HLS 自動変換 |
| Security Hub / GuardDuty / Inspector / Config / Access Analyzer | ✅ 完了 | 5サービス有効化、count ベースで個別 ON/OFF |
| Bedrock Agent（対話型占いコンシェルジュ） | ✅ 完了 | Claude 3 Haiku + OpenAPI Action Group |
| Terraform 3モジュール追加（mediaconvert / security / bedrock） | ✅ 完了 | 43 added, 2 changed |

### M12: Phase 13 — 占い精度向上（7機能追加）
| タスク | 状態 | 備考 |
|--------|------|------|
| 月相ユーティリティ (moon-phase.ts) | ✅ 完了 | タロット・おみくじ・ルーンに月相ボーナス追加 |
| 旧暦・二十四節気 (solar-terms.ts) | ✅ 完了 | 九星気学・風水で立春を年の切り替えに使用 |
| 天文学的黄道十二宮 (astronomical-zodiac.ts) | ✅ 完了 | 太陽黄経による正確な星座判定 |
| 時柱追加 (shichuu.ts 拡張) | ✅ 完了 | 四柱推命 3柱→4柱化、プロフィールに生まれ時刻・性別追加 |
| 相性占い (compatibility.ts) | ✅ 完了 | 星座・血液型・数秘の3軸相性診断 |
| 運勢トレンド (trends.ts) | ✅ 完了 | 7日間折れ線グラフ（SVGベース TrendChart.tsx） |
| AI総合鑑定 (ai-reading.ts) | ✅ 完了 | Anthropic SDK で全占い結果を統合分析 |

---

## 7. スコープ外（将来対応）

以下は今後のフェーズで対応する。

- 今日の運勢バッチ処理
- お気に入り機能
- ユーザー認証
- カスタムドメイン（Route 53 + ACM）

---

## 8. 更新履歴

| 日付 | 更新内容 |
|------|---------|
| 2026-02-16 | 初版作成。MVP全タスク定義 |
| 2026-02-16 | M1〜M5 全タスク完了。テスト75件パス、ESLint クリーン |
| 2026-02-16 | M6 追加。AWS デプロイ完了（EC2 + k3s + CloudFront） |
| 2026-02-16 | 技術スタック・関連ドキュメント・スコープ外を最新化 |
| 2026-02-17 | M7 追加。Phase 7 機能拡充（8機能）全タスク完了、デプロイ成功 |
| 2026-02-17 | M8 追加。Phase 8 総合運勢ダッシュボード全タスク完了、デプロイ成功 |
| 2026-02-17 | スコープ外を更新。実装済み項目（履歴・SNSシェア・E2E・多言語・PWA）を除外 |
| 2026-02-17 | M9 追加。Phase 9 占術拡充（12占術追加）完了、全ドキュメント更新 |
| 2026-02-17 | M10 追加。Phase 11 Management Console（EC2 ライフサイクル管理）完了。Terraform 28 リソース追加 |
| 2026-02-17 | M11 追加。Phase 12 AWS非コンピュート系サービス拡張完了。CloudFront /admin, MediaConvert, Security, Bedrock Agent |
| 2026-02-17 | 関連ドキュメントに 011_cicd-learning.md, 012_kubernetes-learning.md 追加 |
| 2026-02-18 | M12 追加。Phase 13 占い精度向上（7機能追加）完了。占術数 16→19、月相・立春・天文学的星座・時柱・相性占い・トレンド・AI総合鑑定 |
