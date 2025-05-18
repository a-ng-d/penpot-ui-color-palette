import { Knob } from '@a_ng_d/figmug-ui'
import { doClassnames, doMap, FeatureStatus } from '@a_ng_d/figmug-utils'
import { Component } from 'preact/compat'
import React from 'react'
import features from '../../config'
import { BaseProps, Easing, PlanStatus, Service } from '../../types/app'
import {
  PresetConfiguration,
  ScaleConfiguration,
} from '../../types/configurations'
import doLightnessScale from '../../utils/doLightnessScale'
import addStop from './../handlers/addStop'
import deleteStop from './../handlers/deleteStop'
import shiftLeftStop from './../handlers/shiftLeftStop'
import shiftRightStop from './../handlers/shiftRightStop'

type UpdateEvent = 'TYPED' | 'UPDATING' | 'RELEASED' | 'SHIFTED'

interface SliderProps extends BaseProps {
  service: Service
  stops: Array<number>
  presetName: string
  type: 'EDIT' | 'FULLY_EDIT'
  scale?: ScaleConfiguration
  distributionEasing: Easing
  range: {
    min: number
    max: number
  }
  colors: {
    min: string
    max: string
  }
  isBlocked?: boolean
  isNew?: boolean
  onChange: (
    state: UpdateEvent,
    results: {
      scale: ScaleConfiguration
      preset?: PresetConfiguration
    },
    feature?: string
  ) => void
}

interface SliderStates {
  isTooltipDisplay: Array<boolean>
}

export default class Slider extends Component<SliderProps, SliderStates> {
  private safeGap: number

  static defaultProps = {
    colors: {
      min: 'var(--color-background-quaternary)',
      max: 'var(--color-background-quaternary)',
    },
    isBlocked: false,
    isNew: false,
  }

  static features = (planStatus: PlanStatus) => ({
    PRESETS_CUSTOM_ADD: new FeatureStatus({
      features: features,
      featureName: 'PRESETS_CUSTOM_ADD',
      planStatus: planStatus,
    }),
  })

  constructor(props: SliderProps) {
    super(props)
    this.state = {
      isTooltipDisplay: Array(this.props.stops?.length).fill(false),
    }
    this.safeGap = 0.2
  }

  // Handlers
  validHandler = (
    stopId: string,
    e:
      | React.FocusEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    const scale: ScaleConfiguration = this.props.scale ?? {}
    const target = e.target as HTMLInputElement

    if (target.value !== '') {
      if (parseFloat(target.value) > parseFloat(target.max))
        scale[stopId] = parseFloat(target.max)
      else if (parseFloat(target.value) < parseFloat(target.min))
        scale[stopId] = parseFloat(target.min)
      else scale[stopId] = parseFloat(target.value)

      this.props.onChange('TYPED', {
        scale: scale,
      })
    }
  }

  // Direct Actions
  onGrab = (e: React.MouseEvent<HTMLElement>) => {
    const stop = e.currentTarget as HTMLElement,
      range = stop.parentElement as HTMLElement,
      shift =
        e.clientX -
        (e.currentTarget as HTMLElement).getBoundingClientRect().left -
        (e.currentTarget as HTMLElement).getBoundingClientRect().width / 2,
      rangeWidth = range.offsetWidth as number,
      slider = range.parentElement as HTMLElement,
      stops = Array.from(range.children as HTMLCollectionOf<HTMLElement>)

    const update = (event: UpdateEvent) => {
      const scale: ScaleConfiguration = {}
      stops.forEach(
        (stop) =>
          (scale[stop.dataset.id as string] = parseFloat(
            doMap(
              parseFloat(stop.style.left.replace('%', '')),
              0,
              100,
              this.props.range.min,
              this.props.range.max
            ).toFixed(1)
          ))
      )
      this.props.onChange(event, {
        scale: scale,
      })
    }

    stop.style.zIndex = '2'

    document.onmousemove = (e) =>
      this.onSlide(
        e,
        slider,
        range,
        stops,
        stop,
        shift,
        rangeWidth,
        (event: UpdateEvent) => update(event)
      )

    document.onmouseup = () =>
      this.onRelease(stops, stop, (event: UpdateEvent) => update(event))
  }

