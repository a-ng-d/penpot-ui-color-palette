import {
  ActionsItem,
  Button,
  Dialog,
  List,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { createPortal } from 'react-dom'
import { FullConfiguration } from '../../types/configurations'
import features from '../../config'
import { BaseProps, PlanStatus } from '../../types/app'
import { ActionsList } from '../../types/models'
import setPaletteMeta from '../../utils/setPaletteMeta'
import Feature from '../components/Feature'

interface InternalPalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullConfiguration>
  isDeleteDialogOpen: boolean
  targetedPaletteId: string
  targetedPaletteName: string
}

export default class InternalPalettes extends PureComponent<
  BaseProps,
  InternalPalettesStates
> {
  static features = (planStatus: PlanStatus) => ({
    OPEN_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'OPEN_PALETTE',
      planStatus: planStatus,
    }),
    DELETE_PALETTE: new FeatureStatus({
      features: features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
    }),
  })

  constructor(props: BaseProps) {
    super(props)
    this.state = {
      paletteListsStatus: 'LOADING',
      paletteLists: [],
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
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

  onDeletePalette = () => {
    this.setState({
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
    })

    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_PALETTE',
          id: this.state.targetedPaletteId,
        },
      },
      '*'
    )
    parent.postMessage({ pluginMessage: { type: 'GET_PALETTES' } }, '*')
  }

  // Templates
  Modals = () => {
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
                title={this.props.locals.browse.deletePaletteDialog.title}
                actions={{
                  destructive: {
                    label: this.props.locals.browse.deletePaletteDialog.delete,
                    feature: 'DELETE_PALETTE',
                    action: this.onDeletePalette,
                  },
                  secondary: {
                    label: this.props.locals.browse.deletePaletteDialog.cancel,
                    action: () =>
                      this.setState({
                        isDeleteDialogOpen: false,
                        targetedPaletteId: '',
                        targetedPaletteName: '',
                      }),
                  },
                }}
                onClose={() =>
                  this.setState({
                    isDeleteDialogOpen: false,
                    targetedPaletteId: '',
                    targetedPaletteName: '',
                  })
                }
              >
                <div className="dialog__text">
                  <p className={texts.type}>
                    {this.props.locals.browse.deletePaletteDialog.message.replace(
                      '$1',
                      this.state.targetedPaletteName
                    )}
                  </p>
                </div>
              </Dialog>,
              document.getElementById('modal') ?? document.createElement('app')
            )}
        </Feature>
      </>
    )
  }

  InternalPalettesList = () => {
    return (
      <List
        isLoading={this.state.paletteListsStatus === 'LOADING'}
        isMessage={this.state.paletteListsStatus === 'EMPTY'}
      >
        {this.state.paletteListsStatus === 'LOADED' && (
          <>
            {this.state.paletteLists
              .sort(
                (a, b) =>
                  new Date(b.meta.dates.updatedAt).getTime() -
                  new Date(a.meta.dates.updatedAt).getTime()
              )
              .map((palette, index) => {
                const enabledThemeIndex = palette.themes.findIndex(
                  (theme) => theme.isEnabled
                )

                return (
                  <ActionsItem
                    id={palette.meta.id}
                    key={`palette-${index}`}
                    name={
                      palette.base.name === ''
                        ? this.props.locals.name
                        : palette.base.name
                    }
                    description={palette.base.preset.name}
                    subdescription={setPaletteMeta(
                      palette.base.colors,
                      palette.themes
                    )}
                    actionsSlot={
                      <>
                        <Feature
                          isActive={InternalPalettes.features(
                            this.props.planStatus
                          ).OPEN_PALETTE.isActive()}
                        >
                          <Button
                            type="icon"
                            icon="trash"
                            helper={{
                              label:
                                this.props.locals.browse.actions.deletePalette,
                            }}
                            isBlocked={InternalPalettes.features(
                              this.props.planStatus
                            ).DELETE_PALETTE.isBlocked()}
                            isNew={InternalPalettes.features(
                              this.props.planStatus
                            ).DELETE_PALETTE.isNew()}
                            action={() =>
                              this.setState({
                                isDeleteDialogOpen: true,
                                targetedPaletteId: palette.meta.id,
                                targetedPaletteName: palette.base.name,
                              })
                            }
                          />
                        </Feature>
                        <Feature
                          isActive={InternalPalettes.features(
                            this.props.planStatus
                          ).OPEN_PALETTE.isActive()}
                        >
                          <Button
                            type="secondary"
                            label={this.props.locals.browse.actions.editPalette}
                            isBlocked={InternalPalettes.features(
                              this.props.planStatus
                            ).OPEN_PALETTE.isBlocked()}
                            isNew={InternalPalettes.features(
                              this.props.planStatus
                            ).OPEN_PALETTE.isNew()}
                            action={() => this.onEditPalette(palette.meta.id)}
                          />
                        </Feature>
                      </>
                    }
                    complementSlot={
                      <div className="preview__rows">
                        {palette.data.themes[enabledThemeIndex].colors.map(
                          (color, index) => (
                            <div
                              key={`color-${index}`}
                              className="preview__row"
                            >
                              {color.shades.map((shade, shadeIndex) => (
                                <div
                                  key={`color-${index}-${shadeIndex}`}
                                  className="preview__cell"
                                  style={{
                                    backgroundColor: shade.hex,
                                  }}
                                />
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    }
                  />
                )
              })}
          </>
        )}
        {this.state.paletteListsStatus === 'EMPTY' && (
          <SemanticMessage
            type="NEUTRAL"
            message={`${this.props.locals.warning.noPaletteOnCurrrentPage}`}
          />
        )}
      </List>
    )
  }

  // Render
  render() {
    return (
      <>
        <this.InternalPalettesList />
        <this.Modals />
      </>
    )
  }
}
