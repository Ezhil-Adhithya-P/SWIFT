import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';

export default function TransactionDetailScreen({ route }) {
    const { transaction } = route.params;

    const dateObj = new Date(transaction.date);
    const formattedDate = dateObj.toLocaleDateString();
    const formattedTime = dateObj.toLocaleTimeString();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>{transaction.title}</Text>
                
                <Text style={[styles.amount, { color: colors.white }]}>
                    {transaction.type === 'TOP_UP' ? '+' : '-'} ₹{transaction.amount.toFixed(2)}
                </Text>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value}>{transaction.id}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{formattedDate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Time</Text>
                    <Text style={styles.value}>{formattedTime}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>{transaction.type}</Text>
                </View>

                {transaction.items && transaction.items !== '' && (
                    <View style={{ width: '100%' }}>
                        <View style={styles.divider} />
                        <Text style={[styles.label, { marginBottom: 16 }]}>Detailed Purchase Summary</Text>
                        
                        {transaction.items.includes('|') ? (
                            <>
                                <View style={styles.headerRow}>
                                    <Text style={[styles.headerLabel, {flex: 2}]}>ITEM</Text>
                                    <Text style={[styles.headerLabel, {flex: 1.5, textAlign: 'center'}]}>QTY x PRICE</Text>
                                    <Text style={[styles.headerLabel, {flex: 1, textAlign: 'right'}]}>TOTAL</Text>
                                </View>
                                {transaction.items.split(';;').map((itemStr, idx) => {
                                    const [name, qty, price, total] = itemStr.split('|');
                                    return (
                                        <View key={idx} style={styles.itemDetailBox}>
                                            <Text style={[styles.itemName, {flex: 2}]}>{name}</Text>
                                            <Text style={[styles.itemMeta, {flex: 1.5, textAlign: 'center'}]}>{qty} x ₹{price}</Text>
                                            <Text style={[styles.itemTotal, {flex: 1, textAlign: 'right'}]}>₹{total}</Text>
                                        </View>
                                    );
                                })}
                            </>
                        ) : (
                            <Text style={styles.itemsValue}>{transaction.items}</Text>
                        )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    card: {
        backgroundColor: colors.primary,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    amount: {
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: '100%',
        marginVertical: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '500',
    },
    value: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
    },
    itemsValue: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'left',
        width: '100%',
        lineHeight: 20,
    },
    itemDetailBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    itemName: {
        fontSize: 13,
        color: colors.white,
        fontWeight: '600',
    },
    itemMeta: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    itemTotal: {
        fontSize: 14,
        color: colors.white,
        fontWeight: 'bold',
    }
});
