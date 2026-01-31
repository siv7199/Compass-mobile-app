import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Compass, Plus } from 'lucide-react-native';

export default function EmptyScenarioScreen({ navigation, restartOnboarding }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Compass size={64} color={theme.colors.primary} />
                </View>
                <Text style={styles.title}>No Open Scenario</Text>
                <Text style={styles.subtitle}>
                    Start a new search to find your perfect college match.
                </Text>

                <TouchableOpacity
                    style={styles.createBtn}
                    onPress={restartOnboarding}
                >
                    <Plus size={20} color="#000" />
                    <Text style={styles.createBtnText}>Create New Scenario</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: theme.colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textDim,
        marginBottom: 40,
        textAlign: 'center',
        maxWidth: 260,
        lineHeight: 24,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 30,
        gap: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    createBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
