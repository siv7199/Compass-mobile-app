import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ChevronRight, ArrowUpRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../config';
import axios from 'axios';

// Add new props
export default function CareerSelectionScreen({ navigation, route, showTutorial, closeTutorial }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

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

    // Offline Fallback Data (Mirror of Backend BLS Data)
    const OFFLINE_CAREERS = {
        'engineer': [
            { "title": "Software Developer", "wage": 132270, "growth": 25.0, "soc": "15-1252" },
            { "title": "Civil Engineer", "wage": 95890, "growth": 5.0, "soc": "17-2051" },
            { "title": "Mechanical Engineer", "wage": 100820, "growth": 10.0, "soc": "17-2141" },
            { "title": "Electrical Engineer", "wage": 106950, "growth": 5.0, "soc": "17-2071" },
            { "title": "Aerospace Engineer", "wage": 130720, "growth": 6.0, "soc": "17-2011" },
            { "title": "Computer Programmer", "wage": 99700, "growth": -11.0, "soc": "15-1251" },
            { "title": "Operations Analyst", "wage": 82360, "growth": 23.0, "soc": "15-2031" },
            { "title": "Chemist", "wage": 95570, "growth": 6.0, "soc": "19-2031" },
            { "title": "Biologist", "wage": 98770, "growth": 5.0, "soc": "19-1029" },
            { "title": "Robotics Engineer", "wage": 115560, "growth": 12.0, "soc": "17-2199" }
        ],
        'healer': [
            { "title": "Surgeon", "wage": 343990, "growth": 3.0, "soc": "29-1248" },
            { "title": "Registered Nurse", "wage": 86070, "growth": 6.0, "soc": "29-1141" },
            { "title": "Dentist", "wage": 191760, "growth": 4.0, "soc": "29-1021" },
            { "title": "Nurse Practitioner", "wage": 126260, "growth": 45.0, "soc": "29-1171" },
            { "title": "Pharmacist", "wage": 136030, "growth": 3.0, "soc": "29-1051" },
            { "title": "Physical Therapist", "wage": 99710, "growth": 15.0, "soc": "29-1123" },
            { "title": "Physician Assistant", "wage": 130020, "growth": 27.0, "soc": "29-1071" },
            { "title": "Nursing Assistant", "wage": 38130, "growth": 4.0, "soc": "31-1131" },
            { "title": "LPN / LVN", "wage": 59730, "growth": 5.0, "soc": "29-2061" },
            { "title": "Medical Scientist", "wage": 100890, "growth": 10.0, "soc": "19-1042" }
        ],
        'leader': [
            { "title": "Chief Executive", "wage": 258900, "growth": -8.0, "soc": "11-1011" },
            { "title": "Marketing Manager", "wage": 157620, "growth": 6.0, "soc": "11-2021" },
            { "title": "Financial Manager", "wage": 156100, "growth": 16.0, "soc": "11-3031" },
            { "title": "General Manager", "wage": 106470, "growth": 4.0, "soc": "11-1021" },
            { "title": "Sales Manager", "wage": 135790, "growth": 4.0, "soc": "11-2022" },
            { "title": "HR Manager", "wage": 136350, "growth": 5.0, "soc": "11-3121" },
            { "title": "Management Analyst", "wage": 99410, "growth": 10.0, "soc": "13-1111" },
            { "title": "Accountant", "wage": 79880, "growth": 4.0, "soc": "13-2011" },
            { "title": "Education Admin", "wage": 103460, "growth": 3.0, "soc": "11-9033" },
            { "title": "Lawyer", "wage": 145760, "growth": 8.0, "soc": "23-1011" }
        ],
        'creative': [
            { "title": "Art Director", "wage": 105130, "growth": 6.0, "soc": "27-1011" },
            { "title": "Graphic Designer", "wage": 57990, "growth": 3.0, "soc": "27-1024" },
            { "title": "Editor", "wage": 73080, "growth": -4.0, "soc": "27-3041" },
            { "title": "Multimedia Artist", "wage": 98950, "growth": 8.0, "soc": "27-1014" },
            { "title": "Producer / Director", "wage": 85320, "growth": 7.0, "soc": "27-2012" },
            { "title": "Public Relations", "wage": 67440, "growth": 6.0, "soc": "27-3031" },
            { "title": "Translator", "wage": 53640, "growth": 4.0, "soc": "27-4011" },
            { "title": "Music Director", "wage": 62460, "growth": 1.0, "soc": "27-2041" },
            { "title": "Commercial Designer", "wage": 77640, "growth": 4.0, "soc": "27-1021" },
            { "title": "Art Professor", "wage": 88350, "growth": 3.0, "soc": "25-1121" }
        ]
    };

    useEffect(() => {
        fetchCareers();
    }, []);

    const fetchCareers = async () => {
        try {
            const classId = (profile.classId || 'engineer').toLowerCase();
            console.log(`Fetching careers for class: ${classId}`);

            // Try API with 3s Timeout
            const response = await axios.get(`${API_URL}/api/careers/${classId}`, { timeout: 3000 });
            setCareers(response.data);
        } catch (error) {
            console.warn("API/Network Error. Using Offline Fallback for Careers.", error);
            // Fallback to offline data
            const classId = (profile.classId || 'engineer').toLowerCase();
            const offlineData = OFFLINE_CAREERS[classId] || OFFLINE_CAREERS['engineer'];
            setCareers(offlineData);
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
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        console.log("Back Button Pressed"); // Debug Log
                        if (navigation.canGoBack && navigation.canGoBack()) {
                            navigation.goBack();
                        } else {
                            // Fallback if goBack missing
                            navigation.goBack();
                        }
                    }}
                    style={{
                        alignSelf: 'flex-start',
                        marginBottom: 10,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: theme.colors.glassBorder,
                        borderRadius: 8,
                        zIndex: 10 // Restore normal zIndex
                    }}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
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

const getStyles = (theme) => StyleSheet.create({
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
