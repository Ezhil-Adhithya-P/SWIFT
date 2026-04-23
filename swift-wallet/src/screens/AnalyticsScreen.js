import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import colors from '../theme/colors';
import { WalletContext } from '../context/WalletContext';

export default function AnalyticsScreen() {
    const { transactions } = useContext(WalletContext);
    
    // Group purchases by month
    const purchasesByMonth = { Jan: 0, Feb: 0, Mar: 0, Apr: 0 };
    const topupsByMonth = { Jan: 0, Feb: 0, Mar: 0, Apr: 0 };
    
    let totalSpent = 0;
    
    transactions.forEach(t => {
        const date = new Date(t.date);
        const monthIndex = date.getMonth(); // 0=Jan, 1=Feb, 2=Mar, 3=Apr
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr'];
        if(monthIndex >= 0 && monthIndex <= 3) {
            const m = monthNames[monthIndex];
            if(t.type === 'PURCHASE') {
                purchasesByMonth[m] += t.amount;
                totalSpent += t.amount;
            } else if (t.type === 'TOP_UP') {
                topupsByMonth[m] += t.amount;
            }
        }
    });

    const screenWidth = Dimensions.get("window").width;
    
    const chartConfigLine = {
      backgroundColor: "#1E1E2C",
      backgroundGradientFrom: "#2A2A3C",
      backgroundGradientTo: "#1E1E2C",
      color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 3,
      propsForDots: {
        r: "5",
        strokeWidth: "2",
        stroke: "#FFFFFF"
      },
      propsForBackgroundLines: {
        stroke: "rgba(255,255,255,0.05)"
      }
    };

    const chartConfigBar = {
        backgroundColor: "#1E1E2C",
        backgroundGradientFrom: "#1E1E2C",
        backgroundGradientTo: "#2A2A3C",
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        barPercentage: 0.7,
        propsForBackgroundLines: {
            stroke: "rgba(255,255,255,0.05)"
        }
      };

    const chartConfigPie = {
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    };

    const lineData = {
      labels: ["Jan", "Feb", "Mar", "Apr"],
      datasets: [
        {
          data: [purchasesByMonth.Jan, purchasesByMonth.Feb, purchasesByMonth.Mar, purchasesByMonth.Apr],
          color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`, 
        }
      ],
    };

    const barData = {
      labels: ["Jan", "Feb", "Mar", "Apr"],
      datasets: [
        {
          data: [topupsByMonth.Jan, topupsByMonth.Feb, topupsByMonth.Mar, topupsByMonth.Apr]
        }
      ]
    };

    const pieData = [
      {
        name: "Spent",
        amount: totalSpent,
        color: "#FF6B6B",
        legendFontColor: "#EEEEEE",
        legendFontSize: 14
      },
      {
        name: "Saved",
        amount: Math.max(0, topupsByMonth.Jan + topupsByMonth.Feb + topupsByMonth.Mar + topupsByMonth.Apr - totalSpent),
        color: "#2ECC71",
        legendFontColor: "#EEEEEE",
        legendFontSize: 14
      }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Total Expenditure</Text>
                <Text style={styles.summaryAmount}>₹{totalSpent.toFixed(2)}</Text>
                <Text style={styles.summarySubtitle}>Across {transactions.length} transactions this semester</Text>
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Monthly Spending Trend</Text>
                <LineChart
                    data={lineData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfigLine}
                    bezier
                    style={styles.chart}
                    yAxisLabel="₹"
                />
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Wallet Top-Ups</Text>
                <BarChart
                    data={barData}
                    width={screenWidth - 40}
                    height={220}
                    yAxisLabel="₹"
                    chartConfig={chartConfigBar}
                    verticalLabelRotation={0}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                />
            </View>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Spending Distribution</Text>
                <PieChart
                    data={pieData}
                    width={screenWidth - 40}
                    height={220}
                    chartConfig={chartConfigPie}
                    accessor={"amount"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 10]}
                    absolute
                />
            </View>
            <View style={{height: 40}} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
        padding: 20,
    },
    summaryCard: {
        backgroundColor: colors.primary,
        borderRadius: 20,
        padding: 24,
        marginBottom: 24,
        alignItems: 'center',
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    summaryTitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    summaryAmount: {
        color: colors.white,
        fontSize: 48,
        fontWeight: '900',
        marginVertical: 8,
    },
    summarySubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 14,
    },
    chartContainer: {
        backgroundColor: '#1E1E2C',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 16,
        alignSelf: 'center',
        letterSpacing: 0.5,
    },
    chart: {
        borderRadius: 16,
        marginLeft: -10,
    }
});
