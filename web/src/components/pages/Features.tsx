'use client'

import { motion } from 'framer-motion'
import type { Locale } from '@/lib/i18n'
import { brandTextColor, titleCase, titleSizeClass, headingFont } from '@/lib/typography'

type Props = {
  block: {
    title?: string
    titleFont?: string
    titleColor?: 'navy' | 'gold' | 'charcoal' | 'white'
    titleSize?: string
    titleWeight?: string
    content?: string
    features?: { _key: string; title: string; description: string; icon?: string }[]
  }
  locale: Locale
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function Features({ block, locale, globalHeadingFont, globalHeadingWeight }: Props) {
  const features = block.features ?? []
  if (features.length === 0 && !block.title) return null

  // 👇 Logique de priorité : local > global > défaut 👇
  const titleFont = headingFont(block.titleFont || globalHeadingFont, block.title)
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-normal'

  return (
    <section className="overflow-hidden bg-[#FDF8F5] dark:bg-gray-800">
      <div className="container-custom mx-auto max-w-6xl px-4">
        {block.title && (
          <h2
            className={`text-center text-[#06245F] dark:text-white ${titleFont} ${titleWeight} ${titleSizeClass(block.titleSize)}`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title, locale)}
          </h2>
        )}
        {block.content && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-gray-600 dark:text-gray-300">
            {block.content}
          </p>
        )}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f._key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i, 6) * 0.08 }}
              className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-[#E0A01C]/40 dark:bg-gray-900"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#E0A01C] text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-110">
                {i + 1}
              </span>
              <h3 className={`text-[clamp(1rem,2vw,1.25rem)] text-[#06245F] dark:text-white ${titleFont} ${titleWeight}`}>
                {titleCase(f.title, locale)}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}