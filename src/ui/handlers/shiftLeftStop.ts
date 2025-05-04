import { ScaleConfiguration } from '../../types/configurations'

const shiftLeftStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  meta: boolean,
  ctrl: boolean,
  gap: number
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
    currentStopValue: number = newLightnessScale[stopsList[selectedKnobIndex]],
    nextStopValue: number = newLightnessScale[stopsList[selectedKnobIndex - 1]]

  if (currentStopValue + gap - shiftValue <= nextStopValue) nextStopValue + gap
  else if (currentStopValue - shiftValue <= 0)
    newLightnessScale[stopsList[selectedKnobIndex]] = 0
  else
    newLightnessScale[stopsList[selectedKnobIndex]] =
      newLightnessScale[stopsList[selectedKnobIndex]] - shiftValue

  return {
    scale: newLightnessScale as ScaleConfiguration,
  }
}

export default shiftLeftStop
