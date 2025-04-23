import { Board, Text } from '@penpot/plugin-types'

export default class Paragraph {
  private name: string
  private content: string
  private fontSize: number
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
  }: {
    name: string
    content: string
    type: 'FILL' | 'FIXED'
    width?: number
    fontSize?: number
  }) {
    this.name = name
    this.content = content
    this.fontSize = fontSize
    this.type = type
    this.width = width
    this.nodeText = null
    this.node = this.makeNode()
  }

  makeNodeText = () => {
    // Base
    this.nodeText = penpot.createText(this.content)
    if (this.nodeText) {
      this.nodeText.fontFamily = 'Martian Mono'
      this.nodeText.fontSize = this.fontSize.toString()
      this.nodeText.fontWeight = '500'
      this.nodeText.lineHeight = '1.3'
      this.nodeText.fills = [
        {
          fillColor: '#000',
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
        fillColor: '#FFF',
        fillOpacity: 0.5,
      },
    ]
    this.node.strokes = [
      {
        strokeColor: '#000000',
        strokeOpacity: 0.05,
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

    flex.verticalSizing = 'fit-content'
    flex.horizontalPadding = flex.verticalPadding = 8

    // Insert
    const textNode = this.makeNodeText()
    if (textNode) this.node.appendChild(textNode)

    if (textNode?.layoutChild) textNode.layoutChild.horizontalSizing = 'fill'

    return this.node
  }
}
