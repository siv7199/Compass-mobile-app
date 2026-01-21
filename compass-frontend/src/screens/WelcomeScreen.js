import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Compass, ArrowRight, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation, onComplete }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const handleGetStarted = () => {
        if (onComplete) {
            onComplete();
        } else {
            navigation?.navigate('Onboarding');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.logoContainer}>
                    <LinearGradient
                        colors={[theme.colors.primary + '20', 'transparent']}
                        style={styles.logoGlow}
                    />
                    <Compass size={64} color={theme.colors.primary} strokeWidth={1.5} />
                </View>

                <Text style={styles.title}>Compass</Text>
                <Text style={styles.tagline}>Find your path to the right college</Text>
            </View>

            {/* Features */}
            <View style={styles.features}>
                <View style={styles.featureItem}>
                    <Sparkles size={20} color={theme.colors.secondary} />
                    <Text style={styles.featureText}>AI-powered college recommendations</Text>
                </View>
                <View style={styles.featureItem}>
                    <Sparkles size={20} color={theme.colors.secondary} />
                    <Text style={styles.featureText}>Real cost & salary data</Text>
                </View>
                <View style={styles.featureItem}>
                    <Sparkles size={20} color={theme.colors.secondary} />
                    <Text style={styles.featureText}>Personalized ROI analysis</Text>
                </View>
            </View>

            {/* CTA */}
            <View style={styles.ctaContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleGetStarted}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                    <ArrowRight size={20} color="#000" />
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    No account needed. Your data stays on your device.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: 24,
    },
    hero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    logoGlow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        top: -28,
        left: -28,
    },
    title: {
        fontSize: 42,
        fontWeight: '700',
        color: theme.colors.text,
        letterSpacing: -1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        color: theme.colors.textDim,
        textAlign: 'center',
        maxWidth: 280,
        lineHeight: 26,
    },
    features: {
        paddingVertical: 40,
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: theme.colors.glass,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    featureText: {
        fontSize: 15,
        color: theme.colors.text,
        flex: 1,
    },
    ctaContainer: {
        paddingBottom: 40,
        gap: 16,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    disclaimer: {
        fontSize: 13,
        color: theme.colors.textDim,
        textAlign: 'center',
    },
});
