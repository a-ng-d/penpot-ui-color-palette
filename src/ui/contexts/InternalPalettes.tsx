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
import { FullConfiguration } from 'src/types/configurations'
import features from '../../config'
import { locals } from '../../content/locals'
import { Language, PlanStatus } from '../../types/app'
import { ActionsList } from '../../types/models'
import getPaletteMeta from '../../utils/setPaletteMeta'
import Feature from '../components/Feature'

interface InternalPalettesProps {
  planStatus: PlanStatus
  lang: Language
}

interface InternalPalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullConfiguration>
  isDeleteDialogOpen: boolean
  targetedPaletteId: string
  targetedPaletteName: string
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

  onDeletePalette = () => {
    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_PALETTE',
          id: this.state.targetedPaletteId,
        },
      },
      '*'
    )
    this.setState({
      isDeleteDialogOpen: false,
      targetedPaletteId: '',
      targetedPaletteName: '',
    })
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
                title={locals[this.props.lang].browse.deletePaletteDialog.title}
                actions={{
                  destructive: {
                    label:
                      locals[this.props.lang].browse.deletePaletteDialog.delete,
                    feature: 'DELETE_PALETTE',
                    action: this.onDeletePalette,
                  },
                  secondary: {
                    label:
                      locals[this.props.lang].browse.deletePaletteDialog.cancel,
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
                    {locals[
                      this.props.lang
                    ].browse.deletePaletteDialog.message.replace(
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
              .map((palette, index) => (
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
                            locals[this.props.lang].browse.actions
                              .deletePalette,
                        }}
                        action={() =>
                          this.setState({
                            isDeleteDialogOpen: true,
                            targetedPaletteId: palette.meta.id,
                            targetedPaletteName: palette.base.name,
                          })
                        }
                      />
                      <Button
                        type="secondary"
                        label={
                          locals[this.props.lang].browse.actions.editPalette
                        }
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
    return (
      <>
        <this.InternalPalettesList />
        <this.Modals />
      </>
    )
  }
}
