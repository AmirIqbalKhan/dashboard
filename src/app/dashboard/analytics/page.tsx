"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClipLoader } from "react-spinners";
import { useTheme } from "@/app/theme-context";
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/utils/roleAccess';

interface Activity {
  id: string;
  userId: string | null;
  type: string;
  page: string | null;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  url: string;
}

interface SiteAnalytics {
  id: string;
  siteId: string;
  date: string;
  pageViews: number;
  uniqueUsers: number;
  referrer: string;
}

interface EcommerceEvent {
  id: string;
  userId: string;
  type: string;
  amount: number;
  createdAt: string;
}

export default function AnalyticsDashboard() {
  const { data: session } = useSession();

  const canViewAnalytics = hasPermission(session, 'canViewAnalytics');

  if (!canViewAnalytics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  // User Activity Heatmap
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Site Analytics
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [siteAnalytics, setSiteAnalytics] = useState<SiteAnalytics[]>([]);
  const [siteLoading, setSiteLoading] = useState(false);

  // Ecommerce Analytics
  const [ecomSummary, setEcomSummary] = useState<any>(null);
  const [ecomEvents, setEcomEvents] = useState<EcommerceEvent[]>([]);
  const [ecomLoading, setEcomLoading] = useState(false);

  const { brandColor } = useTheme();
  const allLoading = loading || siteLoading || ecomLoading;

  useEffect(() => {
    fetch("/api/analytics/user-activity")
      .then((res) => res.json())
      .then((data) => {
        setActivities(data);
        setLoading(false);
      });
    fetch("/api/analytics/sites")
      .then((res) => res.json())
      .then((data) => {
        setSites(data);
        if (data.length > 0) setSelectedSite(data[0].id);
      });
    fetchEcommerce();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      setSiteLoading(true);
      fetch(`/api/analytics/site-analytics?siteId=${selectedSite}`)
        .then((res) => res.json())
        .then((data) => {
          setSiteAnalytics(data);
          setSiteLoading(false);
        });
    }
  }, [selectedSite]);

  function fetchEcommerce() {
    setEcomLoading(true);
    fetch("/api/analytics/ecommerce")
      .then((res) => res.json())
      .then((data) => {
        setEcomSummary(data.summary);
        setEcomEvents(data.events);
        setEcomLoading(false);
      });
  }

  // User Activity Heatmap logic
  const activityByDate: Record<string, number> = {};
  activities.forEach((a) => {
    const date = a.createdAt.slice(0, 10);
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });
  const days: string[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  if (allLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <ClipLoader color={brandColor} size={48} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="flex flex-col gap-8">
        {/* User Activity Section */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">User Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Page</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white/20 divide-y divide-gray-100">
                {activities.slice(0, 10).map((a) => (
                  <tr key={a.id} className="hover:bg-white/40 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{a.userId || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{a.page || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(a.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Site Analytics Section */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">Site Analytics</h2>
          <div className="mb-4">
            <label className="font-medium mr-2">Site:</label>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead className="bg-white/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Page Views</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Unique Users</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Referrer</th>
                </tr>
              </thead>
              <tbody className="bg-white/20 divide-y divide-gray-100">
                {siteAnalytics.slice(0, 10).map((s) => (
                  <tr key={s.id} className="hover:bg-white/40 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.pageViews}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.uniqueUsers}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.referrer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={siteAnalytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString()} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pageViews" stroke="#6366f1" name="Page Views" />
                <Line type="monotone" dataKey="uniqueUsers" stroke="#06b6d4" name="Unique Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Ecommerce Analytics Section */}
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">Ecommerce Analytics</h2>
          {ecomSummary && (
            <div className="mb-6 flex flex-wrap gap-8">
              <div className="bg-white/60 rounded-xl p-4 shadow text-center min-w-[160px]">
                <div className="text-2xl font-bold text-blue-700">${ecomSummary.totalRevenue?.toFixed(2) ?? '0.00'}</div>
                <div className="text-gray-700">Total Revenue</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 shadow text-center min-w-[160px]">
                <div className="text-2xl font-bold text-green-700">{ecomSummary.totalOrders ?? 0}</div>
                <div className="text-gray-700">Total Orders</div>
              </div>
              <div className="bg-white/60 rounded-xl p-4 shadow text-center min-w-[160px]">
                <div className="text-2xl font-bold text-indigo-700">{ecomSummary.totalUsers ?? 0}</div>
                <div className="text-gray-700">Total Customers</div>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/40">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">User ID</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white/20 divide-y divide-gray-100">
                {ecomEvents.slice(0, 10).map((e) => (
                  <tr key={e.id} className="hover:bg-white/40 transition-all duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{e.userId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{e.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${e.amount?.toFixed(2) ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(e.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 