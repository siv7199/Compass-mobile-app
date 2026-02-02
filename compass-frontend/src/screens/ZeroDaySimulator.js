import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, Calendar, TrendingUp, Trophy, FlaskConical, DollarSign, Bookmark } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { track, EVENTS } from '../utils/analytics';

// Loan Constants (Federal Direct Loans 2024-2025)
const LOAN_DATA = {
    interestRate: 0.0639,      // 6.39% Direct Subsidized/Unsubsidized
    originationFee: 0.0106,    // 1.06%
};

import { OFFLINE_CAREER_DATA } from '../data/CareerData';

export default function ZeroDaySimulator({ navigation, route, saveSimulation, savedSimulations, deleteSimulation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const { school, profile, careerData, simulation } = route.params || {};

    // Interactive slider states
    const [principalReduction, setPrincipalReduction] = useState(simulation?.principalReduction || 0);
    const [monthlyAddOn, setMonthlyAddOn] = useState(simulation?.monthlyAddOn || 0);
    const [useSalary75th, setUseSalary75th] = useState(simulation?.salaryTier === '75th' || false);

    // Track ID locally for immediate UI feedback before props update
    // localSavedId removed to rely on props for source of truth (fixes 'stuck saved' bug)

    // Check if currently saved
    // Unified logic to determine specific career name
    const resolvedCareerName = useMemo(() => {
        // If we are editing an existing simulation, keep its name (unless it's generic)
        if (simulation?.careerName && simulation.careerName !== 'General Career') {
            return simulation.careerName;
        }

        const socCode = careerData?.soc_code || profile?.targetCareer || profile?.career?.soc || "15-1252";
        const specificCareer = OFFLINE_CAREER_DATA[socCode];
        return careerData?.title || specificCareer?.title || profile?.careerName || 'General Career';
    }, [careerData, profile, simulation]);

    // Check if currently saved
    const savedId = useMemo(() => {
        // 1. Check if the passed 'simulation' prop matches CURRENT state
        if (simulation?.id &&
            simulation.principalReduction === principalReduction &&
            simulation.monthlyAddOn === monthlyAddOn &&
            simulation.salaryTier === (useSalary75th ? '75th' : 'Median')
        ) {
            return simulation.id;
        }

        // 2. Scan all saved simulations for a match with CURRENT state
        return savedSimulations?.find(s =>
            s.schoolName === (school?.school_name || simulation?.schoolName) &&
            s.careerName === resolvedCareerName &&
            s.principalReduction === principalReduction &&
            s.monthlyAddOn === monthlyAddOn &&
            s.salaryTier === (useSalary75th ? '75th' : 'Median')
        )?.id;
    }, [simulation, savedSimulations, school, resolvedCareerName, principalReduction, monthlyAddOn, useSalary75th]);

    const isSaved = !!savedId;

    // Get base values
    const baseSalary = careerData?.annual_mean_wage || school?.earnings || 65000;
    const salary75th = baseSalary * 1.3; // Approximate 75th percentile
    const effectiveSalary = useSalary75th ? salary75th : baseSalary;

    const annualCost = school?.sticker_price || school?.net_price || 25000;
    const totalDebt = (annualCost * 4) - principalReduction;
    const adjustedDebt = totalDebt * (1 + LOAN_DATA.originationFee); // Add origination fee

    // Calculate debt-free date
    const debtFreeData = useMemo(() => {
        // Monthly payment (20% of salary / 12) + add-on
        const baseMonthlyPayment = (effectiveSalary * 0.20) / 12;
        const totalMonthlyPayment = baseMonthlyPayment + monthlyAddOn;

        if (totalMonthlyPayment <= 0 || adjustedDebt <= 0) {
            return { months: 0, date: new Date() };
        }

        // Amortization with interest
        const monthlyRate = LOAN_DATA.interestRate / 12;
        let balance = adjustedDebt;
        let months = 0;
        const maxMonths = 360; // 30 year cap

        while (balance > 0 && months < maxMonths) {
            const interest = balance * monthlyRate;
            const principal = totalMonthlyPayment - interest;

            if (principal <= 0) {
                // Payment doesn't cover interest
                months = maxMonths;
                break;
            }

            balance -= principal;
            months++;
        }

        const debtFreeDate = new Date();
        debtFreeDate.setMonth(debtFreeDate.getMonth() + months);

        return { months, date: debtFreeDate };
    }, [effectiveSalary, adjustedDebt, monthlyAddOn]);

    // Format date nicely
    const formatDate = (date) => {
        const options = { month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    };

    // Aura-based advice
    const getAuraAdvice = () => {
        const advice = [];

        // Sports Powerhouse
        if (school?.has_sports === 1 || school?.has_sports === true) {
            advice.push({
                icon: Trophy,
                title: 'Sports Powerhouse',
                message: 'Strong athletics = larger alumni networks. Could accelerate your job search by 3-6 months.',
                color: theme.colors.warning
            });
        }

        // R1 Research Hub (C21BASIC = 15)
        if (school?.c21basic === 15) {
            advice.push({
                icon: FlaskConical,
                title: 'R1 Research Hub',
                message: 'Top-tier research university. Prestige can boost starting salaries by 10-15% in STEM.',
                color: theme.colors.info
            });
        }

        // R2 Research (C21BASIC = 16)
        if (school?.c21basic === 16) {
            advice.push({
                icon: FlaskConical,
                title: 'R2 Research Institution',
                message: 'Strong research focus with good faculty ratios. Great for grad school prep.',
                color: theme.colors.secondary
            });
        }

        return advice;
    };

    const auraAdvice = getAuraAdvice();

    // Handle save/unsave
    const handleSaveToggle = () => {
        if (isSaved) {
            deleteSimulation && deleteSimulation(savedId);
            // Alert.alert('Unsaved', 'Simulation removed.'); // Optional feedback
        } else {
            if (!saveSimulation) return;

            const newId = saveSimulation({
                schoolName: school?.school_name || 'Unknown School',
                school: school, // Save full object for reloading
                careerData: careerData, // Save full object for reloading
                debtFreeDate: formatDate(debtFreeData.date),
                debtFreeMonths: debtFreeData.months,
                totalDebt: adjustedDebt,
                principalReduction,
                monthlyAddOn,
                salary: effectiveSalary,
                salaryTier: useSalary75th ? '75th' : 'Median',
                careerName: resolvedCareerName
            });

            if (newId) {
                // Track the simulation run
                track(EVENTS.ZERO_DAY_SIMULATOR_RUN, {
                    school_name: school?.school_name,
                    career_name: resolvedCareerName,
                    starting_salary: effectiveSalary,
                    salary_tier: useSalary75th ? '75th' : 'Median',
                    monthly_add_on: monthlyAddOn,
                    principal_reduction: principalReduction,
                    total_debt: adjustedDebt,
                    projected_debt_free_date: formatDate(debtFreeData.date),
                    debt_free_months: debtFreeData.months,
                });

                Alert.alert('Saved!', 'Your simulation has been saved.');
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Zero-Day Simulator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* School Name */}
                <Text style={styles.schoolName}>{school?.school_name || 'Unknown School'}</Text>

                {/* Debt-Free Date Display */}
                <View style={styles.dateCard}>
                    <Calendar size={32} color={theme.colors.primary} />
                    <Text style={styles.dateLabel}>Debt-Free Date</Text>
                    <Text style={styles.dateValue}>
                        {debtFreeData.months >= 360 ? 'Never 😰' : formatDate(debtFreeData.date)}
                    </Text>
                    <Text style={styles.dateSubtext}>
                        {debtFreeData.months >= 360
                            ? 'Payments don\'t cover interest'
                            : `${Math.floor(debtFreeData.months / 12)} years, ${debtFreeData.months % 12} months`
                        }
                    </Text>
                </View>

                {/* Debt Summary */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Debt</Text>
                        <Text style={styles.summaryValue}>${adjustedDebt.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Monthly Payment</Text>
                        <Text style={styles.summaryValue}>
                            ${((effectiveSalary * 0.20 / 12) + monthlyAddOn).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </Text>
                    </View>
                </View>

                {/* Interactive Sliders */}
                <View style={styles.sliderSection}>
                    <Text style={styles.sectionTitle}>💰 Adjust Your Strategy</Text>

                    {/* Principal Reduction */}
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderLabel}>Principal Reduction</Text>
                            <Text style={styles.sliderValue}>${principalReduction.toLocaleString()}</Text>
                        </View>
                        <Text style={styles.sliderHint}>One-time payment (graduation gift, savings)</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={20000}
                            step={500}
                            value={principalReduction}
                            onValueChange={setPrincipalReduction}
                            minimumTrackTintColor={theme.colors.primary}
                            maximumTrackTintColor={theme.colors.glassBorder}
                            thumbTintColor={theme.colors.primary}
                        />
                    </View>

                    {/* Monthly Add-On */}
                    <View style={styles.sliderContainer}>
                        <View style={styles.sliderHeader}>
                            <Text style={styles.sliderLabel}>Monthly Add-On</Text>
                            <Text style={styles.sliderValue}>+${monthlyAddOn}/mo</Text>
                        </View>
                        <Text style={styles.sliderHint}>Side hustle income or extra savings</Text>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={500}
                            step={25}
                            value={monthlyAddOn}
                            onValueChange={setMonthlyAddOn}
                            minimumTrackTintColor={theme.colors.secondary}
                            maximumTrackTintColor={theme.colors.glassBorder}
                            thumbTintColor={theme.colors.secondary}
                        />
                    </View>

                    {/* Salary Tier Toggle */}
                    <View style={styles.toggleContainer}>
                        <View style={styles.toggleHeader}>
                            <TrendingUp size={20} color={theme.colors.info} />
                            <Text style={styles.sliderLabel}>Salary Projection</Text>
                        </View>
                        <View style={styles.toggleButtons}>
                            <TouchableOpacity
                                style={[styles.toggleBtn, !useSalary75th && styles.toggleBtnActive]}
                                onPress={() => setUseSalary75th(false)}
                            >
                                <Text style={[styles.toggleBtnText, !useSalary75th && styles.toggleBtnTextActive]}>
                                    Median
                                </Text>
                                <Text style={styles.toggleBtnValue}>${baseSalary.toLocaleString()}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleBtn, useSalary75th && styles.toggleBtnActive]}
                                onPress={() => setUseSalary75th(true)}
                            >
                                <Text style={[styles.toggleBtnText, useSalary75th && styles.toggleBtnTextActive]}>
                                    75th %ile
                                </Text>
                                <Text style={styles.toggleBtnValue}>${salary75th.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Aura-Based Advice */}
                {auraAdvice.length > 0 && (
                    <View style={styles.adviceSection}>
                        <Text style={styles.sectionTitle}>✨ School Aura</Text>
                        {auraAdvice.map((advice, index) => (
                            <View key={index} style={[styles.adviceCard, { borderLeftColor: advice.color }]}>
                                <View style={styles.adviceHeader}>
                                    <advice.icon size={20} color={advice.color} />
                                    <Text style={styles.adviceTitle}>{advice.title}</Text>
                                </View>
                                <Text style={styles.adviceMessage}>{advice.message}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Loan Details */}
                <View style={styles.loanDetails}>
                    <Text style={styles.loanDetailsTitle}>Federal Loan Assumptions</Text>
                    <Text style={styles.loanDetailsText}>
                        Interest Rate: {(LOAN_DATA.interestRate * 100).toFixed(2)}% •
                        Origination Fee: {(LOAN_DATA.originationFee * 100).toFixed(2)}%
                    </Text>
                    <Text style={styles.loanDetailsNote}>
                        Total Debt includes origination fee (standard federal loan fee)
                    </Text>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, isSaved && styles.saveBtnSaved]}
                    onPress={handleSaveToggle}
                >
                    <Bookmark
                        size={20}
                        color={isSaved ? '#000' : theme.colors.text}
                        fill={isSaved ? '#000' : 'transparent'}
                    />
                    <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextSaved]}>
                        {isSaved ? 'Simulation Saved!' : 'Save Simulation'}
                    </Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.glass,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    schoolName: {
        fontSize: 16,
        color: theme.colors.textDim,
        textAlign: 'center',
        marginBottom: 16,
    },
    dateCard: {
        backgroundColor: theme.colors.glass,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    dateLabel: {
        fontSize: 14,
        color: theme.colors.textDim,
        marginTop: 8,
    },
    dateValue: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.primary,
        marginTop: 4,
    },
    dateSubtext: {
        fontSize: 14,
        color: theme.colors.textDim,
        marginTop: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    summaryItem: {
        flex: 1,
        backgroundColor: theme.colors.glass,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    summaryLabel: {
        fontSize: 12,
        color: theme.colors.textDim,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: 4,
    },
    sliderSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    sliderContainer: {
        marginBottom: 20,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sliderLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    sliderValue: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    sliderHint: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 2,
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    toggleContainer: {
        marginTop: 8,
    },
    toggleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    toggleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    toggleBtn: {
        flex: 1,
        backgroundColor: theme.colors.glass,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    toggleBtnActive: {
        borderColor: theme.colors.info,
        backgroundColor: theme.colors.info + '20',
    },
    toggleBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textDim,
    },
    toggleBtnTextActive: {
        color: theme.colors.info,
    },
    toggleBtnValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
        marginTop: 4,
    },
    adviceSection: {
        marginBottom: 24,
    },
    adviceCard: {
        backgroundColor: theme.colors.glass,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    adviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    adviceTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    adviceMessage: {
        fontSize: 13,
        color: theme.colors.textDim,
        lineHeight: 20,
    },
    loanDetails: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    loanDetailsTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textDim,
    },
    loanDetailsText: {
        fontSize: 11,
        color: theme.colors.textDim,
        marginTop: 4,
    },
    loanDetailsNote: {
        fontSize: 11,
        color: theme.colors.textDim,
        marginTop: 8,
        fontStyle: 'italic',
    },
    saveBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: theme.colors.glass,
        borderRadius: 14,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    saveBtnSaved: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    saveBtnTextSaved: {
        color: '#000',
    },
});