  onSlide = (
    e: MouseEvent,
    slider: HTMLElement,
    range: HTMLElement,
    stops: Array<HTMLElement>,
    stop: HTMLElement,
    shift: number,
    rangeWidth: number,
    update: (e: UpdateEvent) => void
  ) => {
    const sliderPadding: number = parseFloat(
      window.getComputedStyle(slider, null).getPropertyValue('padding-left')
    )
    let offset = e.clientX - slider.offsetLeft - sliderPadding - shift

    if (stop === range.firstChild && offset <= 0) offset = 0
    else if (stop === range.lastChild && offset >= rangeWidth)
      offset = rangeWidth

    // Distribute stops horizontal spacing
    if (stop === range.firstChild && e.shiftKey)
      return this.distributeStops(
        'MIN',
        parseFloat(
          doMap(
            offset,
            0,
            rangeWidth,
            this.props.range.min,
            this.props.range.max
          ).toFixed(1)
        ),
        stops
      )
    else if (stop === range.lastChild && e.shiftKey)
      return this.distributeStops(
        'MAX',
        parseFloat(
          doMap(
            offset,
            0,
            rangeWidth,
            this.props.range.min,
            this.props.range.max
          ).toFixed(1)
        ),
        stops
      )

    // Link every stop
    if (e.ctrlKey || e.metaKey)
      if (
        offset <
          stop.offsetLeft - (range.firstChild as HTMLElement).offsetLeft ||
        offset >
          rangeWidth -
            (range.lastChild as HTMLElement).offsetLeft +
            stop.offsetLeft
      )
        offset = stop.offsetLeft
      else
        return this.linkStops(
          parseFloat(
            doMap(
              offset,
              0,
              rangeWidth,
              this.props.range.min,
              this.props.range.max
            ).toFixed(1)
          ),
          stop,
          stops
        )

    if (e.ctrlKey === false && e.metaKey === false && e.shiftKey === false)
      this.setState({
        isTooltipDisplay: Array(stops.length).fill(false),
      })

    const newPosition = doMap(offset, 0, rangeWidth, 0, 100)
    stop.style.left = newPosition.toFixed(1) + '%'

    requestAnimationFrame(() => {
      stop.focus()
    })

    // Update lightness scale
    update('UPDATING')
    document.body.style.cursor = 'ew-resize'
  }

  onRelease = (
    stops: Array<HTMLElement>,
    stop: HTMLElement,
    update: (e: UpdateEvent) => void
  ) => {
    document.onmousemove = null
    document.onmouseup = null
    stop.onmouseup = null
    stop.style.zIndex = '1'

    requestAnimationFrame(() => {
      stop.focus()
    })

    this.setState({
      isTooltipDisplay: Array(stops.length).fill(false),
    })

    update('RELEASED')
    document.body.style.cursor = ''
  }

