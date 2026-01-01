import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { theme } from '../theme';

export default function LoadoutPanel({
    scholarships, setScholarships,
    familyContribution, setFamilyContribution,
    workStudy, setWorkStudy,
    onSlidingStart, onSlidingComplete // Lock Scroll
}) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>EQUIP LOADOUT</Text>

            <TacticalSlider
                label="SHIELDS"
                value={scholarships}
                max={50000}
                step={1000}
                setValue={setScholarships}
                color={theme.colors.tacticalGreen}
                onSlidingStart={onSlidingStart}
                onSlidingComplete={onSlidingComplete}
            />

            <TacticalSlider
                label="SQUAD SUPPORT"
                value={familyContribution}
                max={100000}
                step={5000}
                setValue={setFamilyContribution}
                color={theme.colors.secondary}
                onSlidingStart={onSlidingStart}
                onSlidingComplete={onSlidingComplete}
            />

            <TacticalSlider
                label="SIDE OPS"
                value={workStudy}
                max={20000}
                step={1000}
                setValue={setWorkStudy}
                color={theme.colors.warning}
                onSlidingStart={onSlidingStart}
                onSlidingComplete={onSlidingComplete}
            />
        </View>
    );
}

// Reusable Tactical Slider (Defined OUTSIDE to prevent re-renders)
const TacticalSlider = ({ label, value, max, step, setValue, color, onSlidingStart, onSlidingComplete }) => (
    <View style={styles.sliderContainer}>
        <View style={styles.headerRow}>
            <Text style={styles.sliderLabel}>{label}</Text>
            <Text style={[styles.sliderValue, { color: theme.colors.tacticalGreen }]}>${value.toLocaleString()}</Text>
        </View>
        <Slider
            style={{ width: '100%', height: 40 }} // Stable height
            minimumValue={0}
            maximumValue={max}
            step={step}
            value={value}
            minimumTrackTintColor={theme.colors.tacticalGreen} // Always Green
            maximumTrackTintColor="#333333"
            thumbTintColor={theme.colors.tacticalGreen} // Always Green
            onValueChange={setValue}
            onSlidingStart={onSlidingStart}
            onSlidingComplete={onSlidingComplete}
        />
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.glass,
        padding: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: theme.colors.glassBorder,
        marginBottom: 30,
    },
    sectionTitle: {
        color: theme.colors.tacticalGreen,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 20,
        letterSpacing: 2,
        fontFamily: theme.fonts.heading,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.glassBorder,
        paddingBottom: 10,
    },
    sliderContainer: {
        marginBottom: 40, // Increased to prevent touch overlap
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    sliderLabel: {
        color: '#888',
        fontSize: 10,
        fontFamily: theme.fonts.mono,
        letterSpacing: 1,
    },
    sliderValue: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: theme.fonts.mono,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 4,
    },
});
