import type { ImageMetadata } from 'astro';
import t1 from '../assets/transformations/transfo-1.png';
import t2 from '../assets/transformations/transfo-2.png';
import t3 from '../assets/transformations/transfo-3.png';
import t4 from '../assets/transformations/transfo-4.png';
import t5 from '../assets/transformations/transfo-5.png';
import t6 from '../assets/transformations/transfo-6.png';

export interface Transformation {
  id: number; image: ImageMetadata; title: string; freq: string; tag: string; badge?: string;
}

export const transformations: readonly Transformation[] = [
  { id: 1, image: t1, title: 'Perte de 8 kg en 1 an', freq: '2 séances par semaine', tag: 'Remise en forme', badge: '60 ans' },
  { id: 2, image: t2, title: 'Perte de 7,3 kg en 3 mois', freq: '3 séances par semaine', tag: 'Perte de poids' },
  { id: 3, image: t3, title: 'Recomposition corporelle', freq: 'en 4 mois', tag: 'Recomposition', badge: '60 ans' },
  { id: 4, image: t4, title: 'Prise de 4 kg en 3 mois', freq: '4 séances par semaine', tag: 'Prise de masse' },
  { id: 5, image: t5, title: 'Prise de 2 kg en 2 mois', freq: 'Préparation physique', tag: 'Performance', badge: 'Danseur pro' },
  { id: 6, image: t6, title: '+2,2 kg & +7 cm de fessiers', freq: '4 séances par semaine', tag: 'Renforcement' },
];
