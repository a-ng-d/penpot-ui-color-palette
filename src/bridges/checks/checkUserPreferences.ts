const checkUserPreferences = async () => {
  const isWCAGDisplayed = penpot.root?.getPluginData('is_wcag_displayed')
  const isAPCADisplayed = penpot.root?.getPluginData('is_apca_displayed')
  const canDeepSyncPalette = penpot.root?.getPluginData('can_deep_sync_palette')
  const canDeepSyncVariables = penpot.root?.getPluginData(
    'can_deep_sync_variables'
  )
  const canDeepSyncStyles = penpot.root?.getPluginData('can_deep_sync_styles')

  if (isWCAGDisplayed === null)
    penpot.root?.setPluginData('is_wcag_displayed', 'true')

  if (isAPCADisplayed === null)
    penpot.root?.setPluginData('is_apca_displayed', 'true')

  if (canDeepSyncPalette === null)
    penpot.root?.setPluginData('can_deep_sync_palette', 'false')

  if (canDeepSyncVariables === null)
    penpot.root?.setPluginData('can_deep_sync_variables', 'false')

  if (canDeepSyncStyles === null)
    penpot.root?.setPluginData('can_deep_sync_styles', 'false')

  return penpot.ui.sendMessage({
    type: 'CHECK_USER_PREFERENCES',
    data: {
      isWCAGDisplayed: isWCAGDisplayed === 'true',
      isAPCADisplayed: isAPCADisplayed === 'true',
      canDeepSyncPalette: canDeepSyncPalette === 'true',
      canDeepSyncVariables: canDeepSyncVariables === 'true',
      canDeepSyncStyles: canDeepSyncStyles === 'true',
    },
  })
}

export default checkUserPreferences
