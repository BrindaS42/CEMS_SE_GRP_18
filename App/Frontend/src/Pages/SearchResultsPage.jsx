import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  User,
  Building2,
  Briefcase,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from 'sonner@2.0.3';

export const SearchResultsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    events: [],
    users: [],
    sponsors: [],
    organizers: [],
  });

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockEvents = [
        {
          _id: '1',
          name: 'TechFest 2024',
          description: 'Annual technical festival featuring workshops, competitions, and guest lectures',
          category: 'Technical',
          date: new Date('2024-03-15'),
          location: 'Main Auditorium',
          registrationFee: 500,
          maxParticipants: 500,
          image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        },
        {
          _id: '2',
          name: 'Cultural Night',
          description: 'Celebrate diversity with music, dance, and cultural performances',
          category: 'Cultural',
          date: new Date('2024-03-20'),
          location: 'Open Ground',
          registrationFee: 200,
          maxParticipants: 1000,
          image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop',
        },
      ].filter(e => 
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mockUsers = [
        {
          _id: 'user1',
          username: 'john_doe',
          email: 'john@example.com',
          role: 'student',
          profile: {
            name: 'John Doe',
            profilePic: '',
            areasOfInterest: ['Web Development', 'AI/ML', 'Blockchain'],
          },
        },
        {
          _id: 'user2',
          username: 'jane_smith',
          email: 'jane@example.com',
          role: 'student',
          profile: {
            name: 'Jane Smith',
            profilePic: '',
            areasOfInterest: ['Data Science', 'Cloud Computing'],
          },
        },
      ].filter(u =>
        u.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mockSponsors = [
        {
          _id: 'sponsor1',
          name: 'TechCorp Solutions',
          email: 'contact@techcorp.com',
          role: 'sponsor',
          profile: {
            firmLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop',
            firmDescription: 'Leading provider of enterprise software solutions',
          },
          sponsorDetails: {
            stallLocation: 'Main Campus, Building A',
          },
        },
      ].filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.profile.firmDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mockOrganizers = [
        {
          _id: 'org1',
          username: 'event_coordinator',
          email: 'coordinator@college.edu',
          role: 'organizer',
          profile: {
            name: 'Event Coordinator',
            profilePic: '',
            areasOfInterest: ['Event Management', 'Planning'],
          },
        },
      ].filter(o =>
        o.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.username.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setResults({
        events: mockEvents,
        users: mockUsers,
        sponsors: mockSponsors,
        organizers: mockOrganizers,
      });
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const totalResults = 
    results.events.length + 
    results.users.length + 
    results.sponsors.length + 
    results.organizers.length;

  const renderEventCard = (event) => (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden" onClick={() => navigate(`/events/${event._id}`)}>
        <img
          src={event.image}
          alt={event.name}
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-black flex-1">{event.name}</h3>
            <Badge>{event.category}</Badge>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>₹{event.registrationFee}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderUserCard = (user) => (
    <motion.div
      key={user._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/profile/${user._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.profile.profilePic} />
              <AvatarFallback>
                {user.profile.name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-1">{user.profile.name || user.username}</h3>
              <p className="text-sm text-gray-500 mb-2">@{user.username}</p>
              <Badge variant="outline" className="capitalize">
                {user.role}
              </Badge>
              {user.profile.areasOfInterest && user.profile.areasOfInterest.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {user.profile.areasOfInterest.slice(0, 3).map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSponsorCard = (sponsor) => (
    <motion.div
      key={sponsor._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/sponsors/${sponsor._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={sponsor.profile.firmLogo}
              alt={sponsor.name}
              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-xl font-black mb-2">{sponsor.name}</h3>
              <p className="text-gray-600 mb-3 text-sm">{sponsor.profile.firmDescription}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{sponsor.sponsorDetails.stallLocation}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Search Results
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for events, users, sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 h-12 text-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
          {query && (
            <p className="text-gray-600 mt-4">
              Showing results for <span className="font-semibold">"{query}"</span> -{' '}
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : totalResults === 0 ? (
          <Card className="p-12 text-center">
            <Search className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-black mb-2">No Results Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find anything matching your search. Try different keywords.
            </p>
            <Button onClick={() => navigate('/events')}>Browse Events</Button>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All <Badge variant="secondary" className="ml-2">{totalResults}</Badge>
              </TabsTrigger>
              <TabsTrigger value="events">
                Events <Badge variant="secondary" className="ml-2">{results.events.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="users">
                Users <Badge variant="secondary" className="ml-2">{results.users.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="sponsors">
                Sponsors <Badge variant="secondary" className="ml-2">{results.sponsors.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="organizers">
                Organizers <Badge variant="secondary" className="ml-2">{results.organizers.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {results.events.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    Events
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.events.map(renderEventCard)}
                  </div>
                  <Separator className="my-8" />
                </div>
              )}

              {results.users.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    Users
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {results.users.map(renderUserCard)}
                  </div>
                  <Separator className="my-8" />
                </div>
              )}

              {results.sponsors.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Sponsors
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {results.sponsors.map(renderSponsorCard)}
                  </div>
                  <Separator className="my-8" />
                </div>
              )}

              {results.organizers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6" />
                    Organizers
                  </h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {results.organizers.map(renderUserCard)}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
