const deletePalette = async (id: string) => {
  penpot.currentPage?.setPluginData(`palette_${id}`, '')

  return true
}

export default deletePalette
