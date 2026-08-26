import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'
import isValidPaletteConfiguration from '../utils/isValidPaletteConfiguration'

const getPalettesOnCurrentPage = async () => {
  const dataKeys = penpot.currentPage?.getSharedPluginDataKeys('uicp')
  if (dataKeys === undefined)
    return penpot.ui.sendMessage({
      type: 'EXPOSE_PALETTES',
      data: [],
    })
  const dataList = dataKeys
    .filter((data: string) => data.includes('palette_'))
    .map((key: string) => {
      const data = penpot.currentPage?.getSharedPluginData('uicp', key)
      if (!data) return undefined
      try {
        return JSON.parse(data)
      } catch (error) {
        console.warn(
          `[getPalettesOnCurrentPage] Failed to parse stored palette data for key "${key}"`,
          error
        )
        return undefined
      }
    })
  const palettesList: Array<FullConfiguration> = dataList.filter(
    (data): data is FullConfiguration => isValidPaletteConfiguration(data)
  )

  return penpot.ui.sendMessage({
    type: 'EXPOSE_PALETTES',
    data: palettesList,
  })
}

export default getPalettesOnCurrentPage
