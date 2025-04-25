import { Consent, ConsentConfiguration, Icon, layouts } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { Component, createPortal } from 'preact/compat'
import React from 'react'

import features, {
  algorithmVersion,
  privacyUrl,
  trialTime,
  userConsentVersion,
} from '../config'
import { lang, locals } from '../content/locals'
import { $palette } from '../stores/palette'
import {
  $canPaletteDeepSync,
  $canStylesDeepSync,
  $isAPCADisplayed,
  $isVsCodeMessageDisplayed,
  $isWCAGDisplayed,
} from '../stores/preferences'
import { defaultPreset, presets } from '../stores/presets'
import {
  Easing,
  HighlightDigest,
  Language,
  NamingConvention,
  PlanStatus,
  PriorityContext,
  Service,
  TrialStatus,
} from '../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorConfiguration,
  ColorSpaceConfiguration,
  CreatorConfiguration,
  DatesConfiguration,
  DocumentConfiguration,
  ExportConfiguration,
  ExtractOfBaseConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  PublicationConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  UserConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { ActionsList, TextColorsThemeHexModel } from '../types/models'
import { UserSession } from '../types/user'
import doLightnessScale from '../utils/doLightnessScale'
import {
  trackExportEvent,
  trackPurchaseEvent,
  trackUserConsentEvent,
} from '../utils/eventsTracker'
import { userConsent } from '../utils/userConsent'
import Feature from './components/Feature'
import PriorityContainer from './modules/PriorityContainer'
import Shortcuts from './modules/Shortcuts'
import BrowsePalettes from './services/BrowsePalettes'
import CreatePalette from './services/CreatePalette'
import EditPalette from './services/EditPalette'
import './stylesheets/app-components.css'
import './stylesheets/app.css'

export interface AppStates {
  service: Service
  sourceColors: Array<SourceColorConfiguration>
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colors: Array<ColorConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  themes: Array<ThemeConfiguration>
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  screenshot: Uint8Array | null
  dates: DatesConfiguration
  export: ExportConfiguration
  palettesList: Array<ExtractOfBaseConfiguration>
  document: DocumentConfiguration
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  publicationStatus: PublicationConfiguration
  creatorIdentity: CreatorConfiguration
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  priorityContainerContext: PriorityContext
  lang: Language
  mustUserConsent: boolean
  highlight: HighlightDigest
  isLoaded: boolean
  onGoingStep: string
}

