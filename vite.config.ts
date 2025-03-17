import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '',  // 상대 경로 사용
  build: {
    outDir: 'build',
    assetsDir: 'assets',  // 정적 파일이 저장될 폴더
    rollupOptions: {
      input: {
        main: 'index.html'  // index.html을 번들링에 포함
      }
    }
  }
})
