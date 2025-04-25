import { Button, layouts, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import React, { PureComponent } from 'react'
import features, { trialFeedbackUrl } from '../../config'
import { locals } from '../../content/locals'
import { BaseProps, PlanStatus, TrialStatus } from '../../types/app'
import Feature from '../components/Feature'

interface PlanControlsProps extends BaseProps {
  trialStatus: TrialStatus
  trialRemainingTime: number
  onGetProPlan: () => void
}

export default class PlanControls extends PureComponent<PlanControlsProps> {
  static features = (planStatus: PlanStatus) => ({
    ACTIVITIES_RUN: new FeatureStatus({
      features: features,
      featureName: 'ACTIVITIES_RUN',
      planStatus: planStatus,
    }),
    SHORTCUTS_FEEDBACK: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_FEEDBACK',
      planStatus: planStatus,
    }),
  })

  constructor(props: PlanControlsProps) {
    super(props)
    this.state = {
      isUserMenuLoading: false,
    }
  }

  // Templates
  RemainingTime = () => (
    <div
      className={doClassnames([
        texts.type,
        texts['type--secondary'],
        texts['type--truncated'],
      ])}
    >
      {Math.ceil(this.props.trialRemainingTime) > 72 && (
        <span>
          {locals[this.props.lang].plan.trialTimeDays.plural.replace(
            '$1',
            Math.ceil(this.props.trialRemainingTime) > 72
              ? Math.ceil(this.props.trialRemainingTime / 24)
              : Math.ceil(this.props.trialRemainingTime)
          )}
        </span>
      )}
      {Math.ceil(this.props.trialRemainingTime) <= 72 &&
        Math.ceil(this.props.trialRemainingTime) > 1 && (
          <span>
            {locals[this.props.lang].plan.trialTimeHours.plural.replace(
              '$1',
              Math.ceil(this.props.trialRemainingTime)
            )}
          </span>
        )}
      {Math.ceil(this.props.trialRemainingTime) <= 1 && (
        <span>{locals[this.props.lang].plan.trialTimeHours.single}</span>
      )}
    </div>
  )

  FreePlan = () => (
    <>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={locals[this.props.lang].plan.tryPro}
        action={this.props.onGetProPlan}
      />
    </>
  )

  PendingTrial = () => <this.RemainingTime />

  ExpiredTrial = () => (
    <>
      <Button
        type="alternative"
        size="small"
        icon="lock-off"
        label={locals[this.props.lang].plan.getPro}
        action={this.props.onGetProPlan}
      />
      <span className={doClassnames([texts.type, texts['type--secondary']])}>
        {locals[this.props.lang].separator}
      </span>
      <div
        className={doClassnames([
          texts.type,
          texts['type--secondary'],
          texts['type--truncated'],
        ])}
      >
        <span>{locals[this.props.lang].plan.trialEnded}</span>
      </div>
      <Feature
        isActive={PlanControls.features(
          this.props.planStatus
        ).SHORTCUTS_FEEDBACK.isActive()}
      >
        <span className={doClassnames([texts.type, texts['type--secondary']])}>
          {locals[this.props.lang].separator}
        </span>
        <Button
          type="tertiary"
          label={locals[this.props.lang].plan.trialFeedback}
          isBlocked={PlanControls.features(
            this.props.planStatus
          ).SHORTCUTS_FEEDBACK.isBlocked()}
          isNew={PlanControls.features(
            this.props.planStatus
          ).SHORTCUTS_FEEDBACK.isNew()}
          action={() => window.open(trialFeedbackUrl, '_blank')?.focus()}
        />
      </Feature>
    </>
  )

  // Render
  render() {
    return (
      <div className={doClassnames(['pro-zone', layouts['snackbar--tight']])}>
        {this.props.trialStatus === 'UNUSED' &&
          this.props.planStatus === 'UNPAID' && <this.FreePlan />}
        {this.props.trialStatus === 'PENDING' && <this.PendingTrial />}
        {this.props.trialStatus === 'EXPIRED' &&
          this.props.planStatus === 'UNPAID' && <this.ExpiredTrial />}
      </div>
    )
  }
}
