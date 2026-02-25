import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/colors';
import { AppProvider } from '../src/context/AppContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function AuthGate({ children }) {
    const { user, loading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    React.useEffect(() => {
        if (loading) return;

        const inAuth = segments[0] === 'login' || segments[0] === 'signup';

        if (!user && !inAuth) {
            router.replace('/login');
        } else if (user && inAuth) {
            router.replace('/');
        }
    }, [user, loading, segments]);

    if (loading) {
        return (
            <View style={styles.loading}>
                <View style={styles.loadingLogo}>
                    <View style={styles.loadingCross} />
                    <View style={styles.loadingCrossH} />
                </View>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
            </View>
        );
    }

    return children;
}

function ProfileButton() {
    const router = useRouter();
    const { profile, user } = useAuth();

    if (!user) return null;

    const initial = (profile?.full_name || user?.email || '?')[0].toUpperCase();

    return (
        <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.profileBtn}
            activeOpacity={0.7}
        >
            <Text style={styles.profileInitial}>{initial}</Text>
        </TouchableOpacity>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <AppProvider>
                <StatusBar style="dark" />
                <AuthGate>
                    <Stack
                        screenOptions={{
                            headerStyle: { backgroundColor: Colors.white },
                            headerTintColor: Colors.textPrimary,
                            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                            contentStyle: { backgroundColor: Colors.background },
                            headerShadowVisible: false,
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen
                            name="index"
                            options={{
                                title: '',
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="login"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="signup"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="profile"
                            options={{
                                title: 'Profile',
                                headerRight: () => null,
                            }}
                        />
                        <Stack.Screen
                            name="upload"
                            options={{
                                title: 'Upload',
                                headerRight: () => <ProfileButton />,
                            }}
                        />
                        <Stack.Screen
                            name="analyzing"
                            options={{
                                title: 'Analyzing',
                                headerShown: false,
                                gestureEnabled: false,
                            }}
                        />
                        <Stack.Screen
                            name="results"
                            options={{
                                title: 'Results',
                                headerRight: () => <ProfileButton />,
                            }}
                        />
                        <Stack.Screen
                            name="chat"
                            options={{
                                title: 'Ask MediClear',
                                headerRight: () => <ProfileButton />,
                            }}
                        />
                    </Stack>
                </AuthGate>
            </AppProvider>
        </AuthProvider>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1, backgroundColor: Colors.background,
        alignItems: 'center', justifyContent: 'center',
    },
    loadingLogo: {
        width: 56, height: 56, borderRadius: 16,
        backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    },
    loadingCross: { position: 'absolute', width: 3, height: 22, backgroundColor: Colors.white, borderRadius: 1.5 },
    loadingCrossH: { position: 'absolute', width: 22, height: 3, backgroundColor: Colors.white, borderRadius: 1.5 },
    profileBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: Colors.primary, alignItems: 'center',
        justifyContent: 'center', marginRight: 8,
    },
    profileInitial: { color: Colors.white, fontSize: 14, fontWeight: '700' },
});
