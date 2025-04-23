import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import Tag from './Tag'

export default class Status {
  private status: { isClosestToRef: boolean; isLocked: boolean }
  private source: { [key: string]: number }
  node: Board

  constructor({
    status = {
      isClosestToRef: false,
      isLocked: false,
    },
    source = {
      r: 0,
      g: 0,
      b: 0,
    },
  }: {
    status: { isClosestToRef: boolean; isLocked: boolean }
    source: { [key: string]: number }
  }) {
    this.status = status
    this.source = source
    this.node = this.makeNode()
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_status'
    this.node.fills = []

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fit-content'
    flex.verticalSizing = 'fit-content'

    if (this.status.isClosestToRef)
      this.node.appendChild(
        new Tag({
          name: '_close',
          content: locals[lang].paletteProperties.closest,
          fontSize: 10,
        }).makeNodeTagwithIndicator([
          this.source.r,
          this.source.g,
          this.source.b,
          1,
        ])
      )

    if (this.status.isLocked)
      this.node.appendChild(
        new Tag({
          name: '_lock',
          content: locals[lang].paletteProperties.locked,
          fontSize: 10,
        }).makeNodeTag()
      )

    return this.node
  }
}
