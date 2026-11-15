import {
  PaletteData,
  PaletteDataThemeItem,
} from '@yelbolt/engine-ui-color-palette'
import { MeteredAction, UsageUnit } from '../../types/messages'

export type UsagePairs = Set<string>

export const getLaidOutPairs = (
  themes: Array<PaletteDataThemeItem>
): UsagePairs => {
  const pairs: UsagePairs = new Set()
  themes.forEach((theme) =>
    theme.colors.forEach((color) => pairs.add(`${color.id}:${theme.id}`))
  )
  return pairs
}

export const getWorkingThemes = (
  data: PaletteData
): Array<PaletteDataThemeItem> =>
  data.themes.filter((theme) => theme.type === 'custom theme').length === 0
    ? data.themes.filter((theme) => theme.type === 'default theme')
    : data.themes.filter((theme) => theme.type === 'custom theme')

export const reportUsage = (
  action: MeteredAction,
  usage: Partial<Record<UsageUnit, number>>
) =>
  penpot.ui.sendMessage({
    type: 'REPORT_USAGE',
    data: { action, usage },
  })
