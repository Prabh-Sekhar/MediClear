/**
 * Bhashini API Service — Indian Government Translation & TTS
 * 
 * Note: Bhashini requires API key registration at https://bhashini.gov.in/
 * For hackathon demo, this falls back to Gemini translation if unavailable.
 */

const BHASHINI_API_KEY = process.env.EXPO_PUBLIC_BHASHINI_API_KEY || '';
const BHASHINI_USER_ID = process.env.EXPO_PUBLIC_BHASHINI_USER_ID || '';
const BHASHINI_PIPELINE_URL = 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';

/**
 * Check if Bhashini API is configured
 */
export function isBhashiniConfigured() {
    return !!(BHASHINI_API_KEY && BHASHINI_USER_ID);
}

/**
 * Translate text using Bhashini API
 * Falls back to null if not configured (caller should use Gemini fallback)
 */
export async function translateWithBhashini(text, sourceLang = 'en', targetLang = 'as') {
    if (!isBhashiniConfigured()) {
        return null; // Caller will fall back to Gemini
    }

    try {
        const response = await fetch(BHASHINI_PIPELINE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': BHASHINI_API_KEY,
                'userID': BHASHINI_USER_ID,
            },
            body: JSON.stringify({
                pipelineTasks: [
                    {
                        taskType: 'translation',
                        config: {
                            language: {
                                sourceLanguage: sourceLang,
                                targetLanguage: targetLang,
                            },
                        },
                    },
                ],
                inputData: {
                    input: [{ source: text }],
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Bhashini API error: ${response.status}`);
        }

        const data = await response.json();
        return data?.pipelineResponse?.[0]?.output?.[0]?.target || null;
    } catch (error) {
        console.error('Bhashini translation error:', error);
        return null; // Fall back to Gemini
    }
}

/**
 * Get TTS audio from Bhashini (if available)
 * Returns base64 audio data or null
 */
export async function ttsWithBhashini(text, language = 'as') {
    if (!isBhashiniConfigured()) {
        return null;
    }

    try {
        const response = await fetch(BHASHINI_PIPELINE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': BHASHINI_API_KEY,
                'userID': BHASHINI_USER_ID,
            },
            body: JSON.stringify({
                pipelineTasks: [
                    {
                        taskType: 'tts',
                        config: {
                            language: {
                                sourceLanguage: language,
                            },
                            gender: 'female',
                        },
                    },
                ],
                inputData: {
                    input: [{ source: text }],
                },
            }),
        });

        if (!response.ok) {
            throw new Error(`Bhashini TTS error: ${response.status}`);
        }

        const data = await response.json();
        return data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent || null;
    } catch (error) {
        console.error('Bhashini TTS error:', error);
        return null;
    }
}
