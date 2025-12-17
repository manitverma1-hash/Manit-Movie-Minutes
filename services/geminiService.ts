
import { GoogleGenAI, Type } from "@google/genai";
import type { 
  QuizQuestion, NewsArticle, CelebrityInterview, BoxOfficeData, 
  CelebrityBio, Language, MusicTrack, UpcomingMovie, FashionStyle, Quote 
} from '../types';

// The Gemini API client initialization.
// The API key is sourced from environment variables as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using a consistent, modern model for all features
const model = 'gemini-2.5-flash';

/**
 * Helper to extract the first valid JSON object or array from a string.
 * This handles cases where the model wraps JSON in markdown or adds citations/text after the JSON.
 * Robustly handles braces inside strings.
 */
const extractJson = (text: string): any => {
  // Find start of JSON
  const startIndex = text.search(/[\{\[]/);
  if (startIndex === -1) throw new Error("No JSON structure found in response");

  const openChar = text[startIndex];
  const closeChar = openChar === '{' ? '}' : ']';
  
  let openCount = 0;
  let isString = false;
  let isEscape = false;
  
  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];
    
    if (isEscape) {
      isEscape = false;
      continue;
    }
    
    if (char === '\\') {
      isEscape = true;
      continue;
    }
    
    if (char === '"') {
      isString = !isString;
      continue;
    }
    
    if (!isString) {
      if (char === openChar) {
        openCount++;
      } else if (char === closeChar) {
        openCount--;
        if (openCount === 0) {
          // Found the matching closing brace
          const jsonStr = text.substring(startIndex, i + 1);
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            // If parsing fails (e.g. bad control chars), try to cleanup or continue?
            // For now, throw to let the caller handle or see the error
            throw new Error(`JSON Parse Error: ${e.message}`);
          }
        }
      }
    }
  }

  throw new Error("Incomplete JSON structure in response");
};

/**
 * Fetches quiz questions from the Gemini API.
 * Uses JSON mode for a structured response (allowed because no tools are used).
 */
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
              question: { type: Type.STRING, description: `The quiz question in ${language}.` },
              options: {
                type: Type.ARRAY,
                description: `An array of 4 possible answers in ${language}.`,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the options." }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });

    const jsonText = response.text.trim();
    const questions = JSON.parse(jsonText);
    
    // Basic validation
    if (Array.isArray(questions) && questions.length > 0 && questions.every(q => q.question && Array.isArray(q.options) && q.options.length === 4 && q.correctAnswer)) {
      return questions;
    } else {
      console.error("API returned quiz data in an unexpected format:", questions);
      throw new Error("Invalid format for quiz questions received from API.");
    }
  } catch (e) {
    console.error("Quiz Fetch Error:", e);
    // Fallback static data
    return [
      {
        question: "Who directed the movie 'Pathaan'?",
        options: ["Siddharth Anand", "Rohit Shetty", "Kabir Khan", "Rajkumar Hirani"],
        correctAnswer: "Siddharth Anand"
      },
      {
        question: "Which movie won the Filmfare Award for Best Film in 2024?",
        options: ["12th Fail", "Animal", "Jawan", "Rocky Aur Rani Kii Prem Kahaani"],
        correctAnswer: "12th Fail"
      }
    ];
  }
};

/**
 * Fetches latest Bollywood news.
 * Uses Google Search tool. Note: responseMimeType: "application/json" cannot be used with tools.
 */
export const getLatestNews = async (language: Language = 'English'): Promise<NewsArticle[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 6 latest, trending Bollywood news headlines from reliable sources. 
      Return the output strictly as a JSON array of objects with the following structure:
      [{ "headline": "...", "summary": "...", "sourceName": "...", "sourceUrl": "..." }]
      
      IMPORTANT: Translate the 'headline' and 'summary' values into ${language} language. Keep the JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    try {
      return extractJson(response.text);
    } catch (parseError) {
      console.error("JSON Parse Error for News:", parseError);
      throw parseError;
    }

  } catch (e) {
    console.error("News Fetch Error:", e);
    // Fallback
    return [
      {
        headline: "Shah Rukh Khan's Next Project Announced",
        summary: "SRK confirms his next collaboration with Sujoy Ghosh for 'King', starring alongside Suhana Khan.",
        sourceName: "Bollywood Hungama",
        sourceUrl: "https://www.bollywoodhungama.com"
      },
      {
        headline: "Box Office Update: Latest Releases",
        summary: "The latest Friday releases see a mixed response at the box office with steady occupancy rates in metro cities.",
        sourceName: "Pinkvilla",
        sourceUrl: "https://www.pinkvilla.com"
      }
    ];
  }
};

/**
 * Fetches celebrity interviews.
 * Uses Google Search tool.
 */
