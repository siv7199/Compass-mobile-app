import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme';
import { Shield, Target, Clock, Zap, Heart, Briefcase, PenTool, Swords } from 'lucide-react-native';

const SCENARIOS = {
    'LOBBY': [
        { title: "LOBBY", desc: "Welcome to the Operations Center. Select a CLASS based on your academic strengths.", icon: Zap },
    ],
    'ENGINEER': [
        { title: "ENGINEER CLASS", desc: "Includes: Computer Science, Engineering, Math, Physics. High Firepower (Salary).", icon: Zap },
    ],
    'HEALER': [
        { title: "HEALER CLASS", desc: "Includes: Biology, Nursing, Pre-Med, Health Sciences. High Job Security.", icon: Heart },
    ],
    'LEADER': [
        { title: "LEADER CLASS", desc: "Includes: Business, Economics, Political Science. High Risk, High Reward.", icon: Briefcase },
    ],
    'CREATIVE': [
        { title: "CREATIVE CLASS", desc: "Includes: Arts, English, History, Psychology. Variable Outcomes.", icon: PenTool },
    ],
    'ID_CARD': [
        { title: "ID CARD", desc: "Access your Dossier to view saved intel, FAQs, and system settings.", icon: Shield },
        { title: "FIELD MANUAL", desc: "Tactical Glossary and Mission FAQs.", icon: Briefcase },
    ],
    'STATS': [
        { title: "CALIBRATION", desc: "Enter your stats to calculate mission viability.", icon: Zap },
        { title: "INT SCORE", desc: "Your GPA (Unweighted). This determines your base Admission Probability.", icon: Target },
        { title: "STR SCORE", desc: "Your SAT Score. Required for Elite Targets (Ivy League).", icon: Target },
        { title: "MISSION BUDGET", desc: "The maximum debt you are willing to take on before the mission is scrubbed.", icon: Shield },
    ],
    'CAREER': [
        { title: "TARGET SELECTION", desc: "Choose a precise career path within your Class.", icon: Target },
        { title: "DATA SOURCE", desc: "Salary data pulled from Bureau of Labor Statistics (BLS).", icon: Shield },
    ],
    'MAP': [
        { title: "MISSION MAP", desc: "Select a University Target to infiltrate.", icon: Target },
        { title: "PVP COMPARISON", desc: "Long Press or Check the box on two targets to compare them.", icon: Swords },
        { title: "TACTICAL SCORE", desc: "Proprietary Matrix rating target viability.", icon: Shield },
        { title: "RANKING", desc: "S-Tier (Elite) to F-Tier (High Debt). Choose wisely.", icon: Zap },
    ],
    'FIELD_MANUAL': [
        { title: "FIELD MANUAL", desc: "Access the Tactical Glossary to decode mission terminology.", icon: Shield },
        { title: "DEFINITIONS", desc: "Learn what terms like 'Boss HP' and 'Firepower' mean.", icon: Briefcase },
    ],
    'MISSION_PREVIEW': [
        { title: "MISSION PREVIEW", desc: "Intel gathered on selected target.", icon: Target },
        { title: "COST TO ACQUIRE", desc: "Total Investment required to secure the degree.", icon: Shield },
        { title: "LOOT DROP", desc: "Projected Annual Salary (Average Wage) for selected major.", icon: Zap },
        { title: "ESTIMATED COOLDOWN", desc: "Time until Financial Freedom based on Standard Repayment Models.", icon: Clock },
    ],
    'PVP': [
        { title: "COMBAT SIM", desc: "Compare two targets side-by-side.", icon: Zap },
        { title: "ADVANTAGE", desc: "Green text indicates a superior stat.", icon: Shield },
        { title: "SHIELDS", desc: "Scholarships (Merit-based aid).", icon: Shield },
        { title: "SQUAD SUPPORT", desc: "Parental support or savings.", icon: Heart },
        { title: "SIDE OPS", desc: "Part-time labor income.", icon: Briefcase },
    ],
    'DAMAGE_REPORT': [
        { title: "DAMAGE REPORT", desc: "Final Mission Analysis before deployment.", icon: Zap },
        { title: "BOSS HP", desc: "Total Sticker Price (Tuition + Room + Board).", icon: Target },
        { title: "MARKET OUTLOOK", desc: "Projected Growth Rate for this career field.", icon: Zap },
        { title: "LOOT", desc: "Average Annual Salary for the selected career.", icon: Zap },
        { title: "SHIELDS", desc: "Scholarships (Merit-based aid) that reduce Sticker Price.", icon: Shield },
        { title: "SQUAD SUPPORT", desc: "Parental support or savings applied to the mission.", icon: Heart },
        { title: "SIDE OPS", desc: "Part-time labor income used to offset costs.", icon: Briefcase },
        { title: "REMAINING HP", desc: "The remaining debt balance you must defeat.", icon: Clock },
        { title: "COOLDOWN", desc: "Time to reduce Remaining HP to zero.", icon: Clock },
        { title: "ROI", desc: "Performance Rating. Does the Loot justify the Cost?", icon: Zap },
    ],
    'MISSION_LOG': [
        { title: "VICTORY", desc: "Mission Success. The target is viable.", icon: Zap },
        { title: "THE GRAPH", desc: "Shows your Debt reaching $0 over time.", icon: Clock },
        { title: "FREEDOM DATE", desc: "The calculated moment you become debt-free.", icon: Shield },
    ],
    'PROFILE': [
        { title: "DOSSIER", desc: "Review your saved intel and mission logs here.", icon: Shield },
        { title: "FIELD MANUAL", desc: "Access the Tactical Glossary to decode mission terminology.", icon: Briefcase },
        { title: "SAVED MISSIONS", desc: "Tap any saved target to revisit its intel.", icon: Target },
        { title: "SYSTEMS", desc: "Reset tutorials or purge data from this terminal.", icon: Zap },
    ]
};

