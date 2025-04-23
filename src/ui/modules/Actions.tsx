import {
  Bar,
  Button,
  Icon,
  Input,
  layouts,
  Menu,
  texts,
  Tooltip,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { UserSession } from 'src/types/user'
import features from '../../config'
import { locals } from '../../content/locals'
import { $palette } from '../../stores/palette'
import { Language, PlanStatus, Service } from '../../types/app'
import {
  CreatorConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
} from '../../types/configurations'
import { AppStates } from '../App'
import Feature from '../components/Feature'
import { ActionsList } from 'src/types/models'

interface ActionsProps {
  service: Service
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  scale: ScaleConfiguration
  name?: string
  creatorIdentity?: CreatorConfiguration
  userSession?: UserSession
  exportType?: string
  planStatus: PlanStatus
  lang: Language
  isPrimaryLoading?: boolean
  isSecondaryLoading?: boolean
  onCreatePalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onSyncLocalStyles?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onGenerateDocument?: () => void
  onExportPalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onChangeSettings?: React.Dispatch<Partial<AppStates>>
}

interface ActionsStates {
  isTooltipVisible: boolean
}

export default class Actions extends PureComponent<ActionsProps, ActionsStates> {
  private palette: typeof $palette

  static defaultProps = {
    sourceColors: [],
    scale: {},
  }

  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    SOURCE: new FeatureStatus({
      features: features,
      featureName: 'SOURCE',
      planStatus: planStatus,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
    SYNC_LOCAL_STYLES: new FeatureStatus({
      features: features,
      featureName: 'SYNC_LOCAL_STYLES',
      planStatus: planStatus,
    }),
    PUBLISH_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'PUBLISH_PALETTE',
      planStatus: planStatus,
    }),
    SETTINGS_NAME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_NAME',
      planStatus: planStatus,
    }),
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
    }),
  })

  constructor(props: ActionsProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isTooltipVisible: false,
    }
  }

  // Handlers
  nameHandler = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    this.palette.setKey('name', e.currentTarget.value)
    if (this.props.onChangeSettings)
      this.props.onChangeSettings({
        name: e.currentTarget.value,
      })
    if (this.props.service === 'EDIT')
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_PALETTE',
            id: this.props.id,
            items: [
              {
                key: 'base.name',
                value: e.currentTarget.value,
              },
            ],
          },
        },
        '*'
      )
  }

  documentHandler = (e: Event) => {
    const currentElement = e.currentTarget as HTMLInputElement

    const generateSheet = () => {
      this.props.onGenerateDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'SHEET',
          },
        },
        '*'
      )
    }

    const generatePaletteWithProperties = () => {
      this.props.onGenerateDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE_WITH_PROPERTIES',
          },
        },
        '*'
      )
    }

    const generatePalette = () => {
      this.props.onGenerateDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'CREATE_DOCUMENT',
            id: this.props.id,
            view: 'PALETTE',
          },
        },
        '*'
      )
    }

    const actions: ActionsList = {
      GENERATE_SHEET: () => generateSheet(),
      GENERATE_PALETTE_WITH_PROPERTIES: () => generatePaletteWithProperties(),
      GENERATE_PALETTE: () => generatePalette(),
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  // Templates
  Create = () => {
    return (
      <Bar
        leftPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Input
              id="update-palette-name"
              type="TEXT"
              placeholder={locals[this.props.lang].name}
              value={this.props.name !== '' ? this.props.name : ''}
              charactersLimit={64}
              isBlocked={Actions.features(
                this.props.planStatus
              ).SETTINGS_NAME.isBlocked()}
              isNew={Actions.features(
                this.props.planStatus
              ).SETTINGS_NAME.isNew()}
              feature="RENAME_PALETTE"
              onChange={this.nameHandler}
              onFocus={this.nameHandler}
              onBlur={this.nameHandler}
            />
            <span
              className={doClassnames([
                texts['type'],
                texts['type--secondary'],
              ])}
            >
              {locals[this.props.lang].separator}
            </span>
            <div className={texts.type}>
              {this.props.sourceColors.length > 1
                ? locals[
                    this.props.lang
                  ].actions.sourceColorsNumber.several.replace(
                    '$1',
                    this.props.sourceColors.length
                  )
                : locals[
                    this.props.lang
                  ].actions.sourceColorsNumber.single.replace(
                    '$1',
                    this.props.sourceColors.length
                  )}
            </div>
            {Actions.features(this.props.planStatus).SOURCE.isReached(
              this.props.sourceColors.length - 1
            ) && (
              <div
                style={{
                  position: 'relative',
                }}
                onMouseEnter={() =>
                  this.setState({
                    isTooltipVisible: true,
                  })
                }
                onMouseLeave={() =>
                  this.setState({
                    isTooltipVisible: false,
                  })
                }
              >
                <Icon
                  type="PICTO"
                  iconName="warning"
                />
                {this.state.isTooltipVisible && (
                  <Tooltip>
                    {locals[
                      this.props.lang
                    ].info.maxNumberOfSourceColors.replace(
                      '$1',
                      Actions.features(this.props.planStatus).SOURCE.limit
                    )}
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        }
        rightPartSlot={
          <Feature
            isActive={Actions.features(
              this.props.planStatus
            ).CREATE_PALETTE.isActive()}
          >
            <Button
              type="primary"
              label={locals[this.props.lang].actions.createPalette}
              feature="CREATE_PALETTE"
              isDisabled={this.props.sourceColors.length === 0}
              isBlocked={
                Actions.features(this.props.planStatus).SOURCE.isReached(
                  this.props.sourceColors.length - 1
                ) ||
                Actions.features(
                  this.props.planStatus
                ).PRESETS_CUSTOM_ADD.isReached(
                  Object.keys(this.props.scale).length - 1
                )
              }
              isLoading={this.props.isPrimaryLoading}
              action={this.props.onCreatePalette}
            />
          </Feature>
        }
        border={[]}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  Deploy = () => {
    return (
      <Bar
        leftPartSlot={
          <Input
            id="update-palette-name"
            type="TEXT"
            placeholder={locals[this.props.lang].name}
            value={this.props.name !== '' ? this.props.name : ''}
            charactersLimit={64}
            isBlocked={Actions.features(
              this.props.planStatus
            ).SETTINGS_NAME.isBlocked()}
            isNew={Actions.features(
              this.props.planStatus
            ).SETTINGS_NAME.isNew()}
            feature="RENAME_PALETTE"
            onChange={this.nameHandler}
            onFocus={this.nameHandler}
            onBlur={this.nameHandler}
          />
        }
        rightPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Menu
              id="display-more-actions"
              type="ICON"
              icon="ellipses"
              options={[
                {
                  label: 'Generate a document',
                  value: 'DOCUMENT',
                  type: 'OPTION',
                  children: [
                    {
                      label: 'Generate a color sheet document',
                      value: 'DOCUMENT_SHEET',
                      feature: 'GENERATE_SHEET',
                      type: 'OPTION',
                      action: this.documentHandler,
                    },
                    {
                      label: 'Generate a color palette with properties',
                      value: 'DOCUMENT_PALETTE_WITH_PROPERTIES',
                      feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
                      type: 'OPTION',
                      action: this.documentHandler,
                    },
                    {
                      label: 'Generate a color palette',
                      value: 'DOCUMENT_PALETTE',
                      feature: 'GENERATE_PALETTE',
                      type: 'OPTION',
                      action: this.documentHandler,
                    },
                  ],
                  action: (e) => this.props.onSyncLocalStyles?.(e),
                },
              ]}
              alignment="TOP_RIGHT"
              state={this.props.isSecondaryLoading ? 'LOADING' : 'DEFAULT'}
            />
            <Feature
              isActive={Actions.features(
                this.props.planStatus ?? 'UNPAID'
              ).SYNC_LOCAL_STYLES.isActive()}
            >
              <Button
                type="primary"
                label={locals[this.props.lang].actions.createLocalStyles}
                isBlocked={Actions.features(
                  this.props.planStatus ?? 'UNPAID'
                ).SYNC_LOCAL_STYLES.isBlocked()}
                isNew={Actions.features(
                  this.props.planStatus ?? 'UNPAID'
                ).SYNC_LOCAL_STYLES.isNew()}
                action={this.props.onSyncLocalStyles}
                isLoading={this.props.isPrimaryLoading}
              />
            </Feature>
          </div>
        }
        border={[]}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  Export = () => {
    return (
      <Bar
        rightPartSlot={
          <Button
            type="primary"
            label={this.props.exportType}
            feature="EXPORT_PALETTE"
            action={this.props.onExportPalette}
          >
            <a></a>
          </Button>
        }
        border={['TOP']}
        padding="var(--size-xxsmall) var(--size-xsmall)"
      />
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.service === 'CREATE' && <this.Create />}
        {this.props.service === 'EDIT' && <this.Deploy />}
        {this.props.service === 'TRANSFER' && <this.Export />}
      </>
    )
  }
}
