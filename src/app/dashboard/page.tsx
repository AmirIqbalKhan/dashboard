'use client';

import { useState, useEffect } from 'react';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  growthRate: number;
}

interface Activity {
  id: string;
  type: string;
  page: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Simulated data - replace with actual API calls
    setStats({
      totalUsers: 1234,
      totalOrders: 567,
      totalRevenue: 45678,
      growthRate: 12.5,
    });
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      setLoadingActivity(true);
      fetch(`/api/analytics/user-activity?email=${encodeURIComponent(session.user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          setActivities(Array.isArray(data) ? data : []);
          setLoadingActivity(false);
        })
        .catch(() => setLoadingActivity(false));
    }
  }, [session]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth Rate',
      value: `${stats.growthRate}%`,
      icon: TrendingUp,
      color: 'bg-yellow-500',
    },
  ];

  // Quick Actions handlers: navigate to pages
  function handleAction(action: string) {
    switch (action) {
      case 'Add New User':
        router.push('/dashboard/users');
        break;
      case 'View Reports':
        router.push('/dashboard/analytics');
        break;
      case 'Settings':
        router.push('/dashboard/settings');
        break;
      case 'Help':
        router.push('/dashboard/help');
        break;
      default:
        break;
    }
  }

  // Mock data for charts
  const userGrowthData = [
    {
      id: 'Users',
      color: 'hsl(205, 70%, 50%)',
      data: [
        { x: 'Jan', y: 200 },
        { x: 'Feb', y: 400 },
        { x: 'Mar', y: 600 },
        { x: 'Apr', y: 900 },
        { x: 'May', y: 1234 },
      ],
    },
  ];

  const ordersBarData = [
    { month: 'Jan', orders: 120 },
    { month: 'Feb', orders: 200 },
    { month: 'Mar', orders: 300 },
    { month: 'Apr', orders: 400 },
    { month: 'May', orders: 567 },
  ];

  const revenuePieData = [
    { id: 'Product A', label: 'Product A', value: 20000 },
    { id: 'Product B', label: 'Product B', value: 15000 },
    { id: 'Product C', label: 'Product C', value: 10678 },
  ];

  const recentUsers = [
    { id: 1, name: 'Alice', email: 'alice@example.com', joined: '2024-05-01' },
    { id: 2, name: 'Bob', email: 'bob@example.com', joined: '2024-05-03' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com', joined: '2024-05-05' },
  ];

  return (
    <div className="space-y-10">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center"
          >
            <div className={`${stat.color} p-3 rounded-lg mr-4`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm h-80 overflow-hidden p-0 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 p-6 pb-0">User Growth</h2>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveLine
              data={userGrowthData}
              margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
              axisBottom={{ legend: 'Month', legendOffset: 32, legendPosition: 'middle' }}
              axisLeft={{ legend: 'Users', legendOffset: -40, legendPosition: 'middle' }}
              colors={{ scheme: 'nivo' }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              enableArea={true}
              useMesh={true}
              theme={{
                axis: { ticks: { text: { fill: '#888' } }, legend: { text: { fill: '#555' } } },
                legends: { text: { fill: '#555' } },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm h-80 overflow-hidden p-0 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 p-6 pb-0">Orders Per Month</h2>
          <div className="flex-1 min-h-0 relative">
            <ResponsiveBar
              data={ordersBarData}
              keys={['orders']}
              indexBy="month"
              margin={{ top: 20, right: 20, bottom: 40, left: 50 }}
              padding={0.3}
              colors={{ scheme: 'category10' }}
              axisBottom={{ legend: 'Month', legendOffset: 32, legendPosition: 'middle' }}
              axisLeft={{ legend: 'Orders', legendOffset: -40, legendPosition: 'middle' }}
              theme={{
                axis: { ticks: { text: { fill: '#888' } }, legend: { text: { fill: '#555' } } },
                legends: { text: { fill: '#555' } },
              }}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm h-80 overflow-hidden p-0 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 p-6 pb-0">Revenue Breakdown</h2>
          <div className="flex-1 min-h-0 relative">
            <ResponsivePie
              data={revenuePieData}
              margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={5}
              colors={{ scheme: 'nivo' }}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#555"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#fff"
              theme={{
                legends: { text: { fill: '#555' } },
              }}
              legends={[
                {
                  anchor: 'bottom',
                  direction: 'row',
                  justify: false,
                  translateY: 36,
                  itemsSpacing: 10,
                  itemWidth: 80,
                  itemHeight: 18,
                  itemTextColor: '#555',
                  symbolSize: 18,
                  symbolShape: 'circle',
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {loadingActivity ? (
              <p className="text-gray-600">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="text-gray-600">No recent activity</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {activities.slice(0, 5).map((activity) => (
                  <li key={activity.id} className="py-2">
                    <span className="font-medium text-gray-800">{activity.type.replace(/_/g, ' ')}</span>
                    {activity.page && (
                      <span className="text-gray-500 ml-2">on <span className="font-mono">{activity.page}</span></span>
                    )}
                    <span className="block text-xs text-gray-400 mt-1">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="p-4 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors shadow border border-gray-200"
              onClick={() => handleAction('Add New User')}
            >
              <p className="font-medium text-gray-900">Add New User</p>
              <p className="text-sm text-gray-600">Create a new user account</p>
            </button>
            <button
              className="p-4 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors shadow border border-gray-200"
              onClick={() => handleAction('View Reports')}
            >
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Check system reports</p>
            </button>
            <button
              className="p-4 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors shadow border border-gray-200"
              onClick={() => handleAction('Settings')}
            >
              <p className="font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-600">Configure system settings</p>
            </button>
            <button
              className="p-4 bg-gray-50 rounded-lg hover:bg-blue-100 transition-colors shadow border border-gray-200"
              onClick={() => handleAction('Help')}
            >
              <p className="font-medium text-gray-900">Help</p>
              <p className="text-sm text-gray-600">Get support</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 