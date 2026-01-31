import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { CAREER_DATA } from '../data/careers';

const CAMPUS_PRIORITIES = [
    { id: 'diversity', label: 'Diversity' },
    { id: 'food', label: 'Good Food' },
    { id: 'sports', label: 'Sports Culture' },
    { id: 'greek', label: 'Greek Life' },
    { id: 'research', label: 'Research Opportunities' },
];

const CLASS_DISPLAY_NAMES = {
    'engineer': 'Engineering',
    'healer': 'Health',
    'leader': 'Business',
    'creative': 'Arts'
};

const DotSlider = ({ value, onChange, theme, styles }) => {
    return (
        <View style={styles.sliderTrack}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                    key={num}
                    style={[
                        styles.sliderDot,
                        {
                            backgroundColor: num <= value ? theme.colors.primary : theme.colors.glassBorder,
                            width: num <= value ? 12 : 8,
                            height: num <= value ? 12 : 8,
                        }
                    ]}
                    onPress={() => onChange(num)}
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                />
            ))}
        </View>
    );
};

const LOCATION_TYPES = [
    { id: 'small_town', label: 'Small College Town' },
    { id: 'medium_city', label: 'Medium-sized City' },
    { id: 'major_metro', label: 'Major Metropolitan' },
    { id: 'no_pref', label: 'No Preference' },
];

const SPECIAL_INSTITUTIONS = [
    { id: 'hbcu', label: 'HBCU' },
    { id: 'womens', label: "Women's College" },
    { id: 'religious', label: 'Religious Affiliation' },
    { id: 'none', label: 'No Preference' },
];

