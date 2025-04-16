import * as Sentry from '@sentry/react'
import mixpanel from 'mixpanel-figma'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isDev, mode, theme } from '../config'

const container = document.getElementById('app'),
  root = createRoot(container)

document.documentElement.setAttribute('data-theme', theme)
document.documentElement.setAttribute('data-mode', mode)

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN ?? '', {
  debug: isDev,
  disable_persistence: true,
  disable_cookie: true,
  opt_out_tracking_by_default: true,
})

Sentry.init({
  dsn: isDev ? undefined : import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      colorScheme: 'system',
      autoInject: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})

root.render(<App />)
