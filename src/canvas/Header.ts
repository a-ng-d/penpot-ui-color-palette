import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import {
  BaseConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
} from '../types/configurations'
import { PaletteDataThemeItem } from '../types/data'
import Sample from './Sample'

export default class Header {
  private base: BaseConfiguration
  private view: ViewConfiguration
  private sampleSize: number
  private currentTheme?: ThemeConfiguration
  node: Board

  constructor({
    base,
    data,
    view,
    size,
  }: {
    base: BaseConfiguration
    data: PaletteDataThemeItem
    view: ViewConfiguration
    size: number
  }) {
    this.base = base
    this.view = view
    this.sampleSize = size
    this.currentTheme = this.base.themes.find((theme) => theme.id === data.id)
    this.node = this.makeNode()
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
      new Sample({
        name: locals[lang].paletteProperties.sourceColors,
        rgb: [255, 255, 255],
        colorSpace: this.base.colorSpace,
        visionSimulationMode: this.base.visionSimulationMode,
        view: this.base.view,
        textColorsTheme: this.base.textColorsTheme,
      }).makeNodeName({
        mode: 'FIXED',
        width: this.sampleSize,
        height: 48,
      })
    )
    if (this.view === 'PALETTE' || this.view === 'PALETTE_WITH_PROPERTIES')
      Object.keys(this.currentTheme?.scale ?? {})
        .reverse()
        .forEach((key) => {
          this.node?.appendChild(
            new Sample({
              name: key.replace('lightness-', ''),
              rgb: [255, 255, 255],
              colorSpace: this.base.colorSpace,
              visionSimulationMode: this.base.visionSimulationMode,
              view: this.view,
              textColorsTheme: this.base.textColorsTheme,
            }).makeNodeName({
              mode: 'FIXED',
              width: this.sampleSize,
              height: 48,
            })
          )
        })

    return this.node
  }
}
