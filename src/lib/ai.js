import { retrieveContext } from '../data/knowledgeBase';

export const DEFAULT_CONFIG = {
  provider: 'gemini',
  apiKey: import.meta.env.VITE_GEMINI_API_KEY, 
  model: 'gemini-2.5-flash', 
  baseUrl: '/api/gemini', 
};

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

export const generateBioResponse = async (userQuery, history = [], config = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const apiKey = finalConfig.apiKey;
  const modelName = finalConfig.model; 
  const baseUrl = finalConfig.baseUrl || finalConfig.endpoint;
  const context = retrieveContext(userQuery);

  console.log(`[AI] Requesting ${modelName}`); 

  let systemInstruction = `
    You are BioMentor, an advanced bioinformatics research assistant.
    TONE: Scientific, precise, academic.
    GUIDELINES: Provide Python/R code if relevant. Cite databases. Do not hallucinate.
  `;

  if (context) systemInstruction += `\n\nCONTEXT:\n${context}`;

  try {
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`;
    const pastContent = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [...pastContent, { role: "user", parts: [{ text: userQuery }] }]
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.", usedContext: !!context };

  } catch (error) {
    console.error("[AI] Error:", error);
    return { text: `⚠️ Error: ${error.message}`, error: true };
  }
};

export const generateJsonContent = async (topic, type) => {
  // Define Schemas for different content types
  let schema = "";
  let count = 5;

  if (type === 'quiz') {
    schema = `[{"q": "Question", "options": ["A","B","C","D"], "ans": "Correct Option String", "reason": "Short explanation"}]`;
  } else if (type === 'flashcards') {
    schema = `[{"front": "Term", "back": "Definition"}]`;
  } else if (type === 'problems') {
    count = 3;
    schema = `[{"title": "Challenge Title", "desc": "Problem description", "input": "Sample Input", "expected": "Sample Output", "level": "Easy/Medium/Hard", "hint": "One short hint"}]`;
  } else if (type === 'tutorial') {
    count = 1; // Generate 1 full tutorial module
    schema = `{"id": "AI_GEN", "title": "Module Title", "type": "Theory", "duration": "15m", "content": "Full markdown content explaining the topic in depth."}`;
  }

  const prompt = `Generate ${count} ${type} items about "${topic}" in strict JSON format. Schema: ${schema}. ONLY output the raw JSON array/object. No markdown formatting.`;

  try {
    const url = `${DEFAULT_CONFIG.baseUrl}/models/${DEFAULT_CONFIG.model}:generateContent?key=${DEFAULT_CONFIG.apiKey}`;
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    let jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (jsonStr) {
        jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    }
    
    // Handle single object vs array return types
    const parsed = JSON.parse(jsonStr);
    return type === 'tutorial' ? [parsed] : parsed;

  } catch (e) {
    console.error("JSON Gen Error:", e);
    return null;
  }
};