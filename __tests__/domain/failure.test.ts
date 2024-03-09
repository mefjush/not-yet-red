import Failure from '../../app/domain/failure'

describe('Failure', () => {

  it('returns next failure timestamp when it\'s soon enough', () => {
    let failure = new Failure(10_000, 0.1);

    let nextStateTimestamp = failure.nextStateTimestamp(1710022994000)

    expect(nextStateTimestamp).toEqual(1710023010000)
  }, 10_000)
})