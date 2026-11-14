import type { PlanMap, RecommendationOption, TransportMode } from '../types'

export type OptionVariant = 'recommended' | 'excluded' | 'keep'

/** 카드 모양 결정: 현행 유지 > 추천 > 제외 */
export function optionVariant(o: RecommendationOption): OptionVariant {
  if (o.mode === 'KEEP') return 'keep'
  return o.status === 'RECOMMENDED' ? 'recommended' : 'excluded'
}

export function optionChipLabel(o: RecommendationOption) {
  const variant = optionVariant(o)
  if (variant === 'keep') return '현행 유지 권장'
  if (variant === 'recommended') return o.rank ? `추천 ${o.rank}` : '추천'
  return '이번엔 제외'
}

/*
 together(함께 추천된 대안)는 형태가 정해지지 않아서 들어올 수 있는 모양을 모두 받아 줌
 - "문장" / ["문장", ...] / { name, desc } / [{ name, desc }, ...]
 알 수 없는 모양이나 null이면 빈 배열 (화면에서 그 칸을 숨김)
*/
export function togetherLines(together: unknown): string[] {
  const toLine = (v: unknown): string | null => {
    if (typeof v === 'string') return v.trim() || null
    if (v && typeof v === 'object' && 'name' in v && typeof v.name === 'string') {
      const desc = 'desc' in v && typeof v.desc === 'string' ? v.desc : ''
      return desc ? `${v.name}: ${desc}` : v.name
    }
    return null
  }
  const list = Array.isArray(together) ? together : [together]
  return list.map(toLine).filter((line): line is string => line !== null)
}

/** "2026-11-05 11:03" → "2026.11.05 11:03" */
export function formatCreatedAt(createdAt: string) {
  return createdAt.replaceAll('-', '.')
}

/** 수단별로 이 지역이 포함된 안 번호 모음. 예) { DRT: [1, 3] } */
export type PlansByMode = Partial<Record<TransportMode, number[]>>

export function plansByMode(data: PlanMap, regionCode: string): PlansByMode {
  const result: PlansByMode = {}
  for (const { plan, regions } of data.plans) {
    const region = regions.find((r) => r.regionCode === regionCode)
    if (region?.status !== 'INCLUDED') continue
    const { category } = region
    if (category !== 'BUS' && category !== 'DRT' && category !== 'HAPPY_TAXI') continue
    result[category] = [...(result[category] ?? []), plan].sort((a, b) => a - b)
  }
  return result
}

/** [1, 3] → "통합안 1·3안". 없으면 null */
export function planChipLabel(plans: number[] | undefined) {
  return plans?.length ? `통합안 ${plans.join('·')}안` : null
}
