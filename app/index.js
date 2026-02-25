import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated,
    Easing, ScrollView, Dimensions, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../src/constants/colors';
import { useApp } from '../src/context/AppContext';
import { useAuth } from '../src/context/AuthContext';
import { getRecentAnalyses, getAnalysisById } from '../src/services/dbClient';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const router = useRouter();
    const { language, setAnalysisResult, setReportContext } = useApp();
    const { user, profile } = useAuth();
    const userInitial = (profile?.full_name || user?.email || '?')[0].toUpperCase();
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(120, [
            Animated.parallel([
                Animated.timing(fadeIn, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]),
            Animated.timing(cardAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();

        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getRecentAnalyses(10);
            setHistory(data);
        } catch (err) {
            console.warn('Failed to load history:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    }, []);

    const openHistoryItem = async (item) => {
        try {
            const full = await getAnalysisById(item.id);
            if (full?.full_result) {
                setAnalysisResult(full.full_result, full.full_result_as || null);
                setReportContext(JSON.stringify(full.full_result));
                router.push('/results');
            }
        } catch (err) {
            console.error('Error loading analysis:', err);
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getUrgencyColor = (level) => {
        const map = { routine: Colors.statusGreen, attention_needed: Colors.statusYellow, urgent: Colors.statusRed };
        return map[level] || Colors.statusGreen;
    };

    const makeSlide = (anim) => ({
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                    <View style={styles.brandRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={styles.logoMark}>
                                <View style={styles.logoCross} />
                                <View style={styles.logoCrossH} />
                            </View>
                            <Text style={styles.brandName}>MediClear</Text>
                        </View>
                        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')} activeOpacity={0.7}>
                            <Text style={styles.profileInitial}>{userInitial}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Hero */}
                <Animated.View style={[styles.heroCard, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                    <Text style={styles.heroTitle}>
                        Understand your{'\n'}medical reports
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Upload any lab report or prescription and get instant, clear explanations in plain language.
                    </Text>
                    <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/upload')} activeOpacity={0.85}>
                        <Text style={styles.ctaText}>Upload Report</Text>
                        <Text style={styles.ctaArrow}>→</Text>
                    </TouchableOpacity>
                    <Text style={styles.ctaHint}>PDF, JPG, PNG supported</Text>
                </Animated.View>

                {/* Recent History */}
                <Animated.View style={makeSlide(cardAnim)}>
                    <Text style={styles.sectionLabel}>Recent Reports</Text>

                    {loadingHistory ? (
                        <View style={[styles.emptyCard, Shadows.card]}>
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.emptyText}>Loading history...</Text>
                        </View>
                    ) : history.length === 0 ? (
                        <View style={[styles.emptyCard, Shadows.card]}>
                            <Text style={styles.emptyTitle}>No reports yet</Text>
                            <Text style={styles.emptyText}>
                                Your analyzed reports will appear here.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.historyList}>
                            {history.map((item, i) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.historyCard, Shadows.card]}
                                    onPress={() => openHistoryItem(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.historyTop}>
                                        <View style={styles.historyMeta}>
                                            <Text style={styles.historyType}>
                                                {(item.document_type || 'Report').replace(/_/g, ' ')}
                                            </Text>
                                            <View style={[styles.urgencyDot, { backgroundColor: getUrgencyColor(item.urgency_level) }]} />
                                        </View>
                                        <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                                    </View>
                                    <Text style={styles.historySummary} numberOfLines={2}>
                                        {item.summary || 'View full analysis'}
                                    </Text>
                                    <View style={styles.historyFooter}>
                                        <Text style={styles.historyMetrics}>
                                            {item.metrics?.length || 0} metrics
                                        </Text>
                                        <Text style={styles.historyArrow}>→</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </Animated.View>

                {/* Features */}
                <Animated.View style={makeSlide(cardAnim)}>
                    <Text style={styles.sectionLabel}>Features</Text>
                    <View style={styles.featureRow}>
                        <View style={[styles.featureCard, Shadows.card]}>
                            <View style={[styles.featureIconBox, { backgroundColor: Colors.primarySoft }]}>
                                <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ position: 'absolute', width: 2.5, height: 14, backgroundColor: Colors.primary, borderRadius: 1.25 }} />
                                    <View style={{ position: 'absolute', width: 14, height: 2.5, backgroundColor: Colors.primary, borderRadius: 1.25 }} />
                                </View>
                            </View>
                            <Text style={styles.featureTitle}>AI Analysis</Text>
                            <Text style={styles.featureDesc}>Powered by Gemini</Text>
                        </View>
                        <View style={[styles.featureCard, Shadows.card]}>
                            <View style={[styles.featureIconBox, { backgroundColor: '#EEF2FF' }]}>
                                <View style={{ width: 16, height: 18, borderRadius: 3, borderWidth: 2, borderColor: '#6366F1', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }} />
                            </View>
                            <Text style={styles.featureTitle}>Privacy First</Text>
                            <Text style={styles.featureDesc}>Auto-masked PII</Text>
                        </View>
                    </View>
                    <View style={styles.featureRow}>
                        <View style={[styles.featureCard, Shadows.card]}>
                            <View style={[styles.featureIconBox, { backgroundColor: '#FEF3E2' }]}>
                                <View style={{ flexDirection: 'row', gap: 3, alignItems: 'flex-end' }}>
                                    <View style={{ width: 4, height: 10, backgroundColor: '#E5A100', borderRadius: 2 }} />
                                    <View style={{ width: 4, height: 16, backgroundColor: '#E5A100', borderRadius: 2 }} />
                                    <View style={{ width: 4, height: 12, backgroundColor: '#E5A100', borderRadius: 2 }} />
                                </View>
                            </View>
                            <Text style={styles.featureTitle}>Visual Metrics</Text>
                            <Text style={styles.featureDesc}>Color-coded gauges</Text>
                        </View>
                        <View style={[styles.featureCard, Shadows.card]}>
                            <View style={[styles.featureIconBox, { backgroundColor: '#F0FDF4' }]}>
                                <Text style={{ color: Colors.primary, fontSize: 18, fontWeight: '700' }}>अ</Text>
                            </View>
                            <Text style={styles.featureTitle}>Multilingual</Text>
                            <Text style={styles.featureDesc}>EN, AS</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <View style={styles.disclaimerDot} />
                    <Text style={styles.disclaimerText}>
                        Not a medical diagnosis. Consult your healthcare provider.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scrollContent: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },

    header: { marginBottom: 24 },
    brandRow: { flexDirection: 'row', alignItems: 'center' },
    logoMark: {
        width: 32, height: 32, borderRadius: 10,
        backgroundColor: Colors.primary, alignItems: 'center',
        justifyContent: 'center', marginRight: 10,
    },
    logoCross: { position: 'absolute', width: 2.5, height: 14, backgroundColor: Colors.white, borderRadius: 1.25 },
    logoCrossH: { position: 'absolute', width: 14, height: 2.5, backgroundColor: Colors.white, borderRadius: 1.25 },
    brandName: { color: Colors.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
    profileBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
    profileInitial: { color: Colors.white, fontSize: 15, fontWeight: '700' },

    heroCard: { backgroundColor: Colors.white, borderRadius: 20, padding: 28, marginBottom: 28, ...Shadows.medium },
    heroTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', lineHeight: 36, letterSpacing: -0.5, marginBottom: 10 },
    heroSubtitle: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 24 },
    ctaButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    ctaText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
    ctaArrow: { color: Colors.white, fontSize: 18, marginLeft: 8, fontWeight: '300' },
    ctaHint: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },

    sectionLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 14, marginTop: 4 },

    emptyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
    emptyTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
    emptyText: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },

    historyList: { gap: 10, marginBottom: 24 },
    historyCard: { backgroundColor: Colors.white, borderRadius: 14, padding: 16 },
    historyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
    historyMeta: { flexDirection: 'row', alignItems: 'center' },
    historyType: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', textTransform: 'capitalize', marginRight: 8 },
    urgencyDot: { width: 8, height: 8, borderRadius: 4 },
    historyDate: { color: Colors.textMuted, fontSize: 12 },
    historySummary: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 10 },
    historyFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    historyMetrics: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
    historyArrow: { color: Colors.primary, fontSize: 16, fontWeight: '600' },

    featureRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    featureCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 18 },
    featureIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    featureTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 3 },
    featureDesc: { color: Colors.textMuted, fontSize: 12, lineHeight: 17 },

    disclaimer: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.disclaimerBg, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.disclaimerBorder, marginTop: 12 },
    disclaimerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusRed, marginTop: 4, marginRight: 10, opacity: 0.6 },
    disclaimerText: { color: Colors.disclaimerText, fontSize: 12, lineHeight: 17, flex: 1, opacity: 0.8 },
});
