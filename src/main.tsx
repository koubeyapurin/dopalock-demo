import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { runSessionCalcSelfTest } from './utils/sessionCalc'

// 開発時のみ、計算ロジックの動作確認をコンソールに出力する
if (import.meta.env.DEV) {
  runSessionCalcSelfTest()
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
