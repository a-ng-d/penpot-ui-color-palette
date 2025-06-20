import { FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'
import LocalStyle from '../../canvas/LocalStyle'

const createLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const createdLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  ).then((localStyles) => {
    let i = 0
    palette.libraryData.map((item) => {
      if (
        localStyles.find((localStyle) => localStyle.id === item.styleId) ===
          undefined &&
        item.hex !== undefined
      ) {
        const style = new LocalStyle({
          name: `${item.path} / ${item.name}`,
          hex: item.hex?.substring(0, 7),
          alpha: item.alpha,
        })
        item.styleId = style.libraryColor.id
        i++
      }

      return item
    })

    penpot.currentPage?.setPluginData(`palette_${id}`, JSON.stringify(palette))

    if (i > 1) return `${i} ${locales.get().info.createdLocalStyles.plural}`
    else if (i === 1) return locales.get().info.createdLocalStyles.single
    else return locales.get().info.createdLocalStyles.none
  })

  return createdLocalStylesStatusMessage
}

export default createLocalStyles
