/**
 * Données centralisées des thématiques.
 * Chaque image correspond à un fichier dans assets/images/thematique/.
 */

export interface Thematique {
  id: string;
  name: string;
  desc: string;
  image: any; // require() asset
}

export const THEMATIQUES: Thematique[] = [
  {
    id: 'love',
    name: 'Amour',
    desc: 'Pour dire "Je t\'aime"',
    image: require('../../assets/images/thematique/love.jpeg'),
  },
  {
    id: 'voyage',
    name: 'Voyage',
    desc: 'Le tour du monde',
    image: require('../../assets/images/thematique/voyage.jpeg'),
  },
  {
    id: 'famille',
    name: 'Famille',
    desc: 'Moments précieux',
    image: require('../../assets/images/thematique/famille.jpeg'),
  },
  {
    id: 'anniversaire',
    name: 'Anniversaire',
    desc: 'Fêtez vos moments',
    image: require('../../assets/images/thematique/anniversaire.jpeg'),
  },
  {
    id: 'roadtrip',
    name: 'Road Trip',
    desc: 'Sur la route',
    image: require('../../assets/images/thematique/Roadtrip.jpeg'),
  },
  {
    id: 'fun',
    name: 'Fun',
    desc: 'Rires et bonne humeur',
    image: require('../../assets/images/thematique/fun.jpeg'),
  },
  {
    id: 'mygoal',
    name: 'Mes Objectifs',
    desc: 'Vision board & goals',
    image: require('../../assets/images/thematique/mygoal.jpeg'),
  },
  {
    id: 'netflix',
    name: 'Netflix & Chill',
    desc: 'Soirées cozy',
    image: require('../../assets/images/thematique/netflix.jpeg'),
  },
];
