import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import { ScaleConfiguration } from '../types/configurations'
import { PaletteNode } from '../types/nodes'
import Sample from './Sample'

export default class Header {
  private parent: PaletteNode
  private currentScale: ScaleConfiguration
  private sampleSize: number
  private node: Board | null

  constructor(parent: PaletteNode, size: number) {
    this.parent = parent
    this.currentScale =
      this.parent.themes.find((theme) => theme.isEnabled)?.scale ?? {}
    this.sampleSize = size
    this.node = null
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_header'
    this.node.resize(100, this.sampleSize / 4)
    this.node.fills = []
    this.node.horizontalSizing = 'auto'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.node.appendChild(
      new Sample(
        locals[lang].paletteProperties.sourceColors,
        null,
        null,
        [255, 255, 255],
        this.parent.colorSpace,
        this.parent.visionSimulationMode,
        this.parent.view,
        this.parent.textColorsTheme
      ).makeNodeName('FIXED', this.sampleSize, 48)
    )
    if (this.parent.view.includes('PALETTE'))
      Object.values(this.currentScale)
        .reverse()
        .forEach((lightness) => {
          this.node?.appendChild(
            new Sample(
              Object.keys(this.currentScale)
                .find((key) => this.currentScale[key] === lightness)
                ?.substr(10) ?? '0',
              null,
              null,
              [255, 255, 255],
              this.parent.colorSpace,
              this.parent.visionSimulationMode,
              this.parent.view,
              this.parent.textColorsTheme
            ).makeNodeName('FIXED', this.sampleSize, 48)
          )
        })

    return this.node
  }
}
