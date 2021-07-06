import { SelectOption } from '../components/Select/Select'

export const KnownProducts = [
  'PI_XBTUSD',
  'PI_ETHUSD'
] as const

export type KnownProduct = typeof KnownProducts[number]

const toOptions = (groups: number[]): SelectOption[] => groups
  .map((group) => ({ label: `Group ${group.toFixed(2)}`, value: group.toFixed(2) }))

type KnownProductGroupingDict = {
  [K in KnownProduct]: SelectOption[]
}
export const KnownProductGrouping: KnownProductGroupingDict = {
  'PI_XBTUSD': toOptions([0.5, 1.0, 2.5]),
  'PI_ETHUSD': toOptions([0.05, 0.1, 0.25]),
}
