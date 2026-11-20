export const SITE_NAME =
  'Madagascar Car Rental with Driver-Guide - Malagasy Company'

/** URL publique du site, sans barre oblique finale. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://roadtrip.anabo.mg'
).replace(/\/+$/, '')
