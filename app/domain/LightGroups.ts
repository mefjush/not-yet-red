import LightConfig from "./LightConfig"

export type LightId = {
  groupIdx: number
  inGroupIdx: number
}

export default class LightGroups<T = LightConfig> {
  indexing: LightId[]

  constructor(private lightGroups: T[][]) {
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

  lookup(lightIdx: number): T {
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

  withLightReplaced(lightIdx: number, lightConfig: T) {
    const lightId = this.indexing[lightIdx]
    const copy = this.copied()
    copy[lightId.groupIdx][lightId.inGroupIdx] = lightConfig
    return new LightGroups(copy)
  }

  // groupIdx omitted (or == number of groups) adds the light to a new group at the end
  withLightAdded(lightConfig: T, groupIdx = this.lightGroups.length): LightGroups<T> {
    const copy = this.copied()
    if (groupIdx == copy.length) {
      copy.push([lightConfig])
    } else {
      copy[groupIdx].push(lightConfig)
    }
    return new LightGroups(copy)
  }

  // toGroupIdx == number of groups moves the light to a new group at the end
  withLightMoved(lightIdx: number, toGroupIdx: number): LightGroups<T> {
    const { groupIdx, inGroupIdx } = this.indexing[lightIdx]
    const copy = this.copied()
    const [light] = copy[groupIdx].splice(inGroupIdx, 1)
    if (toGroupIdx == copy.length) {
      copy.push([light])
    } else {
      copy[toGroupIdx].push(light)
    }
    return new LightGroups(copy.filter((g) => g.length > 0))
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

  raw(): T[][] {
    return this.lightGroups
  }
}
