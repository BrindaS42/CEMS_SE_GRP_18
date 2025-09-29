import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  Lock, 
  Crown, 
  Calendar, 
  Users,
  Settings,
  MoreVertical
} from 'lucide-react';
import { setRightPanelOpen } from '../store/slices/uiSlice';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export default function Inbox() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { 
    currentEvents = [], 
    upcomingEvents = [], 
    publishedEvents = [], 
    draftEvents = [] 
  } = useSelector((state: RootState) => state.events);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Combine all events for inbox view with fallback arrays
  const allEvents = [
    ...(currentEvents || []).map(e => ({ ...e, eventType: 'current' })),
    ...(upcomingEvents || []).map(e => ({ ...e, eventType: 'upcoming' })),
    ...(publishedEvents || []).map(e => ({ 
      ...e, 
      eventType: 'published',
      attendees: e.registrations,
      location: 'Various',
      image: 'https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Published event'
    })),
    ...(draftEvents || []).map(e => ({ 
      ...e, 
      eventType: 'draft',
      date: e.lastModified,
      location: 'Draft',
      attendees: 0,
      role: 'Leader' as const,
      status: 'draft' as const,
      image: 'https://images.unsplash.com/photo-1613687969216-40c7b718c025?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwdW5pdmVyc2l0eSUyMGV2ZW50fGVufDF8fHx8MTc1ODg2NTk4N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: `Draft event - ${e.progress}% complete`
    }))
  ];

  // Filter events based on search and filters
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && ['current', 'upcoming', 'published'].includes(event.eventType)) ||
                         (statusFilter === 'draft' && event.eventType === 'draft');
    const matchesType = typeFilter === 'all' || event.eventType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const canEdit = (event: any) => {
    return event.role === 'Leader' || event.role === 'Editor' || event.eventType === 'draft';
  };

  const handleEditEvent = (event: any) => {
    if (canEdit(event)) {
      dispatch(setRightPanelOpen(true));
      navigate('/admin');
    }
  };

  const getEventStatusBadge = (event: any) => {
    switch (event.eventType) {
      case 'current':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Live</Badge>;
      case 'upcoming':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>;
      case 'published':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Published</Badge>;
      case 'draft':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string | undefined) => {
    if (!role) return null;
    
    const roleConfig = {
      Leader: { icon: Crown, color: 'bg-college-yellow text-college-blue' },
      Editor: { icon: Edit3, color: 'bg-college-blue text-white' },
      Viewer: { icon: Eye, color: 'bg-gray-100 text-gray-700' }
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    if (!config) return null;

    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {role}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-college-blue mb-2">Inbox</h1>
        <p className="text-muted-foreground">Manage your events and edit access</p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-college-blue">
            <Settings className="h-5 w-5" />
            Event Management
          </CardTitle>
          <CardDescription>
            Events you can edit are marked with your role. Only Leaders can edit published events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="published">Published Events</SelectItem>
                <SelectItem value="draft">Draft Events</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="current">Current Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Events</SelectItem>
                <SelectItem value="published">Published Events</SelectItem>
                <SelectItem value="draft">Draft Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-muted-foreground mb-2">No events found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={`${event.eventType}-${event.id}`} className="relative hover:shadow-md transition-shadow border-college-blue/20">
              {/* Triangular design elements */}
              <div className="absolute -top-1 -right-1 w-0 h-0 border-l-[20px] border-l-transparent border-b-[20px] border-b-college-yellow/30"></div>
              <div className="absolute top-2 right-4 w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-college-red/40"></div>
              
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-college-blue">{event.title}</h3>
                      {getEventStatusBadge(event)}
                      {getRoleBadge(event.role)}
                      {!canEdit(event) && (
                        <Badge variant="outline" className="border-gray-400 text-gray-600">
                          <Lock className="h-3 w-3 mr-1" />
                          View Only
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} attendees</span>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span> {event.location}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    
                    {event.eventType === 'draft' && 'progress' in event && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{event.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-college-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${event.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {canEdit(event) ? (
                      <Button
                        onClick={() => handleEditEvent(event)}
                        className="bg-college-blue hover:bg-college-blue/90 text-white"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-college-blue text-college-blue hover:bg-college-blue/10"
                        disabled
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Only
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {canEdit(event) && (
                          <>
                            <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Quick Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="h-4 w-4 mr-2" />
                              Manage Registrations
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Help Text */}
      <Card className="mt-8 bg-college-blue/5 border-college-blue/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-b-[12px] border-b-college-blue/60 mt-2"></div>
            <div>
              <h4 className="font-medium text-college-blue mb-2">Understanding Event Access</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Leader:</strong> Full edit access to all aspects of the event</p>
                <p><strong>Editor:</strong> Can edit event details but cannot delete or change core settings</p>
                <p><strong>Viewer:</strong> Can only view event details and registrations</p>
                <p><strong>Lock Icon:</strong> Indicates you have view-only access to this event</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}