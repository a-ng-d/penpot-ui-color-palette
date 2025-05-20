import {
  Button,
  Dialog,
  Dropdown,
  FormItem,
  KeyboardShortcutItem,
  Layout,
  layouts,
  List,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { createPortal, PureComponent } from 'preact/compat'
import React from 'react'
import features from '../../config'
import de from '../../content/images/distribution_easing.gif'
import {
  BaseProps,
  Easing,
  NamingConvention,
  PlanStatus,
  Service,
} from '../../types/app'
import {
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  ThemeConfiguration,
} from '../../types/configurations'
import { TextColorsThemeHexModel } from '../../types/models'
import { trackScaleManagementEvent } from '../../utils/eventsTracker'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import ScaleLightnessChroma from '../modules/ScaleLightnessChroma'
import ScaleContrastRatio from '../modules/ScaleContrastRatio'

interface ScaleProps extends BaseProps {
  service: Service
  id: string
  sourceColors?: Array<SourceColorConfiguration>
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale?: ScaleConfiguration
  shift: ShiftConfiguration
  themes: Array<ThemeConfiguration>
  textColorsTheme: TextColorsThemeHexModel
  actions?: string
  onChangePreset?: React.Dispatch<Partial<AppStates>>
  onChangeScale: () => void
  onChangeStop?: () => void
  onAddStop?: React.Dispatch<Partial<AppStates>>
  onRemoveStop?: React.Dispatch<Partial<AppStates>>
  onChangeShift: (feature?: string, state?: string, value?: number) => void
  onChangeNamingConvention?: React.Dispatch<Partial<AppStates>>
  onChangeDistributionEasing?: React.Dispatch<Partial<AppStates>>
}

interface ScaleStates {
  isTipsOpen: boolean
  isContrastMode: boolean
}
export default class Scale extends PureComponent<ScaleProps, ScaleStates> {
  static defaultProps: Partial<ScaleProps> = {
    namingConvention: 'ONES',
    distributionEasing: 'LINEAR',
  }

  static features = (planStatus: PlanStatus) => ({
    SCALE_HELPER: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_LINEAR: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_LINEAR',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT',
      planStatus: planStatus,
    }),
    SCALE_HELPER_TIPS: new FeatureStatus({
      features: features,
      featureName: 'SCALE_HELPER_TIPS',
      planStatus: planStatus,
    }),
  })

  constructor(props: ScaleProps) {
    super(props)
    this.state = {
      isTipsOpen: false,
      isContrastMode: false,
    }
  }

  // Direct Actions
  onChangeDistributionEasing = (e: Event) => {
    const value =
      ((e.target as HTMLElement).dataset.value as Easing) ?? 'LINEAR'

    this.props.onChangeDistributionEasing?.({
      distributionEasing: value,
    })

    trackScaleManagementEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: value,
      }
    )
  }

  // Templates
  DistributionEasing = () => {
    return (
      <FormItem
        id="update-distribution-easing"
        label={this.props.locals.scale.easing.label}
        shouldFill={false}
        isBlocked={Scale.features(
          this.props.planStatus
        ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
      >
        <Dropdown
          id="update-distribution-easing"
          options={[
            {
              label: this.props.locals.scale.easing.linear,
              value: 'LINEAR',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_LINEAR.isNew(),
              action: this.onChangeDistributionEasing,
            },

            {
              type: 'SEPARATOR',
            },
            {
              label: this.props.locals.scale.easing.slowEaseIn,
              value: 'SLOW_EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.easeIn,
              value: 'EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.fastEaseIn,
              value: 'FAST_EASE_IN',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: this.props.locals.scale.easing.slowEaseOut,
              value: 'SLOW_EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.easeOut,
              value: 'EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.fastEaseOut,
              value: 'FAST_EASE_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              type: 'SEPARATOR',
            },
            {
              label: this.props.locals.scale.easing.slowEaseInOut,
              value: 'SLOW_EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_SLOW_EASE_IN_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.easeInOut,
              value: 'EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_EASE_IN_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
            {
              label: this.props.locals.scale.easing.fastEaseInOut,
              value: 'FAST_EASE_IN_OUT',
              feature: 'UPDATE_DISTRIBUTION_EASING',
              type: 'OPTION',
              isActive: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isActive(),
              isBlocked: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isBlocked(),
              isNew: Scale.features(
                this.props.planStatus
              ).SCALE_HELPER_DISTRIBUTION_FAST_EASE_IN_OUT.isNew(),
              action: this.onChangeDistributionEasing,
            },
          ]}
          selected={this.props.distributionEasing}
          pin="BOTTOM"
          containerId="scale"
          preview={{
            image: de,
            text: this.props.locals.scale.easing.preview,
            pin: 'TOP',
          }}
          isBlocked={Scale.features(
            this.props.planStatus
          ).SCALE_HELPER_DISTRIBUTION.isBlocked()}
          isNew={Scale.features(
            this.props.planStatus
          ).SCALE_HELPER_DISTRIBUTION.isNew()}
        />
      </FormItem>
    )
  }

  KeyboardShortcuts = () => {
    const isMacOrWinKeyboard =
      navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : '⌃'

    trackScaleManagementEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'OPEN_KEYBOARD_SHORTCUTS',
      }
    )

    return createPortal(
      <Dialog
        title={this.props.locals.scale.tips.title}
        onClose={() =>
          this.setState({
            isTipsOpen: false,
          })
        }
      >
        <Layout
          id="keyboard-shortcuts"
          column={[
            {
              node: (
                <List>
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.move}
                    shortcuts={[[isMacOrWinKeyboard, 'drag']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.distribute}
                    shortcuts={[['⇧', 'drag']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.select}
                    shortcuts={[['click']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.unselect}
                    shortcuts={[['⎋ Esc']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.navPrevious}
                    shortcuts={[['⇧', '⇥ Tab']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.navNext}
                    shortcuts={[['⇥ Tab']]}
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.type}
                    shortcuts={[['db click'], ['↩︎ Enter']]}
                    separator="or"
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.shiftLeft}
                    shortcuts={[['←'], [isMacOrWinKeyboard, '←']]}
                    separator="or"
                  />
                  <KeyboardShortcutItem
                    label={this.props.locals.scale.tips.shiftRight}
                    shortcuts={[['→'], [isMacOrWinKeyboard, '→']]}
                    separator="or"
                  />
                </List>
              ),
              typeModifier: 'DISTRIBUTED',
            },
            {
              node:
                this.props.service === 'EDIT' ? (
                  <>
                    <SimpleItem
                      id="watch-custom-keyboard-shortcuts"
                      leftPartSlot={
                        <SectionTitle
                          label={this.props.locals.scale.tips.custom}
                        />
                      }
                      alignment="CENTER"
                    />
                    <List>
                      <KeyboardShortcutItem
                        label={this.props.locals.scale.tips.add}
                        shortcuts={[['click']]}
                      />
                      <KeyboardShortcutItem
                        label={this.props.locals.scale.tips.remove}
                        shortcuts={[['⌫']]}
                      />
                    </List>
                  </>
                ) : undefined,
              typeModifier: 'LIST',
            },
          ]}
          isFullWidth
        />
      </Dialog>,
      document.getElementById('modal') ?? document.createElement('app')
    )
  }

  Create = () => {
    return (
      <Layout
        id="scale"
        column={[
          {
            node: (
              <>
                {!this.state.isContrastMode ? (
                  <ScaleLightnessChroma
                    {...this.props}
                    onSwitchMode={() =>
                      this.setState({
                        isContrastMode: !this.state.isContrastMode,
                      })
                    }
                  />
                ) : (
                  <ScaleContrastRatio
                    {...this.props}
                    onSwitchMode={() =>
                      this.setState({
                        isContrastMode: !this.state.isContrastMode,
                      })
                    }
                  />
                )}
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER.isActive()}
                >
                  <SimpleItem
                    id="update-easing"
                    leftPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus
                        ).SCALE_HELPER_DISTRIBUTION.isActive()}
                      >
                        <this.DistributionEasing />
                      </Feature>
                    }
                    rightPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus
                        ).SCALE_HELPER_TIPS.isActive()}
                      >
                        <div className={layouts['snackbar--tight']}>
                          <Button
                            type="tertiary"
                            label={this.props.locals.scale.howTo}
                            action={() =>
                              window
                                .open(
                                  'https://uicp.ylb.lt/how-to-adjust',
                                  '_blank'
                                )
                                ?.focus()
                            }
                          />
                          <span
                            className={doClassnames([
                              texts.type,
                              texts['type--secondary'],
                            ])}
                          >
                            {this.props.locals.separator}
                          </span>
                          <Button
                            type="tertiary"
                            label={this.props.locals.scale.keyboardShortcuts}
                            action={() =>
                              this.setState({
                                isTipsOpen: true,
                              })
                            }
                          />
                        </div>
                      </Feature>
                    }
                    alignment="BASELINE"
                  />
                  {this.state.isTipsOpen && <this.KeyboardShortcuts />}
                </Feature>
              </>
            ),
            typeModifier: 'DISTRIBUTED',
          },
        ]}
        isFullHeight
      />
    )
  }

  Edit = () => {
    return (
      <Layout
        id="scale"
        column={[
          {
            node: (
              <>
                {!this.state.isContrastMode ? (
                  <ScaleLightnessChroma
                    {...this.props}
                    onSwitchMode={() =>
                      this.setState({
                        isContrastMode: !this.state.isContrastMode,
                      })
                    }
                  />
                ) : (
                  <ScaleContrastRatio
                    {...this.props}
                    onSwitchMode={() =>
                      this.setState({
                        isContrastMode: !this.state.isContrastMode,
                      })
                    }
                  />
                )}
                <Feature
                  isActive={Scale.features(
                    this.props.planStatus
                  ).SCALE_HELPER.isActive()}
                >
                  <SimpleItem
                    id="update-easing"
                    leftPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus
                        ).SCALE_HELPER_DISTRIBUTION.isActive()}
                      >
                        <this.DistributionEasing />
                      </Feature>
                    }
                    rightPartSlot={
                      <Feature
                        isActive={Scale.features(
                          this.props.planStatus
                        ).SCALE_HELPER_TIPS.isActive()}
                      >
                        <div className={layouts['snackbar--tight']}>
                          <Button
                            type="tertiary"
                            label={this.props.locals.scale.howTo}
                            action={() =>
                              window
                                .open(
                                  'https://uicp.ylb.lt/how-to-adjust',
                                  '_blank'
                                )
                                ?.focus()
                            }
                          />
                          <span
                            className={doClassnames([
                              texts.type,
                              texts['type--secondary'],
                            ])}
                          >
                            {this.props.locals.separator}
                          </span>
                          <Button
                            type="tertiary"
                            label={this.props.locals.scale.keyboardShortcuts}
                            action={() =>
                              this.setState({
                                isTipsOpen: true,
                              })
                            }
                          />
                        </div>
                      </Feature>
                    }
                    alignment="BASELINE"
                  />
                  {this.state.isTipsOpen && <this.KeyboardShortcuts />}
                </Feature>
              </>
            ),
            typeModifier: 'DISTRIBUTED',
          },
        ]}
        isFullHeight
      />
    )
  }

  // Render
  render() {
    if (this.props.service === 'EDIT') return <this.Edit />
    else return <this.Create />
  }
}