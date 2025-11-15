import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Star, Users, UserCheck, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PropTypes from 'prop-types';

const COLORS = ['#2D3E7E', '#FDB913', '#FF9F1C', '#F24333', '#6B8CAE'];

export function CompletedEvents({ events = [] }) {
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
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSheet(event._id);
                      }} 
                      className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-md hover:bg-muted hover:text-foreground dark:hover:bg-[var(--muted-hover)] cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span className="hidden sm:inline">Export</span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* Enrolled Students */}
                  <div>
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <Users className="w-4 h-4" />
                      Enrolled Students ({(event.registrations || []).length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto">
                      <ul className="space-y-2 text-sm">
                        {(event.registrations || []).slice(0, 10).map((reg) => (
                          <li key={reg._id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {reg.studentId?.profile?.name || 'Unknown Student'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Attended Students */}
                  <div>
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <UserCheck className="w-4 h-4" />
                      Attended Students ({(event.registrations || []).filter(r => r.checkIns?.some(c => c.status === 'present')).length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto">
                      <ul className="space-y-2 text-sm">
                        {(event.registrations || []).filter(r => r.checkIns?.some(c => c.status === 'present')).slice(0, 10).map((reg) => (
                          <li key={reg._id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            {reg.studentId?.profile?.name || 'Unknown Student'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div>
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <Star className="w-4 h-4" />
                      Reviews ({(event.ratings || []).length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                      {(event.ratings || []).slice(0, 5).map((review) => (
                        <div key={review._id} className="border-b border-border pb-2 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{review.by?.profile?.name || 'Anonymous'}</span>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-secondary fill-secondary" />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ratings Chart */}
                  <div>
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
    </div>
  );
}

CompletedEvents.propTypes = {
  events: PropTypes.array,
};