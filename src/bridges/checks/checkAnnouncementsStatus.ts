const checkAnnouncementsStatus = (remoteVersion: string) => {
  const localVersion = penpot.localStorage.getItem('announcements_version')
  const isOnboardingRead = penpot.localStorage.getItem('is_onboarding_read')

  if (localVersion === '' && remoteVersion === '')
    return {
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'NO_ANNOUNCEMENTS',
      },
    }
  else if (localVersion === '' && isOnboardingRead === '')
    return penpot.ui.sendMessage({
      type: 'PUSH_ONBOARDING_STATUS',
      data: {
        status: 'DISPLAY_ONBOARDING_DIALOG',
      },
    })
  else if (localVersion === '')
    return penpot.ui.sendMessage({
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
      },
    })
  else {
    const remoteMajorVersion = remoteVersion.split('.')[0],
      remoteMinorVersion = remoteVersion.split('.')[1]

    const localMajorVersion = localVersion?.split('.')[0],
      localMinorVersion = localVersion?.split('.')[1]

    if (remoteMajorVersion !== localMajorVersion)
      return penpot.ui.sendMessage({
        type: 'PUSH_ANNOUNCEMENTS_STATUS',
        data: {
          status: 'DISPLAY_ANNOUNCEMENTS_DIALOG',
        },
      })

    if (remoteMinorVersion !== localMinorVersion)
      return penpot.ui.sendMessage({
        type: 'PUSH_ANNOUNCEMENTS_STATUS',
        data: {
          status: 'DISPLAY_ANNOUNCEMENTS_NOTIFICATION',
        },
      })

    return {
      type: 'PUSH_ANNOUNCEMENTS_STATUS',
      data: {
        status: 'NO_ANNOUNCEMENTS',
      },
    }
  }
}

export default checkAnnouncementsStatus
