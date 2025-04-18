import { ActionsItem, Button, List, SemanticMessage } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { FullPaletteConfiguration } from 'src/types/configurations'
import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import { ActionsList } from '../../types/models'
import getPaletteMeta from '../../utils/setPaletteMeta'

interface InternalPalettesProps {
  planStatus: PlanStatus
  lang: Language
}

interface InternalPalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullPaletteConfiguration>
  isDeleteDialogOpen: boolean
}

export default class InternalPalettes extends PureComponent<
  InternalPalettesProps,
  InternalPalettesStates
> {
  static features = (planStatus: PlanStatus) => ({
    DELETE_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
    }),
  })

  constructor(props: InternalPalettesProps) {
    super(props)
    this.state = {
      paletteListsStatus: 'LOADING',
      paletteLists: [],
      isDeleteDialogOpen: false,
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
    const path = e.data

    const actions: ActionsList = {
      EXPOSE_PALETTES: () =>
        this.setState({
          paletteListsStatus: path.data.length > 0 ? 'LOADED' : 'EMPTY',
          paletteLists: path.data,
        }),
      LOAD_PALETTES: () => this.setState({ paletteListsStatus: 'LOADING' }),
      DEFAULT: () => null,
    }

    return actions[path.type ?? 'DEFAULT']?.()
  }

  // Direct Actions
  getImageSrc = (screenshot: Uint8Array | null) => {
    if (screenshot !== null) {
      const blob = new Blob([screenshot], {
        type: 'image/png',
      })
      return URL.createObjectURL(blob)
    } else return ''
  }

  onEditPalette = (id: string) => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'JUMP_TO_PALETTE',
          id: id,
        },
      },
      '*'
    )
  }

  // Templates
  /*Modals = () => {
    return (
      <>
        <Feature
          isActive={
            InternalPalettes.features(
              this.props.planStatus
            ).DELETE_PALETTE.isActive() && this.state.isDeleteDialogOpen
          }
        >
          {document.getElementById('modal') &&
            createPortal(
              <Dialog
                title={
                  locals[this.props.lang].settings.deleteActivityDialog.title
                }
                actions={{
                  destructive: {
                    label:
                      locals[this.props.lang].settings.deleteActivityDialog
                        .delete,
                    feature: 'DELETE_PALETTE',
                    action: this.props.onChangeActivities,
                  },
                  secondary: {
                    label:
                      locals[this.props.lang].settings.deleteActivityDialog
                        .cancel,
                    action: () => this.setState({ isDeleteDialogOpen: false }),
                  },
                }}
                onClose={() => this.setState({ isDeleteDialogOpen: false })}
              >
                <div className="dialog__text">
                  <p className={texts.type}>
                    {locals[
                      this.props.lang
                    ].settings.deleteActivityDialog.message.replace(
                      '$1',
                      this.props.activity.name
                    )}
                  </p>
                </div>
              </Dialog>,
              document.getElementById('modal') ?? document.createElement('app')
            )}
        </Feature>
      </>
    )
  }*/

  InternalPalettesList = () => {
    return (
      <List
        isLoading={this.state.paletteListsStatus === 'LOADING'}
        isMessage={this.state.paletteListsStatus === 'EMPTY'}
      >
        {this.state.paletteListsStatus === 'LOADED' && (
          <>
            {this.state.paletteLists.map((palette, index) => (
              <ActionsItem
                id={palette.meta.id}
                key={`palette-${index}`}
                name={
                  palette.base.name === ''
                    ? locals[this.props.lang].name
                    : palette.base.name
                }
                description={palette.base.preset.name}
                subdescription={getPaletteMeta(
                  palette.base.colors,
                  palette.base.themes
                )}
                actionsSlot={
                  <>
                    <Button
                      type="icon"
                      icon="trash"
                      helper={{
                        label:
                          locals[this.props.lang].palettes.actions
                            .selectPalette,
                      }}
                      action={() => null}
                    />
                    <Button
                      type="secondary"
                      helper={{
                        label:
                          locals[this.props.lang].palettes.actions
                            .selectPalette,
                      }}
                      label="Edit palette"
                      action={() => this.onEditPalette(palette.meta.id)}
                    />
                  </>
                }
              />
            ))}
          </>
        )}
        {this.state.paletteListsStatus === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={`${locals[this.props.lang].warning.noPaletteOnCurrrentPage}`}
          />
        )}
      </List>
    )
  }

  // Render
  render() {
    return <this.InternalPalettesList />
  }
}
