# Fortune Compass v1 仕様書（MVP）

## 1. スコープ

総合占いWebアプリケーション。AWS EC2 + k3s（軽量 Kubernetes）上で本番稼働中。

**URL**: https://d71oywvumn06c.cloudfront.net

### 実装済み機能
- ユーザー情報入力フォーム（バリデーション・アクセシビリティ対応）
- 星座占い
- 数秘術
- 血液型占い
- タロット占い（3枚引き・フリップアニメーション付き）
- 干支占い
- 九星気学
- 動物占い
- 誕生花占い
- 誕生石占い
- 曜日占い
- 風水占い
- 四柱推命
- おみくじ
- ルーン占い
- 夢占い
- 手相AI占い（Claude Vision API）
- 占術選択画面
- 個別占い結果表示
- 総合運勢ダッシュボード（4占術一括実行 + SVGレーダーチャート）
- 占い履歴（localStorage保存、最大50件、/history ページ）
- SNSシェア機能（X/LINE/Facebook/クリップボード）
- 結果→他占術直接遷移（OtherFortunes コンポーネント）
- SEO（sitemap.xml, robots.txt, JSON-LD構造化データ）
- WCAG AA色コントラスト準拠
- アドバイス文拡充（2〜3文）
- カタカナ→ローマ字変換精度向上（外来語音対応）
- パフォーマンス最適化（フォントウェイト指定、DNS prefetch）
- PWA 対応（manifest.json、アイコン）
- 多言語対応（日本語 / English）
- OGP / Twitter Card メタデータ + 動的OG画像生成
- カスタム404ページ
- Framer Motion アニメーション（ページ遷移、カード表示）
- Docker 化 + AWS EC2 + k3s デプロイ
- GitHub Actions CI/CD
- EC2 ライフサイクル管理コンソール（Lambda + Step Functions + API Gateway + S3）
- CloudFront /admin パス（管理コンソール HTTPS 化 + CF Function リライト）
- MediaConvert 動画変換パイプライン（S3 → Lambda → MP4+HLS 自動変換）
- セキュリティ監査（Security Hub / GuardDuty / Inspector / Config / Access Analyzer）
- Bedrock Agent 対話型占いコンシェルジュ（Claude 3 Haiku + OpenAPI Action Group）

- 相性占い（星座・血液型・数秘の3軸相性診断）
- 運勢トレンド（7日間折れ線グラフ）
- AI総合鑑定（Anthropic SDK による全占い結果統合分析）
- 月相ボーナス（タロット・おみくじ・ルーンに月齢修正）
- 天文学的黄道十二宮（太陽黄経による正確な星座判定）
- 旧暦・二十四節気（九星気学・風水の立春対応）
- 四柱推命 時柱（3柱→4柱化、生まれ時刻対応）
- プロフィール拡張（生まれ時刻・性別の任意入力）

### 未実装（将来対応）
- 今日の運勢バッチ処理
- DynamoDB / ユーザー認証

---

## 2. 技術スタック

| レイヤー | 技術 | バージョン |
|---------|------|-----------|
| フロントエンド | Next.js (App Router) | 16.1.6 |
| UI | Tailwind CSS + Lucide React | 4.x / 0.564.x |
| アニメーション | Framer Motion | 12.x |
| バックエンド | Express + TypeScript | 5.2.x |
| データ保持 | ブラウザ localStorage | - |
| テスト (Backend) | Jest + Supertest | 30.x |
| テスト (Frontend) | Jest + React Testing Library | 30.x / 16.x |
| E2E テスト | Playwright (Chromium) | 1.58.x |
| インフラ | Terraform + AWS EC2 + k3s | >= 1.5 |
| サーバーレス | AWS Lambda (Python 3.12) + Step Functions + API Gateway | EC2 管理 |
| CI/CD | GitHub Actions (OIDC → ECR → SSH + kubectl) | - |
| 開発実行 | `npm run dev`（concurrentlyで同時起動） | - |

- フロントエンド: ポート 3000
- バックエンド: ポート 8080

---

## 3. 画面一覧

