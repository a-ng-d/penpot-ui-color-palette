import { PaletteData } from 'src/types/data'

const getPalettesOnCurrentPage = async () => {
  const dataKeys = penpot.currentPage?.getPluginDataKeys()
  if (dataKeys === undefined)
    return penpot.ui.sendMessage({
      type: 'EXPOSE_PALETTES',
      data: [],
    })

  const dataList = dataKeys.map((key) => {
    const data = penpot.currentPage?.getPluginData(key)
    return data ? JSON.parse(data) : undefined
  })
  const palettesList: Array<PaletteData> = dataList.filter((data) => {
    if (data !== undefined) return data.type === 'UI_COLOR_PALETTE'
  })

  return penpot.ui.sendMessage({
    type: 'EXPOSE_PALETTES',
    data: palettesList,
  })
}

export default getPalettesOnCurrentPage
