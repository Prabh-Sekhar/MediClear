import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export default function DisclaimerBanner({ language = 'en', compact = false }) {
    const disclaimers = {
        en: 'This is not a medical diagnosis. Always consult your healthcare provider for clinical decisions.',
        as: 'এয়া চিকিৎসা ৰোগ নিৰ্ণয় নহয়। ক্লিনিকেল সিদ্ধান্তৰ বাবে সদায় আপোনাৰ স্বাস্থ্যসেৱা প্ৰদানকাৰীৰ সৈতে পৰামৰ্শ কৰক।',
        hi: 'यह चिकित्सा निदान नहीं है। नैदानिक निर्णयों के लिए हमेशा अपने स्वास्थ्य सेवा प्रदाता से परामर्श करें।',
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactDot} />
                <Text style={styles.compactText}>{disclaimers[language] || disclaimers.en}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View style={styles.dot} />
                <Text style={styles.title}>Medical Disclaimer</Text>
            </View>
            <Text style={styles.text}>{disclaimers[language] || disclaimers.en}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.disclaimerBg, borderWidth: 1,
        borderColor: Colors.disclaimerBorder, borderRadius: 12,
        padding: 14, marginVertical: 8,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.statusRed, marginRight: 8, opacity: 0.6 },
    title: { color: Colors.disclaimerText, fontSize: 13, fontWeight: '700' },
    text: { color: Colors.disclaimerText, fontSize: 12, lineHeight: 18, opacity: 0.8 },
    compactContainer: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: Colors.disclaimerBg, borderRadius: 8,
        paddingHorizontal: 10, paddingVertical: 6, marginVertical: 4,
    },
    compactDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.statusRed, marginRight: 6, opacity: 0.5 },
    compactText: { color: Colors.disclaimerText, fontSize: 10, flex: 1, lineHeight: 14 },
});
