import React, { useState, useEffect, useMemo } from 'react';
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
import {
  PieChart,
} from 'react-native-chart-kit';
import { Target, Award, Zap, Trophy, Activity, ChartPie as PieChartIcon, ChevronDown, Filter } from 'lucide-react-native';
import { TrainingSession } from '@/types/session';
import { Technique } from '@/types/technique';
import { useData } from '@/contexts/DataContext';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 50; // Increased padding to prevent overflow

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
    stroke: '#5271ff',
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#e5e7eb',
    strokeWidth: 1,
  },
};

const calculateAnalyticsData = (sessions: TrainingSession[], techniques: Technique[], timeframe: 'all' | 'week' | 'month' | 'year' = 'all'): AnalyticsData => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Filter sessions based on timeframe
    let filteredSessions = sessions;
    let filteredTechniques = techniques;
    
    if (timeframe !== 'all') {
      let cutoffDate: Date;
      
      switch (timeframe) {
        case 'week':
          cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - 7);
          break;
        case 'month':
          cutoffDate = new Date();
          cutoffDate.setMonth(cutoffDate.getMonth() - 1);
          break;
        case 'year':
          cutoffDate = new Date();
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          break;
        default:
          cutoffDate = new Date(0); // Beginning of time
      }
      
      // Handle both Date objects and ISO strings
      filteredSessions = sessions.filter(s => {
        const sessionDate = s.date instanceof Date ? s.date : new Date(s.date);
        return sessionDate >= cutoffDate;
      });
      
      filteredTechniques = techniques.filter(t => {
        const techniqueDate = t.timestamp instanceof Date ? t.timestamp : new Date(t.timestamp);
        return techniqueDate >= cutoffDate;
      });
    }

    // Basic stats (now using filtered data)
    const totalSessions = filteredSessions.length;
    const totalTechniques = filteredTechniques.length;
    const averageSatisfaction = filteredSessions.length > 0 
      ? filteredSessions.reduce((sum, s) => sum + s.satisfaction, 0) / filteredSessions.length 
      : 0;
    const totalSubmissions = filteredSessions.reduce((sum, s) => {
      // Sum up the actual counts from submissionCounts, not just array length
      const sessionSubmissionTotal = Object.values(s.submissionCounts || {}).reduce((sessionSum, count) => sessionSum + (count as number), 0);
      
      // Fallback: if submissionCounts is empty but submissions array has data, count the array length
      // This handles legacy sessions that might not have proper submission counts
      const fallbackCount = sessionSubmissionTotal === 0 && s.submissions && s.submissions.length > 0 
        ? s.submissions.length 
        : 0;
      
      return sum + sessionSubmissionTotal + fallbackCount;
    }, 0);

    // This month stats (use filtered data if timeframe is month or less)
    const sessionsThisMonth = (timeframe === 'all' || timeframe === 'year') 
      ? sessions.filter(s => new Date(s.date) >= startOfMonth).length
      : filteredSessions.filter(s => new Date(s.date) >= startOfMonth).length;
    const techniquesThisMonth = (timeframe === 'all' || timeframe === 'year')
      ? techniques.filter(t => new Date(t.timestamp) >= startOfMonth).length
      : filteredTechniques.filter(t => new Date(t.timestamp) >= startOfMonth).length;

    // Submissions distribution (using filtered sessions)
    const submissionCount: Record<string, number> = {};
    filteredSessions.forEach(s => {
      // Use submissionCounts to get actual quantities, not just presence
      Object.entries(s.submissionCounts || {}).forEach(([submission, count]) => {
        submissionCount[submission] = (submissionCount[submission] || 0) + (count as number);
      });
    });
    const submissionDistribution = Object.entries(submissionCount)
      .sort(([, a], [, b]) => b - a) // Sort by count descending
      .slice(0, 5) // Take only top 5
      .map(([name, count], index) => ({
        name,
        count,
        color: [
          '#ef4444', '#f97316', '#eab308', '#5271ff', '#3b82f6', 
          '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'
        ][index % 10],
      }));

    // Session type distribution (using filtered sessions)
    const sessionTypeCount: Record<string, number> = {};
    filteredSessions.forEach(s => {
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

      const daySessions = filteredSessions.filter(s => new Date(s.date) >= dayStart && new Date(s.date) <= dayEnd).length;
      const dayTechniques = filteredTechniques.filter(t => new Date(t.timestamp) >= dayStart && new Date(t.timestamp) <= dayEnd).length;

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

      const monthSessions = filteredSessions.filter(s => new Date(s.date) >= monthStart && new Date(s.date) <= monthEnd).length;
      const monthTechniques = filteredTechniques.filter(t => new Date(t.timestamp) >= monthStart && new Date(t.timestamp) <= monthEnd).length;

      monthlyProgress.push({
        month: monthNames[date.getMonth()],
        sessions: monthSessions,
        techniques: monthTechniques,
      });
    }

    // Satisfaction trend (last 10 sessions from filtered data)
    const satisfactionTrend = filteredSessions
      .slice(0, 10)
      .reverse()
      .map((session, index) => ({
        date: `S${index + 1}`,
        satisfaction: session.satisfaction,
      }));

    // Streak calculation (using filtered sessions)
    const sortedSessions = [...filteredSessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    sortedSessions.forEach(session => {
      if (!lastDate) {
        currentStreak = 1;
        tempStreak = 1;
        lastDate = new Date(session.date);
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - new Date(session.date).getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 7) { // Within a week
          tempStreak++;
          if (currentStreak === tempStreak - 1) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
        lastDate = new Date(session.date);
      }
    });
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
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
    };
};

