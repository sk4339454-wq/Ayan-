import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAnimeRecommendations(history: string[]) {
  if (!process.env.GEMINI_API_KEY) return null;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this watch history: ${history.join(", ")}, suggest 5 anime titles with a brief reason why. Return as JSON array of objects with 'title' and 'reason'.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
}
