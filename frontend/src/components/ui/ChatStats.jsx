import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#667eea', '#10b981', '#ff7a3d', '#64748b'];

export default function ChatStats({ chats = [] }) {
  // Compute counts: messages by sender type across provided chats
  const data = useMemo(() => {
    let customer = 0;
    let support = 0;
    let other = 0;

    chats.forEach(chat => {
      (chat.messages || []).forEach(m => {
        const s = (m.sender || '').toLowerCase();
        if (s === 'user' || s === 'customer' || s === 'client') customer += 1;
        else if (s === 'agent' || s === 'support' || s === 'staff') support += 1;
        else other += 1;
      });
    });

    const res = [
      { name: 'Customers', value: customer },
      { name: 'Support', value: support },
    ];
    if (other > 0) res.push({ name: 'Other', value: other });
    // ensure non-zero values for nicer visuals
    return res.map(d => ({ ...d, value: d.value || 0 }));
  }, [chats]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chat-stats">
      <div className="chat-stats-header">
        <h4>Conversation Breakdown</h4>
        <small>{total} messages</small>
      </div>
      <div className="chat-stats-chart" aria-hidden={total === 0}>
        {total === 0 ? (
          <div className="empty-stats">No messages yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={36}
                outerRadius={64}
                paddingAngle={3}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Messages']} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" height={30} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
