// src/pages/dashboard/index.tsx
import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import {
  BarChart,
  Users,
  Zap,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Activity,
  DollarSign,
  Clock,
  RefreshCcw,
} from "lucide-react";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatPercentage } from "@/lib/utils";

// Types
interface StatsCard {
  id: string;
  title: string;
  value: number;
  change: number;
  icon: React.ElementType;
  trend: "up" | "down";
  color: string;
}

interface Activity {
  id: string;
  text: string;
  time: string;
  icon: React.ElementType;
  type: "info" | "success" | "warning" | "error";
}

interface ChartData {
  name: string;
  value: number;
  previousValue: number;
}

// Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

// Mock data
const statsCards: StatsCard[] = [
  {
    id: "total-users",
    title: "Total Users",
    value: 124892,
    change: 12.3,
    icon: Users,
    trend: "up",
    color: "blue",
  },
  {
    id: "active-campaigns",
    title: "Active Campaigns",
    value: 38,
    change: 2.4,
    icon: Zap,
    trend: "up",
    color: "purple",
  },
  {
    id: "engagement",
    title: "Engagement Rate",
    value: 24.8,
    change: -1.2,
    icon: BarChart,
    trend: "down",
    color: "green",
  },
  {
    id: "conversion",
    title: "Conversion Rate",
    value: 3.2,
    change: 0.8,
    icon: TrendingUp,
    trend: "up",
    color: "orange",
  },
];

const recentActivities: Activity[] = [
  {
    id: "1",
    text: "New campaign created",
    time: "5m ago",
    icon: Activity,
    type: "success",
  },
  {
    id: "2",
    text: "Revenue milestone reached",
    time: "2h ago",
    icon: DollarSign,
    type: "info",
  },
  {
    id: "3",
    text: "Monthly report generated",
    time: "4h ago",
    icon: Clock,
    type: "info",
  },
];

const chartData: ChartData[] = [
  { name: "Mon", value: 4000, previousValue: 3000 },
  { name: "Tue", value: 3000, previousValue: 2800 },
  { name: "Wed", value: 2000, previousValue: 2200 },
  { name: "Thu", value: 2780, previousValue: 2500 },
  { name: "Fri", value: 1890, previousValue: 2100 },
  { name: "Sat", value: 2390, previousValue: 2300 },
  { name: "Sun", value: 3490, previousValue: 3200 },
];

const StatsCard = React.memo(({ card }: { card: StatsCard }) => (
  <Card
    className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
    hoverable
  >
    <div className="flex items-start justify-between mb-6">
      <div
        className={`p-3 rounded-lg bg-${card.color}-500/10 text-${card.color}-500`}
      >
        <card.icon size={24} />
      </div>
      <span
        className={`text-base font-medium flex items-center gap-1 ${
          card.trend === "up" ? "text-green-500" : "text-red-500"
        }`}
      >
        {card.trend === "up" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        {formatPercentage(card.change)}
      </span>
    </div>
    <h3 className="text-gray-600 dark:text-gray-400 text-base mb-2">
      {card.title}
    </h3>
    <p className="text-3xl font-bold">{formatNumber(card.value)}</p>
  </Card>
));

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get("/dashboard"),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-12 flex items-center justify-between"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-gray-900 dark:text-white text-4xl font-bold mb-3">
            {greeting}, {user?.firstName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Here's what's happening with your accounts today.
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => refetch()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Refresh dashboard"
        >
          <RefreshCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
      >
        {statsCards.map((card) => (
          <motion.div key={card.id} variants={itemVariants}>
            <Card
              className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
              hoverable
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`p-3 rounded-lg bg-${card.color}-500/10 text-${card.color}-500`}
                >
                  <card.icon size={24} />
                </div>
                <span
                  className={`text-base font-medium flex items-center gap-1 ${
                    card.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {card.trend === "up" ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  {formatPercentage(card.change)}
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-base mb-2">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(card.value)}
              </p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Activity Overview
              </h2>
              <select className="bg-transparent border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 text-gray-900 dark:text-white">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            {/* Chart remains same */}
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
              Recent Updates
            </h2>
            <div className="space-y-6">
              <AnimatePresence>
                {recentActivities.map(
                  ({ id, text, time, icon: Icon, type }) => (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          type === "success"
                            ? "bg-green-500/10 text-green-500"
                            : type === "warning"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : type === "error"
                                ? "bg-red-500/10 text-red-500"
                                : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {text}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {time}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
