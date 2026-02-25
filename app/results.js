import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, Easing, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../src/constants/colors';
import { UI_STRINGS } from '../src/constants/languages';
import { useApp } from '../src/context/AppContext';
import MetricCard from '../src/components/MetricCard';
import LanguageSelector from '../src/components/LanguageSelector';
import VoiceButton from '../src/components/VoiceButton';
import DoctorNoteCard from '../src/components/DoctorNoteCard';
import DisclaimerBanner from '../src/components/DisclaimerBanner';
import EmergencyButton from '../src/components/EmergencyButton';

export default function ResultsScreen() {
    const router = useRouter();
    const { language, displayResult, clearResults, isTranslating } = useApp();
    const strings = UI_STRINGS[language] || UI_STRINGS.en;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(20)).current;
    const [expandedGlossary, setExpandedGlossary] = useState(false);

    const result = displayResult;

    useEffect(() => {
        if (result) {
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            ]).start();
        }
    }, [result]);

    if (!result) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Report Analyzed</Text>
                <Text style={styles.emptySubtitle}>Upload a report to see your results here.</Text>
                <TouchableOpacity style={styles.goBtn} onPress={() => router.replace('/')} activeOpacity={0.7}>
                    <Text style={styles.goBtnText}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasCritical = result.metrics?.some(m => m.status === 'critical');
    const urgencyColor = { routine: Colors.statusGreen, attention_needed: Colors.statusYellow, urgent: Colors.statusRed }[result.urgencyLevel] || Colors.statusGreen;
    const urgencyBg = { routine: Colors.statusGreenBg, attention_needed: Colors.statusYellowBg, urgent: Colors.statusRedBg }[result.urgencyLevel] || Colors.statusGreenBg;
    const urgencyLabel = { routine: strings.routineStatus || 'Looking Good', attention_needed: strings.attentionStatus || 'Worth Discussing', urgent: strings.urgentStatus || 'Talk to Your Doctor' }[result.urgencyLevel] || 'Looking Good';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
                <LanguageSelector />

                {/* Translation Loading */}
                {isTranslating && (
                    <View style={styles.translatingCard}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.translatingText}>Translating to {language === 'as' ? 'অসমীয়া' : language}...</Text>
                    </View>
                )}

                {/* PII */}
                {result.piiFound?.length > 0 && (
                    <View style={[styles.piiBadge, Shadows.small]}>
                        <View style={styles.piiDot} />
                        <Text style={styles.piiText}>
                            {strings.privacyBadge || 'Privacy protected'} — {result.piiFound.length} {strings.personalDetails || 'personal details masked'}
                        </Text>
                    </View>
                )}

                {/* Status Banner */}
                <View style={[styles.statusBanner, { backgroundColor: urgencyBg, borderColor: urgencyColor }]}>
                    <View style={[styles.statusDot, { backgroundColor: urgencyColor }]} />
                    <Text style={[styles.statusLabel, { color: urgencyColor }]}>{urgencyLabel}</Text>
                    <Text style={[styles.statusType, { color: urgencyColor }]}>{result.documentType?.replace(/_/g, ' ')}</Text>
                </View>

                {hasCritical && <EmergencyButton language={language} />}

                {/* Summary */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{strings.summary || 'Health Summary'}</Text>
                        <VoiceButton text={result.summary} language={language} size="small" />
                    </View>
                    <View style={[styles.card, Shadows.card]}>
                        <Text style={styles.bodyText}>{result.summary}</Text>
                    </View>
                </View>

                {/* Metrics */}
                {result.metrics?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{strings.yourResults || 'Your Results'}</Text>
                        <View style={styles.metricsGap} />
                        {result.metrics.map((metric, i) => <MetricCard key={i} metric={metric} index={i} />)}
                    </View>
                )}

                {/* Health Story */}
                {result.healthStory && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{strings.whatThisMeans || 'What This Means'}</Text>
                            <VoiceButton text={result.healthStory} language={language} size="small" />
                        </View>
                        <View style={[styles.card, styles.storyCard, Shadows.card]}>
                            <Text style={styles.bodyText}>{result.healthStory}</Text>
                        </View>
                    </View>
                )}

                {/* Actions */}
                {result.actionItems?.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{strings.actionItems || 'Next Steps'}</Text>
                        <View style={[styles.card, Shadows.card]}>
                            {result.actionItems.map((item, i) => (
                                <View key={i} style={styles.actionRow}>
                                    <View style={styles.actionBullet} />
                                    <Text style={styles.bodyText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Doctor Questions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{strings.doctorQuestions || 'Questions for Your Doctor'}</Text>
                    <DoctorNoteCard questions={result.doctorQuestions} />
                </View>

                {/* Glossary */}
                {result.glossary?.length > 0 && (
                    <View style={styles.section}>
                        <TouchableOpacity style={styles.sectionHeader} onPress={() => setExpandedGlossary(!expandedGlossary)} activeOpacity={0.7}>
                            <Text style={styles.sectionTitle}>{strings.glossary || 'Medical Terms'}</Text>
                            <Text style={styles.expandIcon}>{expandedGlossary ? '−' : '+'}</Text>
                        </TouchableOpacity>
                        {expandedGlossary && (
                            <View style={[styles.card, Shadows.card]}>
                                {result.glossary.map((item, i) => (
                                    <View key={i} style={[styles.glossaryItem, i < result.glossary.length - 1 && styles.glossaryDivider]}>
                                        <Text style={styles.glossaryTerm}>{item.term}</Text>
                                        <Text style={styles.glossaryDef}>{item.definition}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Chat CTA */}
                <TouchableOpacity style={[styles.chatBtn, Shadows.card]} onPress={() => router.push('/chat')} activeOpacity={0.85}>
                    <View style={styles.chatDot} />
                    <View style={styles.chatContent}>
                        <Text style={styles.chatTitle}>{strings.askFollowUp || 'Ask About This Report'}</Text>
                        <Text style={styles.chatSub}>{strings.chatSubtext || 'Have a question? Ask in plain language.'}</Text>
                    </View>
                    <Text style={styles.chatArrow}>→</Text>
                </TouchableOpacity>

                <DisclaimerBanner language={language} />

                <TouchableOpacity style={styles.newBtn} onPress={() => { clearResults(); router.replace('/'); }} activeOpacity={0.7}>
                    <Text style={styles.newBtnText}>{strings.analyzeAnother || 'Analyze Another Report'}</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: 20, paddingBottom: 40 },
    emptyContainer: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
    emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 8 },
    emptySubtitle: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 24 },
    goBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    goBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },

    piiBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primarySoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
    piiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 8 },
    piiText: { color: Colors.primaryDark, fontSize: 12, fontWeight: '600' },

    translatingCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
    translatingText: { color: Colors.primaryDark, fontSize: 13, fontWeight: '600', marginLeft: 10 },

    statusBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1 },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    statusLabel: { fontSize: 16, fontWeight: '700', flex: 1 },
    statusType: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize', opacity: 0.7 },

    section: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1, letterSpacing: -0.2, marginBottom: 4 },
    metricsGap: { height: 4 },
    expandIcon: { color: Colors.textMuted, fontSize: 22, fontWeight: '300', paddingHorizontal: 4 },

    card: { backgroundColor: Colors.white, borderRadius: 14, padding: 18 },
    storyCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
    bodyText: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },

    actionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    actionBullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 8, marginRight: 12 },

    glossaryItem: { paddingVertical: 8 },
    glossaryDivider: { borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder },
    glossaryTerm: { color: Colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 3 },
    glossaryDef: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },

    chatBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: Colors.primaryGlow },
    chatDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginRight: 14 },
    chatContent: { flex: 1 },
    chatTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: 2 },
    chatSub: { color: Colors.textMuted, fontSize: 12 },
    chatArrow: { color: Colors.primary, fontSize: 20, fontWeight: '400' },

    newBtn: { alignItems: 'center', paddingVertical: 16, marginTop: 8 },
    newBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },
});
