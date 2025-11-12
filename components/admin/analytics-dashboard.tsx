'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  UserCheck, 
  Activity, 
  BarChart3,
  Calendar,
  CheckCircle2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  onboardingCompletionRate: number;
  matchableUsers: number;
  totalGroups: number;
  totalMatches: number;
  matchesThisWeek: number;
  matchesLastWeek: number;
  totalNotifications: number;
  notificationReadRate: number;
  averageResponseTime: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const userGrowth = data.newUsersThisWeek - data.newUsersLastWeek;
  const userGrowthPercent = data.newUsersLastWeek > 0 
    ? ((userGrowth / data.newUsersLastWeek) * 100).toFixed(1)
    : '0';

  const matchGrowth = data.matchesThisWeek - data.matchesLastWeek;
  const matchGrowthPercent = data.matchesLastWeek > 0
    ? ((matchGrowth / data.matchesLastWeek) * 100).toFixed(1)
    : '0';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalUsers)}</div>
            <div className="flex items-center gap-2 mt-2">
              {userGrowth >= 0 ? (
                <>
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">
                    +{userGrowthPercent}% from last week
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">
                    {userGrowthPercent}% from last week
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.newUsersThisWeek} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.activeUsers)}</div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Completion Rate</span>
                <span className="text-xs font-medium">{data.onboardingCompletionRate}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${data.onboardingCompletionRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.totalMatches)}</div>
            <div className="flex items-center gap-2 mt-2">
              {matchGrowth >= 0 ? (
                <>
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">
                    +{matchGrowthPercent}% from last week
                  </span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-3 w-3 text-red-500" />
                  <span className="text-xs text-red-500">
                    {matchGrowthPercent}% from last week
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.matchesThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notification Read Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.notificationReadRate}%</div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Total Sent</span>
                <span className="text-xs font-medium">{formatNumber(data.totalNotifications)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.notificationReadRate}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>User Analytics</CardTitle>
            <CardDescription>User engagement and activity metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Total Users</p>
                  <p className="text-sm text-muted-foreground">All registered users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.totalUsers)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Active Users</p>
                  <p className="text-sm text-muted-foreground">Completed onboarding</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.activeUsers)}</p>
                <Badge variant="outline" className="mt-1">
                  {data.onboardingCompletionRate}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Matchable Users</p>
                  <p className="text-sm text-muted-foreground">Ready for matching</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.matchableUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matching Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Analytics</CardTitle>
            <CardDescription>Group formation and matching metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Total Matches</p>
                  <p className="text-sm text-muted-foreground">All-time matches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.totalMatches)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Active Groups</p>
                  <p className="text-sm text-muted-foreground">Currently active</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.totalGroups)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">This Week</p>
                  <p className="text-sm text-muted-foreground">New matches</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatNumber(data.matchesThisWeek)}</p>
                {matchGrowth >= 0 ? (
                  <Badge variant="outline" className="mt-1 text-green-500">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +{matchGrowthPercent}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="mt-1 text-red-500">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {matchGrowthPercent}%
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Onboarding Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.onboardingCompletionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.activeUsers} of {data.totalUsers} users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notification Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.notificationReadRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(data.totalNotifications)} total sent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.averageResponseTime}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Average response time
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

