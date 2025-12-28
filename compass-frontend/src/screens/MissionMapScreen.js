import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { BlurView } from 'expo-blur';
import { X, Shield, DollarSign, Clock } from 'lucide-react-native';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

const TierBadge = ({ tier }) => {
    const getColor = () => {
        switch (tier) {
            case 'S': return theme.colors.primary;
            case 'A': return theme.colors.secondary;
            case 'B': return theme.colors.warning;
            case 'F': return theme.colors.danger;
            default: return theme.colors.textDim;
        }
    };

    return (
        <View style={[styles.tierBadge, { borderColor: getColor() }]}>
            <Text style={[styles.tierText, { color: getColor() }]}>{tier}</Text>
        </View>
    );
};

export default function MissionMapScreen({ navigation, route }) {
    const { userProfile } = route.params;
    const [loading, setLoading] = useState(true);
    const [missions, setMissions] = useState([]);
    const [selectedMission, setSelectedMission] = useState(null);
    const [accepting, setAccepting] = useState(false);

    const handleAccept = async () => {
        console.log("Accept Mission Button Pressed!"); // DEBUG LOG
        setAccepting(true);
        try {
            console.log(`Sending request to ${API_URL}/api/test...`);
            await axios.get(`${API_URL}/api/test`, { timeout: 60000 });

            // Success
            // Alert.alert("Mission Accepted", `Deployment to ${selectedMission.school_name} confirmed.`);
            navigation.navigate('MissionBrief', { schoolName: selectedMission.school_name });
            setSelectedMission(null);
        } catch (error) {
            console.error("Accept Mission Error:", error);
            if (error.code === 'ECONNABORTED') {
                Alert.alert("Server Timeout", "The server took too long to respond.");
            } else {
                Alert.alert("Error", "Server connection failed. Is the backend running?");
            }
        } finally {
            setAccepting(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        console.log(`Fetching missions from ${API_URL}/api/score with profile:`, userProfile);
        try {
            const payload = {
                gpa: userProfile.gpa,
                sat: userProfile.sat,
                major: userProfile.targetCareer, // Map targetCareer to 'major'
                budget: userProfile.budget
            };

            const response = await axios.post(`${API_URL}/api/score`, payload);
            console.log("Missions received:", response.data.length);
            setMissions(response.data);
        } catch (error) {
            console.error("Fetch Missions Error:", error);
            Alert.alert("Connection Error", "Could not reach Command Server. Running in Offline Simulation Mode.");

            // Fallback data for demo if API fails/offline
            // User Note: This is why you see "Duplicate Results" -> The API is failing!
            setMissions([
                { school_id: 1, school_name: 'Simulated University (OFFLINE)', compass_score: 95, ranking: 'S', debt_years: 1.2, earnings: 75000, debt: 15000, net_price: 18000 },
                { school_id: 2, school_name: 'Tech State (OFFLINE)', compass_score: 82, ranking: 'A', debt_years: 2.1, earnings: 68000, debt: 22000, net_price: 21000 },
                { school_id: 3, school_name: 'Debt College (OFFLINE)', compass_score: 40, ranking: 'F', debt_years: 8.5, earnings: 35000, debt: 45000, net_price: 40000 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => setSelectedMission(item)}>
            <View style={styles.cardLeft}>
                <TierBadge tier={item.ranking} />
                <View style={styles.schoolInfo}>
                    <Text style={styles.schoolName} numberOfLines={1}>{item.school_name}</Text>
                    <Text style={styles.score}>COMPASS SCORE: {item.compass_score}</Text>
                </View>
            </View>
            <View style={styles.cardRight}>
                <Text style={styles.detailText}>ROI: {item.debt_years}y</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>MISSION MAP</Text>
            <Text style={styles.headerSubtitle}>Targets Acquired: {missions.length}</Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                    <Text style={styles.loadingText}>SCANNING DATABASE...</Text>
                </View>
            ) : (
                <FlatList
                    data={missions}
                    renderItem={renderItem}
                    keyExtractor={item => item.school_id.toString()}
                    contentContainerStyle={styles.list}
                />
            )}

            {selectedMission && (
                <Modal transparent={true} animationType="fade" visible={!!selectedMission}>
                    <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.damageTitle}>DAMAGE REPORT</Text>
                                <TouchableOpacity onPress={() => setSelectedMission(null)}>
                                    <X color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalSchool}>{selectedMission.school_name}</Text>

                            <View style={styles.statRow}>
                                <View style={styles.statBlock}>
                                    <DollarSign color={theme.colors.danger} size={20} />
                                    <Text style={styles.statLabel}>COST TO ACQUIRE</Text>
                                    <Text style={styles.statValue}>${selectedMission.net_price?.toLocaleString() || 'N/A'}</Text>
                                </View>

                                <View style={styles.statBlock}>
                                    <Shield color={theme.colors.primary} size={20} />
                                    <Text style={styles.statLabel}>LOOT DROP/YR</Text>
                                    <Text style={styles.statValue}>${selectedMission.earnings?.toLocaleString() || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.cooldownBlock}>
                                <Clock color={theme.colors.secondary} size={20} />
                                <Text style={styles.statLabel}>COOLDOWN (PAYOFF)</Text>
                                <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                                    {selectedMission.debt_years} YEARS
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.acceptButton, accepting && styles.disabledButton]}
                                onPress={handleAccept}
                                disabled={accepting}
                            >
                                {accepting ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <Text style={styles.acceptText}>ACCEPT MISSION</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Modal>
            )}
        </SafeAreaView>
    );
}
// Helper Styles appended in replace_file tool if needed or relying on existing disabledButton style? 
// Existing styles has disabledButton: opacity: 0.5. Perfect.


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.primary,
        fontSize: 24,
        letterSpacing: 2,
        marginTop: theme.spacing.s,
    },
    headerSubtitle: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        marginBottom: theme.spacing.l,
    },
    list: {
        gap: theme.spacing.s,
        paddingBottom: theme.spacing.xl,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.m,
        flex: 1,
    },
    schoolInfo: {
        flex: 1,
    },
    tierBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    tierText: {
        fontFamily: theme.fonts.heading,
        fontSize: 20,
    },
    schoolName: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 16,
    },
    score: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        fontSize: 10,
    },
    detailText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.secondary,
    },
    loadingText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.text,
        marginTop: theme.spacing.m,
        letterSpacing: 2,
    },
    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.l,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
        gap: theme.spacing.l,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
        paddingBottom: theme.spacing.m,
    },
    damageTitle: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.danger,
        fontSize: 18,
        letterSpacing: 1,
    },
    modalSchool: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 24,
        textAlign: 'center',
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statBlock: {
        alignItems: 'center',
        gap: theme.spacing.s,
    },
    cooldownBlock: {
        alignItems: 'center',
        gap: theme.spacing.s,
        backgroundColor: theme.colors.glass,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.m,
    },
    statLabel: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        fontSize: 10,
    },
    statValue: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 20,
    },
    acceptButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.m,
        borderRadius: theme.borderRadius.s,
        alignItems: 'center',
    },
    acceptText: {
        fontFamily: theme.fonts.heading,
        color: '#000',
        fontSize: 16,
    },
    disabledButton: {
        opacity: 0.5,
    },
});
