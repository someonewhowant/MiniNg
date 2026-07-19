import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    swc.vite({
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
  ],
  esbuild: false,
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url))
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
