import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { API_URL } from '../config';
import { theme } from '../theme';
import LoadoutPanel from '../components/LoadoutPanel';
import HoloTutorial from '../components/HoloTutorial';

export default function DamageReportScreen({ route, navigation, showTutorial, setShowTutorial }) {
    if (!route || !route.params) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.tacticalBlack, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textDim }}>NO BATTLE DATA FOUND.</Text>
                <TouchableOpacity onPress={() => navigation && navigation.navigate('Lobby')}>
                    <Text style={{ color: theme.colors.primary, marginTop: 20 }}>RETURN TO BASE</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }
    const { school, profile } = route.params;

    // Loadout State (Financial Aid Modifiers)
    const [scholarships, setScholarships] = useState(0);
    const [familyContribution, setFamilyContribution] = useState(0);
    const [workStudy, setWorkStudy] = useState(0);
    // Removed Scroll Locking to prevent stuck state
    // Tutorial State is now controlled by Props from App.js

    // Boss State (Job Market Data)
    const [bossStats, setBossStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Validated Data from Previous Screen
    // GAME BALANCE: Use Sticker Price * 4 (Total Degree Cost) if available.
    // This allows the user to manually apply scholarships (reducing it to Net Price).
    const pricePerYear = school.sticker_price || school.net_price || 15000;
    const baseDebt = (pricePerYear * 4) || 60000;
    const baseSalary = school.earnings || 50000;

    // Animation
    const loadoutOpacity = useState(new Animated.Value(0))[0];

    useEffect(() => {
        // Fetch Boss Stats (BLS Data)
        fetchBossData();

        // Animate Loadout Panel
        Animated.timing(loadoutOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, []);

    // Offline SOC Data Map (Fallback)
    const OFFLINE_BOSS_DATA = {
        // Engineer
        "15-1252": { title: "Software Developer", annual_mean_wage: 132270, projected_growth: 25.0 },
        "17-2051": { title: "Civil Engineer", annual_mean_wage: 95890, projected_growth: 5.0 },
        "17-2141": { title: "Mechanical Engineer", annual_mean_wage: 100820, projected_growth: 10.0 },
        "17-2071": { title: "Electrical Engineer", annual_mean_wage: 106950, projected_growth: 5.0 },
        "17-2011": { title: "Aerospace Engineer", annual_mean_wage: 130720, projected_growth: 6.0 },
        // Healer
        "29-1141": { title: "Registered Nurse", annual_mean_wage: 86070, projected_growth: 6.0 },
        "29-1021": { title: "Dentist", annual_mean_wage: 191760, projected_growth: 4.0 },
        "29-1171": { title: "Nurse Practitioner", annual_mean_wage: 126260, projected_growth: 45.0 },
        // Leader
        "11-1011": { title: "Chief Executive", annual_mean_wage: 258900, projected_growth: -8.0 },
        "11-2021": { title: "Marketing Manager", annual_mean_wage: 157620, projected_growth: 6.0 },
        "23-1011": { title: "Lawyer", annual_mean_wage: 145760, projected_growth: 8.0 },
        // Creative
        "27-1011": { title: "Art Director", annual_mean_wage: 105130, projected_growth: 6.0 },
        "27-1024": { title: "Graphic Designer", annual_mean_wage: 57990, projected_growth: 3.0 }
    };

    const fetchBossData = async () => {
        try {
            // Use the specific Selected Career SOC, or fallback to Major, or default.
            const socCode = profile?.targetCareer || profile?.major || "15-1252";
            console.log(`Fighting Boss (Fetching Data) for SOC: ${socCode}`);

            // Try API with 3s timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${API_URL}/api/boss`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ soc_code: socCode }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error("Server Response Error");

            const data = await response.json();
            setBossStats(data);
        } catch (error) {
            console.warn("Boss Fight Network Error. Deploying Offline Tactics.", error);

            const socCode = profile?.targetCareer || profile?.major || "15-1252";
            const fallback = OFFLINE_BOSS_DATA[socCode] || {
                title: profile?.careerName || "Unknown Specialist",
                annual_mean_wage: 65000,
                projected_growth: 4.0,
                source: "Offline Database"
            };

            setBossStats(fallback);
        } finally {
            setLoading(false);
        }
    };

    // --- THE MATH ENGINE ---
    // Recalculate Cooldown (ROI Years) in real-time
    const calculateCooldown = () => {
        // 1. REDUCE THE ENEMY HP (DEBT)
        // Work Study acts like a scholarship: it lowers the amount you need to borrow.
        const effectiveDebt = Math.max(0, baseDebt - scholarships - familyContribution - workStudy);

        // 2. CALCULATE YOUR WEAPON DAMAGE (REPAYMENT POWER)
        // Use the Boss Salary if available, otherwise base salary.
        const salary = bossStats ? bossStats.annual_mean_wage : baseSalary;

        // Use the "20% Rule" (Standard banking logic):
        // A user can realistically put 20% of their gross income toward debt.
        // This prevents the "negative income" bug for lower salaries.
        const annualRepayment = salary * 0.20;

        if (annualRepayment <= 0) return 99.9; // Safety check

        // 3. RESULT
        const years = effectiveDebt / annualRepayment;
        return years.toFixed(1);
    };

    const cooldown = calculateCooldown();
    const effectiveSalary = bossStats ? bossStats.annual_mean_wage : baseSalary;
    const effectiveDebt = Math.max(0, baseDebt - scholarships - familyContribution - workStudy);

    return (
        <View style={styles.container}>
            {/* HOLO TUTORIAL OVERLAY */}
            <HoloTutorial visible={showTutorial} onClose={() => setShowTutorial(false)} />
            <ScrollView
                contentContainerStyle={styles.scroll}
            >

                {/* 1. THE BOSS CARD (Job Market) */}
                <View style={styles.bossCard}>
                    <BlurView intensity={80} style={styles.glass}>
                        <Text style={styles.header}>TARGET LOCKED</Text>

                        {loading ? (
                            <Text style={styles.loading}>Scanning Market Data...</Text>
                        ) : (
                            <>
                                <Text style={styles.bossTitle}>
                                    {bossStats.title || profile?.careerName || "Unknown Target"}
                                </Text>
                                {/* DEBUG LINE REMOVED */}
                                <View style={styles.statRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.label}>LOOT</Text>
                                        <Text style={styles.gold}>${effectiveSalary.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.label}>MARKET OUTLOOK</Text>
                                        <Text style={bossStats.projected_growth >= 0 ? styles.green : styles.red}>
                                            {bossStats.projected_growth}%
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </BlurView>
                </View>

                {/* 2. THE LOADOUT PANEL (Financial Aid) */}
                <Animated.View style={[styles.loadoutPanel, { opacity: loadoutOpacity }]}>
                    <LoadoutPanel
                        scholarships={scholarships} setScholarships={setScholarships}
                        familyContribution={familyContribution} setFamilyContribution={setFamilyContribution}
                        workStudy={workStudy} setWorkStudy={setWorkStudy}
                    />
                </Animated.View>

                {/* 3. DAMAGE REPORT (Results) */}
                <View style={styles.damageReport}>
                    <Text style={styles.damageLabel}>COOLDOWN</Text>
                    <Text style={styles.damageValue}>{cooldown} YEARS</Text>
                    <Text style={styles.subtext}>
                        To reduce Remaining HP (${effectiveDebt.toLocaleString()}) to zero
                    </Text>
                    <Text style={[styles.label, { marginTop: 10, color: theme.colors.textDim }]}>ROI RATING: {school.ranking || 'N/A'}-TIER</Text>

                    <TouchableOpacity
                        style={styles.deployButton}
                        onPress={() => navigation.navigate('MissionLogScreen', {
                            debt: effectiveDebt,
                            salary: effectiveSalary,
                            schoolName: school.school_name
                        })}
                    >
                        <Text style={styles.deployText}>EXECUTE MISSION</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    scroll: {
        padding: 20,
        paddingTop: 50,
    },
    glass: {
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    bossCard: {
        marginBottom: 30,
    },
    header: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 10,
    },
    bossTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        fontFamily: theme.fonts.heading,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statBox: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 10,
        borderRadius: 8,
        width: '48%',
    },
    label: {
        color: '#888',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: theme.fonts.mono,
    },
    gold: {
        color: theme.colors.neonGold,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 5,
        fontFamily: theme.fonts.heading,
    },
    green: { color: theme.colors.success, fontSize: 18, fontWeight: 'bold', marginTop: 5, fontFamily: theme.fonts.heading },
    red: { color: theme.colors.danger, fontSize: 18, fontWeight: 'bold', marginTop: 5, fontFamily: theme.fonts.heading },
    loading: { color: '#666', fontStyle: 'italic', fontFamily: theme.fonts.mono },
    source: { color: '#444', fontSize: 10, textAlign: 'right', marginTop: 5, fontFamily: theme.fonts.mono },

    loadoutPanel: {
        marginBottom: 30,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.neonGold,
        paddingLeft: 10,
        fontFamily: theme.fonts.heading,
    },
    sliderContainer: {
        marginBottom: 20,
    },
    sliderLabel: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 5,
        fontFamily: theme.fonts.mono,
    },

    damageReport: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 50,
    },
    damageLabel: {
        color: '#666',
        fontSize: 12,
        letterSpacing: 4,
        marginBottom: 5,
        fontFamily: theme.fonts.mono,
    },
    damageValue: {
        color: '#fff',
        fontSize: 42,
        fontWeight: '900',
        textShadowColor: theme.colors.secondary,
        textShadowRadius: 10,
        fontFamily: theme.fonts.heading,
    },
    subtext: {
        color: '#666',
        fontSize: 12,
        marginBottom: 30,
        fontFamily: theme.fonts.mono,
    },
    deployButton: {
        backgroundColor: theme.colors.secondary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    deployText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: theme.fonts.heading,
    },
});
