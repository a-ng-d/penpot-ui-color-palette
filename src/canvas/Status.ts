import { Board } from '@penpot/plugin-types'
import { locales } from '../content/locales'
import Tag from './Tag'

export default class Status {
  private status: {
    isClosestToRef: boolean
    isLocked: boolean
    isTransparent: boolean
  }
  private source: { [key: string]: number }
  node: Board

  constructor({
    status = {
      isClosestToRef: false,
      isLocked: false,
      isTransparent: false,
    },
    source = {
      r: 0,
      g: 0,
      b: 0,
    },
  }: {
    status: {
      isClosestToRef: boolean
      isLocked: boolean
      isTransparent: boolean
    }
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
    this.node.horizontalSizing = 'auto'
    this.node.verticalSizing = 'auto'

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.rowGap = 4
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    if (this.status.isClosestToRef)
      this.node.appendChild(
        new Tag({
          name: '_close',
          content: locales.get().paletteProperties.closest,
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
          content: locales.get().paletteProperties.locked,
          fontSize: 10,
        }).makeNodeTag()
      )

    if (this.status.isTransparent)
      this.node.appendChild(
        new Tag({
          name: '_transparent',
          content: 'Transparent',
          fontSize: 10,
        }).makeNodeTag()
      )

    return this.node
  }
}
