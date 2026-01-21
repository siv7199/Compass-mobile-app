import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Heart, Zap, PenTool, ChevronRight } from 'lucide-react-native';

const CAREER_PATHS = [
    { id: 'engineer', name: 'Engineering & Tech', icon: Zap, desc: 'Software, Civil, Mechanical', soc_codes: '17-0000' },
    { id: 'healer', name: 'Healthcare', icon: Heart, desc: 'Medicine, Nursing, Dentistry', soc_codes: '29-0000' },
    { id: 'leader', name: 'Business & Finance', icon: Briefcase, desc: 'Management, Marketing, Finance', soc_codes: '11-0000' },
    { id: 'creative', name: 'Arts & Media', icon: PenTool, desc: 'Design, Writing, Entertainment', soc_codes: '27-0000' },
];

export default function LobbyScreen({ navigation, showTutorial, closeTutorial }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [selectedCareer, setSelectedCareer] = useState(null);

    const handleSelect = (career) => {
        setSelectedCareer(career);
    };

    const handleNext = () => {
        if (selectedCareer) {
            navigation.navigate('Stats', { selectedClass: selectedCareer });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Step 1 of 3</Text>
                <Text style={styles.title}>Choose Your Career Path</Text>
                <Text style={styles.subtitle}>What field interests you most?</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {CAREER_PATHS.map((career) => {
                    const isSelected = selectedCareer?.id === career.id;
                    const Icon = career.icon;
                    return (
                        <TouchableOpacity
                            key={career.id}
                            onPress={() => handleSelect(career)}
                            activeOpacity={0.8}
                            style={[styles.card, isSelected && styles.cardSelected]}
                        >
                            <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                                <Icon color={isSelected ? '#000' : theme.colors.primary} size={28} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>{career.name}</Text>
                                <Text style={[styles.cardDesc, isSelected && styles.cardDescSelected]}>{career.desc}</Text>
                            </View>
                            {isSelected && (
                                <View style={styles.checkmark}>
                                    <Text style={styles.checkmarkText}>✓</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {selectedCareer && (
                <TouchableOpacity
                    onPress={handleNext}
                    style={styles.nextButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                    <ChevronRight size={20} color="#000" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
    },
    header: {
        marginTop: 16,
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textDim,
        lineHeight: 22,
    },
    grid: {
        gap: 12,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.glass,
        padding: 16,
        gap: 14,
    },
    cardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '15',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainerSelected: {
        backgroundColor: theme.colors.primary,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 2,
    },
    cardTitleSelected: {
        color: theme.colors.text,
    },
    cardDesc: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
    cardDescSelected: {
        color: theme.colors.textDim,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        marginTop: 'auto',
        gap: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});
