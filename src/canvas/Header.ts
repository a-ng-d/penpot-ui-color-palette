import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import {
  BaseConfiguration,
  ThemeConfiguration,
  ViewConfiguration,
} from '../types/configurations'
import Sample from './Sample'

export default class Header {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private view: ViewConfiguration
  private sampleSize: number
  private currentTheme?: ThemeConfiguration
  node: Board

  constructor({
    base,
    theme,
    view,
    size,
  }: {
    base: BaseConfiguration
    theme: ThemeConfiguration
    view: ViewConfiguration
    size: number
  }) {
    this.base = base
    this.theme = theme
    this.view = view
    this.sampleSize = size
    this.currentTheme = theme
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
        visionSimulationMode: this.theme.visionSimulationMode,
        view: this.view,
        textColorsTheme: this.theme.textColorsTheme,
      }).makeNodeName({
        mode: 'FIXED',
        width: this.sampleSize,
        height: 48,
      })
    )
    if (this.view === 'PALETTE' || this.view === 'PALETTE_WITH_PROPERTIES')
      Object.keys(this.theme)
        .reverse()
        .forEach((key) => {
          this.node?.appendChild(
            new Sample({
              name: key,
              rgb: [255, 255, 255],
              colorSpace: this.base.colorSpace,
              visionSimulationMode: this.theme.visionSimulationMode,
              view: this.view,
              textColorsTheme: this.theme.textColorsTheme,
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
