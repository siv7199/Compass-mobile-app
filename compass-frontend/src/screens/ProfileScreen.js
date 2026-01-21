import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Moon, HelpCircle, Trash2, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen({ navigation, resetTutorial, clearMissions, resetApp }) {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const styles = getStyles(theme);

    const handleClearData = () => {
        Alert.alert(
            "Clear All Data",
            "This will remove all your saved colleges. This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    style: "destructive",
                    onPress: () => {
                        resetApp && resetApp(); // This clears data AND resets navigation
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Appearance</Text>
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Moon size={20} color={theme.colors.text} />
                            <Text style={styles.settingText}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                        />
                    </View>
                </View>

                {/* Help Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Support</Text>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => navigation.navigate('Help')}
                    >
                        <View style={styles.settingInfo}>
                            <HelpCircle size={20} color={theme.colors.text} />
                            <Text style={styles.settingText}>Help & FAQ</Text>
                        </View>
                        <ChevronRight size={20} color={theme.colors.textDim} />
                    </TouchableOpacity>
                </View>

                {/* Data Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleClearData}
                    >
                        <View style={styles.settingInfo}>
                            <Trash2 size={20} color={theme.colors.danger} />
                            <Text style={[styles.settingText, { color: theme.colors.danger }]}>Clear All Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Compass Beta v1.0</Text>
                    <Text style={styles.footerText}>Made with ♥ for students</Text>
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
    header: {
        padding: 24,
        paddingBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
    },
    content: {
        padding: 20,
        paddingTop: 0,
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 13,
        color: theme.colors.textDim,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.glass,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
});
