import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Plus, X, Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon, MapPin, Clock, Users, Save, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/Components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Calendar } from '@/Components/ui/calender';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { fetchTeamList } from '@/Store/team.slice';
import { updateEventDraft, fetchPotentialSubEvents } from '@/Store/event.slice';
import { fetchAllSponsors } from '@/Store/auth.slice';
import { uploadToCloudinary } from '@/service/cloudinary';

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

export function EditEventModal({ open, onClose, event }) {
  const dispatch = useDispatch();
  const { teamList } = useSelector((state) => state.team);
  const { potentialSubEvents } = useSelector((state) => state.events);  const { user, allSponsors } = useSelector((state) => state.auth);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterUrlInput, setPosterUrlInput] = useState('');
  const [selectedPOC, setSelectedPOC] = useState('');
  const [pocName, setPocName] = useState('');
  const [pocPhone, setPocPhone] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [rulebookUrl, setRulebookUrl] = useState('');
  const [rulebookUrlInput, setRulebookUrlInput] = useState('');
  const [registrationType, setRegistrationType] = useState('Individual');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
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
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subEventSearchOpen, setSubEventSearchOpen] = useState(false);
  const [subEventSearch, setSubEventSearch] = useState('');
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [timelineDatePickerOpen, setTimelineDatePickerOpen] = useState(false);
  const [selectedSponsors, setSelectedSponsors] = useState([]);
  const [sponsorSearchOpen, setSponsorSearchOpen] = useState(false);
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaderTeams = useMemo(() => {
    if (!user || !teamList) return [];
    return teamList.filter(team => team.leader && team.leader._id === user.id);
  }, [teamList, user]);

  // Load event data when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchTeamList());
      dispatch(fetchAllSponsors());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (open && event) {
      setTitle(event.title);
      setDescription(event.description);
      setEventVenue(event.venue || '');

      // Find and set team from fetched list
      const teamId = typeof event.createdBy === 'object' ? event.createdBy._id : event.createdBy;
      const foundTeam = teamList.find(t => t._id === teamId);
      setSelectedTeam(foundTeam || null);

      setPosterPreview(event.posterUrl || null);
      setPosterUrlInput(event.posterUrl || '');

      // Set POC if it exists, using the 'foundTeam' which is guaranteed to be correct here.
      if (event.poc?.name && foundTeam) {
        const pocMember = foundTeam.members.find(m => m.user.profile.name === event.poc.name);
        if (pocMember) {
          setSelectedPOC(pocMember.user._id);
          setPocName(pocMember.user.profile.name);
          // Load the saved phone number from the event, fall back to profile if not present
          setPocPhone(event.poc.contact || pocMember.user.profile.contactNo || '');
        }
      } else {
        setSelectedPOC('');
        setPocPhone('');
      }

      setRulebookUrl(event.ruleBook || '');
      setRulebookUrlInput(event.ruleBook || '');
      setSelectedCategories([...event.categoryTags]);
      // Map existing gallery URLs to an object structure for consistent handling
      setGallery((event.gallery || []).map(url => ({ id: url, preview: url })));
      setGalleryFiles([]);

      setRegistrationType(event.config?.registrationType || 'Individual');

      // Load timeline data
      const loadedTimeline = (event.timeline || []).map((entry, index) => ({
        id: Date.now() + index, // temporary unique id for UI
        title: entry.title,
        description: entry.description,
        date: new Date(entry.date),
        from: entry.duration.from,
        to: entry.duration.to,
        venue: entry.venue,
        checkInRequired: entry.checkInRequired,
      }));
      setTimeline(loadedTimeline);

      // Load sub-events
      const loadedSubEvents = (event.subEvents || []).map(se => ({
        ...se.subevent, // The populated sub-event details
        status: se.status, // The status from the parent event's subEvents array
      }));
      setSelectedSubEvents(loadedSubEvents);

      // Load sponsors
      const loadedSponsors = (event.sponsors || []).map(s => ({
        ...s.sponsor, // The populated sponsor user details
        status: s.status,
      }));
      setSelectedSponsors(loadedSponsors);
    }
  }, [open, event, teamList]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
      setDescription('');
      setEventVenue('');
      setSelectedTeam(null);
      setPosterPreview(null);
      setPosterFile(null);
      setPosterUrlInput('');
      setSelectedPOC('');
      setPocName('');
      setPocPhone('');
      setRulebookUrl('');
      setRulebookUrlInput('');
      setSelectedCategories([]);
      setGallery([]);
      setGalleryFiles([]);
      setGalleryUrlInput('');
      setTimeline([]);
      setRegistrationType('Individual');
      setSelectedSubEvents([]);
      setSelectedSponsors([]);
    }
  }, [open]);

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

  // Fetch potential sub-events when team is set
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
      setPosterFile(file);
      setPosterUrlInput(''); // Clear URL input if a file is uploaded
      toast.success('Poster uploaded successfully');
    }
  };

  const handleRulebookUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      // Storing name for display. A real implementation would upload the file.
      setRulebookUrl(file.name);
      toast.success('Rulebook uploaded successfully');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery(prev => [...prev, { preview: reader.result, id: file.name + Date.now() }]);
      };
      reader.readAsDataURL(file);
    });
    setGalleryFiles(prev => [...prev, ...files]);
    toast.success(`${files.length} image(s) added to gallery`);
  };

  const addGalleryUrl = () => {
    const urls = galleryUrlInput.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length > 0) {
      const newImages = urls.map(url => ({ preview: url, id: url + Date.now() }));
      setGallery(prev => [...prev, ...newImages]);
      setGalleryUrlInput('');
      toast.success(`${urls.length} image URL(s) added to gallery`);
    } else {
      toast.error('Please paste at least one valid image URL.');
    }
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addSubEvent = (subEvent) => {
    if (!selectedSubEvents.find(e => e._id === subEvent._id)) {
      setSelectedSubEvents(prev => [...prev, { ...subEvent, status: 'Pending' }]);
      toast.success(`Sub-event "${subEvent.title}" added`);
    }
    setSubEventSearchOpen(false);
    setSubEventSearch('');
  };

  const removeSubEvent = (eventId) => {
    setSelectedSubEvents(prev => prev.filter(e => e._id !== eventId));
  };

  const addSponsor = (sponsor) => {
    if (!selectedSponsors.find(s => s._id === sponsor._id)) {
      setSelectedSponsors(prev => [...prev, { ...sponsor, status: 'Pending' }]);
      toast.success(`Sponsor "${sponsor.profile.name}" added`);
    }
    setSponsorSearchOpen(false);
    setSponsorSearch('');
  };

  const removeSponsor = (sponsorId) => {
    setSelectedSponsors(prev => prev.filter(s => s._id !== sponsorId));
  };

  const getFilteredSponsors = () => {
    if (!sponsorSearch) return allSponsors || [];
    return (allSponsors || []).filter(s => s.profile.name.toLowerCase().includes(sponsorSearch.toLowerCase()));
  };

  const getFilteredSubEvents = () => {
    if (!subEventSearch) return potentialSubEvents;
    return potentialSubEvents.filter(e => e.title.toLowerCase().includes(subEventSearch.toLowerCase()));
  };

  const handleAddTimelineEntry = () => {
    const { title, date, from, to, venue } = newTimelineEntry;
    if (!title || !date || !from || !to || !venue) {
      toast.error('Please fill all fields for the timeline entry.');
      return;
    }
    setTimeline(prev => [...prev, { ...newTimelineEntry, id: Date.now() }]);
    setNewTimelineEntry({ title: '', description: '', date: undefined, from: '', to: '', venue: '', checkInRequired: true });
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

  const validateForm = () => {
    if (!title.trim()) {
      toast.error('Please enter an event title');
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

  const handleSave = async () => {
    if (!validateForm() || !event) return;
    setIsSubmitting(true);

    let finalPosterUrl = null;
    if (posterFile) {
      try {
        finalPosterUrl = await uploadToCloudinary(posterFile);
      } catch (error) {
        toast.error('Poster upload failed. Please try again.');
        setIsSubmitting(false);
        return;
      }
    } else if (posterPreview) { // This means a URL was provided or existed before
      finalPosterUrl = posterPreview;
    }

    // Separate existing URLs from new file previews
    const existingGalleryUrls = gallery
      .map(img => img.preview)
      .filter(url => !url.startsWith('data:'));

    // Upload only the new files
    const newUploadedUrls = await Promise.all(galleryFiles.map(file => uploadToCloudinary(file)));

    const finalGallery = [...existingGalleryUrls, ...newUploadedUrls];

    const eventData = {
      _id: event._id, // Important for update
      title,
      description,
      createdBy: selectedTeam._id,
      posterUrl: finalPosterUrl || undefined,
      pocName: pocName,
      pocPhone: pocPhone,
      venue: eventVenue,
      ruleBook: rulebookUrl || undefined,
      config: {
        registrationType: registrationType,
      },
      categoryTags: selectedCategories,
      gallery: finalGallery,
      timeline: timeline.map(({ id, from, to, ...rest }) => ({
        ...rest,
        duration: { from, to }
      })),
      // Map selected sub-events back to the format the backend expects
      subEvents: selectedSubEvents.map(se => ({
        subevent: se._id,
      })),

      
      // Map selected sponsors back to the format the backend expects
      sponsors: selectedSponsors.map(s => ({
        // The sponsor object might be nested (s.sponsor) or direct (s)
        // This ensures we correctly grab the ID in either case.
        sponsor: s.id,
      })),
      status: event.status,
    };
    console.log('Selected Sponsors:', selectedSponsors);
    console.log('Event Data:', eventData);

    dispatch(updateEventDraft(eventData));
    setIsSubmitting(false);
    toast.success('Event updated successfully');
    onClose();
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] flex flex-col p-0">
        <DialogHeader className="p-8 pb-4 flex-shrink-0">
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update event details. Changes will be saved to your draft.
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
          </div>

          {/* Event Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Event Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your event"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Main Event Venue */}
          <div className="space-y-2">
            <Label htmlFor="event-venue">Main Event Venue</Label>
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
            <Select value={registrationType} onValueChange={setRegistrationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select registration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Individual">Individual</SelectItem>
                <SelectItem value="Team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t border-border" />

          {/* Team Selection is disabled for edit */}
          <div className="space-y-2">
            <Label>Organizing Team</Label>
            <Input
              value={selectedTeam?.name || 'Loading team...'}
              disabled
            />
            <p className="text-xs text-muted-foreground">The organizing team cannot be changed after creation.</p>
          </div>

          {/* Poster Upload */}
          <div className="space-y-2">
          <Label>Event Poster</Label>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="url">From URL</TabsTrigger>
            </TabsList>
            <TabsContent value="upload">
              <div className="flex items-center gap-4 pt-2">
                <Button type="button" variant="outline" onClick={() => document.getElementById('edit-poster-upload')?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {posterFile ? 'Change File' : 'Upload New File'}
                </Button>
                <input id="edit-poster-upload" type="file" accept="image/*" className="hidden" onChange={handlePosterUpload} />
              </div>
            </TabsContent>
            <TabsContent value="url">
              <div className="space-y-2 pt-2">
                <Input
                  placeholder="https://example.com/poster.jpg"
                  value={posterUrlInput}
                  onChange={(e) => {
                    setPosterUrlInput(e.target.value);
                    setPosterFile(null); // Clear file if URL is being used
                  }}
                />
                <Button size="sm" onClick={() => setPosterPreview(posterUrlInput)}>Set as Poster</Button>
              </div>
            </TabsContent>
          </Tabs>
          {posterPreview && (
            <div className="mt-4 space-y-2">
              <Label>Current Poster Preview</Label>
              <div className="relative h-48 w-full rounded overflow-hidden border">
                <ImageWithFallback 
                  src={posterPreview} 
                  alt="Poster preview"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
          </div>

          {/* Point of Contact */}
          {selectedTeam && (
            <div className="space-y-2">
              <Label>Point of Contact *</Label>
              <Select value={selectedPOC} onValueChange={setSelectedPOC}>
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
                <Label htmlFor="poc-phone-edit">POC Contact Number *</Label>
                <Input
                  id="poc-phone-edit"
                  placeholder="Enter contact number"
                  value={pocPhone}
                  onChange={(e) => setPocPhone(e.target.value)}
                  disabled={!selectedPOC}
                />
              </div>
            </div>
          )}

          {/* Category Tags */}
          <div className="space-y-2">
            <Label>Category Tags *</Label>
            <Popover open={categorySelectOpen} onOpenChange={setCategorySelectOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  <FileText className="mr-2 h-4 w-4" />
                  {selectedCategories.length > 0 
                    ? `${selectedCategories.length} categories selected` 
                    : 'Select categories...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-3" align="start">
                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map((category) => (
                    <div key={category} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`cat-${category}`}
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`cat-${category}`} className="text-sm cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCategories.map((cat) => (
                  <Badge key={cat} variant="outline">
                    {cat}
                    <X 
                      className="ml-1 h-3 w-3 cursor-pointer" 
                      onClick={() => toggleCategory(cat)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

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

          <div className="border-t border-border" />

          {/* Sub-events Section */}
          <div className="space-y-3">
            <div>
              <Label>Sub-events</Label>
              <p className="text-sm text-muted-foreground">Manage associated sub-events. New invitations will be sent for newly added events.</p>
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
                      {getFilteredSubEvents().map((subEvent) => (
                        <CommandItem
                          key={subEvent._id}
                          value={subEvent.title}
                          onSelect={() => addSubEvent(subEvent)}
                          disabled={selectedSubEvents.some(e => e._id === subEvent._id)}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{subEvent.title}</span>
                            <span className="text-xs text-muted-foreground">Team: {subEvent.createdBy?.name}</span>
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
                {selectedSubEvents.map(sub => (
                  <Badge key={sub._id} variant="outline" className="gap-2 pr-1">
                    <span>{sub.title} ({sub.status})</span>
                    <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeSubEvent(sub._id)}><X className="w-3 h-3" /></Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Sponsors Section */}
          <div className="space-y-3">
            <div>
              <Label>Sponsors</Label>
              <p className="text-sm text-muted-foreground">Manage event sponsors. New invitations will be sent for newly added sponsors.</p>
            </div>

            <Popover open={sponsorSearchOpen} onOpenChange={setSponsorSearchOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Search and add sponsors
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search sponsors by name..."
                    value={sponsorSearch}
                    onValueChange={setSponsorSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No sponsors found.</CommandEmpty>
                    <CommandGroup>
                      {getFilteredSponsors().map((sponsor) => (
                        <CommandItem
                          key={sponsor._id}
                          value={sponsor.profile.name}
                          onSelect={() => addSponsor(sponsor)}
                          disabled={selectedSponsors.some(s => s._id === sponsor._id)}
                        >
                          {sponsor.profile.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedSponsors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSponsors.map(s => (
                  <Badge key={s._id} variant="outline" className="gap-2 pr-1">
                    <span>{s.profile?.name} ({s.status})</span>
                    <Button size="sm" variant="ghost" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={() => removeSponsor(s._id)}><X className="w-3 h-3" /></Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Rulebook Upload */}
          <div className="space-y-2">
            <Label>Rulebook</Label>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => document.getElementById('edit-rulebook-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Rulebook
                  </Button>
                  <input id="edit-rulebook-upload" type="file" accept=".pdf" className="hidden" onChange={handleRulebookUpload} />
                </div>
              </TabsContent>
              <TabsContent value="url">
                <div className="flex gap-2 pt-2">
                  <Input placeholder="https://example.com/rulebook.pdf" value={rulebookUrlInput} onChange={(e) => setRulebookUrlInput(e.target.value)} />
                  <Button onClick={() => setRulebookUrl(rulebookUrlInput)}>Set URL</Button>
                </div>
              </TabsContent>
            </Tabs>
            {rulebookUrl && (
              <div className="flex-1 flex items-center justify-between p-3 border border-border rounded-lg mt-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-5 h-5 text-destructive flex-shrink-0" />
                  <a href={rulebookUrl} target="_blank" rel="noopener noreferrer" className="text-sm truncate hover:underline">{rulebookUrl}</a>
                </div>
                <Button size="sm" variant="ghost" onClick={() => { setRulebookUrl(''); setRulebookUrlInput(''); }}><X className="w-4 h-4" /></Button>
              </div>
            )}
          </div>

          {/* Gallery Upload */}
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="space-y-4">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload Files</TabsTrigger>
                  <TabsTrigger value="url">From URLs</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" onClick={() => document.getElementById('edit-gallery-upload')?.click()}>
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Add Images to Gallery
                    </Button>
                    <input id="edit-gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                  </div>
                </TabsContent>
                <TabsContent value="url">
                  <div className="space-y-2 pt-2">
                    <Textarea
                      placeholder="Paste image URLs here, one per line."
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      rows={4}
                    />
                    <Button onClick={addGalleryUrl}>Add URLs</Button>
                  </div>
                </TabsContent>
              </Tabs>
              {gallery.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((img, idx) => (
                    <div key={img.id} className="relative group">
                      <ImageWithFallback 
                        src={img.preview} 
                        alt={`Gallery ${idx + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setGallery(prev => prev.filter(item => item.id !== img.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>

        <DialogFooter className="p-8 pt-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const eventShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  teamName: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  poc: PropTypes.shape({
    name: PropTypes.string.isRequired,
    contact: PropTypes.string.isRequired,
  }).isRequired,
  ruleBook: PropTypes.string,
  categoryTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  gallery: PropTypes.arrayOf(PropTypes.string).isRequired,
  timeline: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    duration: PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
    }).isRequired,
    venue: PropTypes.string.isRequired,
    checkInRequired: PropTypes.bool.isRequired,
  })).isRequired,
  subEvents: PropTypes.array.isRequired,
  status: PropTypes.string.isRequired,
});

EditEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: eventShape,
};