// デモ用のアプリ設定（localStorage 保存）

export interface AppSettings {
  /** タイマー短縮モード（面接デモ用に待ち時間を短縮する） */
  demoSpeed: boolean
}

const SETTINGS_KEY = 'dopalock:settings'
const defaults: AppSettings = { demoSpeed: true }

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaults, ...(JSON.parse(raw) as Partial<AppSettings>) } : defaults
  } catch {
    return defaults
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // 無視
  }
}

export function setDemoSpeed(on: boolean): void {
  saveSettings({ ...loadSettings(), demoSpeed: on })
}
