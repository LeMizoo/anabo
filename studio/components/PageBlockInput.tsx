import type { ChangeEvent } from 'react'
import { Box, Select, Stack, Text } from '@sanity/ui'
import { PatchEvent, set, type ObjectInputProps } from 'sanity'

const BLOCK_TYPES = [
  { value: 'heroBlock', title: 'Bannière (Hero)' },
  { value: 'textMediaBlock', title: 'Texte + Média' },
  { value: 'galleryBlock', title: 'Galerie' },
  { value: 'testimonialBlock', title: 'Témoignages' },
  { value: 'tripadvisorBlock', title: 'Avis Tripadvisor' },
  { value: 'ctaBlock', title: 'Appel à l’action' },
  { value: 'faqBlock', title: 'FAQ' },
  { value: 'contactFormBlock', title: 'Formulaire de contact' },
  { value: 'slider3dBlock', title: 'Slider 3D' },
  { value: 'puzzleGalleryBlock', title: 'Galerie puzzle' },
  { value: 'alternatingBlock', title: 'Section Image + Texte (Alterné)' },
  { value: 'featuresBlock', title: 'Fonctionnalités' },
  { value: 'commitmentsBlock', title: 'Engagements' },
  { value: 'imageBlock', title: 'Image' },
  { value: 'imageMarqueeBlock', title: 'Défilement d’images' },
  { value: 'headingBlock', title: 'Titre' },
  { value: 'cardsBlock', title: 'Cartes image + texte' },
]

export function PageBlockInput(props: ObjectInputProps) {
  const currentType = props.schemaType.name

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextType = event.currentTarget.value
    if (nextType === currentType) return

    props.onChange(
      PatchEvent.from(
        set({
          ...(props.value ?? {}),
          _type: nextType,
        }),
      ),
    )
  }

  return (
    <Stack space={3}>
      <Box>
        <Text size={1} weight="semibold">
          Changer le type du bloc
        </Text>
        <Select
          aria-label="Type du bloc"
          value={currentType}
          onChange={handleTypeChange}
          disabled={props.readOnly}
          fontSize={2}
          padding={3}
        >
          {BLOCK_TYPES.map(({ value, title }) => (
            <option key={value} value={value}>
              {title}
            </option>
          ))}
        </Select>
        <Text muted size={1}>
          Les champs partagés sont conservés. Les champs propres au type source
          peuvent ne pas être disponibles dans le nouveau bloc.
        </Text>
      </Box>
      {props.renderDefault(props)}
    </Stack>
  )
}
