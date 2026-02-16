# Fortune Compass テスト設計書（MVP）

## 1. テスト方針

### スコープ
バックエンド占いロジック（75テスト）+ フロントエンドコンポーネント（31テスト）+ E2E（25テスト）の3層テスト。

### テストツール
| 種別 | ツール | テスト数 |
|------|-------|---------|
| バックエンド単体テスト | Jest + ts-jest | 75 |
| バックエンドAPIテスト | supertest | (上記に含む) |
| フロントエンド単体テスト | Jest + React Testing Library | 31 |
| E2Eテスト | Playwright (Chromium) | 25 |
| **合計** | | **131** |

### テストファイル配置
```
backend/
└── __tests__/
    ├── services/
    │   ├── zodiac.test.ts        # 星座占いロジック
    │   ├── numerology.test.ts    # 数秘術ロジック
    │   ├── blood-type.test.ts    # 血液型占いロジック
    │   ├── tarot.test.ts         # タロットロジック
    │   └── dashboard.test.ts     # ダッシュボードロジック
    └── routes/
        └── fortune.test.ts       # APIエンドポイント（5エンドポイント）

frontend/
├── __tests__/
│   ├── components/
│   │   ├── ScoreDisplay.test.tsx   # スコア表示 (5テスト)
│   │   ├── ResultCard.test.tsx     # 結果カード (3テスト)
│   │   ├── ErrorState.test.tsx     # エラー状態 (5テスト)
│   │   ├── LoadingState.test.tsx   # ローディング (4テスト)
│   │   └── FortuneCard.test.tsx    # 占術カード (4テスト)
│   └── lib/
│       ├── kana-to-romaji.test.ts  # カナ→ローマ字 (5テスト)
│       └── i18n.test.ts            # 多言語辞書 (5テスト)
└── e2e/
    ├── home.spec.ts               # トップページ (4テスト)
    ├── profile.spec.ts            # プロフィール (6テスト)
    ├── fortune.spec.ts            # 占術選択 (9テスト)
    └── navigation.spec.ts         # ナビ・a11y (6テスト)
```

---

## 2. 単体テスト: 星座占い（zodiac.service）

### TC-Z001: 星座判定 — 各星座の境界値

| テストID | 入力（月/日） | 期待する星座 | 備考 |
|---------|-------------|------------|------|
| TC-Z001-01 | 3/21 | 牡羊座 | 開始境界 |
| TC-Z001-02 | 4/19 | 牡羊座 | 終了境界 |
| TC-Z001-03 | 4/20 | 牡牛座 | 開始境界 |
| TC-Z001-04 | 5/20 | 牡牛座 | 終了境界 |
| TC-Z001-05 | 5/21 | 双子座 | 開始境界 |
| TC-Z001-06 | 6/21 | 双子座 | 終了境界 |
| TC-Z001-07 | 6/22 | 蟹座 | 開始境界 |
| TC-Z001-08 | 7/22 | 蟹座 | 終了境界 |
| TC-Z001-09 | 7/23 | 獅子座 | 開始境界 |
| TC-Z001-10 | 8/22 | 獅子座 | 終了境界 |
| TC-Z001-11 | 8/23 | 乙女座 | 開始境界 |
| TC-Z001-12 | 9/22 | 乙女座 | 終了境界 |
| TC-Z001-13 | 9/23 | 天秤座 | 開始境界 |
| TC-Z001-14 | 10/23 | 天秤座 | 終了境界 |
| TC-Z001-15 | 10/24 | 蠍座 | 開始境界 |
| TC-Z001-16 | 11/22 | 蠍座 | 終了境界 |
| TC-Z001-17 | 11/23 | 射手座 | 開始境界 |
| TC-Z001-18 | 12/21 | 射手座 | 終了境界 |
| TC-Z001-19 | 12/22 | 山羊座 | 開始境界 |
| TC-Z001-20 | 1/19 | 山羊座 | 終了境界（年跨ぎ） |
| TC-Z001-21 | 1/20 | 水瓶座 | 開始境界 |
| TC-Z001-22 | 2/18 | 水瓶座 | 終了境界 |
| TC-Z001-23 | 2/19 | 魚座 | 開始境界 |
| TC-Z001-24 | 3/20 | 魚座 | 終了境界 |

### TC-Z002: エレメント判定

| テストID | 星座 | 期待するエレメント |
|---------|------|----------------|
| TC-Z002-01 | 牡羊座 | 火 |
| TC-Z002-02 | 牡牛座 | 地 |
| TC-Z002-03 | 双子座 | 風 |
| TC-Z002-04 | 蟹座 | 水 |

