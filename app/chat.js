import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput,
    TouchableOpacity, KeyboardAvoidingView, Platform,
    Animated, Easing, ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../src/constants/colors';
import { UI_STRINGS } from '../src/constants/languages';
import { useApp } from '../src/context/AppContext';
import { sendChatMessage, isApiKeyConfigured } from '../src/services/geminiService';

export default function ChatScreen() {
    const { language, chatMessages, addChatMessage, reportContext } = useApp();
    const strings = UI_STRINGS[language] || UI_STRINGS.en;
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const suggestedQuestions = strings.suggestedQuestions || UI_STRINGS.en.suggestedQuestions;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }, []);

    useEffect(() => { scrollRef.current?.scrollToEnd({ animated: true }); }, [chatMessages]);

    const handleSend = async (text) => {
        const question = text || input.trim();
        if (!question) return;
        addChatMessage({ role: 'user', text: question });
        setInput('');
        if (!isApiKeyConfigured()) {
            setTimeout(() => { addChatMessage({ role: 'assistant', text: "That's a great question. I'd recommend discussing this with your doctor who knows your full health history." }); }, 1000);
            return;
        }
        try {
            setLoading(true);
            const response = await sendChatMessage(question, reportContext);
            addChatMessage({ role: 'assistant', text: response });
        } catch (error) {
            addChatMessage({ role: 'assistant', text: "Sorry, I couldn't process that. Please try again." });
        } finally { setLoading(false); }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
            <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>
                <ScrollView ref={scrollRef} style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                    {/* Welcome */}
                    <View style={[styles.welcomeCard, Shadows.card]}>
                        <Text style={styles.welcomeTitle}>{strings.askFollowUp || 'Ask About Your Report'}</Text>
                        <Text style={styles.welcomeSub}>Ask any question about your results in plain language.</Text>
                        <View style={styles.miniDisclaimer}>
                            <View style={styles.disclaimerDot} />
                            <Text style={styles.disclaimerMiniText}>Not a substitute for medical advice.</Text>
                        </View>
                    </View>

                    {/* Suggested */}
                    {chatMessages.length === 0 && (
                        <View style={styles.suggestedSection}>
                            <Text style={styles.suggestedLabel}>Suggested questions</Text>
                            {suggestedQuestions.map((q, i) => (
                                <TouchableOpacity key={i} style={[styles.suggestedPill, Shadows.small]} onPress={() => handleSend(q)} activeOpacity={0.7}>
                                    <Text style={styles.suggestedText}>{q}</Text>
                                    <Text style={styles.suggestedArrow}>→</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Messages */}
                    {chatMessages.map((msg, i) => (
                        <View key={i} style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                            {msg.role === 'assistant' && <View style={styles.aDot} />}
                            <Text style={[styles.msgText, msg.role === 'user' ? styles.userText : styles.aText]}>{msg.text}</Text>
                        </View>
                    ))}

                    {loading && (
                        <View style={[styles.bubble, styles.assistantBubble]}>
                            <View style={styles.aDot} />
                            <ActivityIndicator size="small" color={Colors.primary} />
                            <Text style={styles.typingText}>Thinking...</Text>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.inputBar}>
                    <TextInput style={styles.input} value={input} onChangeText={setInput}
                        placeholder={strings.chatPlaceholder || 'Ask a question...'} placeholderTextColor={Colors.textMuted}
                        multiline maxLength={500} />
                    <TouchableOpacity style={[styles.sendBtn, !input.trim() && styles.sendBtnOff]}
                        onPress={() => handleSend()} disabled={!input.trim() || loading} activeOpacity={0.7}>
                        <Text style={styles.sendIcon}>→</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { flex: 1 },
    list: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 8 },

    welcomeCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 20, marginBottom: 16 },
    welcomeTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 6 },
    welcomeSub: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 12 },
    miniDisclaimer: { flexDirection: 'row', alignItems: 'center' },
    disclaimerDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: Colors.statusRed, marginRight: 8, opacity: 0.5 },
    disclaimerMiniText: { color: Colors.textMuted, fontSize: 11 },

    suggestedSection: { marginBottom: 16 },
    suggestedLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    suggestedPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8 },
    suggestedText: { color: Colors.textSecondary, fontSize: 14, flex: 1 },
    suggestedArrow: { color: Colors.primary, fontSize: 16, fontWeight: '600', marginLeft: 8 },

    bubble: { borderRadius: 16, padding: 14, marginBottom: 10, maxWidth: '85%' },
    userBubble: { backgroundColor: Colors.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
    assistantBubble: {
        backgroundColor: Colors.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4,
        flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap',
        ...Shadows.small,
    },
    aDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginRight: 10, marginTop: 6 },
    msgText: { fontSize: 14, lineHeight: 21 },
    userText: { color: Colors.white },
    aText: { color: Colors.textSecondary, flex: 1 },
    typingText: { color: Colors.textMuted, fontSize: 13, fontStyle: 'italic', marginLeft: 8 },

    inputBar: {
        flexDirection: 'row', alignItems: 'flex-end', padding: 14,
        paddingBottom: Platform.OS === 'ios' ? 28 : 14,
        backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.surfaceBorder,
    },
    input: {
        flex: 1, backgroundColor: Colors.background, borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 12, color: Colors.textPrimary,
        fontSize: 15, maxHeight: 100,
    },
    sendBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
    sendBtnOff: { backgroundColor: Colors.surfaceHover },
    sendIcon: { color: Colors.white, fontSize: 18, fontWeight: '700' },
});
