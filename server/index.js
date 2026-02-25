require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Gemini Client ──────────────────────────────────────────
const API_KEY = process.env.GEMINI_API_KEY || '';
const MODEL = 'gemini-2.5-flash';

let ai = null;
function getClient() {
    if (!ai && API_KEY) {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
}

// ── Prompts (same as frontend) ─────────────────────────────
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
1. Translate EVERY SINGLE word, sentence, heading, label, status text, action item, and question into ${targetLang}. Nothing should remain in English.
2. Keep only medical/scientific terms in their original English form in parentheses AFTER the translated term.
3. Maintain the exact same JSON structure — all keys stay in English, but ALL string values MUST be fully translated.
4. Use simple, conversational, everyday ${targetLang}.
5. The tone should be warm and supportive.

Return ONLY the translated JSON object, no markdown, no code blocks.`;

// ── API Routes ─────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        apiKeyConfigured: !!API_KEY,
        model: MODEL,
        timestamp: new Date().toISOString(),
    });
});

// POST /api/analyze — analyze a medical document
app.post('/api/analyze', async (req, res) => {
    const { base64Data, mimeType = 'image/jpeg' } = req.body;

    if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is required' });
    }

    const client = getClient();
    if (!client) {
        return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    try {
        console.log(`[MediClear API] Analyzing document — MIME: ${mimeType}, size: ${base64Data.length} chars`);

        const response = await client.models.generateContent({
            model: MODEL,
            contents: [
                {
                    parts: [
                        {
                            text: SYSTEM_PROMPT + '\n\nAnalyze this medical document. First identify and note any PII (personal information) found. Then provide the full medical interpretation in the JSON format specified above.'
                        },
                        {
                            inlineData: { mimeType, data: base64Data }
                        }
                    ]
                }
            ],
        });

        const responseText = response.text;
        if (!responseText) {
            return res.status(500).json({ error: 'Empty response from AI. The document may be unreadable.' });
        }

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('[MediClear API] No JSON found in response:', responseText.substring(0, 500));
            return res.status(500).json({ error: 'AI response was not in the expected format.' });
        }

        const analysis = JSON.parse(jsonMatch[0]);
        console.log(`[MediClear API] Analysis complete: ${analysis.documentType}, ${analysis.metrics?.length || 0} metrics`);
        res.json(analysis);
    } catch (error) {
        console.error('[MediClear API] Analysis error:', error.message);
        const status = error.message?.includes('429') ? 429 : 500;
        res.status(status).json({ error: mapError(error) });
    }
});

// POST /api/chat — follow-up chat about the report
app.post('/api/chat', async (req, res) => {
    const { question, reportContext } = req.body;

    if (!question) {
        return res.status(400).json({ error: 'question is required' });
    }

    const client = getClient();
    if (!client) {
        return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    try {
        console.log(`[MediClear API] Chat question: "${question.substring(0, 80)}..."`);

        const response = await client.models.generateContent({
            model: MODEL,
            contents: `${CHAT_SYSTEM_PROMPT}\n\nReport Context:\n${reportContext}\n\nPatient's Question: ${question}\n\nRespond in 2-3 sentences with a warm, supportive tone. End with a reminder to consult their doctor.`,
        });

        res.json({ response: response.text });
    } catch (error) {
        console.error('[MediClear API] Chat error:', error.message);
        res.status(500).json({ error: mapError(error) });
    }
});

// POST /api/translate — translate analysis to target language
app.post('/api/translate', async (req, res) => {
    const { analysisJson, targetLanguage } = req.body;

    if (!analysisJson || !targetLanguage) {
        return res.status(400).json({ error: 'analysisJson and targetLanguage are required' });
    }

    const client = getClient();
    if (!client) {
        return res.status(500).json({ error: 'Gemini API key not configured on server.' });
    }

    const langNames = { as: 'Assamese (অসমীয়া)' };
    const langName = langNames[targetLanguage] || targetLanguage;

    try {
        console.log(`[MediClear API] Translating to ${langName}`);

        const response = await client.models.generateContent({
            model: MODEL,
            contents: `${TRANSLATE_PROMPT(langName)}\n\nJSON to translate:\n${JSON.stringify(analysisJson)}`,
        });

        const responseText = response.text;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return res.status(500).json({ error: 'Translation result was not in the expected format.' });
        }

        res.json(JSON.parse(jsonMatch[0]));
    } catch (error) {
        console.error('[MediClear API] Translation error:', error.message);
        res.status(500).json({ error: mapError(error) });
    }
});

// ── Error Mapper ───────────────────────────────────────────
function mapError(error) {
    const msg = error.message || '';
    if (msg.includes('API_KEY_INVALID') || msg.includes('401')) return 'Invalid API key. Check server .env file.';
    if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) return 'Model requires billing. Check API access.';
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) return 'Rate limit reached. Wait a moment and try again.';
    if (msg.includes('not found') || msg.includes('404')) return 'Model not available. Check API access.';
    return msg || 'Something went wrong. Please try again.';
}

// ── Start Server ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  ┌─────────────────────────────────────────┐`);
    console.log(`  │  MediClear API Server                   │`);
    console.log(`  │  http://localhost:${PORT}                  │`);
    console.log(`  │  API Key: ${API_KEY ? '✓ configured' : '✗ missing'}                  │`);
    console.log(`  │  Model: ${MODEL}                 │`);
    console.log(`  └─────────────────────────────────────────┘\n`);
});
