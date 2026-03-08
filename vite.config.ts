import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const ext = 'C:/dev/petapp-portal-deps/node_modules';

// Map every dependency to its location in the external node_modules (Google Drive workaround)
const deps = [
  'react',
  'react-dom',
  'react-router-dom',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom/client',
  '@supabase/supabase-js',
  '@tanstack/react-query',
  '@tanstack/react-table',
  '@hookform/resolvers',
  'react-hook-form',
  'recharts',
  'lucide-react',
  'date-fns',
  'framer-motion',
  'html5-qrcode',
  'react-datepicker',
  'zod',
];

const alias = deps.map((dep) => ({
  find: dep,
  replacement: path.resolve(ext, dep),
}));

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,  // Different port from Part A (5173)
  },
  resolve: {
    alias,
  },
  optimizeDeps: {
    esbuildOptions: {
      nodePaths: [ext],
    },
  },
});
