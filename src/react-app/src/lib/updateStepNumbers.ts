import { Request} from 'types'

export const updateStepNumbers = (requests: Pick<Request, 'stepNumber' | 'id'>[]) => {
  return [...requests].sort((a, b) => {
    return a.stepNumber < b.stepNumber ? -1 : 1
  }).map((r, idx) => ({...r, stepNumber: idx+1}))

}