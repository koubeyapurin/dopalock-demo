import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  BookOpen,
  Building2,
  Check,
  Coins,
  Home,
  Lock,
  MapPin,
  Smartphone,
  Store,
  Swords,
  Ticket,
  TrendingUp,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Card, IconBadge, PageHeader, PrimaryButton, SecondaryButton, SectionTitle } from '../components'

export default function RulesPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="DopaLockのルール"
        description="DopaLockは、あなたの集中時間を「実績」として記録し、成長を可視化するサービスです。"
        icon={BookOpen}
      />

      {/* 基本3カード */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <BasicCard
          icon={TrendingUp}
          tone="blue"
          title="レートとは？"
          body="あなたの集中力の強さを表すスコアです。セッションを成功させると上がり、脱獄すると下がります。"
          tag="単位：DP / 30分"
        />
        <BasicCard
          icon={Coins}
          tone="green"
          title="DPとは？"
          body="集中セッションの成果として獲得できるポイントです。DPはアイテム交換や特別な特典に利用できます。"
          tag="単位：DP"
        />
        <BasicCard
          icon={Ticket}
          tone="blue"
          title="5分チケットとは？"
          body="セッション中に5分間だけスマホ確認ができるチケットです。集中を続けるためのサポートアイテムです。"
          tag="所持数はダッシュボードで確認"
        />
      </div>

      {/* 利用形態 */}
      <Card className="mt-6">
        <SectionTitle title="利用形態（どこでDopaLockを使うか）" icon={MapPin} />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Smartphone}
            tone="blue"
            title="どこでも DopaLock"
            body="自宅・図書館・カフェなど、好きな場所で利用できます。"
            points={['最も自由度が高いプラン', '通信での見守り機能を利用']}
          />
          <FeatureCard
            icon={Store}
            tone="green"
            title="提携店舗 DopaLock"
            body="カフェやコワーキングスペースなど提携している店舗で利用できます。"
            points={['快適な学習環境を提供', '店舗限定の特典あり']}
          />
          <FeatureCard
            icon={Building2}
            tone="navy"
            title="直営店舗 DopaLock"
            body="DopaLockが運営する自習室で利用できます。"
            points={['専用ロッカーでスマホを封印', '最も高い集中サポート体験']}
          />
        </div>
      </Card>

      {/* モード */}
      <Card className="mt-6">
        <SectionTitle title="モード（集中のスタイルを選ぶ）" icon={Users} />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <FeatureCard
            icon={User}
            tone="blue"
            title="個人モード"
            body="自分のペースで集中に取り組む基本のモードです。"
            points={['自分の目標に集中', 'はじめての方におすすめ']}
          />
          <FeatureCard
            icon={Users}
            tone="green"
            title="協力モード"
            body="友達や仲間と協力して集中時間を積み上げるモードです。"
            points={['お互いに応援・サポート', '一緒に目標達成を目指す']}
          />
          <FeatureCard
            icon={Swords}
            tone="navy"
            title="バトルモード"
            body="他のユーザーと集中時間を競う対戦型のモードです。"
            points={['ランキングで競い合う', '勝利でボーナスDP獲得']}
          />
        </div>
      </Card>

      {/* 脱獄ペナルティ ＋ 初期実証 */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ペナルティ */}
        <Card className="border-red-100 bg-red-50/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-red-600">脱獄（集中でスマホを確認）すると？</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            途中でスマホを確認してしまった場合、そのセッションの予定レートの80%を失います。
          </p>
          <p className="mt-2 text-4xl font-bold text-red-500">80%</p>
          <div className="mt-3 rounded-xl bg-white p-3 text-sm">
            <p className="font-semibold text-slate-500">ペナルティの例</p>
            <p className="mt-1 text-slate-600">
              予定レート <span className="font-bold">+2.0 DP/30分</span> の場合
            </p>
            <p className="text-red-500">→ <span className="font-bold">-1.6 DP/30分</span> のペナルティ</p>
          </div>
        </Card>

        {/* 初期実証 */}
        <Card className="border-brand-100 bg-brand-50/40">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-600" />
            <h2 className="text-lg font-bold text-navy">初期実証について</h2>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            DopaLockは、より良いサービスを目指して初期実証を行います。
          </p>
          <div className="mt-4 space-y-2">
            <InfoRow icon={MapPin} label="実施エリア" value="調布周辺" />
            <InfoRow icon={Users} label="対象人数" value="10〜20人程度の大学生" />
          </div>
          <p className="mt-4 text-sm text-slate-600">
            皆さんのフィードバックが、サービスの改善と成長につながります。ご協力をよろしくお願いいたします！
          </p>
        </Card>
      </div>

      {/* その他ルール */}
      <Card className="mt-6">
        <SectionTitle title="その他のルール（まとめ）" icon={Check} />
        <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 md:grid-cols-2">
          {[
            'セッション時間は30分単位で設定できます（30/60/90/120分）',
            '不正行為が確認された場合、アカウント停止の対象となります',
            '5分チケットはセッション中にのみ使用可能です',
            '災害や体調不良など、やむを得ない場合はサポートへ連絡ください',
            '通信やロッカーで集中を見守り、公平性を保ちます',
            'ルールは予告なく変更する場合があります',
          ].map((text) => (
            <div key={text} className="flex items-start gap-2 text-sm text-slate-600">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 下部CTA */}
      <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <SecondaryButton icon={Home} size="lg" onClick={() => navigate('/')}>
          ホームに戻る
        </SecondaryButton>
        <PrimaryButton icon={Lock} size="lg" onClick={() => navigate('/session/new')}>
          セッションを開始する
        </PrimaryButton>
      </div>
    </div>
  )
}

/** 基本用語カード（レート・DP・チケット） */
function BasicCard({
  icon,
  title,
  body,
  tag,
  tone,
}: {
  icon: LucideIcon
  title: string
  body: string
  tag: string
  tone: 'blue' | 'green'
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-center gap-2.5">
        <IconBadge icon={icon} tone={tone} size="sm" shape="circle" />
        <h3 className="text-base font-bold text-navy">{title}</h3>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">{body}</p>
      <span className="mt-4 self-start rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
        {tag}
      </span>
    </Card>
  )
}

/** 利用形態・モードの説明カード */
function FeatureCard({
  icon,
  title,
  body,
  points,
  tone,
}: {
  icon: LucideIcon
  title: string
  body: string
  points: string[]
  tone: 'blue' | 'green' | 'navy'
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center gap-2.5">
        <IconBadge icon={icon} tone={tone} size="sm" />
        <h3 className="text-sm font-bold text-navy">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{body}</p>
      <ul className="mt-3 space-y-1.5">
        {points.map((p) => (
          <li key={p} className="flex items-center gap-1.5 text-xs text-slate-600">
            <Check className="h-3.5 w-3.5 shrink-0 text-teal-500" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 初期実証の情報行 */
function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-brand-600" />
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  )
}
