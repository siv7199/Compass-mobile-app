import React, { createContext, useState, useContext } from 'react';

// 1. Define the Color Palettes
const darkColors = {
    background: '#0B0E14',
    primary: '#00FF99', // Neon Green
    secondary: '#00D1FF', // Cyan
    danger: '#FF4444',
    warning: '#FFCC00',
    info: '#0088FF',
    text: '#FFFFFF',
    textDim: 'rgba(255, 255, 255, 0.6)',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    tacticalGreen: '#00FF99',
    tacticalBlack: '#0d0d0d',
    card: '#1A1D24', // Use for cards in light mode contrast
};

const lightColors = {
    background: '#F0F2F5', // Light Grey/White
    primary: '#00AA66', // Darker Green for visibility
    secondary: '#0077CC', // Darker Blue
    danger: '#CC0000',
    warning: '#CC9900',
    info: '#0055AA',
    text: '#111111', // Almost Black
    textDim: 'rgba(0, 0, 0, 0.6)',
    glass: 'rgba(0, 0, 0, 0.05)',
    glassBorder: 'rgba(0, 0, 0, 0.1)',
    tacticalGreen: '#008855',
    tacticalBlack: '#FFFFFF',
    card: '#FFFFFF',
};

// 2. Base Theme (Fonts, Spacing) - Shared
const baseTheme = {
    fonts: {
        heading: 'System',
        body: 'System',
        mono: 'Courier',
    },
    spacing: { s: 8, m: 16, l: 24, xl: 32 },
    borderRadius: { s: 4, m: 8, l: 16 },
};

// 3. Create Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(true); // Default: Dark

    const activeColors = isDarkMode ? darkColors : lightColors;

    const theme = {
        ...baseTheme,
        colors: activeColors,
        isDark: isDarkMode,
    };

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 4. Custom Hook for easy access
export const useTheme = () => useContext(ThemeContext);
