import chroma from 'chroma-js'
import { Board } from '@penpot/plugin-types'
import {
  Channel,
  ColorSpaceConfiguration,
  RgbModel,
  TextColorsThemeConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '@a_ng_d/utils-ui-color-palette'
import Status from './Status'
import Property from './Property'
import Properties from './Properties'
import Paragraph from './Paragraph'

export default class Sample {
  private name: string
  private source?: RgbModel
  private scale?: string
  private rgb: Channel
  private alpha?: number
  private backgroundColor?: Channel
  private mixedColor?: Channel
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private view: ViewConfiguration
  private textColorsTheme: TextColorsThemeConfiguration<'HEX'>
  private status: {
    isClosestToRef: boolean
    isLocked: boolean
    isTransparent: boolean
  }
  private nodeColor: Board | null
  private node: Board | null
  private children: Board | null

  constructor({
    name,
    source,
    scale,
    rgb,
    alpha,
    backgroundColor,
    mixedColor,
    colorSpace,
    visionSimulationMode,
    view,
    textColorsTheme,
    status = {
      isClosestToRef: false,
      isLocked: false,
      isTransparent: false,
    },
  }: {
    name: string
    source?: RgbModel
    scale?: string
    rgb: Channel
    alpha?: number
    backgroundColor?: Channel
    mixedColor?: Channel
    colorSpace: ColorSpaceConfiguration
    visionSimulationMode: VisionSimulationModeConfiguration
    view: ViewConfiguration
    textColorsTheme: TextColorsThemeConfiguration<'HEX'>
    status?: {
      isClosestToRef: boolean
      isLocked: boolean
      isTransparent: boolean
    }
  }) {
    this.name = name
    this.source = source
    this.scale = scale
    this.rgb = rgb
    this.alpha = alpha
    this.backgroundColor = backgroundColor
    this.mixedColor = mixedColor
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
    const newFills = [
      {
        fillColor: chroma(this.rgb).hex(),
        fillOpacity: this.alpha ?? 1,
      },
    ]

    if (this.backgroundColor !== undefined)
      newFills.push({
        fillColor: chroma(this.backgroundColor).hex(),
        fillOpacity: 1,
      })

    // Base
    this.node = penpot.createBoard()
    this.node.name = name
    this.node.resize(width, height)
    this.node.fills = newFills
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
        alpha: this.alpha,
        mixedColor: this.mixedColor,
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

    if (
      this.status.isClosestToRef ||
      this.status.isLocked ||
      this.status.isTransparent
    ) {
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
    const newFills = [
      {
        fillColor: chroma(this.rgb).hex(),
        fillOpacity: this.alpha ?? 1,
      },
    ]

    if (this.backgroundColor !== undefined)
      newFills.push({
        fillColor: chroma(this.backgroundColor).hex(),
        fillOpacity: 1,
      })

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

    // Color
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

    this.nodeColor.fills = newFills
    this.nodeColor.borderRadius = 16

    // Insert
    const propertyNode = new Property({
      name: '_label',
      content: name,
      size: 10,
    }).makeNode()

    this.nodeColor.appendChild(propertyNode)

    if (
      this.status.isClosestToRef ||
      this.status.isLocked ||
      this.status.isTransparent
    ) {
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
        fontFamily: 'Lexend',
      }).node

      this.node.appendChild(paragraphNode)

      if (paragraphNode.layoutChild)
        paragraphNode.layoutChild.horizontalSizing = 'fill'
    } else if (!isColorName) {
      const propertiesNode = new Properties({
        name: this.scale ?? '0',
        rgb: this.rgb,
        alpha: this.alpha,
        mixedColor: this.mixedColor,
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
