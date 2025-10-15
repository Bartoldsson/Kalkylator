import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/Kalkylator/', // change to '/<repo>/' for GitHub Pages
})
