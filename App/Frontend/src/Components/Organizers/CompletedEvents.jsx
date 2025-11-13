import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import { Button } from '../../components/ui/button';
import { Star, Users, UserCheck, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const completedEventsData = [
  {
    id: 1,
    name: 'Summer Tech Conference',
    totalRegistrations: 450,
    totalAttendees: 398,
    rating: 4.5,
    enrolledStudents: [
      'Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Ethan Hunt',
      'Fiona Apple', 'George Lucas', 'Hannah Montana', 'Ian Malcolm', 'Jane Doe'
    ],
    attendedStudents: [
      'Alice Johnson', 'Bob Smith', 'Diana Prince', 'Ethan Hunt', 'George Lucas',
      'Hannah Montana', 'Ian Malcolm', 'Jane Doe'
    ],
    reviews: [
      { student: 'Alice Johnson', rating: 5, comment: 'Excellent event! Very well organized.' },
      { student: 'Bob Smith', rating: 4, comment: 'Great speakers, learned a lot.' },
      { student: 'Diana Prince', rating: 5, comment: 'Amazing experience, would attend again!' },
    ],
    ratingDistribution: [
      { rating: '5★', count: 180 },
      { rating: '4★', count: 120 },
      { rating: '3★', count: 60 },
      { rating: '2★', count: 25 },
      { rating: '1★', count: 13 },
    ]
  },
  {
    id: 2,
    name: 'Spring Music Festival',
    totalRegistrations: 680,
    totalAttendees: 645,
    rating: 4.8,
    enrolledStudents: [
      'Kevin Hart', 'Laura Croft', 'Mike Tyson', 'Nina Williams', 'Oscar Isaac'
    ],
    attendedStudents: [
      'Kevin Hart', 'Laura Croft', 'Mike Tyson', 'Nina Williams'
    ],
    reviews: [
      { student: 'Kevin Hart', rating: 5, comment: 'Best festival ever!' },
      { student: 'Laura Croft', rating: 5, comment: 'Great lineup and atmosphere.' },
    ],
    ratingDistribution: [
      { rating: '5★', count: 520 },
      { rating: '4★', count: 100 },
      { rating: '3★', count: 20 },
      { rating: '2★', count: 3 },
      { rating: '1★', count: 2 },
    ]
  },
  {
    id: 3,
    name: 'Entrepreneurship Workshop',
    totalRegistrations: 200,
    totalAttendees: 185,
    rating: 4.3,
    enrolledStudents: [
      'Paul Walker', 'Quinn Fabray', 'Rachel Green', 'Steve Rogers'
    ],
    attendedStudents: [
      'Paul Walker', 'Quinn Fabray', 'Steve Rogers'
    ],
    reviews: [
      { student: 'Paul Walker', rating: 4, comment: 'Very informative and practical.' },
      { student: 'Quinn Fabray', rating: 5, comment: 'Loved the networking session!' },
    ],
    ratingDistribution: [
      { rating: '5★', count: 85 },
      { rating: '4★', count: 70 },
      { rating: '3★', count: 25 },
      { rating: '2★', count: 3 },
      { rating: '1★', count: 2 },
    ]
  },
];

const COLORS = ['#2D3E7E', '#FDB913', '#FF9F1C', '#F24333', '#6B8CAE'];

export function CompletedEvents() {
  const handleExportSheet = (eventId) => {
    console.log('Export sheet for event:', eventId);
    // Implement CSV/Excel export logic for this event
  };

  return (
    <div className="space-y-4">
      {completedEventsData.map((event) => (
        <Card key={event.id} className="overflow-hidden">
          <Accordion type="single" collapsible>
            <AccordionItem value={`event-${event.id}`} className="border-0">
              <AccordionTrigger className="hover:no-underline px-6">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="text-left">
                    <h3 className="text-lg">{event.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="hidden sm:inline">{event.totalRegistrations} Registered</span>
                      <span className="sm:hidden">{event.totalRegistrations}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-accent" />
                      <span className="hidden sm:inline">{event.totalAttendees} Attended</span>
                      <span className="sm:hidden">{event.totalAttendees}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span>{event.rating}/5</span>
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportSheet(event.id);
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
                      Enrolled Students ({event.enrolledStudents.length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto">
                      <ul className="space-y-2 text-sm">
                        {event.enrolledStudents.map((student) => (
                          <li key={student} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            {student}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Attended Students */}
                  <div>
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <UserCheck className="w-4 h-4" />
                      Attended Students ({event.attendedStudents.length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto">
                      <ul className="space-y-2 text-sm">
                        {event.attendedStudents.map((student) => (
                          <li key={student} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                            {student}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Reviews */}
                  <div>
                    <h4 className="flex items-center gap-2 mb-3 text-gray-700">
                      <Star className="w-4 h-4" />
                      Reviews ({event.reviews.length})
                    </h4>
                    <div className="bg-muted rounded-lg p-4 max-h-48 overflow-y-auto space-y-3">
                      {event.reviews.map((review) => (
                        <div key={review.student} className="border-b border-border pb-2 last:border-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{review.student}</span>
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
                        <BarChart data={event.ratingDistribution}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="rating" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {event.ratingDistribution.map((entry, index) => (
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
      ))}
    </div>
  );
}