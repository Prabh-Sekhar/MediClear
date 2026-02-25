import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, Animated, Easing,
    ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Shadows } from '../src/constants/colors';
import { useAuth } from '../src/context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fadeIn = useRef(new Animated.Value(0)).current;
    const slideUp = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeIn, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
            Animated.timing(slideUp, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            setError('Please enter email and password.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await signIn(email.trim(), password);
            router.replace('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
                    {/* Logo */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoMark}>
                            <View style={styles.logoCross} />
                            <View style={styles.logoCrossH} />
                        </View>
                        <Text style={styles.brandName}>MediClear</Text>
                        <Text style={styles.tagline}>Understand your medical reports</Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.card, Shadows.card]}>
                        <Text style={styles.cardTitle}>Welcome back</Text>

                        {error ? (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        ) : null}

                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="you@example.com"
                            placeholderTextColor={Colors.textMuted}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />

                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={Colors.textMuted}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonOff]}
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color={Colors.white} />
                            ) : (
                                <Text style={styles.buttonText}>Sign In</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.linkBtn}
                            onPress={() => router.push('/signup')}
                        >
                            <Text style={styles.linkText}>
                                Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    content: { width: '100%', maxWidth: 400, alignSelf: 'center' },

    logoSection: { alignItems: 'center', marginBottom: 32 },
    logoMark: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: Colors.primary, alignItems: 'center',
        justifyContent: 'center', marginBottom: 14,
    },
    logoCross: { position: 'absolute', width: 3, height: 22, backgroundColor: Colors.white, borderRadius: 1.5 },
    logoCrossH: { position: 'absolute', width: 22, height: 3, backgroundColor: Colors.white, borderRadius: 1.5 },
    brandName: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    tagline: { color: Colors.textMuted, fontSize: 14, marginTop: 4 },

    card: { backgroundColor: Colors.white, borderRadius: 20, padding: 24 },
    cardTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center' },

    errorBox: { backgroundColor: Colors.statusRedBg, borderRadius: 10, padding: 12, marginBottom: 16 },
    errorText: { color: Colors.statusRed, fontSize: 13, textAlign: 'center' },

    label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
    input: {
        backgroundColor: Colors.background, borderRadius: 12,
        paddingHorizontal: 16, paddingVertical: 14,
        color: Colors.textPrimary, fontSize: 15,
        marginBottom: 14, borderWidth: 1, borderColor: Colors.surfaceBorder,
    },

    button: {
        backgroundColor: Colors.primary, borderRadius: 14,
        paddingVertical: 16, alignItems: 'center',
        marginTop: 8, marginBottom: 16,
    },
    buttonOff: { opacity: 0.6 },
    buttonText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

    linkBtn: { alignItems: 'center' },
    linkText: { color: Colors.textMuted, fontSize: 14 },
    linkBold: { color: Colors.primary, fontWeight: '700' },
});
