import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { BlurView } from 'expo-blur';
import { X, Shield, DollarSign, Clock, Swords, CheckCircle, Circle } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../config';
import PvPModal from '../components/PvPModal';
import HoloTutorial from '../components/HoloTutorial';
import { ChevronLeft } from 'lucide-react-native';

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

// Add props
export default function MissionMapScreen({ navigation, route, showTutorial, closeTutorial, saveMission, showPvPTutorial, closePvPTutorial, showPreviewTutorial, closePreviewTutorial }) {
    const userProfile = route?.params?.userProfile;

    if (!userProfile) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textDim, marginBottom: 20 }}>NO MISSION DATA FOUND.</Text>
                <TouchableOpacity style={{ padding: 10, borderWidth: 1, borderColor: theme.colors.primary }} onPress={() => navigation && navigation.navigate('Lobby')}>
                    <Text style={{ color: theme.colors.primary }}>RETURN TO BASE</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const [loading, setLoading] = useState(true);
    const [missions, setMissions] = useState([]);

    // PvP Selection State
    const [selectedSchools, setSelectedSchools] = useState([]);
    const [pvpVisible, setPvpVisible] = useState(false);

    // Mission Detail State
    const [selectedMission, setSelectedMission] = useState(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        console.log(`Fetching missions from ${API_URL}/api/score`);
        try {
            const payload = {
                gpa: userProfile.gpa,
                sat: userProfile.sat,
                major: userProfile.targetCareer,
                budget: userProfile.budget
            };

            const response = await axios.post(
                `${API_URL}/api/score`,
                payload,
                { headers: { "Bypass-Tunnel-Reminder": "true" }, timeout: 15000 } // Increased to 15s for slow tunnels
            );
            setMissions(response.data);
        } catch (error) {
            console.error("Fetch Missions Error:", error);
            // Alert.alert("Connection Error", "Could not reach Command Server. Running in Offline Simulation Mode.");
            // Silent fallback is better for UX if tunnel is flaky

            setMissions([
                { school_id: 1, school_name: 'Simulated University (OFFLINE)', compass_score: 95, ranking: 'S', debt_years: 1.2, earnings: 75000, debt: 15000, net_price: 18000 },
                { school_id: 2, school_name: 'Tech State (OFFLINE)', compass_score: 82, ranking: 'A', debt_years: 2.1, earnings: 68000, debt: 22000, net_price: 21000 },
                { school_id: 3, school_name: 'Debt College (OFFLINE)', compass_score: 40, ranking: 'F', debt_years: 8.5, earnings: 35000, debt: 45000, net_price: 40000 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        // Removed blocking API check to prevent timeout errors
        // Proceed directly to simulation/career selection
        setTimeout(() => {
            navigation.navigate('CareerSelectionScreen', {
                school: selectedMission,
                profile: userProfile
            });
            setSelectedMission(null);
            setAccepting(false);
        }, 500);
    };

    // Toggle Selection for PvP
    const toggleSelection = (school) => {
        const isSelected = selectedSchools.find(s => s.school_id === school.school_id);
        if (isSelected) {
            setSelectedSchools(prev => prev.filter(s => s.school_id !== school.school_id));
        } else {
            if (selectedSchools.length < 2) {
                setSelectedSchools(prev => [...prev, school]);
            } else {
                Alert.alert("Target Limit", "Only 2 targets can be compared at once.");
            }
        }
    };

    const renderItem = ({ item }) => {
        const isSelected = selectedSchools.find(s => s.school_id === item.school_id);
        return (
            <TouchableOpacity
                style={[styles.card, isSelected && styles.selectedCard]}
                onPress={() => setSelectedMission(item)}
                onLongPress={() => toggleSelection(item)}
            >
                {/* Checkbox */}
                <TouchableOpacity
                    style={styles.checkBox}
                    onPress={() => toggleSelection(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    {isSelected ? (
                        <CheckCircle color={theme.colors.tacticalGreen} size={24} fill="rgba(0,255,153,0.1)" />
                    ) : (
                        <Circle color={theme.colors.glassBorder} size={24} />
                    )}
                </TouchableOpacity>

                <View style={styles.cardLeft}>
                    <TierBadge tier={item.ranking} />
                    <View style={styles.schoolInfo}>
                        <Text style={styles.schoolName} numberOfLines={1}>{item.school_name}</Text>
                        <Text style={styles.score}>TACTICAL SCORE: {item.compass_score}</Text>
                    </View>
                </View>
                <View style={styles.cardRight}>
                    {/* Add visual indicator or leave blank if cooldown removed */}
                </View>
            </TouchableOpacity >
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="MAP" />

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 10 }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, marginRight: 8, borderWidth: 1, borderColor: theme.colors.glassBorder, borderRadius: 8 }}>
                    <ChevronLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>MISSION MAP</Text>
                    <Text style={styles.headerSubtitle}>Targets Acquired: {missions.length}</Text>
                </View>
            </View>

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

            {/* PVP FAB */}
            {selectedSchools.length === 2 && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setPvpVisible(true)}
                >
                    <Swords color="#000" size={24} />
                    <Text style={styles.fabText}>INITIATE COMPARISON</Text>
                </TouchableOpacity>
            )}

            <PvPModal
                visible={pvpVisible}
                onClose={() => setPvpVisible(false)}
                school1={selectedSchools[0]}
                school2={selectedSchools[1]}
                saveMission={saveMission}
                userProfile={userProfile}
                showTutorial={showPvPTutorial}
                closeTutorial={closePvPTutorial}
            />

            {/* Mission Preview Tutorial */}
            <HoloTutorial
                visible={showPreviewTutorial && !!selectedMission}
                onClose={closePreviewTutorial}
                scenario="MISSION_PREVIEW"
            />

            {/* Mission Detail Overlay (Replaced Modal with Absolute View to allow Tutorial Overlay) */}
            {selectedMission && (
                <View style={[StyleSheet.absoluteFill, { zIndex: 50 }]}>
                    <BlurView intensity={90} tint="dark" style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={[styles.modalHeader, { paddingRight: 10 }]}>
                                <Text style={[styles.damageTitle, { flex: 1 }]}>{selectedMission.school_name}</Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedMission(null)}
                                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                >
                                    <X color={theme.colors.text} size={28} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.modalSchool}>{selectedMission.ranking} - TIER</Text>

                            <View style={styles.statRow}>
                                <View style={styles.statBlock}>
                                    <DollarSign color={theme.colors.danger} size={20} />
                                    <Text style={styles.statLabel}>COST TO ACQUIRE</Text>
                                    <Text style={styles.statValue}>
                                        ${selectedMission.sticker_price?.toLocaleString() || selectedMission.net_price?.toLocaleString() || 'N/A'}
                                    </Text>
                                </View>
                                <View style={styles.statBlock}>
                                    <Shield color={theme.colors.primary} size={20} />
                                    <Text style={styles.statLabel}>LOOT DROP</Text>
                                    <Text style={styles.statValue}>
                                        ${selectedMission.earnings?.toLocaleString() || 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.cooldownBlock}>
                                <Clock color={theme.colors.secondary} size={20} />
                                <Text style={styles.statLabel}>EST. COOLDOWN</Text>
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
                </View>
            )}
        </SafeAreaView>
    );
}

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
        paddingBottom: 80, // Space for FAB
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
    selectedCard: {
        borderColor: theme.colors.tacticalGreen,
        backgroundColor: 'rgba(0, 255, 153, 0.05)',
    },
    checkBox: {
        marginRight: theme.spacing.m,
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

    // FAB
    fab: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: theme.colors.tacticalGreen,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 30,
        gap: 10,
        elevation: 10,
        shadowColor: theme.colors.tacticalGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        zIndex: 100,
    },
    fabText: {
        color: '#000',
        fontFamily: theme.fonts.heading,
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
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
