// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-space-mono)', 'monospace'],
      },
      colors: {
        ink: '#09090B',
        canvas: '#FAFAFA',
        muted: '#A1A1AA',
        dim: '#52525B',
      },
    },
  },
  plugins: [],
};

export default config;
