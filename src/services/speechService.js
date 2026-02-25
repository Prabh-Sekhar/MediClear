import * as Speech from 'expo-speech';

/**
 * Speak text using Expo Speech API
 * Supports English and Assamese (with Bengali fallback for TTS)
 */
export async function speakText(text, languageCode = 'en') {
    // Map our language codes to Speech API language codes
    const langMap = {
        en: 'en-US',
        as: 'as-IN', // May not be available on all devices
    };

    const speechLang = langMap[languageCode] || 'en-US';

    // Stop any current speech first
    await Speech.stop();

    // Check available voices to find best match for Assamese
    let bestLang = speechLang;
    if (languageCode === 'as') {
        try {
            const voices = await Speech.getAvailableVoicesAsync();
            const hasAssamese = voices.some(v => v.language?.startsWith('as'));
            if (!hasAssamese) {
                // Bengali (bn-IN) is the closest language to Assamese for TTS
                const hasBengali = voices.some(v => v.language?.startsWith('bn'));
                if (hasBengali) {
                    bestLang = 'bn-IN';
                    console.log('[MediClear] Using Bengali TTS as Assamese substitute');
                } else {
                    // Fall back to Hindi which can also read Devanagari-adjacent scripts
                    const hasHindi = voices.some(v => v.language?.startsWith('hi'));
                    if (hasHindi) {
                        bestLang = 'hi-IN';
                        console.log('[MediClear] Using Hindi TTS as Assamese substitute');
                    } else {
                        bestLang = 'en-US';
                        console.log('[MediClear] No suitable Indian language TTS, falling back to English');
                    }
                }
            }
        } catch (err) {
            console.warn('[MediClear] Could not check available voices:', err);
        }
    }

    return new Promise((resolve, reject) => {
        Speech.speak(text, {
            language: bestLang,
            rate: 0.85, // Slightly slower for clarity
            pitch: 1.0,
            onDone: resolve,
            onError: (error) => {
                // If preferred language fails, try Bengali, then English
                if (bestLang !== 'en-US') {
                    console.log(`[MediClear] ${bestLang} TTS failed, falling back to English`);
                    Speech.speak(text, {
                        language: 'en-US',
                        rate: 0.85,
                        pitch: 1.0,
                        onDone: resolve,
                        onError: reject,
                    });
                } else {
                    reject(error);
                }
            },
        });
    });
}

/**
 * Stop current speech
 */
export async function stopSpeaking() {
    await Speech.stop();
}

/**
 * Check if speech is currently playing
 */
export async function isSpeaking() {
    return await Speech.isSpeakingAsync();
}
