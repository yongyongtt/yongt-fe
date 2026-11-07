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

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} strokeWidth={1.8} {...base} {...props}>
      <path d="m3.5 3.5 9 9m0-9-9 9" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} strokeWidth={1.8} {...base} {...props}>
      <path d="m3.5 8.5 3 3 6-6.5" />
    </svg>
  )
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 36 36" width={36} height={36} strokeWidth={2.4} {...base} {...props}>
      <circle cx="18" cy="18" r="13.5" />
      <path d="M18 11.5v8" />
      <circle cx="18" cy="24.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function InfoCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" width={16} height={16} strokeWidth={1.4} {...base} {...props}>
      <circle cx="8" cy="8" r="6.3" />
      <path d="M8 7.2v3.6" />
      <circle cx="8" cy="5" r="0.4" fill="currentColor" />
    </svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} strokeWidth={1.6} {...base} {...props}>
      <circle cx="9" cy="9" r="7.2" />
      <path d="m6 9.2 2 2 4-4.4" />
    </svg>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} strokeWidth={1.6} {...base} {...props}>
      <path d="M9 2.5 1.8 15h14.4Z" />
      <path d="M9 7.2v3.8" />
      <circle cx="9" cy="13" r="0.4" fill="currentColor" />
    </svg>
  )
}

/** AI 배지의 반짝이 (흰색 채움) */
export function SparkleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 14 14" width={14} height={14} aria-hidden {...props}>
      <path
        d="M7 1.5c.3 2.6 1.9 4.2 4.5 4.5v.1C8.9 6.4 7.3 8 7 10.6h-.1C6.6 8 5 6.4 2.4 6.1V6C5 5.7 6.6 4.1 6.9 1.5Z"
        fill="currentColor"
      />
      <path
        d="M11.2 9.3c.1.9.6 1.4 1.5 1.5-.9.1-1.4.6-1.5 1.5-.1-.9-.6-1.4-1.5-1.5.9-.1 1.4-.6 1.5-1.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
