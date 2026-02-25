import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    ActivityIndicator, Platform, Animated, Easing,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Shadows } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';
import { analyzeDocument, translateAnalysis, refreshBackendStatus, isApiKeyConfigured } from '../src/services/geminiService';

async function fileToBase64(uri) {
    if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split('base64,')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } else {
        return await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
    }
}

export default function UploadScreen() {
    const router = useRouter();
    const { setAnalysisResult, setReportContext, setIsAnalyzing, setTranslationCache } = useApp();
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [backendReady, setBackendReady] = useState(false);
    const [checking, setChecking] = useState(true);

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(slideUp, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();

        // Check backend availability
        refreshBackendStatus().then(ok => {
            setBackendReady(ok);
            setChecking(false);
        });
    }, []);

    const handleTakePhoto = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) { Alert.alert('Permission needed', 'Camera permission is required.'); return; }
            const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, base64: true });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                let base64Data = asset.base64 || await fileToBase64(asset.uri);
                setSelectedFile({ name: 'Camera Photo', type: 'image/jpeg', uri: asset.uri, base64: base64Data, size: asset.fileSize || 0 });
            }
        } catch (error) { console.error('Camera error:', error); }
    };

    const handleChooseFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                const mimeType = asset.mimeType || (asset.name?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
                let base64Data = null;
                try {
                    base64Data = await fileToBase64(asset.uri);
                } catch (e) {
                    const errMsg = 'Could not read file: ' + (e.message || 'unknown error');
                    if (typeof window !== 'undefined') window.alert(errMsg);
                    else Alert.alert('Read Error', errMsg);
                    return;
                }
                if (!base64Data) return;
                setSelectedFile({ name: asset.name || 'Selected file', type: mimeType, uri: asset.uri, base64: base64Data, size: asset.size || 0 });
            }
        } catch (error) { console.error('File picker error:', error); }
    };

    const handleAnalyze = async () => {
        if (!selectedFile?.base64) return;
        if (!backendReady) {
            const msg = 'Gemini API Key missing. Please check your .env.local file.';
            if (typeof window !== 'undefined') window.alert(msg);
            else Alert.alert('API Key Required', msg);
            return;
        }
        try {
            setLoading(true); setIsAnalyzing(true);
            router.push('/analyzing');
            const result = await analyzeDocument(selectedFile.base64, selectedFile.type);
            setAnalysisResult(result); setReportContext(JSON.stringify(result));

            // Fire Assamese translation in the background (non-blocking)
            translateAnalysis(result, 'as')
                .then(translated => {
                    console.log('[MediClear] Background Assamese translation complete');
                    setTranslationCache(prev => ({ ...prev, as: translated }));
                })
                .catch(err => {
                    console.warn('[MediClear] Background translation failed (will retry on demand):', err.message);
                });

            router.replace('/results');
        } catch (error) {
            setIsAnalyzing(false); setLoading(false);
            router.replace('/upload');
            setTimeout(() => {
                const msg = error.message || 'Please try again.';
                if (typeof window !== 'undefined') window.alert('Analysis Failed: ' + msg);
                else Alert.alert('Analysis Failed', msg);
            }, 500);
        } finally { setLoading(false); setIsAnalyzing(false); }
    };

    const formatSize = (b) => {
        if (!b) return '';
        if (b < 1024) return `${b} B`;
        if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
        return `${(b / 1048576).toFixed(1)} MB`;
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                <Text style={styles.title}>Upload your report</Text>
                <Text style={styles.subtitle}>Take a photo or select a file to begin analysis</Text>

                {/* Upload Options */}
                <View style={styles.uploadRow}>
                    <TouchableOpacity style={[styles.uploadCard, Shadows.card]} onPress={handleTakePhoto} activeOpacity={0.7}>
                        <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
                            <View style={styles.cameraIcon}>
                                <View style={styles.cameraDot} />
                            </View>
                        </View>
                        <Text style={styles.uploadLabel}>Camera</Text>
                        <Text style={styles.uploadHint}>Take a photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.uploadCard, Shadows.card]} onPress={handleChooseFile} activeOpacity={0.7}>
                        <View style={[styles.iconBox, { backgroundColor: Colors.primarySoft }]}>
                            <View style={styles.fileIcon}>
                                <View style={styles.fileFold} />
                            </View>
                        </View>
                        <Text style={styles.uploadLabel}>File</Text>
                        <Text style={styles.uploadHint}>PDF, JPG, PNG</Text>
                    </TouchableOpacity>
                </View>

                {/* Selected File */}
                {selectedFile && (
                    <View style={[styles.fileCard, Shadows.card]}>
                        <View style={styles.fileRow}>
                            <View style={styles.fileTypeBox}>
                                <Text style={styles.fileTypeText}>
                                    {selectedFile.type?.includes('pdf') ? 'PDF' : 'IMG'}
                                </Text>
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
                                <View style={styles.fileMeta}>
                                    {selectedFile.size > 0 && <Text style={styles.fileSize}>{formatSize(selectedFile.size)}</Text>}
                                    <View style={styles.readyBadge}>
                                        <View style={styles.readyDot} />
                                        <Text style={styles.readyText}>Ready</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedFile(null)} style={styles.removeBtn}>
                                <Text style={styles.removeX}>×</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.analyzeBtn, (loading || !backendReady) && styles.analyzeBtnOff]}
                            onPress={handleAnalyze} disabled={loading || !backendReady} activeOpacity={0.85}
                        >
                            {loading ? <ActivityIndicator color={Colors.white} /> :
                                <Text style={styles.analyzeBtnText}>Analyze Report</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Backend Status */}
                {checking ? (
                    <View style={styles.statusCard}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.statusText}>Checking API Configuration...</Text>
                    </View>
                ) : !backendReady ? (
                    <View style={styles.warnCard}>
                        <View style={styles.warnDot} />
                        <View style={styles.warnContent}>
                            <Text style={styles.warnTitle}>API Key Missing</Text>
                            <Text style={styles.warnText}>
                                Please configure EXPO_PUBLIC_GEMINI_API_KEY in .env.local
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.connectedCard}>
                        <View style={styles.connectedDot} />
                        <Text style={styles.connectedText}>Analysis Engine ready</Text>
                    </View>
                )}

                {/* Privacy */}
                <View style={styles.privacyCard}>
                    <View style={styles.privacyDot} />
                    <Text style={styles.privacyText}>
                        Your data is processed securely. Personal information is automatically masked.
                    </Text>
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Not a medical diagnosis. Consult your healthcare provider.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { flex: 1, padding: 20 },
    title: { color: Colors.textPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 4 },
    subtitle: { color: Colors.textSecondary, fontSize: 15, marginBottom: 24 },

    uploadRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    uploadCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 22, alignItems: 'center' },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    cameraIcon: { width: 20, height: 16, borderRadius: 3, borderWidth: 2, borderColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
    cameraDot: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: '#6366F1' },
    fileIcon: { width: 16, height: 20, borderWidth: 2, borderColor: Colors.primary, borderRadius: 2, position: 'relative' },
    fileFold: { position: 'absolute', top: -1, right: -1, width: 6, height: 6, backgroundColor: Colors.primarySoft, borderBottomLeftRadius: 2, borderLeftWidth: 1.5, borderBottomWidth: 1.5, borderColor: Colors.primary },
    uploadLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
    uploadHint: { color: Colors.textMuted, fontSize: 12 },

    fileCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1.5, borderColor: Colors.primary },
    fileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    fileTypeBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    fileTypeText: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    fileInfo: { flex: 1 },
    fileName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 4 },
    fileMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fileSize: { color: Colors.textMuted, fontSize: 12 },
    readyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.statusGreenBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    readyDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.statusGreen, marginRight: 4 },
    readyText: { color: Colors.statusGreenText, fontSize: 11, fontWeight: '600' },
    removeBtn: { padding: 8 },
    removeX: { color: Colors.textMuted, fontSize: 22, fontWeight: '300' },

    analyzeBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    analyzeBtnOff: { opacity: 0.5 },
    analyzeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

    statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 12, ...Shadows.small },
    statusText: { color: Colors.textMuted, fontSize: 13, marginLeft: 10 },

    warnCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(229, 161, 0, 0.06)', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(229, 161, 0, 0.15)' },
    warnDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusYellow, marginTop: 4, marginRight: 12 },
    warnContent: { flex: 1 },
    warnTitle: { color: '#8B6914', fontSize: 13, fontWeight: '700', marginBottom: 2 },
    warnText: { color: '#8B6914', fontSize: 12, lineHeight: 17, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

    connectedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.statusGreenBg, borderRadius: 12, padding: 14, marginBottom: 12 },
    connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.statusGreen, marginRight: 10 },
    connectedText: { color: Colors.statusGreenText, fontSize: 13, fontWeight: '600' },

    privacyCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.primaryMuted, borderRadius: 12, padding: 14 },
    privacyDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 4, marginRight: 10 },
    privacyText: { color: Colors.primaryDark, fontSize: 12, flex: 1, lineHeight: 17, opacity: 0.7 },

    footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder },
    footerText: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
});
