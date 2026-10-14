import { Data, FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import {
  Fill,
  Gradient,
  Shadow,
  Shape,
  Stroke,
  Text,
} from '@penpot/plugin-types'
import { tolgee } from '../..'

type Rgb = { r: number; g: number; b: number }

interface PaletteMatcher {
  rgb: (color: Rgb) => Rgb
  color: (value: string) => string
}

type Lab = [number, number, number]
type Lch = { l: number; c: number; h: number }
type Shade = { rgb: Rgb; lch: Lch }
type Family = { shades: Array<Shade>; hue: number; chroma: number }

const NEUTRAL_SOURCE_CHROMA = 0.015
const NEUTRAL_FAMILY_CHROMA = 0.06

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

const toOklab = ({ r, g, b }: Rgb): Lab => {
  const lr = toLinear(r)
  const lg = toLinear(g)
  const lb = toLinear(b)

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const toOklch = (color: Rgb): Lch => {
  const [l, a, b] = toOklab(color)
  return { l, c: Math.sqrt(a * a + b * b), h: Math.atan2(b, a) }
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % (2 * Math.PI)
  return d > Math.PI ? 2 * Math.PI - d : d
}

const toHexByte = (channel: number) =>
  Math.round(Math.min(1, Math.max(0, channel)) * 255)
    .toString(16)
    .padStart(2, '0')

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const FUNCTIONAL =
  /^rgba?\(\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(%?)\s*[, ]\s*([\d.]+)(%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i

const createFamilies = (palette: FullConfiguration): Array<Family> => {
  const libraryData = new Data(palette).makeLibraryData(['gl', 'alpha'])

  const hasThemes = libraryData.some((item) => !item.id.includes('00000000000'))
  const items = libraryData
    .filter((item) =>
      hasThemes
        ? !item.id.includes('00000000000')
        : item.id.includes('00000000000')
    )
    .filter((item) => item.gl !== undefined)
  const themeName = items[0]?.themeName

  const byName = new Map<string, Array<Shade>>()
  items
    .filter((item) => item.themeName === themeName)
    .forEach((item) => {
      const gl = item.gl ?? [0, 0, 0]
      const rgb = { r: gl[0], g: gl[1], b: gl[2] }
      const shades = byName.get(item.colorName) ?? []
      shades.push({ rgb, lch: toOklch(rgb) })
      byName.set(item.colorName, shades)
    })

  return Array.from(byName.values()).map((shades) => {
    const peak = shades.reduce((a, b) => (b.lch.c > a.lch.c ? b : a))
    return { shades, hue: peak.lch.h, chroma: peak.lch.c }
  })
}

const createPaletteMatcher = (
  palette: FullConfiguration
): PaletteMatcher | null => {
  const families = createFamilies(palette)
  if (families.length === 0) return null

  const chromatics = families.filter((f) => f.chroma >= NEUTRAL_FAMILY_CHROMA)
  const mostNeutral = families.reduce((a, b) => (b.chroma < a.chroma ? b : a))
  const cache = new Map<string, Rgb>()

  const rgb = (color: Rgb): Rgb => {
    const key = `${color.r},${color.g},${color.b}`
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const lch = toOklch(color)

    const family =
      lch.c < NEUTRAL_SOURCE_CHROMA || chromatics.length === 0
        ? mostNeutral
        : chromatics.reduce((a, b) =>
            hueGap(lch.h, b.hue) < hueGap(lch.h, a.hue) ? b : a
          )

    const shade = family.shades.reduce((a, b) => {
      const dA = Math.abs(a.lch.l - lch.l)
      const dB = Math.abs(b.lch.l - lch.l)
      if (dB !== dA) return dB < dA ? b : a
      return Math.abs(b.lch.c - lch.c) < Math.abs(a.lch.c - lch.c) ? b : a
    })

    cache.set(key, shade.rgb)
    return shade.rgb
  }

  const color = (value: string): string => {
    const input = value.trim()

    const hex = HEX.exec(input)
    if (hex !== null) {
      let digits = hex[1]
      if (digits.length <= 4)
        digits = digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      const match = rgb({
        r: parseInt(digits.slice(0, 2), 16) / 255,
        g: parseInt(digits.slice(2, 4), 16) / 255,
        b: parseInt(digits.slice(4, 6), 16) / 255,
      })
      return `#${toHexByte(match.r)}${toHexByte(match.g)}${toHexByte(match.b)}${digits.slice(6)}`
    }

    const functional = FUNCTIONAL.exec(input)
    if (functional !== null) {
      const channel = (raw: string, isPercent: string) =>
        isPercent === '%' ? parseFloat(raw) / 100 : parseFloat(raw) / 255
      const match = rgb({
        r: channel(functional[1], functional[2]),
        g: channel(functional[3], functional[4]),
        b: channel(functional[5], functional[6]),
      })
      const r = Math.round(match.r * 255)
      const g = Math.round(match.g * 255)
      const b = Math.round(match.b * 255)
      return functional[7] !== undefined
        ? `rgba(${r}, ${g}, ${b}, ${functional[7]})`
        : `rgb(${r}, ${g}, ${b})`
    }

    return value
  }

  return { rgb, color }
}

type Match = (value: string) => string

const isSet = (value: unknown) => value !== undefined && value !== null

const without = <T extends object>(source: T, keys: Array<string>): T =>
  Object.fromEntries(
    Object.entries(source).filter(([key]) => !keys.includes(key))
  ) as T

const remapGradient = (gradient: Gradient, match: Match): Gradient | null => {
  let changed = false

  const stops = gradient.stops.map((stop) => {
    const color = match(stop.color)
    if (color === stop.color) return stop

    changed = true
    return { ...stop, color }
  })

  return changed ? { ...gradient, stops } : null
}

const remapFills = (fills: Array<Fill>, match: Match): Array<Fill> | null => {
  let changed = false

  const next = fills.map((fill) => {
    if (isSet(fill.fillImage)) return fill

    if (isSet(fill.fillColorGradient)) {
      const gradient = remapGradient(fill.fillColorGradient as Gradient, match)
      if (gradient === null) return fill

      changed = true
      return {
        ...without(fill, ['fillColorRefId', 'fillColorRefFile']),
        fillColorGradient: gradient,
      }
    }

    if (!isSet(fill.fillColor)) return fill

    const color = match(fill.fillColor as string)
    if (color === fill.fillColor) return fill

    changed = true
    return {
      ...without(fill, ['fillColorRefId', 'fillColorRefFile']),
      fillColor: color,
    }
  })

  return changed ? next : null
}

const remapStrokes = (
  strokes: Array<Stroke>,
  match: Match
): Array<Stroke> | null => {
  let changed = false

  const next = strokes.map((stroke) => {
    if (isSet(stroke.strokeColorGradient)) {
      const gradient = remapGradient(
        stroke.strokeColorGradient as Gradient,
        match
      )
      if (gradient === null) return stroke

      changed = true
      return {
        ...without(stroke, ['strokeColorRefId', 'strokeColorRefFile']),
        strokeColorGradient: gradient,
      }
    }

    if (!isSet(stroke.strokeColor)) return stroke

    const color = match(stroke.strokeColor as string)
    if (color === stroke.strokeColor) return stroke

    changed = true
    return {
      ...without(stroke, ['strokeColorRefId', 'strokeColorRefFile']),
      strokeColor: color,
    }
  })

  return changed ? next : null
}

const remapShadows = (
  shadows: Array<Shadow>,
  match: Match
): Array<Shadow> | null => {
  let changed = false

  const next = shadows.map((shadow) => {
    const source = shadow.color
    if (!source || !isSet(source.color) || isSet(source.gradient)) return shadow

    const color = match(source.color as string)
    if (color === source.color) return shadow

    changed = true
    return {
      ...shadow,
      color: {
        ...without(source, [
          'id',
          'fileId',
          'name',
          'path',
          'refId',
          'refFile',
        ]),
        color,
      },
    }
  })

  return changed ? next : null
}

const remapText = (node: Text, match: Match) => {
  if (node.fills !== 'mixed') {
    const fills = remapFills(node.fills, match)
    if (fills !== null) node.fills = fills
    return
  }

  const length = node.characters.length
  for (let i = 0; i < length; i++) {
    const range = node.getRange(i, i + 1)
    if (range.fills === 'mixed') continue
    const fills = remapFills(range.fills, match)
    if (fills !== null) range.fills = fills
  }
}

const readTokens = (node: Shape) => {
  try {
    return JSON.stringify((node as unknown as { tokens?: unknown }).tokens)
  } catch {
    return 'unreadable'
  }
}

const remapShape = (node: Shape, match: Match) => {
  const tokensBefore = readTokens(node)

  if (node.type === 'text') remapText(node as Text, match)
  else if (Array.isArray(node.fills)) {
    const fills = remapFills(node.fills as Array<Fill>, match)
    if (fills !== null) node.fills = fills
  }

  if (Array.isArray(node.strokes)) {
    const strokes = remapStrokes(node.strokes as Array<Stroke>, match)
    if (strokes !== null) node.strokes = strokes
  }

  if (Array.isArray(node.shadows)) {
    const shadows = remapShadows(node.shadows as Array<Shadow>, match)
    if (shadows !== null) node.shadows = shadows
  }

  const tokensAfter = readTokens(node)
  if (tokensBefore !== undefined && tokensBefore !== '{}')
    console.log('[uicp:simulate] tokens', node.type, node.name, {
      before: tokensBefore,
      after: tokensAfter,
    })
}

const simulateShape = (node: Shape, match: Match) => {
  if (node.hidden || node.blocked) return

  remapShape(node, match)

  const children = (node as { children?: Array<Shape> }).children
  if (Array.isArray(children))
    children.forEach((child) => simulateShape(child, match))
}

const createSimulation = async (id: string) => {
  const rawPalette = penpot.currentPage?.getSharedPluginData(
    'uicp',
    `palette_${id}`
  )

  if (rawPalette === undefined || rawPalette === null || rawPalette === '')
    throw new Error(tolgee.t('error.unfoundPalette'))

  const selection = penpot.selection
  if (selection.length === 0)
    return {
      type: 'WARNING' as const,
      message: tolgee.t('warning.emptySelection'),
    }

  const palette = JSON.parse(rawPalette) as FullConfiguration
  const matcher = createPaletteMatcher(palette)

  if (matcher === null) throw new Error(tolgee.t('error.unfoundPalette'))

  const match = matcher.color

  const block = penpot.history.undoBlockBegin()
  try {
    selection.forEach((node) => simulateShape(node, match))
  } finally {
    penpot.history.undoBlockFinish(block)
  }
}

export default createSimulation
