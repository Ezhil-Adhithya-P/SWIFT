import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import colors from '../theme/colors';

export default function LoginScreen({ navigation }) {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Mock login
        if (rollNumber && password) {
            navigation.replace('Dashboard');
        } else {
            alert('Please enter Roll Number and Password.');
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Welcome Back</Text>
                
                <Text style={styles.label}>Roll Number</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="Enter your roll number"
                    value={rollNumber}
                    onChangeText={setRollNumber}
                    autoCapitalize="characters"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput 
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login to Wallet</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: colors.white,
        padding: 24,
        borderRadius: 16,
        // Remove shadow to match the flat UI in screenshots, or use subtle shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
