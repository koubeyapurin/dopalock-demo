# 引き継ぎ書（DopaLock デモアプリ）

最終更新：2026-07-14 ／ 対象コミット：`37ac179`（`origin/main` と同一、作業ツリーはクリーン）

---

## 1. このプロジェクトは何か

**LEVEL UP STAGE 2026 の面接審査で見せるためのデモ Web アプリ**です。
本番運用ではなく、DopaLock（スマホ封印型の自習サービス）の**体験価値を審査員に伝えるプロトタイプ**です。

- 仕様書：[docs/SPEC.md](SPEC.md)（実装の基準。迷ったらここ）
- 開発ルール：[CLAUDE.md](../CLAUDE.md)
- デモ手順：[README.md](../README.md)（面接で見せるおすすめ操作手順あり）

**現状：全12画面が実装済みで、通しの体験フローが動きます。**

---

## 2. 起動・デプロイ

```bash
npm install
npm run dev      # 開発（http://localhost:5173）
npm run build    # 型チェック(tsc) + 本番ビルド
npm run preview  # ビルド成果物を確認
npm run preview -- --host   # スマホ実機から同じWi-Fiで確認する場合
```

**デプロイ**：`.github/workflows/deploy.yml` により、**`main` に push すれば GitHub Actions が自動デプロイ**します。
リポジトリ：`https://github.com/koubeyapurin/dopalock-demo`

```bash
git add -A && git commit -m "..." && git push origin main   # これだけで反映される
```

---

## 3. 技術構成と「壊してはいけない」制約

React + TypeScript / Vite / Tailwind CSS / react-router-dom / lucide-react / recharts / localStorage
（バックエンド・認証は無し）

### GitHub Pages 対応（重要・触らないこと）
- `vite.config.ts` の **`base: './'`**
- `src/main.tsx` の **`HashRouter`**

この2点セットでサブパス配信が成立しています。**絶対パスでのハード遷移（`window.location.href = '/'` など）を書くと壊れます。** 画面遷移は必ず `<Link>` / `useNavigate()` を使ってください（過去に一度これで壊して修正済み）。

---

## 4. ディレクトリ構成

```
src/
  components/   共通UI（Card, StatCard, Button系, IconBadge, StatusPill,
                CircularTimer, HistoryList, SessionCard, ConfirmDialog,
                ReflectionForm …）＋ index.ts で集約export
  layout/       AppLayout（ルートガード）/ Sidebar（PC）/ BottomNav（スマホ）
  pages/        13画面（12画面 + 検証データ）
  utils/        sessionCalc.ts（計算）/ storage.ts（永続化）
                sessionRuntime.ts（進行中セッション）/ settings.ts（デモ設定）
                demo.ts（ワンクリック開始・全リセット）
  hooks/        useSessionResult.ts（結果確定）/ useIsMobile.ts
                useAwayDetection.ts（タブ離脱検知）
  types/        index.ts（全型定義）
  data/         mockData.ts（初期データ）
```

今後の実装計画（QRチェックイン・ロッカー・DP交換・待機ルーム）は [docs/ROADMAP.md](ROADMAP.md)。

---

## 5. 中核ロジック（ここを理解すれば全体が分かる）

### 5-1. 計算ルール（`utils/sessionCalc.ts`）
```
予定獲得レート = 2.0 × 時間/60 × 利用形態倍率 × モード倍率   （小数第1位に丸め）
予定獲得DP     = 6   × 時間/60 × 利用形態倍率 × モード倍率   （整数に丸め）
脱獄時         = 予定レートの80%を失う（rateChange はマイナス）／DPは0
```
- 利用形態倍率：どこでも 1.0／提携 1.2／直営 1.5
- モード倍率：個人 1.0／協力 1.1／バトル 1.3
- **「脱獄で予定レートの80%を失う」はエントリーシート記載の設定なので変更しないこと。**
- `npm run dev` すると、開発時のみコンソールに計算のセルフテスト表が出ます。

### 5-2. localStorage のキー
| キー | 中身 | 消えるタイミング |
|---|---|---|
| `dopalock:userStats` | レート・DP・チケット・成功/脱獄回数など | 設定のリセット |
| `dopalock:sessionRecords` | セッション履歴の配列 | 設定のリセット |
| `dopalock:currentSession` | 進行中の `SessionConfig` | 結果確定時・リセット |
| `dopalock:sessionRuntime` | 進行中の経過秒・チケット残 | 結果確定時・リセット |
| `dopalock:lastResult` | 直近の結果サマリー | リセット |
| `dopalock:settings` | タイマー短縮モード | リセット |

未保存時は `data/mockData.ts` の初期値にフォールバックします（＝リセット後も正常動作）。

### 5-3. セッション中のロック（`utils/sessionRuntime.ts` + `layout/AppLayout.tsx`）
進行中は**「完了する」「脱獄する」以外で画面を離れられません**。

- `isSessionActive()` = **`sessionRuntime` と `currentSession` の両方が存在する**とき true
- `AppLayout` がルートガードとして働き、進行中は許可4ルート
  （`/session/focus` `/session/break` `/session/success` `/session/jailbreak`）**以外を集中画面へ強制リダイレクト**
  → ブラウザバック・URL直打ちでも抜けられない