| # | 画面名 | パス | 概要 |
|---|--------|------|------|
| 1 | トップページ | `/` | アプリ紹介、各占術への導線 |
| 2 | ユーザー情報入力 | `/profile` | 名前・生年月日・血液型の入力 |
| 3 | 占術選択 | `/fortune` | 19種の占術から選択 |
| 4 | 星座占い結果 | `/fortune/zodiac` | 星座占いの結果表示 |
| 5 | 数秘術結果 | `/fortune/numerology` | 数秘術の結果表示 |
| 6 | 血液型占い結果 | `/fortune/blood-type` | 血液型占いの結果表示 |
| 7 | タロット結果 | `/fortune/tarot` | タロット3枚引きの結果表示 |
| 8 | 干支占い結果 | `/fortune/eto` | 干支占いの結果表示 |
| 9 | 九星気学結果 | `/fortune/kyusei` | 九星気学の結果表示 |
| 10 | 動物占い結果 | `/fortune/animal` | 動物占いの結果表示 |
| 11 | 誕生花占い結果 | `/fortune/birth-flower` | 誕生花占いの結果表示 |
| 12 | 誕生石占い結果 | `/fortune/birthstone` | 誕生石占いの結果表示 |
| 13 | 四柱推命結果 | `/fortune/shichuu` | 四柱推命の結果表示 |
| 14 | 曜日占い結果 | `/fortune/weekday` | 曜日占いの結果表示 |
| 15 | 風水占い結果 | `/fortune/fengshui` | 風水占いの結果表示 |
| 16 | おみくじ結果 | `/fortune/omikuji` | おみくじの結果表示 |
| 17 | ルーン占い結果 | `/fortune/rune` | ルーン占いの結果表示 |
| 18 | 夢占い結果 | `/fortune/dream` | 夢占いの結果表示 |
| 19 | 手相占い結果 | `/fortune/palm` | 手相AI占いの結果表示 |
| 20 | 総合運勢ダッシュボード | `/fortune/dashboard` | 4占術一括実行 + レーダーチャート |
| 21 | 占い履歴 | `/history` | 過去の占い結果一覧（最大50件） |
| 22 | ヘルスチェック | `/health` | フロントエンドヘルスチェック |
| 23 | 相性占い | `/fortune/compatibility` | 2人の相性診断結果表示 |
| 24 | 運勢トレンド | `/fortune/trends` | 7日間運勢推移グラフ |
| 25 | AI総合鑑定 | `/fortune/ai-reading` | AI生成の総合鑑定文表示 |
| 26 | 404エラー | `/*` (不明パス) | カスタム404ページ |

---

## 4. API設計

### 4.1 エンドポイント

| Method | Path | 概要 |
|--------|------|------|
| GET | `/api/health` | ヘルスチェック（k3s readiness probe 用） |
| POST | `/api/fortune/zodiac` | 星座占い実行 |
| POST | `/api/fortune/numerology` | 数秘術実行 |
| POST | `/api/fortune/blood-type` | 血液型占い実行 |
| POST | `/api/fortune/tarot` | タロット占い実行 |
| POST | `/api/fortune/eto` | 干支占い実行 |
| POST | `/api/fortune/kyusei` | 九星気学実行 |
| POST | `/api/fortune/animal` | 動物占い実行 |
| POST | `/api/fortune/birth-flower` | 誕生花占い実行 |
| POST | `/api/fortune/birthstone` | 誕生石占い実行 |
| POST | `/api/fortune/weekday` | 曜日占い実行 |
| POST | `/api/fortune/fengshui` | 風水占い実行 |
| POST | `/api/fortune/shichuu` | 四柱推命実行 |
| POST | `/api/fortune/omikuji` | おみくじ実行 |
| POST | `/api/fortune/rune` | ルーン占い実行 |
| POST | `/api/fortune/dream` | 夢占い実行 |
| POST | `/api/fortune/palm` | 手相占い（AI）実行 |
| POST | `/api/fortune/compatibility` | 相性占い実行 |
| POST | `/api/fortune/trends` | 運勢トレンド（7日間）実行 |
| POST | `/api/fortune/ai-reading` | AI総合鑑定実行 |
| POST | `/api/fortune/dashboard` | 総合ダッシュボード（4占術一括） |

