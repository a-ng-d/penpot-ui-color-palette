import {
  Section,
  SectionTitle,
  Select,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { $canStylesDeepSync } from '../../stores/preferences'
import features from '../../config'
import { BaseProps, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'

interface SyncPreferencesProps extends BaseProps {
  isLast?: boolean
}

interface SyncPreferencesStates {
  canStylesDeepSync: boolean
}

export default class SyncPreferences extends PureComponent<
  SyncPreferencesProps,
  SyncPreferencesStates
> {
  private subscribeStyles: (() => void) | undefined

  static features = (planStatus: PlanStatus) => ({
    SETTINGS_SYNC_DEEP_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_DEEP_PALETTE',
      planStatus: planStatus,
    }),
    SETTINGS_SYNC_DEEP_STYLES: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_SYNC_DEEP_STYLES',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: SyncPreferencesProps) {
    super(props)
    this.state = {
      canStylesDeepSync: false,
    }
  }

  // Lifecycle
  componentDidMount() {
    this.subscribeStyles = $canStylesDeepSync.subscribe((value) => {
      this.setState({ canStylesDeepSync: value })
    })
  }

  componentWillUnmount() {
    if (this.subscribeStyles) this.subscribeStyles()
  }

  // Templates
  StylesDeepSync = () => {
    return (
      <Feature
        isActive={SyncPreferences.features(
          this.props.planStatus
        ).SETTINGS_SYNC_DEEP_STYLES.isActive()}
      >
        <Select
          id="update-styles-deep-sync"
          type="SWITCH_BUTTON"
          name="update-styles-deep-sync"
          label={this.props.locals.settings.preferences.sync.styles.label}
          isChecked={this.state.canStylesDeepSync}
          isBlocked={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isBlocked()}
          isNew={SyncPreferences.features(
            this.props.planStatus
          ).SETTINGS_SYNC_DEEP_STYLES.isNew()}
          feature="UPDATE_STYLES_DEEP_SYNC"
          action={() => {
            $canStylesDeepSync.set(!this.state.canStylesDeepSync)
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'can_deep_sync_styles',
                      value: !this.state.canStylesDeepSync,
                    },
                  ],
                },
              },
              '*'
            )
          }}
        />
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <Section
        title={
          <SimpleItem
            leftPartSlot={
              <SectionTitle
                label={this.props.locals.settings.preferences.sync.title}
              />
            }
            isListItem={false}
            alignment="CENTER"
          />
        }
        body={[
          {
            node: <this.StylesDeepSync />,
          },
          {
            node: (
              <SemanticMessage
                type="INFO"
                message={this.props.locals.settings.preferences.sync.message}
              />
            ),
          },
        ]}
        border={this.props.isLast ? ['BOTTOM'] : undefined}
      />
    )
  }
}
