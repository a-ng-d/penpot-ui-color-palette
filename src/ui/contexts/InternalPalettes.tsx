import {
  ActionsItem,
  Button,
  List,
  SemanticMessage,
  texts,
} from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { doClassnames } from '@a_ng_d/figmug-utils'
import { locals } from '../../content/locals'
import { Language } from '../../types/app'
import { ActionsList } from '../../types/models'
import getPaletteMeta from '../../utils/setPaletteMeta'
import { FullPaletteConfiguration } from 'src/types/configurations'

interface InternalPalettesProps {
  lang: Language
}

interface InternalPalettesStates {
  paletteListsStatus: 'LOADING' | 'LOADED' | 'EMPTY'
  paletteLists: Array<FullPaletteConfiguration>
}

export default class InternalPalettes extends PureComponent<
  InternalPalettesProps,
  InternalPalettesStates
> {
  constructor(props: InternalPalettesProps) {
    super(props)
    this.state = {
      paletteListsStatus: 'LOADING',
      paletteLists: [],
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

  onSelectPalette = (id: string) => {
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
                  <Button
                    type="icon"
                    icon="target"
                    helper={{
                      label:
                        locals[this.props.lang].palettes.actions.selectPalette,
                    }}
                    action={() => this.onSelectPalette(palette.meta.id)}
                  />
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
