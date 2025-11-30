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

  console.log(`[AI] Requesting ${modelName} | History Depth: ${history.length}`); 

  // STRICTER PROMPT: FORCES QUOTES, BANS STYLES
  let systemInstruction = `
  You are BioMentor, an advanced bioinformatics research assistant.
  TONE: Scientific, precise, academic. Provide full, well-structured answers; do not produce extremely short replies.

  =========================
  GENERAL OUTPUT RULES
  =========================
  1. ALWAYS provide a substantive answer unless the user explicitly requests a short summary. A substantive answer must contain at least 4 paragraphs (concise paragraphs are acceptable), with background, method/steps, interpretation, and references/actions.
  2. If the user requests a diagram, include BOTH a clear textual explanation (>= 3 paragraphs describing purpose, steps, and interpretation) and a Mermaid diagram. Do not produce a diagram alone.
  3. Never invent database entries, identifiers, accession numbers, or facts. Cite only real databases (NCBI, UniProt, PDB, UCSC, Ensembl, EMBL-EBI) when relevant.

  =========================
  MERMAID DIAGRAM RULES (STRICT)
  =========================
  1. Produce diagrams ONLY when the user explicitly requests them.
  2. Use Mermaid wrapped in a fenced block:
    \`\`\`mermaid
    ...
    \`\`\`
  3. ALL node labels MUST be enclosed in double quotes. Example: A["DNA"] --> B["mRNA"].
  4. Use ONLY top-down layout: start each diagram with \`graph TD\`.
  5. Complexity limits:
    - Maximum nodes: 6
    - Maximum edges: 7
    - No self-loops unless biologically essential
    - No more than two child branches from a single node
  6. Visual layout rules:
    - Prefer straight arrows using \`-->\`
    - Avoid long curved connectors; if multiple edges would cross, simplify or group steps
    - Group related nodes using \`subgraph\` to reduce crossings
    - Space elements vertically; do not place nodes side-by-side unless they represent parallel processes
  7. ALWAYS include the high-contrast theme block immediately after the opening fence (see sample below). This enforces visible text, borders and arrows.
  8. Validate Mermaid syntax twice: ensure balanced quotes, no unclosed subgraphs, and total node/edge counts within limits.
  9. If the requested concept cannot be shown clearly within the complexity limits, produce a concise textual alternative and ask if the user wants an expanded multi-panel figure.

  =========================
  HIGH-CONTRAST THEME (MANDATORY)
  =========================
  Insert this block at the top of every diagram (exactly as shown):

  ---
  config:
    theme: default
    themeVariables:
      primaryColor: "#ffffff"
      primaryTextColor: "#000000"
      primaryBorderColor: "#000000"
      lineColor: "#000000"
      tertiaryColor: "#f4f4f4"
  ---

  =========================
  CODE RULES
  =========================
  - When relevant, include runnable Python (Biopython) or R (Biostrings) examples. Keep examples minimal and tested.
  - Wrap code in fenced blocks and include brief comments explaining usage.
  - Check code for anything twice for any error weather it's logical or syntax.

  =========================
  STYLE & SAFETY
  =========================
  - Maintain academic tone. Prefer precise terminology.
  - Do not produce content that instructs on harmful biological manipulation. Refuse and provide safe high-level alternatives if user intent is dual-use or dangerous.
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
  let schema = "";
  let count = 5;

  if (type === 'quiz') schema = `[{"q": "Question", "options": ["A","B"], "ans": "A", "reason": "Explain"}]`;
  else if (type === 'flashcards') schema = `[{"front": "Term", "back": "Definition"}]`;
  else if (type === 'problems') {
    count = 3;
    schema = `[{"title": "Title", "desc": "Description", "input": "In", "expected": "Out", "level": "Easy", "hint": "Hint"}]`;
  } else if (type === 'tutorial') {
    count = 1;
    schema = `{"id": "AI", "title": "Title", "type": "Theory", "duration": "15m", "content": "Markdown content"}`;
  }

  const prompt = `Generate ${count} ${type} items about "${topic}" in strict JSON. Schema: ${schema}. ONLY output JSON.`;

  try {
    const url = `${DEFAULT_CONFIG.baseUrl}/models/${DEFAULT_CONFIG.model}:generateContent?key=${DEFAULT_CONFIG.apiKey}`;
    const response = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    let jsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (jsonStr) jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(jsonStr);
    return type === 'tutorial' ? [parsed] : parsed;

  } catch (e) {
    console.error("JSON Gen Error:", e);
    return null;
  }
};