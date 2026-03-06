import { createRequire } from 'module';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Resolve paths relative to this config file (works from any working directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use local deps path if available (Google Drive workaround), otherwise standard resolution
const depsPath = 'C:/dev/petapp-portal-deps/package.json';
const req = existsSync(depsPath)
  ? createRequire(`file:///${depsPath}`)
  : createRequire(import.meta.url);

const forms = req('@tailwindcss/forms');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    resolve(__dirname, './index.html'),
    resolve(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        portal: {
          // Primary — Deep Blue (trust / professional)
          primary: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A5F',
          },
          // Accent — Warm Amber (brand continuity with main app)
          accent: {
            400: '#FBBF24',
            500: '#E4963A',
            600: '#C47520',
          },
          // Surfaces
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          sidebar: '#1E293B',
          'sidebar-hover': '#334155',
          'sidebar-text': '#E2E8F0',
          'sidebar-muted': '#94A3B8',
        },
        // Category colors (shared with main app)
        health: '#EF4444',
        grooming: '#8B5CF6',
        habitat: '#06B6D4',
        daily_care: '#F59E0B',
        // Status
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        '2xl': '16px',
        xl: '12px',
      },
    },
  },
  plugins: [forms],
};
