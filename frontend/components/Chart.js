import React from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width - 40;

export const ExpensePieChart = ({ data }) => {
  const chartConfig = {
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  };

  return (
    <View style={styles.container}>
      {data && data.length > 0 ? (
        <PieChart
          data={data}
          width={screenWidth}
          height={200}
          chartConfig={chartConfig}
          accessor={"amount"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      ) : (
        <Text style={styles.noData}>No expense data to chart</Text>
      )}
    </View>
  );
};

export const MonthlyTrendChart = ({ data, labels }) => {
  return (
    <View style={styles.container}>
      <LineChart
        data={{
          labels: labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              data: data || [20, 45, 28, 80, 99, 43]
            }
          ]
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: { borderRadius: 16 },
          propsForDots: { r: "6", strokeWidth: "2", stroke: "#ffa726" }
        }}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    color: '#888',
    padding: 20,
    textAlign: 'center'
  }
});
