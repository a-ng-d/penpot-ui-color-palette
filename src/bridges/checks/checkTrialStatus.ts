import globalConfig from '../../global.config'

const checkTrialStatus = async () => {
  const trialStartDate = penpot.localStorage.getItem('trial_start_date')
  const currentTrialVersion: string =
    penpot.localStorage.getItem('trial_version') ??
    globalConfig.versions.trialVersion
  const currentTrialTime: number = parseFloat(
    penpot.localStorage.getItem('trial_time') ?? '72'
  )

  let consumedTime = 0,
    trialStatus = 'UNUSED'

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60)

    if (
      consumedTime <= currentTrialTime &&
      currentTrialVersion !== globalConfig.versions.trialVersion &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = 'PENDING'
    else if (
      consumedTime >= globalConfig.plan.trialTime &&
      globalConfig.plan.isTrialEnabled
    )
      trialStatus = 'EXPIRED'
    else trialStatus = 'UNUSED'
  }

  penpot.ui.sendMessage({
    type: 'CHECK_TRIAL_STATUS',
    data: {
      planStatus:
        trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled
          ? 'PAID'
          : 'UNPAID',
      trialStatus: trialStatus,
      trialRemainingTime: Math.ceil(
        currentTrialVersion !== globalConfig.versions.trialVersion
          ? currentTrialTime - consumedTime
          : globalConfig.plan.trialTime - consumedTime
      ),
    },
  })

  return trialStatus === 'PENDING' || !globalConfig.plan.isProEnabled
    ? 'PAID'
    : 'UNPAID'
}

export default checkTrialStatus