### TC-Z003: 運勢スコア

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-Z003-01 | スコアが1〜5の範囲内 | 1 <= score <= 5 |
| TC-Z003-02 | 同日・同星座で同じスコア | score1 === score2 |
| TC-Z003-03 | 異なる日付で異なるスコア（高確率） | score1 !== score2 |

### TC-Z004: レスポンス形式

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-Z004-01 | 必須フィールドが全て存在する | sign, element, score, luckyColor, luckyItem, advice が存在 |
| TC-Z004-02 | fortuneType が "zodiac" | fortuneType === "zodiac" |

---

## 3. 単体テスト: 数秘術（numerology.service）

### TC-N001: 運命数算出

| テストID | 入力（生年月日） | 計算過程 | 期待する運命数 |
|---------|----------------|---------|-------------|
| TC-N001-01 | 1990-05-15 | 1+9+9+0+0+5+1+5=30 → 3+0=3 | 3 |
| TC-N001-02 | 1985-11-29 | 1+9+8+5+1+1+2+9=36 → 3+6=9 | 9 |
| TC-N001-03 | 2000-01-01 | 2+0+0+0+0+1+0+1=4 | 4 |
| TC-N001-04 | 1992-02-29 | 1+9+9+2+0+2+2+9=34 → 3+4=7 | 7 |

### TC-N002: マスターナンバー

| テストID | 入力 | 計算過程 | 期待する運命数 |
|---------|------|---------|-------------|
| TC-N002-01 | 合計が11になる日付 | → 11 | 11（1桁にしない） |
| TC-N002-02 | 合計が22になる日付 | → 22 | 22（1桁にしない） |
| TC-N002-03 | 合計が33になる日付 | → 33 | 33（1桁にしない） |

### TC-N003: 名前の数値化（ピタゴリアン変換）

| テストID | 入力（ローマ字） | 期待結果 |
|---------|----------------|---------|
| TC-N003-01 | "yamada" | 各文字変換 → 合計 → 1桁 |
| TC-N003-02 | "taro" | 各文字変換 → 合計 → 1桁 |
| TC-N003-03 | "" （空文字） | null or 0（名前なしでも動作） |

### TC-N004: レスポンス形式

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-N004-01 | 運命数が 1-9, 11, 22, 33 のいずれか | 有効な運命数 |
| TC-N004-02 | personalityTraits が配列 | Array.isArray() === true |
| TC-N004-03 | compatibility が配列 | Array.isArray() === true |

---

## 4. 単体テスト: 血液型占い（blood-type.service）

### TC-B001: 血液型バリデーション

| テストID | 入力 | 期待結果 |
|---------|------|---------|
| TC-B001-01 | "A" | 正常レスポンス |
| TC-B001-02 | "B" | 正常レスポンス |
| TC-B001-03 | "O" | 正常レスポンス |
| TC-B001-04 | "AB" | 正常レスポンス |
| TC-B001-05 | "C" | エラー（無効な血液型） |
| TC-B001-06 | "" | エラー（空文字） |

### TC-B002: レスポンス形式

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-B002-01 | personality が空でない文字列 | typeof === "string" && length > 0 |
| TC-B002-02 | score が 1〜5 の範囲 | 1 <= score <= 5 |
| TC-B002-03 | compatibilityRanking が4要素の配列 | length === 4 |
| TC-B002-04 | compatibilityRanking に A,B,O,AB が全て含まれる | 4種全て存在 |

---

## 5. 単体テスト: タロット占い（tarot.service）

### TC-T001: カード抽出

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-T001-01 | 3枚のカードが返される | cards.length === 3 |
| TC-T001-02 | 3枚が全て異なるカード | 重複なし（number が全て異なる） |
| TC-T001-03 | カード番号が 0〜21 の範囲 | 0 <= number <= 21 |
| TC-T001-04 | 各カードに正逆位置が設定されている | isReversed が boolean |

### TC-T002: スプレッド構成

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-T002-01 | 1枚目の position が "past" | cards[0].position === "past" |
| TC-T002-02 | 2枚目の position が "present" | cards[1].position === "present" |
| TC-T002-03 | 3枚目の position が "future" | cards[2].position === "future" |

### TC-T003: カードデータの完全性

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-T003-01 | 全カードに name が存在 | name が空でない文字列 |
| TC-T003-02 | 全カードに meaning が存在 | meaning が空でない文字列 |
| TC-T003-03 | 全カードに reversedMeaning が存在 | reversedMeaning が空でない文字列 |
| TC-T003-04 | 大アルカナ22枚のデータが存在 | 全22枚のマスタデータ |

### TC-T004: ランダム性

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-T004-01 | 複数回実行で異なる結果が出る | 10回中少なくとも2種類以上の結果 |

---

## 5.5 単体テスト: ダッシュボード（dashboard.service）

