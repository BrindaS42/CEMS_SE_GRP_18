import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, X, CheckCircle, XCircle, Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon, MapPin, Clock, Users, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { Switch } from '../../../components/ui/switch';
import { Calendar } from '../../../components/ui/calendar';

// Mock data for teams where user is leader
const MOCK_LEADER_TEAMS = [
  {
    id: 4,
    name: 'Digital Pioneers',
    leader: 'John Doe',
    leaderEmail: 'john@college.edu',
    members: [
      { name: 'John Doe', email: 'john@college.edu', role: 'Leader' },
      { name: 'Chris Garcia', email: 'chris@college.edu', role: 'Member' },
      { name: 'Rachel Green', email: 'rachel@college.edu', role: 'Member' },
      { name: 'Kevin White', email: 'kevin@college.edu', role: 'Member' },
      { name: 'Amy Chen', email: 'amy@college.edu', role: 'Member' },
      { name: 'Sam Murphy', email: 'sam@college.edu', role: 'Member' },
    ],
  },
];

// Mock drafted/created events for sub-events
const MOCK_AVAILABLE_EVENTS = [
  { id: 100, title: 'AI Workshop', description: 'Machine Learning basics', teamName: 'Tech Innovators' },
  { id: 101, title: 'Web Dev Bootcamp', description: 'Full-stack development', teamName: 'Code Masters' },
  { id: 102, title: 'Hackathon Prep', description: '24-hour coding challenge prep', teamName: 'Dev Squad' },
  { id: 103, title: 'UI/UX Design Sprint', description: 'Design thinking workshop', teamName: 'Design Gurus' },
];

// Mock organisers database
const MOCK_ORGANISERS = [
  { name: 'Alice Cooper', email: 'alice@college.edu' },
  { name: 'Bob Wilson', email: 'bob@college.edu' },
  { name: 'Jane Smith', email: 'jane@college.edu' },
  { name: 'Frank Johnson', email: 'frank@college.edu' },
  { name: 'Grace Kim', email: 'grace@college.edu' },
  { name: 'Henry Davis', email: 'henry@college.edu' },
];

// Category options
const CATEGORY_OPTIONS = [
  'Tech',
  'Cultural',
  'Sports',
  'Management',
  'Workshop',
  'Hackathon',
  'Gaming',
  'Social',
];

// Mock function to check title availability
const checkTitleAvailability = async (title) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const existingTitles = ['Cultural Night', 'Sports Day'];
  return !existingTitles.includes(title);
};

// Helper function to refactor nested ternary
const getCategoryButtonText = (categories) => {
  if (categories.length === 0) {
    return 'Select categories';
  }
  if (categories.length === 1) {
    return '1 category selected';
  }
  return `${categories.length} categories selected`;
};

