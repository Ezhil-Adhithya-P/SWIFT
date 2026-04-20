import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function DashboardScreen({ navigation }) {
    const { balance, transactions } = useContext(WalletContext);

    const renderItem = ({ item }) => {
        const dateObj = new Date(item.date);
        const dateString = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        return (
            <View style={styles.txCard}>
                <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>{item.title}</Text>
                    <Text style={styles.txDate}>{dateString}</Text>
                </View>
                <Text style={[styles.txAmount, { color: item.type === 'TOP_UP' ? colors.success : colors.text }]}>
                    {item.type === 'TOP_UP' ? '+' : '-'} ₹{item.amount.toFixed(2)}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Balance Card */}
            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
                
                <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => navigation.navigate('TopUp')}
                >
                    <Text style={styles.addButtonText}>+ Add Amount</Text>
                </TouchableOpacity>
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
    balanceCard: {
        backgroundColor: colors.primary,
        margin: 16,
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
    addButton: {
        backgroundColor: colors.secondary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.primary,
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
