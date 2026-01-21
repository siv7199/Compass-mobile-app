import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ChevronLeft, HelpCircle, DollarSign, GraduationCap, TrendingUp, Clock, Bookmark, Search } from 'lucide-react-native';

const FAQS = [
    {
        q: "What is Annual Cost?",
        a: "The yearly cost to attend (tuition, room, board, fees) after financial aid. This is what you'd actually pay each year.",
        icon: DollarSign
    },
    {
        q: "What is Payback Period?",
        a: "The estimated years to pay off student loans after graduation, assuming 20% of income goes to payments.",
        icon: Clock
    },
    {
        q: "How is ROI calculated?",
        a: "Return on Investment compares your expected salary to your total college costs. Higher ROI = better value.",
        icon: TrendingUp
    },
    {
        q: "Where does the data come from?",
        a: "Official sources: National Center for Education Statistics (NCES) for college costs, Bureau of Labor Statistics (BLS) for salary data.",
        icon: GraduationCap
    },
    {
        q: "How do I save a college?",
        a: "Tap on any college in your results, then click 'Save College' to add it to your portfolio.",
        icon: Bookmark
    },
    {
        q: "Can I compare different careers?",
        a: "Yes! When entering your profile, select different career paths to see how salaries affect your ROI.",
        icon: Search
    },
    {
        q: "Why use Unweighted GPA?",
        a: "Colleges compare applicants using unweighted GPA (0-4.0 scale) for consistency. Weighted GPAs vary by school.",
        icon: GraduationCap
    },
    {
        q: "Why can't I use ACT scores?",
        a: "The system currently uses SAT data for admission estimates. ACT support is planned for a future update.",
        icon: HelpCircle
    },
];

export default function HelpScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft color={theme.colors.text} size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Help & FAQ</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                {FAQS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <View key={index} style={styles.faqCard}>
                            <View style={styles.faqHeader}>
                                <Icon size={18} color={theme.colors.primary} />
                                <Text style={styles.question}>{item.q}</Text>
                            </View>
                            <Text style={styles.answer}>{item.a}</Text>
                        </View>
                    );
                })}
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
        padding: 16,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    backBtn: {
        padding: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
    },
    content: {
        padding: 16,
    },
    faqCard: {
        backgroundColor: theme.colors.glass,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    faqHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    question: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    answer: {
        fontSize: 14,
        color: theme.colors.textDim,
        lineHeight: 20,
    },
});
