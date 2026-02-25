import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Colors, Shadows } from '../constants/colors';
import { UI_STRINGS } from '../constants/languages';
import { useApp } from '../context/AppContext';
import TrafficLightGauge from './TrafficLightGauge';

export default function MetricCard({ metric, index = 0 }) {
    const { language } = useApp();
    const strings = UI_STRINGS[language] || UI_STRINGS.en;
    const [expanded, setExpanded] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1, duration: 500, delay: index * 80,
                easing: Easing.out(Easing.cubic), useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 1, friction: 8, tension: 40,
                delay: index * 80, useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getStatusLabel = () => {
        const map = {
            normal: strings.statusNormal || 'Normal',
            slightly_high: strings.statusSlightlyHigh || 'Slightly High',
            slightly_low: strings.statusSlightlyLow || 'Slightly Low',
            high: strings.statusHigh || 'High',
            low: strings.statusLow || 'Low',
            critical: strings.statusCritical || 'Critical',
        };
        return map[metric.status] || (strings.statusNormal || 'Normal');
    };

    const getStatusColor = () => {
        const map = {
            normal: Colors.statusGreen, slightly_high: Colors.statusYellow,
            slightly_low: Colors.statusYellow, high: Colors.statusOrange,
            low: Colors.statusOrange, critical: Colors.statusRed,
        };
        return map[metric.status] || Colors.statusGreen;
    };

    const getStatusBg = () => {
        const map = {
            normal: Colors.statusGreenBg, slightly_high: Colors.statusYellowBg,
            slightly_low: Colors.statusYellowBg, high: Colors.statusOrangeBg,
            low: Colors.statusOrangeBg, critical: Colors.statusRedBg,
        };
        return map[metric.status] || Colors.statusGreenBg;
    };

    const parseRange = () => {
        if (!metric.normalRange) return { min: 0, max: 100 };
        const nums = metric.normalRange.replace(/[^0-9.\-–,]/g, ' ').trim()
            .split(/[\s\-–]+/).map(n => parseFloat(n.replace(/,/g, ''))).filter(n => !isNaN(n));
        if (nums.length >= 2) return { min: nums[0], max: nums[1] };
        if (nums.length === 1) return { min: 0, max: nums[0] * 2 };
        return { min: 0, max: 100 };
    };

    // Split value and unit: "79.3 U/L" -> { num: "79.3", unit: "U/L" }
    const parseValue = () => {
        const raw = String(metric.value || '');
        const match = raw.match(/^([0-9.,]+)\s*(.*)/);
        if (match) {
            return { num: match[1], unit: match[2] || '' };
        }
        return { num: raw, unit: '' };
    };

    const range = parseRange();
    const statusColor = getStatusColor();
    const { num, unit } = parseValue();

    return (
        <Animated.View style={[styles.card, Shadows.card, {
            opacity: fadeAnim,
            transform: [{
                translateY: slideAnim.interpolate({
                    inputRange: [0, 1], outputRange: [16, 0],
                }),
            }],
        }]}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(!expanded)}
                style={styles.inner}
            >
                {/* Top Row: Name + Status */}
                <View style={styles.topRow}>
                    <Text style={styles.name} numberOfLines={1}>{metric.name}</Text>
                    <View style={[styles.badge, { backgroundColor: getStatusBg() }]}>
                        <View style={[styles.badgeDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                            {getStatusLabel()}
                        </Text>
                    </View>
                </View>

                {/* Value Row: Big number + unit + Gauge */}
                <View style={styles.valueRow}>
                    <View style={styles.valueCol}>
                        <View style={styles.valueTextRow}>
                            <Text style={[styles.valueNum, { color: statusColor }]}>
                                {num}
                            </Text>
                            {unit ? (
                                <Text style={styles.valueUnit}>{unit}</Text>
                            ) : null}
                        </View>
                        <View style={styles.rangeRow}>
                            <Text style={styles.rangeLabel}>{strings.normalLabel || 'Normal:'}</Text>
                            <Text style={styles.rangeVal}>{metric.normalRange}</Text>
                        </View>
                    </View>
                    <TrafficLightGauge
                        value={metric.value}
                        min={range.min}
                        max={range.max}
                        status={metric.status}
                        size={56}
                    />
                </View>

                {/* Horizontal range bar */}
                <View style={styles.barContainer}>
                    <View style={styles.barTrack}>
                        <View style={[styles.barFill, {
                            backgroundColor: statusColor,
                            width: `${Math.max(5, Math.min(100,
                                (() => {
                                    const nv = parseFloat(String(metric.value).replace(/[^0-9.\-]/g, ''));
                                    if (isNaN(nv) || range.max <= range.min) return 50;
                                    return ((nv - range.min) / (range.max - range.min)) * 100;
                                })()
                            ))}%`
                        }]} />
                    </View>
                    <View style={styles.barLabels}>
                        <Text style={styles.barLabel}>{range.min}</Text>
                        <Text style={styles.barLabel}>{range.max}</Text>
                    </View>
                </View>

                {/* Expanded explanation */}
                {expanded && (
                    <View style={styles.explainBox}>
                        <View style={[styles.explainLine, { backgroundColor: statusColor }]} />
                        <Text style={styles.explainText}>{metric.explanation}</Text>
                    </View>
                )}

                <Text style={styles.hint}>
                    {expanded ? (strings.tapToCollapse || 'Tap to collapse') : (strings.tapToLearn || 'Tap to learn more')}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
    },
    inner: { padding: 18 },

    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    name: {
        color: Colors.textPrimary,
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 10,
        letterSpacing: -0.2,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeDot: {
        width: 6, height: 6, borderRadius: 3, marginRight: 5,
    },
    badgeText: {
        fontSize: 12, fontWeight: '600',
    },

    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    valueCol: { flex: 1, marginRight: 16 },
    valueTextRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    valueNum: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
    },
    valueUnit: {
        color: Colors.textMuted,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 4,
    },
    rangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rangeLabel: {
        color: Colors.textMuted,
        fontSize: 12,
        marginRight: 4,
    },
    rangeVal: {
        color: Colors.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },

    barContainer: { marginBottom: 8 },
    barTrack: {
        height: 6,
        backgroundColor: 'rgba(0,0,0,0.04)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    barFill: {
        height: 6,
        borderRadius: 3,
    },
    barLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    barLabel: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: '500',
    },

    explainBox: {
        flexDirection: 'row',
        marginTop: 12,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: Colors.surfaceBorder,
    },
    explainLine: {
        width: 3, borderRadius: 1.5, marginRight: 12,
    },
    explainText: {
        color: Colors.textSecondary,
        fontSize: 14, lineHeight: 22, flex: 1,
    },

    hint: {
        color: Colors.textMuted,
        fontSize: 11,
        textAlign: 'center',
        marginTop: 10,
    },
});
