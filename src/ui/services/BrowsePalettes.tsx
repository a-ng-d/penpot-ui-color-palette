import { Bar, Button, layouts, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { ActionsList } from '../../types/models'
import features from '../../config'
import { BaseProps, Context, ContextItem, PlanStatus } from '../../types/app'
import { DocumentConfiguration } from '../../types/configurations'
import { setContexts } from '../../utils/setContexts'
import { AppStates } from '../App'
import Feature from '../components/Feature'
import InternalPalettes from '../contexts/InternalPalettes'

interface BrowsePalettesProps extends BaseProps {
  document: DocumentConfiguration
  onCreatePalette: React.Dispatch<Partial<AppStates>>
}

interface BrowsePalettesStates {
  context: Context | ''
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class BrowsePalettes extends PureComponent<
  BrowsePalettesProps,
  BrowsePalettesStates
> {
  private contexts: Array<ContextItem>

  static features = (planStatus: PlanStatus) => ({
    LIBRARY_PAGE: new FeatureStatus({
      features: features,
      featureName: 'LIBRARY_PAGE',
      planStatus: planStatus,
    }),
    DOCUMENT_OPEN: new FeatureStatus({
      features: features,
      featureName: 'DOCUMENT_OPEN',
      planStatus: planStatus,
    }),
    DOCUMENT_CREATE: new FeatureStatus({
      features: features,
      featureName: 'DOCUMENT_CREATE',
      planStatus: planStatus,
    }),
    CREATE_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'CREATE_PALETTE',
      planStatus: planStatus,
    }),
  })

  constructor(props: BrowsePalettesProps) {
    super(props)
    this.contexts = setContexts(['LIBRARY_PAGE'], props.planStatus)
    this.state = {
      context: this.contexts[0].id,
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    parent.postMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')

    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: ActionsList = {
      STOP_LOADER: () =>
        this.setState({
          isPrimaryLoading: false,
          isSecondaryLoading: false,
        }),
      DEFAULT: () => null,
    }

    return actions[e.data.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Direct Actions
  onCreatePalette = () => {
    this.props.onCreatePalette({
      service: 'CREATE',
    })
  }

  onEditPalette = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: this.props.document.id,
        },
      },
      '*'
    )
  }

  onCreateFromDocument = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE_FROM_DOCUMENT',
        },
      },
      '*'
    )
  }

  // Renders
  render() {
    let fragment

    switch (this.state.context) {
      case 'LIBRARY_PAGE': {
        fragment = <InternalPalettes {...this.props} />
        break
      }
    }

    return (
      <>
        <Bar
          leftPartSlot={
            <span className={doClassnames([texts.type, texts.label])}>
              {this.props.locals.palettes.devMode.title}
            </span>
          }
          rightPartSlot={
            <div className={layouts['snackbar--medium']}>
              {this.props.document.isLinkedToPalette !== undefined &&
                this.props.document.isLinkedToPalette && (
                  <Feature
                    isActive={BrowsePalettes.features(
                      this.props.planStatus
                    ).DOCUMENT_OPEN.isActive()}
                  >
                    <Button
                      type="secondary"
                      label={this.props.locals.browse.document.open}
                      isBlocked={BrowsePalettes.features(
                        this.props.planStatus
                      ).DOCUMENT_OPEN.isBlocked()}
                      isNew={BrowsePalettes.features(
                        this.props.planStatus
                      ).DOCUMENT_OPEN.isNew()}
                      action={this.onEditPalette}
                    />
                  </Feature>
                )}
              {this.props.document.isLinkedToPalette !== undefined &&
                !this.props.document.isLinkedToPalette && (
                  <Feature
                    isActive={BrowsePalettes.features(
                      this.props.planStatus
                    ).DOCUMENT_CREATE.isActive()}
                  >
                    <Button
                      type="secondary"
                      label={this.props.locals.browse.document.create}
                      isBlocked={BrowsePalettes.features(
                        this.props.planStatus
                      ).DOCUMENT_CREATE.isBlocked()}
                      isNew={BrowsePalettes.features(
                        this.props.planStatus
                      ).DOCUMENT_CREATE.isNew()}
                      action={this.onCreateFromDocument}
                    />
                  </Feature>
                )}
              <Feature
                isActive={BrowsePalettes.features(
                  this.props.planStatus
                ).CREATE_PALETTE.isActive()}
              >
                <Button
                  type="primary"
                  icon="plus"
                  label={this.props.locals.browse.actions.new}
                  isBlocked={BrowsePalettes.features(
                    this.props.planStatus
                  ).CREATE_PALETTE.isBlocked()}
                  isNew={BrowsePalettes.features(
                    this.props.planStatus
                  ).CREATE_PALETTE.isNew()}
                  action={this.onCreatePalette}
                />
              </Feature>
            </div>
          }
        />
        <section className="context">{fragment}</section>
      </>
    )
  }
}
