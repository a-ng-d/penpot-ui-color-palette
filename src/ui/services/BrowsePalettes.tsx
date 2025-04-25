import { Bar, Button, layouts, Tabs } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { ActionsList } from 'src/types/models'
import features from '../../config'
import { $palette } from '../../stores/palette'
import { BaseProps, Context, ContextItem, PlanStatus } from '../../types/app'
import { DocumentConfiguration } from '../../types/configurations'
import { setContexts } from '../../utils/setContexts'
import { AppStates } from '../App'
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
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    LIBRARY_FILE: new FeatureStatus({
      features: features,
      featureName: 'LIBRARY_FILE',
      planStatus: planStatus,
    }),
    LIBRARY_PAGE: new FeatureStatus({
      features: features,
      featureName: 'LIBRARY_PAGE',
      planStatus: planStatus,
    }),
  })

  constructor(props: BrowsePalettesProps) {
    super(props)
    this.palette = $palette
    this.contexts = setContexts(
      ['LIBRARY_PAGE', 'LIBRARY_FILE'],
      props.planStatus
    )
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
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              action={this.navHandler}
            />
          }
          rightPartSlot={
            <div className={layouts['snackbar--medium']}>
              {this.props.document.isLinkedToPalette !== undefined &&
                this.props.document.isLinkedToPalette && (
                  <Button
                    type="secondary"
                    label="Open document"
                    action={this.onEditPalette}
                  />
                )}
              {this.props.document.isLinkedToPalette !== undefined &&
                !this.props.document.isLinkedToPalette && (
                  <Button
                    type="secondary"
                    label="Create from the document"
                    action={this.onCreateFromDocument}
                  />
                )}
              <Button
                type="primary"
                icon="plus"
                label="New UI Color Palette"
                action={this.onCreatePalette}
              />
            </div>
          }
        />
        <section className="context">{fragment}</section>
      </>
    )
  }
}
