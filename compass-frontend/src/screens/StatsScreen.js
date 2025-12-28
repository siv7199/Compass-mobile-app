import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronRight } from 'lucide-react-native';
import axios from 'axios';

// API URL should actully be imported from a config
const API_URL = 'http://172.20.2.161:8000';

export default function StatsScreen({ route, navigation }) {
    const { selectedClass } = route.params;
    const [gpa, setGpa] = useState('');
    const [sat, setSat] = useState(''); // New State
    const [budget, setBudget] = useState('30000'); // Default

    const handleDeploy = async () => {
        // Basic validation
        if (!gpa || !budget) return;

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
                targetCareer: selectedClass.soc_codes, // Simplified: taking first logic
                careerName: selectedClass.name
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.header}>
                            <Text style={styles.label}>OPERATIVE: {selectedClass.name.toUpperCase()}</Text>
                            <Text style={styles.title}>CALIBRATE STATS</Text>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>INT (GPA)</Text>
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
                                <Text style={styles.inputLabel}>STR (SAT/ACT)</Text>
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
                                <Text style={styles.inputLabel}>RESOURCES (Budget $)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="25000"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={budget}
                                    onChangeText={setBudget}
                                />
                            </View>

                            <Text style={styles.hint}>
                                * STR/DEX (SAT/ACT) calibration skipped for rapid deployment.
                                Using default heuristic based on INT.
                            </Text>
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