フロントエンドヘルスチェック: `GET /health`（Next.js Route Handler）

※ プロフィールはlocalStorageのみで管理するため、プロフィールAPIは不要。

### 4.2 リクエスト / レスポンス

#### POST `/api/fortune/zodiac`
```json
// Request
{
  "birthday": "1990-05-15"
}

// Response
{
  "fortuneType": "zodiac",
  "sign": "牡牛座",
  "signEn": "taurus",
  "element": "地",
  "score": 4,
  "luckyColor": "グリーン",
  "luckyItem": "観葉植物",
  "advice": "新しい出会いに恵まれる一日です。"
}
```

#### POST `/api/fortune/numerology`
```json
// Request
{
  "birthday": "1990-05-15",
  "name": "yamada taro"
}

// Response
{
  "fortuneType": "numerology",
  "destinyNumber": 7,
  "personalityTraits": ["知的", "分析的", "内省的"],
  "yearFortune": "成長と学びの年",
  "compatibility": [2, 4],
  "advice": "自分の直感を信じて行動しましょう。"
}
```

#### POST `/api/fortune/blood-type`
```json
// Request
{
  "bloodType": "A"
}

// Response
{
  "fortuneType": "blood-type",
  "bloodType": "A",
  "personality": "几帳面で真面目、協調性が高い",
  "score": 4,
  "compatibilityRanking": ["A", "AB", "O", "B"],
  "advice": "周囲との調和を大切にする一日です。"
}
```

#### POST `/api/fortune/tarot`
```json
// Request
{}

// Response
{
  "fortuneType": "tarot",
  "spread": "three-card",
  "cards": [
    {
      "position": "past",
      "positionLabel": "過去",
      "name": "愚者",
      "nameEn": "The Fool",
      "number": 0,
      "arcana": "major",
      "isReversed": false,
      "meaning": "新しい始まり、自由、冒険心",
      "reversedMeaning": "無謀、不注意、愚かさ"
    },
    {
      "position": "present",
      "positionLabel": "現在",
      "name": "女帝",
      "nameEn": "The Empress",
      "number": 3,
      "arcana": "major",
      "isReversed": true,
      "meaning": "豊かさ、母性、創造性",
      "reversedMeaning": "過保護、依存、停滞"
    },
    {
      "position": "future",
      "positionLabel": "未来",
      "name": "星",
      "nameEn": "The Star",
      "number": 17,
      "arcana": "major",
      "isReversed": false,
      "meaning": "希望、インスピレーション、再生",
      "reversedMeaning": "失望、悲観、自信喪失"
    }
  ],
  "overallMessage": "過去の冒険心が今の試練を経て、未来に希望の光をもたらすでしょう。"
}
```

#### POST `/api/fortune/eto`
```json
// Request
{
  "birthday": "1990-05-15"
}

// Response
{
  "fortuneType": "eto",
  "eto": "午",
  "etoKana": "うま",
  "etoEmoji": "🐴",
  "personality": "行動力があり社交的。情熱的で決断力がある。",
  "score": 4,
  "compatibility": ["寅", "戌"],
  "luckyColor": "赤",
  "advice": "持ち前の行動力を活かして新しいことに挑戦しましょう。"
}
```

#### POST `/api/fortune/fengshui`
```json
// Request
{
  "birthday": "1990-05-15",
  "gender": "male"
}

// Response
{
  "fortuneType": "fengshui",
  "guaNumber": 7,
  "guaName": "兌",
  "group": "西四命",
  "favorableDirections": {
    "shengQi": "北西",
    "tianYi": "南西",
    "yanNian": "北東",
    "fuWei": "西"
  },
  "unfavorableDirections": {
    "huo_hai": "東",
    "liu_sha": "南",
    "wu_gui": "北",
    "jue_ming": "南東"
  },
  "luckyColor": "ゴールド",
  "advice": "西の方角にデスクを向けると仕事運がアップします。"
}
```

