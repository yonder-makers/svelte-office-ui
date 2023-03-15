import { resolve } from 'path';
import { defineConfig } from 'vite';

import config from './tsconfig.json';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import legacy from '@vitejs/plugin-legacy';

const alias = Object.entries(config.compilerOptions.paths)
  .reduce((acc,[key, [value]]) => {
  const aliasKey = key.substring(0, key.length)
  const path = value.substring(0, value.length)
  return {
    ...acc,
    [aliasKey]: resolve(__dirname, path)
  }
}, {});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  resolve: {
    alias
  },
  build: {
    target: "es2015"
  },
  server: {
    port: 5000
  },
  preview: {
    port: 5001
  }
})