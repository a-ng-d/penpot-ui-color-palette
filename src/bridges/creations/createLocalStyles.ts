import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import LocalStyle from '../../canvas/LocalStyle'
import { tolgee } from '../..'

const createLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'alpha', 'hex'],
    palette.libraryData
  )

  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const createdLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  ).then((localStyles) => {
    let i = 0

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes('00000000000')
          : item.id.includes('00000000000')
      })
      .forEach((item) => {
        const path = [
          item.paletteName,
          item.themeName === ''
            ? tolgee.t('themes.defaultName')
            : item.themeName,
          item.colorName === ''
            ? tolgee.t('colors.defaultName')
            : item.colorName,
          item.shadeName,
        ]
          .filter((item) => item !== '' && item !== 'None')
          .join(' / ')

        if (
          localStyles.find((localStyle) => localStyle.id === item.styleId) ===
            undefined &&
          item.hex !== undefined
        ) {
          const style = new LocalStyle({
            name: path,
            hex: item.hex?.substring(0, 7),
            alpha: item.alpha,
          })

          item.styleId = style.libraryColor.id
          i++
        }

        return item
      })

    palette.libraryData = new Data(palette).makeLibraryData(
      ['style_id'],
      palette.libraryData
    )

    penpot.currentPage?.setPluginData(`palette_${id}`, JSON.stringify(palette))

    return tolgee.t('info.createdLocalStyles', {
      count: i,
    })
  })

  return createdLocalStylesStatusMessage
}

export default createLocalStyles
