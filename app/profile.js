import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, Easing, TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../src/constants/colors';
import { useAuth } from '../src/context/AuthContext';
import { useApp } from '../src/context/AppContext';
import { getRecentAnalyses, getAnalysisById } from '../src/services/dbClient';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, profile, signOut, updateProfile } = useAuth();
    const { setAnalysisResult, setReportContext } = useApp();

    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(profile?.full_name || '');
    const [saving, setSaving] = useState(false);

    const [reports, setReports] = useState([]);
    const [loadingReports, setLoadingReports] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeIn, {
            toValue: 1, duration: 500,
            easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }).start();
        loadReports();
    }, []);

    useEffect(() => {
        if (profile?.full_name) setName(profile.full_name);
    }, [profile]);

    const loadReports = async () => {
        try {
            const data = await getRecentAnalyses(50);
            setReports(data);
        } catch (err) {
            console.warn('Failed to load reports:', err);
        } finally {
            setLoadingReports(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
    }, []);

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        try {
            await updateProfile({ full_name: name.trim() });
            setEditing(false);
        } catch (err) {
            Alert.alert('Error', err.message || 'Failed to update name.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/login');
        } catch (err) {
            Alert.alert('Error', 'Failed to sign out.');
        }
    };

    const openReport = async (item) => {
        try {
            const full = await getAnalysisById(item.id);
            if (full?.full_result) {
                setAnalysisResult(full.full_result, full.full_result_as || null);
                setReportContext(JSON.stringify(full.full_result));
                router.push('/results');
            }
        } catch (err) {
            console.error('Error loading report:', err);
        }
    };

    const getInitials = () => {
        const n = profile?.full_name || user?.email || '?';
        return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 172800000) return 'Yesterday';
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getUrgencyColor = (level) => {
        const map = { routine: Colors.statusGreen, attention_needed: Colors.statusYellow, urgent: Colors.statusRed };
        return map[level] || Colors.statusGreen;
    };

    const getUrgencyBg = (level) => {
        const map = { routine: Colors.statusGreenBg, attention_needed: Colors.statusYellowBg, urgent: Colors.statusRedBg };
        return map[level] || Colors.statusGreenBg;
    };

    const getTypeLabel = (t) => (t || 'Report').replace(/_/g, ' ');

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
            <Animated.View style={{ opacity: fadeIn }}>

                {/* ── Profile Header ── */}
                <View style={[styles.headerCard, Shadows.medium]}>
                    <View style={styles.avatarRing}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials()}</Text>
                        </View>
                    </View>

                    {editing ? (
                        <View style={styles.editRow}>
                            <TextInput
                                style={styles.nameInput}
                                value={name}
                                onChangeText={setName}
                                autoFocus
                                placeholder="Your name"
                                placeholderTextColor={Colors.textMuted}
                                returnKeyType="done"
                                onSubmitEditing={handleSave}
                            />
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color={Colors.white} /> :
                                    <Text style={styles.saveBtnText}>Save</Text>}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditing(false); setName(profile?.full_name || ''); }}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setEditing(true)} activeOpacity={0.7} style={styles.nameBlock}>
                            <Text style={styles.userName}>{profile?.full_name || 'Set your name'}</Text>
                            <View style={styles.editBadge}>
                                <Text style={styles.editBadgeText}>Edit</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* ── Quick Actions ── */}
                <TouchableOpacity
                    style={[styles.analyzeBtn, Shadows.card]}
                    onPress={() => router.push('/upload')}
                    activeOpacity={0.85}
                >
                    <View style={styles.analyzeBtnIcon}>
                        <View style={{ position: 'absolute', width: 2.5, height: 14, backgroundColor: Colors.white, borderRadius: 1.25 }} />
                        <View style={{ position: 'absolute', width: 14, height: 2.5, backgroundColor: Colors.white, borderRadius: 1.25 }} />
                    </View>
                    <Text style={styles.analyzeBtnText}>Analyze New Report</Text>
                    <Text style={styles.analyzeBtnArrow}>+</Text>
                </TouchableOpacity>

                {/* ── My Reports ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>My Reports</Text>
                    <Text style={styles.sectionCount}>{reports.length}</Text>
                </View>

                {loadingReports ? (
                    <View style={[styles.emptyState, Shadows.card]}>
                        <ActivityIndicator size="small" color={Colors.primary} />
                        <Text style={styles.emptyText}>Loading reports...</Text>
                    </View>
                ) : reports.length === 0 ? (
                    <View style={[styles.emptyState, Shadows.card]}>
                        <View style={styles.emptyIcon}>
                            <View style={{ width: 20, height: 24, borderWidth: 2, borderColor: Colors.textMuted, borderRadius: 3, opacity: 0.4 }} />
                        </View>
                        <Text style={styles.emptyTitle}>No reports yet</Text>
                        <Text style={styles.emptyText}>Upload a medical report to see it here.</Text>
                    </View>
                ) : (
                    <View style={styles.reportsList}>
                        {reports.map((item, i) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.reportCard, Shadows.card]}
                                onPress={() => openReport(item)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.reportTop}>
                                    <View style={[styles.reportTypeBadge, { backgroundColor: getUrgencyBg(item.urgency_level) }]}>
                                        <View style={[styles.reportTypeDot, { backgroundColor: getUrgencyColor(item.urgency_level) }]} />
                                        <Text style={[styles.reportTypeText, { color: getUrgencyColor(item.urgency_level) }]}>
                                            {getTypeLabel(item.document_type)}
                                        </Text>
                                    </View>
                                    <Text style={styles.reportDate}>{formatDate(item.created_at)}</Text>
                                </View>
                                <Text style={styles.reportSummary} numberOfLines={2}>
                                    {item.summary || 'Tap to view full analysis'}
                                </Text>
                                <View style={styles.reportBottom}>
                                    <Text style={styles.reportMetrics}>
                                        {item.metrics?.length || 0} metrics analyzed
                                    </Text>
                                    <View style={styles.reportArrowCircle}>
                                        <Text style={styles.reportArrow}>+</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* ── About ── */}
                <View style={[styles.aboutCard, Shadows.card]}>
                    <Text style={styles.aboutTitle}>About MediClear</Text>
                    <Text style={styles.aboutText}>
                        AI-powered medical report interpreter. We help you understand your lab reports in plain, simple language.
                    </Text>
                    <View style={styles.aboutRow}>
                        <Text style={styles.aboutLabel}>Version</Text>
                        <Text style={styles.aboutValue}>1.0.0</Text>
                    </View>
                </View>

                {/* ── Sign Out ── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* ── Disclaimer ── */}
                <View style={styles.disclaimerCard}>
                    <View style={styles.disclaimerDot} />
                    <Text style={styles.disclaimerText}>
                        Not a medical diagnosis. Always consult your healthcare provider.
                    </Text>
                </View>

            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: 20, paddingTop: 24, paddingBottom: 40 },

    // ── Header Card ──
    headerCard: {
        backgroundColor: Colors.white,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarRing: {
        width: 88, height: 88, borderRadius: 44,
        borderWidth: 3, borderColor: Colors.primaryGlow,
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: Colors.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: Colors.white, fontSize: 26, fontWeight: '800', letterSpacing: 1 },
    nameBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    userName: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700', textAlign: 'center' },
    editBadge: {
        backgroundColor: Colors.primarySoft,
        paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6,
    },
    editBadgeText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
    userEmail: { color: Colors.textMuted, fontSize: 13, marginTop: 6 },

    editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    nameInput: {
        backgroundColor: Colors.background, borderRadius: 12, borderWidth: 1.5,
        borderColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10,
        color: Colors.textPrimary, fontSize: 16, minWidth: 180, textAlign: 'center',
    },
    saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    saveBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600' },
    cancelBtn: { paddingHorizontal: 12, paddingVertical: 10 },
    cancelBtnText: { color: Colors.textMuted, fontSize: 14, fontWeight: '500' },

    // ── Analyze Button ──
    analyzeBtn: {
        backgroundColor: Colors.primary,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 28,
    },
    analyzeBtnIcon: {
        width: 28, height: 28, borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 14,
    },
    analyzeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', flex: 1 },
    analyzeBtnArrow: { color: 'rgba(255,255,255,0.7)', fontSize: 22, fontWeight: '300' },

    // ── Section Header ──
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    sectionTitle: {
        color: Colors.textPrimary, fontSize: 18, fontWeight: '700', flex: 1,
    },
    sectionCount: {
        backgroundColor: Colors.primarySoft,
        color: Colors.primary,
        fontSize: 13, fontWeight: '700',
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 10,
        overflow: 'hidden',
    },

    // ── Empty State ──
    emptyState: {
        backgroundColor: Colors.white, borderRadius: 16,
        padding: 32, alignItems: 'center', marginBottom: 24,
    },
    emptyIcon: { marginBottom: 12 },
    emptyTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600', marginBottom: 4 },
    emptyText: { color: Colors.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' },

    // ── Reports List ──
    reportsList: { gap: 10, marginBottom: 24 },
    reportCard: {
        backgroundColor: Colors.white, borderRadius: 16, padding: 18,
    },
    reportTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
    },
    reportTypeBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
    },
    reportTypeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    reportTypeText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
    reportDate: { color: Colors.textMuted, fontSize: 12 },
    reportSummary: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 12 },
    reportBottom: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    reportMetrics: { color: Colors.textMuted, fontSize: 12, fontWeight: '500' },
    reportArrowCircle: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: Colors.primarySoft,
        alignItems: 'center', justifyContent: 'center',
    },
    reportArrow: { color: Colors.primary, fontSize: 16, fontWeight: '600', transform: [{ rotate: '45deg' }] },

    // ── About ──
    aboutCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginBottom: 16 },
    aboutTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
    aboutText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 14 },
    aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    aboutLabel: { color: Colors.textMuted, fontSize: 13 },
    aboutValue: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },

    // ── Logout ──
    logoutBtn: {
        backgroundColor: Colors.white, borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(231, 76, 60, 0.15)', marginBottom: 16,
    },
    logoutText: { color: Colors.statusRed, fontSize: 15, fontWeight: '700' },

    // ── Disclaimer ──
    disclaimerCard: {
        flexDirection: 'row', alignItems: 'flex-start',
        borderRadius: 12, padding: 14,
        backgroundColor: Colors.disclaimerBg,
        borderWidth: 1, borderColor: Colors.disclaimerBorder,
    },
    disclaimerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.statusRed, marginRight: 8, marginTop: 4, opacity: 0.5 },
    disclaimerText: { color: Colors.disclaimerText, fontSize: 11, flex: 1, lineHeight: 16, opacity: 0.7 },
});
