import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle, ArrowRight } from 'lucide-react-native';

export default function MissionBriefScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { schoolName } = route.params || { schoolName: 'Unknown Target' };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.colors.background, '#0f2027']}
                style={styles.background}
            />

            <View style={styles.content}>
                <CheckCircle color={theme.colors.primary} size={64} style={styles.icon} />
                <Text style={styles.title}>MISSION CONFIRMED</Text>
                <Text style={styles.subtitle}>Deployment authorized for:</Text>

                <View style={styles.schoolBox}>
                    <Text style={styles.schoolName}>{schoolName}</Text>
                </View>

                <Text style={styles.message}>
                    Your application package is being prepared.
                    Good luck, operative.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Lobby')}
                >
                    <Text style={styles.buttonText}>RETURN TO BASE</Text>
                    <ArrowRight color="#000" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background, // Fallback
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    content: {
        alignItems: 'center',
        padding: theme.spacing.xl,
        width: '100%',
        maxWidth: 400,
    },
    icon: {
        marginBottom: theme.spacing.l,
    },
    title: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.primary,
        fontSize: 28,
        letterSpacing: 2,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        fontSize: 14,
        marginBottom: theme.spacing.m,
    },
    schoolBox: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.xl,
        width: '100%',
        alignItems: 'center',
    },
    schoolName: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 24,
        textAlign: 'center',
    },
    message: {
        fontFamily: theme.fonts.body,
        color: theme.colors.textDim,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        lineHeight: 22,
    },
    button: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.s,
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    buttonText: {
        fontFamily: theme.fonts.heading,
        color: '#000',
        fontSize: 16,
    },
});
