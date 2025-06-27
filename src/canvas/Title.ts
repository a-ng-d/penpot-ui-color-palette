import { Board, ImageData } from '@penpot/plugin-types'
import {
  BaseConfiguration,
  MetaConfiguration,
  ThemeConfiguration,
  PaletteDataThemeItem,
} from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../content/locales'
import Tag from './Tag'
import Paragraph from './Paragraph'

export default class Title {
  private base: BaseConfiguration
  private theme: ThemeConfiguration
  private data: PaletteDataThemeItem
  private meta: MetaConfiguration
  private nodeGlobalInfo: Board | null
  private nodeDescriptions: Board | null
  private nodeProps: Board | null
  node: Board

  constructor({
    base,
    theme,
    data,
    meta,
  }: {
    base: BaseConfiguration
    theme: ThemeConfiguration
    data: PaletteDataThemeItem
    meta: MetaConfiguration
  }) {
    this.base = base
    this.theme = theme
    this.data = data
    this.meta = meta
    this.nodeGlobalInfo = null
    this.nodeDescriptions = null
    this.nodeProps = null
    this.node = this.makeNode()
  }

  makeNodeGlobalInfo = () => {
    // Base
    this.nodeGlobalInfo = penpot.createBoard()
    this.nodeGlobalInfo.name = '_palette-global'
    this.nodeGlobalInfo.fills = []
    this.nodeGlobalInfo.horizontalSizing = 'auto'
    this.nodeGlobalInfo.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeGlobalInfo.addFlexLayout()
    flex.dir = 'column'
    flex.rowGap = 8
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.nodeGlobalInfo.appendChild(
      new Tag({
        name: '_name',
        content: this.base.name === '' ? locales.get().name : this.base.name,
        fontSize: 20,
      }).makeNodeTag()
    )
    if (this.base.description !== '' || this.theme.description !== '')
      this.nodeGlobalInfo.appendChild(this.makeNodeDescriptions())

    return this.nodeGlobalInfo
  }

  makeNodeDescriptions = () => {
    // Base
    this.nodeDescriptions = penpot.createBoard()
    this.nodeDescriptions.name = '_palette-description(s)'
    this.nodeDescriptions.fills = []
    this.nodeDescriptions.horizontalSizing = 'auto'
    this.nodeDescriptions.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeDescriptions.addFlexLayout()
    flex.dir = 'column'
    flex.rowGap = 8
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    if (this.base.description !== '')
      this.nodeDescriptions.appendChild(
        new Paragraph({
          name: '_palette-description',
          content: this.base.description,
          type: 'FIXED',
          width: 644,
          fontSize: 12,
          fontFamily: 'Lexend',
        }).node
      )

    if (this.theme.description !== '')
      this.nodeDescriptions.appendChild(
        new Paragraph({
          name: '_theme-description',
          content: locales
            .get()
            .paletteProperties.themeDescription.replace(
              '{$1}',
              this.theme.description
            ),
          type: 'FIXED',
          width: 644,
          fontSize: 12,
          fontFamily: 'Lexend',
        }).node
      )

    return this.nodeDescriptions
  }

  makeNodeProps = () => {
    // Base
    this.nodeProps = penpot.createBoard()
    this.nodeProps.name = '_palette-props'
    this.nodeProps.fills = []
    this.nodeProps.horizontalSizing = 'auto'
    this.nodeProps.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeProps.addFlexLayout()
    flex.dir = 'column'
    flex.rowGap = 8
    flex.alignItems = 'end'

    // Insert
    if (
      this.meta.publicationStatus.isPublished &&
      this.meta.creatorIdentity.creatorAvatar !== ''
    )
      penpot
        .uploadMediaUrl(
          'Creator avatar',
          this.meta.creatorIdentity.creatorAvatar
        )
        .then(async (image: ImageData) =>
          new Tag({
            name: '_theme',
            content: locales
              .get()
              .paletteProperties.provider.replace(
                '{$1}',
                this.meta.creatorIdentity.creatorFullName
              ),
            fontSize: 12,
          }).makeNodeTagWithAvatar(image)
        )
    if (this.data.type !== 'default theme')
      this.nodeProps.appendChild(
        new Tag({
          name: '_theme',
          content: locales
            .get()
            .paletteProperties.theme.replace('{$1}', this.data.name),
          fontSize: 12,
        }).makeNodeTag()
      )
    this.nodeProps.appendChild(
      new Tag({
        name: '_preset',
        content: locales
          .get()
          .paletteProperties.preset.replace('{$1}', this.base.preset.name),
        fontSize: 12,
      }).makeNodeTag()
    )
    this.nodeProps.appendChild(
      new Tag({
        name: '_color-space',
        content: locales
          .get()
          .paletteProperties.colorSpace.replace('{$1}', this.base.colorSpace),
        fontSize: 12,
      }).makeNodeTag()
    )
    if (this.base.visionSimulationMode !== 'NONE')
      this.nodeProps.appendChild(
        new Tag({
          name: '_vision-simulation',
          content: locales
            .get()
            .paletteProperties.visionSimulation.replace(
              '{$1}',
              this.theme.visionSimulationMode.charAt(0) +
                this.theme.visionSimulationMode.toLocaleLowerCase().slice(1)
            ),
          fontSize: 12,
        }).makeNodeTag()
      )
    this.nodeProps.appendChild(
      new Tag({
        name: '_updated_at',
        content: locales
          .get()
          .paletteProperties.updatedAt.replace(
            '{$1}',
            new Date(this.meta.dates.updatedAt).toDateString()
          ),
        fontSize: 12,
      }).makeNodeTag()
    )

    return this.nodeProps
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_title'
    this.node.fills = []
    this.node.horizontalSizing = 'auto'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.justifyContent = 'space-between'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.node.appendChild(this.makeNodeGlobalInfo())
    this.node.appendChild(this.makeNodeProps())

    return this.node
  }
}
