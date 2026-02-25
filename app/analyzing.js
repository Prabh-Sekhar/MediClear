import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';
import ScanAnimation from '../src/components/ScanAnimation';

export default function AnalyzingScreen() {
    const router = useRouter();
    const { language, isAnalyzing, analysisResult } = useApp();
    const [step, setStep] = useState(0);

    // Auto-advance steps
    useEffect(() => {
        const interval = setInterval(() => {
            setStep(prev => {
                if (prev < 3) return prev + 1;
                return prev;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Navigate to results when analysis is complete
    useEffect(() => {
        if (analysisResult && !isAnalyzing) {
            const timer = setTimeout(() => {
                router.replace('/results');
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [analysisResult, isAnalyzing]);

    return (
        <View style={styles.container}>
            <ScanAnimation language={language} step={step} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
