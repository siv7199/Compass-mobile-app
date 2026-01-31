import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Trash2, Star, ExternalLink, TrendingUp, DollarSign, GraduationCap, Layers, School, Edit2, X, Check, ChevronRight, Briefcase, Settings, Calendar } from 'lucide-react-native';
import EditScenarioModal from './EditScenarioModal';

export default function PortfolioScreen({
    navigation,
    savedMissions = [],
    deleteMission,
    toggleFavorite,
    savedScenarios = [],
    deleteScenario,
    updateScenario,
    savedSimulations = [],
    deleteSimulation,
    userProfile, // Active global profile from App.js
    setUserProfile
}) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // Toggle between 'schools' and 'scenarios'
    const [activeTab, setActiveTab] = useState('schools');

    // Rename modal state
    const [renameModal, setRenameModal] = useState({ visible: false, scenario: null, newName: '' });
    const [editModal, setEditModal] = useState({ visible: false, scenario: null });



    // ===================
    // SCHOOLS TAB HANDLERS
    // ===================
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
                school_name: college?.schoolName || college?.target1 || "Unknown School",
                net_price: college?.net_price || college?.netPrice || 0,
                sticker_price: college?.sticker_price || college?.netPrice || 0,
                earnings: college?.earnings || 50000,
                ranking: college?.tier || 'C',
                debt_years: college?.cooldown || 0
            },
            profile: {
                targetCareer: college.targetCareer || "15-1252",
                careerName: college.careerName || "General Career"
            },
            fromSaved: true
        });
    };

    // ===================
    // SCENARIOS TAB HANDLERS
    // ===================
    const handleDeleteScenario = (scenarioId) => {
        Alert.alert(
            "Delete Scenario",
            "This will permanently delete this scenario and its settings.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteScenario && deleteScenario(scenarioId) }
            ]
        );
    };

    const handleDeleteSimulation = (simulationId) => {
        Alert.alert(
            "Delete Simulation",
            "Are you sure you want to delete this simulation?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteSimulation && deleteSimulation(simulationId) }
            ]
        );
    };

    const openRenameModal = (scenario) => {
        setRenameModal({ visible: true, scenario, newName: scenario.name || '' });
    };

    const handleRename = () => {
        if (renameModal.scenario && renameModal.newName.trim() && updateScenario) {
            updateScenario(renameModal.scenario.id, { name: renameModal.newName.trim() });
        }
        setRenameModal({ visible: false, scenario: null, newName: '' });
    };

    const handleUpdateCriteria = (updatedProfile) => {
        if (updatedProfile && updatedProfile.id && updateScenario) {
            updateScenario(updatedProfile.id, updatedProfile);
        }
        setEditModal({ visible: false, scenario: null });
    };

    // Portfolio Insight
    const getPortfolioInsight = () => {
        if (savedMissions.length === 0) return null;
        const reachCount = savedMissions.filter(m => m.tier === 'S' || m.tier === 'A').length;
        const safetyCount = savedMissions.filter(m => m.tier === 'C' || m.tier === 'D').length;
        if (reachCount > 2 && safetyCount === 0) {
            return "Consider adding safety schools to balance your list.";
        }
        if (savedMissions.length < 3) {
            return "Aim for 5-8 schools for a balanced college list.";
        }
        return "Your college list looks balanced!";
    };

    const insight = activeTab === 'schools' ? getPortfolioInsight() : null;

    // ===================
    // RENDER
    // ===================
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Your Saved</Text>
                <Text style={styles.title}>Portfolio</Text>

                {/* Toggle Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'schools' && styles.tabActive]}
                        onPress={() => setActiveTab('schools')}
                    >
                        <School size={16} color={activeTab === 'schools' ? '#000' : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'schools' && styles.tabTextActive]} numberOfLines={1} adjustsFontSizeToFit>
                            Schools
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'scenarios' && styles.tabActive]}
                        onPress={() => setActiveTab('scenarios')}
                    >
                        <Layers size={16} color={activeTab === 'scenarios' ? '#000' : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'scenarios' && styles.tabTextActive]} numberOfLines={1} adjustsFontSizeToFit>
                            Scenarios
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'simulations' && styles.tabActive]}
                        onPress={() => setActiveTab('simulations')}
                    >
                        <Calendar size={16} color={activeTab === 'simulations' ? '#000' : theme.colors.textDim} />
                        <Text style={[styles.tabText, activeTab === 'simulations' && styles.tabTextActive]} numberOfLines={1} adjustsFontSizeToFit>
                            Sims
                        </Text>
                    </TouchableOpacity>
                </View>

                {insight && activeTab === 'schools' && savedMissions.length > 0 && (
                    <View style={styles.insightBox}>
                        <Text style={styles.insightText}>{insight}</Text>
                    </View>
                )}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {activeTab === 'schools' && (
                    // ============ SCHOOLS VIEW ============
                    savedMissions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <GraduationCap size={48} color={theme.colors.textDim} />
                            <Text style={styles.emptyTitle}>No Schools Saved Yet</Text>
                            <Text style={styles.emptyText}>
                                Search for colleges and save the ones you like.
                            </Text>
                            <TouchableOpacity
                                style={styles.ctaBtn}
                                onPress={() => navigation.navigate('ExploreTab')}
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
                                        <TouchableOpacity onPress={() => handleFavorite(college.id)} style={styles.actionBtn}>
                                            <Star size={20} color={college.favorite ? '#FFD700' : theme.colors.textDim} fill={college.favorite ? '#FFD700' : 'transparent'} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(college.id)} style={styles.actionBtn}>
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
                                            ${(college.netPrice || college.sticker_price || 0).toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.statItem}>
                                        <TrendingUp size={14} color={theme.colors.secondary} />
                                        <Text style={styles.statLabel}>Payback</Text>
                                        <Text style={styles.statValue}>{college.cooldown || '—'} yrs</Text>
                                    </View>
                                </View>

                                {college.careerName && (
                                    <View style={styles.careerRow}>
                                        <Briefcase size={12} color={theme.colors.textDim} />
                                        <Text style={styles.careerText}>{college.careerName}</Text>
                                    </View>
                                )}

                                <TouchableOpacity style={styles.viewAnalysisBtn} onPress={() => handleViewAnalysis(college)}>
                                    <Text style={styles.viewAnalysisBtnText}>View Full Analysis</Text>
                                    <ExternalLink size={14} color="#000" />
                                </TouchableOpacity>
                            </View>
                        ))
                    )
                )}

                {activeTab === 'scenarios' && (
                    // ============ SCENARIOS VIEW ============
                    savedScenarios.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Layers size={48} color={theme.colors.textDim} />
                            <Text style={styles.emptyTitle}>No Scenarios Saved</Text>
                            <Text style={styles.emptyText}>
                                Scenarios save your search criteria so you can revisit them later.
                            </Text>
                        </View>
                    ) : (
                        savedScenarios.map((scenario, index) => (
                            <View key={scenario.id || index} style={styles.scenarioCard}>
                                <View style={styles.scenarioHeader}>
                                    <Text style={styles.scenarioName}>
                                        {scenario.name || `Scenario ${index + 1}`}
                                    </Text>
                                    <View style={styles.cardActions}>
                                        <TouchableOpacity onPress={() => setEditModal({ visible: true, scenario })} style={styles.actionBtn}>
                                            <Settings size={18} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => openRenameModal(scenario)} style={styles.actionBtn}>
                                            <Edit2 size={18} color={theme.colors.textDim} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteScenario(scenario.id)} style={styles.actionBtn}>
                                            <Trash2 size={18} color={theme.colors.danger} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.scenarioDate}>
                                    Created {formatDate(scenario.createdAt)}
                                </Text>

                                <View style={styles.scenarioDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>GPA:</Text>
                                        <Text style={styles.detailValue}>{scenario.gpa || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>SAT:</Text>
                                        <Text style={styles.detailValue}>{scenario.sat || 'N/A'}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Budget:</Text>
                                        <Text style={styles.detailValue}>
                                            ${parseInt(scenario.budget || 0).toLocaleString()}/yr
                                        </Text>
                                    </View>
                                    {scenario.career?.name && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Career:</Text>
                                            <Text style={styles.detailValue}>{scenario.career.name}</Text>
                                        </View>
                                    )}
                                    {scenario.savedCollegeIds?.length > 0 && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Saved:</Text>
                                            <Text style={styles.detailValue}>
                                                {scenario.savedCollegeIds.length} colleges
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.viewScenarioBtn}
                                    onPress={() => {
                                        navigation.navigate('ScenarioDetails', {
                                            userProfile: scenario
                                        });
                                    }}
                                >
                                    <Text style={styles.viewScenarioBtnText}>View Details</Text>
                                    <ChevronRight size={16} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )
                )}

                {activeTab === 'simulations' && (
                    <View>
                        {savedSimulations.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Calendar size={48} color={theme.colors.textDim} />
                                <Text style={styles.emptyTitle}>No Simulations Saved</Text>
                                <Text style={styles.emptyText}>
                                    Run a Zero-Day Simulator and save your projections.
                                </Text>
                            </View>
                        ) : (
                            savedSimulations.map((sim, index) => (
                                <View key={sim.id || index} style={styles.scenarioCard}>
                                    <View style={styles.scenarioHeader}>
                                        <Text style={styles.scenarioName}>
                                            {sim.schoolName || `Simulation ${index + 1}`}
                                        </Text>
                                        <View style={styles.cardActions}>
                                            <TouchableOpacity onPress={() => handleDeleteSimulation(sim.id)} style={styles.actionBtn}>
                                                <Trash2 size={18} color={theme.colors.danger} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.scenarioDate}>
                                        {sim.careerName || 'General Career'}
                                    </Text>

                                    <View style={styles.scenarioDetails}>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Debt-Free Date:</Text>
                                            <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                                                {sim.debtFreeDate || 'N/A'}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Total Debt:</Text>
                                            <Text style={styles.detailValue}>
                                                ${(sim.totalDebt || 0).toLocaleString()}
                                            </Text>
                                        </View>
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Est. Salary:</Text>
                                            <Text style={styles.detailValue}>
                                                ${(sim.salary || 0).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.viewScenarioBtn}
                                        onPress={() => {
                                            navigation.navigate('ZeroDay', {
                                                simulation: sim,
                                                school: sim.school, // Pass full object if available
                                                careerData: sim.careerData
                                            });
                                        }}
                                    >
                                        <Text style={styles.viewScenarioBtnText}>View Details</Text>
                                        <ChevronRight size={16} color={theme.colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Rename Modal */}
            <Modal visible={renameModal.visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Rename Scenario</Text>
                            <TouchableOpacity onPress={() => setRenameModal({ visible: false, scenario: null, newName: '' })}>
                                <X size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.modalInput}
                            value={renameModal.newName}
                            onChangeText={(text) => setRenameModal(prev => ({ ...prev, newName: text }))}
                            placeholder="Enter scenario name"
                            placeholderTextColor={theme.colors.textDim}
                            autoFocus
                        />
                        <TouchableOpacity style={styles.modalBtn} onPress={handleRename}>
                            <Check size={18} color="#000" />
                            <Text style={styles.modalBtnText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <EditScenarioModal
                visible={editModal.visible}
                userProfile={editModal.scenario}
                onClose={() => setEditModal({ visible: false, scenario: null })}
                onSave={handleUpdateCriteria}
            />
        </SafeAreaView >
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
        fontSize: 12,
        color: theme.colors.textDim,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        gap: 8, // Reduced gap to give pills more room
        marginBottom: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 2, // Minimal side padding
        gap: 4, // Tighter icon-text gap
        borderRadius: 20,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    tabActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.textDim,
    },
    tabTextActive: {
        color: '#000', // Black text on active pill
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
    // College Cards
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
    careerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 12,
    },
    careerText: {
        fontSize: 12,
        color: theme.colors.textDim,
    },
    viewAnalysisBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.primary,
        borderRadius: 10,
    },
    viewAnalysisBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    // Scenario Cards
    scenarioCard: {
        backgroundColor: theme.colors.glass,
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    scenarioHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    scenarioName: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.colors.text,
        flex: 1,
    },
    scenarioDate: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginBottom: 12,
    },
    scenarioDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: theme.colors.textDim,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
    },
    viewScenarioBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginTop: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        borderRadius: 10,
    },
    viewScenarioBtnText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 20,
        gap: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    modalInput: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 10,
        padding: 14,
        fontSize: 16,
        color: theme.colors.text,
    },
    modalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 10,
    },
    modalBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});
