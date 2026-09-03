// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as dashboardApi from '../api/dashboard';

function StatCard({ label, value, tone }) {
  const toneClass = {
    default: 'text-ink',
    due: 'text-due',
    booked: 'text-booked',
    complete: 'text-complete',
  }[tone || 'default'];

  return (
    <div className="rounded border border-border bg-surface p-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi
      .getDashboard()
      .then(setData)
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard…</p>;
  if (error) return <p role="alert" className="rounded border border-due bg-due-bg px-3 py-2 text-xs text-due">{error}</p>;
  if (!data) return null;

  const { headline, weeklyChart } = data;

  return (
    <div>
      <h1 className="mb-5 text-xl font-semibold">Dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total vehicles" value={headline.totalVehicles} />
        <StatCard label="Due" value={headline.dueCount} tone="due" />
        <StatCard label="Booked" value={headline.bookedCount} tone="booked" />
        <StatCard label="In service" value={headline.inServiceCount} tone="booked" />
        <StatCard label="Completed this month" value={headline.completedThisMonth} tone="complete" />
        <StatCard label="Overdue" value={headline.overdueCount} tone="due" />
      </div>

      <section aria-labelledby="chart-heading" className="rounded border border-border bg-surface p-5">
        <h2 id="chart-heading" className="mb-4 text-base font-semibold">
          Completed services — last 8 weeks
        </h2>

        {/* Visually-hidden data table as an accessible alternative to the chart,
            since screen readers can't meaningfully parse an SVG line chart. */}
        <table className="sr-only">
          <caption>Completed services per week</caption>
          <thead>
            <tr><th scope="col">Week of</th><th scope="col">Completed</th></tr>
          </thead>
          <tbody>
            {weeklyChart.map((w) => (
              <tr key={w.weekLabel}><td>{w.weekLabel}</td><td>{w.count}</td></tr>
            ))}
          </tbody>
        </table>

        <div aria-hidden="true" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyChart} accessibilityLayer={false}>
              <CartesianGrid stroke="#DEDAD1" strokeDasharray="3 3" />
              <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3D5A6C" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}