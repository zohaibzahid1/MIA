'use client';
import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/context/storeContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorAlert } from '@/components/shared/ErrorAlert';
import {
  LogIn,
  ArrowRight,
  Users,
  ScanLine,
  Activity,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const SCAN_TYPE_COLORS: Record<string, string> = {
  xray: 'hsl(var(--chart-1))',
  ct: 'hsl(var(--chart-2))',
  mri: 'hsl(var(--chart-3))',
  XRAY: 'hsl(var(--chart-1))',
  CT: 'hsl(var(--chart-2))',
  MRI: 'hsl(var(--chart-3))',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(var(--chart-4))',
  uploading: 'hsl(var(--chart-5))',
  uploaded: 'hsl(var(--chart-1))',
  processing: 'hsl(var(--chart-2))',
  processed: 'hsl(var(--chart-3))',
  failed: 'hsl(var(--destructive))',
  PENDING: 'hsl(var(--chart-4))',
  UPLOADING: 'hsl(var(--chart-5))',
  UPLOADED: 'hsl(var(--chart-1))',
  PROCESSING: 'hsl(var(--chart-2))',
  PROCESSED: 'hsl(var(--chart-3))',
  FAILED: 'hsl(var(--destructive))',
};

const DashboardPage: React.FC = () => {
  const { userStore, analyticsStore } = useStore();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Wait for initial authentication check to complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load analytics when user is available
  useEffect(() => {
    if (isInitialized && userStore.user) {
      analyticsStore.loadAnalytics();
    }
  }, [isInitialized, userStore.user, analyticsStore]);

  const handleLoginRedirect = () => {
    router.push('/auth');
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-auto px-8">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent"></div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                  Loading Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Please wait while we set up your dashboard...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated after initialization, show login prompt
  if (!userStore.user) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-md w-full mx-auto px-8">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">
                  Authentication Required
                </h1>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Please sign in to access your Medical Image Analysis dashboard
                </p>
              </div>
              <Button
                onClick={handleLoginRedirect}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Redirecting you to the authentication page
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const scanTypeData = analyticsStore.scanTypeDistribution.map((item) => ({
    name: item.scanType.toUpperCase(),
    value: item.count,
    fill: SCAN_TYPE_COLORS[item.scanType] || 'hsl(var(--chart-1))',
  }));

  const statusData = analyticsStore.statusBreakdown.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
    value: item.count,
    fill: STATUS_COLORS[item.status] || 'hsl(var(--chart-1))',
  }));

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={`transform transition-all duration-700 ease-out ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 dark:text-white tracking-tight">
            {getCurrentTime()}, {userStore.user?.name || 'User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-light">
            {getFormattedDate()}
          </p>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────── */}
      {analyticsStore.error && (
        <ErrorAlert
          error={analyticsStore.error}
          onDismiss={() => analyticsStore.clearError()}
        />
      )}

      {/* ── Stats Cards ────────────────────────────────────── */}
      <div
        className={`grid gap-4 md:grid-cols-2 lg:grid-cols-3 transform transition-all duration-700 ease-out delay-100 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Total Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsStore.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{analyticsStore.totalPatients}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Registered patients
            </p>
          </CardContent>
        </Card>

        {/* Total Scans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
            <ScanLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsStore.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{analyticsStore.totalScans}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Across all patients
            </p>
          </CardContent>
        </Card>

        {/* Avg Scans Per Patient */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Scans / Patient</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsStore.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">
                {analyticsStore.averageScansPerPatient.toFixed(1)}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Average per patient
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ─────────────────────────────────────────── */}
      <div
        className={`grid gap-4 md:grid-cols-2 transform transition-all duration-700 ease-out delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        {/* Scan Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scan Type Distribution</CardTitle>
            <CardDescription>Breakdown by scan modality</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsStore.isLoading ? (
              <div className="flex items-center justify-center h-[250px]">
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              </div>
            ) : scanTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No scan data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={scanTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {scanTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Breakdown</CardTitle>
            <CardDescription>Scan processing status overview</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsStore.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : statusData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
                No status data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Status Indicator ───────────────────────────────── */}
      <div
        className={`transform transition-all duration-700 ease-out delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              System Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(DashboardPage);
