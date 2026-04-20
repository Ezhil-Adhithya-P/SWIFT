import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function TopUpScreen({ navigation }) {
    const [amount, setAmount] = useState('');

    const handlePayment = () => {
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid valid amount.');
            return;
        }

        navigation.navigate('PaymentGateway', { amount: num.toString() });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Enter Top-up Amount (₹)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., 500"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
            />

            <View style={styles.chipContainer}>
                {[100, 500, 1000].map((val) => (
                    <TouchableOpacity 
                        key={val} 
                        style={styles.chip}
                        onPress={() => setAmount(val.toString())}
                    >
                        <Text style={styles.chipText}>+₹{val}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handlePayment}
            >
                <Text style={styles.buttonText}>Proceed to Pay</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    label: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
        marginTop: 20,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
        textAlign: 'center',
    },
    chipContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 40,
    },
    chip: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    chipText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
