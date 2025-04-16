import { RgbModel } from '@a_ng_d/figmug-ui'
import { Board } from '@penpot/plugin-types'
import chroma from 'chroma-js'
import { TextColorsThemeHexModel } from 'src/types/models'
import {
  ColorSpaceConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import Paragraph from './Paragraph'
import Properties from './Properties'
import Property from './Property'
import Status from './Status'

export default class Sample {
  private name: string
  private source: RgbModel | null
  private scale: string | null
  private rgb: [number, number, number]
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private view: ViewConfiguration
  private textColorsTheme: TextColorsThemeHexModel
  private status: {
    isClosestToRef: boolean
    isLocked: boolean
  }
  private nodeColor: Board | null
  private node: Board | null
  private children: Board | null

  constructor(
    name: string,
    source: RgbModel | null,
    scale: string | null,
    rgb: [number, number, number],
    colorSpace: ColorSpaceConfiguration,
    visionSimulationMode: VisionSimulationModeConfiguration,
    view: ViewConfiguration,
    textColorsTheme: TextColorsThemeHexModel,
    status: { isClosestToRef: boolean; isLocked: boolean } = {
      isClosestToRef: false,
      isLocked: false,
    }
  ) {
    this.name = name
    this.source = source
    this.scale = scale
    this.rgb = rgb
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.view = view
    this.textColorsTheme = textColorsTheme
    this.status = status
    this.nodeColor = null
    this.node = null
    this.children = null
  }

  makeNodeName = (mode: string, width: number, height: number) => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = this.name
    this.node.fills = []
    this.node.resize(width, height)
    this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'fix'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.verticalPadding = flex.horizontalPadding = 8

    if (mode === 'FILL') {
      this.node.horizontalSizing = 'fix'
      this.children = new Property('_large-label', this.name, 16).makeNode()
    } else if (mode === 'FIXED')
      this.children = new Property('_label', this.name, 10).makeNode()

    // Insert
    this.node.appendChild(this.children as Board)

    return this.node
  }

  makeNodeShade = (
    width: number,
    height: number,
    name: string,
    isColorName = false
  ) => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = [
      {
        fillColor: chroma([this.rgb[0], this.rgb[1], this.rgb[2]]).hex(),
      },
    ]
    this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'fix'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.verticalPadding = flex.horizontalPadding = 8
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fill'

    // Insert
    if (this.view.includes('PALETTE_WITH_PROPERTIES') && !isColorName)
      this.node.appendChild(
        new Properties(
          this.scale ?? '0',
          this.rgb,
          this.colorSpace,
          this.visionSimulationMode,
          this.textColorsTheme
        ).makeNode()
      )
    else if (isColorName)
      this.node.appendChild(new Property('_label', this.name, 10).makeNode())
    if (this.status.isClosestToRef || this.status.isLocked)
      this.node.appendChild(
        new Status(
          this.status,
          this.source
            ? { r: this.source.r, g: this.source.g, b: this.source.b }
            : {}
        ).makeNode()
      )

    return this.node
  }

  makeNodeRichShade = (
    width: number,
    height: number,
    name: string,
    isColorName = false,
    description = ''
  ) => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = []
    this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'fix'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.verticalPadding = flex.horizontalPadding = 8

    // color
    this.nodeColor = penpot.createBoard()
    this.nodeColor.name = '_color'
    const flexColor = this.nodeColor.addFlexLayout()
    flexColor.dir = 'column'
    flexColor.horizontalPadding = flex.verticalPadding = 8
    flexColor.columnGap = 8
    this.nodeColor.resize(96, 96)

    this.nodeColor.fills = [
      {
        fillColor: chroma([this.rgb[0], this.rgb[1], this.rgb[2]]).hex(),
      },
    ]
    this.nodeColor.borderRadius = 16

    // Insert
    this.nodeColor.appendChild(new Property('_label', name, 10).makeNode())
    if (this.status.isClosestToRef)
      this.nodeColor.appendChild(
        new Status(
          this.status,
          this.source
            ? { r: this.source.r, g: this.source.g, b: this.source.b }
            : {}
        ).makeNode()
      )

    this.node.appendChild(this.nodeColor)
    if (isColorName && description !== '')
      this.node.appendChild(
        new Paragraph(
          '_description',
          description,
          'FILL',
          undefined,
          8
        ).makeNode()
      )
    else if (!this.view.includes('SHEET_SAFE_MODE') && !isColorName)
      this.node.appendChild(
        new Properties(
          this.scale ?? '0',
          this.rgb,
          this.colorSpace,
          this.visionSimulationMode,
          this.textColorsTheme
        ).makeNodeDetailed()
      )

    return this.node
  }
}
