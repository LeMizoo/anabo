'use client'

import { motion } from 'framer-motion'

type Props = {
  block: {
    title?: string
    titleFont?: string
    titleWeight?: string
    content?: string
    features?: { _key: string; title: string; description: string; icon?: string }[]
  }
  globalHeadingFont?: string
  globalHeadingWeight?: string
}

export function Features({ block, globalHeadingFont, globalHeadingWeight }: Props) {
  const features = block.features ?? []
  if (features.length === 0 && !block.title) return null

  // 👇 Logique de priorité : local > global > défaut 👇
  const titleFont = block.titleFont || globalHeadingFont || 'font-serif'
  const titleWeight = block.titleWeight || globalHeadingWeight || 'font-bold'

  return (
    <section className="overflow-hidden bg-[#FDF8F5] dark:bg-gray-800 py-16 md:py-24">
      <div className="container-custom mx-auto max-w-6xl px-4">
        {block.title && (
          <h2 className={`text-center text-3xl text-[#06245F] dark:text-white ${titleFont} ${titleWeight}`}>
            {block.title}
          </h2>
        )}
        {block.content && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-gray-600 dark:text-gray-300">
            {block.content}
          </p>
        )}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f._key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#E0A01C] text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className={`text-lg font-semibold text-[#06245F] dark:text-white ${titleFont}`}>
                {f.title}
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