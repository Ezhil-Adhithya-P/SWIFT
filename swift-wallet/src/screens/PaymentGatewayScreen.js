import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function PaymentGatewayScreen({ route, navigation }) {
    const { amount } = route.params;
    const { addFunds } = useContext(WalletContext);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        // Auto-redirect after 3 seconds
        const timer = setTimeout(async () => {
            setLoading(true);
            const success = await addFunds(amount, `Added via QR Code`);
            
            if (isMounted) {
                if (success) {
                    Alert.alert(
                        'Payment Successful',
                        `₹${parseFloat(amount).toFixed(2)} was successfully added to your wallet.`,
                        [{ text: 'Great!', onPress: () => navigation.navigate('Dashboard') }]
                    );
                } else {
                    Alert.alert('Error', 'Transaction failed.', [{ text: 'OK', onPress: () => navigation.navigate('Dashboard') }]);
                }
            }
        }, 3000);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, []); // Empty dependency array to ensure it only runs once

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.headerTitle}>Scan to Pay</Text>
                <Text style={styles.amountText}>Amount: <Text style={styles.boldAmount}>₹{amount}</Text></Text>

                <View style={styles.qrContainer}>
                    <Image 
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SWIFT-TopUp-${amount}` }} 
                        style={styles.qrImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Waiting for payment confirmation...</Text>
                </View>

                <Text style={styles.footerNote}>*This page will automatically redirect after 3 seconds upon successful scan.</Text>
            </View>
        </View>
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    amountText: {
        fontSize: 18,
        textAlign: 'center',
        color: colors.textLight,
        marginBottom: 24,
    },
    boldAmount: {
        color: colors.text,
        fontWeight: 'bold',
        fontSize: 24,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 24,
    },
    qrImage: {
        width: 250,
        height: 250,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    loadingText: {
        marginLeft: 12,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    footerNote: {
        marginTop: 16,
        fontSize: 12,
        color: colors.textLight,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
