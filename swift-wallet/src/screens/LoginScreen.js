import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function LoginScreen({ navigation }) {
    const { login, requestPasswordReset, resetPassword } = useContext(WalletContext);
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    
    // Forgot Password Flow State
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleLogin = async () => {
        if (!rollNumber || !password) return Alert.alert('Error', 'Please enter Roll Number and Password.');
        
        const res = await login(rollNumber, password);
        if (res.success) {
            navigation.replace('Dashboard');
        } else {
            Alert.alert('Login Failed', res.message);
        }
    };

    const handleForgotPassword = async () => {
        if (!rollNumber) return Alert.alert('Error', 'Please enter your Roll Number first to request OTP.');
        
        const res = await requestPasswordReset(rollNumber);
        if (res.success) {
            Alert.alert('OTP Sent', res.message);
            setIsResetting(true);
        } else {
            Alert.alert('Error', res.message);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) return Alert.alert('Error', 'Please enter OTP and new password.');
        
        const res = await resetPassword(rollNumber, otp, newPassword);
        if (res.success) {
            Alert.alert('Success', 'Password reset successfully. You can now login.');
            setIsForgotPassword(false);
            setIsResetting(false);
            setPassword('');
            setOtp('');
        } else {
            Alert.alert('Error', res.message);
        }
    };

    if (isForgotPassword) {
        return (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
                <Text style={styles.appTitle}>REC Student Wallet App</Text>

                <View style={styles.card}>
                    <Text style={styles.title}>Reset Password</Text>
                    
                    <Text style={styles.label}>Roll Number</Text>
                    <TextInput 
                        style={styles.input}
                        placeholder="Enter roll number"
                        value={rollNumber}
                        onChangeText={setRollNumber}
                        editable={!isResetting}
                        autoCapitalize="characters"
                    />

                    {!isResetting ? (
                        <>
                            <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                                <Text style={styles.buttonText}>Send OTP to Email & SMS</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.linkButton} onPress={() => setIsForgotPassword(false)}>
                                <Text style={styles.linkText}>Back to Login</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>OTP Code</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter 6-digit OTP"
                                keyboardType="number-pad"
                                value={otp}
                                onChangeText={setOtp}
                            />
                            <Text style={styles.label}>New Password</Text>
                            <TextInput 
                                style={styles.input}
                                placeholder="Enter new password"
                                secureTextEntry
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                                <Text style={styles.buttonText}>Confirm Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.linkButton} onPress={() => setIsResetting(false)}>
                                <Text style={styles.linkText}>Resend OTP</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <Text style={styles.appTitle}>REC Student Wallet App</Text>
            
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

                <TouchableOpacity style={styles.linkButton} onPress={() => setIsForgotPassword(true)}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
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
    appTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 30,
        textShadowColor: 'rgba(108, 99, 255, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    card: {
        backgroundColor: colors.primary,
        padding: 24,
        borderRadius: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 24,
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        color: colors.white,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.secondary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
    }
});
