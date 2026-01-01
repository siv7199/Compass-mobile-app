import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronRight, Shield, HelpCircle, Briefcase } from 'lucide-react-native';



import HoloTutorial from '../components/HoloTutorial';

export default function ProfileScreen({ navigation, resetTutorial, savedMissions = [], showTutorial, closeTutorial, clearMissions }) {
    const randomId = Math.floor(Math.random() * 90000) + 10000;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="PROFILE" />
                <Text style={styles.label}>CLASSIFIED</Text>
                <Text style={styles.title}>{`OPERATIVE ID: ${randomId}`}</Text>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>

                {/* FIELD MANUAL */}
                <View style={[styles.section, { borderColor: theme.colors.primary, borderWidth: 1, padding: 15, borderRadius: 8 }]}>
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                        onPress={() => navigation.navigate('HelpScreen')}
                        accessibilityLabel="Open Field Manual Dictionary"
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
                            <TouchableOpacity style={styles.deployBtn} onPress={() => navigation.navigate('Lobby')}>
                                <Text style={styles.deployText}>FIND TARGETS</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        savedMissions.map((mission) => (
                            <View key={mission.id} style={{ marginBottom: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 }}>
                                <Text style={{ color: theme.colors.tacticalGreen, fontFamily: theme.fonts.mono, fontSize: 10 }}>{mission.date}</Text>
                                <Text style={{ color: '#fff', fontFamily: theme.fonts.heading }}>{mission.target1} vs {mission.target2}</Text>
                                <Text style={{ color: theme.colors.textDim, fontSize: 12 }}>Scores: {mission.score1} // {mission.score2}</Text>
                            </View>
                        ))
                    )}
                </View>

                {/* SYSTEM SETTINGS */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <HelpCircle color={theme.colors.warning} size={20} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.warning }]}>SYSTEM OVERRIDE</Text>
                    </View>

                    <TouchableOpacity style={styles.settingBtn} onPress={() => {
                        resetTutorial();
                        alert("TUTORIAL RESET: Next mission will render Holo-Guide.");
                    }}>
                        <Text style={styles.settingText}>RESET TUTORIAL PROTOCOLS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.settingBtn, { borderColor: theme.colors.danger, backgroundColor: 'rgba(255, 0, 0, 0.1)' }]} onPress={() => {
                        clearMissions && clearMissions();
                        alert("DATA PURGED: All mission logs erased.");
                    }}>
                        <Text style={[styles.settingText, { color: theme.colors.danger }]}>ERASE MISSION DATA</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Lobby')}>
                <Text style={styles.backText}>RETURN TO BASE</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
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
        color: theme.colors.danger, // 'CLASSIFIED' in red
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
        color: theme.colors.tacticalGreen,
        fontSize: 18,
        letterSpacing: 1,
    },
    faqItem: {
        backgroundColor: theme.colors.glass,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    question: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.primary,
        fontSize: 14,
        marginBottom: theme.spacing.s,
    },
    answer: {
        fontFamily: theme.fonts.body,
        color: theme.colors.textDim,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyState: {
        padding: theme.spacing.l,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
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