export default class App extends Component<Record<string, never>, AppStates> {
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    BROWSE: new FeatureStatus({
      features: features,
      featureName: 'BROWSE',
      planStatus: planStatus,
    }),
    CREATE: new FeatureStatus({
      features: features,
      featureName: 'CREATE',
      planStatus: planStatus,
    }),
    EDIT: new FeatureStatus({
      features: features,
      featureName: 'EDIT',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
    SHORTCUTS: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS',
      planStatus: planStatus,
    }),
  })

  constructor(props: Record<string, never>) {
    super(props)
    this.palette = $palette
    this.state = {
      service: 'BROWSE',
      sourceColors: [],
      id: '',
      name: locals[lang].settings.global.name.default,
      description: '',
      preset:
        presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset,
      namingConvention: 'ONES',
      distributionEasing: 'LINEAR',
      scale: {},
      shift: {
        chroma: 100,
      },
      areSourceColorsLocked: false,
      colors: [],
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      themes: [],
      view: 'PALETTE_WITH_PROPERTIES',
      algorithmVersion: algorithmVersion,
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      screenshot: null,
      dates: {
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      },
      export: {
        format: 'JSON',
        context: 'TOKENS_GLOBAL',
        label: '',
        colorSpace: 'RGB',
        mimeType: 'application/json',
        data: '',
      },
      palettesList: [],
      document: {},
      planStatus: 'UNPAID',
      trialStatus: 'UNUSED',
      trialRemainingTime: trialTime,
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorFullName: '',
        creatorAvatar: '',
        creatorId: '',
      },
      priorityContainerContext: 'EMPTY',
      lang: lang,
      userSession: {
        connectionStatus: 'UNCONNECTED',
        userFullName: '',
        userAvatar: '',
        userId: undefined,
        accessToken: undefined,
        refreshToken: undefined,
      },
      userConsent: userConsent,
      userIdentity: {
        id: '',
        fullName: '',
        avatar: '',
      },
      mustUserConsent: true,
      highlight: {
        version: '',
        status: 'NO_HIGHLIGHT',
      },
      isLoaded: false,
      onGoingStep: '',
    }
  }

  componentDidMount = async () => {
    this.setState({
      scale: doLightnessScale(
        this.state.preset.scale,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.easing
      ),
    })
    this.palette.setKey(
      'scale',
      doLightnessScale(
        this.state.preset.scale,
        this.state.preset.min,
        this.state.preset.max,
        this.state.preset.easing
      )
    )

    /*fetch(
      `${announcementsWorkerUrl}/?action=get_version&database_id=${process.env.REACT_APP_NOTION_ANNOUNCEMENTS_ID}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'The database is not found') {
          parent.postMessage(
            {
              pluginMessage: {
                type: 'CHECK_HIGHLIGHT_STATUS',
                version: data.version,
              },
            },
            '*'
          )
          this.setState({
            highlight: {
              version: data.version,
              status: 'NO_HIGHLIGHT',
            },
          })
        }
      })
      .catch((error) => console.error(error))*/

    window.addEventListener('message', (e: MessageEvent) => {
      const path = e.data

      try {
        const setTheme = () => {
          document.documentElement.setAttribute(
            'data-mode',
            path.data.theme === 'light' ? 'penpot-light' : 'penpot-dark'
          )
        }

        const checkUserAuthentication = async () => {
          this.setState({
            userIdentity: {
              id: path.data.id,
              fullName: path.data.fullName,
              avatar: path.data.avatar,
            },
          })
        }

        const checkUserConsent = () => {
          this.setState({
            mustUserConsent: path.data.mustUserConsent,
            userConsent: path.data.userConsent,
          })
        }

        const checkUserPreferences = () => {
          setTimeout(() => this.setState({ isLoaded: true }), 1000)
          $isWCAGDisplayed.set(path.data.isWCAGDisplayed)
          $isAPCADisplayed.set(path.data.isAPCADisplayed)
          $canPaletteDeepSync.set(path.data.canDeepSyncPalette)
          $canStylesDeepSync.set(path.data.canDeepSyncStyles)
          $isVsCodeMessageDisplayed.set(path.data.isVsCodeMessageDisplayed)
        }

        const handleHighlight = () => {
          this.setState({
            priorityContainerContext:
              path.data.status !== 'DISPLAY_HIGHLIGHT_DIALOG'
                ? 'EMPTY'
                : 'HIGHLIGHT',
            highlight: {
              version: this.state.highlight.version,
              status: path.data.status,
            },
          })
        }

        const handleOnboarding = () => {
          this.setState({
            priorityContainerContext:
              path.data.status !== 'DISPLAY_ONBOARDING_DIALOG'
                ? 'EMPTY'
                : 'ONBOARDING',
          })
        }

        const checkPlanStatus = () =>
          this.setState({
            planStatus: path.data.planStatus,
            trialStatus: path.data.trialStatus,
            trialRemainingTime: path.data.trialRemainingTime,
          })

        const updateWhileEmptySelection = () => {
          this.setState({
            sourceColors: this.state.sourceColors.filter(
              (sourceColor: SourceColorConfiguration) =>
                sourceColor.source !== 'CANVAS'
            ),
            document: {},
            onGoingStep: 'selection empty',
          })
        }

        const updateWhileColorSelected = () => {
          this.setState({
            sourceColors: this.state.sourceColors
              .filter(
                (sourceColor: SourceColorConfiguration) =>
                  sourceColor.source !== 'CANVAS'
              )
              .concat(path.data.selection),
            document: {},
            onGoingStep: 'colors selected',
          })
        }

        const updateWhileDocumentSelected = () => {
          this.setState({
            document: {
              view: path.data.view,
              id: path.data.id,
              isLinkedToPalette: path.data.isLinkedToPalette,
              updatedAt: path.data.updatedAt,
            },
          })
        }

        const loadPalette = () => {
          console.log('load palette', path.data.base.themes)
          const theme: ThemeConfiguration = path.data.base.themes.find(
            (theme: ThemeConfiguration) => theme.isEnabled
          )

          this.palette.setKey('id', path.data.meta.id)
          this.palette.setKey('name', path.data.base.name)
          this.palette.setKey('description', path.data.base.description)
          this.palette.setKey('preset', path.data.base.preset)
          this.palette.setKey('scale', theme?.scale)
          this.palette.setKey('shift', path.data.base.shift)
          this.palette.setKey(
            'areSourceColorsLocked',
            path.data.base.areSourceColorsLocked
          )
          this.palette.setKey('colors', path.data.base.colors)
          this.palette.setKey('themes', path.data.base.themes)
          this.palette.setKey('colorSpace', path.data.base.colorSpace)
          this.palette.setKey(
            'visionSimulationMode',
            theme?.visionSimulationMode ?? 'NONE'
          )
          this.palette.setKey(
            'algorithmVersion',
            path.data.base.algorithmVersion
          )
          this.palette.setKey(
            'textColorsTheme',
            theme?.textColorsTheme ?? {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            }
          )

          parent.postMessage(
            {
              pluginMessage: {
                type: 'EXPORT_PALETTE',
                id: path.data.meta.id,
                export: this.state.export.context,
                colorSpace: this.state.export.colorSpace,
              },
            },
            '*'
          )

          this.setState({
            service: 'EDIT',
            sourceColors: [],
            id: path.data.meta.id,
            name: path.data.base.name,
            description: path.data.base.description,
            preset: path.data.base.preset,
            scale: path.data.base.scale,
            shift: path.data.base.shift,
            areSourceColorsLocked: path.data.base.areSourceColorsLocked,
            colors: path.data.base.colors,
            colorSpace: path.data.base.colorSpace,
            visionSimulationMode: theme?.visionSimulationMode ?? 'NONE',
            themes: path.data.base.themes,
            view: path.data.base.view,
            algorithmVersion: path.data.base.algorithmVersion,
            textColorsTheme: theme?.textColorsTheme ?? {
              lightColor: '#FFFFFF',
              darkColor: '#000000',
            },
            screenshot: null,
            dates: {
              createdAt: path.data.meta.dates.createdAt,
              updatedAt: path.data.meta.dates.updatedAt,
              publishedAt: path.data.meta.dates.publishedAt,
            },
            publicationStatus: {
              isPublished: path.data.meta.publicationStatus.isPublished,
              isShared: path.data.meta.publicationStatus.isShared,
            },
            creatorIdentity: {
              creatorFullName: path.data.meta.creatorIdentity.creatorFullName,
              creatorAvatar: path.data.meta.creatorIdentity.creatorAvatar,
              creatorId: path.data.meta.creatorIdentity.creatorId,
            },
            onGoingStep: 'palette loaded',
          })
        }

        const exportPaletteToJson = () => {
          this.setState({
            export: {
              format: 'JSON',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.tokens.label
              }`,
              colorSpace: 'RGB',
              mimeType: 'application/json',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          if (path.data.context !== 'TOKENS_GLOBAL')
            trackExportEvent(
              path.data.id,
              this.state.userConsent.find(
                (consent) => consent.id === 'mixpanel'
              )?.isConsented ?? false,
              {
                feature: path.data.context,
              }
            )
        }

        const exportPaletteToCss = () => {
          this.setState({
            export: {
              format: 'CSS',
              colorSpace: path.data.colorSpace,
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.css.customProperties
              }`,
              mimeType: 'text/css',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
              colorSpace: path.data.colorSpace,
            }
          )
        }

        const exportPaletteToTaiwind = () => {
          this.setState({
            export: {
              format: 'TAILWIND',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.tailwind.config
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/javascript',
              data: `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(
                path.data.code,
                null,
                '  '
              )}`,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToSwiftUI = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.apple.swiftui
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToUIKit = () => {
          this.setState({
            export: {
              format: 'SWIFT',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.apple.uikit
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/swift',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToKt = () => {
          this.setState({
            export: {
              format: 'KT',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.android.compose
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/x-kotlin',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToXml = () => {
          this.setState({
            export: {
              format: 'XML',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.android.resources
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/xml',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const exportPaletteToCsv = () => {
          this.setState({
            export: {
              format: 'CSV',
              context: path.data.context,
              label: `${locals[this.state.lang].actions.export} ${
                locals[this.state.lang].export.csv.spreadsheet
              }`,
              colorSpace: 'HEX',
              mimeType: 'text/csv',
              data: path.data.code,
            },
            onGoingStep: 'export previewed',
          })
          trackExportEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false,
            {
              feature: path.data.context,
            }
          )
        }

        const updateScreenshot = (bytes: Uint8Array) =>
          this.setState({
            screenshot: bytes,
          })

        const updatePaletteDate = (date: Date) =>
          this.setState({
            dates: {
              createdAt: this.state.dates['createdAt'],
              updatedAt: date,
              publishedAt: this.state.dates['publishedAt'],
            },
          })

        const getProPlan = () => {
          this.setState({
            planStatus: path.data.status,
            priorityContainerContext: 'WELCOME_TO_PRO',
          })
          trackPurchaseEvent(
            path.data.id,
            this.state.userConsent.find((consent) => consent.id === 'mixpanel')
              ?.isConsented ?? false
          )
        }

        const signOut = (data: UserSession) =>
          this.setState({
            userSession: data,
          })

        const actions: ActionsList = {
          SET_THEME: () => setTheme(),
          CHECK_USER_AUTHENTICATION: () => checkUserAuthentication(),
          CHECK_USER_CONSENT: () => checkUserConsent(),
          CHECK_USER_PREFERENCES: () => checkUserPreferences(),
          PUSH_HIGHLIGHT_STATUS: () => handleHighlight(),
          PUSH_ONBOARDING_STATUS: () => handleOnboarding(),
          CHECK_PLAN_STATUS: () => checkPlanStatus(),
          EMPTY_SELECTION: () => updateWhileEmptySelection(),
          COLOR_SELECTED: () => updateWhileColorSelected(),
          DOCUMENT_SELECTED: () => updateWhileDocumentSelected(),
          LOAD_PALETTE: () => loadPalette(),
          EXPORT_PALETTE_JSON: () => exportPaletteToJson(),
          EXPORT_PALETTE_CSS: () => exportPaletteToCss(),
          EXPORT_PALETTE_TAILWIND: () => exportPaletteToTaiwind(),
          EXPORT_PALETTE_SWIFTUI: () => exportPaletteToSwiftUI(),
          EXPORT_PALETTE_UIKIT: () => exportPaletteToUIKit(),
          EXPORT_PALETTE_KT: () => exportPaletteToKt(),
          EXPORT_PALETTE_XML: () => exportPaletteToXml(),
          EXPORT_PALETTE_CSV: () => exportPaletteToCsv(),
          UPDATE_SCREENSHOT: () => updateScreenshot(path?.data),
          UPDATE_PALETTE_DATE: () => updatePaletteDate(path?.data),
          GET_PRO_PLAN: () => getProPlan(),
          SIGN_OUT: () => signOut(path?.data),
          DEFAULT: () => null,
        }

        return actions[path.type ?? 'DEFAULT']?.()
      } catch (error) {
        console.error(error)
      }
    })
  }

  // Handlers
  userConsentHandler = (e: Array<ConsentConfiguration>) => {
    this.setState({
      userConsent: e,
      mustUserConsent: false,
    })
    parent.postMessage(
      {
        pluginMessage: {
          type: 'SET_ITEMS',
          items: [
            {
              key: 'mixpanel_user_consent',
              value: e.find((consent) => consent.id === 'mixpanel')
                ?.isConsented,
            },
            {
              key: 'user_consent_version',
              value: userConsentVersion,
            },
          ],
        },
      },
      '*'
    )
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CHECK_USER_CONSENT',
        },
      },
      '*'
    )
    trackUserConsentEvent(e)
  }

  onReset = () => {
    const preset =
      presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset
    const scale = doLightnessScale(
      preset.scale,
      preset.min,
      preset.max,
      preset.easing
    )

    this.setState({
      service: 'BROWSE',
      id: '',
      name: locals[lang].settings.global.name.default,
      description: '',
      preset: preset,
      scale: scale,
      shift: {
        chroma: 100,
      },
      areSourceColorsLocked: false,
      colorSpace: 'LCH',
      visionSimulationMode: 'NONE',
      view: 'PALETTE_WITH_PROPERTIES',
      algorithmVersion: algorithmVersion,
      textColorsTheme: {
        lightColor: '#FFFFFF',
        darkColor: '#000000',
      },
      screenshot: null,
      dates: {
        createdAt: '',
        updatedAt: '',
        publishedAt: '',
      },
      publicationStatus: {
        isPublished: false,
        isShared: false,
      },
      creatorIdentity: {
        creatorFullName: '',
        creatorAvatar: '',
        creatorId: '',
      },
    })

    this.palette.setKey(
      'name',
      locals[this.state.lang].settings.global.name.default
    )
    this.palette.setKey('description', '')
    this.palette.setKey('preset', preset)
    this.palette.setKey('scale', scale)
    this.palette.setKey('shift', {
      chroma: 100,
    })
    this.palette.setKey('areSourceColorsLocked', false)
    this.palette.setKey('colorSpace', 'LCH')
    this.palette.setKey('visionSimulationMode', 'NONE')
    this.palette.setKey('view', 'PALETTE_WITH_PROPERTIES')
    this.palette.setKey('textColorsTheme', {
      lightColor: '#FFFFFF',
      darkColor: '#000000',
    })
  }

  // Render
  render() {
    if (this.state.isLoaded)
      return (
        <main className="ui">
          <Feature
            isActive={
              App.features(this.props.planStatus).BROWSE.isActive() &&
              this.state.service === 'BROWSE'
            }
          >
            <BrowsePalettes
              {...this.state}
              onCreatePalette={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature
            isActive={
              App.features(this.props.planStatus).CREATE.isActive() &&
              this.state.service === 'CREATE'
            }
          >
            <CreatePalette
              {...this.state}
              onChangeColorsFromImport={(e) => this.setState({ ...e })}
              onResetSourceColors={(e) => this.setState({ ...e })}
              onLockSourceColors={(e) => this.setState({ ...e })}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangeShift={(e) => this.setState({ ...e })}
              onChangePreset={(e) => this.setState({ ...e })}
              onCustomPreset={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onConfigureExternalSourceColors={(e) => this.setState({ ...e })}
              onGetProPlan={(e) => this.setState({ ...e })}
              onCancelPalette={this.onReset}
              onSavedPalette={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature
            isActive={
              App.features(this.props.planStatus).EDIT.isActive() &&
              this.state.service === 'EDIT'
            }
          >
            <EditPalette
              {...this.state}
              onChangeScale={(e) => this.setState({ ...e })}
              onChangeStop={(e) => this.setState({ ...e })}
              onChangeDistributionEasing={(e) => this.setState({ ...e })}
              onChangeColors={(e) => this.setState({ ...e })}
              onChangeThemes={(e) => this.setState({ ...e })}
              onChangeSettings={(e) => this.setState({ ...e })}
              onPublishPalette={() =>
                this.setState({ priorityContainerContext: 'PUBLICATION' })
              }
              onLockSourceColors={(e) => this.setState({ ...e })}
              onGetProPlan={(e) => this.setState({ ...e })}
              onUnloadPalette={this.onReset}
              onChangeDocument={(e) => this.setState({ ...e })}
            />
          </Feature>
          <Feature isActive={this.state.priorityContainerContext !== 'EMPTY'}>
            {document.getElementById('modal') &&
              createPortal(
                <PriorityContainer
                  context={this.state.priorityContainerContext}
                  rawData={this.state}
                  {...this.state}
                  onChangePublication={(e) => this.setState({ ...e })}
                  onClose={() =>
                    this.setState({
                      priorityContainerContext: 'EMPTY',
                      highlight: {
                        version: this.state.highlight.version,
                        status: 'NO_HIGHLIGHT',
                      },
                    })
                  }
                />,
                document.getElementById('modal') ??
                  document.createElement('app')
              )}
          </Feature>
          <Feature
            isActive={
              this.state.mustUserConsent &&
              App.features(this.props.planStatus).CONSENT.isActive()
            }
          >
            <Consent
              welcomeMessage={locals[this.state.lang].user.cookies.welcome}
              vendorsMessage={locals[this.state.lang].user.cookies.vendors}
              privacyPolicy={{
                label: locals[this.state.lang].user.cookies.privacyPolicy,
                action: () => window.open(privacyUrl, '_blank'),
              }}
              moreDetailsLabel={locals[this.state.lang].user.cookies.customize}
              lessDetailsLabel={locals[this.state.lang].user.cookies.back}
              consentActions={{
                consent: {
                  label: locals[this.state.lang].user.cookies.consent,
                  action: this.userConsentHandler,
                },
                deny: {
                  label: locals[this.state.lang].user.cookies.deny,
                  action: this.userConsentHandler,
                },
                save: {
                  label: locals[this.state.lang].user.cookies.save,
                  action: this.userConsentHandler,
                },
              }}
              validVendor={{
                name: locals[this.state.lang].vendors.functional.name,
                id: 'functional',
                icon: '',
                description:
                  locals[this.state.lang].vendors.functional.description,
                isConsented: true,
              }}
              vendorsList={this.state.userConsent}
            />
          </Feature>
          <Feature
            isActive={App.features(this.props.planStatus).SHORTCUTS.isActive()}
          >
            <Shortcuts
              {...this.state}
              onReOpenHighlight={() =>
                this.setState({ priorityContainerContext: 'HIGHLIGHT' })
              }
              onReOpenOnboarding={() =>
                this.setState({ priorityContainerContext: 'ONBOARDING' })
              }
              onReOpenReport={() =>
                this.setState({ priorityContainerContext: 'REPORT' })
              }
              onReOpenStore={() =>
                this.setState({ priorityContainerContext: 'STORE' })
              }
              onReOpenAbout={() =>
                this.setState({ priorityContainerContext: 'ABOUT' })
              }
              onGetProPlan={() => {
                if (this.state.trialStatus === 'EXPIRED')
                  parent.postMessage(
                    { pluginMessage: { type: 'GET_PRO_PLAN' } },
                    '*'
                  )
                else this.setState({ priorityContainerContext: 'TRY' })
              }}
              onUpdateConsent={() => this.setState({ mustUserConsent: true })}
            />
          </Feature>
        </main>
      )
    else
      return (
        <main className="ui">
          <div className={layouts.centered}>
            <Icon
              type="PICTO"
              iconName="spinner"
            />
          </div>
        </main>
      )
  }
}
