import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { X, Swords, Trophy, DollarSign, Clock } from 'lucide-react-native';
import LoadoutPanel from './LoadoutPanel';
import { LineChart } from 'react-native-chart-kit';
import HoloTutorial from './HoloTutorial';

export default function PvPModal({ visible, onClose, school1, school2, userProfile, saveMission, showTutorial, closeTutorial }) {
    if (!school1 || !school2) return null;
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // --- SHARED LOADOUT STATE ---
    const [scholarships, setScholarships] = useState(0);
    const [familyContribution, setFamilyContribution] = useState(0);
    const [workStudy, setWorkStudy] = useState(0);

    // --- PERSONA WEIGHTS ---
    const getWeights = (socCode) => {
        if (!socCode) return { w_roi: 40, w_budget: 30, w_prestige: 30 };
        const prefix = socCode.substring(0, 2);

        // LEADER (Business/Mgmt)
        if (['11', '13'].includes(prefix)) return { w_roi: 40, w_budget: 20, w_prestige: 40 };
        // CREATIVE (Arts/Education)
        if (['27', '21', '25'].includes(prefix)) return { w_roi: 20, w_budget: 60, w_prestige: 20 };
        // ENGINEER (STEM)
        if (['15', '17'].includes(prefix)) return { w_roi: 60, w_budget: 20, w_prestige: 20 };
        // HEALER (Healthcare)
        if (['29', '51'].includes(prefix)) return { w_roi: 35, w_budget: 35, w_prestige: 30 };

        return { w_roi: 40, w_budget: 30, w_prestige: 30 };
    };

    const weights = getWeights(userProfile?.targetCareer);

    // --- DYNAMIC MATH ---
    const calculateStats = (school) => {
        // PARSER: Ensure numbers
        const val = (v, d = 0) => { const p = parseFloat(v); return !isNaN(p) && isFinite(p) ? p : d; };

        const netPrice = val(school.net_price, 0);
        const stickerPrice = val(school.sticker_price, 0);
        const earnings = val(school.earnings, 50000);
        const admRate = val(school.adm_rate, 1.0); // Default to open

        // DISPLAY uses Sticker (Hard Mode)
        const displayCost = stickerPrice || netPrice || 25000;
        const totalDegreeCost = displayCost * 4;

        // Effective Debt (Display)
        const effectiveDebt = Math.max(0, totalDegreeCost - scholarships - familyContribution - workStudy);

        const salary = earnings;
        const repayment = salary * 0.20;

        const cooldown = repayment > 0 ? (effectiveDebt / repayment) : 99;

        // SCORE uses Net (Optimistic)
        const scoreCost = (netPrice > 0) ? netPrice : displayCost;
        const optimisticDebt = Math.max(0, (scoreCost * 4 - scholarships - familyContribution - workStudy));
        const optimisticCooldown = repayment > 0 ? (optimisticDebt / repayment) : 99;

        // 1. ROI Score
        const roiScore = Math.max(0, weights.w_roi - (optimisticCooldown * 1.5));

        // 2. Budget Score
        const isElite = admRate < 0.20;
        const annualNetCost = Math.max(0, (scoreCost * 4 - scholarships - familyContribution - workStudy) / 4);
        const budgetTarget = parseInt(userProfile?.budget) || 25000;

        let budgetScore = weights.w_budget;

        if (annualNetCost > budgetTarget) {
            const ratio = annualNetCost / budgetTarget;
            let penalty = (ratio - 1.0) * 100;
            if (isElite) penalty *= 0.25;
            budgetScore = Math.max(0, weights.w_budget - penalty);
        }

        // 3. Prestige Score
        const prestigeScore = (1.0 - admRate) * weights.w_prestige;

        const dynamicScore = Math.min(100, Math.floor(roiScore + budgetScore + prestigeScore));

        return {
            name: school.school_name,
            score: Math.max(0, dynamicScore),
            rawCost: displayCost,
            effectiveDebt: effectiveDebt,
            cooldown: parseFloat(cooldown.toFixed(1)),
            salary: salary,
            repayment: repayment
        };
    };

    const s1 = calculateStats(school1);
    const s2 = calculateStats(school2);

    // --- VICTORY GRAPH DATA ---
    const maxYears = Math.ceil(Math.max(s1.cooldown, s2.cooldown, 5)) + 1;
    const labels = Array.from({ length: 6 }, (_, i) => Math.floor((maxYears / 5) * i));

    const getDataPoints = (stats) => {
        return labels.map(year => {
            const remaining = stats.effectiveDebt - (stats.repayment * year);
            return Math.max(0, remaining);
        });
    };

    const d1 = getDataPoints(s1);
    const d2 = getDataPoints(s2);

    const chartData = {
        labels: labels.map(String),
        datasets: [
            {
                data: d1,
                color: (opacity = 1) => theme.colors.tacticalGreen,
                strokeWidth: 2,
                withDots: false,
            },
            {
                data: d2,
                color: (opacity = 1) => '#00D1FF',
                strokeWidth: 2,
                withDots: false,
            }
        ],
        legend: ["School 1", "School 2"]
    };

    const StatRow = ({ label, icon: Icon, val1, val2, isBetter, format }) => {
        const win1 = isBetter(val1, val2);
        const win2 = isBetter(val2, val1);
        return (
            <View style={styles.statRow}>
                <View style={[styles.valBox, win1 && styles.winnerBox]}>
                    <Text style={[styles.valText, win1 && styles.winnerText]}>
                        {format ? format(val1) : val1}
                    </Text>
                </View>
                <View style={styles.labelBox}>
                    <Icon color={theme.colors.textDim} size={16} />
                    <Text style={styles.labelText}>{label}</Text>
                </View>
                <View style={[styles.valBox, win2 && styles.winnerBox]}>
                    <Text style={[styles.valText, win2 && styles.winnerText]}>
                        {format ? format(val2) : val2}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <BlurView intensity={95} tint="dark" style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>TACTICAL COMPARISON</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.sectionHeader}>
                        <Swords color={theme.colors.tacticalGreen} size={20} />
                        <Text style={styles.sectionTitle}>LIVE STATS</Text>
                    </View>
                    <View style={styles.schoolHeader}>
                        <Text style={[styles.schoolName, { color: theme.colors.tacticalGreen }]} numberOfLines={2}>{s1.name}</Text>
                        <Text style={styles.vs}>VS</Text>
                        <Text style={[styles.schoolName, { color: '#00D1FF' }]} numberOfLines={2}>{s2.name}</Text>
                    </View>
                    <StatRow label="TACTICAL SCORE" icon={Trophy} val1={s1.score} val2={s2.score} isBetter={(a, b) => a > b} />
                    <StatRow label="REMAINING BOSS HP" icon={DollarSign} val1={s1.effectiveDebt} val2={s2.effectiveDebt} isBetter={(a, b) => a < b} format={v => `$${(v / 1000).toFixed(0)}k`} />
                    <StatRow label="COOLDOWN" icon={Clock} val1={s1.cooldown} val2={s2.cooldown} isBetter={(a, b) => a < b} format={v => `${v}y`} />
                    <View style={styles.divider} />
                    <LoadoutPanel
                        scholarships={scholarships} setScholarships={setScholarships}
                        familyContribution={familyContribution} setFamilyContribution={setFamilyContribution}
                        workStudy={workStudy} setWorkStudy={setWorkStudy}
                    />
                    <View style={styles.graphContainer}>
                        <Text style={styles.graphTitle}>PAYOFF TRAJECTORY</Text>
                        <LineChart
                            data={chartData}
                            width={Dimensions.get("window").width - 40}
                            height={220}
                            yAxisLabel="$"
                            yAxisSuffix="k"
                            yAxisInterval={1}
                            formatYLabel={(v) => Math.round(v / 1000).toString()}
                            chartConfig={{
                                backgroundColor: "transparent",
                                backgroundGradientFrom: "transparent",
                                backgroundGradientTo: "transparent",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                propsForDots: { r: "0" },
                                propsForBackgroundLines: { strokeDasharray: "" }
                            }}
                            bezier
                            style={{ marginVertical: 8, borderRadius: 16 }}
                        />
                    </View>

                    <View style={{ marginTop: 20, marginBottom: 40, gap: 10 }}>
                        <TouchableOpacity
                            style={{ backgroundColor: theme.colors.tacticalGreen, padding: 15, borderRadius: 8, alignItems: 'center' }}
                            onPress={() => {
                                if (saveMission) {
                                    saveMission({
                                        id: Date.now(),
                                        date: new Date().toLocaleDateString(),
                                        target1: school1.school_name,
                                        target2: school2.school_name,
                                        score1: s1.score,
                                        score2: s2.score
                                    });
                                    alert("INTEL SAVED: Mission Data Encrypted to Dossier.");
                                } else {
                                    console.log('Save failed: saveMission prop missing');
                                    alert("ERROR: Save Uplink Offline.");
                                }
                            }}
                        >
                            <Text style={{ fontFamily: theme.fonts.heading, color: '#000', fontSize: 16 }}>SAVE INTEL REPORT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ backgroundColor: 'rgba(255, 0, 0, 0.2)', borderWidth: 1, borderColor: theme.colors.danger, padding: 15, borderRadius: 8, alignItems: 'center' }}
                            onPress={onClose}
                        >
                            <Text style={{ fontFamily: theme.fonts.heading, color: theme.colors.danger, fontSize: 16 }}>RETURN TO BASE</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </BlurView>
            <HoloTutorial
                visible={showTutorial}
                onClose={closeTutorial}
                scenario="PVP"
            />
        </Modal >
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1, paddingTop: 60, backgroundColor: 'rgba(0,0,0,0.9)' },
    header: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10, position: 'relative', paddingHorizontal: 20 },
    title: { color: '#fff', fontFamily: theme.fonts.heading, fontSize: 18, letterSpacing: 2 },
    closeBtn: { position: 'absolute', right: 20 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 10, gap: 10 },
    sectionTitle: { color: theme.colors.tacticalGreen, fontFamily: theme.fonts.heading, fontSize: 14, letterSpacing: 2 },
    schoolHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    schoolName: { fontFamily: theme.fonts.heading, fontSize: 14, width: '45%', textAlign: 'center' },
    vs: { color: '#666', fontFamily: theme.fonts.heading, fontSize: 12 },
    statRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, height: 50 },
    valBox: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    winnerBox: { backgroundColor: 'rgba(0, 255, 153, 0.1)', borderColor: theme.colors.tacticalGreen },
    valText: { color: '#888', fontFamily: theme.fonts.mono, fontSize: 14 },
    winnerText: { color: theme.colors.tacticalGreen, fontWeight: 'bold' },
    labelBox: { width: 80, alignItems: 'center', justifyContent: 'center', gap: 4 },
    labelText: { color: theme.colors.textDim, fontSize: 8, fontFamily: theme.fonts.mono, textAlign: 'center' },
    divider: { height: 1, backgroundColor: theme.colors.glassBorder, marginVertical: 20 },
    graphContainer: { marginTop: 10, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: 10 },
    graphTitle: { color: '#fff', fontFamily: theme.fonts.mono, fontSize: 12, marginBottom: 10, alignSelf: 'flex-start' }
});
