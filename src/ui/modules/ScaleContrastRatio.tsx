import { layouts, SectionTitle, Select, SimpleItem } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features from '../../config'
import { $palette } from '../../stores/palette'
import { BaseProps, Easing, PlanStatus, Service } from '../../types/app'
import {
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
} from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import { ActionsList, TextColorsThemeHexModel } from '../../types/models'
import Contrast from '../../utils/Contrast'
import Feature from '../components/Feature'
import Slider from '../components/Slider'

interface ScaleProps extends BaseProps {
  service: Service
  id: string
  presetName: string
  stops: Array<number>
  scale?: ScaleConfiguration
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
  textColorsTheme: TextColorsThemeHexModel
  distributionEasing: Easing
  onChangeScale: () => void
  onChangeStop?: () => void
  onSwitchMode: () => void
}

interface ScaleStates {
  ratioLightForeground: ScaleConfiguration
  ratioDarkForeground: ScaleConfiguration
}

export default class ScaleContrastRatio extends PureComponent<
  ScaleProps,
  ScaleStates
> {
  private scaleMessage: ScaleMessage
  private unsubscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ScaleProps> = {
    distributionEasing: 'LINEAR',
  }

  static features = (planStatus: PlanStatus) => ({
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
    }),
  })

  constructor(props: ScaleProps) {
    super(props)
    this.palette = $palette
    this.scaleMessage = {
      type: 'UPDATE_SCALE',
      id: this.props.id,
      data: this.palette.value as ExchangeConfiguration,
    }
    this.state = {
      ratioLightForeground: {},
      ratioDarkForeground: {},
    }
  }

  // Lifecycle
  componentDidMount = () => {
    this.setContrastMode()
    this.unsubscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
      if (value.isThemeSwitched) {
        setTimeout(() => this.setContrastMode(), 100)
        $palette.setKey('isThemeSwitched', false)
      }
    })
  }

  componentWillUnmount = () => {
    if (this.unsubscribePalette) this.unsubscribePalette()
  }

  // Handlers
  contrastLightForegroundHandler = (
    state: string,
    results: {
      scale: ScaleConfiguration
      preset?: PresetConfiguration
    },
    feature?: string
  ) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.palette.setKey('scale', scale)
      if (results.preset !== undefined)
        this.palette.setKey('preset', results.preset)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        }).getLightnessForContrastRatio(value)
        darkForegroundRatio[key] = new Contrast({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

      this.palette.setKey('scale', scale)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        }).getLightnessForContrastRatio(value)
        darkForegroundRatio[key] = new Contrast({
          textColor: this.props.textColorsTheme.darkColor,
        }).getContrastRatioForLightness(scale[key])
      })

      this.palette.setKey('scale', scale)

      this.setState({
        ratioLightForeground: results.scale,
        ratioDarkForeground: darkForegroundRatio,
      })

      this.props.onChangeScale()
    }

    const actions: ActionsList = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
  }

  contrastDarkForegroundHandler = (
    state: string,
    results: {
      scale: ScaleConfiguration
      preset?: PresetConfiguration
    },
    feature?: string
  ) => {
    const onReleaseStop = () => {
      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onChangeStop = () => {
      const scale = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        darkForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.palette.setKey('scale', scale)
      if (results.preset !== undefined)
        this.palette.setKey('preset', results.preset)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: darkForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      const scale = {} as ScaleConfiguration
      const lightForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.palette.setKey('scale', scale)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: lightForegroundRatio,
      })

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const scale = {} as ScaleConfiguration
      const lightForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
        scale[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.darkColor,
          })
            .getLightnessForContrastRatio(value)
            .toFixed(1)
        )
        lightForegroundRatio[key] = parseFloat(
          new Contrast({
            textColor: this.props.textColorsTheme.lightColor,
          })
            .getContrastRatioForLightness(scale[key])
            .toFixed(1)
        )
      })

      this.palette.setKey('scale', scale)

      this.setState({
        ratioDarkForeground: results.scale,
        ratioLightForeground: lightForegroundRatio,
      })

      this.props.onChangeScale()
    }

    const actions: ActionsList = {
      RELEASED: () => onReleaseStop(),
      SHIFTED: () => onChangeStop(),
      TYPED: () => onTypeStopValue(),
      UPDATING: () => onUpdatingStop(),
      DEFAULT: () => null,
    }

    return actions[state ?? 'DEFAULT']?.()
  }

  // Direct Actions
  setContrastMode = () => {
    const lightForegroundRatio = {} as ScaleConfiguration
    const darkForegroundRatio = {} as ScaleConfiguration

    Object.entries(this.props.scale ?? {}).forEach(([key, value]) => {
      lightForegroundRatio[key] = parseFloat(
        new Contrast({
          textColor: this.props.textColorsTheme.lightColor,
        })
          .getContrastRatioForLightness(value)
          .toFixed(1)
      )
      darkForegroundRatio[key] = parseFloat(
        new Contrast({
          textColor: this.props.textColorsTheme.darkColor,
        })
          .getContrastRatioForLightness(value)
          .toFixed(1)
      )
    })

    this.setState({
      ratioLightForeground: lightForegroundRatio,
      ratioDarkForeground: darkForegroundRatio,
    })
  }

  // Render
  render() {
    return (
      <>
        <div
          className={doClassnames([
            layouts['stackbar'],
            layouts['stackbar--fill'],
          ])}
        >
          <SimpleItem
            id="update-preset"
            leftPartSlot={
              <SectionTitle label={this.props.locals.scale.contrast.title} />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <Feature
                  isActive={ScaleContrastRatio.features(
                    this.props.planStatus
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locals.scale.contrast.label}
                    isChecked={true}
                    isBlocked={ScaleContrastRatio.features(
                      this.props.planStatus
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleContrastRatio.features(
                      this.props.planStatus
                    ).SCALE_CONTRAST_RATIO.isNew()}
                    action={this.props.onSwitchMode}
                  />
                </Feature>
              </div>
            }
            alignment="CENTER"
            isListItem={false}
          />
        </div>
        <Slider
          {...this.props}
          type="EDIT"
          scale={this.state.ratioLightForeground}
          range={{
            min: 0,
            max: 21,
          }}
          colors={{
            min: this.props.textColorsTheme.lightColor,
            max: this.props.textColorsTheme.lightColor,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus
          ).SCALE_CONTRAST_RATIO.isNew()}
          onChange={this.contrastLightForegroundHandler}
        />
        <Slider
          {...this.props}
          type="EDIT"
          scale={this.state.ratioDarkForeground}
          range={{
            min: 0,
            max: 21,
          }}
          colors={{
            min: this.props.textColorsTheme.darkColor,
            max: this.props.textColorsTheme.darkColor,
          }}
          isBlocked={ScaleContrastRatio.features(
            this.props.planStatus
          ).SCALE_CONTRAST_RATIO.isBlocked()}
          isNew={ScaleContrastRatio.features(
            this.props.planStatus
          ).SCALE_CONTRAST_RATIO.isNew()}
          onChange={this.contrastDarkForegroundHandler}
        />
      </>
    )
  }
}
