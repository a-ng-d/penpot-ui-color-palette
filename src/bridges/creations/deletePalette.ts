const deletePalette = async (id: string) => {
  return penpot.currentPage?.setPluginData(`palette_${id}`, '')
}

export default deletePalette
