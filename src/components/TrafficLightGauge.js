import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

export default function TrafficLightGauge({ value, min, max, status, size = 56 }) {
    const animProgress = useRef(new Animated.Value(0)).current;

    const numValue = parseFloat(String(value).replace(/[^0-9.\-]/g, ''));
    const numMin = parseFloat(String(min)) || 0;
    const numMax = parseFloat(String(max)) || 100;

    let fillPercent = 50;
    if (!isNaN(numValue) && numMax > numMin) {
        fillPercent = Math.max(0, Math.min(100, ((numValue - numMin) / (numMax - numMin)) * 100));
    } else if (status === 'normal') {
        fillPercent = 50;
    }

    const getColor = () => {
        const map = {
            normal: Colors.statusGreen,
            slightly_high: Colors.statusYellow,
            slightly_low: Colors.statusYellow,
            high: Colors.statusOrange,
            low: Colors.statusOrange,
            critical: Colors.statusRed,
        };
        return map[status] || Colors.statusGreen;
    };

    const getBg = () => {
        const map = {
            normal: Colors.statusGreenBg,
            slightly_high: Colors.statusYellowBg,
            slightly_low: Colors.statusYellowBg,
            high: Colors.statusOrangeBg,
            low: Colors.statusOrangeBg,
            critical: Colors.statusRedBg,
        };
        return map[status] || Colors.statusGreenBg;
    };

    // Show a short meaningful label instead of percentage
    const getStatusSymbol = () => {
        const map = {
            normal: '✓',
            slightly_high: '↑',
            slightly_low: '↓',
            high: '↑↑',
            low: '↓↓',
            critical: '!!',
        };
        return map[status] || '✓';
    };

    const color = getColor();

    useEffect(() => {
        Animated.spring(animProgress, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: false,
        }).start();
    }, []);

    const radius = (size - 12) / 2;
    const strokeWidth = 5;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;
    const dashOffset = circumference - (circumference * fillPercent) / 100;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: getBg() }]}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {/* Background track */}
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke="rgba(0,0,0,0.04)"
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    {/* Progress arc */}
                    <Circle
                        cx={center} cy={center} r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        transform={`rotate(-90, ${center}, ${center})`}
                    />
                </Svg>
                {/* Status symbol inside */}
                <View style={styles.centerLabel}>
                    <Text style={[styles.symbolText, { color }]}>
                        {getStatusSymbol()}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    symbolText: {
        fontSize: 16,
        fontWeight: '800',
    },
});
