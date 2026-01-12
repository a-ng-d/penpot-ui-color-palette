import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { tolgee } from '../..'

const updateLocalStyles = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

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
        const hasStyleMatch = palette.libraryData
          .filter((item) => {
            return hasThemes
              ? !item.id.includes('00000000000')
              : item.id.includes('00000000000')
          })
          .some((libraryItem) => libraryItem.styleId === localStyle.id)

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
          ...(item.id.includes('00000000000')
            ? []
            : [
                item.themeName === ''
                  ? tolgee.t('themes.defaultName')
                  : item.themeName,
              ]),
          item.colorName === ''
            ? tolgee.t('colors.defaultName')
            : item.colorName,
        ]
          .filter((item) => item !== '')
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

    messages.push(
      tolgee.t('info.updatedLocalStyles', {
        count: i,
      })
    )
    messages.push(
      tolgee.t('info.removedLocalStyles', {
        count: k,
      })
    )

    penpot.currentFile?.saveVersion(
      `${palette.base.name} - ${tolgee.t('events.stylesSynced')}`
    )

    return messages.join(tolgee.t('separator'))
  })

  return updatedLocalStylesStatusMessage
}

export default updateLocalStyles
