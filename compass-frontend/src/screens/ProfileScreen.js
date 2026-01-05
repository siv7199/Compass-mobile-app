import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext'; // Dynamic Theme Hook
import { ChevronRight, Shield, HelpCircle, Briefcase, Eye, Zap } from 'lucide-react-native';

import HoloTutorial from '../components/HoloTutorial';

export default function ProfileScreen({ navigation, resetTutorial, savedMissions = [], showTutorial, closeTutorial, clearMissions }) {
    const { theme, toggleTheme, isDarkMode } = useTheme();
    const randomId = Math.floor(Math.random() * 90000) + 10000;

    // Dynamic Styles
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="PROFILE" />
                <Text style={styles.label} accessibilityLabel="Security Classification: Classified">CLASSIFIED</Text>
                <Text style={styles.title} accessibilityLabel={`Operative Identity ${randomId}`}>{`OPERATIVE ID: ${randomId}`}</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>

                {/* VISUAL UPLINK (THEME TOGGLE) */}
                <View style={styles.section} accessibilityRole="header" accessibilityLabel="Visual Settings Section">
                    <View style={styles.sectionHeader}>
                        <Eye color={theme.colors.primary} size={20} />
                        <Text style={styles.sectionTitle}>VISUAL UPLINK</Text>
                    </View>
                    <View style={[styles.settingBtn, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                        <Text style={styles.settingText}>
                            {isDarkMode ? "NIGHT VISION (DARK)" : "DAYLIGHT MODE (LIGHT)"}
                        </Text>
                        <Switch
                            trackColor={{ false: "#767577", true: theme.colors.primary }}
                            thumbColor={isDarkMode ? theme.colors.tacticalBlack : "#f4f3f4"}
                            onValueChange={toggleTheme}
                            value={!isDarkMode} // Switch ON = Light Mode (Daylight)
                            accessibilityLabel="Toggle Light or Dark Mode"
                            accessibilityHint="Switches between high contrast dark mode and standard light mode"
                        />
                    </View>
                </View>

                {/* FIELD MANUAL */}
                <View style={[styles.section, { borderColor: theme.colors.primary, borderWidth: 1, padding: 15, borderRadius: 8 }]}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        onPress={() => navigation.navigate('HelpScreen')}
                        accessibilityLabel="Open Field Manual"
                        accessibilityHint="Navigates to the glossary and help section"
                        accessibilityRole="button"
                    >
                        <Briefcase color={theme.colors.primary} size={24} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.primary, marginBottom: 0 }]}>FIELD MANUAL</Text>
                    </TouchableOpacity>
                </View>

                {/* SAVED MISSIONS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield color={theme.colors.secondary} size={20} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>SAVED MISSIONS</Text>
                    </View>
                    {savedMissions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>NO ACTIVE TARGETS LOCKED.</Text>
                            <TouchableOpacity
                                style={styles.deployBtn}
                                onPress={() => navigation.navigate('Lobby')}
                                accessibilityLabel="Find Targets"
                                accessibilityRole="button"
                            >
                                <Text style={styles.deployText}>FIND TARGETS</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        savedMissions.map((mission) => (
                            <View key={mission.id} style={{ marginBottom: 10, padding: 10, backgroundColor: theme.colors.glass, borderRadius: 8 }} accessibilityLabel={`Saved Mission: ${mission.target1} versus ${mission.target2}`}>
                                <Text style={{ color: theme.colors.tacticalGreen, fontFamily: theme.fonts.mono, fontSize: 10 }}>{mission.date}</Text>
                                <Text style={{ color: theme.colors.text, fontFamily: theme.fonts.heading }}>{mission.target1} vs {mission.target2}</Text>
                                <Text style={{ color: theme.colors.textDim, fontSize: 12 }}>Scores: {mission.score1} // {mission.score2}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* SYSTEM SETTINGS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Zap color={theme.colors.warning} size={20} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>SYSTEM OVERRIDE</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.settingBtn}
                        onPress={() => {
                            resetTutorial();
                            alert("TUTORIAL RESET: Next mission will render Holo-Guide.");
                        }}
                        accessibilityLabel="Reset Tutorials"
                        accessibilityRole="button"
                    >
                        <Text style={styles.settingText}>RESET TUTORIAL PROTOCOLS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.settingBtn, { borderColor: theme.colors.danger, backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}
                        onPress={() => {
                            clearMissions && clearMissions();
                            alert("DATA PURGED: All mission logs erased.");
                        }}
                        accessibilityLabel="Erase Mission Data"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.settingText, { color: theme.colors.danger }]}>ERASE MISSION DATA</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Lobby')} accessibilityRole="button" accessibilityLabel="Return to Lobby">
                <Text style={styles.backText}>RETURN TO BASE</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Move styles to function or keep simplified if using dynamic theme object directly in render? 
// Ideally use StyleSheet.create but theme values change. 
// For performance, usually useMemo, but for this scale, a function is fine.
const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    label: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.danger,
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: theme.spacing.xs,
    },
    title: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 24,
        letterSpacing: 2,
    },
    content: {
        padding: theme.spacing.l,
        gap: theme.spacing.xl,
    },
    section: {
        gap: theme.spacing.m,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        marginBottom: theme.spacing.s,
    },
    sectionTitle: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.tacticalGreen, // Will update with theme.colors
        fontSize: 18,
        letterSpacing: 1,
    },
    emptyState: {
        padding: theme.spacing.l,
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderRadius: theme.borderRadius.m,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: theme.colors.textDim,
    },
    emptyText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        marginBottom: theme.spacing.m,
    },
    deployBtn: {
        paddingVertical: theme.spacing.s,
        paddingHorizontal: theme.spacing.l,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.s,
    },
    deployText: {
        fontFamily: theme.fonts.heading,
        color: '#000',
    },
    backBtn: {
        margin: theme.spacing.l,
        padding: theme.spacing.m,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        alignItems: 'center',
        borderRadius: theme.borderRadius.m,
    },
    backText: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 14,
        letterSpacing: 2,
    },
    settingBtn: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.s,
        alignItems: 'center',
        marginBottom: theme.spacing.s,
    },
    settingText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.text,
        fontSize: 12,
        letterSpacing: 1,
    }
});


