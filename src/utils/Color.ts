import { HexModel } from '@a_ng_d/figmug-ui'
import { ColorFormat, RgbaComponent, RgbComponent } from '../types/models'
import {
  AlgorithmVersionConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'
import { ActionsList } from '../types/models'

const colorBlindMatrices = {
  PROTANOPIA: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  PROTANOMALY: [
    [0.817, 0.183, 0],
    [0.333, 0.667, 0],
    [0, 0.125, 0.875],
  ],
  DEUTERANOPIA: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  DEUTERANOMALY: [
    [0.8, 0.2, 0],
    [0.258, 0.742, 0],
    [0, 0.142, 0.858],
  ],
  TRITANOPIA: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  TRITANOMALY: [
    [0.967, 0.033, 0],
    [0, 0.733, 0.267],
    [0, 0.183, 0.817],
  ],
  ACHROMATOPSIA: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
  ACHROMATOMALY: [
    [0.618, 0.32, 0.062],
    [0.163, 0.775, 0.062],
    [0.163, 0.32, 0.516],
  ],
}

const applyColorMatrix = (
  color: RgbComponent,
  matrix: number[][]
): RgbComponent => {
  const [r, g, b] = color
  const [m1, m2, m3] = matrix

  return [
    Math.round(r * m1[0] + g * m1[1] + b * m1[2]),
    Math.round(r * m2[0] + g * m2[1] + b * m2[2]),
    Math.round(r * m3[0] + g * m3[1] + b * m3[2]),
  ]
}

export default class Color {
  private render: 'HEX' | 'RGB'
  private sourceColor: RgbComponent
  private lightness: number
  private alpha: number
  private hueShifting: number
  private chromaShifting: number
  private algorithmVersion: AlgorithmVersionConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration

  constructor({
    render = 'HEX',
    sourceColor = [0, 0, 0],
    lightness = parseFloat((chroma(sourceColor).luminance() * 100).toFixed(1)),
    alpha = 1,
    hueShifting = 0,
    chromaShifting = 100,
    algorithmVersion = 'v3',
    visionSimulationMode = 'NONE',
  }: {
    render?: 'HEX' | 'RGB'
    sourceColor?: RgbComponent
    lightness?: number
    alpha?: number
    hueShifting?: number
    chromaShifting?: number
    algorithmVersion?: AlgorithmVersionConfiguration
    visionSimulationMode?: VisionSimulationModeConfiguration
  }) {
    this.render = render
    this.sourceColor = sourceColor
    this.lightness = lightness
    this.alpha = alpha
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

  setColor = (): ColorFormat<typeof this.render> => {
    if (this.render === 'HEX')
      return this.simulateColorBlindHex(this.sourceColor)

    return this.simulateColorBlindRgb(this.sourceColor)
  }

  setColorWithAlpha = (): ColorFormat<typeof this.render> => {
    if (this.render === 'HEX')
      return chroma([
        ...this.simulateColorBlindRgb(this.sourceColor),
        this.alpha,
      ]).hex()

    return [...this.simulateColorBlindRgb(this.sourceColor), this.alpha]
  }

  lch = (): ColorFormat<typeof this.render> => {
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

  lcha = (): ColorFormat<typeof this.render> => {
    const lch = chroma(this.sourceColor).lch(),
      newColor = chroma
        .lch(
          lch[0],
          this.adjustChroma(lch[1] * (this.chromaShifting / 100)),
          this.adjustHue(lch[2])
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  oklch = (): ColorFormat<typeof this.render> => {
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

  oklcha = (): ColorFormat<typeof this.render> => {
    const oklch = chroma(this.sourceColor).oklch(),
      newColor = chroma
        .oklch(
          oklch[0],
          this.adjustChroma(oklch[1] * (this.chromaShifting / 100)),
          this.adjustHue(oklch[2])
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  lab = (): ColorFormat<typeof this.render> => {
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

  laba = (): ColorFormat<typeof this.render> => {
    const labA = chroma(this.sourceColor).get('lab.a'),
      labB = chroma(this.sourceColor).get('lab.b'),
      labL = chroma(this.sourceColor).get('lab.l'),
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
      .lab(labL, this.adjustChroma(newLabA), this.adjustChroma(newLabB))
      .rgb()

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  oklab = (): ColorFormat<typeof this.render> => {
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

  oklaba = (): ColorFormat<typeof this.render> => {
    const labA = chroma(this.sourceColor).get('oklab.a'),
      labB = chroma(this.sourceColor).get('oklab.b'),
      labL = chroma(this.sourceColor).get('oklab.l'),
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
      .oklab(labL, this.adjustChroma(newLabA), this.adjustChroma(newLabB))
      .rgb()

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  hsl = (): ColorFormat<typeof this.render> => {
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

  hsla = (): ColorFormat<typeof this.render> => {
    const hsl = chroma(this.sourceColor).hsl(),
      newColor = chroma
        .hsl(
          this.adjustHue(hsl[0]),
          this.adjustChroma(hsl[1] * (this.chromaShifting / 100)),
          hsl[2]
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  hsluv = (): ColorFormat<typeof this.render> => {
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

    const newColor: RgbComponent = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
    ]

    if (this.render === 'HEX') return this.simulateColorBlindHex(newColor)

    return this.simulateColorBlindRgb(newColor)
  }

  hsluva = (): ColorFormat<typeof this.render> => {
    const hsluv = new Hsluv()

    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255

    hsluv.rgbToHsluv()

    hsluv.hsluv_s = this.adjustChroma(
      hsluv.hsluv_s * (this.chromaShifting / 100)
    )
    hsluv.hsluv_h = this.adjustHue(hsluv.hsluv_h)

    if (Number.isNaN(hsluv.hsluv_s)) hsluv.hsluv_s = 0
    if (Number.isNaN(hsluv.hsluv_h)) hsluv.hsluv_h = 0

    hsluv.hsluvToRgb()

    const newColor: RgbComponent = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
    ]

    if (this.render === 'HEX')
      return chroma([...this.simulateColorBlindRgb(newColor), this.alpha]).hex()

    return [...this.simulateColorBlindRgb(newColor), this.alpha]
  }

  getHsluv = (): RgbComponent => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }

  simulateColorBlindHex = (color: RgbComponent): HexModel => {
    const actions: ActionsList = {
      NONE: () => chroma(color).hex(),
      PROTANOMALY: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.PROTANOMALY
        )
        return chroma(transformed).hex()
      },
      PROTANOPIA: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.PROTANOPIA
        )
        return chroma(transformed).hex()
      },
      DEUTERANOMALY: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.DEUTERANOMALY
        )
        return chroma(transformed).hex()
      },
      DEUTERANOPIA: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.DEUTERANOPIA
        )
        return chroma(transformed).hex()
      },
      TRITANOMALY: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.TRITANOMALY
        )
        return chroma(transformed).hex()
      },
      TRITANOPIA: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.TRITANOPIA
        )
        return chroma(transformed).hex()
      },
      ACHROMATOMALY: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.ACHROMATOMALY
        )
        return chroma(transformed).hex()
      },
      ACHROMATOPSIA: () => {
        const transformed = applyColorMatrix(
          color,
          colorBlindMatrices.ACHROMATOPSIA
        )
        return chroma(transformed).hex()
      },
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : '#000000'
  }

  simulateColorBlindRgb = (color: RgbComponent): RgbComponent => {
    const actions: ActionsList = {
      NONE: () => chroma(color).rgb(),
      PROTANOMALY: () =>
        applyColorMatrix(color, colorBlindMatrices.PROTANOMALY),
      PROTANOPIA: () => applyColorMatrix(color, colorBlindMatrices.PROTANOPIA),
      DEUTERANOMALY: () =>
        applyColorMatrix(color, colorBlindMatrices.DEUTERANOMALY),
      DEUTERANOPIA: () =>
        applyColorMatrix(color, colorBlindMatrices.DEUTERANOPIA),
      TRITANOMALY: () =>
        applyColorMatrix(color, colorBlindMatrices.TRITANOMALY),
      TRITANOPIA: () => applyColorMatrix(color, colorBlindMatrices.TRITANOPIA),
      ACHROMATOMALY: () =>
        applyColorMatrix(color, colorBlindMatrices.ACHROMATOMALY),
      ACHROMATOPSIA: () =>
        applyColorMatrix(color, colorBlindMatrices.ACHROMATOPSIA),
    }

    const result = actions[this.visionSimulationMode]?.()
    return result !== undefined ? result : [0, 0, 0]
  }

  mixColorsRgb = (
    colorA: RgbaComponent,
    colorB: RgbaComponent
  ): RgbComponent => {
    const [r1, g1, b1, a1] = colorA
    const [r2, g2, b2, a2] = colorB

    if (a1 === 1) return [r1, g1, b1]
    if (a1 === 0) return [r2, g2, b2]

    const alpha = a1 + a2 * (1 - a1)
    const r = Math.min(
      255,
      Math.max(0, Math.round((r1 * a1 + r2 * a2 * (1 - a1)) / alpha))
    )
    const g = Math.min(
      255,
      Math.max(0, Math.round((g1 * a1 + g2 * a2 * (1 - a1)) / alpha))
    )
    const b = Math.min(
      255,
      Math.max(0, Math.round((b1 * a1 + b2 * a2 * (1 - a1)) / alpha))
    )

    return this.simulateColorBlindRgb([r, g, b])
  }

  mixColorsHex = (colorA: HexModel, colorB: HexModel): HexModel => {
    const rgbA = chroma(colorA).rgba()
    const rgbB = chroma(colorB).rgba()
    const mixed = this.mixColorsRgb(rgbA, rgbB)

    return chroma(mixed).hex()
  }
}