#### POST `/api/fortune/dream`
```json
// Request
{
  "keyword": "猫"
}

// Response
{
  "fortuneType": "dream",
  "keyword": "猫",
  "category": "動物",
  "meaning": "猫の夢は直感力や女性的なエネルギーの象徴です。",
  "score": 4,
  "advice": "自分の直感を信じて行動すると良い結果が得られるでしょう。",
  "relatedKeywords": ["犬", "動物", "ペット"]
}
```

#### POST `/api/fortune/palm`
```json
// Request
{
  "image": "base64string"
}

// Response
{
  "fortuneType": "palm",
  "lines": {
    "lifeLine": "生命線は長く力強いカーブを描いています。",
    "headLine": "頭脳線は直線的で、論理的思考の持ち主です。",
    "heartLine": "感情線は緩やかに上昇し、安定した感情表現を示します。",
    "fateLine": "運命線は明確で、強い目的意識を持っています。"
  },
  "overallReading": "バランスの取れた手相です。生命力に溢れ、理性と感情の調和が取れています。",
  "score": 4,
  "advice": "持ち前の安定感を活かし、長期的な計画を立てると良いでしょう。"
}
```

#### POST `/api/fortune/dashboard`
```json
// Request
{
  "birthday": "1990-05-15",
  "name": "yamada taro",
  "bloodType": "A"
}

// Response
{
  "fortuneType": "dashboard",
  "radar": {
    "overall": 4,
    "love": 3,
    "work": 5,
    "money": 3
  },
  "zodiac": { "sign": "牡牛座", "element": "地", "score": 4, "advice": "..." },
  "numerology": { "destinyNumber": 3, "personalityTraits": [...], "advice": "..." },
  "bloodType": { "bloodType": "A", "score": 4, "advice": "..." },
  "tarot": { "cards": [...], "overallMessage": "..." },
  "overallAdvice": "今日は全体的にバランスの良い一日です..."
}
```

---

## 5. 占いロジック詳細

### 5.1 星座占い

**判定ロジック:**
| 星座 | 期間 |
|------|------|
| 牡羊座 | 3/21 - 4/19 |
| 牡牛座 | 4/20 - 5/20 |
| 双子座 | 5/21 - 6/21 |
| 蟹座 | 6/22 - 7/22 |
| 獅子座 | 7/23 - 8/22 |
| 乙女座 | 8/23 - 9/22 |
| 天秤座 | 9/23 - 10/23 |
| 蠍座 | 10/24 - 11/22 |
| 射手座 | 11/23 - 12/21 |
| 山羊座 | 12/22 - 1/19 |
| 水瓶座 | 1/20 - 2/18 |
| 魚座 | 2/19 - 3/20 |

**運勢スコア生成:** 日付 + 星座をシードとした擬似ランダム（毎日変わるが同日同星座なら同じ結果）

**出力項目:** 星座名、エレメント（火/地/風/水）、スコア(1-5)、ラッキーカラー、ラッキーアイテム、アドバイス

### 5.2 数秘術

**運命数算出:**
1. 生年月日の各桁を合計（例: 1990-05-15 → 1+9+9+0+0+5+1+5 = 30 → 3+0 = 3）
2. マスターナンバー（11, 22, 33）はそのまま保持
3. 1桁になるまで繰り返す

**名前の数値化（任意）:**
- ローマ字の各文字をピタゴリアン変換（A=1, B=2, ... Z=8 のサイクル）
- 合計して1桁にする → ソウルナンバー

**出力項目:** 運命数、性格特徴、年運メッセージ、相性の良い運命数、アドバイス

### 5.3 血液型占い

**判定:** 入力された血液型（A/B/O/AB）に対応する固定データ + 日替わり運勢スコア

**出力項目:** 性格特徴、スコア(1-5)、相性ランキング、アドバイス

### 5.4 タロット占い

**カード構成（MVP）:** 大アルカナ22枚のみ（小アルカナは将来対応）

**スプレッド:** 3枚引き（過去・現在・未来）
- 22枚から重複なしで3枚をランダム抽出
- 各カードに50%の確率で正位置/逆位置を付与

**出力項目:** 3枚のカード情報（名前・番号・正逆・意味）、総合メッセージ

### 5.5 総合運勢ダッシュボード

