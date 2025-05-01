import { HexModel, Layout } from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features, { algorithmVersion } from '../../config'
import { $palette } from '../../stores/palette'
import { $canPaletteDeepSync } from '../../stores/preferences'
import { BaseProps, Context, PlanStatus, Service } from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { SettingsMessage } from '../../types/messages'
import {
  ActionsList,
  DispatchProcess,
  TextColorsThemeHexModel,
} from '../../types/models'
import { trackSettingsManagementEvent } from '../../utils/eventsTracker'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Dispatcher from '../modules/Dispatcher'
import ColorSettings from './ColorSettings'
import ContrastSettings from './ContrastSettings'
import GlobalSettings from './GlobalSettings'

interface SettingsProps extends BaseProps {
  service: Service
  id: string
  sourceColors?: Array<SourceColorConfiguration>
  name: string
  description: string
  themes?: Array<ThemeConfiguration>
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  textColorsTheme: TextColorsThemeHexModel
  algorithmVersion?: AlgorithmVersionConfiguration
  onChangeSettings: React.Dispatch<Partial<AppStates>>
}

export default class Settings extends PureComponent<SettingsProps> {
  private settingsMessage: SettingsMessage
  private dispatch: { [key: string]: DispatchProcess }
  private unsubscribe: (() => void) | null = null
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    SETTINGS_GLOBAL: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_GLOBAL',
      planStatus: planStatus,
    }),
    SETTINGS_COLOR_MANAGEMENT: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_COLOR_MANAGEMENT',
      planStatus: planStatus,
    }),
    SETTINGS_CONTRAST_MANAGEMENT: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_CONTRAST_MANAGEMENT',
      planStatus: planStatus,
    }),
    SETTINGS_SYNC: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: SettingsProps) {
    super(props)
    this.palette = $palette
    this.settingsMessage = {
      type: 'UPDATE_SETTINGS',
      id: this.props.id,
      data: {
        name: '',
        description: '',
        colorSpace: 'LCH',
        visionSimulationMode: 'NONE',
        algorithmVersion: algorithmVersion,
        textColorsTheme: {
          lightColor: '#FFFFFF',
          darkColor: '#000000',
        },
      },
      isEditedInRealTime: false,
    }
    this.dispatch = {
      textColorsTheme: new Dispatcher(
        () => parent.postMessage({ pluginMessage: this.settingsMessage }, '*'),
        500
      ) as DispatchProcess,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.unsubscribe = $canPaletteDeepSync.subscribe((value) => {
      this.setState({ canPaletteDeepSync: value })
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  settingsHandler = (e: Event) => {
    const target = e.target as HTMLInputElement,
      feature = target.dataset.feature ?? 'DEFAULT'

    const renamePalette = () => {
      this.palette.setKey('name', target.value)

      this.settingsMessage.data.name = target.value
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        name: this.settingsMessage.data.name,
        onGoingStep: 'settings changed',
      })

      if (
        (e.type === 'focusout' || (e as KeyboardEvent).key === 'Enter') &&
        this.props.service === 'EDIT'
      )
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'RENAME_PALETTE',
        }
      )
    }

    const updateDescription = () => {
      this.palette.setKey('description', target.value)

      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = target.value
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        description: this.settingsMessage.data.description,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'DESCRIBE_PALETTE',
        }
      )
    }

    const updateColorSpace = () => {
      this.palette.setKey(
        'colorSpace',
        target.dataset.value as ColorSpaceConfiguration
      )

      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = target.dataset
        .value as ColorSpaceConfiguration
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        colorSpace: this.settingsMessage.data.colorSpace,
        onGoingStep: 'settings changed',
      })

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_COLOR_SPACE',
        }
      )
    }

    const updateVisionSimulationMode = () => {
      this.palette.setKey(
        'visionSimulationMode',
        target.dataset.value as VisionSimulationModeConfiguration
      )

      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode = target.dataset
        .value as VisionSimulationModeConfiguration
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion =
        this.props.algorithmVersion ?? algorithmVersion

      this.props.onChangeSettings({
        themes: this.props.themes?.map((theme) => {
          if (theme.isEnabled)
            theme.visionSimulationMode =
              this.settingsMessage.data.visionSimulationMode
          return theme
        }),
        visionSimulationMode: this.settingsMessage.data.visionSimulationMode,
        onGoingStep: 'settings changed',
      })

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_VISION_SIMULATION_MODE',
        }
      )
    }

    const updateAlgorithmVersion = () => {
      this.palette.setKey(
        'algorithmVersion',
        target.dataset.value as AlgorithmVersionConfiguration
      )

      this.settingsMessage.data.name = this.props.name
      this.settingsMessage.data.description = this.props.description
      this.settingsMessage.data.colorSpace = this.props.colorSpace
      this.settingsMessage.data.visionSimulationMode =
        this.props.visionSimulationMode
      this.settingsMessage.data.textColorsTheme = this.props.textColorsTheme
      this.settingsMessage.data.algorithmVersion = target.dataset
        .value as AlgorithmVersionConfiguration

      this.props.onChangeSettings({
        algorithmVersion: this.settingsMessage.data.algorithmVersion,
        onGoingStep: 'settings changed',
      })

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')

      trackSettingsManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'UPDATE_ALGORITHM',
        }
      )
    }

    const updateTextLightColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor = code
        this.palette.setKey('textColorsTheme.lightColor', code)
        this.settingsMessage.data.textColorsTheme.darkColor =
          this.props.textColorsTheme.darkColor
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ?? algorithmVersion
      }

      this.props.onChangeSettings({
        themes: this.props.themes?.map((theme) => {
          if (theme.isEnabled)
            theme.textColorsTheme = this.settingsMessage.data.textColorsTheme
          return theme
        }),
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
      } else if (this.props.service === 'EDIT')
        this.dispatch.textColorsTheme.on.status = true

      if (e.type === 'focusout')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_TEXT_COLORS_THEME',
          }
        )
    }

    const updateTextDarkColor = () => {
      const code: HexModel =
        target.value.indexOf('#') === -1 ? '#' + target.value : target.value

      if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i.test(code)) {
        this.settingsMessage.data.name = this.props.name
        this.settingsMessage.data.description = this.props.description
        this.settingsMessage.data.colorSpace = this.props.colorSpace
        this.settingsMessage.data.visionSimulationMode =
          this.props.visionSimulationMode
        this.settingsMessage.data.textColorsTheme.lightColor =
          this.props.textColorsTheme.lightColor
        this.settingsMessage.data.textColorsTheme.darkColor = code
        this.palette.setKey('textColorsTheme.darkColor', code)
        this.settingsMessage.data.algorithmVersion =
          this.props.algorithmVersion ?? algorithmVersion
      }

      this.props.onChangeSettings({
        themes: this.props.themes?.map((theme) => {
          if (theme.isEnabled)
            theme.textColorsTheme = this.settingsMessage.data.textColorsTheme
          return theme
        }),
        textColorsTheme: this.settingsMessage.data.textColorsTheme,
        onGoingStep: 'settings changed',
      })

      if (e.type === 'focusout' && this.props.service === 'EDIT') {
        this.dispatch.textColorsTheme.on.status = false
        parent.postMessage({ pluginMessage: this.settingsMessage }, '*')
      } else if (this.props.service === 'EDIT')
        this.dispatch.textColorsTheme.on.status = true

      if (e.type === 'focusout')
        trackSettingsManagementEvent(
          this.props.userIdentity.id,
          this.props.userConsent.find((consent) => consent.id === 'mixpanel')
            ?.isConsented ?? false,
          {
            feature: 'UPDATE_TEXT_COLORS_THEME',
          }
        )
    }

    const actions: ActionsList = {
      RENAME_PALETTE: () => renamePalette(),
      UPDATE_DESCRIPTION: () => updateDescription(),
      UPDATE_COLOR_SPACE: () => updateColorSpace(),
      UPDATE_COLOR_BLIND_MODE: () => updateVisionSimulationMode(),
      UPDATE_ALGORITHM_VERSION: () => updateAlgorithmVersion(),
      UPDATE_TEXT_LIGHT_COLOR: () => updateTextLightColor(),
      UPDATE_TEXT_DARK_COLOR: () => updateTextDarkColor(),
      DEFAULT: () => null,
    }

    return actions[feature ?? 'DEFAULT']?.()
  }

  // Templates
  Palette = () => {
    return (
      <>
        <Feature
          isActive={Settings.features(
            this.props.planStatus
          ).SETTINGS_GLOBAL.isActive()}
        >
          <GlobalSettings
            {...this.props}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
        <Feature
          isActive={Settings.features(
            this.props.planStatus
          ).SETTINGS_COLOR_MANAGEMENT.isActive()}
        >
          <ColorSettings
            {...this.props}
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
        <Feature
          isActive={Settings.features(
            this.props.planStatus
          ).SETTINGS_CONTRAST_MANAGEMENT.isActive()}
        >
          <ContrastSettings
            {...this.props}
            isLast
            onChangeSettings={this.settingsHandler}
          />
        </Feature>
      </>
    )
  }

  // Render
  render() {
    return (
      <>
        <Layout
          id="settings"
          column={[
            {
              node: <this.Palette />,
              typeModifier: 'BLANK',
            },
          ]}
          isFullHeight
        />
      </>
    )
  }
}
