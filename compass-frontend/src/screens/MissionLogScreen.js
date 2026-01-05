import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import HoloTutorial from '../components/HoloTutorial';

export default function MissionLogScreen({ route, navigation, saveMission, showTutorial, closeTutorial }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { debt, salary, schoolName } = route.params;

    // --- MATH ENGINE ---
    const annualRepayment = salary * 0.20; // 20% of Gross
    const yearsToPayoff = debt / annualRepayment;

    // Generate Graph Data (Projected Balance over Time)
    const labels = [];
    const dataPoints = [];

    // Determine Scale: If < 5 years, show granular. If > 10, show broad.
    const maxYears = Math.min(Math.ceil(yearsToPayoff) + 1, 15); // Cap at 15 for UI

    for (let i = 0; i <= maxYears; i++) {
        labels.push(i.toString());
        const remaining = Math.max(0, debt - (annualRepayment * i));
        dataPoints.push(remaining);
    }

    return (
        <SafeAreaView style={styles.container}>
            <HoloTutorial visible={showTutorial} onClose={closeTutorial} scenario="MISSION_LOG" />
            <View style={styles.header}>
                <Text style={styles.title}>MISSION COMPLETE</Text>
                <Text style={styles.subtitle}>{schoolName}</Text>
            </View>

            {/* VICTORY CARD */}
            <View style={styles.card}>
                <Text style={styles.label}>ESTIMATED FREEDOM DATE</Text>
                <Text style={styles.bigValue}>{yearsToPayoff.toFixed(1)} YEARS</Text>
                <Text style={styles.statDetail}>
                    Based on ${salary.toLocaleString()} salary
                </Text>
            </View>

            {/* CHART */}
            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>DEBT ELIMINATION TRAJECTORY</Text>
                <LineChart
                    data={{
                        labels: labels,
                        datasets: [{ data: dataPoints }]
                    }}
                    width={Dimensions.get("window").width - 60} // Reduced for better fit
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix="k"
                    yAxisInterval={1}
                    formatYLabel={(value) => Math.round(value / 1000).toString()} // Convert 100000 to 100
                    chartConfig={{
                        backgroundColor: theme.colors.background,
                        backgroundGradientFrom: theme.colors.background,
                        backgroundGradientTo: theme.colors.background,
                        decimalPlaces: 0,
                        color: (opacity = 1) => theme.isDark ? `rgba(0, 255, 153, ${opacity})` : `rgba(0, 170, 102, ${opacity})`,
                        labelColor: (opacity = 1) => theme.isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "4", strokeWidth: "2", stroke: theme.colors.primary }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                        alignSelf: 'center'
                    }}
                />
            </View>

            {/* ACTION */}
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 20, gap: 10 }}>
                <TouchableOpacity
                    style={[styles.button, { flex: 1, backgroundColor: theme.colors.tacticalGreen, borderColor: theme.colors.tacticalGreen }]}
                    onPress={() => {
                        saveMission && saveMission({
                            id: Date.now(),
                            date: new Date().toLocaleDateString(),
                            target1: schoolName,
                            target2: "N/A", // Single Mission
                            score1: yearsToPayoff.toFixed(1) + " Years",
                            score2: "-"
                        });
                        alert("MISSION ARCHIVED.");
                    }}
                >
                    <Text style={[styles.buttonText, { color: '#000' }]}>SAVE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { flex: 1 }]}
                    onPress={() => navigation.navigate('Lobby')}
                >
                    <Text style={styles.buttonText}>BASE</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.tacticalBlack,
        padding: 20,
        alignItems: 'center',
    },
    header: {
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: theme.colors.tacticalGreen,
        fontSize: 24,
        fontFamily: theme.fonts.heading,
        letterSpacing: 3,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
        fontFamily: theme.fonts.mono,
        marginTop: 5,
    },
    card: {
        backgroundColor: theme.colors.glass,
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.tacticalGreen,
        width: '100%',
        marginBottom: 30,
    },
    label: {
        color: '#888',
        fontSize: 12,
        fontFamily: theme.fonts.mono,
        letterSpacing: 2,
        marginBottom: 10,
    },
    bigValue: {
        color: theme.colors.text,
        fontSize: 48,
        fontFamily: theme.fonts.heading,
        textShadowColor: theme.colors.tacticalGreen,
        textShadowRadius: 10,
    },
    statDetail: {
        color: theme.colors.secondary,
        fontSize: 12,
        marginTop: 5,
    },
    chartContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    chartTitle: {
        color: '#666',
        fontSize: 10,
        fontFamily: theme.fonts.mono,
        marginBottom: 10,
    },
    chart: {
        paddingRight: 40, // fix label clip
        borderRadius: 16,
    },
    button: {
        marginTop: 'auto',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: theme.colors.tacticalGreen,
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 255, 153, 0.1)',
    },
    buttonText: {
        color: theme.colors.tacticalGreen,
        fontFamily: theme.fonts.heading,
        fontSize: 16,
        letterSpacing: 1,
    },
});
