import { doSpecificMode } from '@ui-lib/stores/features'
import package_json from '../package.json'
import { Config } from './types/config'
import { locales } from './content/locales'

const isDev = import.meta.env.MODE === 'development'

const globalConfig: Config = {
  limits: {
    pageSize: 20,
  },
  env: {
    platform: 'penpot',
    editor: 'penpot',
    ui: 'penpot',
    colorMode: 'penpot-dark',
    isDev,
    isSupabaseEnabled: true,
    isMixpanelEnabled: true,
    isSentryEnabled: true,
    announcementsDbId: import.meta.env.VITE_NOTION_ANNOUNCEMENTS_ID as string,
    onboardingDbId: import.meta.env.VITE_NOTION_ONBOARDING_ID as string,
    pluginId: '123456789',
  },
  plan: {
    isProEnabled: true,
    isTrialEnabled: false,
    trialTime: 72,
  },
  dbs: {
    palettesDbViewName: isDev
      ? 'sandbox_palettes_with_creators'
      : 'palettes_with_creators',
    palettesDbTableName: isDev ? 'sandbox_palettes' : 'palettes',
  },
  urls: {
    authWorkerUrl: isDev
      ? 'http://localhost:8787'
      : (import.meta.env.VITE_AUTH_WORKER_URL as string),
    announcementsWorkerUrl: isDev
      ? 'http://localhost:8888'
      : (import.meta.env.VITE_ANNOUNCEMENTS_WORKER_URL as string),
    databaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
    authUrl: isDev
      ? 'http://localhost:3000'
      : (import.meta.env.VITE_AUTH_URL as string),
    storeApiUrl: import.meta.env.VITE_LEMONSQUEEZY_URL as string,
    platformUrl: '*',
    uiUrl: isDev
      ? 'http://localhost:4400'
      : 'https://penpot.ui-color-palette.com',
    documentationUrl: 'https://uicp.ylb.lt/docs-penpot-plugin',
    repositoryUrl: 'https://uicp.ylb.lt/repository-penpot-plugin',
    communityUrl: 'https://uicp.ylb.lt/community',
    supportEmail: 'https://uicp.ylb.lt/contact',
    feedbackUrl: 'https://uicp.ylb.lt/feedback',
    trialFeedbackUrl: 'https://uicp.ylb.lt/feedback-trial',
    requestsUrl: 'https://uicp.ylb.lt/ideas',
    networkUrl: 'https://uicp.ylb.lt/network',
    authorUrl: 'https://uicp.ylb.lt/author',
    licenseUrl: 'https://uicp.ylb.lt/license',
    privacyUrl: 'https://uicp.ylb.lt/privacy',
    vsCodeFigmaPluginUrl: 'https://uicp.ylb.lt/vscode-figma-plugin',
    isbUrl: 'https://isb.ylb.lt/website',
    uicpUrl: 'https://uicp.ylb.lt/website',
    storeUrl: isDev
      ? 'https://uicp.ylb.lt/store-dev'
      : 'https://uicp.ylb.lt/store',
    storeManagementUrl: isDev
      ? 'https://uicp.ylb.lt/store-management-dev'
      : 'https://uicp.ylb.lt/store-management',
  },
  versions: {
    userConsentVersion: '2024.01',
    trialVersion: '2024.03',
    algorithmVersion: 'v3',
    paletteVersion: '2025.06',
    pluginVersion: package_json.version,
  },
  features: doSpecificMode(
    [
      'SYNC_LOCAL_VARIABLES',
      'USER_PREFERENCES_SYNC_DEEP_VARIABLES',
      'RESIZE_UI',
      'HELP_CHAT',
    ],
    [
      'LOCAL_PALETTES',
      'SYNC_LOCAL_STYLES',
      'USER_PREFERENCES_SYNC_DEEP_STYLES',
      'PREVIEW_LOCK_SOURCE_COLORS',
      'SOURCE',
      'PRESETS_MATERIAL_3',
      'PRESETS_TAILWIND',
      'PRESETS_ADS',
      'PRESETS_ADS_NEUTRAL',
      'PRESETS_CARBON',
      'PRESETS_BASE',
      'PRESETS_POLARIS',
      'PRESETS_CUSTOM_ADD',
      'SCALE_CHROMA',
      'SCALE_HELPER_DISTRIBUTION',
      'THEMES',
      'THEMES_NAME',
      'THEMES_PARAMS',
      'THEMES_DESCRIPTION',
      'COLORS',
      'COLORS_HUE_SHIFTING',
      'COLORS_CHROMA_SHIFTING',
      'COLORS_ALPHA',
      'COLORS_BACKGROUND_COLOR',
      'EXPORT_STYLESHEET_SCSS',
      'EXPORT_STYLESHEET_LESS',
      'EXPORT_TAILWIND_V3',
      'EXPORT_TAILWIND_V4',
      'EXPORT_APPLE_SWIFTUI',
      'EXPORT_APPLE_UIKIT',
      'EXPORT_ANDROID_COMPOSE',
      'EXPORT_ANDROID_XML',
      'EXPORT_CSV',
      'SETTINGS_VISION_SIMULATION_MODE_PROTANOPIA',
      'SETTINGS_VISION_SIMULATION_MODE_PROTANOMALY',
      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOMALY',
      'SETTINGS_VISION_SIMULATION_MODE_DEUTERANOPIA',
      'SETTINGS_VISION_SIMULATION_MODE_TRITANOMALY',
      'SETTINGS_VISION_SIMULATION_MODE_TRITANOPIA',
      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOMALY',
      'SETTINGS_VISION_SIMULATION_MODE_ACHROMATOPSIA',
    ],
    ['SCALE_CONTRAST_RATIO', 'INVOLVE_COMMUNITY']
  ),
  locales: locales.get(),
}

export default globalConfig