export default function HoloTutorial({ visible, onClose, scenario = 'DAMAGE_REPORT' }) {
    const [step, setStep] = useState(0);

    const steps = SCENARIOS[scenario] || SCENARIOS['DAMAGE_REPORT'];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onClose();
            // Reset step for next time? Or keep it? 
            // Better to reset if unmounted, but if persisting, manual reset needed.
            // setStep(0); // If we want it to restart next time open.
            setTimeout(() => setStep(0), 500);
        }
    };

    const currentStep = steps[step];
    const Icon = currentStep.icon;

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={90} tint="dark" style={styles.container}>
                {/* HOLO AVATAR PLACEHOLDER */}
                <View style={styles.holoContainer}>
                    <View style={styles.holoRingOuter}>
                        <View style={styles.holoRingInner}>
                            <Icon size={40} color={theme.colors.tacticalGreen} />
                        </View>
                    </View>
                    <View style={styles.scanLine} />
                    <Text style={styles.holoLabel}>GEN. KAEL</Text>
                </View>

                {/* DIALOG BOX */}
                <View style={styles.dialogBox}>
                    <Text style={styles.stepTitle}>{currentStep.title}</Text>
                    <Text style={styles.stepDesc}>{currentStep.desc}</Text>

                    <View style={styles.controls}>
                        <View style={styles.dots}>
                            {steps.map((_, i) => (
                                <View key={i} style={[styles.dot, i === step && styles.activeDot]} />
                            ))}
                        </View>
                        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
                            <Text style={styles.nextText}>{step === steps.length - 1 ? "INITIALIZE" : "NEXT >"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)', // Darker overlay for focus
        padding: 20,
    },
    holoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    holoRingOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.colors.tacticalGreen,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 255, 153, 0.05)',
        shadowColor: theme.colors.tacticalGreen,
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    holoRingInner: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 153, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    holoLabel: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.tacticalGreen,
        marginTop: 10,
        fontSize: 12,
        letterSpacing: 2,
    },
    scanLine: {
        height: 1,
        width: 120,
        backgroundColor: theme.colors.tacticalGreen,
        opacity: 0.5,
        position: 'absolute',
        top: 50,
    },
    dialogBox: {
        width: '100%',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.tacticalGreen,
        borderRadius: 10,
        padding: 20,
    },
    stepTitle: {
        fontFamily: theme.fonts.heading,
        color: theme.colors.tacticalGreen,
        fontSize: 20,
        marginBottom: 10,
        letterSpacing: 1,
    },
    stepDesc: {
        fontFamily: theme.fonts.body,
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dots: {
        flexDirection: 'row',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.textDim,
    },
    activeDot: {
        backgroundColor: theme.colors.tacticalGreen,
    },
    nextBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(0, 255, 153, 0.1)',
        borderWidth: 1,
        borderColor: theme.colors.tacticalGreen,
        borderRadius: 4,
    },
    nextText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.tacticalGreen,
        fontSize: 12,
        fontWeight: 'bold',
    }
});
