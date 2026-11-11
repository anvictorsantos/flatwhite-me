import type { CSSProperties, ReactNode } from 'react'

export type IconName =
  | 'search'
  | 'list'
  | 'map'
  | 'sliders'
  | 'locate'
  | 'heart'
  | 'info'
  | 'back'
  | 'close'
  | 'check'
  | 'star'
  | 'coffee'
  | 'user'

const masks: Partial<Record<IconName, string>> = {
  search: '/icons/icon_search.png',
  map: '/icons/icon_map.png',
  sliders: '/icons/icon_filters.png',
  locate: '/icons/icon_navigation.png',
  heart: '/icons/icon_heart.png',
  coffee: '/icons/icon_coffee.png',
}

const paths: Partial<Record<IconName, ReactNode>> = {
  list: (
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle
        cx="3.5"
        cy="6"
        r=".5"
      />
      <circle
        cx="3.5"
        cy="12"
        r=".5"
      />
      <circle
        cx="3.5"
        cy="18"
        r=".5"
      />
    </>
  ),
  info: (
    <>
      <circle
        cx="12"
        cy="12"
        r="9"
      />
      <path d="M12 11v6" />
      <circle
        cx="12"
        cy="7.5"
        r=".5"
      />
    </>
  ),
  back: <path d="m15 18-6-6 6-6" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m4 12 5 5L20 6" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.6l6.2-.9Z" />,
  user: (
    <>
      <circle
        cx="12"
        cy="8"
        r="4"
      />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
}

type IconProps = {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  const mask = masks[name]

  if (mask) {
    const style: CSSProperties = {
      display: 'inline-block',
      flexShrink: 0,
      width: size,
      height: size,
      backgroundColor: 'currentColor',
      maskImage: `url(${mask})`,
      maskSize: 'contain',
      maskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskImage: `url(${mask})`,
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskPosition: 'center',
    }
    return (
      <span
        aria-hidden="true"
        className={className}
        style={style}
      />
    )
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
