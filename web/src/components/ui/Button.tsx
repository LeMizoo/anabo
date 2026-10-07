import Link from 'next/link'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: 'primary' | 'secondary' | 'outline'
  children: ReactNode
}

export function Button({
  href,
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-primary-600 text-white hover:bg-primary-700',
    secondary:
      'bg-secondary-600 text-white hover:bg-secondary-700',
    outline:
      'border border-white/80 bg-transparent text-white hover:bg-white hover:text-gray-900',
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors duration-200',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  )
}