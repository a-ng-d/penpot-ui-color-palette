import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import preact from '@preact/preset-vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isPlugin = process.env.IS_PLUGIN === 'true'

  return {
    plugins: [
      preact(),
      sentryVitePlugin({
        org: 'yelbolt',
        project: 'ui-color-palette',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
      /*visualizer({
        open: true,
        filename: 'dist/stats.html',
      }),*/
      // basicSsl(),
    ],

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
        '@ui-lib': path.resolve(
          __dirname,
          './packages/ui-ui-color-palette/src'
        ),
      },
    },

    build: {
      sourcemap: isDev,
      minify: !isDev,
      outDir: 'dist',
      watch: isDev ? {} : null,
      emptyOutDir: false,
      ...(isPlugin
        ? {
            lib: {
              entry: 'src/index.ts',
              name: 'PenpotPlugin',
              fileName: () => 'plugin.js',
              formats: ['iife'],
            },
          }
        : {
            rollupOptions: {
              input: 'index.html',
              output: {
                dir: 'dist',
                entryFileNames: '[name].js',
                assetFileNames: 'assets/[name].[hash][extname]',
              },
            },
          }),
    },
    preview: {
      port: 4400,
      watch: {
        usePolling: false,
        ignored: ['**/node_modules/**', '!**/node_modules/@a_ng_d/**'],
      },
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 4400,
        clientPort: 4400,
        timeout: 20000,
        overlay: true,
        preserveState: false,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }
})
