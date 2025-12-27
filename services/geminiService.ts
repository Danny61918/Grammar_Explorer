
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType } from "../types";

// Note: Initialization is moved inside functions to ensure the most recent API key from process.env is used.

// Optimization: Use Flash model for generation to save tokens and improve speed.
// Grammar generation is a basic text task well within Flash capabilities.
export const generateAIQuestions = async (baseQuestions: Question[], category: string): Promise<Question[]> => {
  /* Initialize AI inside the function to use the correct API key from process.env */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Based on the following school grammar questions in the category "${category}", generate 5 NEW and DIFFERENT questions.
    Keep the same grammar focus and difficulty level suitable for children.
    
    Base Questions:
    ${JSON.stringify(baseQuestions.slice(0, 3))}

    Return the result ONLY as a JSON array of objects with the following structure:
    - id: string (prefix with ai_)
    - question: string
    - type: one of "MCQ", "PHRASE", "ERROR", "TF"
    - options: string[] (if applicable)
    - answer: string
    - explanation: string
    - category: string
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["id", "question", "type", "answer", "explanation", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.map((q: any) => ({ ...q, isAI: true }));
  } catch (error) {
    console.error("AI Generation failed:", error);
    return [];
  }
};

// Optimization: Use Flash model for single question analysis.
export const analyzeQuestion = async (content: string): Promise<Partial<Question>> => {
  /* Initialize AI inside the function to use the correct API key from process.env */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this English grammar question for a primary school student: "${content}"
    Provide metadata: type (MCQ, PHRASE, ERROR, TF), options (if MCQ), answer, explanation (EN+ZH), and category.
    Return ONLY as a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ["type", "answer", "explanation", "category"]
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Analysis failed:", error);
    return {};
  }
};

export const extractQuestionsFromImage = async (base64Image: string): Promise<Question[]> => {
  /* Initialize AI inside the function to use the correct API key from process.env */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this image of an English grammar worksheet. 
    Extract all questions into JSON format.
    Rules:
    1. Identify type: MCQ, TF, ERROR, or PHRASE.
    2. Extract options for MCQ.
    3. Infer correct answer.
    4. Provide explanation in English and Traditional Chinese.
    5. Categorize: "Present Simple", "Past Simple", "Prepositions", "Articles", "Pronouns", "Conjunctions".
    Return a JSON array.
  `;

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: prompt }, imagePart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["question", "type", "answer", "explanation", "category"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    const parsed = JSON.parse(text);
    return parsed.map((q: any, index: number) => ({
      ...q,
      id: `ocr_${Date.now()}_${index}`
    }));
  } catch (error) {
    console.error("OCR Extraction failed:", error);
    throw error;
  }
};
