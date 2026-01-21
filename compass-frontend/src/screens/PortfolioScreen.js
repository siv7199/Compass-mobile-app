import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Trash2, Star, ExternalLink, TrendingUp, DollarSign, GraduationCap } from 'lucide-react-native';

export default function PortfolioScreen({ navigation, savedMissions = [], deleteMission, toggleFavorite }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const handleDelete = (collegeId) => {
        Alert.alert(
            "Remove College",
            "Remove this school from your saved list?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => deleteMission && deleteMission(collegeId) }
            ]
        );
    };

    const handleFavorite = (collegeId) => {
        toggleFavorite && toggleFavorite(collegeId);
    };

    const handleViewAnalysis = (college) => {
        navigation.navigate('CostAnalysis', {
            school: {
                school_name: college.schoolName || college.target1,
                net_price: college.netPrice || 0,
                earnings: college.earnings || 50000,
                ranking: college.tier,
                debt_years: college.cooldown
            },
            profile: {
                targetCareer: college.targetCareer || "15-1252",
                careerName: college.careerName || "General Career"
            }
        });
    };

    // Analyze portfolio balance
    const getPortfolioInsight = () => {
        if (savedMissions.length === 0) return null;

        const reachCount = savedMissions.filter(m => m.tier === 'S' || m.tier === 'A').length;
        const safetyCount = savedMissions.filter(m => m.tier === 'C' || m.tier === 'D').length;

        if (reachCount > 2 && safetyCount === 0) {
            return "Consider adding safety schools with higher acceptance rates to balance your list.";
        }
        if (savedMissions.length < 3) {
            return "Aim for 5-8 schools for a balanced college list.";
        }
        return "Your college list looks balanced!";
    };

    const insight = getPortfolioInsight();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Your Colleges</Text>
                <Text style={styles.title}>Saved Schools</Text>
                {insight && savedMissions.length > 0 && (
                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>{insight}</Text>
                    </View>
                )}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {savedMissions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <GraduationCap size={48} color={theme.colors.textDim} />
                        <Text style={styles.emptyTitle}>No Schools Saved Yet</Text>
                        <Text style={styles.emptyText}>
                            Search for colleges and save the ones you like to build your list.
                        </Text>
                        <TouchableOpacity
                            style={styles.ctaBtn}
                            onPress={() => navigation.navigate('ExploreTab')}
                            accessibilityLabel="Find Colleges"
                            accessibilityRole="button"
                        >
                            <Text style={styles.ctaBtnText}>Find Colleges</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    savedMissions.map((college, index) => (
                        <View key={college.id || index} style={styles.collegeCard}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.tierBadge, { backgroundColor: getTierColor(college.tier, theme) }]}>
                                    <Text style={styles.tierText}>{college.tier || 'B'}</Text>
                                </View>
                                <View style={styles.cardActions}>
                                    <TouchableOpacity
                                        onPress={() => handleFavorite(college.id)}
                                        style={styles.actionBtn}
                                        accessibilityLabel="Toggle Favorite"
                                    >
                                        <Star
                                            size={20}
                                            color={college.favorite ? '#FFD700' : theme.colors.textDim}
                                            fill={college.favorite ? '#FFD700' : 'transparent'}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(college.id)}
                                        style={styles.actionBtn}
                                        accessibilityLabel="Remove College"
                                    >
                                        <Trash2 size={20} color={theme.colors.danger} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.schoolName}>{college.schoolName || college.target1}</Text>
                            <Text style={styles.dateText}>Saved {formatDate(college.savedAt || college.date)}</Text>

                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <DollarSign size={14} color={theme.colors.primary} />
                                    <Text style={styles.statLabel}>Annual Cost</Text>
                                    <Text style={styles.statValue}>
                                        ${(college.netPrice || college.score1 || 0).toLocaleString()}
                                    </Text>
                                </View>
                                <View style={styles.statItem}>
                                    <TrendingUp size={14} color={theme.colors.secondary} />
                                    <Text style={styles.statLabel}>Payback</Text>
                                    <Text style={styles.statValue}>
                                        {college.cooldown || '—'} yrs
                                    </Text>
                                </View>
                            </View>

                            {college.careerName && (
                                <Text style={styles.careerText}>Career: {college.careerName}</Text>
                            )}

                            <TouchableOpacity
                                style={styles.viewAnalysisBtn}
                                onPress={() => handleViewAnalysis(college)}
                            >
                                <Text style={styles.viewAnalysisBtnText}>View Full Analysis</Text>
                                <ExternalLink size={14} color="#000" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function getTierColor(tier, theme) {
    switch (tier) {
        case 'S': return '#FFD700';
        case 'A': return theme.colors.primary;
        case 'B': return theme.colors.secondary;
        case 'C': return theme.colors.info;
        default: return theme.colors.textDim;
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    label: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
    },
    insightBox: {
        marginTop: 16,
        padding: 14,
        backgroundColor: theme.colors.glass,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: theme.colors.secondary,
    },
    insightText: {
        fontSize: 14,
        color: theme.colors.text,
        lineHeight: 20,
    },
    content: {
        padding: 20,
        paddingTop: 0,
        gap: 12,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderRadius: 16,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        color: theme.colors.textDim,
        textAlign: 'center',
        lineHeight: 20,
    },
    ctaBtn: {
        marginTop: 8,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
    ctaBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
    collegeCard: {
        backgroundColor: theme.colors.glass,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    tierBadge: {
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        justifyContent: 'center',
    },
    tierText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#000',
    },
    cardActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 6,
    },
    schoolName: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
    },
    dateText: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginBottom: 14,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    statItem: {
        flex: 1,
        gap: 4,
    },
    statLabel: {
        fontSize: 11,
        color: theme.colors.textDim,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    careerText: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 12,
    },
    viewAnalysisBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary, // Increased visibility
        borderRadius: 10,
    },
    viewAnalysisBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
});
