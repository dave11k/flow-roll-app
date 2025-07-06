import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { TrendingUp, Target, Award, Zap, Trophy, Activity, ChartBar as BarChart3, ChartPie as PieChartIcon } from 'lucide-react-native';
import { TrainingSession } from '@/types/session';
import { Technique } from '@/types/technique';
import { getSessions, getTechniques } from '@/services/storage';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

// Suppress chart-kit web warnings in development
if (Platform.OS === 'web' && __DEV__) {
  const originalError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('Invalid DOM property') ||
       message.includes('Unknown event handler property') ||
       message.includes('transform-origin') ||
       message.includes('onResponderTerminate'))
    ) {
      return; // Suppress these specific warnings
    }
    originalError.apply(console, args);
  };
}

interface AnalyticsData {
  totalSessions: number;
  totalTechniques: number;
  averageSatisfaction: number;
  totalSubmissions: number;
  sessionsThisMonth: number;
  techniquesThisMonth: number;
  submissionDistribution: { name: string; count: number; color: string }[];
  sessionTypeDistribution: { name: string; count: number; color: string }[];
  weeklyActivity: { day: string; sessions: number; techniques: number }[];
  monthlyProgress: { month: string; sessions: number; techniques: number }[];
  satisfactionTrend: { date: string; satisfaction: number }[];
  streakData: { current: number; longest: number };
}


const SESSION_TYPE_COLORS = {
  'gi': '#1e40af',
  'nogi': '#dc2626',
  'open-mat': '#059669',
  'wrestling': '#7c3aed',
};

