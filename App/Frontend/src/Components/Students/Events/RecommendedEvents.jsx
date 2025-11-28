import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Eye } from 'lucide-react';
import { Button } from '../../../Components/ui/button';
import { Badge } from '../../../Components/ui/badge';
import { cn } from '../../../Components/ui/utils';
import { Skeleton } from '../../../Components/ui/skeleton';
import { getRecommendations, getContentBasedRecommendations } from '@/Store/ai.slice';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";

const EventCard = ({ event, index }) => {
  const navigate = useNavigate();
  const handleRegister = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div
      key={event.event?._id}
      className={cn(
        'bg-card rounded-xl border border-border overflow-hidden',
        'card-interact gpu-accelerate',
        'animate-fade-in-up',
        `stagger-${(index % 10) + 1}`
      )}
    >
      <div className="relative h-40 bg-muted overflow-hidden">
        <img
          src={event.event?.posterUrl}
          alt={event.event?.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-[var(--student-primary)] text-white shadow-lg dark:bg-[var(--student-primary)]">
            {event.event?.categoryTags?.[0] || 'General'}
          </Badge>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h4 className="text-foreground mb-1 line-clamp-1">{event.event?.title}</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" /><span>{new Date(event.event?.timeline?.[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" /><span>{event.event?.timeline?.[0]?.duration?.from}</span></div>
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--student-primary)] dark:text-[var(--student-secondary)]" /><span>{event.event?.venue || 'Online'}</span></div>
        </div>
        <Button onClick={() => handleRegister(event.event?._id)} className="w-full bg-[var(--student-primary)] text-white hover:bg-[var(--student-secondary)] dark:bg-[var(--student-primary)] dark:hover:bg-[var(--student-secondary)] btn-interact">
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </div>
    </div>
  );
};

export function RecommendedEvents() {
  const dispatch = useDispatch();
  const { recommendations: hybridEvents, contentBasedRecommendations, loading } = useSelector((state) => state.ai);
  const [activeTab, setActiveTab] = useState('hybrid');

  useEffect(() => {
    dispatch(getRecommendations());
    dispatch(getContentBasedRecommendations());
  }, [dispatch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-foreground">Recommended For You</h3>
          <p className="text-sm text-muted-foreground">
            Based on your interests and previous registrations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hybrid">For You (Hybrid)</TabsTrigger>
          <TabsTrigger value="content">Similar to Your Interests</TabsTrigger>
        </TabsList>
        <TabsContent value="hybrid">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-80 w-full" />)}
            </div>
          ) : hybridEvents.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border mt-4">
              <p className="text-muted-foreground text-sm">No hybrid recommendations available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {hybridEvents.map((event, index) => <EventCard key={event.event?._id || index} event={event} index={index} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="content">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-80 w-full" />)}
            </div>
          ) : contentBasedRecommendations.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border mt-4">
              <p className="text-muted-foreground text-sm">No content-based recommendations available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {contentBasedRecommendations.map((event, index) => <EventCard key={event.event?._id || index} event={event} index={index} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}