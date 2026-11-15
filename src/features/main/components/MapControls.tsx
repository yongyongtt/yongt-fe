import plusIcon from '@/assets/main/zoom-in.svg'
import minusIcon from '@/assets/main/zoom-out.svg'
import panIcon from '@/assets/main/pan.svg'
import { cx } from '@/shared/utils/cx'
import { MAX_ZOOM, MIN_ZOOM, type MapViewport } from '../map/viewport'

type MapControlsProps = {
  viewport: MapViewport
  panMode: boolean
  onZoom: (factor: number) => void
  onTogglePan: () => void
}

const buttonClassName =
  'flex size-10 items-center justify-center border-b border-gray-10 bg-white outline-none last:border-0 hover:bg-gray-5 focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:opacity-40'

export function MapControls({ viewport, panMode, onZoom, onTogglePan }: MapControlsProps) {
  return (
    <div
      role="group"
      aria-label="지도 도구"
      className="absolute top-4 right-4 z-10 overflow-hidden rounded-lg border border-gray-20"
    >
      <button
        type="button"
        aria-label="지도 확대"
        title="지도 확대"
        className={buttonClassName}
        disabled={viewport.scale >= MAX_ZOOM}
        onClick={() => onZoom(1.25)}
      >
        <img src={plusIcon} alt="" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="지도 축소"
        title="지도 축소 · 최소 배율에서 전체 보기"
        className={buttonClassName}
        disabled={viewport.scale <= MIN_ZOOM && viewport.tx === 0 && viewport.ty === 0}
        onClick={() => onZoom(0.8)}
      >
        <img src={minusIcon} alt="" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="지도 이동 도구"
        title="손 도구 · 드래그 또는 방향키로 이동"
        aria-pressed={panMode}
        className={cx(buttonClassName, panMode && 'bg-primary-5 ring-2 ring-primary-50 ring-inset')}
        onClick={onTogglePan}
      >
        <img src={panIcon} alt="" aria-hidden />
      </button>
    </div>
  )
}
