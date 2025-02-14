import LightConfig from "./LightConfig"

export type LightId = {
  groupIdx: number
  inGroupIdx: number
}

export default class LightGroups {
  indexing: LightId[]

  constructor(private lightGroups: LightConfig[][]) {
    const indexing: LightId[] = []
    let lightIdx = 0
    for (let lightGroupIdx = 0; lightGroupIdx < lightGroups.length; lightGroupIdx++) {
      let inGroupIdx = 0
      for (let light of lightGroups[lightGroupIdx]) {
        indexing[lightIdx] = {
          groupIdx: lightGroupIdx,
          inGroupIdx: inGroupIdx,
        }
        lightIdx += 1
        inGroupIdx += 1
      }
    }
    this.indexing = indexing
  }

  lookup(lightIdx: number): LightConfig {
    const lightId = this.indexing[lightIdx]
    return this.lightGroups[lightId.groupIdx][lightId.inGroupIdx]
  }

  idLookup(groupIdx: number, inGroupIdx: number) {
    return (
      this.lightGroups
        .filter((group, idx) => idx < groupIdx)
        .reduce((acc, group) => acc + group.length, 0) + inGroupIdx
    )
  }

  withLightReplaced(lightIdx: number, lightConfig: LightConfig) {
    const lightId = this.indexing[lightIdx]
    const copy = this.copied()
    copy[lightId.groupIdx][lightId.inGroupIdx] = lightConfig
    return new LightGroups(copy)
  }

  withLightAdded(lightConfig: LightConfig): LightGroups {
    return new LightGroups([...this.lightGroups.map((x) => [...x]), [lightConfig]])
  }

  ungrouped(groupIdx: number, splitIdx: number) {
    const groupLeft = this.lightGroups[groupIdx].filter((x, idx) => idx <= splitIdx)
    const groupRight = this.lightGroups[groupIdx].filter((x, idx) => idx > splitIdx)
    const newGrouping = this.lightGroups.flatMap((group, idx) =>
      idx == groupIdx ? [groupLeft, groupRight] : [group],
    )
    return new LightGroups(newGrouping)
  }

  groupedDown(groupIdx: number) {
    const initAcc: LightConfig[][] = []
    const newGrouping = this.lightGroups.reduce(
      (acc, group, idx) =>
        idx != groupIdx + 1
          ? [...acc, group]
          : [...acc.slice(0, -1), [...acc[acc.length - 1], ...group]],
      initAcc,
    )
    return new LightGroups(newGrouping)
  }

  withLightDeleted(lightIdx: number) {
    const copy = this.copied()

    const groupIdx: number = this.indexing[lightIdx].groupIdx
    const inGroupIdx: number = this.indexing[lightIdx].inGroupIdx

    const group = copy[groupIdx]
    group.splice(inGroupIdx, 1)

    return new LightGroups(copy.filter((g) => g.length > 0))
  }

  private copied() {
    return [...this.lightGroups.map((x) => [...x])]
  }

  size(): number {
    return this.indexing.length
  }

  raw(): LightConfig[][] {
    return this.lightGroups
  }
}
