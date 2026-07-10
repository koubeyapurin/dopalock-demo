interface PagePlaceholderProps {
  title: string
  description?: string
}

/** 各画面の土台。仮タイトルのみ表示する（UI は後続で実装）。 */
export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold text-navy">{title}</h1>
      {description && <p className="mt-2 text-slate-500">{description}</p>}
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center text-slate-400 shadow-card">
        この画面は準備中です（土台のみ）
      </div>
    </div>
  )
}
