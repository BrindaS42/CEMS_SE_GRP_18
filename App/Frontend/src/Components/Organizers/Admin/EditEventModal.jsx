import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload, Image as ImageIcon, FileText, Calendar as CalendarIcon, MapPin, Clock, Users, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calender';
import { ImageWithFallback } from '../../figma/ImageWithFallback';

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

export function EditEventModal({ open, onClose, onSave, event, currentUserEmail }) {
  // Form state
  const [title, setTitle] = useState('');
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
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  
  // UI state
  const [teamSelectOpen, setTeamSelectOpen] = useState(false);
  const [pocSelectOpen, setPocSelectOpen] = useState(false);
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [volunteerSearchOpen, setVolunteerSearchOpen] = useState(false);
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Load event data when modal opens
  useEffect(() => {
    if (open && event) {
      setTitle(event.title);
      setDescription(event.description);
      
      // Find and set team
      const team = MOCK_LEADER_TEAMS.find(t => t.name === event.teamName);
      setSelectedTeam(team || null);
      
      setPosterPreview(event.posterUrl || null);
      setSelectedPOC(event.poc.name);
      setPocContact(event.poc.contact);
      setRulebookFile(event.ruleBook || null);
      setSelectedCategories([...event.categoryTags]);
      setGallery([...event.gallery]);
      
      // Load timeline data
      if (event.timeline.length > 0) {
        const mainTimeline = event.timeline[0];
        setEventDate(new Date(mainTimeline.date));
        setStartTime(mainTimeline.duration.from);
        setEndTime(mainTimeline.duration.to);
        setVenue(mainTimeline.venue);
        setCheckInRequired(mainTimeline.checkInRequired);
      }
      
      // Load volunteers
      const volunteers = event.volunteers.map(v => ({ name: v.name, email: v.email }));
      setSelectedVolunteers(volunteers);
    }
  }, [open, event]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setTitle('');
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
      setSelectedVolunteers([]);
    }
  }, [open]);

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

  const getFilteredVolunteers = () => {
    if (!volunteerSearch) return MOCK_ORGANISERS;
    return MOCK_ORGANISERS.filter(o => 
      o.name.toLowerCase().includes(volunteerSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(volunteerSearch.toLowerCase())
    );
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

  const handleSave = () => {
    if (!validateForm() || !event) return;

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
      subEvents: event.subEvents, // Keep existing sub-events
      volunteers: selectedVolunteers.map(v => {
        // Keep existing volunteer status if they were already added
        const existing = event.volunteers.find(ev => ev.email === v.email);
        return existing ? existing : { 
          id: Date.now(), 
          name: v.name, 
          email: v.email, 
          status: 'Pending' 
        };
      }),
      status: event.status,
    };

    onSave(event.id, eventData);
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

          {/* Team Selection */}
          <div className="space-y-2">
            <Label>Team *</Label>
            <Popover open={teamSelectOpen} onOpenChange={setTeamSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {selectedTeam ? selectedTeam.name : 'Select team...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search teams..." />
                  <CommandList>
                    <CommandEmpty>No teams found.</CommandEmpty>
                    <CommandGroup>
                      {MOCK_LEADER_TEAMS.map((team) => (
                        <CommandItem
                          key={team.id}
                          onSelect={() => {
                            setSelectedTeam(team);
                            setTeamSelectOpen(false);
                          }}
                        >
                          <div className="flex flex-col">
                            <span>{team.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Leader: {team.leader} ({team.members.length} members)
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Point of Contact */}
          {selectedTeam && (
            <div className="space-y-2">
              <Label>Point of Contact *</Label>
              <Popover open={pocSelectOpen} onOpenChange={setPocSelectOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    {selectedPOC || 'Select POC...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search members..." />
                    <CommandList>
                      <CommandEmpty>No members found.</CommandEmpty>
                      <CommandGroup>
                        {selectedTeam.members.map((member) => (
                          <CommandItem
                            key={member.email}
                            onSelect={() => {
                              setSelectedPOC(member.name);
                              setPocSelectOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span>{member.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {member.email} • {member.role}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {pocContact && (
                <p className="text-sm text-muted-foreground">Contact: {pocContact}</p>
              )}
            </div>
          )}

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

          {/* Timeline Section */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Event Timeline
            </h3>

            {/* Date */}
            <div className="space-y-2">
              <Label>Event Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {eventDate ? eventDate.toLocaleDateString() : 'Select date...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={(date) => {
                      setEventDate(date);
                      setDatePickerOpen(false);
                    }}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time *</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
                  <Clock className="h-4 w-4 text-muted-foreground" />
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
                <MapPin className="h-4 w-4 text-muted-foreground" />
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
                <Plus className="h-4 w-4 mr-2" />
                Add Map Annotator
              </Button>
            </div>

            {/* Check-in Required */}
            <div className="flex items-center justify-between">
              <Label htmlFor="check-in">Check-in Required</Label>
              <Switch
                id="check-in"
                checked={checkInRequired}
                onCheckedChange={setCheckInRequired}
              />
            </div>
          </div>

          {/* Volunteers */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Volunteers
              </h3>
              <Popover open={volunteerSearchOpen} onOpenChange={setVolunteerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Volunteer
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
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
                            onSelect={() => addVolunteer(organiser)}
                            disabled={selectedVolunteers.some(v => v.email === organiser.email)}
                          >
                            <div className="flex flex-col">
                              <span>{organiser.name}</span>
                              <span className="text-xs text-muted-foreground">{organiser.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {selectedVolunteers.length > 0 && (
              <div className="space-y-2">
                {selectedVolunteers.map((volunteer) => (
                  <div
                    key={volunteer.email}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{volunteer.name}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVolunteer(volunteer.email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
  id: PropTypes.number.isRequired,
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
  volunteers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  })).isRequired,
  subEvents: PropTypes.array.isRequired,
  status: PropTypes.string.isRequired,
});

EditEventModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  event: eventShape,
  currentUserEmail: PropTypes.string.isRequired,
};