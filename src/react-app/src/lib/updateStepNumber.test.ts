import {updateStepNumbers} from 'lib/updateStepNumbers'
import {Request} from 'types'

it('should handle when middle item is has been removed', function () {
  const requests: Pick<Request, 'stepNumber'>[] = [
    {stepNumber: 1},
    {stepNumber: 3},
  ]
  const result = updateStepNumbers(requests)
  expect(result[1].stepNumber).toBe(2)
})

it('should handle when middle item is has been removed with more requests', function () {
  const requests: Pick<Request, 'stepNumber'>[] = [
    {stepNumber: 1},
    {stepNumber: 2},
    {stepNumber: 3},
    {stepNumber: 5},
  ]
  const result = updateStepNumbers(requests)
  expect(result.map(r => r.stepNumber)).toEqual([1, 2, 3, 4])
})

it('should handle when first step has been removed', function () {
  const requests: Pick<Request, 'stepNumber'>[] = [
    {stepNumber: 2},
    {stepNumber: 3},
    {stepNumber: 4},
  ]
  const result = updateStepNumbers(requests)
  expect(result.map(r => r.stepNumber)).toEqual([1, 2, 3])
})
