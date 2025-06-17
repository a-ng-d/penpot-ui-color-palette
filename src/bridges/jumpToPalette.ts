const jumpToPalette = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (!rawPalette) throw new Error()

  const palette = JSON.parse(rawPalette)
  palette.meta.dates.openedAt = new Date().toISOString()
  penpot.currentPage?.setPluginData(`palette_${id}`, JSON.stringify(palette))

  return penpot.ui.sendMessage({
    type: 'LOAD_PALETTE',
    data: palette,
  })
}

export default jumpToPalette
