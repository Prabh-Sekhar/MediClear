import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../constants/colors';
import { LANGUAGES } from '../constants/languages';
import { useApp } from '../context/AppContext';
import { translateAnalysis } from '../services/geminiService';

export default function LanguageSelector() {
    const { language, setLanguage, analysisResult, setTranslatedResult, setIsTranslating, translationCache, setTranslationCache } = useApp();

    const handleLanguageChange = async (langCode) => {
        if (langCode === language) return;
        setLanguage(langCode);

        if (langCode === 'en') {
            // Reset to original English results
            setTranslatedResult(null);
            return;
        }

        // Check cache first — avoid re-translating
        if (translationCache[langCode]) {
            console.log('[MediClear] Using cached translation for', langCode);
            setTranslatedResult(translationCache[langCode]);
            return;
        }

        // Translate the analysis to Assamese using Gemini
        if (analysisResult) {
            try {
                setIsTranslating(true);
                console.log('[MediClear] Starting translation to', langCode);
                const translated = await translateAnalysis(analysisResult, langCode);
                console.log('[MediClear] Translation successful, keys:', Object.keys(translated));
                setTranslatedResult(translated);
                // Save to cache
                setTranslationCache(prev => ({ ...prev, [langCode]: translated }));
            } catch (err) {
                console.error('[MediClear] Translation failed:', err);
                Alert.alert('Translation Error', 'Could not translate: ' + (err.message || 'Unknown error'));
                setTranslatedResult(null);
            } finally {
                setIsTranslating(false);
            }
        } else {
            console.warn('[MediClear] No analysisResult available for translation');
        }
    };

    return (
        <View style={styles.container}>
            {Object.values(LANGUAGES).map((lang) => (
                <TouchableOpacity
                    key={lang.code}
                    style={[
                        styles.pill,
                        language === lang.code && styles.pillActive,
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                    activeOpacity={0.7}
                >
                    <View style={[
                        styles.labelIcon,
                        language === lang.code && styles.labelIconActive,
                    ]}>
                        <Text style={[
                            styles.labelIconText,
                            language === lang.code && styles.labelIconTextActive,
                        ]}>{lang.label}</Text>
                    </View>
                    <Text
                        style={[
                            styles.label,
                            language === lang.code && styles.labelActive,
                        ]}
                    >
                        {lang.nativeName}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    pillActive: {
        backgroundColor: Colors.primaryGlow,
        borderColor: Colors.primary,
    },
    labelIcon: {
        width: 22,
        height: 22,
        borderRadius: 6,
        backgroundColor: 'rgba(0,0,0,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    labelIconActive: {
        backgroundColor: Colors.primary,
    },
    labelIconText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textMuted,
    },
    labelIconTextActive: {
        color: Colors.white,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    labelActive: {
        color: Colors.primaryLight,
        fontWeight: '700',
    },
});