const chartConfig = {
  backgroundColor: '#ffffff',
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(30, 58, 46, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: '#1e3a2e',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e5e7eb',
    strokeWidth: 1,
  },
};

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [sessionsData, techniquesData] = await Promise.all([
        getSessions(),
        getTechniques()
      ]);
      calculateAnalytics(sessionsData, techniquesData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const calculateAnalytics = (sessions: TrainingSession[], techniques: Technique[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Basic stats
    const totalSessions = sessions.length;
    const totalTechniques = techniques.length;
    const averageSatisfaction = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.satisfaction, 0) / sessions.length 
      : 0;
    const totalSubmissions = sessions.reduce((sum, s) => sum + s.submissions.length, 0);

    // This month stats
    const sessionsThisMonth = sessions.filter(s => s.date >= startOfMonth).length;
    const techniquesThisMonth = techniques.filter(t => t.timestamp >= startOfMonth).length;

    // Submissions distribution
    const submissionCount: Record<string, number> = {};
    sessions.forEach(s => {
      s.submissions.forEach(submission => {
        submissionCount[submission] = (submissionCount[submission] || 0) + 1;
      });
    });
    const submissionDistribution = Object.entries(submissionCount).map(([name, count], index) => ({
      name,
      count,
      color: [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
        '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'
      ][index % 10],
    }));

    // Session type distribution
    const sessionTypeCount: Record<string, number> = {};
    sessions.forEach(s => {
      const typeName = s.type === 'gi' ? 'Gi' : 
                      s.type === 'nogi' ? 'No-Gi' :
                      s.type === 'open-mat' ? 'Open Mat' : 'Wrestling';
      sessionTypeCount[typeName] = (sessionTypeCount[typeName] || 0) + 1;
    });
    const sessionTypeDistribution = Object.entries(sessionTypeCount).map(([name, count]) => ({
      name,
      count,
      color: SESSION_TYPE_COLORS[name.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof SESSION_TYPE_COLORS] || '#6b7280',
    }));

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(s => s.date >= dayStart && s.date <= dayEnd).length;
      const dayTechniques = techniques.filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd).length;

      weeklyActivity.push({
        day: dayNames[date.getDay()],
        sessions: daySessions,
        techniques: dayTechniques,
      });
    }

    // Monthly progress (last 6 months)
    const monthlyProgress = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthSessions = sessions.filter(s => s.date >= monthStart && s.date <= monthEnd).length;
      const monthTechniques = techniques.filter(t => t.timestamp >= monthStart && t.timestamp <= monthEnd).length;

      monthlyProgress.push({
        month: monthNames[date.getMonth()],
        sessions: monthSessions,
        techniques: monthTechniques,
      });
    }

    // Satisfaction trend (last 10 sessions)
    const satisfactionTrend = sessions
      .slice(0, 10)
      .reverse()
      .map((session, index) => ({
        date: `S${index + 1}`,
        satisfaction: session.satisfaction,
      }));

    // Streak calculation
    const sortedSessions = [...sessions].sort((a, b) => b.date.getTime() - a.date.getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedSessions.forEach(session => {
      if (!lastDate) {
        currentStreak = 1;
        tempStreak = 1;
        lastDate = session.date;
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - session.date.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Within a week
          tempStreak++;
          if (currentStreak === tempStreak - 1) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = session.date;
      }
    });
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    setAnalyticsData({
      totalSessions,
      totalTechniques,
      averageSatisfaction,
      totalSubmissions,
      sessionsThisMonth,
      techniquesThisMonth,
      submissionDistribution,
      sessionTypeDistribution,
      weeklyActivity,
      monthlyProgress,
      satisfactionTrend,
      streakData: { current: currentStreak, longest: longestStreak },
    });
  };

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    subtitle?: string,
    color: string = '#1e3a2e'
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
          {icon}
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderPieChart = (data: { name: string; count: number; color: string }[], title: string) => {
    if (data.length === 0) return null;

    const chartData = data.map((item, index) => ({
      name: item.name,
      population: item.count,
      color: item.color,
      legendFontColor: '#6b7280',
      legendFontSize: 12,
    }));

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <PieChartIcon size={20} color="#1e3a2e" />
          <Text style={styles.chartTitle}>{title}</Text>
        </View>
        <PieChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 0]}
          absolute
        />
      </View>
    );
  };

  if (isLoading || !analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Activity size={48} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <View style={styles.timeframeSelector}>
          {(['week', 'month', 'year'] as const).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && styles.timeframeButtonActive
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeButtonText,
                selectedTimeframe === timeframe && styles.timeframeButtonTextActive
              ]}>
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              <Trophy size={20} color="#f59e0b" />,
              'Total Sessions',
              analyticsData.totalSessions,
              `${analyticsData.sessionsThisMonth} this month`,
              '#f59e0b'
            )}
            {renderStatCard(
              <Zap size={20} color="#3b82f6" />,
              'Techniques Learned',
              analyticsData.totalTechniques,
              `${analyticsData.techniquesThisMonth} this month`,
              '#3b82f6'
            )}
            {renderStatCard(
              <Target size={20} color="#10b981" />,
              'Avg Satisfaction',
              analyticsData.averageSatisfaction.toFixed(1),
              'out of 5.0',
              '#10b981'
            )}
            {renderStatCard(
              <Award size={20} color="#ef4444" />,
              'Total Submissions',
              analyticsData.totalSubmissions,
              'across all sessions',
              '#ef4444'
            )}
          </View>
        </View>

        {/* Streak Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Streaks</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Activity size={24} color="#10b981" />
              </View>
              <Text style={styles.streakValue}>{analyticsData.streakData.current}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Trophy size={24} color="#f59e0b" />
              </View>
              <Text style={styles.streakValue}>{analyticsData.streakData.longest}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        {analyticsData.weeklyActivity.some(d => d.sessions > 0 || d.techniques > 0) && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <BarChart3 size={20} color="#1e3a2e" />
              <Text style={styles.chartTitle}>Weekly Activity</Text>
            </View>
            <BarChart
              data={{
                labels: analyticsData.weeklyActivity.map(d => d.day),
                datasets: [
                  {
                    data: analyticsData.weeklyActivity.map(d => d.sessions),
                    color: (opacity = 1) => `rgba(30, 58, 46, ${opacity})`,
                  }
                ],
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel=""
              yAxisSuffix=""
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        {/* Monthly Progress Chart */}
        {analyticsData.monthlyProgress.some(d => d.sessions > 0 || d.techniques > 0) && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <TrendingUp size={20} color="#1e3a2e" />
              <Text style={styles.chartTitle}>Monthly Progress</Text>
            </View>
            <LineChart
              data={{
                labels: analyticsData.monthlyProgress.map(d => d.month),
                datasets: [
                  {
                    data: analyticsData.monthlyProgress.map(d => d.sessions),
                    color: (opacity = 1) => `rgba(30, 58, 46, ${opacity})`,
                    strokeWidth: 3,
                  },
                  {
                    data: analyticsData.monthlyProgress.map(d => d.techniques),
                    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                    strokeWidth: 3,
                  }
                ],
                legend: ['Sessions', 'Techniques']
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        {/* Satisfaction Trend */}
        {analyticsData.satisfactionTrend.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <TrendingUp size={20} color="#1e3a2e" />
              <Text style={styles.chartTitle}>Satisfaction Trend</Text>
            </View>
            <LineChart
              data={{
                labels: analyticsData.satisfactionTrend.map(d => d.date),
                datasets: [{
                  data: analyticsData.satisfactionTrend.map(d => d.satisfaction),
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 3,
                }],
              }}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )}

        {/* Distribution Charts */}
        <View style={styles.distributionContainer}>
          {renderPieChart(analyticsData.submissionDistribution, 'Submissions')}
          {renderPieChart(analyticsData.sessionTypeDistribution, 'Session Types')}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#1e3a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a3d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  timeframeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeframeButtonActive: {
    backgroundColor: '#fff',
  },
  timeframeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  timeframeButtonTextActive: {
    color: '#1e3a2e',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  streakContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  streakCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  streakIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  distributionContainer: {
    gap: 0,
  },
  bottomSpacing: {
    height: 20,
  },
});