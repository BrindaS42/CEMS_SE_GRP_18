// Analytics.jsx
import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const eventData = [
  { name: 'Jan', events: 4, attendees: 240 },
  { name: 'Feb', events: 6, attendees: 420 },
  { name: 'Mar', events: 8, attendees: 680 },
  { name: 'Apr', events: 5, attendees: 350 },
  { name: 'May', events: 7, attendees: 590 },
  { name: 'Jun', events: 9, attendees: 750 }
];

const eventTypeData = [
  { name: 'Technical', value: 35, color: '#1e40af' },
  { name: 'Cultural', value: 25, color: '#fbbf24' },
  { name: 'Sports', value: 20, color: '#ef4444' },
  { name: 'Academic', value: 20, color: '#10b981' }
];

const attendanceData = [
  { month: 'Jan', attendance: 85 },
  { month: 'Feb', attendance: 92 },
  { month: 'Mar', attendance: 78 },
  { month: 'Apr', attendance: 88 },
  { month: 'May', attendance: 95 },
  { month: 'Jun', attendance: 82 }
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-college-blue">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events & Attendees Bar Chart */}
        <div className="bg-white p-6 rounded-lg border border-college-blue/20 shadow-sm">
          <h3 className="text-lg font-medium text-college-blue mb-4">Monthly Events & Attendees</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="events" fill="#1e40af" name="Events" />
              <Bar dataKey="attendees" fill="#fbbf24" name="Attendees" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types Pie Chart */}
        <div className="bg-white p-6 rounded-lg border border-college-blue/20 shadow-sm">
          <h3 className="text-lg font-medium text-college-blue mb-4">Event Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {eventTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Rate Line Chart */}
        <div className="bg-white p-6 rounded-lg border border-college-blue/20 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-college-blue mb-4">Event Attendance Rate (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-college-blue to-college-blue/80 text-white p-6 rounded-lg">
          <div className="text-2xl font-bold">47</div>
          <div className="text-sm opacity-90">Total Events</div>
        </div>
        <div className="bg-gradient-to-r from-college-yellow to-college-yellow/80 text-college-blue p-6 rounded-lg">
          <div className="text-2xl font-bold">3,245</div>
          <div className="text-sm opacity-80">Total Attendees</div>
        </div>
        <div className="bg-gradient-to-r from-college-red to-college-red/80 text-white p-6 rounded-lg">
          <div className="text-2xl font-bold">87%</div>
          <div className="text-sm opacity-90">Avg Attendance</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="text-2xl font-bold">12</div>
          <div className="text-sm opacity-90">Active Events</div>
        </div>
      </div>
    </div>
  );
}