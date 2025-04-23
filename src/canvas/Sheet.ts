import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import {
  BaseConfiguration,
  MetaConfiguration,
  ViewConfiguration,
} from '../types/configurations'
import { PaletteDataThemeItem } from '../types/data'
import Header from './Header'
import Sample from './Sample'
import Signature from './Signature'
import Title from './Title'

export default class Sheet {
  private base: BaseConfiguration
  private data: PaletteDataThemeItem
  private meta: MetaConfiguration
  private view: ViewConfiguration
  private sampleScale: number
  private sampleRatio: number
  private sampleSize: number
  private gap: number
  private nodeRow: Board | null
  private nodeRowSource: Board | null
  private nodeRowShades: Board | null
  private nodeEmpty: Board | null
  private nodeShades: Board | null
  node: Board

  constructor({
    base,
    data,
    meta,
    view,
  }: {
    base: BaseConfiguration
    data: PaletteDataThemeItem
    meta: MetaConfiguration
    view: ViewConfiguration
  }) {
    this.base = base
    this.data = data
    this.meta = meta
    this.view = view
    this.sampleScale = 1.25
    this.sampleRatio = 2
    this.sampleSize = 184
    this.gap = 32
    this.nodeRow = null
    this.nodeRowSource = null
    this.nodeRowShades = null
    this.nodeEmpty = null
    this.nodeShades = null
    this.node = this.makeNode()
  }

  makeEmptyCase = () => {
    // Base
    this.nodeEmpty = penpot.createBoard()
    this.nodeEmpty.name = '_message'
    this.nodeEmpty.resize(100, 48)
    this.nodeEmpty.fills = []

    // Layout
    const flex = this.nodeEmpty.addFlexLayout()
    flex.dir = 'row'
    flex.justifyContent = 'center'
    flex.alignItems = 'stretch'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.nodeEmpty.appendChild(
      new Sample({
        name: locals[lang].warning.emptySourceColors,
        rgb: [255, 255, 255],
        colorSpace: this.base.colorSpace,
        visionSimulationMode: this.base.visionSimulationMode,
        view: this.view,
        textColorsTheme: this.base.textColorsTheme,
      }).makeNodeName({
        mode: 'FILL',
        width: 48,
        height: 48,
      })
    )

    return this.nodeEmpty
  }

  makeNodeShades = () => {
    // Base
    this.nodeShades = penpot.createBoard()
    this.nodeShades.name = '_shades'
    this.nodeShades.fills = []
    this.nodeShades.horizontalSizing = 'auto'
    this.nodeShades.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeShades.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.nodeShades.appendChild(
      new Header({
        base: this.base,
        data: this.data,
        view: this.view,
        size:
          this.sampleSize * this.sampleScale * 4 +
          this.sampleSize * this.sampleRatio +
          this.gap * 4,
      }).node
    )

    this.data?.colors.forEach((color) => {
      const sourceColor = color.shades.find(
        (shade) => shade.name === 'source'
      ) ?? { hex: '#000000', rgb: [0, 0, 0] }

      // Base
      this.nodeRow = penpot.createBoard()
      this.nodeRowSource = penpot.createBoard()
      this.nodeRowShades = penpot.createBoard()
      this.nodeRow.name = color.name
      this.nodeRowSource.name = '_source'
      this.nodeRowShades.name = '_shades'
      this.nodeRow.fills =
        this.nodeRowSource.fills =
        this.nodeRowShades.fills =
          []
      this.nodeRow.horizontalSizing =
        this.nodeRowSource.horizontalSizing =
        this.nodeRowShades.horizontalSizing =
          'auto'
      this.nodeRow.verticalSizing =
        this.nodeRowSource.verticalSizing =
        this.nodeRowShades.verticalSizing =
          'auto'

      // Layout
      const flex = this.nodeRow.addFlexLayout()
      const flexSource = this.nodeRowSource.addFlexLayout()
      const flexShades = this.nodeRowShades.addFlexLayout()
      flex.dir = flexSource.dir = flexShades.dir = 'row'
      flex.horizontalSizing =
        flexSource.horizontalSizing =
        flexShades.horizontalSizing =
          'fit-content'
      flex.verticalSizing =
        flexSource.verticalSizing =
        flexShades.verticalSizing =
          'fit-content'
      flex.rowGap = this.gap

      // Insert
      const sampleNode = new Sample({
        id: color.shades.find((color) => color.type === 'source color')
          ?.styleId,
        name: color.name,
        rgb: sourceColor.rgb,
        colorSpace: this.base.colorSpace,
        visionSimulationMode: this.base.visionSimulationMode,
        view: this.view,
        textColorsTheme: this.base.textColorsTheme,
      }).makeNodeRichShade({
        width: this.sampleSize * this.sampleRatio,
        height: this.sampleSize * this.sampleRatio * this.sampleScale,
        name: color.name,
        description: color.description,
        isColorName: true,
      })

      this.nodeRowSource.appendChild(sampleNode)

      color.shades
        .filter((shade) => shade.name !== 'source')
        .forEach((shade) => {
          flexShades.horizontalSizing = 'auto'
          flexShades.wrap = 'wrap'
          flexShades.rowGap = this.gap
          this.nodeRowShades?.resize(
            this.sampleSize * this.sampleScale * 4 + this.gap * 3,
            100
          )
          flexShades.horizontalSizing = 'fit-content'
          this.nodeRowShades?.appendChild(
            new Sample({
              id: shade.styleId,
              name: color.name,
              source: {
                r: sourceColor.rgb[0] / 255,
                g: sourceColor.rgb[1] / 255,
                b: sourceColor.rgb[2] / 255,
              },
              scale: shade.name,
              rgb: shade.rgb,
              colorSpace: this.base.colorSpace,
              visionSimulationMode: this.base.visionSimulationMode,
              view: this.view,
              textColorsTheme: this.base.textColorsTheme,
              status: {
                isClosestToRef: shade.isClosestToRef ?? false,
                isLocked: shade.isSourceColorLocked ?? false,
              },
            }).makeNodeRichShade({
              width: this.sampleSize * this.sampleRatio,
              height: this.sampleSize * this.sampleRatio * this.sampleScale,
              name: shade.name,
            })
          )
        })

      this.nodeRow.appendChild(this.nodeRowSource)
      this.nodeRow.appendChild(this.nodeRowShades)
      this.nodeShades?.appendChild(this.nodeRow)
    })
    if (this.base.colors.length === 0)
      this.nodeShades.appendChild(this.makeEmptyCase())

    return this.nodeShades
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = `_colors${locals[lang].separator}do not edit any layer`
    this.node.fills = []
    this.node.blocked = true
    this.node.horizontalSizing = 'auto'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'
    flex.rowGap = 16

    // Insert
    const titleNode = new Title({
      base: this.base,
      data: this.data,
      meta: this.meta,
    }).node
    const signatureNode = new Signature().node

    this.node.appendChild(titleNode)
    this.node.appendChild(this.makeNodeShades())
    this.node.appendChild(signatureNode)

    if (titleNode.layoutChild) titleNode.layoutChild.horizontalSizing = 'fill'
    if (signatureNode.layoutChild)
      signatureNode.layoutChild.horizontalSizing = 'fill'

    return this.node
  }
}
