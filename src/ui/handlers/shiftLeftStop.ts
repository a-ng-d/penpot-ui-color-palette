import { ScaleConfiguration } from '../../types/configurations'

const shiftLeftStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  meta: boolean,
  ctrl: boolean,
  minRange: number,
  maxRange: number
) => {
  const stopsList: Array<string> = []
  const shiftValue = meta || ctrl ? 0.1 : 1

  Object.entries(scale)
    .sort((a, b) => a[1] - b[1])
    .forEach((stop) => {
      stopsList.push(stop[0])
    })

  const selectedKnobIndex = stopsList.indexOf(
      selectedKnob.dataset.id as string
    ),
    newLightnessScale = scale,
    currentStopValue: number = newLightnessScale[stopsList[selectedKnobIndex]]

  if (currentStopValue - shiftValue <= minRange)
    newLightnessScale[stopsList[selectedKnobIndex]] = minRange
  else if (currentStopValue - shiftValue >= maxRange)
    newLightnessScale[stopsList[selectedKnobIndex]] = maxRange
  else
    newLightnessScale[stopsList[selectedKnobIndex]] =
      newLightnessScale[stopsList[selectedKnobIndex]] - shiftValue

  return {
    scale: newLightnessScale as ScaleConfiguration,
  }
}

export default shiftLeftStop
