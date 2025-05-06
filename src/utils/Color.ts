import chroma from 'chroma-js'
import blinder from '@hexorialstudio/color-blinder'
import { Hsluv } from 'hsluv'
import { HexModel } from '@a_ng_d/figmug-ui'
import {
  AlgorithmVersionConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { ActionsList } from '../types/models'

export default class Color {
  private render: 'HEX' | 'RGB'
  private sourceColor: [number, number, number]
  private lightness: number
  private hueShifting: number
  private chromaShifting: number
  private algorithmVersion: AlgorithmVersionConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration

  constructor({
    render = 'HEX',
    sourceColor = [0, 0, 0],
    lightness = 100,
    hueShifting = 0,
    chromaShifting = 100,
    algorithmVersion = 'v3',
    visionSimulationMode = 'NONE',
  }: {
    render?: 'HEX' | 'RGB'
    sourceColor?: [number, number, number]
    lightness?: number
    hueShifting?: number
    chromaShifting?: number
    algorithmVersion?: AlgorithmVersionConfiguration
    visionSimulationMode?: VisionSimulationModeConfiguration
  }) {
    this.render = render
    this.sourceColor = sourceColor
    this.lightness = lightness
    this.hueShifting = hueShifting
    this.chromaShifting = chromaShifting
    this.algorithmVersion = algorithmVersion
    this.visionSimulationMode = visionSimulationMode
  }

  adjustHue = (hue: number): number => {
    if (hue + this.hueShifting < 0) return hue + this.hueShifting + 360
    if (hue + this.hueShifting > 360) return hue + this.hueShifting - 360
    return hue + this.hueShifting
  }

  adjustChroma = (chroma: number): number => {
    if (this.algorithmVersion === 'v1') return chroma
    if (this.algorithmVersion === 'v2')
      return Math.sin((this.lightness / 100) * Math.PI) * chroma
    if (this.algorithmVersion === 'v3') {
      const lightnessFactor = this.lightness / 100
      const sinComponent = Math.sin(lightnessFactor * Math.PI)
      const tanhComponent = Math.tanh(lightnessFactor * Math.PI)
      const weightedComponent = sinComponent * 0.5 + tanhComponent * 0.5
      const smoothedComponent = Math.pow(weightedComponent, 0.5)
      return smoothedComponent * chroma
    }
    return chroma
  }

  lch = (): HexModel | [number, number, number] => {
    const lch = chroma(this.sourceColor).lch(),
      newColor = chroma
        .lch(
          this.lightness,
          this.adjustChroma(lch[1] * (this.chromaShifting / 100)),
          this.adjustHue(lch[2])
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  oklch = (): HexModel | [number, number, number] => {
    const oklch = chroma(this.sourceColor).oklch(),
      newColor = chroma
        .oklch(
          this.lightness / 100,
          this.adjustChroma(oklch[1] * (this.chromaShifting / 100)),
          this.adjustHue(oklch[2])
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  lab = (): HexModel | [number, number, number] => {
    const labA = chroma(this.sourceColor).get('lab.a'),
      labB = chroma(this.sourceColor).get('lab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (this.chromaShifting / 100)
    let h = Math.atan(labB / labA) + this.hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    const newColor = chroma
      .lab(
        this.lightness,
        this.adjustChroma(newLabA),
        this.adjustChroma(newLabB)
      )
      .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  oklab = (): HexModel | [number, number, number] => {
    const labA = chroma(this.sourceColor).get('oklab.a'),
      labB = chroma(this.sourceColor).get('oklab.b'),
      chr = Math.sqrt(labA ** 2 + labB ** 2) * (this.chromaShifting / 100)
    let h = Math.atan(labB / labA) + this.hueShifting * (Math.PI / 180)

    if (h > Math.PI) h = Math.PI
    else if (h < -Math.PI) h = Math.PI

    let newLabA = chr * Math.cos(h),
      newLabB = chr * Math.sin(h)

    if (Math.sign(labA) === -1 && Math.sign(labB) === 1) {
      newLabA *= -1
      newLabB *= -1
    }
    if (Math.sign(labA) === -1 && Math.sign(labB) === -1) {
      newLabA *= -1
      newLabB *= -1
    }

    if (Number.isNaN(newLabA)) newLabA = 0
    if (Number.isNaN(newLabB)) newLabB = 0

    const newColor = chroma
      .oklab(
        this.lightness / 100,
        this.adjustChroma(newLabA),
        this.adjustChroma(newLabB)
      )
      .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  hsl = (): HexModel | [number, number, number] => {
    const hsl = chroma(this.sourceColor).hsl(),
      newColor = chroma
        .hsl(
          this.adjustHue(hsl[0]),
          this.adjustChroma(hsl[1] * (this.chromaShifting / 100)),
          this.lightness / 100
        )
        .rgb()

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  hsluv = (): HexModel | [number, number, number] => {
    const hsluv = new Hsluv()

    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255

    hsluv.rgbToHsluv()

    hsluv.hsluv_l = this.lightness
    hsluv.hsluv_s = this.adjustChroma(
      hsluv.hsluv_s * (this.chromaShifting / 100)
    )
    hsluv.hsluv_h = this.adjustHue(hsluv.hsluv_h)

    if (Number.isNaN(hsluv.hsluv_s)) hsluv.hsluv_s = 0
    if (Number.isNaN(hsluv.hsluv_h)) hsluv.hsluv_h = 0

    hsluv.hsluvToRgb()

    const newColor: [number, number, number] = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
    ]

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)
    return this.simulateColorBlindRgb(newColor)
  }

  getHsluv = (): [number, number, number] => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }

  simulateColorBlindRgb = (
    sourceColor: [number, number, number]
  ): [number, number, number] => {
    const actions: ActionsList = {
      NONE: () => sourceColor,
      PROTANOMALY: () =>
        chroma(blinder.protanomaly(chroma(sourceColor).hex())).rgb(false),
      PROTANOPIA: () =>
        chroma(blinder.protanopia(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOMALY: () =>
        chroma(blinder.deuteranomaly(chroma(sourceColor).hex())).rgb(false),
      DEUTERANOPIA: () =>
        chroma(blinder.deuteranopia(chroma(sourceColor).hex())).rgb(false),
      TRITANOMALY: () =>
        chroma(blinder.tritanomaly(chroma(sourceColor).hex())).rgb(false),
      TRITANOPIA: () =>
        chroma(blinder.tritanopia(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOMALY: () =>
        chroma(blinder.achromatomaly(chroma(sourceColor).hex())).rgb(false),
      ACHROMATOPSIA: () =>
        chroma(blinder.achromatopsia(chroma(sourceColor).hex())).rgb(false),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : [0, 0, 0]
  }

  simulateColorBlindHex = (sourceColor: [number, number, number]): HexModel => {
    const actions: ActionsList = {
      NONE: () => chroma(sourceColor).hex(),
      PROTANOMALY: () => blinder.protanomaly(chroma(sourceColor).hex()),
      PROTANOPIA: () => blinder.protanopia(chroma(sourceColor).hex()),
      DEUTERANOMALY: () => blinder.deuteranomaly(chroma(sourceColor).hex()),
      DEUTERANOPIA: () => blinder.deuteranopia(chroma(sourceColor).hex()),
      TRITANOMALY: () => blinder.tritanomaly(chroma(sourceColor).hex()),
      TRITANOPIA: () => blinder.tritanopia(chroma(sourceColor).hex()),
      ACHROMATOMALY: () => blinder.achromatomaly(chroma(sourceColor).hex()),
      ACHROMATOPSIA: () => blinder.achromatopsia(chroma(sourceColor).hex()),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : '#000000'
  }

  setAlphaRgb = (alpha: number): [number, number, number, number] => {
    return [...this.simulateColorBlindRgb(this.sourceColor), alpha]
  }

  setAlphaHex = (alpha: number): HexModel => {
    const alphaHex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0')
    return this.simulateColorBlindHex(this.sourceColor) + alphaHex
  }

  mixColorsRgb = (
    colorA: [number, number, number, number],
    colorB: [number, number, number, number]
  ): [number, number, number] => {
    const [r1, g1, b1, a1] = colorA
    const [r2, g2, b2, a2] = colorB
    
    if (a1 === 1) return [r1, g1, b1]
    
    if (a1 === 0) return [r2, g2, b2]
    
    const alpha = a1 + a2 * (1 - a1)
    const r = (r1 * a1 + r2 * a2 * (1 - a1)) / alpha
    const g = (g1 * a1 + g2 * a2 * (1 - a1)) / alpha
    const b = (b1 * a1 + b2 * a2 * (1 - a1)) / alpha
    
    return [r, g, b]
  }

  mixColorsHex = (colorA: HexModel, colorB: HexModel): HexModel => {
    const rgbA = chroma(colorA).rgba()
    const rgbB = chroma(colorB).rgba()
    const mixed = this.mixColorsRgb(rgbA, rgbB)
    return chroma(mixed).hex()
  }
}
