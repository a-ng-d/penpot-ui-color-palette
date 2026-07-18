import { FullConfiguration } from '@yelbolt/engine-ui-color-palette'

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
      return data ? JSON.parse(data) : undefined
    })
  const palettesList: Array<FullConfiguration> = dataList.filter((data) => {
    if (data !== undefined) return data.type === 'UI_COLOR_PALETTE'
  })

  return penpot.ui.sendMessage({
    type: 'EXPOSE_PALETTES',
    data: palettesList,
  })
}

export default getPalettesOnCurrentPage
