# Fortune Compass デザインシステム

## 1. カラーパレット

### プライマリカラー
| 用途 | カラー名 | HEX | 使用箇所 |
|------|---------|-----|---------|
| 背景（メイン） | Midnight | `#0f0a1e` | ページ全体の背景 |
| 背景（カード） | Deep Purple | `#1a1333` | カード、モーダル |
| 背景（サーフェス） | Twilight | `#251d3d` | 入力フィールド、ホバー状態 |

### アクセントカラー
| 用途 | カラー名 | HEX | 使用箇所 |
|------|---------|-----|---------|
| メインアクセント | Mystic Purple | `#8b5cf6` | ボタン、リンク、アクティブ状態 |
| サブアクセント | Celestial Gold | `#f5c542` | スコア、星、重要な数値 |
| 成功 | Aurora Green | `#34d399` | 高スコア、成功メッセージ |
| 警告 | Ember Orange | `#fb923c` | 中スコア、注意 |
| エラー | Crimson | `#f43f5e` | 低スコア、エラー |

### テキストカラー
| 用途 | HEX | 使用箇所 |
|------|-----|---------|
| テキスト（プライマリ） | `#f0edf6` | 見出し、本文 |
| テキスト（セカンダリ） | `#a89ec4` | 補足テキスト、ラベル |
| テキスト（ミュート） | `#6b6183` | プレースホルダー、無効状態 |

### グラデーション
```css
/* メインボタン・CTA */
--gradient-primary: linear-gradient(135deg, #8b5cf6, #6d28d9);

/* カードのボーダー装飾 */
--gradient-border: linear-gradient(135deg, #8b5cf6, #f5c542);

/* 背景装飾（薄く使用） */
--gradient-bg: radial-gradient(ellipse at top, #251d3d 0%, #0f0a1e 70%);
```

---

## 2. タイポグラフィ

### フォント
| 用途 | フォント | ウェイト |
|------|---------|---------|
| 日本語 | Noto Sans JP | 400, 500, 700 |
| 英数字・装飾 | Inter | 400, 500, 600, 700 |

### フォントサイズ（Tailwind CSS）
| 名前 | サイズ | 行間 | 用途 |
|------|-------|------|------|
| text-xs | 12px | 16px | 注釈 |
| text-sm | 14px | 20px | 補足テキスト、ラベル |
| text-base | 16px | 24px | 本文 |
| text-lg | 18px | 28px | サブ見出し |
| text-xl | 20px | 28px | セクション見出し |
| text-2xl | 24px | 32px | ページ見出し |
| text-3xl | 30px | 36px | ヒーロータイトル |
| text-4xl | 36px | 40px | トップページメインタイトル |

---

## 3. スペーシング

Tailwind CSSのデフォルトスペーシングスケールを使用。

| 基準 | 値 |
|------|---|
| コンポーネント内パディング | `p-4`（16px） |
| カード間のギャップ | `gap-4` 〜 `gap-6` |
| セクション間マージン | `my-8` 〜 `my-12` |
| ページ左右パディング | `px-4`（モバイル）/ `px-8`（デスクトップ） |
| ページ最大幅 | `max-w-4xl`（896px） |

---

## 4. コンポーネント仕様

### 4.1 ボタン

**プライマリボタン**
- 背景: `gradient-primary`
- テキスト: 白
- 角丸: `rounded-lg`（8px）
- パディング: `px-6 py-3`
- ホバー: opacity 90% + shadow
- 無効: opacity 50%, cursor-not-allowed

**セカンダリボタン**
- 背景: 透明
- ボーダー: `border border-purple-500`
- テキスト: `#8b5cf6`
- ホバー: `bg-purple-500/10`

**ゴーストボタン**
- 背景: 透明
- テキスト: セカンダリテキスト色
- ホバー: `bg-white/5`

### 4.2 カード

```
┌─────────────────────────┐
│  背景: #1a1333          │
│  角丸: rounded-xl (12px)│
│  パディング: p-6        │
│  ボーダー: border       │
│  border-purple-500/20   │
│  ホバー: border色を明るく│
│  シャドウ: shadow-lg    │
└─────────────────────────┘
```

### 4.3 入力フィールド

