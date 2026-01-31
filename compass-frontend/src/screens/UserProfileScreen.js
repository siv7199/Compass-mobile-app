import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { User, Mail, AtSign, ChevronRight, Camera, ChevronDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const AGE_OPTIONS = [
    { label: 'Freshman (14-15)', value: 'freshman' },
    { label: 'Sophomore (15-16)', value: 'sophomore' },
    { label: 'Junior (16-17)', value: 'junior' },
    { label: 'Senior (17-18)', value: 'senior' },
    { label: 'Gap Year / Other', value: 'other' },
];

export default function UserProfileScreen({ navigation, onComplete, initialData, isEditing = false }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [step, setStep] = useState(1); // 1 = profile info, 2 = age
    const [name, setName] = useState(initialData?.name || '');
    const [email, setEmail] = useState(initialData?.email || '');
    const [username, setUsername] = useState(initialData?.username || '');
    const [age, setAge] = useState(initialData?.age || null);
    const [showAgePicker, setShowAgePicker] = useState(false);
    const [profilePic, setProfilePic] = useState(initialData?.profilePic || null);

    const pickImage = async () => {
        try {
            // Ask user for permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant camera roll permissions to add a profile picture.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfilePic(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const isStep1Valid = name.trim().length >= 2 && email.trim().length > 0 && username.trim().length > 0;
    const isStep2Valid = age !== null;

    const handleContinue = () => {
        if (step === 1 && isStep1Valid) {
            setStep(2);
        } else if (step === 2 && isStep2Valid) {
            onComplete({
                name: name.trim(),
                email: email.trim(),
                username: username.trim(),
                age,
                profilePic: profilePic,
            });
        }
    };

    const renderStep1 = () => (
        <>
            <View style={styles.header}>
                {isEditing && (
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
                        <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← Back</Text>
                    </TouchableOpacity>
                )}
                <Text style={styles.title}>{isEditing ? "Edit Profile" : "Let's get to know you"}</Text>
                <Text style={styles.subtitle}>
                    {isEditing ? "Update your personal details" : "This helps us personalize your experience"}
                </Text>
            </View>

            {/* Profile Picture */}
            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.avatarImage} />
                ) : (
                    <LinearGradient
                        colors={[theme.colors.primary + '40', theme.colors.primary + '10']}
                        style={styles.avatarGradient}
                    >
                        <User size={40} color={theme.colors.primary} />
                    </LinearGradient>
                )}
                <View style={styles.cameraButton}>
                    <Camera size={14} color="#fff" />
                </View>
            </TouchableOpacity>

            {/* Input Fields */}
            <View style={styles.inputGroup}>
                <View style={styles.inputWrapper}>
                    <User size={20} color={theme.colors.textDim} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Your name *"
                        placeholderTextColor={theme.colors.textDim}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <Mail size={20} color={theme.colors.textDim} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email *"
                        placeholderTextColor={theme.colors.textDim}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <AtSign size={20} color={theme.colors.textDim} style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Username *"
                        placeholderTextColor={theme.colors.textDim}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>
            </View>

            <Text style={styles.hint}>* Required field</Text>
        </>
    );

    const renderStep2 = () => (
        <>
            <View style={styles.header}>
                <Text style={styles.title}>What year are you in?</Text>
                <Text style={styles.subtitle}>
                    This helps us tailor features to your stage
                </Text>
            </View>

            <View style={styles.ageOptions}>
                {AGE_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.ageOption,
                            age === option.value && styles.ageOptionSelected
                        ]}
                        onPress={() => setAge(option.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.ageOptionText,
                            age === option.value && styles.ageOptionTextSelected
                        ]}>
                            {option.label}
                        </Text>
                        {age === option.value && (
                            <View style={styles.checkmark}>
                                <Text style={styles.checkmarkText}>✓</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
                    <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 ? renderStep1() : renderStep2()}
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            (step === 1 ? !isStep1Valid : !isStep2Valid) && styles.continueButtonDisabled
                        ]}
                        onPress={handleContinue}
                        disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continueButtonText}>
                            {step === 2
                                ? (isEditing ? 'Save Changes' : 'Continue')
                                : 'Next'}
                        </Text>
                        {(!isEditing || step === 1) && <ChevronRight size={20} color="#000" />}
                    </TouchableOpacity>
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
    content: {
        flexGrow: 1,
        padding: 24,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textDim,
        lineHeight: 22,
    },
    avatarContainer: {
        alignSelf: 'center',
        marginBottom: 32,
        position: 'relative',
    },
    avatarGradient: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.glassBorder,
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.colors.glassBorder,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: theme.colors.background,
    },
    inputGroup: {
        gap: 16,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 14,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: theme.colors.text,
    },
    hint: {
        marginTop: 16,
        fontSize: 13,
        color: theme.colors.textDim,
    },
    ageOptions: {
        gap: 12,
    },
    ageOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.glass,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        borderRadius: 14,
        padding: 18,
    },
    ageOptionSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '15',
    },
    ageOptionText: {
        fontSize: 16,
        color: theme.colors.text,
    },
    ageOptionTextSelected: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
    checkmark: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        color: '#000',
        fontWeight: '700',
    },
    footer: {
        padding: 24,
        paddingTop: 0,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    continueButtonDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
    },
    continueButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000',
    },
});