export default function EditScenarioModal({ visible, onClose, userProfile, onSave }) {
    const { theme } = useTheme();
    const style = getStyles(theme);

    const [profile, setProfile] = useState({});
    const [selectedClass, setSelectedClass] = useState('engineer');
    const [showCareerDropdown, setShowCareerDropdown] = useState(false);

    useEffect(() => {
        if (visible && userProfile) {
            setProfile({
                ...userProfile,
                gpa: userProfile.gpa ? userProfile.gpa.toString() : '',
                sat: userProfile.sat ? userProfile.sat.toString() : '',
                budget: userProfile.budget ? userProfile.budget.toString() : '',
                priorityWeights: userProfile.priorityWeights || {},
                priorities: userProfile.priorities || []
            });
            // Try to infer class from career SOC
            // This is loose, but defaults to engineer
            // Ideally we store classId in profile
        }
    }, [visible, userProfile]);

    const handleSave = () => {
        // Validation
        const gpa = parseFloat(profile.gpa);
        if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
            Alert.alert("Invalid GPA", "Please enter a GPA between 0.0 and 4.0");
            return;
        }

        onSave(profile);
    };

    const togglePriority = (id) => {
        const current = profile.priorities || [];
        const exists = current.includes(id);

        let newPriorities;
        let newWeights = { ...(profile.priorityWeights || {}) };

        if (exists) {
            newPriorities = current.filter(p => p !== id);
            // Verify if we should remove weight? Keep it is fine.
        } else {
            newPriorities = [...current, id];
            if (!newWeights[id]) newWeights[id] = 5; // Default weight
        }

        setProfile({ ...profile, priorities: newPriorities, priorityWeights: newWeights });
    };

    const updateWeight = (id, val) => {
        setProfile({
            ...profile,
            priorityWeights: {
                ...profile.priorityWeights,
                [id]: val
            }
        });
    };

    const toggleSpecialType = (id) => {
        setProfile(prev => {
            const current = prev.specialTypes || [];
            if (id === 'none') {
                return { ...prev, specialTypes: ['none'] };
            }
            const newTypes = current.filter(t => t !== 'none');
            return {
                ...prev,
                specialTypes: newTypes.includes(id)
                    ? newTypes.filter(t => t !== id)
                    : [...newTypes, id]
            };
        });
    };

    const handleCareerSelect = (career) => {
        setProfile({
            ...profile,
            career: {
                title: career.title,
                soc: career.soc,
                wage: career.wage
            },
            careerName: career.title,
            targetCareer: career.soc
        });
        setShowCareerDropdown(false);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <BlurView intensity={90} tint="dark" style={style.overlay}>
                <View style={style.container}>
                    <View style={style.header}>
                        <Text style={style.title}>Edit Scenario</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X color={theme.colors.textDim} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={style.content} showsVerticalScrollIndicator={false}>
                        {/* Wrapper for Inputs */}
                        <View style={style.section}>
                            <Text style={style.label}>Academics</Text>
                            <View style={style.row}>
                                <View style={style.inputGroup}>
                                    <Text style={style.subLabel}>GPA (Unweighted)</Text>
                                    <TextInput
                                        style={style.input}
                                        value={profile.gpa || ''}
                                        onChangeText={t => setProfile({ ...profile, gpa: t })}
                                        keyboardType="numeric"
                                        placeholder="3.5"
                                        placeholderTextColor={theme.colors.textDim}
                                    />
                                </View>
                                <View style={style.inputGroup}>
                                    <Text style={style.subLabel}>SAT Score</Text>
                                    <TextInput
                                        style={style.input}
                                        value={profile.sat || ''}
                                        onChangeText={t => setProfile({ ...profile, sat: t })}
                                        keyboardType="numeric"
                                        placeholder="1200"
                                        placeholderTextColor={theme.colors.textDim}
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={style.section}>
                            <Text style={style.label}>Budget</Text>
                            <View style={style.inputGroup}>
                                <Text style={style.subLabel}>Max Annual Cost ($)</Text>
                                <TextInput
                                    style={style.input}
                                    value={profile.budget ? String(profile.budget) : ''}
                                    onChangeText={t => setProfile({ ...profile, budget: t })}
                                    keyboardType="numeric"
                                    placeholder="30000"
                                    placeholderTextColor={theme.colors.textDim}
                                />
                            </View>
                        </View>

                        <View style={style.section}>
                            <Text style={style.label}>Environment</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style.chipsScroll}>
                                {LOCATION_TYPES.map((loc) => (
                                    <TouchableOpacity
                                        key={loc.id}
                                        style={[style.chip, profile.locationType === loc.id && style.chipSelected]}
                                        onPress={() => setProfile({ ...profile, locationType: loc.id })}
                                    >
                                        <Text style={[style.chipText, profile.locationType === loc.id && style.chipTextSelected]}>
                                            {loc.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={style.section}>
                            <Text style={style.label}>Special Institutions</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style.chipsScroll}>
                                {SPECIAL_INSTITUTIONS.map((inst) => (
                                    <TouchableOpacity
                                        key={inst.id}
                                        style={[style.chip, (profile.specialTypes || []).includes(inst.id) && style.chipSelected]}
                                        onPress={() => toggleSpecialType(inst.id)}
                                    >
                                        <Text style={[style.chipText, (profile.specialTypes || []).includes(inst.id) && style.chipTextSelected]}>
                                            {inst.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={style.section}>
                            <Text style={style.label}>Career Goal</Text>

                            {/* Class Selector */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={style.chipsScroll}>
                                {Object.keys(CAREER_DATA).map(key => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[style.chip, selectedClass === key && style.chipSelected]}
                                        onPress={() => setSelectedClass(key)}
                                    >
                                        <Text style={[style.chipText, selectedClass === key && style.chipTextSelected]}>
                                            {CLASS_DISPLAY_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Dropdown Trigger */}
                            <TouchableOpacity
                                style={style.dropdownTrigger}
                                onPress={() => setShowCareerDropdown(!showCareerDropdown)}
                            >
                                <Text style={style.dropdownText}>
                                    {profile.career?.title || profile.careerName || "Select Career"}
                                </Text>
                                {showCareerDropdown ? <ChevronUp size={20} color={theme.colors.textDim} /> : <ChevronDown size={20} color={theme.colors.textDim} />}
                            </TouchableOpacity>

                            {/* Dropdown List */}
                            {showCareerDropdown && (
                                <ScrollView
                                    style={style.dropdownList}
                                    nestedScrollEnabled={true}
                                    contentContainerStyle={{ flexGrow: 0 }}
                                >
                                    {CAREER_DATA[selectedClass].map((career) => (
                                        <TouchableOpacity
                                            key={career.soc}
                                            style={style.dropdownItem}
                                            onPress={() => handleCareerSelect(career)}
                                        >
                                            <Text style={style.itemTitle}>{career.title}</Text>
                                            <Text style={style.itemWage}>${career.wage.toLocaleString()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                        </View>

                        <View style={style.section}>
                            <Text style={style.label}>Priorities & Weights</Text>
                            <Text style={style.hint}>Select priorities to enable ranking slider (1-10)</Text>

                            <View style={style.priorityGrid}>
                                {CAMPUS_PRIORITIES.map(p => {
                                    const isSelected = (profile.priorities || []).includes(p.id);
                                    return (
                                        <TouchableOpacity
                                            key={p.id}
                                            style={[style.pChip, isSelected && style.pChipSelected]}
                                            onPress={() => togglePriority(p.id)}
                                        >
                                            <Text style={[style.pText, isSelected && style.pTextSelected]}>{p.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Sliders for Selected */}
                            {(profile.priorities || []).map(id => {
                                const p = CAMPUS_PRIORITIES.find(x => x.id === id);
                                if (!p) return null;
                                const weight = (profile.priorityWeights || {})[id] || 5;

                                return (
                                    <View key={id} style={style.weightRow}>
                                        <View style={style.weightHeader}>
                                            <Text style={style.weightLabel}>{p.label}</Text>
                                            <Text style={style.weightValue}>{weight}/10</Text>
                                        </View>
                                        <DotSlider value={weight} onChange={v => updateWeight(id, v)} theme={theme} styles={style} />
                                    </View>
                                );
                            })}
                        </View>

                        <View style={{ height: 40 }} />
                    </ScrollView>

                    <View style={style.footer}>
                        <TouchableOpacity style={style.saveBtn} onPress={handleSave}>
                            <Save size={20} color="#000" />
                            <Text style={style.saveBtnText}>Update Results</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );
}

const getStyles = (theme) => StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: theme.colors.background,
        borderRadius: 16,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        flex: 1,
    },
    subLabel: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginBottom: 6,
    },
    input: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 8,
        padding: 12,
        color: theme.colors.text,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginBottom: 12,
        fontStyle: 'italic',
    },
    // Chips
    chipsScroll: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        marginRight: 8,
    },
    chipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
    chipTextSelected: {
        color: '#000',
        fontWeight: '600',
    },
    // Dropdown
    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 8,
        padding: 12,
    },
    dropdownText: {
        fontSize: 15,
        color: theme.colors.text,
    },
    dropdownList: {
        marginTop: 8,
        backgroundColor: theme.colors.background, // Solid background
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 8,
        maxHeight: 200,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    itemTitle: {
        color: theme.colors.text,
        fontSize: 14,
    },
    itemWage: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontFamily: theme.fonts.mono,
    },
    // Priorities
    priorityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 20,
    },
    pChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
    },
    pChipSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.glass,
    },
    pText: {
        fontSize: 13,
        color: theme.colors.textDim,
    },
    pTextSelected: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    // Sliders
    weightRow: {
        marginBottom: 16,
    },
    weightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    weightLabel: {
        fontSize: 14,
        color: theme.colors.text,
        fontWeight: '500',
    },
    weightValue: {
        fontSize: 14, // Fixed property name
        color: theme.colors.primary,
        fontWeight: '700',
    },
    // Dot Slider
    sliderTrack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 20,
        paddingHorizontal: 4,
    },
    sliderDot: {
        borderRadius: 6,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: theme.colors.glassBorder,
        backgroundColor: theme.colors.background,
    },
    saveBtn: {
        backgroundColor: theme.colors.primary,
        padding: 14,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    saveBtnText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
