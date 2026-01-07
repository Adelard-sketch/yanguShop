import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const p = payload[0];
  const dateIso = p.payload?.date;
  const dateLabel = dateIso ? new Date(dateIso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : p.name;
  return (
    <div className="rt-tooltip">
      <div className="rt-tooltip-label">{dateLabel}</div>
      <div className="rt-tooltip-value">{p.value} order{p.value !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default function OrdersTrend({ orders = [] }) {
  // Build a 7-day series (labels) ending today
  const data = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0,10);
      days.push({ key, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count: 0 });
    }
    orders.forEach(o => {
      const k = (new Date(o.createdAt)).toISOString().slice(0,10);
      const entry = days.find(d => d.key === k);
      if (entry) entry.count += 1;
    });
    return days.map(d => ({ name: d.label, orders: d.count, date: d.key }));
  }, [orders]);

  const total = data.reduce((s, d) => s + d.orders, 0);
  const first = data[0]?.orders || 0;
  const last = data[data.length - 1]?.orders || 0;
  let change = 0;
  if (first === 0) change = last === 0 ? 0 : 100;
  else change = Math.round(((last - first) / first) * 100);

  return (
    <div className="orders-trend">
      <div className="trend-header">
        <div>
          <h4>Orders (7d)</h4>
          <div className="trend-sub">Total orders: <strong>{total}</strong></div>
        </div>
        <div className={`trend-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? `▲ ${change}%` : `▼ ${Math.abs(change)}%`}
        </div>
      </div>

      <div className="trend-chart">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.06} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip/>} wrapperStyle={{ outline: 'none' }} />
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.28}/>
                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.06}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="orders"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ordersGradient)"
              isAnimationActive={true}
              animationDuration={800}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Line type="monotone" dataKey="orders" stroke="#312e81" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} animationDuration={900} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