- `/session/new` は `/session/` 配下だが**意図的に許可していない**（進行中の二重作成防止）
- Sidebar / BottomNav は `locked` プロップで無効化され「🔒 セッション進行中」を表示

> ⚠️ **`isSessionActive()` の判定から config のチェックを外さないこと。**
> runtime だけ残った不整合状態でロックすると、集中画面（config が無いと `/session/new` へ退避する）とガードが往復して**無限リダイレクト**します。

### 5-4. 結果の二重加算防止（`hooks/useSessionResult.ts`）
結果画面をリロードしてもレート・DPが再加算されないよう、3段構えになっています。
1. `processed` ref（StrictMode の二重実行対策）
2. 確定時に runtime / config を削除 → 以後は「未処理の実行状態なし」と判定
3. リロード時は `lastResult` を読んで**表示のみ**

### 5-5. 学習目標・振り返り・離脱検知（2026-07-14 追加）
- **学習目標**：セッション作成時に入力 →`SessionConfig.goal`（任意フィールド）→ 記録にコピー
- **振り返り**：結果画面の `ReflectionForm` から目標達成度・集中度（1〜5）・メモを入力。
  **既存レコードへの上書き保存（`saveReflection`）なので、レート・DPは再加算されない**
- **離脱検知**：`useAwayDetection` が `visibilitychange` のみを見る。
  window の blur を使うとモーダル表示や DevTools で誤検知するため、**blur は使わないこと**
- これらの新フィールドは**すべて optional**。旧 localStorage データもそのまま読める
- Web では他アプリを制御できない旨を、集中画面と検証データ画面に明記している（**消さないこと**）

### 5-6. デモ用タイマー短縮（`utils/settings.ts` + `sessionRuntime.ts`）
- 設定画面の**「タイマー短縮モード」ON（初期値）で、表示1分 ≈ 実3秒**
- **画面には常に本来の分数（30/60/90/120分）を表示**する。ここは崩さないこと
- 実装：`DISPLAY_SECONDS_PER_TICK = 2`、`TICK_MS = 100`

---

## 6. レスポンシブ方針（2026-07-14 対応済み）

- **サイドバー ⇄ 下部ナビの切替は `lg`（1024px）**
  → `md`（768px）でサイドバーを出すと本文が512pxに圧迫されタブレットで崩れるため、意図的に `lg` にしている
- **コンテンツのグリッドは `md`（768px）基準**（`grid-cols-1 md:grid-cols-3` など）
- 履歴・ダッシュボードの**テーブルはスマホでは非表示にし、`SessionCard` のカード一覧に差し替え**
- 円形タイマー・グラフのX軸ラベルは `useIsMobile()` で数値・文言を切り替え
- `AppLayout` に `overflow-x-hidden`、下部ナビ分の `pb-28`

375 / 390 / 430 / 768px で横スクロールが出ないことを確認済み。

---

## 7. 既知の注意点・落とし穴

- `FocusSessionPage` / `BreakPage` の Rules of Hooks 違反は**解消済み**。
  外側で `loadSessionConfig()` を見て `<Navigate>` し、中身（フックを持つ本体）に config を渡す形にしている。
  **この2段構えを1つのコンポーネントに戻さないこと。**
- **Sidebar の DP は「画面遷移時」にしか更新されない**（グローバル状態を持たず、描画時に localStorage を読む方式）。
  同一画面内で DP が変わるケース（チケット画面の +1 など）ではサイドバーは即時更新されない。デモ上は問題なし。
- **デモデータのリセットは `window.location.reload()` を伴う**（各画面が描画時に localStorage を読むため）。
  `reload()` はハッシュ込みの現在 URL を読み直すだけなので GitHub Pages でも安全。
  ここを `window.location.href = '/'` に書き換えると**サブパス配信が壊れる**。
- **ランキングは全て仮データ**（自分の順位だけ実データと合成）。
- **検証データ画面の初期表示にはシード履歴が含まれる**（振り返り未入力なので集中度は「—」になる）。
  面接で数字を見せたいなら、リセット後にセッションを2〜3本回して振り返りを入力しておく。
- ビルド時に **チャンクサイズ 500kB 超の警告**が出るが、recharts 同梱によるもので無害。
- 面接前は **設定 → デモデータをリセット** を実行して初期状態から始めるのが安全。

---

## 8. 次にやるとしたら

必須の残作業はありません（全画面実装済み・ビルド通過・デプロイ自動化済み）。

次の実装候補（QRチェックイン／ロッカー／DP交換／待機ルーム）の設計は [docs/ROADMAP.md](ROADMAP.md) に切り出してあります。
そのほか細かい改善：

- 実機（iPhone 実物）での最終確認。特に**セッション中のロック挙動**とタップ感
- 実績バッジを実データ（連続成功回数など）から判定する（現状はダッシュボードの固定表示）
- recharts を動的 import してバンドル分割（体感速度は現状でも問題なし）

---

## 9. 会話の作法（CLAUDE.md より）

- 回答・説明は**日本語**
- 実装前に**短い計画**を出す
- 1回で大きく変更しすぎない／既存ファイルを大幅に壊さない
- **`git commit` は明示的に依頼されるまで行わない**
- UI は画像を貼らず **React コンポーネントで再現**する
