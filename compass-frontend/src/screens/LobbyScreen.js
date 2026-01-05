import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Heart, Zap, PenTool, ChevronRight } from 'lucide-react-native';
import HoloTutorial from '../components/HoloTutorial';
// import axios from 'axios'; // Not used in this screen actually

// Mock API URL - Replace with your IP if running on separate device
const API_URL = 'http://172.20.2.161:8000';

const CLASSES = [
    { id: 'engineer', name: 'Engineer', icon: Zap, desc: 'Builders of the World', soc_codes: '17-0000' },
    { id: 'healer', name: 'Healer', icon: Heart, desc: 'Guardians of Life', soc_codes: '29-0000' },
    { id: 'leader', name: 'Leader', icon: Briefcase, desc: 'Commanders of Capital', soc_codes: '11-0000' },
    { id: 'creative', name: 'Creative', icon: PenTool, desc: 'Architects of Imagination', soc_codes: '27-0000' },
];

export default function LobbyScreen({ navigation, showTutorial, closeTutorial }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [selectedClass, setSelectedClass] = useState(null);
    const [activeScenario, setActiveScenario] = useState(null);

    const handleSelect = (cls) => {
        setSelectedClass(cls);
        setActiveScenario(cls.id.toUpperCase());
    };

    const handleTutorialClose = () => {
        setActiveScenario(null);
        if (selectedClass) {
            navigation.navigate('Stats', { selectedClass });
        }
    };

    const handleNext = () => {
        if (selectedClass) {
            navigation.navigate('Stats', { selectedClass });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Initial Lobby Tutorial (Controlled by App.js, currently disabled) */}
            <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="LOBBY" />

            {/* Class Specific Popup */}
            <HoloTutorial visible={!!activeScenario} onClose={handleTutorialClose} scenario={activeScenario || 'LOBBY'} />

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.title, { flex: 1, marginRight: 8 }]} numberOfLines={1} adjustsFontSizeToFit>CHOOSE YOUR CLASS</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(0, 255, 153, 0.1)', borderWidth: 1, borderColor: theme.colors.tacticalGreen, borderRadius: 4 }}>
                        <Text style={{ color: theme.colors.tacticalGreen, fontFamily: theme.fonts.mono, fontSize: 12, fontWeight: 'bold' }}>ID CARD</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.subtitle}>Select your operational specialty.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {CLASSES.map((cls) => {
                    const isSelected = selectedClass?.id === cls.id;
                    const Icon = cls.icon;
                    return (
                        <TouchableOpacity
                            key={cls.id}
                            onPress={() => handleSelect(cls)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={isSelected ? [theme.colors.primary, 'transparent'] : [theme.colors.glassBorder, 'transparent']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={[styles.card, isSelected && styles.cardSelected]}
                            >
                                <Icon color={isSelected ? '#000' : theme.colors.primary} size={32} />
                                <Text style={[styles.cardTitle, isSelected && { color: '#000' }]}>{cls.name}</Text>
                                <Text style={[styles.cardDesc, isSelected && { color: '#000' }]}>{cls.desc}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedClass && (
                <TouchableOpacity
                    onPress={handleNext}
                    style={[styles.nextButton]}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>CONTINUE</Text>
                    <ChevronRight size={18} color={theme.colors.text} />
                </TouchableOpacity>
            )}
        </SafeAreaView >
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    header: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontFamily: theme.fonts.heading,
        fontSize: 24,
        color: theme.colors.primary,
        letterSpacing: 2,
    },
    subtitle: {
        fontFamily: theme.fonts.body,
        color: theme.colors.textDim,
        marginTop: theme.spacing.s,
    },
    grid: {
        gap: theme.spacing.m,
    },
    card: {
        borderRadius: theme.borderRadius.m,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.glass,
        height: 120,
        justifyContent: 'center',
        padding: theme.spacing.l,
    },
    cardSelected: {
        borderColor: theme.colors.primary,
    },
    cardTitle: {
        fontFamily: theme.fonts.heading,
        fontSize: 18,
        color: theme.colors.text,
        marginTop: theme.spacing.s,
    },
    cardDesc: {
        fontFamily: theme.fonts.body,
        fontSize: 12,
        color: theme.colors.textDim,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.glassBorder,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
        marginTop: 'auto',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    disabledButton: {
        opacity: 0.5,
        borderColor: theme.colors.glassBorder,
    },
    buttonText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.text,
        marginRight: theme.spacing.s,
    },
});
