import { HexModel } from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'
import { Hsluv } from 'hsluv'
import {
  AlgorithmVersionConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
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
  color: [number, number, number],
  matrix: number[][]
): [number, number, number] => {
  const [r, g, b] = color
  return [
    Math.min(
      255,
      Math.max(
        0,
        Math.round(r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2])
      )
    ),
    Math.min(
      255,
      Math.max(
        0,
        Math.round(r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2])
      )
    ),
    Math.min(
      255,
      Math.max(
        0,
        Math.round(r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2])
      )
    ),
  ]
}

export default class Color {
  private render: 'HEX' | 'RGB'
  private sourceColor: [number, number, number]
  private lightness: number
  private hueShifting: number
  private chromaShifting: number
  private algorithmVersion: AlgorithmVersionConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private alpha?: number

  constructor({
    render = 'HEX',
    sourceColor = [0, 0, 0],
    lightness = 100,
    hueShifting = 0,
    chromaShifting = 100,
    algorithmVersion = 'v3',
    visionSimulationMode = 'NONE',
    alpha,
  }: {
    render?: 'HEX' | 'RGB'
    sourceColor?: [number, number, number]
    lightness?: number
    hueShifting?: number
    chromaShifting?: number
    algorithmVersion?: AlgorithmVersionConfiguration
    visionSimulationMode?: VisionSimulationModeConfiguration
    alpha?: number
  }) {
    this.render = render
    this.sourceColor = sourceColor
    this.lightness = lightness
    this.hueShifting = hueShifting
    this.chromaShifting = chromaShifting
    this.algorithmVersion = algorithmVersion
    this.visionSimulationMode = visionSimulationMode
    this.alpha = alpha
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

  hex = (): HexModel | [number, number, number] => {
    if (this.render === 'HEX')
      return this.simulateColorBlindHex([...this.sourceColor])

    return this.simulateColorBlindRgb([...this.sourceColor])
  }

  hexa = (): HexModel | [number, number, number, number] => {
    if (this.render === 'HEX')
      return chroma([...this.sourceColor, this.alpha ?? 1]).hex()

    return [...this.sourceColor, this.alpha ?? 1]
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

    if (this.render === 'HEX') return this.simulateColorBlindHex([...newColor])

    return this.simulateColorBlindRgb([...newColor])
  }

  lcha = (): HexModel | [number, number, number, number] => {
    const lch = chroma(this.sourceColor).lch(),
      newColor = chroma
        .lch(
          lch[0],
          this.adjustChroma(lch[1] * (this.chromaShifting / 100)),
          this.adjustHue(lch[2])
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...newColor, this.alpha ?? 1]).hex()

    return [...newColor, this.alpha ?? 1]
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

  oklcha = (): HexModel | [number, number, number, number] => {
    const oklch = chroma(this.sourceColor).oklch(),
      newColor = chroma
        .oklch(
          oklch[0],
          this.adjustChroma(oklch[1] * (this.chromaShifting / 100)),
          this.adjustHue(oklch[2])
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...newColor, this.alpha ?? 1]).hex()

    return [...newColor, this.alpha ?? 1]
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

  laba = (): HexModel | [number, number, number, number] => {
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
      return chroma([...newColor, this.alpha ?? 1]).hex()

    return [...newColor, this.alpha ?? 1]
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

  oklaba = (): HexModel | [number, number, number, number] => {
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
      return chroma([...newColor, this.alpha ?? 1]).hex()

    return [...newColor, this.alpha ?? 1]
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

  hsla = (): HexModel | [number, number, number, number] => {
    const hsl = chroma(this.sourceColor).hsl(),
      newColor = chroma
        .hsl(
          this.adjustHue(hsl[0]),
          this.adjustChroma(hsl[1] * (this.chromaShifting / 100)),
          hsl[2]
        )
        .rgb()

    if (this.render === 'HEX')
      return chroma([...newColor, this.alpha ?? 1]).hex()

    return [...newColor, this.alpha ?? 1]
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

  hsluva = (): HexModel | [number, number, number, number] => {
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

    const newColor: [number, number, number, number] = [
      hsluv.rgb_r * 255,
      hsluv.rgb_g * 255,
      hsluv.rgb_b * 255,
      this.alpha ?? 1,
    ]

    if (this.render === 'HEX') return chroma(newColor).hex()

    return newColor
  }

  getHsluv = (): [number, number, number] => {
    const hsluv = new Hsluv()
    hsluv.rgb_r = this.sourceColor[0] / 255
    hsluv.rgb_g = this.sourceColor[1] / 255
    hsluv.rgb_b = this.sourceColor[2] / 255
    hsluv.rgbToHsluv()

    return [hsluv.hsluv_h, hsluv.hsluv_s, hsluv.hsluv_l]
  }

  simulateColorBlindHex = (color: [number, number, number]): HexModel => {
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

  simulateColorBlindRgb = (
    color: [number, number, number]
  ): [number, number, number] => {
    const actions: ActionsList = {
      NONE: () => color,
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

    return this.simulateColorBlindRgb([r, g, b])
  }

  mixColorsHex = (colorA: HexModel, colorB: HexModel): HexModel => {
    const rgbA = chroma(colorA).rgba()
    const rgbB = chroma(colorB).rgba()
    const mixed = this.mixColorsRgb(rgbA, rgbB)

    return this.simulateColorBlindHex(mixed)
  }
}
