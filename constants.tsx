
import { LearningType, ABCDefinition, ICAPLevel } from './types';

export const ICAP_DEFINITIONS: Record<ICAPLevel, { color: string, label: string, description: string }> = {
  'Passif': {
    color: '#94a3b8',
    label: 'Passif (Recevoir)',
    description: "L'apprenant reçoit l'information sans action spécifique (ex: écouter un cours magistral, regarder une vidéo sans interaction)."
  },
  'Actif': {
    color: '#3b82f6',
    label: 'Actif (Manipuler)',
    description: "L'apprenant manipule l'information (ex: prendre des notes linéaires, surligner, mettre en pause une vidéo)."
  },
  'Constructif': {
    color: '#6366f1',
    label: 'Constructif (Générer)',
    description: "L'apprenant génère du contenu au-delà de l'information fournie (ex: synthétiser, créer un schéma, poser des questions)."
  },
  'Interactif': {
    color: '#a855f7',
    label: 'Interactif (Dialoguer)',
    description: "L'apprenant dialogue avec des pairs ou un expert pour co-construire (ex: débat, collaboration sur un projet, peer-learning)."
  }
};

export const ABC_TYPES: Record<LearningType, ABCDefinition> = {
  [LearningType.ACQUISITION]: {
    type: LearningType.ACQUISITION,
    color: '#06b6d4',
    bgLight: '#ecfeff',
    description: "L'apprenant assimile de nouveaux contenus. C'est le mode classique de transmission de connaissances où l'on reçoit l'information de manière passive or semi-active.",
    learnerRole: "Mettre en lien des contenus avec ses connaissances et ses compétences pour en acquérir de nouvelles.",
    trainerRole: "Évaluer ou permettre l’auto-évaluation du niveau d’acquisition des contenus.",
    structuredTasks: [
      {
        title: "Consulter une ressource",
        items: [
          "Lire un document or un article",
          "Ecouter un podcast",
          "Visionner une vidéo, une animation"
        ]
      },
      {
        title: "Assister à une présentation",
        items: [
          "Conférence",
          "Cours",
          "Webinaire",
          "Master classes",
          "Démonstrations"
        ]
      }
    ],
    examples: [],
    digitalTools: [
      "Magistère",
      "Page",
      "Livre",
      "Glossaire",
      "Course presentation (H5P)",
      "PodEduc",
      "Classe virtuelle",
      "Dossier"
    ]
  },
  [LearningType.INVESTIGATION]: {
    type: LearningType.INVESTIGATION,
    color: '#ef4444',
    bgLight: '#fef2f2',
    description: "L'apprenant explore activement des ressources pour construire ses propres connaissances. Il doit comparer, analyser et critiquer les sources.",
    learnerRole: "Analyser et comparer des ressources référencées en s’appuyant sur des recherches personnelles pertinentes.",
    trainerRole: "Faciliter une posture réflexive chez l’apprenant, questionner les choix.",
    structuredTasks: [
      {
        title: "Analyser un contenu",
        items: [
          "Rechercher des exemples de practice, les catégoriser, en faire une typologie",
          "Comparer des méthodes, des approches didactiques au regard de l’état de l’art, de la recherche et des prescriptions"
        ]
      },
      {
        title: "Analyser une practice",
        items: [
          "Prendre part à des mises en situation",
          "S’appuyer sur une grille pour les observer, prendre part à l’auto et l’allo-confrontation",
          "Interviewer un pair ou un expert"
        ]
      }
    ],
    examples: [],
    digitalTools: ["Dossier", "Fichier", "PodEduc", "Moteurs de recherche", "Bases de données", "Bibliothèques numériques"]
  },
  [LearningType.PRACTICE]: {
    type: LearningType.PRACTICE,
    color: '#a855f7',
    bgLight: '#faf5ff',
    description: "L'apprenant applique ses connaissances dans un contexte structuré. L'accent est mis sur l'action et le feedback immédiat.",
    learnerRole: "Tester ses connaissances, ses compétences, considérant ses résultats, sa propre analyse et les rétroactions..",
    trainerRole: "Faciliter une posture réflexive chez l’apprenant, fournir des rétroactions..",
    structuredTasks: [
      {
        title: "Pratiquer",
        items: [
          "Faire un exercice, une étude de cas",
          "Répondre à un quiz",
          "Concevoir un outil d’analyse",
          "Participer à un jeu de rôle"
        ]
      },
      {
        title: "Présenter son travail",
        items: [
          "Rendre compte d’une visite, d’un stage",
          "Conduire un projet et le soutenir à l’oral"
        ]
      }
    ],
    examples: [],
    digitalTools: ["H5P", "Simulateurs", "Test", "Paquetage Scorm"]
  },
  [LearningType.DISCUSSION]: {
    type: LearningType.DISCUSSION,
    color: '#1e3a8a',
    bgLight: '#eff6ff',
    description: "L'apprenant articule ses idées et les confronte à celles des autres. C'est un échange structuré.",
    learnerRole: "Confronter ses idées, interroger celles des pairs et du(es) formateur(s).",
    trainerRole: "S’assurer en amont d’installer un cadre bienveillant de formation.",
    structuredTasks: [
      {
        title: "Interagir avec une ou plusieurs personnes",
        items: [
          "Participer à un débat, à une classe virtuelle, à une interview",
          "Questionner, argumenter le choix d’outil, la pertinence d’une démarche"
        ]
      },
      {
        title: "Interagir avec un contenu",
        items: [
          "Voter, répondre à un sondage",
          "Participer à un remue méninge, à un nuage de mots",
          "Participer à un fil de discussion sur un forum"
        ]
      }
    ],
    examples: [],
    digitalTools: ["Forums", "Classe virtuelle", "Nuage de mots", "Commentaires"]
  },
  [LearningType.COLLABORATION]: {
    type: LearningType.COLLABORATION,
    color: '#fbbf24',
    bgLight: '#fffbeb',
    description: "L'apprenant travaille avec ses pairs pour atteindre un objectif commun. Il y a une interdépendance positive.",
    learnerRole: "Réaliser une production commune résultant d’un débat ou d’une mise en pratique.",
    trainerRole: "Questionner les choix opérés, stimuler ou réguler les interactions.",
    structuredTasks: [
      {
        title: "Contribuer à une production commune",
        items: [
          "Planifier les tâches d’un projet",
          "Rédiger une synthèse",
          "Élaborer une grille d’analyse",
          "Concevoir et tester une démarche",
          "Corriger la production d’un tiers"
        ]
      },
      {
        title: "Interagir",
        items: [
          "Participer à un remue méninge, à un nuage de mots",
          "Participer à un débat",
          "Participer à un fil de discussion sur un forum"
        ]
      }
    ],
    examples: [],
    digitalTools: ["Wikis", "Glossaire", "Devoir", "Sticky Notes", "H5P"]
  },
  [LearningType.PRODUCTION]: {
    type: LearningType.PRODUCTION,
    color: '#22c55e',
    bgLight: '#f0fdf4',
    description: "L'apprenant crée un artefact qui témoigne de son apprentissage.",
    learnerRole: "Consolider ses apprentissages en réalisant une production résultant de la compréhension des concepts, de leur mise en pratique.",
    trainerRole: "Questionner les choix opérés, fournir des rétroactions, des ressources référencées.",
    structuredTasks: [
      {
        title: "Réaliser une publication",
        items: [
          "Rédiger un résumé, un article",
          "Réaliser un poster, un compte-rendu",
          "Construire une grille d’analyse, une fiche de mutualisation, une séquence"
        ]
      },
      {
        title: "Créer une ressource de référence",
        items: [
          "Créer et alimenter un glossaire",
          "Rédiger une synthèse",
          "Créer un diaporama, une capsule vidéo"
        ]
      }
    ],
    examples: [],
    digitalTools: ["Logiciels de montage", "Devoir", "H5P", "Classe virtuelle"]
  }
};
