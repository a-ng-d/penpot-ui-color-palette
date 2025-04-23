import { Board } from '@penpot/plugin-types'
import { PaletteData, PaletteDataThemeItem } from 'src/types/data'
import {
  BaseConfiguration,
  MetaConfiguration,
  ViewConfiguration,
} from '../types/configurations'
import setPaletteName from '../utils/setPaletteName'
import Palette from './Palette'
import Sheet from './Sheet'
import { HexModel } from '@a_ng_d/figmug-ui'

export default class Documents {
  private base: BaseConfiguration
  private data: PaletteData
  private meta: MetaConfiguration
  private view: ViewConfiguration
  documents: Array<Board>

  constructor({
    base,
    data,
    meta,
    view,
  }: {
    base: BaseConfiguration
    data: PaletteData
    meta: MetaConfiguration
    view: ViewConfiguration
  }) {
    this.base = base
    this.data = data
    this.meta = meta
    this.view = view
    this.documents = this.makeDocuments()
  }

  makeDocuments = () => {
    let x = 0
    const documents: Array<Board> = []
    const workingThemesData =
      this.data.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? this.data.themes.filter((theme) => theme.type === 'default theme')
        : this.data.themes.filter((theme) => theme.type === 'custom theme')
    const workingThemes =
      this.base.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? this.base.themes.filter((theme) => theme.type === 'default theme')
        : this.base.themes.filter((theme) => theme.type === 'custom theme')

    workingThemesData.forEach((theme, index) => {
      const document = this.makeDocument(
        theme,
        workingThemes[index].paletteBackground
      )

      x = x + 32 + document.width
      document.x = x

      documents.push(document)
    })

    return documents
  }

  makeDocument = (theme: PaletteDataThemeItem, background: HexModel): Board => {
    // Base
    const document = penpot.createBoard()
    document.name = setPaletteName(
      this.base.name,
      theme.name,
      this.base.preset.name,
      this.base.colorSpace,
      this.base.visionSimulationMode
    )
    document.resize(1640, 100)
    document.borderRadius = 16
    document.horizontalSizing = 'auto'
    document.verticalSizing = 'auto'
    document.fills = [
      {
        fillColor: background,
      },
    ]

    // Layout
    const flex = document.addFlexLayout()
    flex.dir = 'column'
    flex.verticalPadding = flex.horizontalPadding = 32
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // data
    document.setPluginData('type', 'UI_COLOR_PALETTE')
    document.setPluginData('view', this.view)
    document.setPluginData('id', this.meta.id)
    document.setPluginData('name', this.base.name)
    document.setPluginData('themeId', theme.id)
    document.setPluginData('createdAt', new Date().toISOString())
    document.setPluginData('updatedAt', this.meta.dates.updatedAt as string)
    document.setPluginData('backup', JSON.stringify(this.base))

    // Insert
    if (this.view === 'PALETTE' || this.view === 'PALETTE_WITH_PROPERTIES')
      document.appendChild(
        new Palette({
          base: this.base,
          data: theme,
          meta: this.meta,
          view: this.view,
        }).node
      )
    else
      document.appendChild(
        new Sheet({
          base: this.base,
          data: theme,
          meta: this.meta,
          view: this.view,
        }).node
      )

    return document
  }
}
