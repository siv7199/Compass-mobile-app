import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronRight } from 'lucide-react-native';
import axios from 'axios';

import { API_URL } from '../config';
import HoloTutorial from '../components/HoloTutorial';

export default function StatsScreen({ route, navigation, showTutorial, closeTutorial }) {
    if (!route || !route.params) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textDim }}>Loading Operative Data...</Text>
                <TouchableOpacity onPress={() => navigation && navigation.navigate('Lobby')}>
                    <Text style={{ color: theme.colors.primary, marginTop: 20 }}>RETURN TO LOBBY</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const { selectedClass } = route.params;
    const [gpa, setGpa] = useState('');
    const [sat, setSat] = useState(''); // New State
    const [budget, setBudget] = useState('30000'); // Default

    const handleDeploy = async () => {
        // Basic validation
        if (!gpa || !budget) return;

        // SAT Validation (Part 2: The SAT Fix)
        const satScore = parseInt(sat) || 0;
        if (satScore < 400 || satScore > 1600) {
            alert("STR SCORE ERROR: Input must be between 400 and 1600.");
            return;
        }

        // In a real app we would call API here or pass to next screen to call
        // Let's pass parameters to MissionMap and have it load the data (or call here and pass data)
        // Calling here allows handling loading state better for the "Deploying" effect.

        // For now, let's just pass params and let MissionMap fetch, 
        // to give the "Loading Mission" feel there.
        navigation.navigate('MissionMap', {
            userProfile: {
                gpa: parseFloat(gpa),
                sat: parseInt(sat) || 0, // Pass SAT
                budget: parseInt(budget),
                targetCareer: selectedCareer.soc, // Use specific SOC
                careerName: selectedCareer.title, // Use specific Title
                classId: selectedClass.id // Pass Class ID for Career Selection
            }
        });
    };

    // Sub-Careers Mapping
    const CAREERS = {
        'leader': [
            { title: 'Chief Executive', soc: '11-1011' },
            { title: 'Marketing Manager', soc: '11-2021' },
            { title: 'Financial Manager', soc: '11-3031' }
        ],
        'engineer': [
            { title: 'Software Developer', soc: '15-1252' },
            { title: 'Civil Engineer', soc: '17-2051' },
            { title: 'Mechanical Engineer', soc: '17-2141' }
        ],
        'healer': [
            { title: 'Physician (Surgeon)', soc: '29-1248' },
            { title: 'Registered Nurse', soc: '29-1141' },
            { title: 'Dentist', soc: '29-1021' }
        ],
        'creative': [
            { title: 'Art Director', soc: '27-1011' },
            { title: 'Graphic Designer', soc: '27-1024' },
            { title: 'Editor', soc: '27-3041' }
        ]
    };

    const classCareers = CAREERS[selectedClass.id] || [];
    const [selectedCareer, setSelectedCareer] = useState(classCareers[0]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="STATS" />
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, padding: 8, borderWidth: 1, borderColor: theme.colors.glassBorder, borderRadius: 8 }}>
                                <ChevronRight style={{ transform: [{ rotate: '180deg' }] }} color={theme.colors.text} size={24} />
                            </TouchableOpacity>
                            <Text style={styles.label}>OPERATIVE: {selectedClass.name.toUpperCase()}</Text>
                            <Text style={styles.title}>CALIBRATE STATS</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    <Text style={{ color: theme.colors.tacticalGreen }}>INT SCORE</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="3.5"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={gpa}
                                    onChangeText={setGpa}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    <Text style={{ color: theme.colors.tacticalGreen }}>STR SCORE</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="1200"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={sat}
                                    onChangeText={setSat}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    <Text style={{ color: theme.colors.tacticalGreen }}>MISSION BUDGET</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="25000"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={budget}
                                    onChangeText={setBudget}
                                />
                            </View>

                        </View>

                        <TouchableOpacity style={styles.deployButton} onPress={handleDeploy}>
                            <Text style={styles.deployText}>DEPLOY MISSION</Text>
                            <ChevronRight color="#000" />
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    header: {
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.xl,
    },
    label: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.secondary,
        fontSize: 12,
        marginBottom: theme.spacing.s,
    },
    title: {
        fontFamily: theme.fonts.heading,
        fontSize: 28,
        color: theme.colors.text,
    },
    form: {
        gap: theme.spacing.l,
    },
    inputGroup: {
        gap: theme.spacing.s,
    },
    inputLabel: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.primary,
        fontSize: 16,
    },
    input: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        color: theme.colors.text,
        fontFamily: theme.fonts.mono,
        fontSize: 24,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
    },
    hint: {
        fontFamily: theme.fonts.body,
        color: theme.colors.textDim,
        fontSize: 12,
        marginTop: theme.spacing.m,
    },
    pickerContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    pickerItem: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.glass,
    },
    pickerSelected: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
    },
    pickerText: {
        color: theme.colors.textDim,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
    deployButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.s,
        marginTop: 'auto',
        marginBottom: theme.spacing.xl,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    deployText: {
        fontFamily: theme.fonts.heading,
        color: '#000',
        fontSize: 18,
        marginRight: theme.spacing.s,
    }
});
