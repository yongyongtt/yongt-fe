import type { OptionVariant } from '../../utils/recommendation'

/** 대안 카드·상세 패널 색 (추천=파랑, 현행 유지=초록, 제외=회색) */
export const VARIANT_STYLE: Record<
  OptionVariant,
  {
    box: string
    chip: string
    name: string
    sub: string
    desc: string
    accent: string
    tag: string
    /** 모바일 상세 패널은 세로로 길어 그라데이션 끝(흰색)에 흰 상자가 묻혀서 단색 배경 */
    panelMobile: string
  }
> = {
  recommended: {
    box: 'border-2 border-primary-50 bg-linear-to-b from-primary-5 to-white to-70%',
    chip: 'bg-primary-50 text-white',
    name: 'text-gray-90',
    sub: 'text-primary-60',
    desc: 'text-gray-70',
    accent: 'text-primary-60',
    tag: 'border-primary-50 text-primary-50',
    panelMobile: 'max-lg:bg-none max-lg:bg-primary-5',
  },
  keep: {
    box: 'border-2 border-success-50 bg-linear-to-b from-success-5 to-white to-70%',
    chip: 'bg-success-50 text-white',
    name: 'text-gray-90',
    sub: 'text-success-50',
    desc: 'text-gray-70',
    accent: 'text-success-50',
    tag: 'border-success-50 text-success-50',
    panelMobile: 'max-lg:bg-none max-lg:bg-success-5',
  },
  excluded: {
    box: 'border border-gray-10 bg-gray-5',
    chip: 'bg-gray-10 text-gray-70',
    name: 'text-gray-50',
    sub: 'text-gray-50',
    desc: 'text-gray-50',
    accent: 'text-gray-60',
    tag: 'border-gray-30 text-gray-60',
    panelMobile: '',
  },
}
