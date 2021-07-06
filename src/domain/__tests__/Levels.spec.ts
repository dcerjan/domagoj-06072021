import { take } from '../Levels'

describe('Levels', () => {
  describe('take', () => {
    describe('given an array', () => {
      it('should take only the first N elements of it', () => {
        expect(take([1, 2, 3, 4, 5], 2)).toEqual([1, 2])
      })
    })
  })
  // same goes for the rest of domain specific Level-util functions
})