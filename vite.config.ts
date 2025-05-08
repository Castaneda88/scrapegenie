import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src', // 👈 tells Vite to treat /src as the root
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
