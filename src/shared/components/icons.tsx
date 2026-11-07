import type { SVGProps } from 'react'
type IconProps = SVGProps<SVGSVGElement>

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} {...props}>
      <path
        d="M1.5 6.5 7 2l5.5 4.5V12a.5.5 0 0 1-.5.5H8.75V9h-3.5v3.5H2a.5.5 0 0 1-.5-.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 22 22" width={22} height={22} strokeWidth={2} {...base} {...props}>
      <path d="m13 6-5 5 5 5" />
    </svg>
  )
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} strokeWidth={1.6} {...base} {...props}>
      <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
    </svg>
  )
}