**アルゴリズム:**
1. 4占術（星座・数秘術・血液型・タロット）を一括実行
2. レーダースコア（1〜5）を以下のロジックで算出:
   - 総合運: 星座スコア + 血液型スコアの平均
   - 恋愛運: シード乱数 + タロット「恋人」カードボーナス
   - 仕事運: シード乱数 + 数秘術の仕事系特性ボーナス
   - 金運: シード乱数 + ポジティブタロットカードボーナス
3. 総合アドバイスをスコア平均に基づいて生成

**出力項目:** レーダースコア（4軸）、各占術サマリー、総合アドバイス

### 5.6 干支占い

**判定ロジック:** 生年から十二支を判定
- `(生年 - 4) % 12` のインデックスで十二支を決定
- 子(ね)、丑(うし)、寅(とら)、卯(う)、辰(たつ)、巳(み)、午(うま)、未(ひつじ)、申(さる)、酉(とり)、戌(いぬ)、亥(い)

**出力項目:** 十二支名、読み仮名、絵文字、性格特徴、スコア(1-5)、相性の良い干支、ラッキーカラー、アドバイス

### 5.7 九星気学

**判定ロジック:** 生年から九星を判定
- `(11 - (生年 - 3) % 9) % 9` で九星インデックスを算出（0の場合は9）
- 一白水星、二黒土星、三碧木星、四緑木星、五黄土星、六白金星、七赤金星、八白土星、九紫火星

**出力項目:** 九星名、五行属性、本命星、性格特徴、スコア(1-5)、吉方位、ラッキーカラー、アドバイス

### 5.8 動物占い

**判定ロジック:** 個性心理學（弦本將裕）に基づく60キャラクター判定
- JDN（ユリウス日）からExcelシリアル値を算出し、`(serial + 8) % 60 + 1` でキャラナンバー（1〜60）を決定
- 12種の動物（チータ・たぬき・猿・コアラ・黒ひょう・虎・こじか・ゾウ・狼・ひつじ・ペガサス・ライオン）に各4〜6キャラが属する
- 3グループ分類: SUN（太陽）/ EARTH（地球）/ MOON（月）

**出力項目:** 動物名、カラー、キャラクター名、グループ名、グループ説明、性格特徴、スコア(1-5)、相性の良い動物、アドバイス

### 5.9 誕生花占い

**判定ロジック:** 生年月日から365日分の誕生花データを参照
- 月日をキーとして花のデータを取得
- 各日に対応する花名、花言葉、性格特徴を定義

**出力項目:** 誕生花名、花言葉、花の画像キー、性格特徴、スコア(1-5)、ラッキーカラー、アドバイス

### 5.10 誕生石占い

**判定ロジック:** 生月から12月分の誕生石データを参照
- 月をキーとして石のデータを取得
- 各月に対応する石名、石言葉、パワーストーン効果を定義

**出力項目:** 誕生石名、石言葉、石の画像キー、パワー効果、スコア(1-5)、ラッキーカラー、アドバイス

### 5.11 曜日占い

**判定ロジック:** ツェラーの合同式（Zeller's congruence）で生年月日の曜日を算出
- `h = (q + ⌊13(m+1)/5⌋ + K + ⌊K/4⌋ + ⌊J/4⌋ - 2J) mod 7`
- 1月・2月は前年の13月・14月として計算
- 7曜日（日〜土）それぞれに性格特徴と運勢を定義

**出力項目:** 生まれた曜日、曜日の象徴、性格特徴、スコア(1-5)、ラッキーカラー、ラッキーナンバー、アドバイス

### 5.12 四柱推命

**判定ロジック:** 天干地支 + ユリウス日から年柱・月柱・日柱・時柱を算出
1. ユリウス日数を算出して日柱の天干地支を求める
2. 年柱: `(生年 - 4) % 60` で六十干支のインデックスを決定
3. 月柱: 年干と月から月柱を算出
4. 日柱: ユリウス日数から日干支を決定
5. 時柱: 日干 × 時刻（2時間単位の十二支）から時干を決定（birthTime指定時のみ）
6. 十天干（甲乙丙丁戊己庚辛壬癸）と十二地支の組み合わせ