export const getCelebrityInterviews = async (celebrityName: string, language: Language = 'English'): Promise<CelebrityInterview[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 3 recent, interesting interviews or statements given by Bollywood celebrity ${celebrityName}. 
      Return the output strictly as a JSON array of objects with the following structure:
      [{ "title": "...", "summary": "...", "sourceName": "...", "sourceUrl": "..." }]
      
      IMPORTANT: Translate the 'title' and 'summary' values into ${language} language. Keep the JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return extractJson(response.text);
  } catch (e) {
    console.error("Interview Fetch Error:", e);
    return [];
  }
};

/**
 * Generates a movie review.
 * Returns markdown text.
 */
export const generateMovieReview = async (movieTitle: string, language: Language = 'English'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Write a short, engaging movie review for the Bollywood movie "${movieTitle}". 
      Include a rating out of 5 stars, key highlights, performances, and a verdict. 
      Use Markdown formatting. Use bullet points for lists. 
      Bold key phrases, actor names, and important highlights to make them stand out.
      
      IMPORTANT: Write the entire review in ${language} language.`,
      config: {
        tools: [{ googleSearch: {} }] 
      }
    });
    return response.text;
  } catch (e) {
    console.error("Review Generation Error:", e);
    return "Sorry, I couldn't generate a review for that movie right now.";
  }
};

/**
 * Generates a clue for the "Guess the Movie" game.
 * No tools used, so JSON schema is fine.
 */
export const getGameClue = async (language: Language = 'English'): Promise<{ clue: string; answer: string }> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a cryptic but solvable one-sentence logline or clue for a famous Bollywood movie. Also provide the answer. 
      Return as JSON object: { "clue": "...", "answer": "..." }.
      
      IMPORTANT: Write the 'clue' in ${language} language. The 'answer' (movie title) should remain in its original recognizable form (usually English/Hindi transliterated).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clue: { type: Type.STRING },
            answer: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Game Clue Error:", e);
    return { clue: "Two friends, a road trip, and a search for a lost buddy.", answer: "3 Idiots" };
  }
};

/**
 * Fetches box office trends.
 * Uses Google Search tool.
 */
export const getBoxOfficeTrends = async (language: Language = 'English'): Promise<BoxOfficeData> => {
  try {
    // Reduced complexity of the prompt to avoid token limits and 'Incomplete JSON' errors.
    const response = await ai.models.generateContent({
      model,
      contents: `Provide a box office report for the top 5 recent Bollywood movies. 
      Return strictly as JSON:
      {
        "marketSummary": "Brief market overview (max 3 sentences).",
        "movies": [
          {
            "title": "Movie Title",
            "totalCollection": 100,
            "verdict": "Hit",
            "releaseDate": "DD MMM YYYY",
            "posterUrl": "https://...",
            "cast": ["Actor 1", "Actor 2"],
            "weeklyEarnings": [{ "week": "W1", "amount": 50 }]
          }
        ]
      }
      
      Translate summary/verdict to ${language}.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const data = extractJson(response.text);
    
    // Extract grounding URLs for sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .map((chunk: any) => chunk.web?.uri)
      .filter((uri: string | undefined) => uri);
    
    if (webSources.length > 0) {
      data.sources = [...new Set([...(data.sources || []), ...webSources])];
    }

    return data;
  } catch (e) {
    console.error("Box Office Fetch Error:", e);
    // Provide a valid fallback to prevent app crash
    return {
      marketSummary: "Market data is currently unavailable. Please check back later.",
      movies: [
          {
             title: "Stree 2",
             totalCollection: 600,
             verdict: "Blockbuster",
             releaseDate: "15 Aug 2024",
             weeklyEarnings: [{ week: "Week 1", amount: 291 }],
             cast: ["Shraddha Kapoor", "Rajkummar Rao", "Pankaj Tripathi"]
          }
      ],
      sources: []
    };
  }
};

/**
 * Generates a movie poster using the image generation model.
 */
export const generateMoviePoster = async (movieTitle: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Create a high-quality, cinematic movie poster for the Bollywood movie "${movieTitle}". Vertical aspect ratio.` }
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (e) {
    console.error("Poster Generation Error:", e);
    return undefined;
  }
};

/**
 * Finds the official YouTube trailer video ID for a movie.
 */
export const getMovieTrailer = async (movieTitle: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find the official YouTube trailer for the Bollywood movie "${movieTitle}".
      Return strictly a JSON object with the YouTube Video ID:
      { "videoId": "..." }
      
      Example: If the url is https://www.youtube.com/watch?v=dQw4w9WgXcQ, return { "videoId": "dQw4w9WgXcQ" }`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const json = extractJson(response.text);
    return json.videoId || null;
  } catch (e) {
    console.error("Trailer Fetch Error:", e);
    return null;
  }
};

/**
 * Fetches detailed celebrity biography.
 * Uses Google Search tool.
 */
