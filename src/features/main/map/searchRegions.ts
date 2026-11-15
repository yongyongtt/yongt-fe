import type { DashboardRegion } from '../types'

const normalize = (value: string) => value.replace(/\s+/g, '').toLocaleLowerCase('ko-KR')

export function searchRegions(regions: DashboardRegion[], query: string) {
  const term = normalize(query)
  if (!term) return []
  return regions.filter((region) => normalize(`${region.gu}${region.regionName}`).includes(term))
}
