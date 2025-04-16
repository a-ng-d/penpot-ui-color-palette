import loadUI from './bridges/loadUI'
penpot.ui.sendMessage({
  type: 'CHECK_USER_CONSENT',
  mustUserConsent: 'ef',
})
// Loader
loadUI()
