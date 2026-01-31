import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { BlurView } from 'expo-blur';
import { X, DollarSign, Clock, ChevronLeft, TrendingUp, Bookmark, Edit2 } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '../config';
import EditScenarioModal from './EditScenarioModal';
import { OFFLINE_CAREER_DATA } from '../data/CareerData';

const TierBadge = ({ tier }) => {
    const { theme } = useTheme();
    const getColor = () => {
        switch (tier) {
            case 'S': return '#FFD700';
            case 'A': return theme.colors.primary;
            case 'B': return theme.colors.secondary;
            case 'C': return theme.colors.info;
            default: return theme.colors.textDim;
        }
    };

    return (
        <View style={[{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: getColor() + '20',
            justifyContent: 'center',
            alignItems: 'center',
        }]}>
            <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: getColor()
            }}>{tier}</Text>
        </View>
    );
};

export default function MissionMapScreen({ navigation, route, saveMission, savedMissions = [], deleteMission, saveScenario, updateScenario, closeScenario, restartOnboarding, userProfile }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // State to hold the profile being displayed (allows for editing without navigation)
    // State to hold the profile being displayed (allows for editing without navigation)
    const [activeProfile, setActiveProfile] = useState(userProfile || route?.params?.userProfile);
    const [editModalVisible, setEditModalVisible] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setActiveProfile(userProfile);
        } else if (route?.params?.userProfile) {
            setActiveProfile(route.params.userProfile);
        }
    }, [userProfile, route?.params?.userProfile]);

    if (!activeProfile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={{ color: theme.colors.textDim, marginBottom: 20 }}>No search data found.</Text>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.navigate('CareerSelect')}
                    >
                        <Text style={{ color: theme.colors.primary }}>Start Over</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const [loading, setLoading] = useState(true);
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [saving, setSaving] = useState(false);
    const [careerData, setCareerData] = useState(null);
    const [loadingCareer, setLoadingCareer] = useState(false);

    // BLS career wage offline fallback data
    // BLS career wage offline fallback data
    // Data imported from ../data/CareerData.js

    // Fetch BLS career data when a school is selected
    useEffect(() => {
        if (selectedSchool) {
            fetchCareerData();
        } else {
            setCareerData(null);
        }
    }, [selectedSchool]);

    const fetchCareerData = async () => {
        setLoadingCareer(true);
        try {
            const socCode = activeProfile?.targetCareer || activeProfile?.career?.soc || "15-1252";
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${API_URL}/api/career`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soc_code: socCode }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Server error");
            const data = await response.json();
            setCareerData(data);
        } catch (error) {
            console.warn("Using offline career data:", error.message);
            const socCode = activeProfile?.targetCareer || activeProfile?.career?.soc || "15-1252";
            const fallback = OFFLINE_CAREER_DATA[socCode] || {
                title: activeProfile?.careerName || "General Career",
                annual_mean_wage: 65000,
                projected_growth: 4.0
            };
            setCareerData(fallback);
        } finally {
            setLoadingCareer(false);
        }
    };

    // Calculate payback using BLS salary
    const calculatePayback = (school) => {
        const salary = careerData?.annual_mean_wage || school.earnings || 50000;
        const annualCost = school.sticker_price || school.net_price || 25000;
        const totalDebt = annualCost * 4;
        const annualRepayment = salary * 0.20;
        if (annualRepayment <= 0) return 99;
        return (totalDebt / annualRepayment).toFixed(1);
    };

    useEffect(() => {
        fetchSchools();
    }, [activeProfile]); // Re-fetch when profile updates

    const handleUpdateProfile = (updatedProfile) => {
        setEditModalVisible(false);
        setActiveProfile(updatedProfile);

        // If it's a saved scenario (has ID), update persistence
        if (updatedProfile.id && updateScenario) {
            updateScenario(updatedProfile.id, updatedProfile);
        }
    };

    const fetchSchools = async () => {
        console.log(`Fetching from ${API_URL}/api/score`);
        setLoading(true);

        try {
            const payload = {
                gpa: parseFloat(activeProfile.gpa),
                sat: activeProfile.sat ? parseInt(activeProfile.sat) : null,
                major: activeProfile.career?.soc || "15-1252",
                budget: parseInt(activeProfile.budget),
                priorities: activeProfile.priorities || [],
                priorityWeights: activeProfile.priorityWeights || {}
            };

            const response = await axios.post(
                `${API_URL}/api/score`,
                payload,
                { headers: { "Bypass-Tunnel-Reminder": "true" }, timeout: 15000 }
            );
            setSchools(response.data);
        } catch (error) {
            console.log("Network unavailable. Using sample data.");
            setSchools([
                { school_id: 1, school_name: 'Sample University', compass_score: 95, ranking: 'S', debt_years: 1.2, earnings: 75000, debt: 15000, net_price: 18000 },
                { school_id: 2, school_name: 'Tech State', compass_score: 82, ranking: 'A', debt_years: 2.1, earnings: 68000, debt: 22000, net_price: 21000 },
                { school_id: 3, school_name: 'Community College', compass_score: 40, ranking: 'C', debt_years: 8.5, earnings: 35000, debt: 45000, net_price: 40000 },
            ]);
            Alert.alert("Connection Failed", "Could not reach the server. Showing sample usage data instead.");
            console.log("Connection Failed:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (school) => {
        navigation.navigate('CostAnalysis', {
            school,
            profile: activeProfile
        });
    };

    const isSaved = (school) => {
        return savedMissions.some(m => m.schoolName === school.school_name);
    };

    const handleSave = async (school) => {
        if (!school || !saveMission) return;
        setSaving(true);

        const alreadySaved = isSaved(school);

        if (alreadySaved) {
            // Find the ID to delete
            const savedItem = savedMissions.find(m => m.schoolName === school.school_name);
            if (savedItem && deleteMission) {
                deleteMission(savedItem.id);
            }
        } else {
            // Save logic
            const price = school.sticker_price || school.net_price || 0;

            // Determine specific career title
            // Priority: Fteched Data > Offline Lookup (by SOC) > Active Profile Name > General
            const socCode = activeProfile.targetCareer || activeProfile.career?.soc || "15-1252";
            const specificCareer = OFFLINE_CAREER_DATA[socCode];
            const finalCareerName = careerData?.title || specificCareer?.title || activeProfile.careerName || activeProfile.career?.name || "General Career";

            saveMission({
                schoolName: school.school_name,
                tier: school.ranking,
                netPrice: price, // Store Display Price (Sticker || Net) for cards
                net_price: school.net_price, // Store Raw Net
                sticker_price: school.sticker_price, // Store Raw Sticker
                cooldown: school.debt_years,
                earnings: school.earnings,
                careerName: finalCareerName,
                targetCareer: socCode,
                date: new Date().toLocaleDateString()
            });
            Alert.alert("Saved!", `${school.school_name} added to your list.`);
        }

        // Short delay to allow state update
        setTimeout(() => setSaving(false), 300);
    };


    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedSchool(item)}
        >
            <TierBadge tier={item.ranking} />
            <View style={styles.cardContent}>
                <Text style={styles.schoolName} numberOfLines={1}>{item.school_name}</Text>
                <Text style={styles.scoreText}>Match Score: {item.compass_score}</Text>
            </View>
            <Text style={styles.priceText}>
                ${(item.sticker_price || item.net_price || 0).toLocaleString()}/yr
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        // If viewing from Saved Tab (ScenarioDetails), just go back
                        if (route.name === 'ScenarioDetails') {
                            navigation.goBack();
                            return;
                        }

                        const handleClose = () => {
                            Alert.alert(
                                "Close Scenario?",
                                "Are you sure you want to close this scenario?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Close",
                                        style: "destructive",
                                        onPress: () => {
                                            if (closeScenario) closeScenario();
                                            navigation.navigate('EmptyScenario');
                                        }
                                    }
                                ]
                            );
                        };

                        if (activeProfile?.id) {
                            // Saved Scenario (Explore Tab) - Prompt to close
                            handleClose();
                        } else {
                            // New/Unsaved Scenario - Prompt to Save
                            Alert.alert(
                                "Save Scenario?",
                                "Do you want to save this scenario first?",
                                [
                                    {
                                        text: "Save",
                                        onPress: () => {
                                            Alert.prompt(
                                                "Name Scenario",
                                                "Enter a name for this search:",
                                                [
                                                    { text: "Cancel", style: "cancel" },
                                                    {
                                                        text: "Save",
                                                        onPress: (name) => {
                                                            const scenarioName = name.trim() || `Scenario ${new Date().toLocaleDateString()}`;
                                                            if (saveScenario) saveScenario({ ...activeProfile, name: scenarioName });
                                                            Alert.alert("Saved", "Scenario saved to portfolio.", [
                                                                { text: "OK", onPress: handleClose }
                                                            ]);
                                                        }
                                                    }
                                                ],
                                                "plain-text"
                                            );
                                        }
                                    },
                                    {
                                        text: "Don't Save",
                                        onPress: handleClose,
                                        style: "destructive"
                                    },
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    }
                                ]
                            );
                        }
                    }}
                    style={styles.backBtn}
                >
                    <ChevronLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.title} numberOfLines={1}>Your Matches</Text>
                </View>
            </View>

            {/* Edit Criteria button removed as requested */}
            {/*
            { (activeProfile?.id || route.params?.fromSaved) && (
                <TouchableOpacity
                    style={styles.refineBtn}
                    onPress={() => setEditModalVisible(true)}
                >
                    <Edit2 color={theme.colors.text} size={16} />
                    <Text style={styles.refineText}>Edit Criteria</Text>
                </TouchableOpacity>
            )}
            */}

            <Text style={styles.resultCount}>{schools.length} colleges found</Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={theme.colors.primary} size="large" />
                    <Text style={styles.loadingText}>Searching colleges...</Text>
                </View>
            ) : (
                <FlatList
                    data={schools}
                    renderItem={renderItem}
                    keyExtractor={item => item.school_id.toString()}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchSchools}
                />
            )}

            {/* School Detail Modal */}
            <Modal
                visible={!!selectedSchool}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedSchool(null)}
            >
                <BlurView intensity={90} tint="dark" style={styles.modalOverlay}>
                    {selectedSchool && (
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <TierBadge tier={selectedSchool.ranking} />
                                <Text style={styles.modalTitle} numberOfLines={2}>{selectedSchool.school_name}</Text>
                                <TouchableOpacity onPress={() => setSelectedSchool(null)}>
                                    <X color={theme.colors.textDim} size={24} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <DollarSign size={18} color={theme.colors.primary} />
                                    <Text style={styles.statLabel}>Annual Cost</Text>
                                    <Text style={styles.statValue}>
                                        ${(selectedSchool.sticker_price || selectedSchool.net_price || 0).toLocaleString()}/yr
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <TrendingUp size={18} color={theme.colors.secondary} />
                                    <Text style={styles.statLabel}>Avg Salary</Text>
                                    <Text style={styles.statValue}>
                                        {loadingCareer ? '...' : `$${(careerData?.annual_mean_wage || selectedSchool.earnings || 0).toLocaleString()}/yr`}
                                    </Text>
                                </View>
                                <View style={styles.statBox}>
                                    <Clock size={18} color={theme.colors.info} />
                                    <Text style={styles.statLabel}>Payback Time</Text>
                                    <Text style={styles.statValue}>
                                        {loadingCareer ? '...' :
                                            (() => {
                                                const years = calculatePayback(selectedSchool);
                                                return years >= 99 ? 'N/A' : `${years} years`;
                                            })()
                                        }
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.saveBtn, isSaved(selectedSchool) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                                    onPress={() => handleSave(selectedSchool)}
                                    disabled={saving}
                                >
                                    <Bookmark
                                        size={18}
                                        color={isSaved(selectedSchool) ? '#000' : theme.colors.text}
                                        fill={isSaved(selectedSchool) ? '#000' : 'transparent'}
                                    />
                                    <Text style={[styles.saveBtnText, isSaved(selectedSchool) && { color: '#000' }]}>
                                        {isSaved(selectedSchool) ? 'Saved' : 'Save'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.detailsBtn}
                                    onPress={() => {
                                        const schoolToPass = selectedSchool;
                                        setSelectedSchool(null);
                                        handleViewDetails(schoolToPass);
                                    }}
                                >
                                    <Text style={styles.detailsBtnText}>View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </BlurView>
            </Modal>

            <EditScenarioModal
                visible={editModalVisible}
                onClose={() => setEditModalVisible(false)}
                userProfile={activeProfile}
                onSave={handleUpdateProfile}
            />
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 20,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    backBtn: {
        padding: 8,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 10,
    },
    label: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
    refineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: theme.colors.glass,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    refineText: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },

    title: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.text,
        flex: 1,
        textAlign: 'center',
    },
    resultCount: {
        fontSize: 14,
        color: theme.colors.textDim,
        marginBottom: 16,
    },
    list: {
        gap: 10,
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        padding: 14,
        borderRadius: 12,
        gap: 12,
    },
    cardContent: {
        flex: 1,
    },
    schoolName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    scoreText: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 2,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    loadingText: {
        color: theme.colors.textDim,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    modalTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.glass,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textDim,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    saveBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    saveBtnText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.text,
    },
    detailsBtn: {
        flex: 2,
        padding: 14,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    detailsBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
});
