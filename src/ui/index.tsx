import { createRoot } from 'react-dom/client'
import React from 'react'
import mixpanel from 'mixpanel-browser'
import App from '@ui-lib/ui/App'
import { initMixpanel, setMixpanelEnv } from '@ui-lib/external/tracking/client'
import { initSentry } from '@ui-lib/external/monitoring/client'
import { initSupabase } from '@ui-lib/external/auth/client'
import { ThemeProvider } from '@ui-lib/config/ThemeContext'
import { ConfigProvider } from '@ui-lib/config/ConfigContext'
import * as Sentry from '@sentry/react'
import globalConfig from '../global.config'

const container = document.getElementById('app'),
  root = createRoot(container)

const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN
const sentryDsn = import.meta.env.VITE_SENTRY_DSN
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY

if (globalConfig.env.isMixpanelEnabled && mixpanelToken !== undefined) {
  mixpanel.init(mixpanelToken, {
    api_host: 'https://api-eu.mixpanel.com',
    debug: globalConfig.env.isDev,
    disable_persistence: true,
    disable_cookie: true,
    ignore_dnt: true,
    opt_out_tracking_by_default: true,
  })
  mixpanel.opt_in_tracking()

  setMixpanelEnv(import.meta.env.MODE as 'development' | 'production')
  initMixpanel(mixpanel)
}

if (
  globalConfig.env.isMixpanelEnabled &&
  !globalConfig.env.isDev &&
  sentryDsn !== undefined
) {
  Sentry.init({
    dsn: sentryDsn,
    environment: 'production',
    initialScope: {
      tags: { platform: globalConfig.env.platform },
    },
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
        autoInject: false,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 0.1,
  })

  initSentry(Sentry)
} else {
  const devLogger = {
    captureException: (error: Error) => {
      console.group('🐛 Dev Error Logger')
      console.error(error)
      console.groupEnd()
    },
    captureMessage: (message: string) => {
      console.group('📝 Dev Message Logger')
      console.info(message)
      console.groupEnd()
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).Sentry = devLogger
}

if (globalConfig.env.isSupabaseEnabled && supabaseAnonKey !== undefined)
  initSupabase(globalConfig.urls.databaseUrl, supabaseAnonKey)

window.addEventListener('message', (event) => {
  const data = event.data
  const pluginEvent = new CustomEvent('pluginMessage', {
    detail: data,
  })
  window.dispatchEvent(pluginEvent)
})

root.render(
  <ConfigProvider
    limits={{
      pageSize: globalConfig.limits.pageSize,
    }}
    env={{
      platform: globalConfig.env.platform,
      ui: globalConfig.env.ui,
      colorMode: globalConfig.env.colorMode,
      editor: globalConfig.env.editor,
      isDev: globalConfig.env.isDev,
      isSupabaseEnabled: globalConfig.env.isSupabaseEnabled,
      isMixpanelEnabled: globalConfig.env.isMixpanelEnabled,
      isSentryEnabled: globalConfig.env.isSentryEnabled,
      announcementsDbId: globalConfig.env.announcementsDbId,
      onboardingDbId: globalConfig.env.onboardingDbId,
      pluginId: globalConfig.env.pluginId,
    }}
    plan={{
      isProEnabled: globalConfig.plan.isProEnabled,
      isTrialEnabled: globalConfig.plan.isTrialEnabled,
      trialTime: globalConfig.plan.trialTime,
    }}
    dbs={{
      palettesDbTableName: globalConfig.dbs.palettesDbTableName,
      palettesStorageName: globalConfig.dbs.palettesStorageName,
    }}
    urls={{
      authWorkerUrl: globalConfig.urls.authWorkerUrl,
      announcementsWorkerUrl: globalConfig.urls.announcementsWorkerUrl,
      databaseUrl: globalConfig.urls.databaseUrl,
      authUrl: globalConfig.urls.authUrl,
      storeApiUrl: globalConfig.urls.storeApiUrl,
      platformUrl: globalConfig.urls.platformUrl,
      uiUrl: globalConfig.urls.uiUrl,
      documentationUrl: globalConfig.urls.documentationUrl,
      repositoryUrl: globalConfig.urls.repositoryUrl,
      supportEmail: globalConfig.urls.supportEmail,
      communityUrl: globalConfig.urls.communityUrl,
      feedbackUrl: globalConfig.urls.feedbackUrl,
      trialFeedbackUrl: globalConfig.urls.trialFeedbackUrl,
      requestsUrl: globalConfig.urls.requestsUrl,
      networkUrl: globalConfig.urls.networkUrl,
      authorUrl: globalConfig.urls.authorUrl,
      licenseUrl: globalConfig.urls.licenseUrl,
      privacyUrl: globalConfig.urls.privacyUrl,
      vsCodeFigmaPluginUrl: globalConfig.urls.vsCodeFigmaPluginUrl,
      isbUrl: globalConfig.urls.isbUrl,
      uicpUrl: globalConfig.urls.uicpUrl,
      storeUrl: globalConfig.urls.storeUrl,
      storeManagementUrl: globalConfig.urls.storeManagementUrl,
    }}
    versions={{
      userConsentVersion: globalConfig.versions.userConsentVersion,
      trialVersion: globalConfig.versions.trialVersion,
      algorithmVersion: globalConfig.versions.algorithmVersion,
      paletteVersion: globalConfig.versions.paletteVersion,
    }}
    features={globalConfig.features}
    locales={globalConfig.locales}
  >
    <ThemeProvider
      theme={globalConfig.env.ui}
      mode={globalConfig.env.colorMode}
    >
      <App />
    </ThemeProvider>
  </ConfigProvider>
)
