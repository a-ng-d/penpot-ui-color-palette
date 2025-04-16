const checkPlanStatus = async (context = 'UI' as 'UI' | 'PARAMETERS') => {
  // figma.clientStorage.deleteAsync('trial_start_date')
  // figma.clientStorage.deleteAsync('trial_version')
  // window.localStorage.setItem(
  //   'trial_start_date',
  //   new Date().getTime() - 72 * 60 * 60 * 1000
  // )
  // figma.payments?.setPaymentStatusInDevelopment({
  //   type: 'UNPAID',
  // })
  /*const trialStartDate = window.localStorage.getItem("trial_start_date"),
    currentTrialVersion: string =
      window.localStorage.getItem("trial_version") ?? trialVersion;

  let consumedTime = 0,
    trialStatus = "UNUSED";

  if (trialStartDate) {
    consumedTime =
      (new Date().getTime() - new Date(trialStartDate).getTime()) /
      1000 /
      (60 * 60);

    if (consumedTime <= oldTrialTime && currentTrialVersion !== trialVersion)
      trialStatus = "PENDING";
    else if (consumedTime >= trialTime) trialStatus = "EXPIRED";
    else trialStatus = "PENDING";
  }

  if (context === "UI")
    penpot.ui.sendMessage({
      type: "CHECK_PLAN_STATUS",
      data: {
        planStatus:
          trialStatus === "PENDING" || !isProEnabled
            ? "PAID"
            : figma.payments?.status.type,
        trialStatus: trialStatus,
        trialRemainingTime: Math.ceil(
          currentTrialVersion !== trialVersion
            ? oldTrialTime - consumedTime
            : trialTime - consumedTime
        ),
      },
    });

  return trialStatus === "PENDING" || !isProEnabled
    ? "PAID"
    : figma.payments?.status.type;*/

  return null
}

export default checkPlanStatus
