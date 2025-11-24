import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/Components/ui/accordion';
import { Star, Users, UserCheck, TrendingUp, Download, FileText, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PropTypes from 'prop-types';
import { ViewLogModal } from './Dashboard/ViewLogModal';
import { ViewAttendanceModal } from './Dashboard/ViewAttendanceModal';
import { ViewReviewModal } from './Dashboard/ViewReviewModal';

const COLORS = ['#2D3E7E', '#FDB913', '#FF9F1C', '#F24333', '#6B8CAE'];

export function CompletedEvents({ events = [] }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleExportSheet = (eventId) => {
    console.log('Export sheet for event:', eventId);
    // Implement CSV/Excel export logic for this event
  };

  const getRatingDistribution = (ratings = []) => {
    const distribution = [
      { rating: '5★', count: 0 },
      { rating: '4★', count: 0 },
      { rating: '3★', count: 0 },
      { rating: '2★', count: 0 },
      { rating: '1★', count: 0 },
    ];
    ratings.forEach(r => {
      const star = 5 - Math.floor(r.rating);
      if (distribution[star]) {
        distribution[star].count++;
      }
    });
    return distribution;
  };

  return (
    <div className="space-y-4">
      {/* Modals */}
      {events.map((event) => {
        const ratingDistribution = getRatingDistribution(event.ratings);
        return (
        <Card key={event._id} className="overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value={`event-${event._id}`} className="border-0">
              <AccordionTrigger className="hover:no-underline px-6">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="text-lg">{event.title}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                        <span className="hidden sm:inline">{event.registrations?.length || 0} Registered</span>
                        <span className="sm:hidden">{event.registrations?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-accent" />
                        <span className="hidden sm:inline">{event.registrations?.filter(r => r.checkIns?.some(c => c.status === 'present')).length || 0} Attended</span>
                        <span className="sm:hidden">{event.registrations?.filter(r => r.checkIns?.some(c => c.status === 'present')).length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span>{event.ratings?.length > 0 ? (event.ratings.reduce((acc, r) => acc + r.rating, 0) / event.ratings.length).toFixed(1) : 'N/A'}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setLogModalOpen(true); }}>
                        <FileText className="w-4 h-4 mr-2" /> View Logs
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setAttendanceModalOpen(true); }}>
                        <UserCheck className="w-4 h-4 mr-2" /> Attendees
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setReviewModalOpen(true); }}>
                        <Eye className="w-4 h-4 mr-2" /> View Reviews
                      </Button>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 justify-center">
                  {/* Ratings Chart */}
                  <div className="md:col-span-2">
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <TrendingUp className="w-4 h-4" />
                      Ratings Distribution
                    </h4>
                    <div className="bg-muted rounded-lg p-4">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={ratingDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {ratingDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      );
    })}

    <ViewLogModal 
      open={logModalOpen}
      onClose={() => setLogModalOpen(false)}
      event={selectedEvent}
    />
    <ViewAttendanceModal 
      open={attendanceModalOpen}
      onClose={() => setAttendanceModalOpen(false)}
      event={selectedEvent}
    />
    <ViewReviewModal
      open={reviewModalOpen}
      onClose={() => setReviewModalOpen(false)}
      event={selectedEvent}
    />
    </div>
  );
}

CompletedEvents.propTypes = {
  events: PropTypes.array,
};