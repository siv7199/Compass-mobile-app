import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';
import { StatusBar } from 'expo-status-bar';

const LOG_LINES = [
    "> INITIALIZING O.S....",
    "> ESTABLISHING SECURE CONNECTION...",
    "> DECRYPTING OPERATIVE PROTOCOLS...",
    "> LOADING TACTICAL MAPS...",
    "> COMPILING INTEL...",
    "> ACCESS GRANTED."
];

export default function SplashScreen({ navigation }) {
    const [logs, setLogs] = useState([]);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Log sequence
        let delay = 500;
        LOG_LINES.forEach((line, index) => {
            setTimeout(() => {
                setLogs(prev => [...prev, line]);
                if (index === LOG_LINES.length - 1) {
                    // Start transition after last log
                    setTimeout(() => {
                        navigation.replace('Lobby');
                    }, 1000);
                }
            }, delay);
            delay += (Math.random() * 500) + 300; // Random tactical delay
        });

        // Title Glitch/Fade In
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();

    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.center}>
                <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
                    COMPASS
                </Animated.Text>
                <Text style={styles.version}>Beta V1.0</Text>
            </View>

            <View style={styles.logContainer}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>
                        {log}
                    </Text>
                ))}
                <View style={styles.cursor} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    center: {
        alignItems: 'center',
        marginBottom: 100,
    },
    title: {
        fontFamily: theme.fonts.heading,
        fontSize: 38,
        color: theme.colors.tacticalGreen,
        letterSpacing: 4,
        textShadowColor: 'rgba(0, 255, 153, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    version: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.textDim,
        fontSize: 12,
        letterSpacing: 2,
        marginTop: theme.spacing.s,
    },
    logContainer: {
        position: 'absolute',
        bottom: 50,
        left: 30,
    },
    logText: {
        fontFamily: theme.fonts.mono,
        color: theme.colors.primary,
        fontSize: 14,
        marginBottom: 6,
    },
    cursor: {
        width: 10,
        height: 16,
        backgroundColor: theme.colors.primary,
        opacity: 0.8,
    }
});
