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
  private id: string
  private name: string
  private source?: RgbModel
  private scale?: string
  private rgb: [number, number, number]
  private alpha: number
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

  constructor({
    id = '',
    name,
    source,
    scale,
    rgb,
    alpha = 1,
    colorSpace,
    visionSimulationMode,
    view,
    textColorsTheme,
    status = {
      isClosestToRef: false,
      isLocked: false,
    },
  }: {
    id?: string
    name: string
    source?: RgbModel
    scale?: string
    rgb: [number, number, number]
    alpha?: number
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    view: ViewConfiguration
    textColorsTheme: TextColorsThemeHexModel
    status?: { isClosestToRef: boolean; isLocked: boolean }
  }) {
    this.id = id
    this.name = name
    this.source = source
    this.scale = scale
    this.rgb = rgb
    this.alpha = alpha
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.view = view
    this.textColorsTheme = textColorsTheme
    this.status = status
    this.nodeColor = null
    this.node = null
    this.children = null
  }

  makeNodeName = ({
    mode,
    width,
    height,
  }: {
    mode: string
    width: number
    height: number
  }) => {
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
      this.children = new Property({
        name: '_large-label',
        content: this.name,
        size: 16,
      }).makeNode()
    } else if (mode === 'FIXED')
      this.children = new Property({
        name: '_label',
        content: this.name,
        size: 10,
      }).makeNode()

    // Insert
    this.node.appendChild(this.children as Board)

    return this.node
  }

  makeNodeShade = ({
    width,
    height,
    name,
    isColorName = false,
  }: {
    width: number
    height: number
    name: string
    isColorName?: boolean
  }) => {
    const libraryColor = penpot.library.local.colors.find(
      (color) => color.id === this.id
    )

    // Base
    this.node = penpot.createBoard()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = [
      libraryColor !== undefined
        ? libraryColor.asFill()
        : {
            fillColor: chroma([this.rgb[0], this.rgb[1], this.rgb[2]]).hex(),
            fillOpacity: this.alpha,
          },
    ]
    this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'fix'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.justifyContent = 'end'
    flex.verticalPadding = flex.horizontalPadding = 8
    flex.rowGap = 8
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fill'

    // Insert
    if (this.view === 'PALETTE_WITH_PROPERTIES' && !isColorName) {
      const propertiesNode = new Properties({
        name: this.scale ?? '0',
        rgb: this.rgb,
        colorSpace: this.colorSpace,
        visionSimulationMode: this.visionSimulationMode,
        textColorsTheme: this.textColorsTheme,
      }).makeNode()

      this.node.appendChild(propertiesNode)

      if (propertiesNode.layoutChild) {
        propertiesNode.layoutChild.horizontalSizing = 'fill'
        propertiesNode.layoutChild.verticalSizing = 'fill'
      }
    } else if (isColorName) {
      const propertyNode = new Property({
        name: '_label',
        content: this.name,
        size: 10,
      }).makeNode()

      this.node.appendChild(propertyNode)

      if (propertyNode.layoutChild) {
        propertyNode.layoutChild.horizontalSizing = 'fill'
        propertyNode.layoutChild.verticalSizing = 'fill'
      }
    }

    if (this.status.isClosestToRef || this.status.isLocked) {
      const statusNode = new Status({
        status: this.status,
        source: this.source
          ? { r: this.source.r, g: this.source.g, b: this.source.b }
          : {},
      }).node

      this.node.appendChild(statusNode)

      if (statusNode.layoutChild)
        statusNode.layoutChild.horizontalSizing = 'fill'
    }

    return this.node
  }

  makeNodeRichShade = ({
    width,
    height,
    name,
    description = '',
    isColorName = false,
  }: {
    width: number
    height: number
    name: string
    description?: string
    isColorName?: boolean
  }) => {
    const libraryColor = penpot.library.local.colors.find(
      (color) => color.id === this.id
    )

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
    flex.horizontalPadding = 8
    flex.verticalPadding = 8
    flex.rowGap = 8

    // color
    this.nodeColor = penpot.createBoard()
    this.nodeColor.name = '_color'
    this.nodeColor.resize(96, 96)
    this.nodeColor.horizontalSizing = 'fix'
    this.nodeColor.verticalSizing = 'fix'

    const flexColor = this.nodeColor.addFlexLayout()
    flexColor.dir = 'column'
    flexColor.horizontalPadding = 8
    flexColor.verticalPadding = 8
    flexColor.rowGap = 8

    this.nodeColor.fills = [
      libraryColor !== undefined
        ? libraryColor.asFill()
        : {
            fillColor: chroma([this.rgb[0], this.rgb[1], this.rgb[2]]).hex(),
            fillOpacity: this.alpha,
          },
    ]
    this.nodeColor.borderRadius = 16

    // Insert
    const propertyNode = new Property({
      name: '_label',
      content: name,
      size: 10,
    }).makeNode()

    this.nodeColor.appendChild(propertyNode)

    if (this.status.isClosestToRef || this.status.isLocked) {
      const statusNode = new Status({
        status: this.status,
        source: this.source
          ? { r: this.source.r, g: this.source.g, b: this.source.b }
          : {},
      }).node

      this.nodeColor.appendChild(statusNode)

      if (statusNode.layoutChild)
        statusNode.layoutChild.horizontalSizing = 'fill'
    }

    this.node.appendChild(this.nodeColor)

    if (this.nodeColor.layoutChild)
      this.nodeColor.layoutChild.horizontalSizing = 'fill'

    if (isColorName && description !== '') {
      const paragraphNode = new Paragraph({
        name: '_description',
        content: description,
        type: 'FILL',
        fontSize: 8,
      }).node

      this.node.appendChild(paragraphNode)

      if (paragraphNode.layoutChild)
        paragraphNode.layoutChild.horizontalSizing = 'fill'
    } else if (!isColorName) {
      const propertiesNode = new Properties({
        name: this.scale ?? '0',
        rgb: this.rgb,
        colorSpace: this.colorSpace,
        visionSimulationMode: this.visionSimulationMode,
        textColorsTheme: this.textColorsTheme,
      }).makeNodeDetailed()

      this.node.appendChild(propertiesNode)

      if (propertiesNode.layoutChild) {
        propertiesNode.layoutChild.horizontalSizing = 'fill'
        propertiesNode.layoutChild.verticalSizing = 'fill'
      }
    }

    return this.node
  }
}
