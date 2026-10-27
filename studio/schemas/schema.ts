import page from './documents/page'
import siteSettings from './documents/siteSettings'
import testimonial from './documents/testimonial'

import seoFields from './objects/seoFields'
import heroBlock from './objects/blocks/heroBlock'
import textMediaBlock from './objects/blocks/textMediaBlock'
import galleryBlock from './objects/blocks/galleryBlock'
import testimonialBlock from './objects/blocks/testimonialBlock'
import tripadvisorBlock from './objects/blocks/tripadvisorBlock'
import ctaBlock from './objects/blocks/ctaBlock'
import faqBlock from './objects/blocks/faqBlock'
import contactFormBlock from './objects/blocks/contactFormBlock'
import slider3dBlock from './objects/blocks/slider3dBlock'
// 👇 NOUVEAUX IMPORTS 👇
import puzzleGalleryBlock from './objects/blocks/puzzleGalleryBlock'
import alternatingBlock from './objects/blocks/alternatingBlock'
import featuresBlock from './objects/blocks/featuresBlock'

export const schemaTypes = [
  page,
  siteSettings,
  testimonial,
  seoFields,
  heroBlock,
  textMediaBlock,
  galleryBlock,
  testimonialBlock,
  tripadvisorBlock,
  ctaBlock,
  faqBlock,
  contactFormBlock,
  slider3dBlock,
  // 👇 NOUVEAUX BLOCS AJOUTÉS AU TABLEAU 👇
  puzzleGalleryBlock,
  alternatingBlock,
  featuresBlock,
]