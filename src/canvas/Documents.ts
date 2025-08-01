import { Board } from '@penpot/plugin-types'
import {
  BaseConfiguration,
  MetaConfiguration,
  PaletteData,
  PaletteDataThemeItem,
  ThemeConfiguration,
  ViewConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import setPaletteName from '../utils/setPaletteName'
import globalConfig from '../global.config'
import Sheet from './Sheet'
import Palette from './Palette'

export default class Documents {
  private base: BaseConfiguration
  private themes: Array<ThemeConfiguration>
  private data: PaletteData
  private meta: MetaConfiguration
  private view: ViewConfiguration
  documents: Array<Board>

  constructor({
    base,
    themes,
    data,
    meta,
    view,
  }: {
    base: BaseConfiguration
    themes: Array<ThemeConfiguration>
    data: PaletteData
    meta: MetaConfiguration
    view: ViewConfiguration
  }) {
    this.base = base
    this.themes = themes
    this.data = data
    this.meta = meta
    this.view = view
    this.documents = this.makeDocuments()
  }

  makeDocuments = () => {
    let x = penpot.viewport.center.x
    const y = penpot.viewport.center.y
    const documents: Array<Board> = []
    const workingThemesData =
      this.data.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? this.data.themes.filter((theme) => theme.type === 'default theme')
        : this.data.themes.filter((theme) => theme.type === 'custom theme')
    const workingThemes =
      this.themes.filter((theme) => theme.type === 'custom theme').length === 0
        ? this.themes.filter((theme) => theme.type === 'default theme')
        : this.themes.filter((theme) => theme.type === 'custom theme')

    workingThemesData.forEach((theme, index) => {
      const document = this.makeDocument(workingThemes[index], theme)

      x = x + 32 + document.width
      document.x = x
      document.y = y

      documents.push(document)
    })

    return documents
  }

  makeDocument = (
    theme: ThemeConfiguration,
    data: PaletteDataThemeItem
  ): Board => {
    // Base
    const document = penpot.createBoard()
    document.name = setPaletteName(
      this.base.name,
      theme.name,
      this.base.preset.name,
      this.base.colorSpace,
      theme.visionSimulationMode
    )
    document.resize(1640, 100)
    document.borderRadius = 16
    document.horizontalSizing = 'auto'
    document.verticalSizing = 'auto'
    document.fills = [
      {
        fillColor: theme.paletteBackground,
      },
    ]

    // Layout
    const flex = document.addFlexLayout()
    flex.dir = 'column'
    flex.verticalPadding = flex.horizontalPadding = 32
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Data
    document.setPluginData('type', 'UI_COLOR_PALETTE')
    document.setPluginData('version', globalConfig.versions.paletteVersion)
    document.setPluginData('view', this.view)
    document.setPluginData('id', this.meta.id)
    document.setPluginData('themeId', theme.id)
    document.setPluginData('createdAt', new Date().toISOString())
    document.setPluginData('updatedAt', this.meta.dates.updatedAt as string)
    document.setPluginData(
      'backup',
      JSON.stringify({
        base: this.base,
        themes: this.themes,
        meta: this.meta,
        type: 'UI_COLOR_PALETTE',
      })
    )

    // Insert
    if (this.view === 'PALETTE' || this.view === 'PALETTE_WITH_PROPERTIES')
      document.appendChild(
        new Palette({
          base: this.base,
          theme: theme,
          data: data,
          meta: this.meta,
          view: this.view,
        }).node
      )
    else
      document.appendChild(
        new Sheet({
          base: this.base,
          theme: theme,
          data: data,
          meta: this.meta,
          view: this.view,
        }).node
      )

    return document
  }
}
