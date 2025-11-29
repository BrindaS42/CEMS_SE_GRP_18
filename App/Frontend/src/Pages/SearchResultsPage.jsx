import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Building2,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Skeleton } from '@/Components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { SegmentedControl } from '@/Components/ui/segmented-control';
import { toast } from 'sonner';
import axios from 'axios';
import { ChatBot } from '@/components/ChatBot';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SearchResultsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // We'll use local state for the active tab instead of Radix Tabs
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    events: [],
    users: [],
    sponsors: [],
    organizers: [],
  });

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(searchTerm)}`, { withCredentials: true });
      setResults({
        events: response.data.events || [],
        users: response.data.users || [],
        sponsors: response.data.sponsors || [],
        organizers: response.data.organizers || [],
      });
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const totalResults = 
    results.events.length + 
    results.users.length + 
    results.sponsors.length + 
    results.organizers.length;

  // Helper to render event cards (refactored for consistency)
  const renderEventCard = (event) => (
    <motion.div
      key={event._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/events/${event._id}`)}>
        {event.posterUrl && (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-black flex-1 dark:text-white">{event.title}</h3>
            {event.categoryTags?.[0] && <Badge variant="secondary">{event.categoryTags[0]}</Badge>}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{event.description}</p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            {event.timeline?.[0]?.date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.timeline[0].date).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.venue || 'TBD'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>{event.config?.isFree ? 'Free' : `₹${event.config?.fees || 0}`}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  // Helper to render user/organizer cards
  const renderUserCard = (userItem) => (
    <motion.div
      key={userItem._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/profile/${userItem._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={userItem.profile?.profilePic} />
              <AvatarFallback>
                {userItem.profile?.name?.charAt(0).toUpperCase() || userItem.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-black mb-1 dark:text-white">{userItem.profile?.name || userItem.email}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{userItem.email}</p>
              <Badge variant="outline" className="capitalize dark:text-gray-300 dark:border-gray-600">
                {userItem.role}
              </Badge>
              {userItem.profile?.areasOfInterest && userItem.profile.areasOfInterest.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {userItem.profile?.areasOfInterest.slice(0, 3).map((interest, idx) => (
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

  // Helper to render sponsor cards
  const renderSponsorCard = (sponsor) => (
    <motion.div
      key={sponsor._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/sponsors/${sponsor._id}`)}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {sponsor.sponsorDetails?.firmLogo && (
              <img
                src={sponsor.sponsorDetails.firmLogo}
                alt={sponsor.profile?.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0 bg-white"
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-black mb-2 dark:text-white">{sponsor.profile?.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-3 text-sm">{sponsor.sponsorDetails?.firmDescription}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{sponsor.sponsorDetails?.locations?.[0]?.address || 'Online'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Search Results
          </h1>
          {query && (
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Showing results for <span className="font-semibold text-gray-900 dark:text-white">"{query}"</span> -{' '}
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full dark:bg-gray-800" />
            ))}
          </div>
        ) : totalResults === 0 ? (
          <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
            <Search className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-2xl font-black mb-2 dark:text-white">No Results Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find anything matching your search. Try different keywords.
            </p>
            <Button onClick={() => navigate('/events')}>Browse Events</Button>
          </Card>
        ) : (
          <div className="w-full">
            {/* Segmented Control for Filtering */}
            <div className="mb-8 overflow-x-auto pb-2">
              <SegmentedControl
                options={[
                  { 
                    value: 'all', 
                    label: (
                      <div className="flex items-center gap-2 px-1">
                        <span>All</span>
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center">{totalResults}</Badge>
                      </div>
                    ) 
                  },
                  { 
                    value: 'events', 
                    label: (
                      <div className="flex items-center gap-2 px-1">
                        <span>Events</span>
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center">{results.events.length}</Badge>
                      </div>
                    ) 
                  },
                  { 
                    value: 'users', 
                    label: (
                      <div className="flex items-center gap-2 px-1">
                        <span>Users</span>
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center">{results.users.length}</Badge>
                      </div>
                    ) 
                  },
                  { 
                    value: 'sponsors', 
                    label: (
                      <div className="flex items-center gap-2 px-1">
                        <span>Sponsors</span>
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center">{results.sponsors.length}</Badge>
                      </div>
                    ) 
                  },
                  { 
                    value: 'organizers', 
                    label: (
                      <div className="flex items-center gap-2 px-1">
                        <span>Organizers</span>
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] justify-center">{results.organizers.length}</Badge>
                      </div>
                    ) 
                  },
                ]}
                value={activeTab}
                onChange={setActiveTab}
                variant={user?.role || 'student'}
              />
            </div>

            {/* Content Rendering */}
            <div className="space-y-8 animate-fade-in">
              {/* ALL TAB: Shows everything */}
              {activeTab === 'all' && (
                <>
                  {results.events.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                        <Calendar className="w-6 h-6" /> Events
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.events.map(renderEventCard)}
                      </div>
                      <Separator className="my-8 dark:bg-gray-700" />
                    </div>
                  )}

                  {results.users.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                        <User className="w-6 h-6" /> Users
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {results.users.map(renderUserCard)}
                      </div>
                      <Separator className="my-8 dark:bg-gray-700" />
                    </div>
                  )}

                  {results.sponsors.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                        <Building2 className="w-6 h-6" /> Sponsors
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {results.sponsors.map(renderSponsorCard)}
                      </div>
                      <Separator className="my-8 dark:bg-gray-700" />
                    </div>
                  )}

                  {results.organizers.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                        <Briefcase className="w-6 h-6" /> Organizers
                      </h2>
                      <div className="grid md:grid-cols-2 gap-6">
                        {results.organizers.map(renderUserCard)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* INDIVIDUAL TABS */}
              {activeTab === 'events' && (
                <div className="animate-fade-in">
                  {results.events.length > 0 ? (
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {results.events.map(renderEventCard)}
                     </div>
                  ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No events found matching "{query}"</p>}
                </div>
              )}

              {activeTab === 'users' && (
                <div className="animate-fade-in">
                  {results.users.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {results.users.map(renderUserCard)}
                    </div>
                  ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found matching "{query}"</p>}
                </div>
              )}

              {activeTab === 'sponsors' && (
                <div className="animate-fade-in">
                  {results.sponsors.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {results.sponsors.map(renderSponsorCard)}
                    </div>
                  ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No sponsors found matching "{query}"</p>}
                </div>
              )}

              {activeTab === 'organizers' && (
                 <div className="animate-fade-in">
                  {results.organizers.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {results.organizers.map(renderUserCard)}
                    </div>
                  ) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No organizers found matching "{query}"</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {isAuthenticated && <ChatBot />}
    </div>
  );
};