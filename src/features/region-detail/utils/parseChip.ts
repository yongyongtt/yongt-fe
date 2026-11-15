/*
 백엔드 chips 문장을 카드용으로 나눔
 "버스 정류장 적음 · 8개 (평균 23개)"
   → { label: '버스 정류장', level: '적음', value: '8', unit: '개', compare: '평균 23개' }
 모양이 다르면 나눌 수 있는 데까지만 나누고, ' · '가 없으면 label에 문장 전체를 넣음
*/
export type ParsedChip = {
  label: string
  /** 낮음·많음 같은 평가 (빨간 글씨) */
  level?: string
  value?: string
  unit?: string
  compare?: string
}

const LEVEL_WORDS = ['낮음', '높음', '적음', '많음', '김', '짧음', '좁음', '넓음', '부족', '과밀']

export function parseChip(chip: string): ParsedChip {
  const sep = chip.indexOf(' · ')
  if (sep === -1) return { label: chip.trim() }

  const head = chip.slice(0, sep).trim()
  const tail = chip.slice(sep + 3).trim()

  const words = head.split(' ')
  const last = words.at(-1) ?? ''
  const hasLevel = words.length > 1 && LEVEL_WORDS.includes(last)
  const label = hasLevel ? words.slice(0, -1).join(' ') : head
  const level = hasLevel ? last : undefined

  // "8개 (평균 23개)" → "8개", "평균 23개"
  const paren = tail.match(/^(.*?)\s*\((.+)\)$/)
  const main = (paren ? paren[1] : tail).trim()
  const compare = paren?.[2].trim()

  // "8개" → "8", "개" / 숫자로 시작하지 않으면 통째로 value
  const num = main.match(/^([−+-]?[\d.,]+)\s*(.*)$/)
  if (!num) return { label, level, value: main, compare }
  return { label, level, value: num[1], unit: num[2] || undefined, compare }
}
