import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import { PaletteNode } from '../types/nodes'
import Paragraph from './Paragraph'
import Tag from './Tag'

export default class Title {
  private parent: PaletteNode
  private nodeGlobalInfo: Board | null
  private nodeDescriptions: Board | null
  private nodeProps: Board | null
  private node: Board | null

  constructor(parent: PaletteNode) {
    this.parent = parent
    this.nodeGlobalInfo = null
    this.nodeDescriptions = null
    this.nodeProps = null
    this.node = null
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
    flex.columnGap = 8
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.nodeGlobalInfo.appendChild(
      new Tag({
        name: '_name',
        content: this.parent.name === '' ? locals[lang].name : this.parent.name,
        fontSize: 20,
      }).makeNodeTag()
    )
    if (
      this.parent.description !== '' ||
      this.parent.themes.find((theme) => theme.isEnabled)?.description !== ''
    )
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
    flex.dir = 'row'
    flex.rowGap = 8
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    if (this.parent.description !== '')
      this.nodeDescriptions.appendChild(
        new Paragraph(
          '_palette-description',
          this.parent.description,
          'FIXED',
          644,
          12
        ).makeNode()
      )

    if (this.parent.themes.find((theme) => theme.isEnabled)?.description !== '')
      this.nodeDescriptions.appendChild(
        new Paragraph(
          '_theme-description',
          'Theme description: ' +
            this.parent.themes.find((theme) => theme.isEnabled)?.description,
          'FIXED',
          644,
          12
        ).makeNode()
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
      this.parent.creatorFullName !== undefined &&
      this.parent.creatorFullName !== ''
    )
      this.nodeProps.appendChild(
        new Tag({
          name: '_creator_id',
          content: `${locals[lang].paletteProperties.provider}${this.parent.creatorFullName}`,
          fontSize: 12,
        }).makeNodeTagWithAvatar(this.parent.creatorAvatarImg)
      )

    if (
      this.parent.themes.find((theme) => theme.isEnabled)?.type !==
      'default theme'
    )
      this.nodeProps.appendChild(
        new Tag({
          name: '_theme',
          content: `${locals[lang].paletteProperties.theme}${
            this.parent.themes.find((theme) => theme.isEnabled)?.name
          }`,
          fontSize: 12,
        }).makeNodeTag()
      )
    this.nodeProps.appendChild(
      new Tag({
        name: '_preset',
        content: `${locals[lang].paletteProperties.preset}${this.parent.preset.name}`,
        fontSize: 12,
      }).makeNodeTag()
    )
    this.nodeProps.appendChild(
      new Tag({
        name: '_color-space',
        content: `${locals[lang].paletteProperties.colorSpace}${this.parent.colorSpace}`,
        fontSize: 12,
      }).makeNodeTag()
    )
    if (this.parent.visionSimulationMode !== 'NONE')
      this.nodeProps.appendChild(
        new Tag({
          name: '_vision-simulation',
          content: `${locals[lang].paletteProperties.visionSimulation}${
            this.parent.visionSimulationMode.charAt(0) +
            this.parent.visionSimulationMode.toLocaleLowerCase().slice(1)
          }`,
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
    this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.justifyContent = 'space-between'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.node.appendChild(this.makeNodeGlobalInfo())
    this.node.appendChild(this.makeNodeProps())

    return this.node
  }
}
