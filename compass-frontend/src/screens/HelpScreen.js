import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, HelpCircle, Shield, Target, Zap, Clock, Heart, Briefcase } from 'lucide-react-native';

const DICTIONARY = [
    { term: "BOSS HP", def: "Total Cost of Attendance (Tuition + Room + Board).", icon: Target },
    { term: "LOOT DROP", def: "Starting Salary for the selected major.", icon: Zap },
    { term: "COOLDOWN", def: "Time (Years) to pay off student debt.", icon: Clock },
    { term: "TACTICAL SCORE", def: "Efficiency Metric. High Score = Good Value.", icon: Shield },
    { term: "FIREPOWER", def: "Your Earning Potential based on Major Selection.", icon: Zap },
    { term: "CLASS", def: "Your chosen Major (Engineer, Healer, Leader, Creative).", icon: Briefcase },
    { term: "BASE STATS", def: "Your GPA (INT) and Test Scores used for admission calculations.", icon: Shield },
    { term: "INTEL", def: "Data gathered on a University Target.", icon: Briefcase },
    { term: "PVP", def: "Player vs Player Simulation. Comparing two colleges head-to-head.", icon: Zap },
    { term: "SIDE OPS", def: "Work Study / Part-Time Jobs.", icon: Briefcase },
    { term: "SQUAD SUPPORT", def: "Family Contribution / Savings.", icon: Heart },
    { term: "ROI", def: "Return on Investment. The ratio of Salary to Cost.", icon: Zap },
];

const FAQS = [
    { q: "HOW DOES PVP WORK?", a: "Select a 'PvP Target' from the Map to compare it against your current Mission. Green stats indicate an advantage." },
    { q: "WHAT DO SIDE OPS DO?", a: "Allocating time to Work Study reduces your total debt (Boss HP) but may impact grades (hidden stat)." },
    { q: "HOW IS COOLDOWN CALCULATED?", a: "It assumes you pay 20% of your monthly Discretionary Income towards debt. Faster payment = Lower Cooldown." },
    { q: "WHERE DOES DATA COME FROM?", a: "National Center for Education Statistics (NCES) & Bureau of Labor Statistics (BLS)." },
    { q: "CAN I CHANGE MY MAJOR?", a: "Yes. Return to Lobby to re-select your Class." },
    { q: "WHY CAN'T I USE ACT SCORES?", a: "System currently calibrated for SAT frequencies only." },
    { q: "WHAT IS ROI?", a: "Capital Efficiency based on Market Value vs Acquisition Cost." },
];

export default function HelpScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate('Profile')} accessibilityLabel="Go Back">
                    <ChevronLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>FIELD MANUAL</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* DICTIONARY */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Briefcase color={theme.colors.primary} size={20} />
                        <Text style={styles.sectionTitle}>DICTIONARY</Text>
                    </View>
                    {DICTIONARY.map((item, index) => (
                        <View key={index} style={styles.itemBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                                <item.icon size={16} color={theme.colors.textDim} />
                                <Text style={styles.term}>{item.term}</Text>
                            </View>
                            <Text style={styles.def}>{item.def}</Text>
                        </View>
                    ))}
                </View>

                {/* FAQS */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <View style={styles.sectionHeader}>
                        <HelpCircle color={theme.colors.secondary} size={20} />
                        <Text style={[styles.sectionTitle, { color: theme.colors.secondary }]}>F.A.Q.</Text>
                    </View>
                    {FAQS.map((item, index) => (
                        <View key={index} style={styles.itemBox}>
                            <Text style={styles.q}>{item.q}</Text>
                            <Text style={styles.def}>{item.a}</Text>
                        </View>
                    ))}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        gap: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    title: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 20,
    },
    content: {
        padding: theme.spacing.m,
    },
    section: {
        marginBottom: theme.spacing.l,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.s,
        marginBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
        paddingBottom: 5,
    },
    sectionTitle: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.primary,
        fontSize: 16,
    },
    itemBox: {
        backgroundColor: theme.colors.glass,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.s,
        borderRadius: theme.borderRadius.s,
    },
    term: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 14,
    },
    def: {
        fontFamily: theme.fonts.body,
        color: theme.colors.textDim,
        fontSize: 12,
    },
    q: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.text,
        fontSize: 12,
        marginBottom: 4,
    }
});
