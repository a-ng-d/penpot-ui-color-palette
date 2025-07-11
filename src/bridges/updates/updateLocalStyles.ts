import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { locales } from '../../content/locales'

const updateLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(locales.get().error.unfoundPalette)

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'alpha', 'hex'],
    palette.libraryData
  )

  const canDeepSyncStyles =
    penpot.localStorage.getItem('can_deep_sync_styles') === 'true'
  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  const updatedLocalStylesStatusMessage = await Promise.all(
    penpot.library.local.colors
  ).then((localStyles) => {
    let i = 0,
      j = 0,
      k = 0
    const messages: Array<string> = []

    if (canDeepSyncStyles ?? false)
      localStyles.forEach((localStyle) => {
        const hasStyleMatch = palette.libraryData.some(
          (libraryItem) => libraryItem.styleId === localStyle.id
        )

        if (!hasStyleMatch) {
          localStyle.remove()
          k++
        }
      })

    palette.libraryData
      .filter((item) => {
        return hasThemes
          ? !item.id.includes('00000000000')
          : item.id.includes('00000000000')
      })
      .forEach((item) => {
        const styleMatch = localStyles.find(
          (localStyle) => localStyle.id === item.styleId
        )
        const path = [
          item.paletteName,
          item.themeName === ''
            ? locales.get().themes.defaultName
            : item.themeName,
          item.colorName === ''
            ? locales.get().colors.defaultName
            : item.colorName,
        ]
          .filter((item) => item !== '' && item !== 'None')
          .join(' / ')

        if (styleMatch !== undefined) {
          if (styleMatch.name !== item.shadeName) {
            styleMatch.name = item.shadeName
            j++
          }

          if (styleMatch.path !== path) {
            styleMatch.path = path
            j++
          }

          if (item.alpha !== undefined) {
            if (styleMatch.color !== item.hex?.substring(0, 7)) {
              styleMatch.color = item.hex?.substring(0, 7)
              j++
            }

            if (styleMatch.opacity !== item.alpha) {
              styleMatch.opacity = item.alpha
              j++
            }
          } else if (styleMatch.color !== item.hex) {
            styleMatch.color = item.hex?.substring(0, 7)
            styleMatch.opacity = 1
            j++
          }

          j > 0 ? i++ : i
          j = 0
        }
      })

    if (i > 1)
      messages.push(
        locales
          .get()
          .info.updatedLocalStyles.plural.replace('{count}', i.toString())
      )
    else if (i === 1)
      messages.push(locales.get().info.updatedLocalStyles.single)
    else messages.push(locales.get().info.updatedLocalStyles.none)

    if (k > 1)
      messages.push(
        locales
          .get()
          .info.removedLocalStyles.plural.replace('{count}', k.toString())
      )
    else if (k === 1)
      messages.push(locales.get().info.removedLocalStyles.single)
    else messages.push(locales.get().info.removedLocalStyles.none)

    penpot.currentFile?.saveVersion(
      `${palette.base.name} - ${locales.get().events.stylesSynced}`
    )

    return messages.join(locales.get().separator)
  })

  return updatedLocalStylesStatusMessage
}

export default updateLocalStyles