### TC-D001: ダッシュボード結果

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-D001-01 | レーダースコア（overall）が1〜5の範囲 | 1 <= radar.overall <= 5 |
| TC-D001-02 | レーダースコア（love）が1〜5の範囲 | 1 <= radar.love <= 5 |
| TC-D001-03 | レーダースコア（work）が1〜5の範囲 | 1 <= radar.work <= 5 |
| TC-D001-04 | レーダースコア（money）が1〜5の範囲 | 1 <= radar.money <= 5 |
| TC-D001-05 | zodiac サマリーが含まれる | zodiac.sign, zodiac.score 等が存在 |
| TC-D001-06 | numerology サマリーが含まれる | numerology.destinyNumber 等が存在 |
| TC-D001-07 | bloodType ありの場合にサマリーが含まれる | bloodType.bloodType 等が存在 |
| TC-D001-08 | bloodType なしの場合に null | bloodType === null |
| TC-D001-09 | tarot サマリーが含まれる | tarot.cards.length === 3 |
| TC-D001-10 | overallAdvice が空でない文字列 | typeof === "string" && length > 0 |

---

## 5.6 新占術のテストカバレッジ

Phase 9 で追加された12占術のテストカバレッジ状況。テスト総数は 75（バックエンド）+ 31（フロントエンド）+ 25（E2E）= **131件** のまま変更なし。新占術は既存の `fortune.test.ts` ルーティングテストでカバーされているが、各サービスの専用単体テストは未追加。

| 占術 | バックエンドテスト | 備考 |
|------|-------------------|------|
| 干支占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 九星気学 | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 動物占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 誕生花占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 誕生石占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 四柱推命 | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 曜日占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 風水占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| おみくじ | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| ルーン占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 夢占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |
| 手相占い | ルーティングテスト（fortune.test.ts内） | サービス単体テスト未追加 |

> **Note**: 各新占術サービスの境界値テスト・異常系テストは今後のフェーズで追加予定。

---

## 5.7 Management Console テスト（Phase 11）

EC2 ライフサイクル管理コンソール（Lambda + Step Functions + API Gateway + S3）のテストは、インフラレベルの統合テストとして手動で実施。

### TC-MGMT001: API Gateway エンドポイント

| テストID | アクション | 検証内容 | 期待結果 |
|---------|-----------|---------|---------|
| TC-MGMT001-01 | POST /manage `{"action":"status"}` | EC2 ステータス取得 | `{"instanceId":"...","state":"running","publicIp":"..."}` |
| TC-MGMT001-02 | POST /manage `{"action":"check_health"}` | ヘルスチェック | `{"healthy":true,"status":{"status":"ok"}}` |
| TC-MGMT001-03 | POST /manage `{"action":"stop"}` | EC2 停止 | `{"state":"stopping","message":"Stop command sent"}` |
| TC-MGMT001-04 | POST /manage `{"action":"start"}` | EC2 起動 | `{"state":"pending","message":"Start command sent"}` |
| TC-MGMT001-05 | POST /manage (API Key なし) | 認証エラー | 403 Forbidden |

### TC-MGMT002: EC2 ライフサイクル統合テスト

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-MGMT002-01 | 停止 → 状態確認 → stopped | ~110秒で stopped に遷移 |
| TC-MGMT002-02 | 起動 → ヘルスチェック → healthy | ~30秒で running + healthy |
| TC-MGMT002-03 | 起動後 CloudFront アクセス | 200 OK |
| TC-MGMT002-04 | 起動後 占い API 正常動作 | 動物占い結果取得成功 |

### TC-MGMT003: S3 管理コンソール UI

| テストID | 検証内容 | 期待結果 |
|---------|---------|---------|
| TC-MGMT003-01 | コンソール URL アクセス | 200 OK（HTML ページ表示） |
| TC-MGMT003-02 | ステータス表示 | EC2 状態・IP・インスタンス ID 表示 |
| TC-MGMT003-03 | 起動/停止ボタン | 確認ダイアログ後に実行 |

> **Note**: Management Console のテストはインフラ統合テスト（手動）として実施。Lambda 関数のユニットテストは今後のフェーズで追加予定。

---

## 6. APIテスト（supertest）

### TC-API001: 星座占いエンドポイント

| テストID | Method/Path | リクエスト | 期待 | 検証 |
|---------|------------|-----------|------|------|
| TC-API001-01 | POST /api/fortune/zodiac | `{"birthday":"1990-05-15"}` | 200 | 正常レスポンス |
| TC-API001-02 | POST /api/fortune/zodiac | `{}` | 400 | バリデーションエラー |
| TC-API001-03 | POST /api/fortune/zodiac | `{"birthday":"invalid"}` | 400 | 不正な日付 |

### TC-API002: 数秘術エンドポイント

