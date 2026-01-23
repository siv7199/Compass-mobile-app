import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Send, Briefcase, Heart, Zap, PenTool, ChevronRight, Edit2 } from 'lucide-react-native';

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

const STEPS = ['welcome', 'gpa', 'sat', 'career', 'budget', 'complete'];

export default function OnboardingScreen({ navigation, onComplete }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const scrollRef = useRef(null);

    const [currentStep, setCurrentStep] = useState(0);
    // 0: Welcome, 1: GPA, 2: SAT, 3: Career Category, 3.5: Specific Career, 4: Budget, 5: Complete
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [userData, setUserData] = useState({
        gpa: '',
        sat: '',
        career: null,
        budget: '',
    });

    // Animate new messages
    const addMessage = (text, isUser = false, stepId = null) => {
        setMessages(prev => [...prev, { text, isUser, id: Date.now() + Math.random(), stepId }]);
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // Initial message on mount
    useEffect(() => {
        setTimeout(() => {
            addMessage("Welcome to Compass! 👋");
            setTimeout(() => {
                addMessage("I'll help you find colleges that match your goals and budget. Let's start with a few quick questions.");
                setTimeout(() => {
                    addMessage("What's your GPA? (Use your unweighted GPA on a 0-4.0 scale)");
                    setCurrentStep(1);
                }, 400);
            }, 600);
        }, 300);
    }, []);

    const handleGPASubmit = () => {
        const gpa = parseFloat(inputValue);
        if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
            addMessage("Please enter a valid GPA between 0 and 4.0");
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
            }, 400);
        }, 300);
    };

    const handleSATSubmit = () => {
        const input = inputValue.toLowerCase().trim();

        if (['skip', 'n/a', 'idk', 'no', ''].includes(input)) {
            addMessage("Skipping SAT", true, 2);
            setUserData(prev => ({ ...prev, sat: '' }));
        } else {
            const sat = parseInt(inputValue);
            if (isNaN(sat) || sat < 400 || sat > 1600) {
                addMessage("Please enter a valid SAT score between 400 and 1600, or type 'skip'");
                return;
            }
            addMessage(inputValue, true, 2);
            setUserData(prev => ({ ...prev, sat: inputValue }));
        }

        setInputValue('');

        setTimeout(() => {
            addMessage("Now, what career area interests you most? (Scroll to see more options)");
            setCurrentStep(3);
        }, 300);
    };

    const handleCareerSelect = (career) => {
        addMessage(career.name, true, 3);
        setSelectedCategory(career.id);

        setTimeout(() => {
            addMessage(`Which specific role in ${career.name} interests you? (Scroll list to view all)`);
            setCurrentStep(3.5); // Intermediate step for specific career
        }, 300);
    };

    const handleSpecificCareerSelect = (specificCareer) => {
        addMessage(specificCareer.title, true, 3.5);
        setUserData(prev => ({
            ...prev,
            career: {
                ...prev.career, // preserve category info if any
                name: specificCareer.title,
                soc: specificCareer.soc
            }
        }));

        setTimeout(() => {
            addMessage(`${specificCareer.title} - excellent choice!`);
            setTimeout(() => {
                addMessage("Last question: What's the maximum you can spend per year on college? (Enter a number like 30000)");
                setCurrentStep(4);
            }, 400);
        }, 300);
    };

    const handleBudgetSubmit = () => {
        const input = inputValue.toLowerCase().trim();
        // Allow skip
        if (['skip', 'idk', 'dunno', "i don't know", ''].includes(input)) {
            addMessage("No budget set", true, 4);
            // Default to 25000 (typical manageable debt/year) or 0
            setUserData(prev => ({ ...prev, budget: '25000' }));
            setInputValue('');
            setTimeout(() => {
                addMessage("I'll assume a standard budget ~25k/yr for now. 🎯");
                setTimeout(() => {
                    addMessage("Let me find colleges that match your profile...");
                    setCurrentStep(5);
                }, 500);
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
            addMessage("Perfect! I have everything I need. 🎯");
            setTimeout(() => {
                addMessage("Let me find colleges that match your profile...");
                setCurrentStep(5);
            }, 500);
        }, 300);
    };

    const handleSubmit = () => {
        if (!inputValue.trim()) return;

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
        }
    };

    const handleEdit = (stepId) => {
        if (!stepId) return;

        // Reset to specific step
        setCurrentStep(stepId);

        // Remove messages after this point to keep chat clean
        const messageIndex = messages.findIndex(m => m.stepId === stepId);
        if (messageIndex !== -1) {
            setMessages(prev => prev.slice(0, messageIndex));
        }

        // Pre-fill input if data exists
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
        if (currentStep === 3) {
            // Career selection cards
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

        if (currentStep === 3.5) {
            // Specific Career List
            const options = SPECIFIC_CAREERS[selectedCategory] || [];
            return (
                <View style={[styles.careerGrid, { maxHeight: 300 }]}>
                    <ScrollView
                        nestedScrollEnabled
                        style={{ width: '100%', maxHeight: 250 }}
                        persistentScrollbar={true}
                        showsVerticalScrollIndicator={true}
                        indicatorStyle="white"
                        onContentSizeChange={(w, h) => scrollRef.current?.flashScrollIndicators()}
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

        if (currentStep === 5) {
            // Complete - show button to proceed
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

        // Text input for GPA, SAT, Budget
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    key={currentStep} // Force re-render to update keyboard type
                    style={styles.input}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder={
                        currentStep === 1 ? "e.g., 3.5" :
                            currentStep === 2 ? "e.g., 1200 or 'skip'" :
                                currentStep === 4 ? "e.g., 30000" : ""
                    }
                    placeholderTextColor={theme.colors.textDim}
                    keyboardType={(currentStep === 2 || currentStep === 4) ? "default" : (currentStep === 1 ? "numeric" : "default")}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="default"
                    blurOnSubmit={false}
                />
                <TouchableOpacity
                    style={[styles.sendButton, !inputValue.trim() && { opacity: 0.5 }]}
                    onPress={handleSubmit}
                    disabled={!inputValue.trim()}
                >
                    <Send size={20} color="#000" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={10}
            >
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    {STEPS.slice(1, -1).map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.progressDot,
                                currentStep > index && styles.progressDotActive
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
                            {msg.isUser && msg.stepId && (
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
        backgroundColor: theme.colors.primary, // Solid Green
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
});
