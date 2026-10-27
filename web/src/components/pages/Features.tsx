'use client'

import { motion } from 'framer-motion'

type Props = {
  block: {
    title?: string
    content?: string
    features?: { _key: string; title: string; description: string; icon?: string }[]
  }
}

export function Features({ block }: Props) {
  const features = block.features ?? []
  if (features.length === 0 && !block.title) return null

  return (
    <section className="overflow-hidden bg-[#FDF8F5] py-16 md:py-24">
      <div className="container-custom mx-auto max-w-6xl px-4">
        {block.title && (
          <h2 className="text-center text-3xl font-bold text-[#06245F]">{block.title}</h2>
        )}
        {block.content && (
          <p className="mx-auto mt-4 max-w-3xl text-center text-gray-600">{block.content}</p>
        )}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f._key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#E0A01C] text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="text-lg font-semibold text-[#06245F]">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}