
import { GoogleGenAI, Type } from "@google/genai";
import type { 
  QuizQuestion, NewsArticle, CelebrityInterview, BoxOfficeData, 
  CelebrityBio, Language, MusicTrack, UpcomingMovie, FashionStyle, Quote, SearchResult 
} from '../types';

// The Gemini API client initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using recommended models based on task type
const model = 'gemini-3-flash-preview';
const imageModel = 'gemini-2.5-flash-image';

/**
 * Helper to extract the first valid JSON object or array from a string.
 */
const extractJson = (text: string): any => {
  const startIndex = text.search(/[\{\[]/);
  if (startIndex === -1) throw new Error("No JSON structure found in response");

  const openChar = text[startIndex];
  const closeChar = openChar === '{' ? '}' : ']';
  
  let openCount = 0;
  let isString = false;
  let isEscape = false;
  
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    if (isEscape) { isEscape = false; continue; }
    if (char === '\\') { isEscape = true; continue; }
    if (char === '"') { isString = !isString; continue; }
    
    if (!isString) {
      if (char === openChar) openCount++;
      else if (char === closeChar) {
        openCount--;
        if (openCount === 0) {
          const jsonStr = text.substring(startIndex, i + 1);
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            throw new Error(`JSON Parse Error: ${e.message}`);
          }
        }
      }
    }
  }
  throw new Error("Incomplete JSON structure in response");
};

export const getSearchResults = async (query: string, language: Language = 'English'): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `You are an expert Bollywood encyclopedia. Provide a comprehensive, engaging answer to the following query: "${query}". 
      Use Markdown for formatting. 
      IMPORTANT: Respond in ${language} language.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri
      }))
      .filter((source: any) => source.uri) || [];

    return {
      text: response.text,
      sources: sources
    };
  } catch (e) {
    console.error("Search Error:", e);
    return { text: "Sorry, I couldn't find any information on that. Try searching for something else.", sources: [] };
  }
};

export const getQuizQuestions = async (language: Language = 'English'): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 5 multiple-choice quiz questions about recent popular Bollywood movies (from the last 5 years). Each question must have 4 options and one correct answer.
      IMPORTANT: Generate the content (questions, options, answers) in ${language} language.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Quiz Fetch Error:", e);
    return [];
  }
};

export const getLatestNews = async (language: Language = 'English'): Promise<NewsArticle[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 8-10 latest, trending Bollywood news articles from reliable sources.
      Include a mix of 'Trending', 'Box Office', 'Casting', and 'Fashion'.
      Return strictly as JSON: [{ "headline": "...", "summary": "...", "sourceName": "...", "sourceUrl": "...", "category": "...", "date": "Today" }]
      Translate headline, summary, and category into ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    console.error("News Fetch Error:", e);
    return [];
  }
};

export const getCelebrityInterviews = async (celebrityName: string, language: Language = 'English'): Promise<CelebrityInterview[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 3 recent interviews with ${celebrityName}. Return strictly as JSON: [{ "title": "...", "summary": "...", "sourceName": "...", "sourceUrl": "..." }]
      Translate title/summary into ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    return [];
  }
};

export const generateMovieReview = async (movieTitle: string, language: Language = 'English'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Write a detailed and comprehensive movie review for "${movieTitle}" in ${language}. 
      Use Markdown formatting.
      Structure the review with clear headings for:
      - 5-star Rating
      - Story/Plot Outline (No spoilers)
      - Performance Highlights (Actors)
      - Direction & Music
      - Key Highlights (Best scenes or dialogues)
      - Verdict/Conclusion
      Ensure each section has detailed text explanation, not just bullet points.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text;
  } catch (e) {
    return "Could not generate review.";
  }
};

export const getGameClue = async (language: Language = 'English'): Promise<{ clue: string; answer: string }> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a cryptic clue for a famous Bollywood movie. Return JSON: { "clue": "...", "answer": "..." }. Use ${language} for clue.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { clue: { type: Type.STRING }, answer: { type: Type.STRING } }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return { clue: "No clue found.", answer: "Error" };
  }
};

export const getBoxOfficeTrends = async (language: Language = 'English'): Promise<BoxOfficeData> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Provide a box office report for the top 5 recent Bollywood movies. 
      Return strictly as JSON: { "marketSummary": "...", "movies": [{ "title": "...", "totalCollection": 100, "verdict": "...", "releaseDate": "...", "posterUrl": "...", "cast": ["..."], "weeklyEarnings": [{"week":"W1", "amount":50}] }] }
      Translate to ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const data = extractJson(response.text);
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = chunks.map((c: any) => c.web?.uri).filter((u: any) => u);
    data.sources = [...new Set([...(data.sources || []), ...webSources])];
    return data;
  } catch (e) {
    return { marketSummary: "Data unavailable.", movies: [], sources: [] };
  }
};

export const generateMoviePoster = async (movieTitle: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: { parts: [{ text: `High-quality cinematic poster for Bollywood movie "${movieTitle}". Vertical 3:4.` }] },
      config: { imageConfig: { aspectRatio: "3:4" } }
    });
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return part ? `data:${part.inlineData.mimeType};base64,${part.inlineData.data}` : undefined;
  } catch (e) {
    return undefined;
  }
};

export const getMovieTrailer = async (movieTitle: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find official YouTube trailer ID for "${movieTitle}". JSON: { "videoId": "..." }`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text).videoId || null;
  } catch (e) {
    return null;
  }
};

