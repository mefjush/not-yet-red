import Failure from "../../app/domain/Failure"

describe("Failure", () => {
  it("returns next failure timestamp when it's soon enough", () => {
    const failure = new Failure(10_000, 0.1)

    const nextStateTimestamp = failure.nextStateTimestamp(1710022994000)

    expect(nextStateTimestamp).toEqual(1710023010000)
  }, 10_000)

  it("deterministic rand looks random", () => {
    const failure = new Failure(10_000, 0.1)

    const randoms = [0, 1, 2, 3, 4].map((x) => failure.deterministicRand(x))

    expect(new Set(randoms).size).toEqual(5)
    expect(Math.abs(randoms[0] - randoms[1])).toBeGreaterThan(10)
    expect(Math.abs(randoms[1] - randoms[2])).toBeGreaterThan(10)
  }, 10_000)
})