export const getCelebrityBio = async (name: string, language: Language = 'English'): Promise<CelebrityBio> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate a comprehensive biography for Bollywood celebrity "${name}". 
      Include sections for: Summary, Early Life, Career, Family & Friends, Awards, and Lifestyle. 
      Format the content as bullet points for each section to be displayed in an infographic style.
      
      Return strictly as JSON with the following structure:
      {
        "name": "...",
        "summary": "...",
        "earlyLife": ["..."],
        "career": ["..."],
        "family": ["..."],
        "awards": ["..."],
        "lifestyle": ["..."]
      }
      
      IMPORTANT: Translate ALL text values (summary, array items) into ${language} language. Keep JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return extractJson(response.text);
  } catch (e) {
    console.error("Bio Fetch Error:", e);
    throw new Error("Could not fetch biography data.");
  }
};

/**
 * Fetches Bollywood music recommendations.
 */
export const getBollywoodMusic = async (query: string, language: Language = 'English'): Promise<MusicTrack[]> => {
  try {
    const prompt = query 
      ? `Find 5 popular Bollywood songs matching this query: "${query}".`
      : `Find 5 currently trending Bollywood songs.`;

    const response = await ai.models.generateContent({
      model,
      contents: `${prompt}
      Return strictly as a JSON array of objects:
      [{ 
        "title": "Song Title", 
        "movie": "Movie Name", 
        "singers": ["Singer 1", "Singer 2"], 
        "composer": "Composer Name",
        "mood": "Romantic/Party/Sad/etc",
        "youtubeQuery": "Song Title Movie Name Official Video"
      }]
      
      IMPORTANT: Translate 'mood' and if appropriate song/movie titles into ${language}. Keep JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return extractJson(response.text);
  } catch (e) {
    console.error("Music Fetch Error:", e);
    return [];
  }
};

/**
 * Fetches upcoming Bollywood releases.
 */
export const getUpcomingReleases = async (language: Language = 'English'): Promise<UpcomingMovie[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Find 5 highly anticipated Bollywood movies releasing in the next 12 months.
      Return strictly as a JSON array of objects:
      [{ 
        "title": "Movie Title", 
        "releaseDate": "Expected Release Date (e.g. Dec 2024)", 
        "cast": ["Actor 1", "Actor 2"], 
        "director": "Director Name",
        "synopsis": "One sentence plot summary",
        "buzz": "High" | "Medium" | "Low"
      }]
      
      IMPORTANT: Translate 'synopsis' and 'buzz' into ${language}. Keep JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return extractJson(response.text);
  } catch (e) {
    console.error("Releases Fetch Error:", e);
    return [];
  }
};

/**
 * Fetches fashion tips/style decode.
 */
export const getFashionTips = async (query: string, language: Language = 'English'): Promise<FashionStyle | null> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Decode the fashion style or a specific iconic look for Bollywood celebrity: "${query}".
      Describe the outfit, accessories, and vibe. Provide tips on how to recreate it.
      
      Return strictly as a JSON object:
      {
        "celebrity": "Name",
        "lookName": "Name of the look (e.g. Sabyasachi Wedding)",
        "description": "Detailed description of the style.",
        "elements": ["Item 1", "Item 2", "Item 3"],
        "tips": ["Tip 1", "Tip 2", "Tip 3"]
      }
      
      IMPORTANT: Translate 'lookName', 'description', 'elements', and 'tips' into ${language}. Keep JSON keys in English.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return extractJson(response.text);
  } catch (e) {
    console.error("Fashion Fetch Error:", e);
    return null;
  }
};

/**
 * Fetches famous quotes/dialogues.
 */
export const getFamousQuotes = async (language: Language = 'English'): Promise<Quote[]> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Generate 6 iconic, timeless, or philosophical Bollywood dialogues/quotes from various eras.
      Return strictly as a JSON array of objects:
      [{ 
        "text": "The dialogue text (in original Hindi/Urdu transliteration if appropriate, or English translation)", 
        "actor": "Actor Name", 
        "movie": "Movie Name", 
        "context": "Brief context or meaning (1 sentence)" 
      }]
      
      IMPORTANT: If the dialogue is famous in Hindi, keep the 'text' in Hindi/Hinglish but translated to the script suitable for ${language} readers (e.g. use English script for Hinglish). Translate the 'context' to ${language}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                text: { type: Type.STRING },
                actor: { type: Type.STRING },
                movie: { type: Type.STRING },
                context: { type: Type.STRING }
             }
          }
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Quotes Fetch Error:", e);
    return [
      {
        text: "Mogambo khush hua",
        actor: "Amrish Puri",
        movie: "Mr. India",
        context: "The iconic villain expressing his satisfaction."
      },
      {
        text: "Bade bade deshon mein aisi choti choti baatein hoti rehti hai",
        actor: "Shah Rukh Khan",
        movie: "Dilwale Dulhania Le Jayenge",
        context: "A charming way to brush off small mistakes in love."
      }
    ];
  }
};
