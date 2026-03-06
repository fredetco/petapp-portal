import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire('file:///C:/dev/petapp-portal-deps/package.json');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

export default {
  plugins: [
    tailwindcss(path.resolve(__dirname, 'tailwind.config.js')),
    autoprefixer,
  ],
};