export function CreateEventModal({ open, onClose, onSave, currentUserEmail }) {
  // Form state
  const [title, setTitle] = useState('');
  const [titleStatus, setTitleStatus] = useState('idle');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [selectedPOC, setSelectedPOC] = useState('');
  const [pocContact, setPocContact] = useState('');
  const [rulebookFile, setRulebookFile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [eventDate, setEventDate] = useState(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venue, setVenue] = useState('');
  const [checkInRequired, setCheckInRequired] = useState(true);
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  
  // UI state
  const [teamSelectOpen, setTeamSelectOpen] = useState(false);
  const [pocSelectOpen, setPocSelectOpen] = useState(false);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subEventSearchOpen, setSubEventSearchOpen] = useState(false);
  const [subEventSearch, setSubEventSearch] = useState('');
  const [volunteerSearchOpen, setVolunteerSearchOpen] = useState(false);
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setTitleStatus('idle');
      setDescription('');
      setSelectedTeam(null);
      setPosterPreview(null);
      setSelectedPOC('');
      setPocContact('');
      setRulebookFile(null);
      setSelectedCategories([]);
      setGallery([]);
      setEventDate(undefined);
      setStartTime('');
      setEndTime('');
      setVenue('');
      setCheckInRequired(true);
      setSelectedSubEvents([]);
      setSelectedVolunteers([]);
    }
  }, [open]);

  // Check title availability
  useEffect(() => {
    if (title.trim().length === 0) {
      setTitleStatus('idle');
      return;
    }

    setTitleStatus('checking');
    const timer = setTimeout(async () => {
      const isAvailable = await checkTitleAvailability(title);
      setTitleStatus(isAvailable ? 'available' : 'unavailable');
    }, 500);

    return () => clearTimeout(timer);
  }, [title]);

  // Update POC contact when POC is selected
  useEffect(() => {
    if (selectedPOC && selectedTeam) {
      const member = selectedTeam.members.find(m => m.name === selectedPOC);
      if (member) {
        setPocContact(member.email);
      }
    }
  }, [selectedPOC, selectedTeam]);

  const handlePosterUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
      toast.success('Poster uploaded successfully');
    }
  };

  const handleRulebookUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setRulebookFile(file.name);
      toast.success('Rulebook uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} image(s) added to gallery`);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addSubEvent = (event) => {
    if (!selectedSubEvents.find(e => e.id === event.id)) {
      setSelectedSubEvents(prev => [...prev, event]);
      toast.success(`Sub-event "${event.title}" added`);
    }
    setSubEventSearchOpen(false);
    setSubEventSearch('');
  };

  const removeSubEvent = (eventId) => {
    setSelectedSubEvents(prev => prev.filter(e => e.id !== eventId));
  };

  const addVolunteer = (volunteer) => {
    if (!selectedVolunteers.find(v => v.email === volunteer.email)) {
      setSelectedVolunteers(prev => [...prev, volunteer]);
      toast.success(`Volunteer "${volunteer.name}" added`);
    }
    setVolunteerSearchOpen(false);
    setVolunteerSearch('');
  };

  const removeVolunteer = (email) => {
    setSelectedVolunteers(prev => prev.filter(v => v.email !== email));
  };

  const getFilteredSubEvents = () => {
    if (!subEventSearch) return MOCK_AVAILABLE_EVENTS;
    return MOCK_AVAILABLE_EVENTS.filter(e => 
      e.title.toLowerCase().includes(subEventSearch.toLowerCase())
    );
  };

  const getFilteredVolunteers = () => {
    if (!volunteerSearch) return MOCK_ORGANISERS;
    return MOCK_ORGANISERS.filter(o => 
      o.name.toLowerCase().includes(volunteerSearch.toLowerCase())
    );
  };

  const validateForm = () => {
    if (titleStatus !== 'available') {
      toast.error('Please enter a valid, available event title');
      return false;
    }
    if (!description.trim()) {
      toast.error('Please enter an event description');
      return false;
    }
    if (!selectedTeam) {
      toast.error('Please select a team');
      return false;
    }
    if (!selectedPOC) {
      toast.error('Please select a point of contact');
      return false;
    }
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return false;
    }
    if (!eventDate) {
      toast.error('Please select an event date');
      return false;
    }
    if (!startTime || !endTime) {
      toast.error('Please enter start and end times');
      return false;
    }
    if (!venue.trim()) {
      toast.error('Please enter a venue');
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    // Allow saving draft without full validation
    if (!title.trim()) {
      toast.error('Please enter an event title');
      return;
    }

    const eventData = {
      title,
      description,
      createdBy: selectedTeam?.id || 0,
      teamName: selectedTeam?.name || '',
      leaderEmail: selectedTeam?.leaderEmail || currentUserEmail,
      posterUrl: posterPreview || undefined,
      poc: {
        name: selectedPOC,
        contact: pocContact,
      },
      ruleBook: rulebookFile || undefined,
      categoryTags: selectedCategories,
      gallery,
      timeline: eventDate ? [{
        title,
        description: '',
        date: eventDate.toISOString().split('T')[0],
        duration: { from: startTime, to: endTime },
        venue,
        checkInRequired,
      }] : [],
      subEvents: selectedSubEvents.map(e => ({ subevent: e.id, status: 'Pending' })),
      volunteers: selectedVolunteers.map(v => ({ 
        id: Date.now(), 
        name: v.name, 
        email: v.email, 
        status: 'Pending' 
      })),
      status: 'drafted',
    };

    onSave(eventData);
    toast.success('Event saved as draft');
    onClose();
  };

  const handlePublish = () => {
    if (!validateForm()) return;

    const eventData = {
      title,
      description,
      createdBy: selectedTeam.id,
      teamName: selectedTeam.name,
      leaderEmail: selectedTeam.leaderEmail,
      posterUrl: posterPreview || undefined,
      poc: {
        name: selectedPOC,
        contact: pocContact,
      },
      ruleBook: rulebookFile || undefined,
      categoryTags: selectedCategories,
      gallery,
      timeline: [{
        title,
        description: '',
        date: eventDate.toISOString().split('T')[0],
        duration: { from: startTime, to: endTime },
        venue,
        checkInRequired,
      }],
      subEvents: selectedSubEvents.map(e => ({ subevent: e.id, status: 'Pending' })),
      volunteers: selectedVolunteers.map(v => ({ 
        id: Date.now(), 
        name: v.name, 
        email: v.email, 
        status: 'Pending' 
      })),
      status: 'drafted',
    };

    onSave(eventData);
    toast.success('Event published successfully!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-8 pb-4 flex-shrink-0">
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Create a new event by filling in the details below. The event will be saved as a draft automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8">
          <div className="space-y-6 pb-6">
          {/* Event Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Enter event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            {titleStatus === 'checking' && (
              <p className="text-sm text-muted-foreground">Checking availability...</p>
            )}
            {titleStatus === 'available' && (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Available ✅
              </p>
            )}
            {titleStatus === 'unavailable' && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="w-4 h-4" />
                Already exists in Published or Ongoing events ❌
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter event description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-border" />

          {/* Select Team */}
          <div className="space-y-2">
            <Label>Select Team *</Label>
            <p className="text-sm text-muted-foreground">Choose a team where you are the leader</p>
            <Select value={selectedTeam?.name || ''} onValueChange={(value) => {
              const team = MOCK_LEADER_TEAMS.find(t => t.name === value);
              setSelectedTeam(team || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_LEADER_TEAMS.map(team => (
                  <SelectItem key={team.id} value={team.name}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTeam && (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Team selected. This team will move to "In Use" status.
              </p>
            )}
          </div>

          {/* Poster Upload */}
          <div className="space-y-2">
            <Label>Event Poster</Label>
            <div className="flex flex-col gap-3">
              {posterPreview ? (
                <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-0"
                      onClick={() => document.getElementById('poster-upload')?.click()}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => setPosterPreview(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  onClick={() => document.getElementById('poster-upload')?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6" />
                    <span>Upload Poster Image</span>
                  </div>
                </Button>
              )}
              <input
                id="poster-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
            </div>
          </div>

          {/* POC Selection */}
          {selectedTeam && (
            <div className="space-y-2">
              <Label>Point of Contact (POC) *</Label>
              <p className="text-sm text-muted-foreground">Select from team members</p>
              <Select value={selectedPOC} onValueChange={setSelectedPOC}>
                <SelectTrigger>
                  <SelectValue placeholder="Select POC" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTeam.members.map(member => (
                    <SelectItem key={member.email} value={member.name}>
                      {member.name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {pocContact && (
                <p className="text-sm text-muted-foreground">Contact: {pocContact}</p>
              )}
            </div>
          )}

          {/* Rulebook Upload */}
          <div className="space-y-2">
            <Label>Rulebook (PDF)</Label>
            <div className="flex items-center gap-3">
              {rulebookFile ? (
                <div className="flex-1 flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-destructive" />
                    <span className="text-sm">{rulebookFile}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRulebookFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('rulebook-upload')?.click()}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Rulebook (PDF)
                </Button>
              )}
              <input
                id="rulebook-upload"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleRulebookUpload}
              />
            </div>
          </div>

          {/* Category Tags */}
          <div className="space-y-2">
            <Label>Category Tags *</Label>
            <Popover open={categorySelectOpen} onOpenChange={setCategorySelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  {getCategoryButtonText(selectedCategories)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-3">
                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map(category => (
                    <div key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`cat-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded"
                      />
                      <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer flex-1">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(cat => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => toggleCategory(cat)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Event Gallery */}
          <div className="space-y-2">
            <Label>Event Gallery</Label>
            <p className="text-sm text-muted-foreground">Upload multiple images</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Add Images to Gallery
            </Button>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryUpload}
            />
            {gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <div key={img} className="relative aspect-square border border-border rounded-lg overflow-hidden group">
                    <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-border" />

          {/* Timeline & Venue Section */}
          <div className="space-y-4">
            <h3 className="font-medium">Timeline & Venue</h3>
            
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {eventDate ? eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={(date) => {
                      setEventDate(date);
                      setDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time *</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="venue"
                  placeholder="Enter venue location"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Add Map Annotator */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => toast.info('Map Annotator feature coming soon')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Map Annotator
              </Button>
            </div>

            {/* Check-in Toggle */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="checkin">Check-in Required</Label>
                <p className="text-sm text-muted-foreground">Require attendees to check in at the event</p>
              </div>
              <Switch
                id="checkin"
                checked={checkInRequired}
                onCheckedChange={setCheckInRequired}
              />
            </div>
          </div>

          {/* Horizontal Divider */}
          <div className="border-t border-border" />

          {/* Sub-events Section */}
          <div className="space-y-3">
            <div>
              <Label>Add Sub-events</Label>
              <p className="text-sm text-muted-foreground">Select existing drafted or created events as sub-events</p>
            </div>
            
            <Popover open={subEventSearchOpen} onOpenChange={setSubEventSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Search and add sub-events
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search events by title..." 
                    value={subEventSearch}
                    onValueChange={setSubEventSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No events found.</CommandEmpty>
                    <CommandGroup>
                      {getFilteredSubEvents().map((event) => (
                        <CommandItem
                          key={event.id}
                          value={event.title}
                          onSelect={() => addSubEvent(event)}
                          disabled={selectedSubEvents.some(e => e.id === event.id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{event.title}</span>
                            <span className="text-xs text-muted-foreground">Team: {event.teamName}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedSubEvents.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSubEvents.map(event => (
                  <Badge key={event.id} variant="outline" className="gap-2 pr-1">
                    <span>{event.title}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSubEvent(event.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Invitations will be sent to the leaders of selected sub-events
            </p>
          </div>

          {/* Volunteers Section */}
          <div className="space-y-3">
            <div>
              <Label>Add Volunteers</Label>
              <p className="text-sm text-muted-foreground">Search and add organizers as volunteers (view-only access)</p>
            </div>
            
            <Popover open={volunteerSearchOpen} onOpenChange={setVolunteerSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Search and add volunteers
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search organisers..." 
                    value={volunteerSearch}
                    onValueChange={setVolunteerSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No organisers found.</CommandEmpty>
                    <CommandGroup>
                      {getFilteredVolunteers().map((organiser) => (
                        <CommandItem
                          key={organiser.email}
                          value={organiser.name}
                          onSelect={() => addVolunteer(organiser)}
                          disabled={selectedVolunteers.some(v => v.email === organiser.email)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{organiser.name}</span>
                            <span className="text-xs text-muted-foreground">{organiser.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedVolunteers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedVolunteers.map(volunteer => (
                  <Badge key={volunteer.email} variant="secondary" className="gap-2 pr-1">
                    <span>{volunteer.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeVolunteer(volunteer.email)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handlePublish} className="gap-2">
            <CheckCircle className="w-4 h-4" />
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

CreateEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};