import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { API_URL } from '../config';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, ExternalLink, TrendingUp, DollarSign, Clock, Bookmark } from 'lucide-react-native';

export default function DamageReportScreen({ route, navigation, saveMission, savedMissions, deleteMission }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    if (!route || !route.params) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <Text style={{ color: theme.colors.textDim }}>No college data found.</Text>
                    <TouchableOpacity onPress={() => navigation && navigation.goBack()}>
                        <Text style={{ color: theme.colors.primary, marginTop: 20 }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const { school, profile } = route.params;

    // Financial calculations
    const pricePerYear = school.sticker_price || school.net_price || 15000;
    const totalDegreeCost = pricePerYear * 4;
    const baseSalary = school.earnings || 50000;

    // Career data state
    const [careerData, setCareerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    // Offline fallback data
    // Offline data for all supported careers
    // Offline fallback data (Accurate BLS 2023-24 approx)
    const OFFLINE_DATA = {
        // Business & Finance
        "11-1011": { title: "Chief Executive", annual_mean_wage: 246440, projected_growth: -3.0 },
        "11-2021": { title: "Marketing Manager", annual_mean_wage: 157620, projected_growth: 6.6 },
        "11-3031": { title: "Financial Manager", annual_mean_wage: 156100, projected_growth: 16.0 },
        "11-1021": { title: "General Manager", annual_mean_wage: 101270, projected_growth: 4.2 },
        "11-2022": { title: "Sales Manager", annual_mean_wage: 140600, projected_growth: 4.0 },
        "11-3121": { title: "HR Manager", annual_mean_wage: 136350, projected_growth: 5.2 },
        "13-1111": { title: "Management Analyst", annual_mean_wage: 99410, projected_growth: 10.0 },
        "13-2011": { title: "Accountant", annual_mean_wage: 86740, projected_growth: 4.4 },
        "23-1011": { title: "Lawyer", annual_mean_wage: 145760, projected_growth: 8.0 },
        "13-2051": { title: "Financial Analyst", annual_mean_wage: 99890, projected_growth: 8.0 },

        // Engineering & Tech
        "15-1252": { title: "Software Developer", annual_mean_wage: 132270, projected_growth: 25.0 },
        "17-2051": { title: "Civil Engineer", annual_mean_wage: 95890, projected_growth: 5.0 },
        "17-2141": { title: "Mechanical Engineer", annual_mean_wage: 100820, projected_growth: 10.0 },
        "17-2071": { title: "Electrical Engineer", annual_mean_wage: 109090, projected_growth: 5.0 },
        "17-2011": { title: "Aerospace Engineer", annual_mean_wage: 130720, projected_growth: 6.0 },
        "15-2051": { title: "Data Scientist", annual_mean_wage: 108020, projected_growth: 35.2 },
        "15-1211": { title: "Systems Analyst", annual_mean_wage: 103800, projected_growth: 9.6 },
        "17-2041": { title: "Chemical Engineer", annual_mean_wage: 112100, projected_growth: 8.0 },
        "17-2081": { title: "Environmental Eng", annual_mean_wage: 100090, projected_growth: 6.1 },
        "17-2031": { title: "Biomedical Eng", annual_mean_wage: 100730, projected_growth: 5.1 },

        // Healthcare
        "29-1248": { title: "Surgeon", annual_mean_wage: 350000, projected_growth: 4.0 }, // Capped logic usually
        "29-1141": { title: "Registered Nurse", annual_mean_wage: 86070, projected_growth: 5.6 },
        "29-1021": { title: "Dentist", annual_mean_wage: 175000, projected_growth: 4.4 },
        "29-1051": { title: "Pharmacist", annual_mean_wage: 136030, projected_growth: 2.6 },
        "29-1171": { title: "Nurse Practitioner", annual_mean_wage: 126260, projected_growth: 38.0 },
        "29-1123": { title: "Physical Therapist", annual_mean_wage: 99710, projected_growth: 15.1 },
        "29-1071": { title: "Physician Assistant", annual_mean_wage: 130020, projected_growth: 26.5 },
        "19-1042": { title: "Medical Scientist", annual_mean_wage: 100890, projected_growth: 10.0 },
        "29-1041": { title: "Optometrist", annual_mean_wage: 129280, projected_growth: 8.8 },
        "19-3031": { title: "Psychologist", annual_mean_wage: 92740, projected_growth: 6.0 },

        // Arts & Media
        "27-1011": { title: "Art Director", annual_mean_wage: 105130, projected_growth: 5.6 },
        "27-1024": { title: "Graphic Designer", annual_mean_wage: 64500, projected_growth: 3.2 },
        "27-3041": { title: "Editor", annual_mean_wage: 76400, projected_growth: -3.8 },
        "27-1014": { title: "Multimedia Artist", annual_mean_wage: 89000, projected_growth: 8.0 },
        "27-2012": { title: "Producer", annual_mean_wage: 85320, projected_growth: 6.7 },
        "27-3031": { title: "PR Specialist", annual_mean_wage: 73250, projected_growth: 6.1 },
        "27-3043": { title: "Writer", annual_mean_wage: 78060, projected_growth: 4.1 },
        "17-1011": { title: "Architect", annual_mean_wage: 93310, projected_growth: 5.0 },
        "27-1025": { title: "Interior Designer", annual_mean_wage: 64130, projected_growth: 4.0 },
        "15-1255": { title: "UX Designer", annual_mean_wage: 105000, projected_growth: 16.2 }
    };

    useEffect(() => {
        fetchCareerData();
    }, []);

    const fetchCareerData = async () => {
        try {
            const socCode = profile?.targetCareer || "15-1252";
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
            console.warn("Using offline data:", error.message);
            const socCode = profile?.targetCareer || "15-1252";
            const fallback = OFFLINE_DATA[socCode] || {
                title: profile?.careerName || "General Career",
                annual_mean_wage: 65000,
                projected_growth: 4.0
            };
            setCareerData(fallback);
        } finally {
            setLoading(false);
        }
    };

    // Calculate payback period
    const calculatePayback = () => {
        const salary = careerData ? careerData.annual_mean_wage : baseSalary;
        const annualRepayment = salary * 0.20; // 20% of income toward loans
        if (annualRepayment <= 0) return 99;
        return (totalDegreeCost / annualRepayment).toFixed(1);
    };

    const paybackYears = calculatePayback();
    const effectiveSalary = careerData ? careerData.annual_mean_wage : baseSalary;

    // Check if saved
    const isSaved = () => {
        return savedMissions && savedMissions.some(m => m.schoolName === school.school_name);
    };

    const handleSave = () => {
        if (!saveMission) return;

        if (isSaved()) {
            const savedItem = savedMissions.find(m => m.schoolName === school.school_name);
            if (savedItem && deleteMission) {
                deleteMission(savedItem.id);
            }
        } else {
            saveMission({
                schoolName: school.school_name,
                tier: school.ranking,
                netPrice: school.net_price,
                cooldown: paybackYears,
                earnings: effectiveSalary,
                careerName: profile?.careerName,
                targetCareer: profile?.targetCareer,
                date: new Date().toLocaleDateString()
            });
            // Alert.alert("Saved!", `${school.school_name} added to your list.`);
        }
    };

    const handleVisitWebsite = () => {
        const searchQuery = encodeURIComponent(school.school_name + ' admissions');
        const url = `https://www.google.com/search?q=${searchQuery}`;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color={theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.schoolName}>{school.school_name}</Text>
                        <Text style={styles.tierLabel}>Tier {school.ranking}</Text>
                    </View>
                </View>

                {/* Career Outlook Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Career Outlook</Text>
                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary} />
                    ) : (
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <DollarSign size={18} color={theme.colors.primary} />
                                <Text style={styles.statLabel}>Avg Salary</Text>
                                <Text style={styles.statValue}>${effectiveSalary.toLocaleString()}</Text>
                            </View>
                            <View style={styles.statBox}>
                                <TrendingUp size={18} color={careerData?.projected_growth >= 0 ? theme.colors.primary : theme.colors.danger} />
                                <Text style={styles.statLabel}>Job Growth</Text>
                                <Text style={[styles.statValue, { color: careerData?.projected_growth >= 0 ? theme.colors.primary : theme.colors.danger }]}>
                                    {careerData?.projected_growth || 0}%
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Cost Analysis Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Cost Analysis</Text>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Annual Cost</Text>
                        <Text style={styles.costValue}>${pricePerYear.toLocaleString()}</Text>
                    </View>
                    <View style={styles.costRow}>
                        <Text style={styles.costLabel}>4-Year Total</Text>
                        <Text style={styles.costValue}>${totalDegreeCost.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.costRow, styles.highlightRow]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Clock size={16} color={theme.colors.secondary} />
                            <Text style={styles.costLabel}>Payback Period</Text>
                        </View>
                        <Text style={[styles.costValue, { color: theme.colors.secondary }]}>{paybackYears} years</Text>
                    </View>
                </View>

                {/* ROI Summary */}
                <View style={[styles.card, styles.roiCard]}>
                    <Text style={styles.roiTitle}>Return on Investment</Text>
                    <Text style={styles.roiValue}>
                        {parseFloat(paybackYears) < 5 ? '⭐ Excellent' :
                            parseFloat(paybackYears) < 8 ? '✓ Good' :
                                parseFloat(paybackYears) < 12 ? '⚠ Moderate' : '⛔ High Risk'}
                    </Text>
                    <Text style={styles.roiDesc}>
                        Based on paying 20% of salary toward loans after graduation
                    </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, isSaved() && styles.actionBtnSaved]}
                        onPress={handleSave}
                    >
                        <Bookmark size={18} color={isSaved() ? '#000' : theme.colors.text} fill={isSaved() ? '#000' : 'transparent'} />
                        <Text style={[styles.actionBtnText, isSaved() && { color: '#000' }]}>
                            {isSaved() ? 'Saved!' : 'Save College'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.websiteBtn} onPress={handleVisitWebsite}>
                        <ExternalLink size={16} color={theme.colors.primary} />
                        <Text style={styles.websiteBtnText}>Visit Website</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        padding: 20,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    backBtn: {
        padding: 8,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 10,
    },
    schoolName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    tierLabel: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
    card: {
        backgroundColor: theme.colors.glass,
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textDim,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        gap: 6,
    },
    statLabel: {
        fontSize: 12,
        color: theme.colors.textDim,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    highlightRow: {
        borderBottomWidth: 0,
        paddingTop: 14,
    },
    costLabel: {
        fontSize: 15,
        color: theme.colors.text,
    },
    costValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    roiCard: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    roiTitle: {
        fontSize: 12,
        color: theme.colors.textDim,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    roiValue: {
        fontSize: 24,
        fontWeight: '700',
        color: theme.colors.primary,
        marginBottom: 8,
    },
    roiDesc: {
        fontSize: 12,
        color: theme.colors.textDim,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 14,
        borderRadius: 12,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    actionBtnSaved: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
    },
    websiteBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    websiteBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
});
