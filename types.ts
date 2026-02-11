
export enum LearningType {
  ACQUISITION = 'Acquisition',
  INVESTIGATION = 'Enquête',
  PRACTICE = 'Entraînement',
  DISCUSSION = 'Discussion',
  COLLABORATION = 'Collaboration',
  PRODUCTION = 'Production'
}

export type BloomLevel = 'Mémorisation' | 'Compréhension' | 'Application' | 'Analyse' | 'Évaluation' | 'Création';

export type ICAPLevel = 'Passif' | 'Actif' | 'Constructif' | 'Interactif';

export type ModalityType = 'F2F' | 'Sync' | 'Async';

export interface Activity {
  id: string;
  type: LearningType;
  title: string;
  description: string;
  duration: number; // in minutes
  mode: ModalityType;
  week: number;
  objectives?: string;
  taskType?: string;
  cardNumber?: string;
  bloomLevels?: BloomLevel[];
  demarche?: ('Individuelle' | 'Collective')[];
  material?: string;
  icapLevel?: ICAPLevel;
}

export interface Course {
  title: string;
  description: string;
  targetAudience: string;
  activities: Activity[];
  numWeeks: number;
}

export interface ABCDefinition {
  type: LearningType;
  color: string;
  bgLight: string;
  description: string;
  learnerRole: string;
  taskDescription?: string;
  trainerRole?: string;
  examples: string[];
  digitalTools: string[];
  structuredTasks?: {
    title: string;
    items: string[];
  }[];
}