**出力項目:** 年柱、月柱、日柱、時柱（任意）、天干、地支、五行バランス、性格特徴、運勢傾向、アドバイス

### 5.13 風水占い

**判定ロジック:** 本命卦（Gua Number）を算出
1. 生年の下2桁を合計し1桁にする
2. 男性: `(10 - 合計値)` で本命卦、女性: `(合計値 + 5)` で本命卦
3. 結果が5の場合、男性は2（坤）、女性は8（艮）に置換
4. 東四命（1, 3, 4, 9）と西四命（2, 6, 7, 8）に分類
5. 八方位の吉凶（生気・天医・延年・伏位・禍害・六殺・五鬼・絶命）を決定

**出力項目:** 卦数、卦名、東西命グループ、吉方位4つ、凶方位4つ、ラッキーカラー、アドバイス

### 5.14 おみくじ

**判定ロジック:** 重み付きランダムで7段階の運勢を決定
- 大吉(15%)、吉(25%)、中吉(20%)、小吉(15%)、末吉(10%)、凶(10%)、大凶(5%)
- 各段階に複数のメッセージパターンを用意
- 日付 + 名前（任意）をシードとして結果を安定化

**出力項目:** 運勢（7段階）、全体運、恋愛運、仕事運、金運、健康運、ラッキーアイテム、ラッキーカラー、アドバイス

### 5.15 ルーン占い

**判定ロジック:** 24ルーン（エルダーフサルク）から3石を選択
- 24個のルーン文字からランダムに3つを重複なしで抽出
- 3石スプレッド（過去・現在・未来）として配置
- 各ルーンに正位置・逆位置（50%）を付与
- 日付 + 名前（任意）をシードとして結果を安定化

**出力項目:** 3つのルーン（名前・文字・位置・意味）、総合メッセージ、アドバイス

### 5.16 夢占い

**判定ロジック:** キーワード検索による夢の意味解釈
- ユーザーが入力したキーワードを夢辞典データベースから検索
- 部分一致・関連キーワードでも結果を返す
- カテゴリ（動物、自然、人物、行動、場所など）ごとに分類

**出力項目:** キーワード、カテゴリ、夢の意味、スコア(1-5)、アドバイス、関連キーワード

### 5.17 手相占い（AI）

**判定ロジック:** Claude Vision APIを使用した画像解析
1. ユーザーがアップロードした手のひら画像をBase64エンコード
2. Claude Vision API に画像を送信し、手相の各線を解析
3. 生命線、頭脳線、感情線、運命線の4大線を解釈
4. 総合的な手相リーディングを生成

**出力項目:** 各線の解釈（生命線・頭脳線・感情線・運命線）、総合リーディング、スコア(1-5)、アドバイス

### 5.18 相性占い

**判定ロジック:** 2人のプロフィールから3軸の相性スコアを算出
1. 星座相性: 2人の星座のエレメント（火/地/風/水）の相性を判定（40%重み）
2. 血液型相性: 4×4の相性テーブルからスコアを取得（30%重み）
3. 数秘術相性: 9×9の相性テーブルから運命数の相性を判定（30%重み）
4. 総合スコア = 加重平均（血液型未指定時は星座57%+数秘43%）

**出力項目:** 総合スコア(1-100)、星座相性スコア、血液型相性スコア、数秘術相性スコア、2人の星座、アドバイス、詳細メッセージ

### 5.19 運勢トレンド

**判定ロジック:** 今日を中心に前後3日の運勢推移を計算
1. -3日〜+3日の7日間について、各日のダッシュボード相当スコアを算出
2. 既存の `seededScore` に日付をずらしたシードを使用
3. 4カテゴリ（総合・恋愛・仕事・金運）を算出
4. 最高日・最低日を特定

**出力項目:** 7日分のスコア（日付・ラベル・4カテゴリ各スコア）、最高日、最低日、アドバイス

### 5.20 AI総合鑑定

