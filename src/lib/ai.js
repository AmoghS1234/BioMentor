import { retrieveContext } from '../data/knowledgeBase';

// EXPORT THIS so other files can use the same defaults
export const DEFAULT_CONFIG = {
  provider: 'gemini',
  // SECURE FIX: Key is now read from the Vercel/Vite environment variables.
  // The user MUST set VITE_GEMINI_API_KEY in the Vercel dashboard.
  apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
  model: 'gemini-2.5-flash', 
  baseUrl: '/api/gemini', 
};

// Retry logic and function definitions remain the same, ensuring robustness.
async function fetchWithRetry(url, options, retries = 3, backoff = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        console.warn(`[AI] Rate limit hit. Retrying in ${backoff/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, backoff * (i + 1)));
        continue; 
      }
      return response;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  return fetch(url, options);
}

/**
 * Main AI Function with Memory
 */
export const generateBioResponse = async (userQuery, history = [], config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const apiKey = finalConfig.apiKey;
  const modelName = finalConfig.model; 
  const baseUrl = finalConfig.baseUrl || finalConfig.endpoint;
  const context = retrieveContext(userQuery);

  console.log(`[AI] Requesting model: ${modelName} | History Depth: ${history.length}`); 

  let systemInstruction = `
    You are BioMentor, an advanced bioinformatics research assistant.
    TONE: Scientific, precise, academic.
    CONTEXT: Answer for university-level students and researchers.
    GUIDELINES: 
    - Provide Python (Biopython) or R code snippets where relevant.
    - Cite standard databases (UniProt, NCBI, PDB).
    - Do not hallucinate.
  `;

  if (context) {
    systemInstruction += `\n\nRELEVANT KNOWLEDGE BASE:\n${context}\n\nUse this context to inform your answer.`;
  }

  try {
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`;
    
    // Format History for Gemini (User/Model roles)
    const pastContent = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        ...pastContent, 
        { role: "user", parts: [{ text: userQuery }] }
      ]
    };

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    };

    let response = await fetchWithRetry(url, options);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[AI] API Error Details:", errText);
      throw new Error(`Server returned ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text.";
    
    return { text: answer, usedContext: !!context };

  } catch (error) {
    console.error("[AI] Critical Error:", error);
    return { 
      text: `⚠️ Connection Failed. Error: ${error.message}`, 
      error: true 
    };
  }
};

/**
 * Content Generator (Quiz/Flashcards)
 */
export const generateJsonContent = async (topic, type) => {
  const prompt = `Generate 5 ${type} items about "${topic}" in strict JSON...`;
  try {
    const url = `${DEFAULT_CONFIG.baseUrl}/models/${DEFAULT_CONFIG.model}:generateContent?key=${DEFAULT_CONFIG.apiKey}`;
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    };

    const response = await fetchWithRetry(url, options);
    const data = await response.json();
    let jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (jsonStr) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Gen Error:", e);
    return null;
  }
};