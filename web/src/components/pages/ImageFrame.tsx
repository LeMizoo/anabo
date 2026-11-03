import type { CSSProperties, ReactNode } from 'react'
import type { ImagePresentation } from '@/lib/types'

const borders: Record<NonNullable<ImagePresentation['border']>, string> = {
  none: 'none',
  light: '1px solid #e5e7eb',
  dark: '1px solid #1f2937',
  accent: '2px solid #e0a01c',
}

const radii: Record<NonNullable<ImagePresentation['radius']>, string> = {
  none: '0',
  sm: '0.375rem',
  md: '0.75rem',
  lg: '1rem',
  full: '9999px',
}

const shadows: Record<NonNullable<ImagePresentation['shadow']>, string> = {
  none: 'none',
  sm: '0 1px 3px rgb(0 0 0 / 0.12)',
  md: '0 4px 12px rgb(0 0 0 / 0.16)',
  lg: '0 12px 28px rgb(0 0 0 / 0.22)',
}

export function imageFrameStyle(
  presentation?: ImagePresentation,
): CSSProperties {
  const rotation = Number(presentation?.rotation)

  return {
    border: borders[presentation?.border || 'none'],
    borderRadius: radii[presentation?.radius || 'md'],
    boxShadow: shadows[presentation?.shadow || 'sm'],
    transform: Number.isFinite(rotation) && rotation !== 0 ? `rotate(${rotation}deg)` : undefined,
  }
}

export function imageContentStyle(
  presentation?: ImagePresentation,
): CSSProperties {
  return {
    borderRadius: radii[presentation?.radius || 'md'],
    objectFit: presentation?.fit || 'cover',
    objectPosition: presentation?.position || 'center',
  }
}

type Props = {
  children: ReactNode
  className: string
  presentation?: ImagePresentation
  style?: CSSProperties
}

export function ImageFrame({ children, className, presentation, style }: Props) {
  const radius = radii[presentation?.radius || 'md']

  return (
    <div
      className={className}
      style={{ ...imageFrameStyle(presentation), ...style }}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: radius }}>
        {children}
      </div>
    </div>
  )
}
