import { HexModel, RgbModel } from '@a_ng_d/figmug-ui'
import { APCAcontrast, fontLookupAPCA, sRGBtoY } from 'apca-w3'
import chroma from 'chroma-js'
import { locals } from '../content/locals'
import { RgbComponent } from '../types/models'

export default class Contrast {
  private backgroundColor: RgbComponent
  private textColor: HexModel

  constructor({
    backgroundColor = [0, 0, 0],
    textColor = '#FFFFFF',
  }: {
    backgroundColor?: RgbComponent
    textColor?: HexModel
  }) {
    this.backgroundColor = backgroundColor
    this.textColor = textColor
  }

  getWCAGContrast = (): number => {
    return chroma.contrast(chroma(this.backgroundColor).hex(), this.textColor)
  }

  getAPCAContrast = (): number => {
    return Math.abs(
      APCAcontrast(
        sRGBtoY(chroma(this.textColor).rgb()),
        sRGBtoY(this.backgroundColor)
      )
    )
  }

  getWCAGScore = (): 'A' | 'AA' | 'AAA' => {
    return this.getWCAGContrast() < 4.5
      ? 'A'
      : this.getWCAGContrast() >= 4.5 && this.getWCAGContrast() < 7
        ? 'AA'
        : 'AAA'
  }

  getWCAGScoreColor = (): RgbModel => {
    if (this.getWCAGScore() !== 'A')
      return {
        r: 0.5294117647,
        g: 0.8156862745,
        b: 0.6941176471,
      }
    else
      return {
        r: 0.8274509804,
        g: 0.7019607843,
        b: 0.7803921569,
      }
  }

  getAPCAScoreColor = (): RgbModel => {
    if (this.getRecommendedUsage() !== locals.get().paletteProperties.avoid)
      return {
        r: 0.5294117647,
        g: 0.8156862745,
        b: 0.6941176471,
      }
    else
      return {
        r: 0.8274509804,
        g: 0.7019607843,
        b: 0.7803921569,
      }
  }

  getMinFontSizes = (): Array<string | number> => {
    return fontLookupAPCA(this.getAPCAContrast())
  }

  getRecommendedUsage = (): string => {
    if (this.getAPCAContrast() >= 90)
      return locals.get().paletteProperties.fluentText
    if (this.getAPCAContrast() >= 75 && this.getAPCAContrast() < 90)
      return locals.get().paletteProperties.contentText
    if (this.getAPCAContrast() >= 60 && this.getAPCAContrast() < 75)
      return locals.get().paletteProperties.bodyText
    if (this.getAPCAContrast() >= 45 && this.getAPCAContrast() < 60)
      return locals.get().paletteProperties.headlines
    if (this.getAPCAContrast() >= 30 && this.getAPCAContrast() < 45)
      return locals.get().paletteProperties.spotText
    if (this.getAPCAContrast() >= 15 && this.getAPCAContrast() < 30)
      return locals.get().paletteProperties.nonText
    if (this.getAPCAContrast() < 15) return locals.get().paletteProperties.avoid

    return locals.get().paletteProperties.unknown
  }

  getContrastRatioForLightness = (lightness: number): number => {
    const bgColor = chroma.lch(lightness, 0, 0).rgb()
    return chroma.contrast(chroma(bgColor).hex(), this.textColor)
  }

  getLightnessForContrastRatio = (
    targetRatio: number,
    precision = 0.1
  ): number => {
    const isLightText = chroma(this.textColor).luminance() > 0.5
    let min = 0
    let max = 100
    let currentLightness = isLightText ? 20 : 80

    while (max - min > precision) {
      currentLightness = (min + max) / 2
      const currentRatio = this.getContrastRatioForLightness(currentLightness)

      if (isLightText)
        if (currentRatio < targetRatio) max = currentLightness
        else min = currentLightness
      else if (currentRatio < targetRatio) min = currentLightness
      else max = currentLightness
    }

    return currentLightness
  }
}
