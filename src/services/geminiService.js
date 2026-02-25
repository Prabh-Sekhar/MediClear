/**
 * MediClear Gemini Service (Client-Side)
 * 
 * Bypasses the local Node backend to resolve Mobile Wi-Fi connectivity and port issues.
 * Uses the API Key stored securely in Expo environment variables.
 */

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';
const API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

// ── Prompts ─────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MediClear, a medical literacy assistant. Your goal is to help patients understand their medical reports in plain, simple language.

CRITICAL RULES:
1. Write for a 5th-grade reading level. Use short sentences.
2. Use a supportive, calm, reassuring tone — like a kind nurse explaining things.
3. NEVER diagnose conditions or recommend treatments.
4. NEVER say "You have [condition]" — instead say "This value may suggest..." or "This could indicate..."
5. Use everyday analogies: "Hemoglobin carries oxygen through your blood, like delivery trucks carrying packages to your cells."
6. For CRITICAL values: say ONLY "Please share this specific result with your doctor immediately." Do NOT explain further.
7. Always end your health story with: "Remember, this summary is for your understanding only. Please discuss these results with your healthcare provider."
8. When listing action items, focus on general wellness (hydration, rest, follow-up appointments) — NEVER prescribe medication or specific treatments.
9. Generate personalized "Questions for your Doctor" based on the abnormal values found.

You must respond ONLY with valid JSON in the following format:
{
  "summary": "A one-paragraph plain-language overview of the report (2-3 sentences max)",
  "documentType": "lab_report" | "discharge_summary" | "prescription",
  "urgencyLevel": "routine" | "attention_needed" | "urgent",
  "metrics": [
    {
      "name": "Human-readable test name",
      "value": "The patient's value with unit",
      "unit": "unit of measurement",
      "normalRange": "normal range as string",
      "status": "normal" | "slightly_high" | "slightly_low" | "high" | "low" | "critical",
      "explanation": "What this means for the patient in 1-2 simple sentences using analogies",
      "category": "blood" | "liver" | "kidney" | "heart" | "thyroid" | "vitamin" | "bone" | "sugar" | "infection" | "general"
    }
  ],
  "healthStory": "A warm, narrative paragraph (4-6 sentences) explaining what the overall report means for this person's daily life.",
  "actionItems": ["Clear, actionable next steps for the patient — max 5 items"],
  "doctorQuestions": ["Personalized questions the patient should ask their doctor — max 5"],
  "glossary": [
    {
      "term": "Medical term from the report",
      "definition": "Simple, jargon-free definition in 1 sentence"
    }
  ],
  "piiFound": ["List of PII types that were detected"]
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting, no code blocks, no extra text.`;

const CHAT_SYSTEM_PROMPT = `You are MediClear's follow-up assistant. The patient has already received their report analysis and has a follow-up question.

RULES:
1. Answer in 2-3 sentences maximum, using simple language (5th grade reading level).
2. NEVER diagnose or prescribe. If asked "Do I have [disease]?", say "I can't determine that — please discuss this with your doctor."
3. For lifestyle questions (diet, exercise), give GENERAL wellness advice only.
4. Always end with a gentle reminder to consult their doctor for specific medical advice.
5. Use a warm, supportive tone.
6. If the question is unrelated to the report, gently redirect: "I can only help with questions about your medical report."

The patient's report analysis context is provided below. Use it to give relevant, contextual answers.`;

const TRANSLATE_PROMPT = (targetLang) => `Translate the following medical report analysis COMPLETELY into ${targetLang}. 

RULES:
1. Translate EVERY SINGLE word, sentence, heading, label, action item, and question into ${targetLang}. Nothing should remain in English.
2. Keep only medical/scientific terms in their original English form in parentheses AFTER the translated term. For example: "ৰক্তহীনতা (Anemia)".
3. Maintain the exact same JSON structure — all keys stay in English, but ALL string values MUST be fully translated.
4. DO NOT translate these fields — they are programmatic codes and MUST stay exactly as-is in English:
   - "status" (keep values like "normal", "high", "low", "critical", "slightly_high", "slightly_low" UNCHANGED)
   - "urgencyLevel" (keep values like "routine", "attention_needed", "urgent" UNCHANGED)
   - "documentType" (keep values like "lab_report", "discharge_summary", "prescription" UNCHANGED)
5. DO translate all human-readable text fields: "summary", "healthStory", "explanation", "name", "value", "normalRange", "actionItems", "doctorQuestions", "glossary" terms and definitions, "piiFound".
6. Use simple, conversational, everyday ${targetLang} — avoid formal or literary language.
7. The tone should be warm, supportive, and easy to understand for a common person.
8. Do NOT leave any human-readable English text untranslated except medical terms in parentheses.

Return ONLY the translated JSON object, no markdown, no code blocks.`;

// ── Helper to execute Gemini requests ─────────────────
async function executeGeminiRequest(contents) {
    if (!API_KEY) throw new Error('Gemini API key is not configured in .env.local');

    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (!response.ok) {
        const msg = data.error?.message || `API error (${response.status})`;
        if (msg.includes('API_KEY_INVALID')) throw new Error('Invalid API key');
        throw new Error(msg);
    }

    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) throw new Error('Empty response from AI.');

    return responseText;
}

// ── Internal API Methods ────────────────────────────

/**
 * Check if the API Key is configured
 */
export async function checkBackendHealth() {
    return !!API_KEY;
}

export function isApiKeyConfigured() {
    return !!API_KEY;
}

export async function refreshBackendStatus() {
    return !!API_KEY;
}

/**
 * Analyze a medical document (PDF or image base64)
 */
export async function analyzeDocument(base64Data, mimeType = 'image/jpeg') {
    const contents = [
        {
            parts: [
                { text: SYSTEM_PROMPT + '\n\nAnalyze this medical document. First identify and note any PII (personal information) found. Then provide the full medical interpretation in the JSON format specified above.' },
                { inlineData: { mimeType, data: base64Data } }
            ]
        }
    ];

    const responseText = await executeGeminiRequest(contents);

    // Extract JSON block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('AI response was not in the expected format.');
    }

    return JSON.parse(jsonMatch[0]);
}

/**
 * Send a follow-up chat question about the report
 */
export async function sendChatMessage(question, reportContext) {
    const contents = [
        {
            parts: [
                { text: `${CHAT_SYSTEM_PROMPT}\n\nReport Context:\n${reportContext}\n\nPatient's Question: ${question}\n\nRespond in 2-3 sentences with a warm, supportive tone. End with a reminder to consult their doctor.` }
            ]
        }
    ];

    const responseText = await executeGeminiRequest(contents);
    return responseText;
}

/**
 * Translate analysis results to target language
 */
export async function translateAnalysis(analysisJson, targetLanguage) {
    const langNames = { as: 'Assamese (অসমীয়া)' };
    const langName = langNames[targetLanguage] || targetLanguage;

    const contents = [
        {
            parts: [
                { text: `${TRANSLATE_PROMPT(langName)}\n\nJSON to translate:\n${JSON.stringify(analysisJson)}` }
            ]
        }
    ];

    const responseText = await executeGeminiRequest(contents);

    // Extract JSON block
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Translation result was not in the expected format.');
    }

    return JSON.parse(jsonMatch[0]);
}
