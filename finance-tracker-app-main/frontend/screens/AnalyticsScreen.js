import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

// LIGHT THEME COLORS
const COLORS = {
  bgMain: '#f4f6f9',     // Cool light gray background
  bgCard: '#ffffff',     // White cards
  textWhite: '#1f2937',  // Dark slate for main text (reused name so we don't change 50 styles)
  textMuted: '#6b7280',  // Gray for secondary text
  accentGreen: '#10b981',
  accentRed: '#f43f5e',
  themeInvert: '#0f172a', // Previously white, now very dark
};

export default function AnalyticsScreen({ navigation }) {
  const { userId } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [data, setData] = useState({ 
    income: 0, 
    expenses: 0,
    totalSpent: 0,
    avgSpent: 0,
    txCount: 0,
    catCount: 0,
    topCategories: [],
    pieData: []
  });
  
  const [refreshing, setRefreshing] = useState(false);

  // UI Functionality State
  const [activeTab, setActiveTab] = useState('Year');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Default to March 2026 as per mockup

  const fetchSummary = async () => {
    try {
      const [expRes, incRes] = await Promise.all([
        api.get(`/expense/list?user_id=${userId}`),
        api.get(`/income/list?user_id=${userId}`)
      ]);
      
      let expList = expRes.data?.success ? expRes.data.data : [];
      let incList = incRes.data?.success ? incRes.data.data : [];

      const filterDate = new Date(currentDate);
      
      const filterTx = (tx) => {
        if (!tx.date) return false;
        const txDate = new Date(tx.date);
        if (activeTab === 'Year') {
          return txDate.getFullYear() === filterDate.getFullYear();
        } else if (activeTab === 'Month') {
          return txDate.getFullYear() === filterDate.getFullYear() && txDate.getMonth() === filterDate.getMonth();
        } else if (activeTab === 'Week') {
          const day = filterDate.getDay();
          const diffToStart = filterDate.getDate() - day + (day === 0 ? -6 : 1);
          const startOfWeek = new Date(filterDate);
          startOfWeek.setDate(diffToStart);
          startOfWeek.setHours(0,0,0,0);
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23,59,59,999);
          
          return txDate >= startOfWeek && txDate <= endOfWeek;
        }
        return true; 
      };

      const filteredExp = expList.filter(filterTx);
      const filteredInc = incList.filter(filterTx);

      const tInc = filteredInc.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      const tExp = filteredExp.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      
      const catMap = {};
      filteredExp.forEach(e => {
        const cat = e.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + parseFloat(e.amount || 0);
      });

      const sortedCats = Object.keys(catMap).map(k => ({ name: k, amount: catMap[k] })).sort((a,b) => b.amount - a.amount);
      const top4 = sortedCats.slice(0, 4);

      const pieColors = ['#10b981', '#3b82f6', '#22c55e', '#facc15', '#ef4444', '#f43f5e', '#14b8a6', '#0ea5e9'];
      const mappedPie = sortedCats.map((sc, i) => ({
        ...sc,
        color: pieColors[i % pieColors.length],
        legendFontColor: COLORS.textWhite,
        legendFontSize: 12
      }));

      setData({
        income: tInc,
        expenses: tExp,
        totalSpent: tExp,
        avgSpent: filteredExp.length > 0 ? tExp / filteredExp.length : 0,
        txCount: filteredExp.length + filteredInc.length,
        catCount: Object.keys(catMap).length,
        topCategories: top4,
        pieData: mappedPie.length > 0 ? mappedPie : [{name: "No Data", amount: 1, color: "#cbd5e1", legendFontColor: COLORS.textWhite, legendFontSize: 12}]
      });

    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSummary();
    });
    fetchSummary();
    return unsubscribe;
  }, [navigation, activeTab, currentDate]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  };

  // Date Navigation Handlers
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (activeTab === 'Year') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else if (activeTab === 'Month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (activeTab === 'Week') {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (activeTab === 'Year') {
      newDate.setFullYear(newDate.getFullYear() + 1);
    } else if (activeTab === 'Month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (activeTab === 'Week') {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const getDateDisplay = () => {
    if (activeTab === 'Year') return currentDate.getFullYear().toString();
    if (activeTab === 'Month') return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (activeTab === 'Week') return `Week of ${currentDate.toLocaleString('default', { month: 'short', day: 'numeric' })}`;
    return 'Custom Range';
  };

  // Extracted dynamically loaded values
  const totalSpent = data.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const avgSpent = data.avgSpent.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const txCount = data.txCount;
  const catCount = data.catCount;
  
  // Income Vs Expense calculations
  const displayInc = data.income;
  const displayExp = data.expenses;
  const maxBar = Math.max(displayInc, displayExp);
  const incWidth = maxBar === 0 ? 0 : (displayInc / maxBar) * 100;
  const expWidth = maxBar === 0 ? 0 : (displayExp / maxBar) * 100;

  // Pie chart data
  const pieData = data.pieData;
  const totalPie = data.totalSpent;
  
  // Dynamic categories helpers
  const topCategories = data.topCategories;
  const getCatIcon = (name) => {
    const ln = name.toLowerCase();
    if(ln.includes('insur')) return { icon: 'shield-checkmark', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
    if(ln.includes('bill') || ln.includes('util')) return { icon: 'bulb', color: '#eab308', bg: 'rgba(250, 204, 21, 0.15)' };
    if(ln.includes('hous')) return { icon: 'home', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    if(ln.includes('edu')) return { icon: 'book', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)' };
    if(ln.includes('food') || ln.includes('din')) return { icon: 'fast-food', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' };
    return { icon: 'pricetag', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top || 40 }]}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.textWhite} />}
      >
        {/* HEADER */}
        <Text style={styles.header}>Analytics</Text>
        <Text style={styles.subtitle}>Your spending insights</Text>

        {/* TIME TOGGLE */}
        <View style={styles.segmentContainer}>
            {['Week', 'Month', 'Year'].map(tab => (
              <TouchableOpacity 
                key={tab}
                style={[styles.segmentBtn, activeTab === tab && styles.segmentActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={activeTab === tab ? styles.segmentTextActive : styles.segmentTextInactive}>{tab}</Text>
              </TouchableOpacity>
            ))}
        </View>

        {/* YEAR NAV */}
        <View style={styles.yearNav}>
          <TouchableOpacity onPress={handlePrev} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <Text style={styles.yearText}>{getDateDisplay()}</Text>
          <TouchableOpacity onPress={handleNext} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* 4 CARDS GRID */}
        <View style={styles.gridRow}>
          <View style={styles.gridCard}>
            <Ionicons name="trending-up" size={24} color={COLORS.accentGreen} style={styles.gridIcon} />
            <Text style={styles.gridAmount}>₹{totalSpent}</Text>
            <Text style={styles.gridLabel}>Total Spent</Text>
          </View>
          <View style={styles.gridCard}>
            <Ionicons name="trending-down" size={24} color={COLORS.accentRed} style={styles.gridIcon} />
            <Text style={styles.gridAmount}>₹{avgSpent}</Text>
            <Text style={styles.gridLabel}>Avg. Spending</Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <View style={styles.gridCard}>
            <Ionicons name="calendar-outline" size={24} color={COLORS.accentGreen} style={styles.gridIcon} />
            <Text style={styles.gridAmount}>{txCount}</Text>
            <Text style={styles.gridLabel}>Transactions</Text>
          </View>
          <View style={styles.gridCard}>
            <Ionicons name="options-outline" size={24} color="#818cf8" style={styles.gridIcon} />
            <Text style={styles.gridAmount}>{catCount}</Text>
            <Text style={styles.gridLabel}>Categories</Text>
          </View>
        </View>

        {/* INCOME VS EXPENSE */}
        <View style={styles.cardBlock}>
          <Text style={styles.cardHeader}>Income vs Expense</Text>
          
          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Income</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${incWidth}%`, backgroundColor: COLORS.accentGreen }]} />
            </View>
            <Text style={[styles.barAmount, { color: COLORS.accentGreen }]}>₹{displayInc.toLocaleString()}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={styles.barLabel}>Expense</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${expWidth}%`, backgroundColor: COLORS.accentRed }]} />
            </View>
            <Text style={[styles.barAmount, { color: COLORS.accentRed }]}>₹{displayExp.toLocaleString()}</Text>
          </View>

          <View style={styles.netRow}>
            <Text style={styles.barLabel}>Net</Text>
            <Text style={[styles.netAmount, { color: displayInc - displayExp >= 0 ? COLORS.accentGreen : COLORS.accentRed }]}>
              {displayInc - displayExp >= 0 ? '+' : '-'}₹{Math.abs(displayInc - displayExp).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* INSIGHTS */}
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.cardBlock}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={styles.insightIconBox}>
              <Ionicons name="trending-up" size={18} color={COLORS.accentRed} />
            </View>
            <Text style={styles.insightText}>You spent 100% more than the previous period</Text>
          </View>
        </View>

        {/* TOP SPENDING CATEGORIES */}
        <Text style={styles.sectionTitle}>Top Spending Categories</Text>
        
        {topCategories.length > 0 ? (
          <>
            <View style={styles.gridRow}>
              {topCategories.slice(0, 2).map((cat, i) => {
                const iconConf = getCatIcon(cat.name);
                return (
                  <View key={i} style={styles.catCard}>
                    <View style={[styles.catIconWrap, {backgroundColor: iconConf.bg}]}>
                      <Ionicons name={iconConf.icon} size={28} color={iconConf.color} />
                    </View>
                    <Text style={styles.catTitle}>{cat.name}</Text>
                    <Text style={styles.catAmount}>₹{cat.amount.toLocaleString(undefined, {maximumFractionDigits:0})}</Text>
                  </View>
                );
              })}
            </View>
            {topCategories.length > 2 && (
              <View style={styles.gridRow}>
                {topCategories.slice(2, 4).map((cat, i) => {
                  const iconConf = getCatIcon(cat.name);
                  return (
                    <View key={i} style={styles.catCard}>
                      <View style={[styles.catIconWrap, {backgroundColor: iconConf.bg}]}>
                        <Ionicons name={iconConf.icon} size={28} color={iconConf.color} />
                      </View>
                      <Text style={styles.catTitle}>{cat.name}</Text>
                      <Text style={styles.catAmount}>₹{cat.amount.toLocaleString(undefined, {maximumFractionDigits:0})}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginVertical: 20, color: COLORS.textMuted }}>No expenses recorded this period to analyze.</Text>
        )}

        {/* SPENDING TRENDS */}
        <Text style={styles.sectionTitle}>Spending Trends</Text>
        <Text style={styles.sectionSubtitle}>Monthly spending overview</Text>
        <View style={[styles.cardBlock, { padding: 0, paddingVertical: 20, paddingTop: 30 }]}>
          <LineChart
            data={{
              labels: ["Week 4", "Week 1", "Week 3", "Week 2"],
              datasets: [{ data: [11500, 25000, 102000, 79375] }]
            }}
            width={width - 50}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            withInnerLines={false}
            withOuterLines={false}
            chartConfig={{
              backgroundColor: COLORS.bgCard,
              backgroundGradientFrom: COLORS.bgCard,
              backgroundGradientTo: COLORS.bgCard,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.accentGreen, fill: COLORS.bgCard }
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        {/* CATEGORY BREAKDOWN */}
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <Text style={styles.sectionSubtitle}>Spending by category</Text>
        <View style={[styles.cardBlock, { paddingBottom: 30, alignItems: 'center' }]}>
          <PieChart
            data={pieData}
            width={width + 100}
            height={340}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"0"}
            hasLegend={false}
            center={[(width + 100) / 4 - 20, 0]}
            absolute
          />
          <View style={[styles.legendContainer, { width: '100%', marginTop: 24 }]}>
            {pieData.map((item, idx) => {
              const perc = ((item.amount / totalPie) * 100).toFixed(1);
              return (
                <View key={idx} style={styles.legendRow}>
                   <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                     <View style={[styles.legendDot, {backgroundColor: item.color}]} />
                     <Text style={styles.legendName}>{item.name}</Text>
                   </View>
                   <Text style={styles.legendValue}>₹{item.amount.toLocaleString()} ({perc}%)</Text>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgMain },
  header: { fontSize: 32, fontWeight: '800', color: COLORS.textWhite, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: 20 },
  
  segmentContainer: { flexDirection: 'row', backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  segmentActive: { backgroundColor: COLORS.accentGreen },
  segmentTextInactive: { color: COLORS.accentGreen, fontWeight: '600', fontSize: 15 },
  segmentTextActive: { color: '#ffffff', fontWeight: '700', fontSize: 15 }, // Keep explicitly white for contrast against green

  yearNav: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 16 },
  yearText: { color: COLORS.textWhite, fontSize: 16, fontWeight: '700' }, // More prominent dark color

  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 16 },
  gridCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  gridIcon: { marginBottom: 12 },
  gridAmount: { fontSize: 24, fontWeight: '800', color: COLORS.textWhite, marginBottom: 4 },
  gridLabel: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },

  cardBlock: { backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { fontSize: 18, color: COLORS.textWhite, fontWeight: '700', marginBottom: 16 },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  barLabel: { width: 60, color: COLORS.textWhite, fontSize: 14, fontWeight: '600' },
  barTrack: { flex: 1, height: 12, backgroundColor: '#f1f5f9', borderRadius: 6, marginHorizontal: 12, overflow: 'hidden' }, // Light track
  barFill: { height: '100%', borderRadius: 6 },
  barAmount: { width: 100, textAlign: 'right', fontSize: 13, fontWeight: '700' },

  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  netAmount: { fontSize: 16, fontWeight: '800', color: COLORS.accentGreen },

  sectionTitle: { fontSize: 20, color: COLORS.textWhite, fontWeight: '700', marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: COLORS.textMuted, marginBottom: 16 },

  insightIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(244, 63, 94, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  insightText: { flex: 1, color: COLORS.textWhite, fontSize: 14, fontWeight: '600', lineHeight: 20 },

  catCard: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  catIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catTitle: { fontSize: 15, color: COLORS.textWhite, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  catAmount: { fontSize: 15, color: COLORS.accentGreen, fontWeight: '700' },

  legendContainer: { marginTop: 16, paddingHorizontal: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingVertical: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 14 },
  legendName: { color: COLORS.textWhite, fontSize: 15, fontWeight: '600' },
  legendValue: { color: COLORS.textWhite, fontSize: 15, fontWeight: '800' }
});
