import {
  Button,
  Dropdown,
  DropdownOption,
  layouts,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
  SimpleSlider,
  texts,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features from '../../config'
import { $palette } from '../../stores/palette'
import { defaultPreset, presets } from '../../stores/presets'
import {
  BaseProps,
  Easing,
  NamingConvention,
  PlanStatus,
  Service,
} from '../../types/app'
import {
  ExchangeConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
} from '../../types/configurations'
import { ScaleMessage } from '../../types/messages'
import { ActionsList, TextColorsThemeHexModel } from '../../types/models'
import Contrast from '../../utils/Contrast'
import doLightnessScale from '../../utils/doLightnessScale'
import { trackScaleManagementEvent } from '../../utils/eventsTracker'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Slider from '../components/Slider'

interface ScaleProps extends BaseProps {
  service: Service
  id: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale?: ScaleConfiguration
  shift: ShiftConfiguration
  textColorsTheme: TextColorsThemeHexModel
  onChangePreset?: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onChangeStop?: () => void
  onAddStop?: React.Dispatch<Partial<AppStates>>
  onRemoveStop?: React.Dispatch<Partial<AppStates>>
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeNamingConvention?: React.Dispatch<Partial<AppStates>>
  onSwitchMode: () => void
}

export default class ScaleLightnessChroma extends PureComponent<ScaleProps> {
  private scaleMessage: ScaleMessage
  private unsubscribePalette: (() => void) | undefined
  private palette: typeof $palette

  static defaultProps: Partial<ScaleProps> = {
    namingConvention: 'ONES',
    distributionEasing: 'LINEAR',
  }

  static features = (planStatus: PlanStatus) => ({
    SCALE_PRESETS: new FeatureStatus({
      features: features,
      featureName: 'SCALE_PRESETS',
      planStatus: planStatus,
    }),
    SCALE_PRESETS_NAMING_CONVENTION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_PRESETS_NAMING_CONVENTION',
      planStatus: planStatus,
    }),
    SCALE_CONFIGURATION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CONFIGURATION',
      planStatus: planStatus,
    }),
    SCALE_CONTRAST_RATIO: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CONTRAST_RATIO',
      planStatus: planStatus,
    }),
    SCALE_CHROMA: new FeatureStatus({
      features: features,
      featureName: 'SCALE_CHROMA',
      planStatus: planStatus,
    }),
    PRESETS: (() => {
      return Object.fromEntries(
        Object.entries(presets).map(([, preset]) => [
          `PRESETS_${preset.id}`,
          new FeatureStatus({
            features: features,
            featureName: `PRESETS_${preset.id}`,
            planStatus: planStatus,
          }),
        ])
      )
    })(),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: features,
      featureName: 'PRESETS_CUSTOM_ADD',
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
  }

  // Lifecycle
  componentDidMount = () => {
    this.unsubscribePalette = $palette.subscribe((value) => {
      this.scaleMessage.data = value as ExchangeConfiguration
    })
  }

  componentWillUnmount = () => {
    if (this.unsubscribePalette) this.unsubscribePalette()
  }

  // Handlers
  lightnessHandler = (
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
      this.palette.setKey('scale', results.scale)
      if (results.preset !== undefined)
        this.palette.setKey('preset', results.preset)

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration
      this.scaleMessage.feature = feature

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onTypeStopValue = () => {
      this.palette.setKey('scale', results.scale)

      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.scaleMessage.data = this.palette.value as ExchangeConfiguration

      this.props.onChangeStop?.()
      this.props.onChangeScale()

      if (this.props.service === 'EDIT')
        parent.postMessage({ pluginMessage: this.scaleMessage }, '*')
    }

    const onUpdatingStop = () => {
      const lightForegroundRatio = {} as ScaleConfiguration
      const darkForegroundRatio = {} as ScaleConfiguration

      Object.entries(results.scale).forEach(([key, value]) => {
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

      this.palette.setKey('scale', results.scale)

      this.setState({
        ratioLightForeground: lightForegroundRatio,
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

  presetsHandler = (e: Event) => {
    const scale = (preset: PresetConfiguration) =>
      doLightnessScale(
        preset.scale ?? [],
        preset.min ?? 0,
        preset.max ?? 100,
        preset.easing
      )

    const setMaterialDesignPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'MATERIAL') ?? defaultPreset

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setMaterial3Preset = () => {
      const preset =
        presets.find((preset) => preset.id === 'MATERIAL_3') ?? defaultPreset

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family}')`
      )
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL_3',
        }
      )
    }

    const setTailwindPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'TAILWIND') ?? defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_MATERIAL',
        }
      )
    }

    const setAntDesignPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ANT') ?? defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ANT',
        }
      )
    }

    const setAdsPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ADS') ?? defaultPreset

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS',
        }
      )
    }

    const setAdsNeutralPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'ADS_NEUTRAL') ?? defaultPreset

      this.palette.setKey('preset', JSON.parse(JSON.stringify(preset)))
      this.palette.setKey(
        'preset.name',
        `${this.palette.get().preset.name} (${this.palette.get().preset.family})`
      )
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_ADS_NEUTRAL',
        }
      )
    }

    const setCarbonPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'CARBON') ?? defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_CARBON',
        }
      )
    }

    const setBasePreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'BASE') ?? defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_BASE',
        }
      )
    }

    const setPolarisPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'POLARIS') ?? defaultPreset

      this.palette.setKey('preset', preset)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_POLARIS',
        }
      )
    }

    const setCustomPreset = () => {
      const preset =
        presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
      const newScale = preset?.scale.map((stop, index) => {
        if (this.props.namingConvention === 'TENS') return (index + 1) * 10
        else if (this.props.namingConvention === 'HUNDREDS')
          return (index + 1) * 100
        return (index + 1) * 1
      })

      preset.scale = newScale ?? []
      this.palette.setKey('preset', preset)
      this.palette.setKey('lightnessRange.min', preset.min)
      this.palette.setKey('lightnessRange.max', preset.max)
      this.palette.setKey('scale', scale(preset))

      this.props.onChangePreset?.({
        preset: preset,
        scale: scale(preset),
        onGoingStep: 'preset changed',
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: 'SWITCH_CUSTOM',
        }
      )
    }

    const actions: ActionsList = {
      MATERIAL: () => setMaterialDesignPreset(),
      MATERIAL_3: () => setMaterial3Preset(),
      TAILWIND: () => setTailwindPreset(),
      ANT: () => setAntDesignPreset(),
      ADS: () => setAdsPreset(),
      ADS_NEUTRAL: () => setAdsNeutralPreset(),
      CARBON: () => setCarbonPreset(),
      BASE: () => setBasePreset(),
      POLARIS: () => setPolarisPreset(),
      CUSTOM: () => setCustomPreset(),
      DEFAULT: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'DEFAULT']?.()
  }

  presetsOptions = () => {
    const orderedPresets = presets.reduce(
      (acc: { [key: string]: PresetConfiguration[] }, preset) => {
        const { family, name } = preset
        if (family !== undefined) {
          if (!acc[family]) acc[family] = []
          acc[family].push(preset)
        } else {
          if (!acc[name]) acc[name] = []
          acc[name].push(preset)
        }
        return acc
      },
      {} as { [key: string]: PresetConfiguration[] }
    )

    const options: Array<DropdownOption> = Object.entries(orderedPresets).map(
      (preset) => {
        if (preset[1].length > 1)
          return {
            label: preset[0],
            value: preset[0].toUpperCase(),
            type: 'OPTION',
            children: preset[1].map((preset: PresetConfiguration) => ({
              label: preset.name,
              value: preset.id,
              feature: `PRESETS_${preset.id}`,
              type: 'OPTION',
              isActive: ScaleLightnessChroma.features(
                this.props.planStatus
              ).PRESETS[`PRESETS_${preset.id}`].isActive(),
              isBlocked: ScaleLightnessChroma.features(
                this.props.planStatus
              ).PRESETS[`PRESETS_${preset.id}`].isBlocked(),
              isNew: ScaleLightnessChroma.features(
                this.props.planStatus
              ).PRESETS[`PRESETS_${preset.id}`].isNew(),
              action: this.presetsHandler,
            })),
          }
        else
          return {
            label: preset[1][0].name,
            value: preset[1][0].id,
            feature: `PRESETS_${preset[1][0].id}`,
            type: 'OPTION',
            isActive: ScaleLightnessChroma.features(
              this.props.planStatus
            ).PRESETS[`PRESETS_${preset[1][0].id}`].isActive(),
            isBlocked: ScaleLightnessChroma.features(
              this.props.planStatus
            ).PRESETS[`PRESETS_${preset[1][0].id}`].isBlocked(),
            isNew: ScaleLightnessChroma.features(this.props.planStatus).PRESETS[
              `PRESETS_${preset[1][0].id}`
            ].isNew(),
            action: this.presetsHandler,
          }
      }
    )

    options.splice(options.length - 1, 0, {
      type: 'SEPARATOR',
    })

    return options
  }

  customHandler = (e: Event) => {
    const stops = this.props.preset?.['scale'] ?? [1, 2]
    const preset =
      presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
    const scale = (stps = stops) =>
      doLightnessScale(
        stps,
        Math.min(...Object.values(this.props.scale ?? {})),
        Math.max(...Object.values(this.props.scale ?? {})),
        this.props.distributionEasing
      )

    const addStop = () => {
      if (stops.length < 24) {
        stops.push(stops.slice(-1)[0] + stops[0])
        preset.scale = stops
        this.palette.setKey('scale', scale())

        this.props.onAddStop?.({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const removeStop = () => {
      if (stops.length > 2) {
        stops.pop()
        preset.scale = stops
        this.palette.setKey('scale', scale())

        this.props.onRemoveStop?.({
          preset: preset,
          scale: scale(),
        })
      }
    }

    const changeNamingConvention = () => {
      const preset =
        presets.find((preset) => preset.id === 'CUSTOM') ?? defaultPreset
      const option = (e.target as HTMLInputElement).dataset
        .value as NamingConvention
      const newStops = stops.map((stop, index) => {
        if (option === 'TENS') return (index + 1) * 10
        else if (option === 'HUNDREDS') return (index + 1) * 100
        return (index + 1) * 1
      })

      preset.scale = newStops
      this.palette.setKey('scale', scale(newStops))
      this.palette.setKey('preset', preset)

      this.props.onChangeNamingConvention?.({
        namingConvention: option,
        preset: preset,
        scale: scale(newStops),
      })

      trackScaleManagementEvent(
        this.props.userIdentity.id,
        this.props.userConsent.find((consent) => consent.id === 'mixpanel')
          ?.isConsented ?? false,
        {
          feature: option,
        }
      )
    }

    const actions: ActionsList = {
      ADD_STOP: () => addStop(),
      REMOVE_STOP: () => removeStop(),
      UPDATE_NAMING_CONVENTION: () => changeNamingConvention(),
      DEFAULT: () => null,
    }

    return actions[
      (e.target as HTMLInputElement).dataset.feature ?? 'DEFAULT'
    ]?.()
  }

  // Templates
  NamingConvention = () => {
    return (
      <Dropdown
        id="naming-convention"
        options={[
          {
            label: this.props.locals.scale.namingConvention.ones,
            value: 'ONES',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
          {
            label: this.props.locals.scale.namingConvention.tens,
            value: 'TENS',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
          {
            label: this.props.locals.scale.namingConvention.hundreds,
            value: 'HUNDREDS',
            feature: 'UPDATE_NAMING_CONVENTION',
            type: 'OPTION',
            isActive: true,
            isBlocked: false,
            isNew: false,
            action: this.customHandler,
          },
        ]}
        selected={this.props.namingConvention}
        alignment="RIGHT"
        pin="TOP"
        isBlocked={ScaleLightnessChroma.features(
          this.props.planStatus
        ).SCALE_PRESETS_NAMING_CONVENTION.isBlocked()}
        isNew={ScaleLightnessChroma.features(
          this.props.planStatus
        ).SCALE_PRESETS_NAMING_CONVENTION.isNew()}
      />
    )
  }

  Create = () => {
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
              <SectionTitle
                label={this.props.locals.scale.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus
                  ).SCALE_PRESETS.isActive()}
                >
                  <Dropdown
                    id="presets"
                    options={this.presetsOptions()}
                    selected={this.props.preset.id}
                    alignment="RIGHT"
                    pin="TOP"
                  />
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus
                  ).SCALE_PRESETS.isActive()}
                >
                  {this.props.preset.name === 'Custom' && (
                    <>
                      <Feature
                        isActive={ScaleLightnessChroma.features(
                          this.props.planStatus
                        ).SCALE_PRESETS_NAMING_CONVENTION.isActive()}
                      >
                        <this.NamingConvention />
                      </Feature>
                      {this.props.preset.scale.length > 2 && (
                        <Button
                          type="icon"
                          icon="minus"
                          helper={{
                            label: this.props.locals.scale.actions.removeStop,
                          }}
                          feature="REMOVE_STOP"
                          action={this.customHandler}
                        />
                      )}
                      <Feature
                        isActive={ScaleLightnessChroma.features(
                          this.props.planStatus
                        ).PRESETS_CUSTOM_ADD.isActive()}
                      >
                        <Button
                          type="icon"
                          icon="plus"
                          isDisabled={this.props.preset.scale.length === 24}
                          isBlocked={ScaleLightnessChroma.features(
                            this.props.planStatus
                          ).PRESETS_CUSTOM_ADD.isReached(
                            this.props.preset.scale.length
                          )}
                          helper={{
                            label: this.props.locals.scale.actions.addStop,
                          }}
                          feature="ADD_STOP"
                          action={
                            this.props.preset.scale.length >= 24
                              ? () => null
                              : this.customHandler
                          }
                        />
                      </Feature>
                    </>
                  )}
                </Feature>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locals.scale.contrast.label}
                    isChecked={false}
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
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
          {ScaleLightnessChroma.features(
            this.props.planStatus
          ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.scale.length) &&
            this.props.preset.id === 'CUSTOM' && (
              <div
                style={{
                  padding: 'var(--size-xxxsmall) var(--size-xsmall)',
                }}
              >
                <SemanticMessage
                  type="INFO"
                  message={this.props.locals.info.maxNumberOfStops.replace(
                    '$1',
                    ScaleLightnessChroma.features(this.props.planStatus)
                      .PRESETS_CUSTOM_ADD.limit
                  )}
                  actionsSlot={
                    <Button
                      type="secondary"
                      label={this.props.locals.plan.getPro}
                      action={() =>
                        parent.postMessage(
                          { pluginMessage: { type: 'GET_PRO_PLAN' } },
                          '*'
                        )
                      }
                    />
                  }
                />
              </div>
            )}
        </div>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus
          ).SCALE_CONFIGURATION.isActive()}
        >
          <Slider
            {...this.props}
            type="EDIT"
            presetName={this.props.preset.name}
            stops={this.props.preset.scale}
            range={{
              min: 0,
              max: 100,
            }}
            colors={{
              min: 'black',
              max: 'white',
            }}
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CONFIGURATION.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CONFIGURATION.isNew()}
            onChange={this.lightnessHandler}
          />
        </Feature>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus
          ).SCALE_CHROMA.isActive()}
        >
          <SimpleSlider
            id="update-chroma"
            label={this.props.locals.scale.shift.chroma}
            value={this.props.shift.chroma}
            min={0}
            max={200}
            colors={{
              min: 'hsl(187, 0%, 75%)',
              max: 'hsl(187, 100%, 75%)',
            }}
            feature="SHIFT_CHROMA"
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CHROMA.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CHROMA.isNew()}
            onChange={(feature, state, value) => {
              this.palette.setKey('shift.chroma', value)
              this.props.onChangeShift(feature, state, value)
            }}
          />
        </Feature>
      </>
    )
  }

  Edit = () => {
    return (
      <>
        <div
          className={doClassnames([
            layouts['stackbar'],
            layouts['stackbar--fill'],
          ])}
        >
          <SimpleItem
            id="watch-preset"
            leftPartSlot={
              <SectionTitle
                label={this.props.locals.scale.title}
                indicator={Object.entries(
                  this.props.scale ?? {}
                ).length.toString()}
              />
            }
            rightPartSlot={
              <div className={layouts['snackbar--medium']}>
                <div className={texts.label}>{this.props.preset.name}</div>
                <Feature
                  isActive={ScaleLightnessChroma.features(
                    this.props.planStatus
                  ).SCALE_CONTRAST_RATIO.isActive()}
                >
                  <Select
                    id="switch-contrast-mode"
                    type="SWITCH_BUTTON"
                    label={this.props.locals.scale.contrast.label}
                    isChecked={false}
                    isBlocked={ScaleLightnessChroma.features(
                      this.props.planStatus
                    ).SCALE_CONTRAST_RATIO.isBlocked()}
                    isNew={ScaleLightnessChroma.features(
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
          {ScaleLightnessChroma.features(
            this.props.planStatus
          ).PRESETS_CUSTOM_ADD.isReached(this.props.preset.scale.length) &&
            this.props.preset.id === 'CUSTOM' && (
              <div
                style={{
                  padding: 'var(--size-xxxsmall) var(--size-xsmall)',
                }}
              >
                <SemanticMessage
                  type="INFO"
                  message={this.props.locals.info.maxNumberOfStops.replace(
                    '$1',
                    ScaleLightnessChroma.features(this.props.planStatus)
                      .PRESETS_CUSTOM_ADD.limit
                  )}
                  actionsSlot={
                    <Button
                      type="secondary"
                      label={this.props.locals.plan.getPro}
                      action={() =>
                        parent.postMessage(
                          { pluginMessage: { type: 'GET_PRO_PLAN' } },
                          '*'
                        )
                      }
                    />
                  }
                />
              </div>
            )}
        </div>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus
          ).SCALE_CONFIGURATION.isActive()}
        >
          {this.props.preset.id === 'CUSTOM' ? (
            <Slider
              {...this.props}
              type="FULLY_EDIT"
              presetName={this.props.preset.name}
              stops={this.props.preset.scale}
              range={{
                min: 0,
                max: 100,
              }}
              colors={{
                min: 'black',
                max: 'white',
              }}
              isBlocked={ScaleLightnessChroma.features(
                this.props.planStatus
              ).SCALE_CONFIGURATION.isBlocked()}
              isNew={ScaleLightnessChroma.features(
                this.props.planStatus
              ).SCALE_CONFIGURATION.isNew()}
              onChange={this.lightnessHandler}
            />
          ) : (
            <Slider
              {...this.props}
              type="EDIT"
              presetName={this.props.preset.name}
              stops={this.props.preset.scale}
              range={{
                min: 0,
                max: 100,
              }}
              colors={{
                min: 'black',
                max: 'white',
              }}
              isBlocked={ScaleLightnessChroma.features(
                this.props.planStatus
              ).SCALE_CONFIGURATION.isBlocked()}
              isNew={ScaleLightnessChroma.features(
                this.props.planStatus
              ).SCALE_CONFIGURATION.isNew()}
              onChange={this.lightnessHandler}
            />
          )}
        </Feature>
        <Feature
          isActive={ScaleLightnessChroma.features(
            this.props.planStatus
          ).SCALE_CHROMA.isActive()}
        >
          <SimpleSlider
            id="update-chroma"
            label={this.props.locals.scale.shift.chroma}
            value={this.props.shift.chroma}
            min={0}
            max={200}
            colors={{
              min: 'hsl(187, 0%, 75%)',
              max: 'hsl(187, 100%, 75%)',
            }}
            feature="SHIFT_CHROMA"
            isBlocked={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CHROMA.isBlocked()}
            isNew={ScaleLightnessChroma.features(
              this.props.planStatus
            ).SCALE_CHROMA.isNew()}
            onChange={(feature, state, value) => {
              this.palette.setKey('shift.chroma', value)
              this.props.onChangeShift(feature, state, value)
            }}
          />
        </Feature>
      </>
    )
  }

  // Render
  render() {
    if (this.props.service === 'EDIT') return <this.Edit />
    else return <this.Create />
  }
}
