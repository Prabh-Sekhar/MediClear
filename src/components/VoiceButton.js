import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';
import { speakText, stopSpeaking, isSpeaking } from '../services/speechService';

export default function VoiceButton({ text, language = 'en', size = 'medium' }) {
    const [playing, setPlaying] = useState(false);
    const [loading, setLoading] = useState(false);

    const handlePress = async () => {
        if (playing) {
            await stopSpeaking();
            setPlaying(false);
            return;
        }

        try {
            setLoading(true);
            setPlaying(true);
            await speakText(text, language);
        } catch (error) {
            console.error('Speech error:', error);
        } finally {
            setPlaying(false);
            setLoading(false);
        }
    };

    const isSmall = size === 'small';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isSmall && styles.buttonSmall,
                playing && styles.buttonActive,
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {loading && !playing ? (
                <ActivityIndicator size="small" color={Colors.primaryLight} />
            ) : (
                <>
                    <Text style={[styles.icon, isSmall && styles.iconSmall]}>
                        {playing ? '⏹️' : '🔊'}
                    </Text>
                    {!isSmall && (
                        <Text style={[styles.label, playing && styles.labelActive]}>
                            {playing ? 'Stop' : 'Listen'}
                        </Text>
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryGlow,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(26, 115, 232, 0.3)',
    },
    buttonSmall: {
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 14,
    },
    buttonActive: {
        backgroundColor: 'rgba(244, 67, 54, 0.15)',
        borderColor: 'rgba(244, 67, 54, 0.3)',
    },
    icon: {
        fontSize: 16,
    },
    iconSmall: {
        fontSize: 14,
    },
    label: {
        color: Colors.primaryLight,
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    labelActive: {
        color: Colors.statusRed,
    },
});
