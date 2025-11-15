import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, Star, Calendar } from 'lucide-react';
import {
  fetchDashboardStats,
  fetchEventWiseRatings,
  fetchAttendanceRatio,
  fetchEventPerformance,
} from '../../store/analytics.slice';

export function AnalyticsTab() {
  const dispatch = useDispatch();
  const { 
    stats = { totalEvents: 0, totalRegistrations: 0, avgAttendance: 0, avgRating: 0 }, 
    eventRatings = [], 
    attendanceRatio = [], 
    eventPerformance = [], 
    status 
  } = useSelector(state => state.analytics) || {};

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchEventWiseRatings());
    dispatch(fetchAttendanceRatio());
    dispatch(fetchEventPerformance());
  }, [dispatch]);

  if (status === 'loading') {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50 animate-pulse" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="animate-fade-in-up stagger-1 hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 icon-interact" />
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-primary">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground mt-1">+3 from last month</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-2 hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4 icon-interact" />
              Total Registrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-secondary">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% increase</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-3 hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 icon-interact" />
              Avg Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-accent">{stats.avgAttendance}%</div>
            <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up stagger-4 hover:translate-y-[-2px] hover:scale-[1.01] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Star className="w-4 h-4 icon-interact" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-[var(--success)]">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Ratings Chart */}
        <Card className="animate-fade-in-up stagger-5">
          <CardHeader>
            <CardTitle>Event-wise Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventRatings}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="rating" fill="#2D3E7E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Attendance Ratio Chart */}
        <Card className="animate-fade-in-up stagger-6">
          <CardHeader>
            <CardTitle>Attendance Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={attendanceRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="registered" stroke="#FDB913" strokeWidth={2} />
                <Line type="monotone" dataKey="attended" stroke="#2D3E7E" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Performance Overview */}
        <Card className="lg:col-span-2 animate-fade-in-up stagger-6">
          <CardHeader>
            <CardTitle>Event Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={eventPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {eventPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}