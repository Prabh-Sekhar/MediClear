import React, { createContext, useContext, useState, useCallback } from 'react';
import { saveAnalysis } from '../services/dbClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [language, setLanguage] = useState('en');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [translatedResult, setTranslatedResult] = useState(null);
    const [translationCache, setTranslationCache] = useState({}); // { 'as': translatedJSON, ... }
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [analyzeStep, setAnalyzeStep] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);
    const [reportContext, setReportContext] = useState('');

    // Save analysis to Firestore and update local state
    const saveAndSetAnalysis = useCallback(async (result) => {
        setAnalysisResult(result);
        setTranslatedResult(null);
        setTranslationCache({}); // Clear cache for new analysis
        setLanguage('en');
        setChatMessages([]);
        setReportContext(JSON.stringify(result));

        // Save to Firestore in background (non-blocking)
        saveAnalysis(result).catch(err => {
            console.warn('[MediClear] Background save failed:', err);
        });
    }, []);

    const clearResults = useCallback(() => {
        setAnalysisResult(null);
        setTranslatedResult(null);
        setTranslationCache({});
        setChatMessages([]);
        setReportContext('');
        setAnalyzeStep(0);
    }, []);

    const addChatMessage = useCallback((message) => {
        setChatMessages(prev => [...prev, message]);
    }, []);

    const displayResult = translatedResult || analysisResult;

    const value = {
        language,
        setLanguage,
        analysisResult,
        setAnalysisResult: saveAndSetAnalysis,
        translatedResult,
        setTranslatedResult,
        displayResult,
        isAnalyzing,
        setIsAnalyzing,
        isTranslating,
        setIsTranslating,
        analyzeStep,
        setAnalyzeStep,
        chatMessages,
        setChatMessages,
        addChatMessage,
        reportContext,
        setReportContext,
        clearResults,
        translationCache,
        setTranslationCache,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
