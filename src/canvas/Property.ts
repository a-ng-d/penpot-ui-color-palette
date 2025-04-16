import { Board } from '@penpot/plugin-types'
import Tag from './Tag'

export default class Property {
  private name: string
  private content: string
  private size: number
  private node: Board | null

  constructor(name: string, content: string, size: number) {
    this.name = name
    this.content = content
    this.size = size
    this.node = null
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_property'
    this.node.fills = []
    this.node.horizontalSizing = 'auto'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    // Insert
    this.node.appendChild(
      new Tag({
        name: this.name,
        content: this.content,
        fontSize: this.size,
      }).makeNodeTag()
    )

    return this.node
  }
}