| テストID | Method/Path | リクエスト | 期待 | 検証 |
|---------|------------|-----------|------|------|
| TC-API002-01 | POST /api/fortune/numerology | `{"birthday":"1990-05-15","name":"yamada taro"}` | 200 | 正常レスポンス |
| TC-API002-02 | POST /api/fortune/numerology | `{"birthday":"1990-05-15"}` | 200 | 名前なしでも動作 |
| TC-API002-03 | POST /api/fortune/numerology | `{}` | 400 | バリデーションエラー |

### TC-API003: 血液型占いエンドポイント

| テストID | Method/Path | リクエスト | 期待 | 検証 |
|---------|------------|-----------|------|------|
| TC-API003-01 | POST /api/fortune/blood-type | `{"bloodType":"A"}` | 200 | 正常レスポンス |
| TC-API003-02 | POST /api/fortune/blood-type | `{}` | 400 | バリデーションエラー |
| TC-API003-03 | POST /api/fortune/blood-type | `{"bloodType":"X"}` | 400 | 不正な血液型 |

### TC-API004: タロット占いエンドポイント

| テストID | Method/Path | リクエスト | 期待 | 検証 |
|---------|------------|-----------|------|------|
| TC-API004-01 | POST /api/fortune/tarot | `{}` | 200 | 正常レスポンス |

### TC-API005: ダッシュボードエンドポイント

| テストID | Method/Path | リクエスト | 期待 | 検証 |
|---------|------------|-----------|------|------|
| TC-API005-01 | POST /api/fortune/dashboard | `{"birthday":"1990-05-15","name":"yamada","bloodType":"A"}` | 200 | 正常レスポンス（全フィールド） |
| TC-API005-02 | POST /api/fortune/dashboard | `{"birthday":"1990-05-15"}` | 200 | name/bloodType省略可 |
| TC-API005-03 | POST /api/fortune/dashboard | `{}` | 400 | バリデーションエラー |

---

## 7. フロントエンド単体テスト（Jest + React Testing Library）

### TC-FE-UNIT: コンポーネント単体テスト（31ケース）

| テストスイート | テスト数 | 検証内容 |
|-------------|---------|---------|
| ScoreDisplay | 5 | 星5つ表示、aria-label、スコアクランプ(0-5)、小数の丸め |
| ResultCard | 3 | タイトル・children描画、section要素、h3見出し |
| ErrorState | 5 | デフォルト/カスタムエラー文、リトライコールバック、role=alert、戻るリンク |
| LoadingState | 4 | ローディングテキスト、role=status、aria-live=polite、戻るリンク |
| FortuneCard | 4 | タイトル・説明描画、リンク、無効状態メッセージ、aria-disabled |
| kana-to-romaji | 5 | 基本変換、長音、スペース区切り、空文字、濁音 |
| i18n | 5 | 日本語辞書取得、英語辞書取得、全キー一致、ロケール型 |

---

## 8. E2Eテスト（Playwright）

### TC-E2E: ブラウザ統合テスト（25ケース）

| テストスイート | テスト数 | 検証内容 |
|-------------|---------|---------|
| home.spec.ts | 4 | ヒーロー表示、4占術表示、未登録→profile遷移、登録済→fortune遷移 |
| profile.spec.ts | 6 | フォーム全項目表示、空送信バリデーション、非カタカナエラー、正常保存→fortune遷移、既存データロード、血液型トグル |
| fortune.spec.ts | 9 | 挨拶表示、4カード表示、星座/数秘/タロット遷移、プロフィール編集リンク、未登録リダイレクト、血液型未設定時の無効表示 |
| navigation.spec.ts | 6 | ヘッダー表示、ロゴ→ホーム遷移、スキップナビ、404表示、言語切替、見出し階層 |

---

## 9. 旧: 手動テスト（自動化済み）

以下のテストは E2E テスト (Playwright) に自動化移行済み。

| 旧テストID | 自動化先 |
|-----------|---------|
| TC-FE001 画面遷移 | home.spec.ts, fortune.spec.ts |
| TC-FE002 プロフィール入力 | profile.spec.ts |
| TC-FE003 占い結果表示 | fortune.spec.ts (遷移のみ、結果表示はバックエンド依存) |
| TC-FE004 レスポンシブ | 手動確認を継続 |

---

## 10. テスト実行コマンド

```bash
# バックエンド全テスト (75ケース)
cd backend && npm test

# フロントエンド単体テスト (31ケース)
cd frontend && npm test

# フロントエンド E2Eテスト (25ケース)
cd frontend && npm run test:e2e

# 特定テストのみ
cd backend && npm test -- --testPathPattern=zodiac
cd frontend && npm test -- --testPathPattern=ScoreDisplay

# カバレッジ付き
cd backend && npm test -- --coverage

# E2E UI モード（デバッグ用）
cd frontend && npm run test:e2e:ui
```
