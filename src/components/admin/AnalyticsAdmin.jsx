import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, TrendingUp, BarChart3, PieChart, Target, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart as PieChartComponent, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800"
};

export default function AnalyticsAdmin() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await base44.functions.invoke('analyzeUserBehavior', {});
        setAnalysis(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900">Error loading analytics</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const CHART_COLORS = ["#4f46e5", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Total Interactions" value={analysis.total_interactions} icon={TrendingUp} />
        <MetricCard label="Unique Sessions" value={analysis.total_unique_sessions} icon={BarChart3} />
        <MetricCard label="Authenticated Users" value={analysis.total_authenticated_users} icon={Target} />
        <MetricCard label="Avg Time on Page" value={`${analysis.avg_time_on_page}s`} icon={TrendingUp} />
      </div>

      {/* Most Viewed & Engaged Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Viewed Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.most_viewed_content.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                  <Badge className="bg-indigo-100 text-indigo-800 border-0 shrink-0">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most Engaged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.most_engaged_content.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-0 shrink-0">Score: {item.engagement_score}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChartComponent>
                <Pie
                  data={analysis.category_distribution}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analysis.category_distribution.map((_, idx) => (
                    <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChartComponent>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Engagement (CTR %)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.category_engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="click_through_rate" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Trending Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trending Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.trending_tags}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="tag" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Format Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Format Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold">Format</th>
                  <th className="text-right py-2 px-3 font-semibold">Views</th>
                  <th className="text-right py-2 px-3 font-semibold">CTR %</th>
                  <th className="text-right py-2 px-3 font-semibold">Avg Time (s)</th>
                  <th className="text-right py-2 px-3 font-semibold">Shares</th>
                </tr>
              </thead>
              <tbody>
                {analysis.content_format_performance.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 font-medium">{item.type}</td>
                    <td className="text-right py-2 px-3">{item.views}</td>
                    <td className="text-right py-2 px-3">{item.click_through_rate}%</td>
                    <td className="text-right py-2 px-3">{item.avg_time}</td>
                    <td className="text-right py-2 px-3">{item.shares}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Search Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysis.popular_searches.slice(0, 8).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{item.query}</span>
                  <Badge className="bg-slate-100 text-slate-700 border-0">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Searches</p>
                <p className="text-3xl font-bold text-slate-900">{analysis.search_to_click_rate.total_searches}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Click-Through Rate</p>
                <p className="text-3xl font-bold text-indigo-600">{analysis.search_to_click_rate.click_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Clicks After Search</p>
                <p className="text-xl font-semibold text-slate-900">{analysis.search_to_click_rate.clicks_after_search}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI-Driven Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{rec.insight}</h4>
                    <p className="text-sm text-slate-600 mt-1">→ {rec.action}</p>
                  </div>
                  <Badge className={PRIORITY_COLORS[rec.priority]}>{rec.priority}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}