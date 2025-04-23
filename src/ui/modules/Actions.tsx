import {
  Bar,
  Button,
  Dropdown,
  DropdownOption,
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
  DatesConfiguration,
  DocumentConfiguration,
  ScaleConfiguration,
  SourceColorConfiguration,
  ViewConfiguration,
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
  dates?: DatesConfiguration
  creatorIdentity?: CreatorConfiguration
  userSession?: UserSession
  exportType?: string
  document?: DocumentConfiguration
  planStatus: PlanStatus
  lang: Language
  isPrimaryLoading?: boolean
  isSecondaryLoading?: boolean
  onCreatePalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onSyncLocalStyles?: (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => void
  onChangeDocument?: (view?: ViewConfiguration) => void
  onExportPalette?: React.MouseEventHandler<HTMLButtonElement> &
    React.KeyboardEventHandler<HTMLButtonElement>
  onChangeSettings?: React.Dispatch<Partial<AppStates>>
}

interface ActionsStates {
  isTooltipVisible: boolean
  canUpdateDocument: boolean
}

export default class Actions extends PureComponent<ActionsProps, ActionsStates> {
  private palette: typeof $palette

  static defaultProps = {
    sourceColors: [],
    scale: {},
    document: {},
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
    VIEWS: new FeatureStatus({
      features: features,
      featureName: 'VIEWS',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE',
      planStatus: planStatus,
    }),
    VIEWS_PALETTE_WITH_PROPERTIES: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_PALETTE_WITH_PROPERTIES',
      planStatus: planStatus,
    }),
    VIEWS_SHEET: new FeatureStatus({
      features: features,
      featureName: 'VIEWS_SHEET',
      planStatus: planStatus,
    }),
  })

  constructor(props: ActionsProps) {
    super(props)
    this.palette = $palette
    this.state = {
      isTooltipVisible: false,
      canUpdateDocument: false,
    }
  }

  // Lifecycle
  componentDidUpdate = () => {
    if (
      this.props.document &&
      Object.entries(this.props.document).length > 0 &&
      this.props.document.updatedAt !== this.props.dates?.updatedAt &&
      this.props.document.id === this.props.id
    )
      this.setState({
        canUpdateDocument: true,
      })
    else
      this.setState({
        canUpdateDocument: false,
      })
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

  onChangeView = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const currentElement = e.currentTarget as HTMLInputElement

    this.props.onChangeDocument?.(
      currentElement.dataset.value as ViewConfiguration
    )

    parent.postMessage(
      {
        pluginMessage: {
          type: 'UPDATE_DOCUMENT',
          view: currentElement.dataset.value,
        },
      },
      '*'
    )
  }

  documentHandler = (e: Event) => {
    const currentElement = e.currentTarget as HTMLInputElement

    const generateSheet = () => {
      this.props.onChangeDocument?.()
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
      this.props.onChangeDocument?.()
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
      this.props.onChangeDocument?.()
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

    const pushUpdates = () => {
      this.props.onChangeDocument?.()
      parent.postMessage(
        {
          pluginMessage: {
            type: 'UPDATE_DOCUMENT',
            view: this.props.document?.view ?? 'PALETTE',
          },
        },
        '*'
      )
    }

    const actions: ActionsList = {
      GENERATE_SHEET: () => generateSheet(),
      GENERATE_PALETTE_WITH_PROPERTIES: () => generatePaletteWithProperties(),
      GENERATE_PALETTE: () => generatePalette(),
      PUSH_UPDATES: () => pushUpdates(),
    }

    return actions[currentElement.dataset.feature ?? 'DEFAULT']?.()
  }

  optionsHandler = () => {
    const options = [
      {
        label: 'Generate a document',
        value: 'DOCUMENT',
        type: 'OPTION',
        children: [
          {
            label: 'Generate a color sheet document',
            feature: 'GENERATE_SHEET',
            type: 'OPTION',
            action: this.documentHandler,
          },
          {
            label: 'Generate a color palette with properties',
            feature: 'GENERATE_PALETTE_WITH_PROPERTIES',
            type: 'OPTION',
            action: this.documentHandler,
          },
          {
            label: 'Generate a color palette',
            feature: 'GENERATE_PALETTE',
            type: 'OPTION',
            action: this.documentHandler,
          },
        ],
      },
    ] as Array<DropdownOption>

    if (this.state.canUpdateDocument)
      options.push({
        label: 'Push changes to the document',
        feature: 'PUSH_UPDATES',
        type: 'OPTION',
        action: this.documentHandler,
      })

    return options
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
            {this.props.document &&
              Object.keys(this.props.document).length > 0 && (
                <Dropdown
                  id="views"
                  options={[
                    {
                      label:
                        locals[this.props.lang].settings.global.views.detailed,
                      value: 'PALETTE_WITH_PROPERTIES',
                      type: 'OPTION',
                      isActive: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE_WITH_PROPERTIES.isActive(),
                      isBlocked: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE_WITH_PROPERTIES.isBlocked(),
                      isNew: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE_WITH_PROPERTIES.isNew(),
                      action: this.onChangeView,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.global.views.simple,
                      value: 'PALETTE',
                      type: 'OPTION',
                      isActive: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE.isActive(),
                      isBlocked: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE.isBlocked(),
                      isNew: Actions.features(
                        this.props.planStatus
                      ).VIEWS_PALETTE.isNew(),
                      action: this.onChangeView,
                    },
                    {
                      label:
                        locals[this.props.lang].settings.global.views.sheet,
                      value: 'SHEET',
                      type: 'OPTION',
                      isActive: Actions.features(
                        this.props.planStatus
                      ).VIEWS_SHEET.isActive(),
                      isBlocked: Actions.features(
                        this.props.planStatus
                      ).VIEWS_SHEET.isBlocked(),
                      isNew: Actions.features(
                        this.props.planStatus
                      ).VIEWS_SHEET.isNew(),
                      action: this.onChangeView,
                    },
                  ]}
                  selected={this.props.document.view}
                  isBlocked={Actions.features(
                    this.props.planStatus
                  ).VIEWS.isBlocked()}
                  isNew={Actions.features(this.props.planStatus).VIEWS.isNew()}
                />
              )}
          </div>
        }
        rightPartSlot={
          <div className={layouts['snackbar--medium']}>
            <Menu
              id="display-more-actions"
              type="ICON"
              icon="ellipses"
              options={this.optionsHandler()}
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
