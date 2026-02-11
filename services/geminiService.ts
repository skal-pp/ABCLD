
import { GoogleGenAI, Type } from "@google/genai";
import { Activity, LearningType } from "../types";

export const generateScenario = async (topic: string, audience: string, weeks: number): Promise<Partial<Activity>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Génère un scénario pédagogique complet pour un cours sur le sujet : "${topic}" destiné à un public de "${audience}". 
    Le cours dure ${weeks} semaines. Utilise la méthode ABC Learning Design.
    Propose au moins 2 à 3 activités par semaine.
    
    Chaque activité doit inclure :
    - Un type ABC parmi : Acquisition, Enquête, Entraînement, Discussion, Collaboration, Production
    - Un niveau ICAP parmi : Passif, Actif, Constructif, Interactif
    - Une modalité (F2F, Sync, Async)
    - Un numéro de semaine (de 1 à ${weeks})
    - Des objectifs d'apprentissage clairs
    - Un type de tâche (Individuel, Collaboratif, Peer-learning, etc.)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING,
              description: "Le type d'apprentissage ABC (Acquisition, Enquête, Entraînement, Discussion, Collaboration, Production)"
            },
            icapLevel: {
              type: Type.STRING,
              description: "Le niveau d'engagement ICAP (Passif, Actif, Constructif, Interactif)"
            },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.NUMBER },
            mode: { type: Type.STRING },
            week: { type: Type.NUMBER },
            objectives: { type: Type.STRING },
            taskType: { type: Type.STRING }
          },
          required: ["type", "icapLevel", "title", "description", "duration", "mode", "week", "objectives", "taskType"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};
