import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Button } from '../../Components/ui/button';
import { Clock, Edit, Upload } from 'lucide-react';

const draftedEventsData = [
  {
    id: 1,
    name: 'Winter Workshop Series',
    lastEdited: '2024-10-28',
  },
  {
    id: 2,
    name: 'Alumni Meetup',
    lastEdited: '2024-10-25',
  },
  {
    id: 3,
    name: 'Career Fair 2025',
    lastEdited: '2024-10-20',
  },
];

export function DraftedEvents() {
  const handleEdit = (eventId) => {
    console.log('Edit event:', eventId);
    // Navigate to edit event page
  };

  const handlePublish = (eventId) => {
    console.log('Publish event:', eventId);
    // Publish event logic
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {draftedEventsData.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{event.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>Last edited: {new Date(event.lastEdited).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>

            <div className="flex gap-2 mt-4">
              <Button 
                onClick={() => handleEdit(event.id)} 
                className="flex-1 gap-2"
                variant="outline"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button 
                onClick={() => handlePublish(event.id)} 
                className="flex-1 gap-2"
              >
                <Upload className="w-4 h-4" />
                Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}