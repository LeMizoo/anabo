'use client'

import { motion } from 'framer-motion'
import { brandTextColor, subtitleSizeClass, titleCase, titleSizeClass } from '@/lib/typography'

type Props = {
  block: {
    title?: string
    titleFont?: string
    titleColor?: 'navy' | 'gold' | 'charcoal' | 'white'
    titleSize?: string
    titleWeight?: string
    subtitle?: string
    subtitleFont?: string
    subtitleColor?: 'navy' | 'gold' | 'charcoal' | 'white'
    subtitleSize?: string
    sections?: {
      _key: string
      title: string
      items?: {
        _key: string
        label: string
        text: string
      }[]
    }[]
  }
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function CommitmentsSection({ block, globalHeadingFont, globalHeadingWeight }: Props) {
  // 👇 Logique de priorité : local > global > défaut 👇
  const titleFont = block.titleFont || globalHeadingFont || 'font-serif'
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-bold'
  const subtitleFont = block.subtitleFont || 'font-script'

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="container-custom mx-auto max-w-4xl px-4">
        {block.subtitle && (
          <span
            className={`${subtitleFont} ${subtitleSizeClass(block.subtitleSize)} text-[#E0A01C] block mb-2`}
            style={{ color: brandTextColor(block.subtitleColor) }}
          >
            {titleCase(block.subtitle)}
          </span>
        )}
        {block.title && (
          <h2
            className={`${titleFont} ${titleWeight} ${titleSizeClass(block.titleSize)} text-[#06245F] dark:text-white mb-10 border-b-2 border-[#06245F] dark:border-gray-600 pb-2 inline-block`}
            style={{ color: brandTextColor(block.titleColor) }}
          >
            {titleCase(block.title)}
          </h2>
        )}

        <div className="space-y-8">
          {block.sections?.map((section, index) => (
            <motion.div
              key={section._key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-[clamp(1rem,2vw,1.25rem)] font-bold text-[#06245F] dark:text-white flex items-center gap-2 mb-4">
                <span className="text-[#E0A01C]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                {titleCase(section.title)}
              </h3>
              <ul className="space-y-2 pl-8">
                {section.items?.map((item) => (
                  <li key={item._key} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed list-disc marker:text-[#E0A01C]">
                    <strong className="text-gray-900 dark:text-gray-200">{item.label} :</strong> {item.text}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}