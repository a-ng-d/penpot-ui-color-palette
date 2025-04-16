const checkHighlightStatus = (remoteVersion: string) => {
  const localVersion = penpot.root?.getPluginData('highlight_version')
  const isOnboardingRead = penpot.root?.getPluginData('is_onboarding_read')

  if (localVersion === undefined && remoteVersion === undefined)
    return {
      type: 'PUSH_HIGHLIGHT_STATUS',
      data: 'NO_HIGHLIGHT',
    }
  else if (localVersion === undefined && isOnboardingRead === undefined)
    return penpot.ui.sendMessage({
      type: 'PUSH_ONBOARDING_STATUS',
      data: 'DISPLAY_ONBOARDING_DIALOG',
    })
  else if (localVersion === undefined)
    return penpot.ui.sendMessage({
      type: 'PUSH_HIGHLIGHT_STATUS',
      data: 'DISPLAY_HIGHLIGHT_DIALOG',
    })
  else {
    const remoteMajorVersion = remoteVersion.split('.')[0],
      remoteMinorVersion = remoteVersion.split('.')[1]

    const localMajorVersion = localVersion?.split('.')[0],
      localMinorVersion = localVersion?.split('.')[1]

    if (remoteMajorVersion !== localMajorVersion)
      return penpot.ui.sendMessage({
        type: 'PUSH_HIGHLIGHT_STATUS',
        data: 'DISPLAY_HIGHLIGHT_DIALOG',
      })

    if (remoteMinorVersion !== localMinorVersion)
      return penpot.ui.sendMessage({
        type: 'PUSH_HIGHLIGHT_STATUS',
        data: 'DISPLAY_HIGHLIGHT_NOTIFICATION',
      })

    return null
  }
}

export default checkHighlightStatus