**判定ロジック:** 全占い結果を統合し、Claude APIで自然言語の総合鑑定文を生成
1. 内部で星座・数秘術・九星気学・四柱推命・タロットを呼び出し
2. 結果をプロンプトに組み込み、Anthropic SDK で Claude API 呼び出し
3. モデル: `claude-sonnet-4-5-20250929`、max_tokens: 2000
4. JSON形式でレスポンスを解析

**出力項目:** 総合鑑定文、注目ポイント3つ、おすすめアクション、参照した占い種別名

---

## 6. データ構造（localStorage）

### ユーザープロフィール
```json
{
  "key": "fortune-compass-profile",
  "value": {
    "name": "山田太郎",
    "nameKana": "ヤマダタロウ",
    "nameRomaji": "yamada tarou",
    "birthday": "1990-05-15",
    "bloodType": "A",
    "birthTime": "14:30",
    "gender": "male"
  }
}
```

### 占い履歴
```json
{
  "key": "fortune-compass-history",
  "value": [
    {
      "fortuneType": "zodiac",
      "date": "2026-02-17T12:00:00.000Z",
      "result": { "sign": "牡牛座", "score": 4, ... }
    }
  ]
}
```
- 最大50件保持（FIFO）
- `useFortune` フック内で自動保存

---

## 7. ディレクトリ構成

```
fortune-compass/
├── package.json              # ルート（concurrently）
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions CI/CD
├── infra/terraform/          # AWS インフラ (Terraform)
├── docs/                     # 設計ドキュメント
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── jest.config.ts        # Jest 設定
│   ├── playwright.config.ts  # Playwright E2E 設定
│   ├── Dockerfile            # 本番コンテナ
│   ├── __tests__/            # ユニットテスト (31ケース)
│   ├── e2e/                  # E2Eテスト (25ケース)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── manifest.json     # PWA マニフェスト
│   │   └── icon-*.svg        # PWA アイコン
│   └── src/
│       ├── app/
│       │   ├── layout.tsx        # ルートレイアウト (OGP, PWA, JSON-LD, viewport)
│       │   ├── page.tsx          # トップページ
│       │   ├── not-found.tsx     # カスタム404
│       │   ├── opengraph-image.tsx # 動的OG画像
│       │   ├── sitemap.ts        # sitemap.xml 生成
│       │   ├── robots.ts         # robots.txt 生成
│       │   ├── health/           # ヘルスチェック
│       │   ├── profile/
│       │   │   └── page.tsx      # プロフィール入力
│       │   ├── history/
│       │   │   └── page.tsx      # 占い履歴一覧
│       │   └── fortune/
│       │       ├── page.tsx      # 占術選択（ダッシュボードバナー付き）
│       │       ├── dashboard/    # 総合運勢ダッシュボード
│       │       ├── zodiac/       # 星座占い結果
│       │       ├── numerology/   # 数秘術結果
│       │       ├── blood-type/   # 血液型占い結果
│       │       ├── tarot/        # タロット結果
│       │       ├── eto/          # 干支占い結果
│       │       ├── kyusei/       # 九星気学結果
│       │       ├── animal/       # 動物占い結果
│       │       ├── birth-flower/ # 誕生花占い結果
│       │       ├── birthstone/   # 誕生石占い結果
│       │       ├── shichuu/      # 四柱推命結果
│       │       ├── weekday/      # 曜日占い結果
│       │       ├── fengshui/     # 風水占い結果
│       │       ├── omikuji/      # おみくじ結果
│       │       ├── rune/         # ルーン占い結果
│       │       ├── dream/        # 夢占い結果
│       │       └── palm/         # 手相AI占い結果
│       ├── components/
│       │   ├── Header.tsx        # ヘッダー（履歴リンク付き）
│       │   ├── LanguageSwitcher.tsx # 言語切替
│       │   ├── motion/           # Framer Motion
│       │   └── fortune/          # 占い関連
│       │       ├── FortuneCard.tsx
│       │       ├── ScoreDisplay.tsx
│       │       ├── LoadingState.tsx
│       │       ├── ErrorState.tsx
│       │       ├── ResultCard.tsx
│       │       ├── OtherFortunes.tsx  # 他占術ショートカット
│       │       ├── ShareButtons.tsx   # SNSシェアボタン
│       │       └── RadarChart.tsx     # SVGレーダーチャート
│       └── lib/
│           ├── types.ts          # 型定義
│           ├── api-client.ts     # API呼び出し（19占術 + ダッシュボード）
│           ├── storage.ts        # localStorage操作
│           ├── useFortune.ts     # 占い共通フック（履歴自動保存付き）
│           ├── kana-to-romaji.ts # カタカナ→ローマ字変換（外来語音対応）
│           ├── history.ts        # 占い履歴管理（localStorage）
│           ├── fortune-registry.ts # 占術レジストリ（19占術の定義・メタ情報）
│           └── i18n/             # 多言語対応 (ja/en)
├── backend/
│   ├── package.json
│   ├── Dockerfile            # 本番コンテナ
│   ├── src/
│   │   ├── index.ts          # Express (:8080) + ヘルスチェック
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── zodiac.ts
│   │   │   ├── numerology.ts
│   │   │   ├── blood-type.ts
│   │   │   ├── tarot.ts
│   │   │   ├── dashboard.ts     # ダッシュボード（4占術統合）
│   │   │   ├── eto.ts           # 干支占い
│   │   │   ├── kyusei.ts        # 九星気学
│   │   │   ├── animal.ts        # 動物占い
│   │   │   ├── birth-flower.ts  # 誕生花占い
│   │   │   ├── birthstone.ts    # 誕生石占い
│   │   │   ├── weekday.ts       # 曜日占い
│   │   │   ├── fengshui.ts      # 風水占い
│   │   │   ├── shichuu.ts       # 四柱推命
│   │   │   ├── omikuji.ts       # おみくじ
│   │   │   ├── rune.ts          # ルーン占い
│   │   │   ├── dream.ts         # 夢占い
│   │   │   └── palm.ts          # 手相AI占い
│   │   └── data/
│   │       ├── eto-data.ts      # 十二支データ
│   │       ├── kyusei-data.ts   # 九星データ
│   │       ├── animal-data.ts   # 動物占いデータ（60パターン）
│   │       ├── birth-flower-data.ts # 誕生花データ（365日）
│   │       ├── birthstone-data.ts   # 誕生石データ（12月）
│   │       ├── weekday-data.ts  # 曜日データ
│   │       ├── fengshui-data.ts # 風水データ（八卦・方位）
│   │       ├── shichuu-data.ts  # 四柱推命データ（天干地支）
│   │       ├── omikuji-data.ts  # おみくじデータ（7段階×複数パターン）
│   │       ├── rune-data.ts     # ルーンデータ（24文字）
│   │       └── dream-data.ts    # 夢辞典データ
│   └── __tests__/            # テスト (75ケース)
└── docs/
```

