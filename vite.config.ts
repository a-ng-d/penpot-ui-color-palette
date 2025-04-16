import preact from '@preact/preset-vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'
  const isPlugin = process.env.IS_PLUGIN === 'true'
  const isHot = process.env.IS_HOT === 'true'

  return {
    plugins: [
      preact(),
      sentryVitePlugin({
        org: 'yelbolt',
        project: 'ui-color-palette',
        authToken: env.SENTRY_AUTH_TOKEN,
      }),
    ],

    resolve: {
      alias: {
        react: 'preact/compat',
        'react-dom/test-utils': 'preact/test-utils',
        'react-dom': 'preact/compat',
        'react/jsx-runtime': 'preact/jsx-runtime',
      },
    },

    build: {
      sourcemap: isDev,
      minify: !isDev,
      outDir: 'dist',
      watch: isHot ? {} : null,
      emptyOutDir: false,
      ...(isPlugin
        ? {
            // Configuration pour le build du plugin
            lib: {
              entry: 'src/index.ts',
              name: 'PenpotPlugin',
              fileName: () => 'plugin.js',
              formats: ['iife'],
            },
          }
        : {
            // Configuration pour le build de développement
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
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  }
})
