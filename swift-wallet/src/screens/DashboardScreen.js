import React, { useContext, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function DashboardScreen({ navigation }) {
    const { balance, transactions, logout, studentRollNo, studentName } = useContext(WalletContext);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    logout();
                    navigation.replace('Login');
                }}>
                    <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Logout</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, logout]);

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.date);
        const dateString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <TouchableOpacity style={styles.txCard} onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}>
                <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <Text style={styles.txDate}>{dateString}</Text>
                </View>
                <Text style={[styles.txAmount, { color: item.type === 'TOP_UP' ? colors.success : colors.text }]}>
                    {item.type === 'TOP_UP' ? '+' : '-'} ₹{item.amount.toFixed(2)}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{getGreeting()},</Text>
                <Text style={styles.nameText}>{studentName || 'Student'} ({studentRollNo})</Text>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
                
                <View style={styles.buttonRow}>
                    <TouchableOpacity 
                        style={styles.addButton}
                        onPress={() => navigation.navigate('TopUp')}
                    >
                        <Text style={styles.addButtonText}>+ Add Amount</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.analyticsButton}
                        onPress={() => navigation.navigate('Analytics')}
                    >
                        <Text style={styles.analyticsButtonText}>📊 Analytics</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Transaction History */}
            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Transaction History</Text>
                <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text style={styles.emptyText}>No recent transactions</Text>}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    greetingContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    greetingText: {
        fontSize: 16,
        color: colors.textLight,
    },
    nameText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 2,
    },
    balanceCard: {
        backgroundColor: colors.primary,
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    balanceLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
        marginBottom: 8,
    },
    balanceAmount: {
        color: colors.white,
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    addButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    analyticsButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    analyticsButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    historySection: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 16,
    },
    txCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    txInfo: {
        flex: 1,
    },
    txTitle: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    txDate: {
        fontSize: 13,
        color: colors.textLight,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textLight,
        marginTop: 20,
        fontStyle: 'italic',
    }
});
