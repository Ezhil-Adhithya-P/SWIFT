import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function PaymentGatewayScreen({ route, navigation }) {
    const { amount } = route.params;
    const { addFunds } = useContext(WalletContext);
    
    const [selectedBank, setSelectedBank] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const banks = [
        { id: '1', name: 'State Bank of India' },
        { id: '2', name: 'HDFC Bank' },
        { id: '3', name: 'ICICI Bank' },
        { id: '4', name: 'UPI (GPay / PhonePe)' },
    ];

    const handleConfirmPayment = () => {
        if (!selectedBank) {
            Alert.alert('Error', 'Please select a payment method.');
            return;
        }
        if (pin.length < 4) {
            Alert.alert('Error', 'Please enter a valid 4 or 6 digit PIN (Mock).');
            return;
        }

        setLoading(true);
        // Simulate bank processing delay
        setTimeout(() => {
            setLoading(false);
            const success = addFunds(amount, `Added via ${selectedBank}`);
            
            if (success) {
                Alert.alert(
                    'Payment Successful',
                    `₹${parseFloat(amount).toFixed(2)} was successfully added from your mocked bank account.`,
                    [{ text: 'Great!', onPress: () => navigation.navigate('Dashboard') }]
                );
            } else {
                Alert.alert('Error', 'Transaction failed.');
            }
        }, 2000);
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.card}>
                <Text style={styles.headerTitle}>Secure Payment Gateway (Mock)</Text>
                <Text style={styles.amountText}>Amount to Pay: <Text style={styles.boldAmount}>₹{amount}</Text></Text>

                <Text style={styles.label}>Select Bank / Method:</Text>
                <View style={styles.bankList}>
                    {banks.map((bank) => (
                        <TouchableOpacity 
                            key={bank.id} 
                            style={[
                                styles.bankOption, 
                                selectedBank === bank.name && styles.bankOptionSelected
                            ]}
                            onPress={() => setSelectedBank(bank.name)}
                        >
                            <View style={[
                                styles.radioCircle,
                                selectedBank === bank.name && styles.radioCircleSelected
                            ]} />
                            <Text style={styles.bankName}>{bank.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {selectedBank ? (
                    <View style={styles.pinSection}>
                        <Text style={styles.label}>Enter Mock Bank PIN:</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="****"
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={6}
                            value={pin}
                            onChangeText={setPin}
                        />
                    </View>
                ) : null}

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleConfirmPayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.buttonText}>Confirm Payment securely</Text>
                    )}
                </TouchableOpacity>
                <Text style={styles.footerNote}>*This is a simulated transaction. No real money or real bank account is used.</Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 16,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: colors.white,
        padding: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    amountText: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.textLight,
        marginBottom: 24,
    },
    boldAmount: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    bankList: {
        marginBottom: 20,
    },
    bankOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 8,
    },
    bankOptionSelected: {
        borderColor: colors.primary,
        backgroundColor: 'rgba(123, 31, 162, 0.05)',
    },
    radioCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: colors.border,
        marginRight: 12,
    },
    radioCircleSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    bankName: {
        fontSize: 16,
        color: colors.text,
    },
    pinSection: {
        marginBottom: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 16,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 4,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerNote: {
        marginTop: 16,
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
