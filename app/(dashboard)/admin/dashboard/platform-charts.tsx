"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformDashboardStats } from "@/lib/queries/dashboard";
import { formatKES } from "@/lib/format";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function RevenueByCompanyChart({ data }: { data: PlatformDashboardStats["byCompany"] }) {
  const chartData = data.map((c) => ({ name: c.name, revenue: c.revenue }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground/80">Revenue by Company</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => formatKES(Number(value))}
              contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function DonutChart({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const chartData = data.filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground/80">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-16 text-center">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-2">
          {data.map((d, i) => (
            <div key={d.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              {d.label} ({d.value})
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function VehicleStatusChart({ data }: { data: PlatformDashboardStats["vehicles"] }) {
  return (
    <DonutChart
      title="Vehicle Status"
      data={[
        { label: "Available", value: data.available },
        { label: "Rented", value: data.rented },
        { label: "Maintenance", value: data.maintenance },
      ]}
    />
  );
}

export function BookingStatusChart({ data }: { data: PlatformDashboardStats["bookings"] }) {
  return (
    <DonutChart
      title="Booking Status"
      data={[
        { label: "Pending", value: data.pending },
        { label: "Active", value: data.active },
        { label: "Completed", value: data.completed },
        { label: "Cancelled", value: data.cancelled },
      ]}
    />
  );
}
