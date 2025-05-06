import { HexModel } from '@a_ng_d/figmug-ui'
import { LibraryColor } from '@penpot/plugin-types'

export default class LocalStyle {
  private name: string
  private hex: HexModel
  private alpha: number
  libraryColor: LibraryColor

  constructor({
    name,
    hex,
    alpha = 1,
  }: {
    name: string
    hex: HexModel
    alpha?: number
  }) {
    this.name = name
    this.hex = hex
    this.alpha = alpha
    this.libraryColor = this.makeLibraryColor()
  }

  makeLibraryColor = () => {
    this.libraryColor = penpot.library.local.createColor()
    this.libraryColor.name = this.name
    this.libraryColor.opacity = this.alpha
    this.libraryColor.color = this.hex

    return this.libraryColor
  }
}
