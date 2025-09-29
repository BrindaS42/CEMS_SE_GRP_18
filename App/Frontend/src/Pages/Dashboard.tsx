import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { EventCard } from '../components/EventCard';
import { Analytics } from '../components/Analytics';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { BarChart3, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { currentEvents, upcomingEvents } = useSelector((state: RootState) => state.events);
  const { sidebarOpen, rightPanelOpen } = useSelector((state: RootState) => state.ui);
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-college-blue mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage events and view analytics</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-college-blue/10 border border-college-blue/20">
          <TabsTrigger value="events" className="data-[state=active]:bg-college-blue data-[state=active]:text-white">
            <Calendar className="h-4 w-4 mr-2" />
            Events Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-college-blue data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Current Events Section */}
          <div className="relative">
            {/* Triangular design elements on the section */}
            <div className="absolute -top-2 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-b-[30px] border-b-college-yellow opacity-30"></div>
            <div className="absolute top-4 right-8 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-college-red opacity-40"></div>
            
            <h2 className="text-xl font-semibold mb-4 text-college-blue flex items-center gap-2">
              Current Events
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-college-yellow opacity-60"></div>
            </h2>
            <div className={`grid gap-6 ${
              sidebarOpen 
                ? 'grid-cols-1' 
                : rightPanelOpen
                ? 'grid-cols-2'
                : 'grid-cols-2'
            }`}>
              {currentEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="relative">
            {/* Triangular design elements on the section */}
            <div className="absolute -top-2 -left-2 w-0 h-0 border-r-[25px] border-r-transparent border-b-[25px] border-b-college-blue opacity-30"></div>
            <div className="absolute top-6 left-6 w-0 h-0 border-r-[15px] border-r-transparent border-b-[15px] border-b-college-yellow opacity-50"></div>
            
            <h2 className="text-xl font-semibold mb-4 text-college-blue flex items-center gap-2">
              Upcoming Events
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-college-red opacity-60"></div>
            </h2>
            <div className={`grid gap-6 ${
              sidebarOpen 
                ? 'grid-cols-1' 
                : rightPanelOpen
                ? 'grid-cols-1 lg:grid-cols-2'
                : 'grid-cols-2 lg:grid-cols-3'
            }`}>
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}