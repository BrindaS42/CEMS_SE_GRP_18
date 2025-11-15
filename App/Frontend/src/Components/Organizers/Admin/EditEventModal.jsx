import PropTypes from 'prop-types';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon, MapPin, Clock, Users, Save, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calender';
import { ImageWithFallback } from '../../figma/ImageWithFallback';
import { fetchTeamList } from '@/store/team.slice';
import { updateEventDraft, fetchPotentialSubEvents } from '@/store/event.slice';

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
  const { potentialSubEvents } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  // Form state
  const [title, setTitle] = useState('');
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
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [subEventSearchOpen, setSubEventSearchOpen] = useState(false);
  const [subEventSearch, setSubEventSearch] = useState('');
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const [timelineDatePickerOpen, setTimelineDatePickerOpen] = useState(false);

  const leaderTeams = useMemo(() => {
    if (!user || !teamList) return [];
    return teamList.filter(team => team.leader && team.leader._id === user.id);
  }, [teamList, user]);

  // Load event data when modal opens
  useEffect(() => {
    if (open) {
      dispatch(fetchTeamList());
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

      setRulebookFile(event.ruleBook || null);
      setSelectedCategories([...event.categoryTags]);
      setGallery([...event.gallery]);
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
      setSelectedPOC('');
      setPocName('');
      setPocPhone('');
      setRulebookFile(null);
      setSelectedCategories([]);
      setGallery([]);
      setTimeline([]);
      setRegistrationType('Individual');
      setSelectedSubEvents([]);
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

  const handleSave = () => {
    if (!validateForm() || !event) return;

    const eventData = {
      _id: event._id, // Important for update
      title,
      description,
      createdBy: selectedTeam._id,
      posterUrl: posterPreview || undefined,
      pocName: pocName,
      pocPhone: pocPhone,
      venue: eventVenue,
      ruleBook: rulebookFile || undefined,
      config: {
        registrationType: registrationType,
      },
      categoryTags: selectedCategories,
      gallery,
      timeline: timeline.map(({ id, from, to, ...rest }) => ({
        ...rest,
        duration: { from, to }
      })),
      // Map selected sub-events back to the format the backend expects
      subEvents: selectedSubEvents.map(se => ({
        subevent: se._id,
      })),
      status: event.status,
    };

    dispatch(updateEventDraft(eventData));
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
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('poster-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {posterPreview ? 'Change Poster' : 'Upload Poster'}
              </Button>
              <input
                id="poster-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePosterUpload}
              />
              {posterPreview && (
                <div className="relative h-20 w-20 rounded overflow-hidden border">
                  <ImageWithFallback 
                    src={posterPreview} 
                    alt="Poster preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
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

          {/* Rulebook Upload */}
          <div className="space-y-2">
            <Label>Rule Book (PDF)</Label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('rulebook-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                {rulebookFile ? 'Change Rule Book' : 'Upload Rule Book'}
              </Button>
              <input
                id="rulebook-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleRulebookUpload}
              />
              {rulebookFile && (
                <span className="text-sm text-muted-foreground">{rulebookFile}</span>
              )}
            </div>
          </div>

          {/* Gallery Upload */}
          <div className="space-y-2">
            <Label>Gallery Images</Label>
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('gallery-upload')?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
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
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((image, idx) => (
                    <div key={image} className="relative group">
                      <ImageWithFallback 
                        src={image} 
                        alt={`Gallery ${idx + 1}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))}
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
          <Button onClick={handleSave}>
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