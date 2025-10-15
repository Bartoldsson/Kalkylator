import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: 'https://bartoldsson.github.io/Kalkylator/', // change to '/<repo>/' for GitHub Pages
})
