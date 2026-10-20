import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  // Development stays at /; built assets target the GitHub Pages repository.
  base: command === 'build' || isPreview ? '/tieto-bid-projects/' : '/',
}))

