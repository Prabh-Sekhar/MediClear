import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { UI_STRINGS } from '../constants/languages';

export default function ScanAnimation({ language = 'en', step = 0 }) {
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const strings = UI_STRINGS[language] || UI_STRINGS.en;
    const steps = strings.analyzingSteps || UI_STRINGS.en.analyzingSteps;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotateAnim, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true })
        ).start();

        Animated.timing(fadeAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, []);

    const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    const scale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] });
    const glowOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.animationBox}>
                <Animated.View style={[styles.glow, { opacity: glowOpacity, transform: [{ scale }] }]} />
                <Animated.View style={[styles.ring, { transform: [{ rotate }] }]}>
                    <Svg width={120} height={120} viewBox="0 0 120 120">
                        <Circle cx={60} cy={60} r={50} stroke={Colors.primary} strokeWidth={2}
                            fill="none" strokeDasharray="20 15" opacity={0.3} />
                    </Svg>
                </Animated.View>
                <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
                    <View style={styles.crossV} />
                    <View style={styles.crossH} />
                </Animated.View>
            </View>

            <Text style={styles.title}>{strings.analyzing || 'Analyzing Your Report'}</Text>

            <View style={styles.stepsBox}>
                {steps.map((text, i) => (
                    <View key={i} style={styles.stepRow}>
                        <View style={[
                            styles.dot,
                            i < step && styles.dotDone,
                            i === step && styles.dotActive,
                        ]} />
                        <Text style={[
                            styles.stepText,
                            i < step && styles.textDone,
                            i === step && styles.textActive,
                            i > step && styles.textPending,
                        ]}>{text}</Text>
                    </View>
                ))}
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    animationBox: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
    glow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: Colors.primaryGlow },
    ring: { position: 'absolute', width: 120, height: 120 },
    center: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: Colors.primary,
        ...({ shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 }),
    },
    crossV: { position: 'absolute', width: 3, height: 20, backgroundColor: Colors.primary, borderRadius: 1.5 },
    crossH: { position: 'absolute', width: 20, height: 3, backgroundColor: Colors.primary, borderRadius: 1.5 },
    title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 28, letterSpacing: -0.3 },
    stepsBox: { alignItems: 'flex-start', gap: 14 },
    stepRow: { flexDirection: 'row', alignItems: 'center' },
    dot: {
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: Colors.textMuted,
        marginRight: 12, alignItems: 'center', justifyContent: 'center',
    },
    dotDone: { borderColor: Colors.primary, backgroundColor: Colors.primary },
    dotActive: { borderColor: Colors.primary },
    stepText: { fontSize: 14 },
    textDone: { color: Colors.textMuted },
    textActive: { color: Colors.primary, fontWeight: '600' },
    textPending: { color: Colors.textMuted },
});
