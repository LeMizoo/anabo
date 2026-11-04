const circuitRouteStops: Record<string, string[]> = {
  'ampefy-et-la-campagne': [
    'Antananarivo, Madagascar',
    'Miarinarivo, Madagascar',
    'Ampefy, Madagascar',
    'Antananarivo, Madagascar',
  ],
  'baobab-et-tsingy': [
    'Antananarivo, Madagascar',
    'Morondava, Madagascar',
    'Avenue of the Baobabs, Madagascar',
    'Belo-sur-Tsiribihina, Madagascar',
    'Bekopaka, Tsingy de Bemaraha, Madagascar',
    'Morondava, Madagascar',
  ],
  'circuit-nord-et-nosibe': [
    'Antananarivo, Madagascar',
    'Antsiranana, Madagascar',
    'Ambanja, Madagascar',
    'Ankify, Madagascar',
    'Hell-Ville, Nosy Be, Madagascar',
  ],
  'circuit-safari-en-voiture': [
    'Antananarivo, Madagascar',
    'Antsirabe, Madagascar',
    'Ranomafana National Park, Madagascar',
    'Fianarantsoa, Madagascar',
    'Isalo National Park, Madagascar',
    'Toliara, Madagascar',
  ],
  'cote-est-et-lemuriens': [
    'Antananarivo, Madagascar',
    'Andasibe-Mantadia National Park, Madagascar',
    'Toamasina, Madagascar',
    'Foulpointe, Madagascar',
    'Sainte-Marie, Madagascar',
  ],
  'lemuriens-et-circuit-vers-l-est': [
    'Antananarivo, Madagascar',
    'Andasibe-Mantadia National Park, Madagascar',
    'Manambato, Madagascar',
    "Akanin'ny Nofy, Madagascar",
    'Toamasina, Madagascar',
    'Antananarivo, Madagascar',
  ],
  'sud-et-rn7': [
    'Antananarivo, Madagascar',
    'Antsirabe, Madagascar',
    'Ambositra, Madagascar',
    'Ranomafana National Park, Madagascar',
    'Fianarantsoa, Madagascar',
    'Ambalavao, Madagascar',
    'Isalo National Park, Madagascar',
    'Toliara, Madagascar',
  ],
  'train-manakara': [
    'Antananarivo, Madagascar',
    'Fianarantsoa, Madagascar',
    'Manakara, Madagascar',
  ],
  'manakara-train': [
    'Antananarivo, Madagascar',
    'Fianarantsoa, Madagascar',
    'Manakara, Madagascar',
  ],
  'voyage-hors-route-et-baobabs': [
    'Antananarivo, Madagascar',
    'Morondava, Madagascar',
    'Kirindy Forest, Madagascar',
    'Belo-sur-Tsiribihina, Madagascar',
    'Bekopaka, Tsingy de Bemaraha, Madagascar',
    'Morondava, Madagascar',
  ],
}

const combinedCircuitStops = [
  'Antananarivo, Madagascar',
  'Ampefy, Madagascar',
  'Bekopaka, Tsingy de Bemaraha, Madagascar',
  'Hell-Ville, Nosy Be, Madagascar',
  'Ranomafana National Park, Madagascar',
  'Sainte-Marie, Madagascar',
  'Andasibe-Mantadia National Park, Madagascar',
  'Toliara, Madagascar',
  'Manakara, Madagascar',
  'Kirindy Forest, Madagascar',
  'Antananarivo, Madagascar',
]

type TourRouteInput = {
  slug?: string
  pageType?: string
  routeStops?: string[] | null
}

export function getTourRouteStops(tour: TourRouteInput): string[] | undefined {
  if (tour.pageType === 'custom-trip' || tour.slug === 'sur-mesure') {
    return combinedCircuitStops
  }

  const configuredStops = tour.routeStops
    ?.filter((stop): stop is string => typeof stop === 'string')
    .map((stop) => stop.trim())
    .filter(Boolean)

  if (configuredStops && configuredStops.length >= 2) {
    return configuredStops
  }

  return tour.slug ? circuitRouteStops[tour.slug] : undefined
}

export function getRouteMapUrls(stops: string[]) {
  if (stops.length < 2) return null

  const encodedStops = stops.map(encodeURIComponent)
  const embedUrl =
    `https://maps.google.com/maps?output=embed&saddr=${encodedStops[0]}` +
    `&daddr=${encodedStops.slice(1).map((stop) => `to:${stop}`).join('+')}`
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&origin=${encodedStops[0]}` +
    `&destination=${encodedStops[encodedStops.length - 1]}` +
    (encodedStops.length > 2
      ? `&waypoints=${encodedStops.slice(1, -1).join('%7C')}`
      : '')

  return { embedUrl, directionsUrl }
}
