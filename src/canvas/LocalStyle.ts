import { RgbModel } from '@a_ng_d/figmug-ui'
import { LibraryColor } from '@penpot/plugin-types'
import chroma from 'chroma-js'

export default class LocalStyle {
  private name: string
  private description: string
  private rgb: RgbModel
  private paintStyle: LibraryColor | null

  constructor(name: string, description: string, rgb: RgbModel) {
    this.name = name
    this.description = description
    this.rgb = rgb
    this.paintStyle = null
  }

  makePaintStyle = () => {
    this.paintStyle = penpot.library.local.createColor()
    this.paintStyle.name = this.name
    //this.paintStyle.description = this.description
    this.paintStyle.color = chroma([this.rgb.r, this.rgb.g, this.rgb.b]).hex()

    return this.paintStyle
  }
}
