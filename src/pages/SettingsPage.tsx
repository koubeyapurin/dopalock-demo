import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, RotateCcw, Settings as SettingsIcon, User, Zap } from 'lucide-react'
import { Card, IconBadge, DangerButton, PageHeader, SectionTitle } from '../components'
import { loadSettings, setDemoSpeed } from '../utils/settings'
import { clearDemoData, clearLastResult, clearSessionConfig, loadUserStats } from '../utils/storage'
import { clearSessionRuntime } from '../utils/sessionRuntime'

export default function SettingsPage() {
  const navigate = useNavigate()
  const user = loadUserStats()
  const [demoSpeed, setDemo] = useState(() => loadSettings().demoSpeed)

  const toggleDemoSpeed = () => {
    const next = !demoSpeed
    setDemoSpeed(next)
    setDemo(next)
  }

  const handleReset = () => {
    const ok = window.confirm(
      'デモデータを初期状態にリセットします。よろしいですか？\n（実績・履歴・進行中セッションがすべて初期化されます）',
    )
    if (!ok) return
    clearDemoData()
    clearSessionRuntime()
    clearSessionConfig()
    clearLastResult()
    // ホームへ戻る（各ページは描画時に localStorage を読み直すので初期値に戻る）
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="設定" description="デモ用の設定です。" icon={SettingsIcon} />

      {/* プロフィール */}
      <Card>
        <SectionTitle title="プロフィール" icon={User} />
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-50">
            <User className="h-7 w-7 text-brand-500" />
          </span>
          <div>
            <p className="text-lg font-bold text-navy">{user.name}</p>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <GraduationCap className="h-4 w-4" />
              {user.grade}
            </p>
          </div>
        </div>
      </Card>

      {/* デモ設定 */}
      <Card className="mt-4">
        <SectionTitle title="デモ設定" icon={Zap} />

        {/* タイマー短縮モード */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <IconBadge icon={Zap} tone="amber" size="sm" />
            <div>
              <p className="text-sm font-semibold text-navy">タイマー短縮モード</p>
              <p className="text-xs text-slate-500">
                面接デモ用に待ち時間を短縮します（表示は本来の分数のまま）。
              </p>
            </div>
          </div>
          <Toggle on={demoSpeed} onClick={toggleDemoSpeed} />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {demoSpeed
            ? 'ON：表示1分がおよそ実3秒で進みます。'
            : 'OFF：ほぼ実時間で進みます（デモ中は待ち時間が長くなります）。'}
        </p>
      </Card>

      {/* データ管理 */}
      <Card className="mt-4">
        <SectionTitle title="データ管理" icon={RotateCcw} />
        <p className="mt-3 text-sm text-slate-600">
          レート・DP・履歴・チケットなどの保存データ（localStorage）を初期状態に戻します。
          デモをやり直したいときに使用してください。
        </p>
        <DangerButton
          icon={RotateCcw}
          size="lg"
          fullWidth
          className="mt-4 md:w-auto"
          onClick={handleReset}
        >
          デモデータをリセット
        </DangerButton>
      </Card>
    </div>
  )
}

/** ON/OFF トグルスイッチ */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        on ? 'bg-brand-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
          on ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  )
}
