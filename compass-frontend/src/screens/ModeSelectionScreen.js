import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Compass, Target, Sparkles, Lock, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ModeSelectionScreen({ userInfo, onSelectMode }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Greeting */}
                    <View style={styles.header}>
                        <Text style={styles.greeting}>
                            Hey {userInfo?.name?.split(' ')[0] || 'there'}! 👋
                        </Text>
                        <Text style={styles.title}>Choose your mode</Text>
                        <Text style={styles.subtitle}>
                            Select the experience that matches your journey
                        </Text>
                    </View>

                    {/* Mode Cards */}
                    <View style={styles.cardsContainer}>
                        {/* Discovery Mode - Coming Soon */}
                        <View style={[styles.modeCard, styles.modeCardDisabled]}>
                            <View style={styles.comingSoonBadge}>
                                <Lock size={10} color={theme.colors.text} />
                                <Text style={styles.comingSoonText}>COMING SOON</Text>
                            </View>

                            <View style={styles.modeIconContainer}>
                                <Compass size={32} color={theme.colors.textDim} />
                            </View>

                            <Text style={[styles.modeName, styles.modeNameDisabled]}>
                                Discovery Mode
                            </Text>
                            <Text style={[styles.modeAudience, styles.modeAudienceDisabled]}>
                                For Freshmen & Sophomores
                            </Text>
                            <Text style={styles.modeDescDisabled}>
                                Explore careers and interests
                            </Text>
                        </View>

                        {/* Strategy Mode - Active */}
                        <TouchableOpacity
                            style={styles.modeCard}
                            onPress={() => onSelectMode('strategy')}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[theme.colors.primary + '20', 'transparent']}
                                style={styles.modeGlow}
                            />

                            <View style={styles.recommendedBadge}>
                                <Sparkles size={10} color="#000" />
                                <Text style={styles.recommendedText}>RECOMMENDED</Text>
                            </View>

                            <View style={[styles.modeIconContainer, styles.modeIconActive]}>
                                <Target size={32} color={theme.colors.primary} />
                            </View>

                            <Text style={styles.modeName}>Strategy Mode</Text>
                            <Text style={styles.modeAudience}>For Juniors & Seniors</Text>
                            <Text style={styles.modeDesc}>
                                Personalized recommendations & ROI analysis
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        You can change your mode later in settings
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 16,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textDim,
        lineHeight: 22,
    },
    cardsContainer: {
        gap: 16,
    },
    modeCard: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        overflow: 'hidden',
    },
    modeCardDisabled: {
        opacity: 0.6,
    },
    modeGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    comingSoonBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.glassBorder,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    comingSoonText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: 0.5,
    },
    recommendedBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    recommendedText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#000',
        letterSpacing: 0.5,
    },
    modeIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modeIconActive: {
        borderWidth: 1,
        borderColor: theme.colors.primary + '40',
    },
    modeName: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 4,
    },
    modeNameDisabled: {
        color: theme.colors.textDim,
    },
    modeAudience: {
        fontSize: 14,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: 8,
    },
    modeAudienceDisabled: {
        color: theme.colors.textDim,
    },
    modeDesc: {
        fontSize: 14,
        color: theme.colors.textDim,
        lineHeight: 20,
    },
    modeDescDisabled: {
        fontSize: 14,
        color: theme.colors.textDim,
        lineHeight: 20,
        opacity: 0.7,
    },
    modeArrow: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
});
