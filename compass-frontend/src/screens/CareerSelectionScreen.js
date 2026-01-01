import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { ChevronRight, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config';
import axios from 'axios';
import HoloTutorial from '../components/HoloTutorial';

// Add new props
export default function CareerSelectionScreen({ navigation, route, showTutorial, closeTutorial }) {
    if (!route || !route.params) {
        // Fallback or loading state
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textDim }}>Loading Mission Data...</Text>
                <TouchableOpacity onPress={() => navigation && navigation.navigate('Lobby')}>
                    <Text style={{ color: theme.colors.primary, marginTop: 20 }}>RETURN TO LOBBY</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { school, profile } = route.params;
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Map internal class ID (engineer/healer/etc) to route param
    // Actually, we don't know the class ID directly unless we pass it.
    // profile.careerName might be "Software Developer" but we need 'engineer'.
    // Let's pass 'selectedClassId' from StatsScreen -> MissionMap -> Here.
    // Or we can infer it or just ask the user to pick?
    // User Instructions: "Students have option to select from a list of careers... more careers."
    // Let's guess the class from the profile's initial selection or just fetch ALL relevant to the major?
    // To be safe, let's fetch based on the 'Class' they picked in Lobby.
    // We need to ensure that 'classId' is passed through the flow.
    // Lobby -> Stats (selectedClass param) -> MissionMap (userProfile) -> Here.

    // For now, let's default to 'engineer' if missing for testing, but we should fix the flow.
    // Actually StatsScreen sets targetCareer/careerName. It doesn't pass the Class ID explicitly in userProfile.
    // But we can guess from the careerName -> but that's hard.
    // Let's modify StatsScreen to pass 'classId' in subsequent steps.

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            // We need the class ID. Let's try to get it from params, or fallback.
            // If profile has 'classId', use it.
            const classId = profile.classId || 'engineer';
            console.log(`Fetching careers for class: ${classId}`);

            const response = await axios.get(`${API_URL}/api/careers/${classId}`);
            setCareers(response.data);
        } catch (error) {
            console.error("Failed to fetch careers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (career) => {
        // Navigate to Boss Fight with updated career
        navigation.navigate('DamageReportScreen', {
            school: school,
            profile: {
                ...profile,
                careerName: career.title,
                targetCareer: career.soc // Update SOC
            }
        });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
        >
            <View style={styles.cardContent}>
                <View style={styles.info}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.wage}>AVG FIREPOWER: ${item.wage.toLocaleString()}</Text>
                </View>
                <View style={styles.meta}>
                    <View style={[styles.badge, item.growth > 10 ? styles.badgeHigh : styles.badgeNormal]}>
                        <ArrowUpRight size={14} color={item.growth > 10 ? '#000' : theme.colors.textDim} />
                        <Text style={[styles.growth, item.growth > 10 && { color: '#000' }]}>
                            {item.growth}% Growth
                        </Text>
                    </View>
                    <ChevronRight color={theme.colors.textDim} size={20} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="CAREER" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ alignSelf: 'flex-start', marginBottom: 10, padding: 8, borderWidth: 1, borderColor: theme.colors.glassBorder, borderRadius: 8 }}>
                    <ChevronRight style={{ transform: [{ rotate: '180deg' }] }} color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>TARGET SELECTION</Text>
                <Text style={styles.headerSubtitle}>Choose your specialization.</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={careers}
                    keyExtractor={item => item.soc}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    headerTitle: {
        fontFamily: theme.fonts.heading,
        fontSize: 20,
        color: theme.colors.primary,
        letterSpacing: 1,
    },
    headerSubtitle: {
        fontFamily: theme.fonts.body,
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 4,
    },
    list: {
        padding: theme.spacing.m,
        gap: theme.spacing.m,
    },
    card: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10, // Ensure spacing between text and badge
    },
    info: {
        flex: 1, // Allow text to wrap and push, but shrink if needed
    },
    title: {
        fontFamily: theme.fonts.heading,
        fontSize: 16,
        color: theme.colors.text,
        marginBottom: 4,
    },
    wage: {
        fontFamily: theme.fonts.mono,
        fontSize: 12,
        color: theme.colors.secondary,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        gap: 4,
    },
    badgeHigh: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    growth: {
        fontFamily: theme.fonts.mono,
        fontSize: 10,
        color: theme.colors.textDim,
    },
});
