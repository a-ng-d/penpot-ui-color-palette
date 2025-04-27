import { ConsentConfiguration } from '@a_ng_d/figmug-ui'
import { locals } from '../content/locals'

export const userConsent: Array<ConsentConfiguration> = [
  {
    name: locals.get().vendors.mixpanel.name,
    id: 'mixpanel',
    icon: 'https://asset.brandfetch.io/idr_rhI2FS/ideb-tnj2D.svg',
    description: locals.get().vendors.mixpanel.description,
    isConsented: false,
  },
]
