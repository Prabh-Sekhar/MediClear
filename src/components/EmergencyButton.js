import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../constants/colors';

export default function EmergencyButton({ language = 'en' }) {
    const labels = {
        en: 'Contact Your Doctor Immediately',
        as: 'এতিয়াই চিকিৎসকৰ সৈতে যোগাযোগ কৰক',
        hi: 'तुरंत अपने डॉक्टर से संपर्क करें',
    };
    const sublabels = {
        en: 'A critical value was found. Please share this result with your doctor right away.',
        as: 'এটা জটিল মূল্য পোৱা গৈছে। অনুগ্ৰহ কৰি এই ফলাফল তৎক্ষণাত আপোনাৰ চিকিৎসকক দেখুৱাওক।',
        hi: 'एक गंभीर मान पाया गया। कृपया यह परिणाम तुरंत अपने डॉक्टर को दिखाएं।',
    };

    return (
        <TouchableOpacity style={styles.container} onPress={() => Linking.openURL('tel:')} activeOpacity={0.8}>
            <View style={styles.iconBox}>
                <View style={styles.excl}>
                    <View style={styles.exclBar} />
                    <View style={styles.exclDot} />
                </View>
            </View>
            <View style={styles.textBox}>
                <Text style={styles.title}>{labels[language] || labels.en}</Text>
                <Text style={styles.subtitle}>{sublabels[language] || sublabels.en}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.statusRedBg, borderWidth: 1.5,
        borderColor: Colors.statusRed, borderRadius: 16,
        padding: 16, flexDirection: 'row', alignItems: 'center',
        marginVertical: 12,
    },
    iconBox: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: 'rgba(231, 76, 60, 0.12)', alignItems: 'center',
        justifyContent: 'center', marginRight: 14,
    },
    excl: { alignItems: 'center' },
    exclBar: { width: 3, height: 14, backgroundColor: Colors.statusRed, borderRadius: 1.5, marginBottom: 3 },
    exclDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.statusRed },
    textBox: { flex: 1 },
    title: { color: Colors.statusRed, fontSize: 14, fontWeight: '700', marginBottom: 2 },
    subtitle: { color: 'rgba(231, 76, 60, 0.75)', fontSize: 12, lineHeight: 16 },
    arrow: { color: Colors.statusRed, fontSize: 20, fontWeight: '400', marginLeft: 8 },
});
