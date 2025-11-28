

import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Participant, SubjectType, Assignment } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const generateSchedulePrompt = (participants: Participant[], subjectsToPlan: SubjectType[], week: string): string => {
  const participantDetails = participants.map(p => ({
    id: p.id,
    name: p.name,
    gender: p.gender,
    spiritualRole: p.spiritualRole,
    assignmentHistory: p.assignmentHistory,
    affiliation: p.affiliation,
    unavailabilities: p.unavailabilities,
  }));

  const subjectDetails = subjectsToPlan.map(s => ({
    id: s.id,
    label: s.label,
    nbParticipants: s.nbParticipants,
    requiredGender: s.requiredGender,
    requiredSpiritualRole: s.requiredSpiritualRole,
    isBinome: s.isBinome,
    rotationWeeks: s.rotationWeeks,
  }));

  return `
    Vous êtes un planificateur intelligent pour le programme des réunions d'une assemblée de Témoins de Jéhovah.
    Votre tâche est de créer un programme hebdomadaire équitable et conforme pour la semaine ${week}.

    Voici les participants disponibles pour une attribution :
    ${JSON.stringify(participantDetails, null, 2)}

    Voici les sujets qui nécessitent une attribution cette semaine :
    ${JSON.stringify(subjectDetails, null, 2)}

    Veuillez générer les attributions en suivant scrupuleusement ces règles :
    1.  **Rotation :** Un participant ne doit pas être réattribué à un sujet s'il a traité un sujet avec la même valeur 'rotationWeeks' dans son historique récent. Par exemple, si rotationWeeks est de 4, il ne devrait pas avoir eu ce type de sujet au cours des 4 dernières semaines. Vérifiez son assignmentHistory.
    2.  **Contraintes de Rôle/Genre :** Respectez toutes les contraintes 'requiredGender' et 'requiredSpiritualRole' pour chaque sujet.
    3.  **Binômes (Paires) :** Pour les sujets où 'isBinome' est vrai, attribuez deux participants. Privilégiez fortement les paires de la même famille (en utilisant les données 'affiliation') avant de considérer les paires de même sexe. Une relation familiale est mutuelle (si A est parent de B, B est enfant de A).
    4.  **Nombre de Participants :** Respectez l'exigence 'nbParticipants' pour chaque sujet.
    5.  **Équité :** Essayez de répartir les attributions de manière égale entre tous les participants. Évitez d'attribuer la même personne à plusieurs parties principales dans la même semaine si possible.
    6.  **Exclusivité :** Un participant ne peut être attribué qu'à un seul sujet par semaine.
    7.  **INDISPONIBILITÉ STRICTE :** Un participant NE DOIT PAS être attribué si la semaine de planification ('${week}') est listée dans ses 'unavailabilities'. C'est une règle absolue.

    Votre réponse doit être un objet JSON qui valide le schéma fourni. Le JSON doit être un tableau d'objets d'attribution.
  `;
};


export const generateScheduleWithGemini = async (
    participants: Participant[], 
    subjectsToPlan: SubjectType[],
    week: string
): Promise<Assignment[]> => {

  if (!process.env.API_KEY) {
    throw new Error("La clé API de Gemini n'est pas configurée.");
  }
  
  const activeParticipants = participants.filter(p => !p.isExcluded);
    
  const prompt = generateSchedulePrompt(activeParticipants, subjectsToPlan, week);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subjectTypeId: { type: Type.INTEGER },
              participantIds: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER }
              }
            },
            required: ["subjectTypeId", "participantIds"]
          }
        },
      }
    });

    const jsonText = response.text.trim();
    const generatedAssignments: { subjectTypeId: number; participantIds: number[] }[] = JSON.parse(jsonText);
    
    // Add week and unique ID to the generated assignments
    return generatedAssignments.map(a => ({
        ...a,
        week,
        id: `${week}-${a.subjectTypeId}-${Math.random()}`
    }));

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Échec de la génération du programme avec l'IA. Le modèle a peut-être renvoyé une réponse invalide.");
  }
};