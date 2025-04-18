import {
  Bar,
  Button,
  ConsentConfiguration,
  layouts,
  Menu,
} from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features, {
  authorUrl,
  documentationUrl,
  feedbackUrl,
  isTrialEnabled,
  networkUrl,
  repositoryUrl,
  requestsUrl,
  supportEmail,
} from '../../config'
import { locals } from '../../content/locals'
import {
  HighlightDigest,
  Language,
  PlanStatus,
  TrialStatus,
} from '../../types/app'
import { UserConfiguration } from '../../types/configurations'
import { UserSession } from '../../types/user'
import Feature from '../components/Feature'
import PlanControls from './PlanControls'

interface ShortcutsProps {
  planStatus: PlanStatus
  trialStatus: TrialStatus
  trialRemainingTime: number
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  lang: Language
  highlight: HighlightDigest
  onReOpenHighlight: () => void
  onReOpenOnboarding: () => void
  onReOpenStore: () => void
  onReOpenAbout: () => void
  onReOpenReport: () => void
  onGetProPlan: () => void
  onUpdateConsent: () => void
}

interface ShortcutsStates {
  isUserMenuLoading: boolean
}

export default class Shortcuts extends PureComponent<
  ShortcutsProps,
  ShortcutsStates
> {
  static features = (planStatus: PlanStatus) => ({
    SHORTCUTS_USER: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_USER',
      planStatus: planStatus,
    }),
    SHORTCUTS_HIGHLIGHT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_HIGHLIGHT',
      planStatus: planStatus,
    }),
    SHORTCUTS_ONBOARDING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_ONBOARDING',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPOSITORY: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REPOSITORY',
      planStatus: planStatus,
    }),
    SHORTCUTS_EMAIL: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_EMAIL',
      planStatus: planStatus,
    }),
    SHORTCUTS_FEEDBACK: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_FEEDBACK',
      planStatus: planStatus,
    }),
    SHORTCUTS_REPORTING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REPORTING',
      planStatus: planStatus,
    }),
    SHORTCUTS_REQUESTS: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_REQUESTS',
      planStatus: planStatus,
    }),
    SHORTCUTS_STORE: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_STORE',
      planStatus: planStatus,
    }),
    SHORTCUTS_ABOUT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_ABOUT',
      planStatus: planStatus,
    }),
    SHORTCUTS_NETWORKING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_NETWORKING',
      planStatus: planStatus,
    }),
    SHORTCUTS_AUTHOR: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_AUTHOR',
      planStatus: planStatus,
    }),
    SHORTCUTS_DOCUMENTATION: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_DOCUMENTATION',
      planStatus: planStatus,
    }),
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    CONSENT: new FeatureStatus({
      features: features,
      featureName: 'CONSENT',
      planStatus: planStatus,
    }),
  })

  constructor(props: ShortcutsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Direct Actions
  onHold = (e: MouseEvent) => {
    const target = e.target as HTMLElement
    const shiftX = target.offsetWidth - e.layerX
    const shiftY = target.offsetHeight - e.layerY
    window.onmousemove = (e) => this.onResize(e, shiftX, shiftY)
    window.onmouseup = this.onRelease
  }

  onResize = (e: MouseEvent, shiftX: number, shiftY: number) => {
    const windowSize = {
      w: 640,
      h: 400,
    }
    const origin = {
      x: e.screenX - e.clientX,
      y: e.screenY - e.clientY,
    }
    const shift = {
      x: shiftX,
      y: shiftY,
    }
    const cursor = {
      x: e.screenX,
      y: e.screenY,
    }
    const scaleX = Math.abs(origin.x - cursor.x - shift.x),
      scaleY = Math.abs(origin.y - cursor.y - shift.y)

    if (scaleX > 540) windowSize.w = scaleX
    else windowSize.w = 540
    if (scaleY > 432) windowSize.h = scaleY
    else windowSize.h = 432
    parent.postMessage(
      {
        pluginMessage: {
          type: 'RESIZE_UI',
          data: {
            width: windowSize.w,
            height: windowSize.h,
          },
        },
      },
      '*'
    )
  }

  onRelease = () => (window.onmousemove = null)

  // Render
  render() {
    let fragment = null

    if (isTrialEnabled || this.props.trialStatus !== 'UNUSED')
      fragment = <PlanControls {...this.props} />
    else if (
      this.props.planStatus === 'UNPAID' &&
      this.props.trialStatus === 'UNUSED'
    )
      fragment = (
        <Button
          type="alternative"
          size="small"
          icon="lock-off"
          label={locals[this.props.lang].plan.getPro}
          action={() =>
            parent.postMessage({ pluginMessage: { type: 'GET_PRO_PLAN' } }, '*')
          }
        />
      )

    return (
      <>
        <Bar
          rightPartSlot={
            <>
              <div
                className={doClassnames([
                  'shortcuts',
                  layouts['snackbar--medium'],
                ])}
              >
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus
                  ).SHORTCUTS_DOCUMENTATION.isActive()}
                >
                  <Button
                    type="icon"
                    icon="library"
                    helper={{
                      label:
                        locals[this.props.lang].shortcuts.tooltips
                          .documentation,
                      pin: 'TOP',
                    }}
                    isBlocked={Shortcuts.features(
                      this.props.planStatus
                    ).SHORTCUTS_DOCUMENTATION.isBlocked()}
                    isNew={Shortcuts.features(
                      this.props.planStatus
                    ).SHORTCUTS_DOCUMENTATION.isNew()}
                    action={() =>
                      window.open(documentationUrl, '_blank')?.focus()
                    }
                  />
                </Feature>
                <Feature
                  isActive={Shortcuts.features(
                    this.props.planStatus
                  ).SHORTCUTS_USER.isActive()}
                >
                  {this.props.userSession.connectionStatus === 'CONNECTED' ? (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: locals[
                            this.props.lang
                          ].user.welcomeMessage.replace(
                            '$[]',
                            this.props.userSession.userFullName
                          ),
                          type: 'TITLE',
                          action: () => null,
                        },
                        {
                          type: 'SEPARATOR',
                        },
                        {
                          label: locals[this.props.lang].user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                      ]}
                      alignment="TOP_RIGHT"
                      helper={{
                        label:
                          locals[this.props.lang].shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  ) : (
                    <Menu
                      id="user-menu"
                      icon="user"
                      options={[
                        {
                          label: locals[this.props.lang].user.updateConsent,
                          type: 'OPTION',
                          isActive: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isActive(),
                          isBlocked: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isBlocked(),
                          isNew: Shortcuts.features(
                            this.props.planStatus
                          ).CONSENT.isNew(),
                          action: this.props.onUpdateConsent,
                        },
                      ]}
                      state={
                        this.state.isUserMenuLoading ? 'LOADING' : 'DEFAULT'
                      }
                      alignment="TOP_RIGHT"
                      helper={{
                        label:
                          locals[this.props.lang].shortcuts.tooltips.userMenu,
                        pin: 'TOP',
                      }}
                    />
                  )}
                </Feature>
                <Menu
                  id="shortcuts-menu"
                  icon="ellipses"
                  options={[
                    {
                      label: locals[this.props.lang].shortcuts.news,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_HIGHLIGHT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_HIGHLIGHT.isBlocked(),
                      isNew:
                        this.props.highlight.status ===
                        'DISPLAY_HIGHLIGHT_NOTIFICATION'
                          ? true
                          : false,
                      action: () => this.props.onReOpenHighlight(),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.onboarding,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ONBOARDING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ONBOARDING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ONBOARDING.isNew(),
                      action: () => this.props.onReOpenOnboarding(),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.repository,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPOSITORY.isNew(),
                      action: () =>
                        window.open(repositoryUrl, '_blank')?.focus(),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: locals[this.props.lang].shortcuts.request,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REQUESTS.isNew(),
                      action: () => window.open(requestsUrl, '_blank')?.focus(),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.feedback,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_FEEDBACK.isNew(),
                      action: () => {
                        window.open(feedbackUrl, '_blank')?.focus()
                      },
                    },
                    {
                      label: locals[this.props.lang].report.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_REPORTING.isNew(),
                      action: this.props.onReOpenReport,
                    },
                    {
                      label: locals[this.props.lang].shortcuts.email,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_EMAIL.isNew(),
                      action: () =>
                        window.open(supportEmail, '_blank')?.focus(),
                    },
                    {
                      type: 'SEPARATOR',
                    },
                    {
                      label: locals[this.props.lang].shortcuts.store,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_STORE.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_STORE.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_STORE.isNew(),
                      action: this.props.onReOpenStore,
                    },
                    {
                      label: locals[this.props.lang].about.title,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_ABOUT.isNew(),
                      action: this.props.onReOpenAbout,
                    },
                    {
                      label: locals[this.props.lang].shortcuts.follow,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_NETWORKING.isNew(),
                      action: () => window.open(networkUrl, '_blank')?.focus(),
                    },
                    {
                      label: locals[this.props.lang].shortcuts.author,
                      type: 'OPTION',
                      isActive: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isActive(),
                      isBlocked: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isBlocked(),
                      isNew: Shortcuts.features(
                        this.props.planStatus
                      ).SHORTCUTS_AUTHOR.isNew(),
                      action: () => window.open(authorUrl, '_blank')?.focus(),
                    },
                  ]}
                  alignment="TOP_RIGHT"
                  helper={{
                    label: locals[this.props.lang].shortcuts.tooltips.helpMenu,
                    pin: 'TOP',
                  }}
                  isNew={
                    this.props.highlight.status ===
                    'DISPLAY_HIGHLIGHT_NOTIFICATION'
                      ? true
                      : false
                  }
                />
              </div>
            </>
          }
          leftPartSlot={
            <Feature
              isActive={Shortcuts.features(
                this.props.planStatus
              ).GET_PRO_PLAN.isActive()}
            >
              {fragment}
            </Feature>
          }
          border={['TOP']}
        />
      </>
    )
  }
}