---

## 8. UI方針

- **テーマ:** 神秘的・宇宙的な雰囲気（ダークベース + 紫/金のアクセント）
- **レスポンシブ:** モバイルファースト
- **アニメーション:** Framer Motion（ページ遷移、カードスタガー表示、タロットフリップ）
- **フォント:** Inter（英数字）+ Noto Sans JP（日本語）
- **アクセシビリティ:** ARIA属性、スキップナビ、フォーカスリング、セマンティックHTML
- **多言語:** 日本語 / English 切替（クライアントサイドContext）
- **PWA:** ホーム画面追加対応（manifest.json）

---

## 9. テスト

| 種別 | ツール | 件数 |
|------|-------|------|
| バックエンド単体 + API | Jest + Supertest | 75 |
| フロントエンド単体 | Jest + React Testing Library | 31 |
| E2E | Playwright (Chromium) | 25 |
| **合計** | | **131** |

```bash
# バックエンドテスト
cd backend && npm test

# フロントエンド ユニットテスト
cd frontend && npm test

# フロントエンド E2Eテスト
cd frontend && npm run test:e2e
```

---

## 10. デプロイ

AWS EC2 + k3s + CloudFront 構成。GitHub Actions で CI/CD。

- `master` ブランチへの push で自動デプロイ
- バックエンドテスト → Docker ビルド → ECR push → SSH + kubectl set image
- URL: https://d71oywvumn06c.cloudfront.net
