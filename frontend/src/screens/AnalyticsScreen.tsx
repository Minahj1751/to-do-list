import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { analyticsApi } from '../api/analyticsApi';
import {
  DashboardStats,
  DailyStats,
  CategoryStats,
} from '../types';
import { Ionicons } from '@expo/vector-icons';

const AnalyticsScreen: React.FC = () => {
  const [dashboardStats, setDashboardStats] =
    useState<DashboardStats | null>(null);

  const [dailyStats, setDailyStats] =
    useState<DailyStats[]>([]);

  const [categoryStats, setCategoryStats] =
    useState<CategoryStats[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [stats, daily, categories] = await Promise.all([
        analyticsApi.getDashboard(),
        analyticsApi.getDailyStats(7),
        analyticsApi.getCategoryStats(),
      ]);

      setDashboardStats(stats);
      setDailyStats(daily);
      setCategoryStats(categories);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="stats-chart"
            size={28}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.loadingTitle}>
          Loading analytics...
        </Text>

        <Text style={styles.loadingSubtitle}>
          Preparing your productivity insights
        </Text>
      </View>
    );
  }

  const completionRate =
    dashboardStats?.completionRate ?? 0;

  const totalTasks =
    dashboardStats?.totalTasks ?? 0;

  const completedTasks =
    dashboardStats?.completedTasks ?? 0;

  const pendingTasks =
    dashboardStats?.pendingTasks ?? 0;

  const overdueTasks =
    dashboardStats?.overdueTasks ?? 0;

  const streak =
    dashboardStats?.streak ?? 0;

  const maxCompleted = Math.max(
    ...dailyStats.map((item) => item.completed),
    1
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>
              PRODUCTIVITY INSIGHTS
            </Text>

            <Text style={styles.headerTitle}>
              Analytics
            </Text>

            <Text style={styles.headerSubtitle}>
              Understand your progress and build better habits.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="analytics-outline"
              size={24}
              color="#6C63FF"
            />
          </View>
        </View>

        {/* Overview Hero */}
        {dashboardStats && (
          <View style={styles.overviewCard}>
            <View style={styles.overviewTop}>
              <View>
                <Text style={styles.overviewLabel}>
                  OVERALL COMPLETION
                </Text>

                <Text style={styles.overviewTitle}>
                  {completionRate}%
                </Text>

                <Text style={styles.overviewSubtitle}>
                  Keep pushing forward 🚀
                </Text>
              </View>

              <View style={styles.rateCircle}>
                <Ionicons
                  name="checkmark"
                  size={28}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.overviewProgressTrack}>
              <View
                style={[
                  styles.overviewProgressFill,
                  {
                    width: `${Math.min(
                      Math.max(completionRate, 0),
                      100
                    )}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.overviewFooter}>
              <View style={styles.overviewFooterItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#4CD7A5"
                />

                <Text style={styles.overviewFooterText}>
                  {completedTasks} completed
                </Text>
              </View>

              <View style={styles.overviewFooterItem}>
                <Ionicons
                  name="flame"
                  size={16}
                  color="#FFB547"
                />

                <Text style={styles.overviewFooterText}>
                  {streak} day streak
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Stats */}
        <Text style={styles.sectionTitle}>
          Overview
        </Text>

        <View style={styles.statsGrid}>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: '#EEECFF' },
              ]}
            >
              <Ionicons
                name="list-outline"
                size={21}
                color="#6C63FF"
              />
            </View>

            <Text style={styles.statValue}>
              {totalTasks}
            </Text>

            <Text style={styles.statLabel}>
              Total Tasks
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: '#EAFBF5' },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={21}
                color="#4CD7A5"
              />
            </View>

            <Text style={styles.statValue}>
              {completedTasks}
            </Text>

            <Text style={styles.statLabel}>
              Completed
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: '#FFF6E5' },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={21}
                color="#FFB547"
              />
            </View>

            <Text style={styles.statValue}>
              {pendingTasks}
            </Text>

            <Text style={styles.statLabel}>
              Pending
            </Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: '#FFECEF' },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={21}
                color="#FF5C7A"
              />
            </View>

            <Text style={styles.statValue}>
              {overdueTasks}
            </Text>

            <Text style={styles.statLabel}>
              Overdue
            </Text>
          </View>

        </View>

        {/* Daily Activity */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Daily Activity
              </Text>

              <Text style={styles.cardSubtitle}>
                Your last 7 days
              </Text>
            </View>

            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="bar-chart-outline"
                size={19}
                color="#6C63FF"
              />
            </View>
          </View>

          {dailyStats.length === 0 ? (
            <View style={styles.noData}>
              <Ionicons
                name="bar-chart-outline"
                size={30}
                color="#B0B5C4"
              />

              <Text style={styles.noDataText}>
                No activity data yet
              </Text>
            </View>
          ) : (
            <View style={styles.chartContainer}>
              {dailyStats.map((stat) => {
                const percentage =
                  (stat.completed / maxCompleted) * 100;

                return (
                  <View
                    key={stat.date}
                    style={styles.chartItem}
                  >
                    <Text style={styles.chartCount}>
                      {stat.completed}
                    </Text>

                    <View style={styles.chartBarArea}>
                      <View
                        style={[
                          styles.chartBar,
                          {
                            height: `${Math.max(
                              percentage,
                              5
                            )}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.chartDay}>
                      {new Date(
                        stat.date
                      ).toLocaleDateString('en-US', {
                        weekday: 'short',
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Category Performance */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>
                Category Performance
              </Text>

              <Text style={styles.cardSubtitle}>
                See where you're most productive
              </Text>
            </View>

            <View style={styles.cardHeaderIcon}>
              <Ionicons
                name="layers-outline"
                size={19}
                color="#6C63FF"
              />
            </View>
          </View>

          {categoryStats.length === 0 ? (
            <View style={styles.noData}>
              <Ionicons
                name="layers-outline"
                size={30}
                color="#B0B5C4"
              />

              <Text style={styles.noDataText}>
                No category data yet
              </Text>
            </View>
          ) : (
            <View>
              {categoryStats.map((cat, index) => (
                <View
                  key={cat.categoryId}
                  style={[
                    styles.categoryRow,
                    index === categoryStats.length - 1 &&
                      styles.lastCategoryRow,
                  ]}
                >
                  <View style={styles.categoryLeft}>
                    <View style={styles.categoryIconBox}>
                      <Text style={styles.categoryIcon}>
                        {cat.icon || '📌'}
                      </Text>
                    </View>

                    <View style={styles.categoryInfo}>
                      <Text
                        numberOfLines={1}
                        style={styles.categoryName}
                      >
                        {cat.categoryName}
                      </Text>

                      <Text style={styles.categoryDetail}>
                        {cat.completed} of {cat.total} completed
                      </Text>
                    </View>
                  </View>

                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryRate}>
                      {cat.completionRate}%
                    </Text>

                    <View style={styles.categoryProgressTrack}>
                      <View
                        style={[
                          styles.categoryProgressFill,
                          {
                            width: `${Math.min(
                              Math.max(
                                cat.completionRate,
                                0
                              ),
                              100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Productivity Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="bulb-outline"
              size={23}
              color="#FFB547"
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Productivity Tip
            </Text>

            <Text style={styles.tipText}>
              Focus on completing your most important tasks
              first. Small consistent progress adds up.
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },

  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  /* Loading */

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#171A2B',
  },

  loadingSubtitle: {
    fontSize: 14,
    color: '#8B92A8',
    marginTop: 6,
    textAlign: 'center',
  },

  /* Header */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerEyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6C63FF',
    letterSpacing: 1.3,
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#171A2B',
    letterSpacing: -0.6,
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#8B92A8',
    marginTop: 5,
    maxWidth: 270,
    lineHeight: 18,
  },

  headerIcon: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: '#EEECFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Overview */

  overviewCard: {
    backgroundColor: '#1C1F3A',
    borderRadius: 26,
    padding: 22,
    marginBottom: 27,

    shadowColor: '#1C1F3A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },

  overviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  overviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#969CB9',
    letterSpacing: 1.2,
  },

  overviewTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
    letterSpacing: -1,
  },

  overviewSubtitle: {
    fontSize: 12,
    color: '#AEB3CE',
    marginTop: 2,
  },

  rateCircle: {
    width: 67,
    height: 67,
    borderRadius: 34,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overviewProgressTrack: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#303451',
    overflow: 'hidden',
    marginTop: 22,
  },

  overviewProgressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#6C63FF',
  },

  overviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 17,
  },

  overviewFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  overviewFooterText: {
    color: '#AEB3CE',
    fontSize: 11,
    fontWeight: '600',
  },

  /* Section */

  sectionTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#171A2B',
    marginBottom: 13,
  },

  /* Stats */

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  statCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 16,
    marginBottom: 12,

    shadowColor: '#171A2B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,
    elevation: 2,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#171A2B',
    marginTop: 13,
  },

  statLabel: {
    fontSize: 11,
    color: '#8B92A8',
    fontWeight: '600',
    marginTop: 3,
  },

  /* Cards */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 19,
    marginBottom: 16,

    shadowColor: '#171A2B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#171A2B',
  },

  cardSubtitle: {
    fontSize: 11,
    color: '#8B92A8',
    marginTop: 3,
  },

  cardHeaderIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: '#EEECFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Chart */

  chartContainer: {
    height: 185,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 12,
  },

  chartItem: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  chartCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 5,
  },

  chartBarArea: {
    width: 25,
    height: 125,
    backgroundColor: '#F0F0F6',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  chartBar: {
    width: '100%',
    minHeight: 6,
    backgroundColor: '#6C63FF',
    borderRadius: 10,
  },

  chartDay: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8B92A8',
    marginTop: 8,
  },

  /* Category */

  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  lastCategoryRow: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },

  categoryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F4F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  categoryIcon: {
    fontSize: 19,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#25283A',
  },

  categoryDetail: {
    fontSize: 10,
    color: '#9297A8',
    marginTop: 3,
  },

  categoryRight: {
    width: 78,
    alignItems: 'flex-end',
  },

  categoryRate: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6C63FF',
    marginBottom: 5,
  },

  categoryProgressTrack: {
    width: 70,
    height: 5,
    borderRadius: 10,
    backgroundColor: '#EDEEF3',
    overflow: 'hidden',
  },

  categoryProgressFill: {
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#6C63FF',
  },

  /* No Data */

  noData: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  noDataText: {
    fontSize: 12,
    color: '#9BA0B1',
    marginTop: 8,
  },

  /* Tip */

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9EC',
    borderRadius: 20,
    padding: 17,
    marginTop: 2,
  },

  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF0C9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#3A3527',
  },

  tipText: {
    fontSize: 11,
    lineHeight: 17,
    color: '#8B8065',
    marginTop: 3,
  },

  bottomSpace: {
    height: 35,
  },
});

export default AnalyticsScreen;

