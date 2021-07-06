import { KnownProduct, KnownProductGrouping } from './KnownProduct'

export type Level = [price: number, size: number, total: number]
export type Levels = Level[]

export const ltOrder = ([a,]: Levels[0], [b,]: Levels[0]) => a > b ? -1 : a < b ? 1 : 0
export const gtOrder = ([a,]: Levels[0], [b,]: Levels[0]) => a > b ? 1 : a < b ? -1 : 0

export const take = <T>(array: T[], count: number) => array.slice(0, count)

export const calcLevelsWithTotals = (levels: Levels) => {
  let total = 0
  // for-loop to avoid gc instead of reduce
  for (let i = 0; i < levels.length; ++i) {
    const level = levels[i]
    total += level[1]
    if (level[2] == null) {
      level.push(0)
    }
    level[2] = total
  }
  return levels
}

export const mergeLevels = (levels: Levels, deltas: Levels = []) => {
  // Again, for-loop to avoid gc
  for (let level of levels) {
    for (let delta of deltas) {
      if (level[0] === delta[0]) {
        if (delta[1] === 0) {
          level[1] = 0 // mark for deletion
        } else {
          level[1] = delta[1]
          delta[1] = 0 // mark as processed so it is skipped when adding new levels
        }
        continue
      }
    }
  }
  // Add new levels
  for (let delta of deltas) {
    if (delta[1] !== 0) {
      levels.push(delta)
    }
  }
  // Even with mutations for performance reasons from the loop above,
  // thanks to this filter, new filtered array will be recreated, thus
  // React will know to re-render levels correctly
  return levels.filter(([,size]) => size !== 0)
}

export const groupBy = (levels: Levels, productId: KnownProduct, groupIndex: number) => {
  const group = KnownProductGrouping[productId][groupIndex].value
  const delta = Number.parseFloat(group)

  let lastLevelPrice = Math.floor(levels[0][0] / delta) * delta
  let lastLevelIndex = 0
  const aggLevels: Levels = [[...levels[0]]]
  aggLevels[0][0] = lastLevelPrice

  // Again, for-loop instead of reduce to minimize gc's work later on
  // and shave a few cycles off
  for (let i = 1; i < levels.length; ++i) {
    const level = levels[i]
    const inLastLevelWindow = level[0] >= lastLevelPrice && level[0] < lastLevelPrice + delta
    if (inLastLevelWindow) {
      aggLevels[lastLevelIndex][1] += level[1]
    } else {
      aggLevels.push([...level])
      lastLevelIndex++
      aggLevels[lastLevelIndex][0] = Math.floor(aggLevels[lastLevelIndex][0] / delta) * delta
      lastLevelPrice = aggLevels[lastLevelIndex][0]
    }
  }

  return aggLevels
}