- 背景: `#251d3d`
- ボーダー: `border-purple-500/30`
- フォーカス: `border-purple-500` + `ring-2 ring-purple-500/20`
- テキスト: プライマリテキスト色
- プレースホルダー: ミュートテキスト色
- 角丸: `rounded-lg`
- パディング: `px-4 py-3`

### 4.4 スコア表示

星アイコン（★）で1〜5段階を表示。

| スコア | 色 | 意味 |
|-------|---|------|
| 5 | `#f5c542`（金） | 最高 |
| 4 | `#34d399`（緑） | 好調 |
| 3 | `#8b5cf6`（紫） | 普通 |
| 2 | `#fb923c`（橙） | やや注意 |
| 1 | `#f43f5e`（赤） | 注意 |

### 4.5 占術カード（選択画面用）

各占術を表すカードコンポーネント。

- サイズ: 幅均等のグリッド（2列 x 2行、モバイルは1列）
- アイコン: 各占術の絵文字またはSVGアイコン
  - 星座: `☆` / 星アイコン
  - 数秘術: `🔢` / 数字アイコン
  - 血液型: `💧` / 水滴アイコン
  - タロット: `🃏` / カードアイコン
- ホバー: ボーダーのグラデーション表示 + 微かに浮く（translateY -2px）

### 4.6 ナビゲーション

- ヘッダー固定（sticky top-0）
- 背景: `#0f0a1e` + `backdrop-blur`
- 高さ: `h-16`（64px）
- ロゴ左寄せ、ナビリンク右寄せ
- モバイル: ハンバーガーメニュー（MVP では簡易リンクのみ）

---

## 5. アイコン

[Lucide React](https://lucide.dev/) を使用。

| 用途 | アイコン名 |
|------|-----------|
| 星座 | `Star` |
| 数秘術 | `Hash` |
| 血液型 | `Droplet` |
| タロット | `Layers` |
| 戻る | `ArrowLeft` |
| プロフィール | `User` |
| スコア（満） | `Star`（fill） |
| スコア（空） | `Star`（outline） |
| 設定 | `Settings` |
| 保存 | `Save` |
| 言語切替 | `Globe` |
| コンパス (404) | `Compass` |

---

## 6. レスポンシブ ブレークポイント

Tailwind CSS デフォルトを使用。

| ブレークポイント | 幅 | 用途 |
|----------------|-----|------|
| デフォルト | 0px〜 | モバイル |
| `sm` | 640px〜 | 大きめモバイル |
| `md` | 768px〜 | タブレット |
| `lg` | 1024px〜 | デスクトップ |

### レイアウト切り替え
- 占術選択カード: 1列（モバイル）→ 2列（sm以上）
- 結果画面: 1カラム（モバイル）→ サイドバー付き（lg以上、将来対応）

---

## 7. アニメーション / トランジション

Framer Motion を導入済み。CSS トランジションと併用。

| 対象 | アニメーション | 仕様 |
|------|-------------|------|
| ボタンホバー | opacity + shadow | `transition-all duration-200` |
| ボタンタップ | scale | `whileTap={{ scale: 0.97 }}` (Framer Motion) |
| カードホバー | translateY + border色 | `transition-all duration-200 hover:-translate-y-0.5` |
| トップページ | ヒーローフェードイン + 星回転 | Framer Motion `initial/animate` |
| 占術選択 | カードスタガー表示 | Framer Motion `staggerChildren: 0.1` |
| タロットカード | フリップアニメーション | Framer Motion `rotateY: 90→0` |
| ページ遷移 | フェード + スライド | PageTransition コンポーネント |
| スコア表示 | フェードイン | `animate-fade-in`（カスタム） |

### Framer Motion コンポーネント
| コンポーネント | ファイル | 用途 |
|--------------|---------|------|
| PageTransition | `components/motion/PageTransition.tsx` | ページフェード+スライド |
| StaggerContainer / StaggerItem | `components/motion/StaggerChildren.tsx` | 順次表示 |
| CardReveal | `components/motion/CardReveal.tsx` | カードスケール+フェード |

---

## 8. Tailwind CSS カスタム設定

```ts
// tailwind.config.ts で追加する設定
{
  theme: {
    extend: {
      colors: {
        midnight: '#0f0a1e',
        'deep-purple': '#1a1333',
        twilight: '#251d3d',
        'mystic-purple': '#8b5cf6',
        'celestial-gold': '#f5c542',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
}
```