  onAdd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      (e.target as HTMLElement).classList[0] === 'slider__range' &&
      this.props.stops.length < 24 &&
      this.props.presetName === 'Custom' &&
      this.props.service === 'EDIT' &&
      !Slider.features(this.props.planStatus).PRESETS_CUSTOM_ADD.isReached(
        this.props.stops.length
      )
    ) {
      const results = addStop(
        e,
        this.props.scale ?? {},
        this.props.presetName,
        Math.min(...Object.values(this.props.scale ?? {})) ?? 0,
        Math.max(...Object.values(this.props.scale ?? {})) ?? 0
      )
      this.props.onChange('SHIFTED', results, 'ADD_STOP')
    }
  }

  onDelete = (knob: HTMLElement) => {
    const results = deleteStop(
      this.props.scale ?? {},
      knob,
      this.props.presetName,
      Math.min(...Object.values(this.props.scale ?? {})) ?? 0,
      Math.max(...Object.values(this.props.scale ?? {})) ?? 0
    )
    this.props.onChange('SHIFTED', results, 'DELETE_STOP')
  }

  onShiftRight = (knob: HTMLElement, isMeta: boolean, isCtrl: boolean) => {
    const results = shiftRightStop(
      this.props.scale ?? {},
      knob,
      isMeta,
      isCtrl,
      this.props.range.min,
      this.props.range.max
    )

    const knobId = knob.dataset.id

    this.props.onChange('SHIFTED', results)

    requestAnimationFrame(() => {
      const updatedKnob = document.querySelector(`[data-id="${knobId}"]`)
      if (updatedKnob instanceof HTMLElement) updatedKnob.focus()
    })
  }

  onShiftLeft = (knob: HTMLElement, isMeta: boolean, isCtrl: boolean) => {
    const results = shiftLeftStop(
      this.props.scale ?? {},
      knob,
      isMeta,
      isCtrl,
      this.props.range.min,
      this.props.range.max
    )

    const knobId = knob.dataset.id

    this.props.onChange('SHIFTED', results)

    requestAnimationFrame(() => {
      const updatedKnob = document.querySelector(`[data-id="${knobId}"]`)
      if (updatedKnob instanceof HTMLElement) updatedKnob.focus()
    })
  }

  distributeStops = (
    type: string,
    value: number,
    stops: Array<HTMLElement>
  ) => {
    if (type === 'MIN')
      this.props.onChange('UPDATING', {
        scale: doLightnessScale(
          Object.entries(this.props.scale ?? {})
            .sort((a, b) => b[1] - a[1])
            .map((entry) => parseFloat(entry[0])),
          value,
          Math.max(...Object.values(this.props.scale ?? {})) ?? 0,
          this.props.distributionEasing
        ),
      })
    else if (type === 'MAX')
      this.props.onChange('UPDATING', {
        scale: doLightnessScale(
          Object.entries(this.props.scale ?? {})
            .sort((a, b) => b[1] - a[1])
            .map((entry) => parseFloat(entry[0])),
          Math.min(...Object.values(this.props.scale ?? {})) ?? 0,
          value,
          this.props.distributionEasing
        ),
      })

    this.setState({
      isTooltipDisplay: Array(stops.length).fill(true),
    })

    document.body.style.cursor = 'ew-resize'
  }

  linkStops = (value: number, src: HTMLElement, stops: Array<HTMLElement>) => {
    const scale: ScaleConfiguration = this.props.scale ?? {}

    stops
      .filter((stop) => stop !== src)
      .forEach((stop) => {
        const delta =
          scale[stop.dataset.id as string] -
          scale[src.dataset.id as string] +
          value

        scale[stop.dataset.id as string] = delta
      })

    scale[src.dataset.id as string] = value

    this.setState({
      isTooltipDisplay: this.state.isTooltipDisplay.fill(true),
    })

    this.props.onChange('UPDATING', {
      scale: scale,
    })
    document.body.style.cursor = 'ew-resize'
  }

  // Templates
  Edit = () => {
    return (
      <div
        className="slider__range"
        style={{
          background: `linear-gradient(90deg, ${this.props.colors.min}, ${this.props.colors.max})`,
        }}
      >
        {Object.entries(this.props.scale ?? {})
          .sort((a, b) => a[1] - b[1])
          .map((lightness, index, original) => (
            <Knob
              key={lightness[0]}
              id={lightness[0]}
              shortId={lightness[0]}
              value={lightness[1]}
              offset={doMap(
                lightness[1],
                this.props.range.min,
                this.props.range.max,
                0,
                100
              )}
              min={this.props.range.min.toString()}
              max={this.props.range.max.toString()}
              helper={
                index === 0 || index === original.length - 1
                  ? {
                      label: this.props.locals.scale.tips.distributeAsTooltip,
                      type: 'MULTI_LINE',
                    }
                  : undefined
              }
              canBeTyped
              isDisplayed={this.state.isTooltipDisplay[index]}
              isBlocked={this.props.isBlocked}
              isNew={this.props.isNew}
              onShiftRight={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftRight(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onShiftLeft={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftLeft(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
                this.onGrab(e)
                ;(e.target as HTMLElement).focus()
              }}
              onValidStopValue={(stopId, e) => this.validHandler(stopId, e)}
            />
          ))}
      </div>
    )
  }

  FullyEdit = () => {
    return (
      <div
        className={doClassnames([
          'slider__range',
          this.props.presetName === 'Custom' &&
            (this.props.stops.length < 24 ||
              !Slider.features(
                this.props.planStatus
              ).PRESETS_CUSTOM_ADD.isReached(this.props.stops.length)) &&
            this.props.service === 'EDIT' &&
            'slider__range--add',
          this.props.presetName === 'Custom' &&
            (this.props.stops.length === 24 ||
              Slider.features(
                this.props.planStatus
              ).PRESETS_CUSTOM_ADD.isReached(this.props.stops.length)) &&
            this.props.service === 'EDIT' &&
            'slider__range--not-allowed',
        ])}
        style={{
          background: `linear-gradient(90deg, ${this.props.colors.min}, ${this.props.colors.max})`,
        }}
        onMouseDown={(e) => this.onAdd(e)}
      >
        {Object.entries(this.props.scale ?? {})
          .sort((a, b) => a[1] - b[1])
          .map((lightness, index, original) => (
            <Knob
              key={lightness[0]}
              id={lightness[0]}
              shortId={lightness[0]}
              value={lightness[1]}
              offset={doMap(
                lightness[1],
                this.props.range.min,
                this.props.range.max,
                0,
                100
              )}
              min={this.props.range.min.toString()}
              max={this.props.range.max.toString()}
              helper={
                index === 0 || index === original.length - 1
                  ? {
                      label: this.props.locals.scale.tips.distributeAsTooltip,
                      type: 'MULTI_LINE',
                    }
                  : undefined
              }
              canBeTyped
              isDisplayed={this.state.isTooltipDisplay[index]}
              isBlocked={this.props.isBlocked}
              isNew={this.props.isNew}
              onShiftRight={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftRight(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onShiftLeft={(e: React.KeyboardEvent<HTMLInputElement>) => {
                this.onShiftLeft(e.target as HTMLElement, e.metaKey, e.ctrlKey)
              }}
              onDelete={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (
                  this.props.stops.length > 2 &&
                  this.props.presetName === 'Custom' &&
                  this.props.service === 'EDIT'
                )
                  this.onDelete(e.target as HTMLElement)
              }}
              onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
                this.onGrab(e)
                ;(e.target as HTMLElement).focus()
              }}
              onValidStopValue={(stopId, e) => this.validHandler(stopId, e)}
            />
          ))}
      </div>
    )
  }

  // Render
  render() {
    return (
      <div className="slider">
        {this.props.type === 'EDIT' && <this.Edit />}
        {this.props.type === 'FULLY_EDIT' && <this.FullyEdit />}
      </div>
    )
  }
}