export default function Analytics() {
  const { sessions, techniques, isInitialLoading } = useData();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);

  // Memoize analytics calculation to prevent unnecessary recalculations
  const memoizedAnalyticsData = useMemo(() => {
    if (sessions.length > 0 || techniques.length > 0) {
      return calculateAnalyticsData(sessions, techniques, selectedTimeframe);
    }
    return null;
  }, [sessions, techniques, selectedTimeframe]);

  // Update analytics data and loaded state when memoized data changes
  useEffect(() => {
    if (memoizedAnalyticsData) {
      setAnalyticsData(memoizedAnalyticsData);
      setHasLoadedOnce(true);
    } else if (!isInitialLoading && hasLoadedOnce) {
      // Only set empty analytics if we're not loading and have loaded before
      setAnalyticsData(null);
    }
  }, [memoizedAnalyticsData, isInitialLoading, hasLoadedOnce]);

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    subtitle?: string,
    color: string = '#5271ff'
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
      legendFontSize: 10,
    }));

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <PieChartIcon size={20} color="#5271ff" />
          <Text style={styles.chartTitle}>{title}</Text>
        </View>
        <PieChart
          data={chartData}
          width={chartWidth - 20}
          height={140}
          chartConfig={{
            ...chartConfig,
            color: (opacity = 1) => `rgba(30, 58, 46, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
          center={[0, 0]}
          absolute
        />
      </View>
    );
  };

  // Only show loading state during initial data loading
  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={48} color="#9ca3af" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If we have loaded but don't have data, show empty state
  if (!analyticsData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Activity size={48} color="#9ca3af" />
          <Text style={styles.loadingText}>No session data found</Text>
          <Text style={styles.emptySubtext}>Start tracking your training sessions to see analytics</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        setShowTimeframeDropdown(false);
      }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Overview Stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.timeframeSelectorContainer}>
              <TouchableOpacity
                style={styles.timeframeDropdown}
                onPress={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
                activeOpacity={0.7}
              >
                <Filter size={16} color="#5271ff" />
                <Text style={styles.timeframeDropdownText}>
                  {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)}
                </Text>
                <ChevronDown size={16} color="#5271ff" />
              </TouchableOpacity>
              
              {showTimeframeDropdown && (
                <TouchableOpacity 
                  style={StyleSheet.absoluteFillObject} 
                  onPress={() => setShowTimeframeDropdown(false)}
                  activeOpacity={1}
                >
                  <View style={styles.timeframeDropdownMenu}>
                    {(['all', 'week', 'month', 'year'] as const).map((timeframe) => (
                      <TouchableOpacity
                        key={timeframe}
                        style={[
                          styles.timeframeDropdownItem,
                          selectedTimeframe === timeframe && styles.timeframeDropdownItemSelected
                        ]}
                        onPress={() => {
                          setSelectedTimeframe(timeframe);
                          setShowTimeframeDropdown(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.timeframeDropdownItemText,
                          selectedTimeframe === timeframe && styles.timeframeDropdownItemTextSelected
                        ]}>
                          {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.statsGrid}>
            {renderStatCard(
              <Trophy size={20} color="#f59e0b" />,
              'Total Sessions',
              analyticsData?.totalSessions ?? 0,
              undefined,
              '#f59e0b'
            )}
            {renderStatCard(
              <Award size={20} color="#ef4444" />,
              'Total Submissions',
              analyticsData?.totalSubmissions ?? 0,
              undefined,
              '#ef4444'
            )}
            {renderStatCard(
              <Zap size={20} color="#3b82f6" />,
              'Techniques Learned',
              analyticsData?.totalTechniques ?? 0,
              undefined,
              '#3b82f6'
            )}
            {renderStatCard(
              <Target size={20} color="#10b981" />,
              'Avg Satisfaction',
              analyticsData?.averageSatisfaction?.toFixed(1) ?? '0.0',
              'out of 5.0',
              '#10b981'
            )}
          </View>
        </View>


            {/* TODO: Add monthly progress chart */}
        {/* Monthly Progress Chart
        {analyticsData.monthlyProgress.some(d => d.sessions > 0 || d.techniques > 0) && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <TrendingUp size={20} color="#5271ff" />
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
              width={chartWidth - 10}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontSize: 10,
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
        {/* {analyticsData.satisfactionTrend.length > 0 && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <TrendingUp size={20} color="#5271ff" />
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
              width={chartWidth - 10}
              height={220}
              chartConfig={{
                ...chartConfig,
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        )} */}

        {/* Distribution Charts */}
        <View style={styles.distributionContainer}>
          {renderPieChart(analyticsData?.submissionDistribution ?? [], 'Submissions')}
          {renderPieChart(analyticsData?.sessionTypeDistribution ?? [], 'Session Types')}
        </View>

        {/* Streak Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Streaks</Text>
          <View style={styles.streakContainer}>
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Activity size={24} color="#10b981" />
              </View>
              <Text style={styles.streakValue}>{analyticsData?.streakData?.current ?? 0}</Text>
              <Text style={styles.streakLabel}>Current Streak</Text>
            </View>
            <View style={styles.streakCard}>
              <View style={styles.streakIcon}>
                <Trophy size={24} color="#f59e0b" />
              </View>
              <Text style={styles.streakValue}>{analyticsData?.streakData?.longest ?? 0}</Text>
              <Text style={styles.streakLabel}>Longest Streak</Text>
            </View>
          </View>
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
  timeframeSelectorContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  timeframeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    minWidth: 80,
  },
  timeframeDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5271ff',
  },
  timeframeDropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
    minWidth: 100,
  },
  timeframeDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeframeDropdownItemSelected: {
    backgroundColor: '#f0f9ff',
  },
  timeframeDropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timeframeDropdownItemTextSelected: {
    color: '#5271ff',
    fontWeight: '600',
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
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
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
    marginTop: 16,
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
    height: 100,
  },
});