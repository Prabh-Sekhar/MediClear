import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Shadows } from '../constants/colors';

export default function DoctorNoteCard({ questions = [] }) {
    if (!questions || questions.length === 0) return null;

    return (
        <View style={[styles.container, Shadows.card]}>
            <View style={styles.header}>
                <Text style={styles.subtitle}>Bring these to your next appointment</Text>
            </View>

            <View style={styles.list}>
                {questions.map((question, index) => (
                    <View key={index} style={styles.row}>
                        <View style={styles.numBadge}>
                            <Text style={styles.num}>{index + 1}</Text>
                        </View>
                        <Text style={styles.questionText}>{question}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.tipBox}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>
                    Tip: Show this list to your doctor. It helps them understand what matters to you.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { backgroundColor: Colors.white, borderRadius: 16, padding: 18, marginVertical: 4 },
    header: { marginBottom: 14 },
    subtitle: { color: Colors.textMuted, fontSize: 13 },
    list: { gap: 12 },
    row: { flexDirection: 'row', alignItems: 'flex-start' },
    numBadge: {
        width: 24, height: 24, borderRadius: 8,
        backgroundColor: Colors.primarySoft, alignItems: 'center',
        justifyContent: 'center', marginRight: 12, marginTop: 1,
    },
    num: { color: Colors.primary, fontSize: 12, fontWeight: '800' },
    questionText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, flex: 1 },
    tipBox: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: 'rgba(229, 161, 0, 0.06)', borderRadius: 10,
        padding: 12, marginTop: 16,
    },
    tipDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.statusYellow, marginTop: 4, marginRight: 8 },
    tipText: { color: '#8B6914', fontSize: 12, flex: 1, lineHeight: 17 },
});
