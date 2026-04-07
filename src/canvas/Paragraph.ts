import { Board, Text } from '@penpot/plugin-types'
import { bodyFontFamily, darkColor, FontFamily } from './styles'

export default class Paragraph {
  private name: string
  private content: string
  private fontSize: number
  private fontFamily: FontFamily
  private type: 'FILL' | 'FIXED'
  private width?: number
  private nodeText: Text | null
  node: Board

  constructor({
    name,
    content,
    type,
    width,
    fontSize = 12,
    fontFamily = bodyFontFamily,
  }: {
    name: string
    content: string
    type: 'FILL' | 'FIXED'
    width?: number
    fontSize?: number
    fontFamily?: FontFamily
  }) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.fontFamily = fontFamily
    this.type = type
    this.width = width
    this.nodeText = null
    this.node = this.makeNode()
  }

  makeNodeText = () => {
    // Base
    this.nodeText = penpot.createText(this.content)
    if (this.nodeText) {
      this.nodeText.fontFamily = this.fontFamily
      this.nodeText.fontSize = this.fontSize.toString()
      this.nodeText.fontWeight = '500'
      this.nodeText.lineHeight = '1.3'
      this.nodeText.fills = [
        {
          fillColor: darkColor,
        },
      ]

      // Layout
      this.nodeText.growType = 'auto-height'
    }
    return this.nodeText
  }

  makeNode() {
    // Base
    this.node = penpot.createBoard()
    this.node.name = this.name
    this.node.fills = [
      {
        fillColor: '#FFFFFF',
        fillOpacity: 0.5,
      },
    ]
    this.node.strokes = [
      {
        strokeColor: darkColor,
        strokeOpacity: 0.05,
        strokeAlignment: 'inner',
      },
    ]
    this.node.borderRadius = 16
    if (this.type === 'FIXED') this.node.resize(this.width ?? 100, 100)
    if (this.type === 'FIXED') this.node.horizontalSizing = 'fix'
    else this.node.horizontalSizing = 'fix'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'

    flex.verticalSizing = 'auto'
    flex.horizontalPadding = flex.verticalPadding = 8

    // Insert
    const nodeText = this.makeNodeText()
    if (nodeText) this.node.appendChild(nodeText)

    if (nodeText?.layoutChild) nodeText.layoutChild.horizontalSizing = 'fill'

    return this.node
  }
}
