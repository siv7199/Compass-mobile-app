import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Send, Briefcase, Heart, Zap, PenTool, ChevronRight, Edit2, MapPin, Shield, Users, Building, Check } from 'lucide-react-native';

const CAREER_OPTIONS = [
    { id: 'engineer', name: 'Engineering & Tech', icon: Zap, desc: 'Software, Civil, Mechanical' },
    { id: 'healer', name: 'Healthcare', icon: Heart, desc: 'Medicine, Nursing, Dentistry' },
    { id: 'leader', name: 'Business & Finance', icon: Briefcase, desc: 'Management, Marketing, Finance' },
    { id: 'creative', name: 'Arts & Media', icon: PenTool, desc: 'Design, Writing, Entertainment' },
];

const SPECIFIC_CAREERS = {
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

// New preference options
const LOCATION_TYPES = [
    { id: 'small_town', label: 'Small College Town', desc: 'Quiet, focused environment' },
    { id: 'medium_city', label: 'Medium-sized City', desc: 'Balance of options & calm' },
    { id: 'major_metro', label: 'Major Metropolitan', desc: 'Big city opportunities' },
    { id: 'no_pref', label: 'No Preference', desc: 'Open to any location' },
];

const CAMPUS_SETTINGS = [
    { id: 'urban', label: 'Urban', icon: Building },
    { id: 'suburban', label: 'Suburban', icon: MapPin },
    { id: 'rural', label: 'Rural', icon: MapPin },
];

const CAMPUS_PRIORITIES = [
    { id: 'diversity', label: 'Diversity', icon: Users },
    { id: 'food', label: 'Good Food', icon: null },
    { id: 'sports', label: 'Sports Culture', icon: null },
    { id: 'greek', label: 'Greek Life', icon: null },
    { id: 'research', label: 'Research Opportunities', icon: null },
];

const SPECIAL_INSTITUTIONS = [
    { id: 'hbcu', label: 'HBCU', desc: 'Historically Black Colleges & Universities' },
    { id: 'womens', label: "Women's College", desc: 'Women-only institutions' },
    { id: 'religious', label: 'Religious Affiliation', desc: 'Faith-based institutions' },
    { id: 'none', label: 'No Preference', desc: 'Open to all institution types' },
];

// Steps: 0-welcome, 1-gpa, 2-sat, 3-career, 3.5-specificCareer, 4-budget, 
// 5-location, 6-setting(skipped), 7-priorities, 8-specialTypes, 9-interests(skipped), 10-complete

export default function OnboardingScreen({ navigation, onComplete, userInfo }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const scrollRef = useRef(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const [processing, setProcessing] = useState(false);

    // Enhanced user data
    const [userData, setUserData] = useState({
        gpa: '',
        sat: '',
        career: null,
        budget: '',
        // New fields
        locationType: null,      // small_town, medium_city, major_metro, no_pref
        campusSetting: null,     // urban, suburban, rural
        priorities: [],          // array of priority ids
        specialTypes: [],        // array of special institution ids
        interests: '',           // free text
        // Priority weights (1-10 scale, research-based defaults)
        priorityWeights: {
            research: 8,    // Strong career/grad school impact
            diversity: 7,   // Learning outcomes & workforce prep
            sports: 5,      // Social experience
            greek: 4,       // Social benefit
            food: 3,        // Quality of life
        },
    });

    const addMessage = (text, isUser = false, stepId = null) => {
        setMessages(prev => [...prev, { text, isUser, id: Date.now() + Math.random(), stepId }]);
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // Initial message on mount
    useEffect(() => {
        const firstName = userInfo?.name?.split(' ')[0] || 'there';
        setTimeout(() => {
            addMessage(`Hey ${firstName}! 👋 Let's find your perfect college match.`);
            setTimeout(() => {
                addMessage("I'll ask you a few questions about your academics, career goals, and preferences.");
                setTimeout(() => {
                    addMessage("What's your unweighted GPA? (0-4.0 scale)");
                    setCurrentStep(1);
                }, 400);
            }, 600);
        }, 300);
    }, []);

    const handleGPASubmit = () => {
        if (processing) return;
        setProcessing(true);
        const gpa = parseFloat(inputValue);
        if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
            addMessage("Please enter a valid GPA between 0 and 4.0");
            setProcessing(false);
            return;
        }

        addMessage(inputValue, true, 1);
        setUserData(prev => ({ ...prev, gpa: inputValue }));
        setInputValue('');

        setTimeout(() => {
            if (gpa >= 3.5) {
                addMessage("Great GPA! 🎉 You'll have many options.");
            } else if (gpa >= 3.0) {
                addMessage("Solid GPA! Let's find schools that fit.");
            } else {
                addMessage("Got it! There are great schools for every GPA range.");
            }
            setTimeout(() => {
                addMessage("What's your SAT score? (400-1600, or type 'skip' if you haven't taken it)");
                setCurrentStep(2);
                setProcessing(false);
            }, 400);
        }, 300);
    };

    const handleSATSubmit = () => {
        if (processing) return;
        setProcessing(true);
        const input = inputValue.toLowerCase().trim();

        if (['skip', 'n/a', 'idk', 'no', ''].includes(input)) {
            addMessage("Skipping SAT", true, 2);
            setUserData(prev => ({ ...prev, sat: '' }));
        } else {
            const sat = parseInt(inputValue);
            if (isNaN(sat) || sat < 400 || sat > 1600) {
                addMessage("Please enter a valid SAT score between 400 and 1600, or type 'skip'");
                setProcessing(false);
                return;
            }
            addMessage(inputValue, true, 2);
            setUserData(prev => ({ ...prev, sat: inputValue }));
        }

        setInputValue('');

        setTimeout(() => {
            addMessage("Now, what career area interests you most?");
            setCurrentStep(3);
            setProcessing(false);
        }, 300);
    };

    const handleCareerSelect = (career) => {
        addMessage(career.name, true, 3);
        setSelectedCategory(career.id);

        setTimeout(() => {
            addMessage(`Which specific role in ${career.name} interests you?`);
            setCurrentStep(3.5);
        }, 300);
    };

    const handleSpecificCareerSelect = (specificCareer) => {
        addMessage(specificCareer.title, true, 3.5);
        setUserData(prev => ({
            ...prev,
            career: {
                category: selectedCategory,
                name: specificCareer.title,
                soc: specificCareer.soc
            }
        }));

        setTimeout(() => {
            addMessage(`${specificCareer.title} - excellent choice!`);
            setTimeout(() => {
                addMessage("What's the maximum you can spend per year on college? (Enter a number like 30000, or 'skip')");
                setCurrentStep(4);
            }, 400);
        }, 300);
    };

    const handleBudgetSubmit = () => {
        const input = inputValue.toLowerCase().trim();

        if (['skip', 'idk', 'dunno', "i don't know", ''].includes(input)) {
            addMessage("No budget set", true, 4);
            setUserData(prev => ({ ...prev, budget: '25000' }));
            setInputValue('');
            setTimeout(() => {
                addMessage("I'll assume a standard budget ~25k/yr for now.");
                proceedToLocationStep();
            }, 300);
            return;
        }

        const budget = parseInt(inputValue.replace(/[^0-9]/g, ''));
        if (isNaN(budget) || budget <= 0) {
            addMessage("Please enter a valid budget amount or type 'skip'");
            return;
        }

        const formattedBudget = budget.toLocaleString();
        addMessage(`$${formattedBudget}`, true, 4);
        setUserData(prev => ({ ...prev, budget: budget.toString() }));
        setInputValue('');

        setTimeout(() => {
            addMessage("Got it! 💰");
            proceedToLocationStep();
        }, 300);
    };

    const proceedToLocationStep = () => {
        setTimeout(() => {
            addMessage("Now let's talk about what you're looking for in a college environment...");
            setTimeout(() => {
                addMessage("What type of location appeals to you?");
                setCurrentStep(5);
            }, 400);
        }, 300);
    };

    const handleLocationSelect = (location) => {
        addMessage(location.label, true, 5);
        setUserData(prev => ({ ...prev, locationType: location.id }));

        setTimeout(() => {
            addMessage("What's most important to you in a college? (Select all that apply)");
            setCurrentStep(7); // Skip step 6 (campus setting) - redundant with location
        }, 300);
    };

    const handleSettingSelect = (setting) => {
        // This step is now skipped, but keep the function for safety
        addMessage(setting.label, true, 6);
        setUserData(prev => ({ ...prev, campusSetting: setting.id }));

        setTimeout(() => {
            addMessage("What's most important to you in a college? (Select all that apply)");
            setCurrentStep(7);
        }, 300);
    };

    const handlePrioritiesConfirm = () => {
        const selectedLabels = userData.priorities.map(id =>
            CAMPUS_PRIORITIES.find(p => p.id === id)?.label
        ).filter(Boolean);

        const displayText = selectedLabels.length > 0
            ? selectedLabels.join(', ')
            : 'No specific priorities';

        addMessage(displayText, true, 7);

        setTimeout(() => {
            // If user selected priorities, ask them to rate importance
            if (userData.priorities.length > 0) {
                addMessage("Great choices! Now rate how important each priority is to you (1-10):");
                setCurrentStep(7.5);
            } else {
                // No priorities selected, skip to special types
                addMessage("Are you interested in any special types of institutions?");
                setCurrentStep(8);
            }
        }, 300);
    };

    const handlePriorityRatingsConfirm = () => {
        // Build a display summary of ratings
        const ratingSummary = userData.priorities.map(id => {
            const priority = CAMPUS_PRIORITIES.find(p => p.id === id);
            const weight = userData.priorityWeights[id] || 5;
            return `${priority?.label}: ${weight}/10`;
        }).join(', ');

        addMessage(ratingSummary, true, 7.5);

        setTimeout(() => {
            addMessage("Are you interested in any special types of institutions?");
            setCurrentStep(8);
        }, 300);
    };

    const updatePriorityWeight = (priorityId, weight) => {
        setUserData(prev => ({
            ...prev,
            priorityWeights: {
                ...prev.priorityWeights,
                [priorityId]: weight
            }
        }));
    };

    const handleSpecialTypesConfirm = () => {
        const selectedLabels = userData.specialTypes.map(id =>
            SPECIAL_INSTITUTIONS.find(s => s.id === id)?.label
        ).filter(Boolean);

        const displayText = selectedLabels.length > 0
            ? selectedLabels.join(', ')
            : 'No preference';

        addMessage(displayText, true, 8);

        // Skip step 9 (free-form interests) - go directly to completion
        setTimeout(() => {
            addMessage("Perfect! I have everything I need. 🎯");
            setTimeout(() => {
                addMessage("Let me find colleges that match your profile...");
                setCurrentStep(10);
            }, 500);
        }, 300);
    };

    const handleInterestsSubmit = () => {
        const input = inputValue.trim();

        if (['skip', ''].includes(input.toLowerCase())) {
            addMessage("No additional interests", true, 9);
        } else {
            addMessage(input, true, 9);
            setUserData(prev => ({ ...prev, interests: input }));
        }
        setInputValue('');

        setTimeout(() => {
            addMessage("Perfect! I have everything I need. 🎯");
            setTimeout(() => {
                addMessage("Let me find colleges that match your profile...");
                setCurrentStep(10);
            }, 500);
        }, 300);
    };

    const togglePriority = (id) => {
        setUserData(prev => ({
            ...prev,
            priorities: prev.priorities.includes(id)
                ? prev.priorities.filter(p => p !== id)
                : [...prev.priorities, id]
        }));
    };

    const toggleSpecialType = (id) => {
        setUserData(prev => {
            if (id === 'none') {
                return { ...prev, specialTypes: ['none'] };
            }
            const newTypes = prev.specialTypes.filter(t => t !== 'none');
            return {
                ...prev,
                specialTypes: newTypes.includes(id)
                    ? newTypes.filter(t => t !== id)
                    : [...newTypes, id]
            };
        });
    };

    const handleSubmit = () => {
        if (!inputValue.trim() && currentStep !== 9) return;

        switch (currentStep) {
            case 1:
                handleGPASubmit();
                break;
            case 2:
                handleSATSubmit();
                break;
            case 4:
                handleBudgetSubmit();
                break;
            case 9:
                handleInterestsSubmit();
                break;
        }
    };

    const handleEdit = (stepId) => {
        if (!stepId) return;
        setCurrentStep(stepId);
        const messageIndex = messages.findIndex(m => m.stepId === stepId);
        if (messageIndex !== -1) {
            setMessages(prev => prev.slice(0, messageIndex));
        }
        if (stepId === 1) setInputValue(userData.gpa);
        if (stepId === 2) setInputValue(userData.sat);
        if (stepId === 4) setInputValue(userData.budget);
    };

    const handleComplete = () => {
        if (onComplete) {
            onComplete(userData);
        }
    };

    const renderInput = () => {
        // Career category selection (step 3)
        if (currentStep === 3) {
            return (
                <View style={styles.careerGrid}>
                    {CAREER_OPTIONS.map((career) => {
                        const Icon = career.icon;
                        return (
                            <TouchableOpacity
                                key={career.id}
                                style={styles.careerCard}
                                onPress={() => handleCareerSelect(career)}
                                activeOpacity={0.7}
                            >
                                <Icon size={24} color={theme.colors.primary} />
                                <Text style={styles.careerName}>{career.name}</Text>
                                <Text style={styles.careerDesc}>{career.desc}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }

        // Specific career selection (step 3.5)
        if (currentStep === 3.5) {
            const options = SPECIFIC_CAREERS[selectedCategory] || [];
            return (
                <View style={[styles.careerGrid, { maxHeight: 300 }]}>
                    <ScrollView
                        nestedScrollEnabled
                        style={{ width: '100%', maxHeight: 250 }}
                        persistentScrollbar={true}
                        showsVerticalScrollIndicator={true}
                    >
                        <View style={{ gap: 8, paddingBottom: 20 }}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.soc}
                                    style={[styles.careerCard, { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                                    onPress={() => handleSpecificCareerSelect(option)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.careerName}>{option.title}</Text>
                                    <ChevronRight size={16} color={theme.colors.textDim} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            );
        }

        // Location type selection (step 5)
        if (currentStep === 5) {
            return (
                <View style={styles.optionsList}>
                    {LOCATION_TYPES.map((loc) => (
                        <TouchableOpacity
                            key={loc.id}
                            style={styles.optionCard}
                            onPress={() => handleLocationSelect(loc)}
                            activeOpacity={0.7}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.optionLabel}>{loc.label}</Text>
                                <Text style={styles.optionDesc}>{loc.desc}</Text>
                            </View>
                            <ChevronRight size={18} color={theme.colors.textDim} />
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // Campus setting selection (step 6)
        if (currentStep === 6) {
            return (
                <View style={styles.settingsRow}>
                    {CAMPUS_SETTINGS.map((setting) => (
                        <TouchableOpacity
                            key={setting.id}
                            style={styles.settingCard}
                            onPress={() => handleSettingSelect(setting)}
                            activeOpacity={0.7}
                        >
                            <MapPin size={24} color={theme.colors.primary} />
                            <Text style={styles.settingLabel}>{setting.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }

        // Priorities multi-select (step 7)
        if (currentStep === 7) {
            return (
                <View style={styles.multiSelectContainer}>
                    <View style={styles.priorityGrid}>
                        {CAMPUS_PRIORITIES.map((priority) => {
                            const isSelected = userData.priorities.includes(priority.id);
                            return (
                                <TouchableOpacity
                                    key={priority.id}
                                    style={[styles.priorityChip, isSelected && styles.priorityChipSelected]}
                                    onPress={() => togglePriority(priority.id)}
                                    activeOpacity={0.7}
                                >
                                    {isSelected && <Check size={14} color="#000" style={{ marginRight: 4 }} />}
                                    <Text style={[styles.priorityLabel, isSelected && styles.priorityLabelSelected]}>
                                        {priority.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handlePrioritiesConfirm}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>Continue</Text>
                        <ChevronRight size={18} color="#000" />
                    </TouchableOpacity>
                </View>
            );
        }

        // Priority rating sliders (step 7.5)
        if (currentStep === 7.5) {
            const selectedPriorities = CAMPUS_PRIORITIES.filter(p =>
                userData.priorities.includes(p.id)
            );
            return (
                <View style={styles.multiSelectContainer}>
                    <View style={{ gap: 16 }}>
                        {selectedPriorities.map((priority) => {
                            const weight = userData.priorityWeights[priority.id] || 5;
                            return (
                                <View key={priority.id} style={styles.sliderContainer}>
                                    <View style={styles.sliderHeader}>
                                        <Text style={styles.sliderLabel}>{priority.label}</Text>
                                        <Text style={styles.sliderValue}>{weight}/10</Text>
                                    </View>
                                    <View style={styles.sliderTrack}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <TouchableOpacity
                                                key={num}
                                                style={[
                                                    styles.sliderDot,
                                                    num <= weight && styles.sliderDotActive
                                                ]}
                                                onPress={() => updatePriorityWeight(priority.id, num)}
                                            />
                                        ))}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handlePriorityRatingsConfirm}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>Continue</Text>
                        <ChevronRight size={18} color="#000" />
                    </TouchableOpacity>
                </View>
            );
        }

        // Special institution types (step 8)
        if (currentStep === 8) {
            return (
                <View style={styles.multiSelectContainer}>
                    <View style={styles.optionsList}>
                        {SPECIAL_INSTITUTIONS.map((inst) => {
                            const isSelected = userData.specialTypes.includes(inst.id);
                            return (
                                <TouchableOpacity
                                    key={inst.id}
                                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                                    onPress={() => toggleSpecialType(inst.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.optionLabel}>{inst.label}</Text>
                                        <Text style={styles.optionDesc}>{inst.desc}</Text>
                                    </View>
                                    {isSelected && (
                                        <View style={styles.checkCircle}>
                                            <Check size={14} color="#000" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleSpecialTypesConfirm}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>Continue</Text>
                        <ChevronRight size={18} color="#000" />
                    </TouchableOpacity>
                </View>
            );
        }

        // Complete - show button to proceed (step 10)
        if (currentStep === 10) {
            return (
                <TouchableOpacity
                    style={styles.completeButton}
                    onPress={handleComplete}
                    activeOpacity={0.8}
                >
                    <Text style={styles.completeButtonText}>See My Results</Text>
                    <ChevronRight size={20} color="#000" />
                </TouchableOpacity>
            );
        }

        // Text input for GPA, SAT, Budget, Interests
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    key={currentStep}
                    style={styles.input}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={
                        currentStep === 1 ? "e.g., 3.5" :
                            currentStep === 2 ? "e.g., 1200 or 'skip'" :
                                currentStep === 4 ? "e.g., 30000" :
                                    currentStep === 9 ? "Type interests or 'skip'" : ""
                    }
                    placeholderTextColor={theme.colors.textDim}
                    keyboardType={(currentStep === 1) ? "numeric" : "default"}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="default"
                    blurOnSubmit={true}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!inputValue.trim() && currentStep !== 9) && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={!inputValue.trim() && currentStep !== 9}
                >
                    <Send size={20} color="#000" />
                </TouchableOpacity>
            </View>
        );
    };

    // Calculate progress (10 steps total)
    const totalSteps = 10;
    const progressSteps = Math.min(Math.floor(currentStep), totalSteps);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={10}
            >
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    {[...Array(6)].map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressDot,
                                progressSteps > index * 2 && styles.progressDotActive
                            ]}
                        />
                    ))}
                </View>

                {/* Chat messages */}
                <ScrollView
                    ref={scrollRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                >
                    {messages.map((msg) => (
                        <View
                            key={msg.id}
                            style={[
                                styles.messageBubble,
                                msg.isUser ? styles.userBubble : styles.aiBubble
                            ]}
                        >
                            <Text style={[
                                styles.messageText,
                                msg.isUser && styles.userMessageText
                            ]}>
                                {msg.text}
                            </Text>
                            {msg.isUser && msg.stepId && msg.stepId <= 4 && (
                                <TouchableOpacity
                                    onPress={() => handleEdit(msg.stepId)}
                                    style={styles.editButton}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Edit2 size={16} color="#000" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Input area */}
                <View style={styles.inputArea}>
                    {renderInput()}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    progressDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.glassBorder,
    },
    progressDotActive: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 14,
        borderRadius: 18,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editButton: {
        marginLeft: 8,
        padding: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
        color: theme.colors.text,
    },
    userMessageText: {
        color: '#000',
    },
    inputArea: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.glassBorder,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingVertical: 14,
        fontSize: 16,
        color: theme.colors.text,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    careerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    careerCard: {
        width: '48%',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        padding: 16,
        gap: 8,
    },
    careerName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    careerDesc: {
        fontSize: 12,
        color: theme.colors.textDim,
    },
    optionsList: {
        gap: 10,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        padding: 16,
    },
    optionCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '15',
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    optionDesc: {
        fontSize: 12,
        color: theme.colors.textDim,
        marginTop: 2,
    },
    settingsRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'nowrap',
    },
    settingCard: {
        flex: 1,
        minWidth: 90,
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 6,
    },
    settingLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
    multiSelectContainer: {
        gap: 16,
    },
    priorityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    priorityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 20,
    },
    priorityChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    priorityLabel: {
        fontSize: 14,
        color: theme.colors.text,
    },
    priorityLabelSelected: {
        color: '#000',
        fontWeight: '600',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        borderRadius: 12,
        gap: 6,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    completeButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    completeButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
    // Priority rating slider styles
    sliderContainer: {
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 12,
        padding: 16,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sliderLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
    },
    sliderValue: {
        fontSize: 15,
        fontWeight: '700',
        color: theme.colors.primary,
    },
    sliderTrack: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
    },
    sliderDot: {
        flex: 1,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.glassBorder,
    },
    sliderDotActive: {
        backgroundColor: theme.colors.primary,
    },
});
