import chroma from 'chroma-js'
import { Board, Ellipse, ImageData, Text } from '@penpot/plugin-types'
import { RgbModel } from '@a_ng_d/utils-ui-color-palette'

export default class Tag {
  private name: string
  private content: string
  private fontSize: number
  private fontFamily: 'Martian Mono' | 'Lexend'
  private url: string | null
  private backgroundColor: {
    rgb: RgbModel
    alpha: number
  }
  private nodeTag: Board | null
  private nodeTagWithAvatar: Board | null
  private nodeTagwithIndicator: Board | null
  private nodeText: Text | null
  private nodeIndicator: Ellipse | null
  private nodeAvatar: Ellipse | null

  constructor({
    name,
    content,
    fontSize = 8,
    fontFamily = 'Martian Mono',
    backgroundColor = {
      rgb: {
        r: 1,
        g: 1,
        b: 1,
      },
      alpha: 0.5,
    },
    url = null,
  }: {
    name: string
    content: string
    fontSize?: number
    fontFamily?: 'Martian Mono' | 'Lexend'
    backgroundColor?: {
      rgb: RgbModel
      alpha: number
    }
    url?: string | null
  }) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.url = url
    this.backgroundColor = backgroundColor
    this.nodeTag = null
    this.nodeTagwithIndicator = null
    this.nodeTagWithAvatar = null
    this.nodeText = null
    this.nodeIndicator = null
    this.nodeAvatar = null
  }

  makeNodeTag = () => {
    // Base
    this.nodeTag = penpot.createBoard()
    this.nodeTag.name = this.name
    this.nodeTag.fills = [
      {
        fillColor: chroma([
          this.backgroundColor.rgb.r * 255,
          this.backgroundColor.rgb.g * 255,
          this.backgroundColor.rgb.b * 255,
        ]).hex(),
        fillOpacity: this.backgroundColor.alpha,
      },
    ]
    this.nodeTag.strokes = [
      {
        strokeColor: '#000000',
        strokeOpacity: 0.05,
        strokeAlignment: 'inner',
        strokeWidth: 1,
      },
    ]
    this.nodeTag.borderRadius = 16
    this.nodeTag.horizontalSizing = 'auto'
    this.nodeTag.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeTag.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 4
    flex.alignItems = 'center'
    flex.horizontalPadding = 8
    flex.verticalPadding = 4

    // Insert
    const textNode = this.makeNodeText()
    if (textNode) this.nodeTag.appendChild(textNode)

    return this.nodeTag
  }

  makeNodeTagwithIndicator = (gl: Array<number> = [0, 0, 0, 1]) => {
    // Base
    this.nodeTagwithIndicator = penpot.createBoard()
    this.nodeTagwithIndicator.name = this.name
    this.nodeTagwithIndicator.fills = [
      {
        fillColor: chroma([
          this.backgroundColor.rgb.r * 255,
          this.backgroundColor.rgb.g * 255,
          this.backgroundColor.rgb.b * 255,
        ]).hex(),
        fillOpacity: this.backgroundColor.alpha,
      },
    ]
    this.nodeTagwithIndicator.strokes = [
      {
        strokeColor: '#000000',
        strokeOpacity: 0.05,
        strokeAlignment: 'inner',
        strokeWidth: 1,
      },
    ]
    this.nodeTagwithIndicator.borderRadius = 16
    this.nodeTagwithIndicator.horizontalSizing = 'auto'
    this.nodeTagwithIndicator.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeTagwithIndicator.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 4
    flex.alignItems = 'center'
    flex.rightPadding = 2
    flex.leftPadding = 8
    flex.verticalPadding = 2

    // Insert
    this.nodeTagwithIndicator.appendChild(
      this.makeNodeIndicator([gl[0], gl[1], gl[2]])
    )
    const textNode = this.makeNodeText()
    if (textNode) this.nodeTagwithIndicator.appendChild(textNode)

    return this.nodeTagwithIndicator
  }

  makeNodeTagWithAvatar = (image?: ImageData | null): Board => {
    // Base
    this.nodeTagWithAvatar = penpot.createBoard()
    this.nodeTagWithAvatar.name = this.name
    this.nodeTagWithAvatar.fills = [
      {
        fillColor: chroma([
          this.backgroundColor.rgb.r * 255,
          this.backgroundColor.rgb.g * 255,
          this.backgroundColor.rgb.b * 255,
        ]).hex(),
        fillOpacity: this.backgroundColor.alpha,
      },
    ]
    this.nodeTagWithAvatar.strokes = [
      {
        strokeColor: '#000000',
        strokeOpacity: 0.05,
        strokeAlignment: 'inner',
        strokeWidth: 1,
      },
    ]
    this.nodeTagWithAvatar.borderRadius = 16
    this.nodeTagWithAvatar.horizontalSizing = 'auto'
    this.nodeTagWithAvatar.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeTagWithAvatar.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 8
    flex.horizontalPadding = 4
    flex.verticalPadding = 4

    // Insert
    const textNode = this.makeNodeText()
    if (textNode) this.nodeTagWithAvatar.appendChild(textNode)

    this.nodeTagWithAvatar.appendChild(this.makeNodeAvatar(image))

    return this.nodeTagWithAvatar
  }

  makeNodeText = () => {
    // Base
    this.nodeText = penpot.createText(this.content)
    if (this.nodeText) {
      this.nodeText.name = '_text'
      this.nodeText.fontFamily = this.fontFamily
      this.nodeText.fontSize = this.fontSize.toString()
      this.nodeText.fontWeight = '500'
      this.nodeText.lineHeight = '1'
      this.nodeText.align = 'center'
      this.nodeText.fills = [
        {
          fillColor: '#000',
        },
      ]
    }

    return this.nodeText
  }

  makeNodeIndicator = (rgb: Array<number>) => {
    // Base
    this.nodeIndicator = penpot.createEllipse()
    this.nodeIndicator.name = '_indicator'
    this.nodeIndicator.resize(8, 8)
    this.nodeIndicator.fills = [
      {
        fillColor: chroma([rgb[0] * 255, rgb[1] * 255, rgb[2] * 255]).hex(),
      },
    ]
    this.nodeIndicator.strokes = [
      {
        strokeColor: '#000000',
        strokeOpacity: 0.1,
        strokeAlignment: 'inner',
        strokeWidth: 1,
      },
    ]

    return this.nodeIndicator
  }

  makeNodeAvatar = (image?: ImageData | null) => {
    // Base
    this.nodeAvatar = penpot.createEllipse()
    this.nodeAvatar.resize(24, 24)
    this.nodeAvatar.name = '_avatar'

    if (image !== null && image !== undefined)
      this.nodeAvatar.fills = [
        {
          fillImage: image,
        },
      ]

    return this.nodeAvatar
  }
}
