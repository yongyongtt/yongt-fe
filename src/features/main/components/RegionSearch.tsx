import { useId, useState } from 'react'
import searchIcon from '@/assets/main/search.svg'
import resultIcon from '@/assets/main/search-result.svg'
import { cx } from '@/shared/utils/cx'
import { searchRegions } from '../map/searchRegions'
import type { DashboardRegion } from '../types'

type RegionSearchProps = {
  regions: DashboardRegion[]
  disabled: boolean
  onSelectRegion: (regionCode: string) => void
}

export function RegionSearch({ regions, disabled, onSelectRegion }: RegionSearchProps) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const results = searchRegions(regions, query)
  const expanded = open && query.trim().length > 0 && !disabled
  const choose = (region: DashboardRegion) => {
    setQuery(region.regionName)
    setOpen(false)
    setActiveIndex(0)
    onSelectRegion(region.regionCode)
  }

  return (
    <div
      className="relative z-30 w-full max-w-[320px]"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <label htmlFor={id} className="sr-only">
        구·읍·면·동 검색
      </label>
      <div className="flex h-11 items-center gap-2.5 rounded-lg border border-gray-20 bg-white px-3.5 focus-within:border-primary-50 focus-within:ring-2 focus-within:ring-primary-10">
        <img src={searchIcon} alt="" aria-hidden className="shrink-0" />
        <input
          id={id}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? `${id}-results` : undefined}
          aria-activedescendant={
            expanded && results[activeIndex] ? `${id}-option-${activeIndex}` : undefined
          }
          placeholder="읍·면·동 이름으로 검색"
          disabled={disabled}
          value={query}
          className="min-w-0 flex-1 text-[15px] text-gray-90 outline-none placeholder:text-gray-40 disabled:cursor-not-allowed"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return
            if (event.key === 'Escape') {
              setOpen(false)
              event.stopPropagation()
              return
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setOpen(true)
              setActiveIndex((index) =>
                results.length
                  ? (index + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length
                  : 0,
              )
            } else if (event.key === 'Enter' && expanded && results[activeIndex]) {
              event.preventDefault()
              choose(results[activeIndex])
            }
          }}
        />
      </div>
      {expanded && (
        <div className="absolute top-full left-0 mt-1 w-full rounded border border-gray-20 bg-white p-2 shadow-lg shadow-gray-90/10">
          <p className="px-2 pt-1 pb-2 text-xs font-bold text-gray-50">
            {query.trim()} · 읍·면·동 검색 결과
          </p>
          <ul
            id={`${id}-results`}
            role="listbox"
            aria-label="지역 검색 결과"
            className="max-h-56 overflow-y-auto"
          >
            {results.map((region, index) => (
              <li
                key={region.regionCode}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cx(
                  'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-sm border-b border-gray-10 px-2.5 py-2 text-sm last:border-0',
                  index === activeIndex ? 'bg-primary-5 font-bold' : 'hover:bg-gray-5',
                )}
                onPointerEnter={() => setActiveIndex(index)}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => choose(region)}
              >
                <img src={resultIcon} alt="" aria-hidden className="shrink-0" />
                <span>
                  {region.regionName}{' '}
                  <span className="font-normal text-gray-50">· {region.gu}</span>
                </span>
              </li>
            ))}
          </ul>
          {results.length === 0 && (
            <p role="status" className="px-2 py-4 text-sm text-gray-60">
              검색 결과가 없습니다.
            </p>
          )}
          <p className="px-2 pt-2 text-xs leading-5 text-gray-50">
            지역을 선택하면 지도에서 해당 지역을 확대합니다.
          </p>
        </div>
      )}
    </div>
  )
}
