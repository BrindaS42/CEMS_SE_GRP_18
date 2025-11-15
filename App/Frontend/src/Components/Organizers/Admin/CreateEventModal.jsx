import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, CheckCircle, XCircle, Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon, MapPin, Clock, Users, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calender';
import { fetchTeamList } from '@/store/team.slice';
import { fetchPotentialSubEvents } from '@/store/event.slice';
import { createEventDraft, publishEvent } from '@/store/event.slice';

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

export function CreateEventModal({ open, onClose, currentUserEmail }) {
  const dispatch = useDispatch();
  const { teamList } = useSelector((state) => state.team);
  const { potentialSubEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [title, setTitle] = useState('');
  const [titleStatus, setTitleStatus] = useState('idle');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [selectedPOC, setSelectedPOC] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [rulebookFile, setRulebookFile] = useState(null);
  const [registrationType, setRegistrationType] = useState('Individual');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [newTimelineEntry, setNewTimelineEntry] = useState({
    title: '',
    description: '',
    date: undefined,
    from: '',
    to: '',
    venue: '',
    checkInRequired: true,
  });
  const [showTimelineForm, setShowTimelineForm] = useState(false);

  const [selectedSubEvents, setSelectedSubEvents] = useState([]);

  // UI state
  const [teamSelectOpen, setTeamSelectOpen] = useState(false);
  const [pocSelectOpen, setPocSelectOpen] = useState(false);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subEventSearchOpen, setSubEventSearchOpen] = useState(false);
  const [subEventSearch, setSubEventSearch] = useState('');
  const [timelineDatePickerOpen, setTimelineDatePickerOpen] = useState(false);

  const leaderTeams = useMemo(() => {
    if (!user || !teamList) return [];
    console.log('Filtering leader teams for user ID:', user.id);
    console.log('All teams:', teamList);
    return teamList.filter(team => team.leader && team?.leader?._id === user.id);
  }, [teamList, user]);


    // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setTitleStatus('idle');
      setDescription('');
      setSelectedTeam(null);
      setPosterPreview(null);
      setSelectedPOC('');
      setPocName('');
      setPocPhone('');
      setEventVenue('');
      setRulebookFile(null);
      setRegistrationType('Individual');
      setSelectedCategories([]);
      setGallery([]);
      setTimeline([]);
      setSelectedSubEvents([]);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      dispatch(fetchTeamList());
    }
  }, [open, dispatch]);

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
      const member = selectedTeam.members.find(m => m.user._id === selectedPOC);
      if (member) {
        setPocName(member.user.profile.name);
        setPocPhone(member.user.profile.contactNo || '');
      }
    }
  }, [selectedPOC, selectedTeam]);

  useEffect(() => {
    if (selectedTeam) {
      dispatch(fetchPotentialSubEvents(selectedTeam._id));
    }
  }, [selectedTeam, dispatch]);


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
    if (!selectedSubEvents.find(e => e._id === event._id)) {
      setSelectedSubEvents(prev => [...prev, event]);
      toast.success(`Sub-event "${event.title}" added`);
    }
    setSubEventSearchOpen(false);
    setSubEventSearch('');
  };
  const removeSubEvent = (eventId) => {
    setSelectedSubEvents(prev => prev.filter(e => e._id !== eventId));
  };

  const handleAddTimelineEntry = () => {
    const { title, date, from, to, venue } = newTimelineEntry;
    if (!title || !date || !from || !to || !venue) {
      toast.error('Please fill all fields for the timeline entry.');
      return;
    }
    setTimeline(prev => [...prev, { ...newTimelineEntry, id: Date.now() }]); // Use temp ID for key
    setNewTimelineEntry({
      title: '',
      description: '',
      date: undefined,
      from: '',
      to: '',
      venue: '',
      checkInRequired: true,
    });
    setShowTimelineForm(false);
    toast.success('Timeline entry added.');
  };

  const handleRemoveTimelineEntry = (id) => {
    setTimeline(prev => prev.filter(entry => entry.id !== id));
    toast.info('Timeline entry removed.');
  };

  const handleTimelineInputChange = (field, value) => {
    setNewTimelineEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleTimelineDateChange = (date) => {
    setNewTimelineEntry(prev => ({ ...prev, date }));
    setTimelineDatePickerOpen(false);
  };

  const getFilteredSubEvents = () => {
    if (!subEventSearch) return potentialSubEvents;
    return potentialSubEvents.filter(e =>
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
    if (timeline.length === 0) {
      toast.error('Please add at least one timeline entry');
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
      createdBy: selectedTeam?._id,
      posterUrl: posterPreview,
      pocName: pocName,
      pocPhone: pocPhone,
      venue: eventVenue,
      ruleBook: rulebookFile,
      config: {
        registrationType: registrationType,
      },
      categoryTags: selectedCategories,
      gallery,
      timeline: timeline.map(({ id, from, to, ...rest }) => ({
        ...rest,
        duration: { from, to }
      })),
      subEvents: selectedSubEvents.map(e => ({ subevent: e._id, status: 'Pending' })),
    };

    // The college is now set on the backend, so we don't need to send it from here.
    // This also applies to the handlePublish function.

    dispatch(createEventDraft(eventData));
    onClose();
  };

  const handlePublish = () => {
    if (!validateForm()) return;

     const eventData = {
      title,
      description,
      createdBy: selectedTeam._id,
      // The college should be part of the team or user model.
      // Assuming the team has a collegeId. If not, this needs adjustment.
      college: selectedTeam.collegeId, 
      // Backend will handle this based on createdBy (teamId).
      posterUrl: posterPreview,
      pocName: pocName,
      pocPhone: pocPhone,
      venue: eventVenue,
      ruleBook: rulebookFile,
      config: {
        registrationType: registrationType,
      },
      categoryTags: selectedCategories,
      gallery,
      timeline: timeline.map(({ id, from, to, ...rest }) => ({
        ...rest,
        duration: { from, to }
      })),
      subEvents: selectedSubEvents.map(e => ({ subevent: e._id, status: 'Pending' })),
      volunteers: selectedVolunteers.map(v => ({
        id: Date.now(),
        name: v.name,
        email: v.email,
        status: 'Pending'
      })),
    };

    dispatch(publishEvent(eventData));
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

            {/* Event Venue */}
            <div className="space-y-2">
              <Label htmlFor="event-venue">Main Event Venue</Label>
              <p className="text-sm text-muted-foreground">The primary location for the event (e.g., "University Auditorium")</p>
              <Input
                id="event-venue"
                placeholder="Enter main event venue"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
              />
            </div>

            {/* Registration Type */}
            <div className="space-y-2">
              <Label>Registration Type *</Label>
              <p className="text-sm text-muted-foreground">Choose if participants register individually or as a team.</p>
              <Select value={registrationType} onValueChange={setRegistrationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select registration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Individual">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Individual</div>
                  </SelectItem>
                  <SelectItem value="Team">
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Team</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>



            {/* Horizontal Divider */}
            <div className="border-t border-border" />

            {/* Select Team */}
            <div className="space-y-2">
              <Label>Select Team *</Label>
              <p className="text-sm text-muted-foreground">Choose a team where you are the leader</p>
              <Select value={selectedTeam?._id || ''} onValueChange={(value) => {
                const team = leaderTeams.find(t => t._id === value);
                setSelectedTeam(team || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {leaderTeams.map(team => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Select value={selectedPOC} onValueChange={(value) => setSelectedPOC(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select POC" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTeam.members.map(member => (
                      <SelectItem key={member.user._id} value={member.user._id}>
                        {member.user.profile.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pocName && (
                  <p className="text-sm text-muted-foreground">Selected: {pocName}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="poc-phone">POC Contact Number *</Label>
                  <Input
                    id="poc-phone"
                    placeholder="Enter contact number"
                    value={pocPhone}
                    onChange={(e) => setPocPhone(e.target.value)}
                    disabled={!selectedPOC}
                  />
                </div>
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
              <h3 className="font-medium">Event Timeline *</h3>
              {timeline.length > 0 && (
                <div className="space-y-3">
                  {timeline.map((entry) => (
                    <div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{entry.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {entry.date.toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {entry.from} - {entry.to}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {entry.venue}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveTimelineEntry(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {showTimelineForm ? (
                <div className="p-4 border border-dashed rounded-lg space-y-4">
                  <Input placeholder="Timeline Entry Title *" value={newTimelineEntry.title} onChange={(e) => handleTimelineInputChange('title', e.target.value)} />
                  <Textarea placeholder="Description" value={newTimelineEntry.description} onChange={(e) => handleTimelineInputChange('description', e.target.value)} />
                  <Popover open={timelineDatePickerOpen} onOpenChange={setTimelineDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {newTimelineEntry.date ? newTimelineEntry.date.toLocaleDateString() : 'Select date *'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={newTimelineEntry.date} onSelect={handleTimelineDateChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <div className="grid grid-cols-2 gap-4">
                    <Input type="time" placeholder="Start Time *" value={newTimelineEntry.from} onChange={(e) => handleTimelineInputChange('from', e.target.value)} />
                    <Input type="time" placeholder="End Time *" value={newTimelineEntry.to} onChange={(e) => handleTimelineInputChange('to', e.target.value)} />
                  </div>
                  <Input placeholder="Venue *" value={newTimelineEntry.venue} onChange={(e) => handleTimelineInputChange('venue', e.target.value)} />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="timeline-checkin">Check-in Required</Label>
                    <Switch id="timeline-checkin" checked={newTimelineEntry.checkInRequired} onCheckedChange={(checked) => handleTimelineInputChange('checkInRequired', checked)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowTimelineForm(false)}>Cancel</Button>
                    <Button onClick={handleAddTimelineEntry}>Add Entry</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setShowTimelineForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Timeline Entry
                </Button>
              )}
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
                            key={event._id}
                            value={event.title}
                            onSelect={() => addSubEvent(event)}
                            disabled={selectedSubEvents.some(e => e._id === event._id)}
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
                    <Badge key={event._id} variant="outline" className="gap-2 pr-1">
                      <span>{event.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSubEvent(event._id)}
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
  currentUserEmail: PropTypes.string.isRequired,
};