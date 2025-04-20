import { HexModel } from '@a_ng_d/figmug-ui'
import { LibraryColor } from '@penpot/plugin-types'

export default class LocalStyle {
  private name: string
  private hex: HexModel
  private libraryColor: LibraryColor | null

  constructor({ name, hex }: { name: string; hex: HexModel }) {
    this.name = name
    this.hex = hex
    this.libraryColor = null
  }

  makeLibraryColor = () => {
    this.libraryColor = penpot.library.local.createColor()
    this.libraryColor.name = this.name
    this.libraryColor.color = this.hex

    return this.libraryColor
  }
}