/**
 * NEW: Fetches streaming availability information for a movie.
 */
export const getStreamingInfo = async (movieTitle: string): Promise<{ platform: string, url: string }[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Identify the specific streaming platforms where the Bollywood movie "${movieTitle}" is currently available (e.g., Netflix, Prime Video, Disney+ Hotstar, Zee5). 
      Return strictly as a JSON array of objects: [{ "platform": "Platform Name", "url": "Direct or search URL" }]
      If not found, return an empty array [].`,
      config: { tools: [{ googleSearch: {} }] }
    });
    const data = extractJson(response.text);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Streaming Fetch Error:", e);
    return [];
  }
};

export const getCelebrityBio = async (name: string, language: Language = 'English'): Promise<CelebrityBio> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Bio for celebrity "${name}". JSON: { "name": "...", "summary": "...", "earlyLife": ["..."], "career": ["..."], "family": ["..."], "awards": ["..."], "lifestyle": ["..."] }
      Translate to ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    throw new Error("Bio error");
  }
};

export const getBollywoodMusic = async (query: string, language: Language = 'English'): Promise<MusicTrack[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 5 popular Bollywood songs for query: "${query}". JSON: [{ "title": "...", "movie": "...", "singers": ["..."], "composer": "...", "mood": "...", "youtubeQuery": "..." }]
      Translate to ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    return [];
  }
};

export const getUpcomingReleases = async (language: Language = 'English'): Promise<UpcomingMovie[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `5 upcoming Bollywood movies in next 12 months. Return strictly as JSON array: [{ "title": "...", "releaseDate": "...", "cast": ["..."], "director": "...", "producer": "...", "synopsis": "...", "buzz": "High" }]
      Translate to ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    return [];
  }
};

export const getFashionTips = async (query: string, language: Language = 'English'): Promise<FashionStyle | null> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Fashion decode for "${query}". 
      Identify the brands the celebrity is wearing and suggest stores where fans can buy these or similar items (e.g., Myntra, Ajio, Amazon, H&M, or designer stores).
      Return strictly as JSON: { 
        "celebrity": "...", 
        "lookName": "...", 
        "description": "...", 
        "elements": ["..."], 
        "tips": ["..."],
        "shoppingLinks": [{ "storeName": "...", "url": "..." }]
      }
      Translate description, elements, tips, and lookName to ${language}.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(response.text);
  } catch (e) {
    return null;
  }
};

export const getFamousQuotes = async (language: Language = 'English', decade: string = 'All Time'): Promise<Quote[]> => {
  try {
    const decadePrompt = decade === 'All Time' 
      ? "from various decades of Bollywood history" 
      : `specifically from Bollywood movies released in the ${decade}`;

    const response = await ai.models.generateContent({
      model,
      contents: `Generate 8 iconic and popular Bollywood dialogues ${decadePrompt}. 
      Return a JSON array: [{ "text": "...", "actor": "...", "movie": "...", "context": "..." }]
      
      RULES:
      1. The "text" field MUST be in the original HINDI language (Devanagari script). DO NOT TRANSLATE the dialogue itself.
      2. The "actor", "movie", and "context" fields should be in ${language}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};
