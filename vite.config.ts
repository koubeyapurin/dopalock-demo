import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages（プロジェクトサイト）でも動くよう相対パスで出力する
  base: './',
  plugins: [react()],
})
