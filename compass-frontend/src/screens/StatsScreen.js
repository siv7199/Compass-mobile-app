import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { ChevronRight, ChevronLeft, Info, DollarSign, ChevronDown, X, Check } from 'lucide-react-native';
import { API_URL } from '../config';

export default function StatsScreen({ route, navigation, showTutorial, closeTutorial }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    if (!route || !route.params) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator color={theme.colors.primary} />
                <Text style={{ color: theme.colors.textDim, marginTop: 12 }}>Loading...</Text>
                <TouchableOpacity onPress={() => navigation && navigation.goBack()}>
                    <Text style={{ color: theme.colors.primary, marginTop: 20 }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { selectedClass } = route.params;
    const [gpa, setGpa] = useState('');
    const [sat, setSat] = useState('');
    const [budget, setBudget] = useState('30000');
    const [showGpaTooltip, setShowGpaTooltip] = useState(false);
    const [showCareerModal, setShowCareerModal] = useState(false);

    // Career options by path - expanded list
    const CAREERS = {
        'leader': [
            { title: 'Chief Executive', soc: '11-1011' },
            { title: 'Marketing Manager', soc: '11-2021' },
            { title: 'Financial Manager', soc: '11-3031' },
            { title: 'General Manager', soc: '11-1021' },
            { title: 'Sales Manager', soc: '11-2022' },
            { title: 'Human Resources Manager', soc: '11-3121' },
            { title: 'Management Analyst', soc: '13-1111' },
            { title: 'Accountant', soc: '13-2011' },
            { title: 'Lawyer', soc: '23-1011' },
            { title: 'Financial Analyst', soc: '13-2051' }
        ],
        'engineer': [
            { title: 'Software Developer', soc: '15-1252' },
            { title: 'Civil Engineer', soc: '17-2051' },
            { title: 'Mechanical Engineer', soc: '17-2141' },
            { title: 'Electrical Engineer', soc: '17-2071' },
            { title: 'Aerospace Engineer', soc: '17-2011' },
            { title: 'Data Scientist', soc: '15-2051' },
            { title: 'Computer Systems Analyst', soc: '15-1211' },
            { title: 'Chemical Engineer', soc: '17-2041' },
            { title: 'Environmental Engineer', soc: '17-2081' },
            { title: 'Biomedical Engineer', soc: '17-2031' }
        ],
        'healer': [
            { title: 'Physician (Surgeon)', soc: '29-1248' },
            { title: 'Registered Nurse', soc: '29-1141' },
            { title: 'Dentist', soc: '29-1021' },
            { title: 'Pharmacist', soc: '29-1051' },
            { title: 'Nurse Practitioner', soc: '29-1171' },
            { title: 'Physical Therapist', soc: '29-1123' },
            { title: 'Physician Assistant', soc: '29-1071' },
            { title: 'Medical Scientist', soc: '19-1042' },
            { title: 'Optometrist', soc: '29-1041' },
            { title: 'Psychologist', soc: '19-3031' }
        ],
        'creative': [
            { title: 'Art Director', soc: '27-1011' },
            { title: 'Graphic Designer', soc: '27-1024' },
            { title: 'Editor', soc: '27-3041' },
            { title: 'Multimedia Artist', soc: '27-1014' },
            { title: 'Producer/Director', soc: '27-2012' },
            { title: 'Public Relations Specialist', soc: '27-3031' },
            { title: 'Writer/Author', soc: '27-3043' },
            { title: 'Architect', soc: '17-1011' },
            { title: 'Interior Designer', soc: '27-1025' },
            { title: 'UX Designer', soc: '15-1255' }
        ]
    };

    const classCareers = CAREERS[selectedClass.id] || [];
    const [selectedCareer, setSelectedCareer] = useState(classCareers[0]);

    const handleSearch = async () => {
        if (!gpa || !budget) return;

        const gpaValue = parseFloat(gpa);
        if (gpaValue > 4.0) {
            Alert.alert(
                "GPA Check",
                "Please use your unweighted GPA (0-4.0 scale). Weighted GPAs above 4.0 may affect accuracy.",
                [{ text: "OK" }]
            );
            return;
        }

        const satScore = parseInt(sat) || 0;
        if (sat && (satScore < 400 || satScore > 1600)) {
            Alert.alert("SAT Score", "Please enter a valid SAT score between 400 and 1600.");
            return;
        }

        navigation.navigate('Results', {
            userProfile: {
                gpa: parseFloat(gpa),
                sat: parseInt(sat) || 0,
                budget: parseInt(budget),
                targetCareer: selectedCareer.soc,
                careerName: selectedCareer.title,
                classId: selectedClass.id
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}>

                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <ChevronLeft color={theme.colors.text} size={24} />
                            </TouchableOpacity>
                            <Text style={styles.label}>Step 2 of 3</Text>
                            <Text style={styles.title}>Your Profile</Text>
                            <Text style={styles.subtitle}>Enter your academic info to find matching colleges</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* GPA Input */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.inputLabel}>GPA</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowGpaTooltip(true)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Info size={16} color={theme.colors.textDim} />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 3.5"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={gpa}
                                    onChangeText={setGpa}
                                />
                                <Text style={styles.hint}>Unweighted, 0-4.0 scale</Text>
                            </View>

                            {/* GPA Tooltip */}
                            <Modal
                                visible={showGpaTooltip}
                                transparent={true}
                                animationType="fade"
                                onRequestClose={() => setShowGpaTooltip(false)}
                            >
                                <TouchableOpacity
                                    style={styles.tooltipOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowGpaTooltip(false)}
                                >
                                    <View style={styles.tooltipBox}>
                                        <Text style={styles.tooltipTitle}>Unweighted GPA</Text>
                                        <Text style={styles.tooltipText}>
                                            Use your unweighted GPA (0-4.0 scale), without extra points for AP or Honors classes.
                                        </Text>
                                        <Text style={styles.tooltipExample}>
                                            Example: If your weighted GPA is 4.3, your unweighted might be 3.8
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.tooltipBtn}
                                            onPress={() => setShowGpaTooltip(false)}
                                        >
                                            <Text style={styles.tooltipBtnText}>Got It</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            </Modal>

                            {/* SAT Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>SAT Score (Optional)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 1200"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={sat}
                                    onChangeText={setSat}
                                />
                                <Text style={styles.hint}>400-1600, leave blank if not taken</Text>
                            </View>

                            {/* Budget Input */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelRow}>
                                    <DollarSign size={16} color={theme.colors.primary} />
                                    <Text style={styles.inputLabel}>Max Annual Cost</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g., 30000"
                                    placeholderTextColor={theme.colors.textDim}
                                    keyboardType="numeric"
                                    value={budget}
                                    onChangeText={setBudget}
                                />
                                <Text style={styles.hint}>Your maximum yearly college budget</Text>
                            </View>

                            {/* Career Selection - Dropdown */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Specific Career</Text>
                                <TouchableOpacity
                                    style={styles.dropdownBtn}
                                    onPress={() => setShowCareerModal(true)}
                                >
                                    <Text style={styles.dropdownBtnText}>
                                        {selectedCareer ? selectedCareer.title : "Select Career"}
                                    </Text>
                                    <ChevronDown size={20} color={theme.colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Career Picker Modal */}
                            <Modal
                                visible={showCareerModal}
                                transparent={true}
                                animationType="slide"
                                onRequestClose={() => setShowCareerModal(false)}
                            >
                                <View style={styles.modalOverlay}>
                                    <View style={styles.modalContent}>
                                        <View style={styles.modalHeader}>
                                            <Text style={styles.modalTitle}>Select Career</Text>
                                            <TouchableOpacity onPress={() => setShowCareerModal(false)} style={{ padding: 5 }}>
                                                <X size={24} color={theme.colors.text} />
                                            </TouchableOpacity>
                                        </View>
                                        <ScrollView style={styles.modalList}>
                                            {classCareers.map((career) => (
                                                <TouchableOpacity
                                                    key={career.soc}
                                                    style={[
                                                        styles.modalItem,
                                                        selectedCareer?.soc === career.soc && styles.modalItemSelected
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedCareer(career);
                                                        setShowCareerModal(false);
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.modalItemText,
                                                        selectedCareer?.soc === career.soc && styles.modalItemTextSelected
                                                    ]}>
                                                        {career.title}
                                                    </Text>
                                                    {selectedCareer?.soc === career.soc && <Check size={20} color={theme.colors.primary} />}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </Modal>
                        </View>

                        {/* CTA */}
                        <TouchableOpacity
                            style={[styles.searchBtn, (!gpa || !budget) && styles.searchBtnDisabled]}
                            onPress={handleSearch}
                            disabled={!gpa || !budget}
                        >
                            <Text style={styles.searchBtnText}>Find Colleges</Text>
                            <ChevronRight color="#000" size={20} />
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 28,
    },
    backBtn: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        padding: 8,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 10,
    },
    label: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: theme.colors.textDim,
        lineHeight: 22,
    },
    form: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.text,
    },
    input: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        color: theme.colors.text,
        fontSize: 18,
        padding: 16,
        borderRadius: 12,
    },
    hint: {
        fontSize: 12,
        color: theme.colors.textDim,
    },
    careerOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    careerOption: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.glass,
    },
    careerOptionSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    careerOptionText: {
        color: theme.colors.text,
        fontSize: 13,
    },
    careerOptionTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    searchBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 12,
        marginTop: 32,
        gap: 8,
    },
    searchBtnDisabled: {
        opacity: 0.5,
    },
    searchBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    tooltipOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    tooltipBox: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        padding: 24,
        maxWidth: 320,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    tooltipTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 12,
    },
    tooltipText: {
        fontSize: 15,
        color: theme.colors.text,
        lineHeight: 22,
        marginBottom: 8,
    },
    tooltipExample: {
        fontSize: 13,
        color: theme.colors.textDim,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    tooltipBtn: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignSelf: 'center',
    },
    tooltipBtnText: {
        fontWeight: '600',
        color: '#000',
        fontSize: 15,
    },
    dropdownBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        padding: 16,
        borderRadius: 12,
    },
    dropdownBtnText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '80%',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.text,
    },
    modalList: {
        maxHeight: 400,
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    modalItemSelected: {
        backgroundColor: 'rgba(0, 255, 153, 0.05)',
    },
    modalItemText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    modalItemTextSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
});
