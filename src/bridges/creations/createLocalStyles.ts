import LocalStyle from '../../canvas/LocalStyle'
import { locales } from '../../content/locales'
import { FullConfiguration, PaletteData } from '@a_ng_d/utils-ui-color-palette'

const createLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.styles)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  const paletteData: PaletteData = palette.data,
    workingThemes =
      paletteData.themes.filter((theme) => theme.type === 'custom theme')
        .length === 0
        ? paletteData.themes.filter((theme) => theme.type === 'default theme')
        : paletteData.themes.filter((theme) => theme.type === 'custom theme')

  const createdLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  )
    .then((localStyles) => {
      let i = 0
      workingThemes.forEach((theme) => {
        theme.colors.forEach((color) => {
          color.shades.forEach((shade) => {
            if (
              localStyles.find(
                (localStyle) => localStyle.id === shade.styleId
              ) === undefined
            ) {
              const style = new LocalStyle({
                name:
                  workingThemes[0].type === 'custom theme'
                    ? `${
                        paletteData.name === '' ? '' : paletteData.name + ' / '
                      }${theme.name} / ${color.name} / ${shade.name}`
                    : `${paletteData.name === '' ? '' : paletteData.name} / ${
                        color.name
                      } / ${shade.name}`,
                hex: shade.isTransparent
                  ? shade.hex.substring(0, 7)
                  : shade.hex,
                alpha: shade.isTransparent ? shade.alpha : undefined,
              })
              shade.styleId = style.libraryColor.id
              i++
            }
          })
        })
      })

      penpot.currentPage?.setPluginData(
        `palette_${id}`,
        JSON.stringify(palette)
      )

      if (i > 1) return `${i} ${locales.get().info.createdLocalStyles.plural}`
      else if (i === 1) return locales.get().info.createdLocalStyles.single
      else return locales.get().info.createdLocalStyles.none
    })
    .catch(() => locales.get().error.generic)

  return await createdLocalStylesStatusMessage
}

export default createLocalStyles
