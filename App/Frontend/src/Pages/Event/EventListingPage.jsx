import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'motion/react';
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  MapPin,
  Users,
  Eye,
  Calendar,
  Sparkles,
  Star,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPublicEvents } from '@/store/studentEvents.slice';
import { ChatBot } from '@/components/ChatBot';

export const EventListingPage = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { events, pagination, loading } = useSelector((state) => state.studentEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [page, setPage] = useState(1);

  console.log("studentEvents:", events);
  console.log("pagination:", pagination);
  // console.log("studentEvents:", events);
  // console.log("pagination:", pagination);
  
  const isStudentView = user?.role === 'student';

  const categoryTags = [
    'Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar',
    'Competition', 'Fest', 'Exhibition', 'Social', 'Music'
  ];

  useEffect(() => {
    const params = {
      page,
      limit: 12,
      status: 'published',
    };
    if (searchQuery) params.search = searchQuery;
    if (selectedTags.length > 0) params.categoryTags = selectedTags.join(',');

    dispatch(fetchPublicEvents(params));
  }, [dispatch, searchQuery, selectedTags, page]);

  const totalPages = pagination?.pages || 1;

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
    setPage(1);
  };

  const EventCard = ({ event, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Link to={`/events/${event._id}`}>
        <Card className={`overflow-hidden h-full border-2 transition-all hover:shadow-2xl dark:bg-gray-800 dark:border-gray-700 ${
          isStudentView 
            ? 'hover:border-purple-400 dark:hover:border-purple-500' 
            : 'hover:border-indigo-400 dark:hover:border-indigo-500'
        }`}>
          <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 dark:from-purple-900 dark:via-pink-900 dark:to-orange-900 overflow-hidden">
            {event.gallery && event.gallery[0] ? (
              <img
                src={event.gallery[0]}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-20 h-20 text-white opacity-50" />
              </div>
            )}
            
            {(event.registrationCount || 0) > 50 && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              </div>
            )}

            <div className="absolute top-3 left-3">
              <Badge className={
                isStudentView
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
              }>
                <Sparkles className="w-3 h-3 mr-1" />
                Open
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-black mb-2 line-clamp-1 dark:text-white">
              {event.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
              {event.description || 'No description available'}
            </p>

            {event.categoryTags && event.categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {event.categoryTags.slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs dark:text-gray-300 dark:border-gray-600">
                    {tag}
                  </Badge>
                ))}
                {event.categoryTags.length > 3 && (
                  <Badge variant="outline" className="text-xs dark:text-gray-300 dark:border-gray-600">
                    +{event.categoryTags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              {event.venue?.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="line-clamp-1">{event.venue.address}</span>
                </div>
              )}
              
              {event.timeline && event.timeline[0] && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {new Date(event.timeline[0].date).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{event.registrationCount || 0}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">registered</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );

  return (
    <div className={`min-h-screen pt-20 pb-12 transition-colors duration-300 ${
      isStudentView
        ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950'
        : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className={`bg-gradient-to-r ${
                isStudentView
                  ? 'from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400'
                  : 'from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400'
              } bg-clip-text text-transparent`}>
                Discover Events
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Find amazing events happening around you! {isStudentView ? '🎉' : '📅'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                // Use !pl-14 to force padding override
                className="!pl-14 pr-4 py-6 text-lg rounded-2xl border-2 focus:border-purple-400 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {/* "All" Filter Button */}
            <Button
              key="all"
              variant={selectedTags.length === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedTags([]);
                setPage(1);
              }}
              className={selectedTags.length === 0 ? (
                isStudentView
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
              ) : 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}
            >
              All
            </Button>

            {categoryTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleTag(tag)}
                className={selectedTags.includes(tag) ? (
                  isStudentView
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0'
                ) : 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700'}
              >
                {tag}
              </Button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">
                {events.length} events found
              </span>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <Skeleton className="h-48 w-full dark:bg-gray-700" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-full dark:bg-gray-700" />
                  <Skeleton className="h-4 w-full dark:bg-gray-700" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 dark:bg-gray-700" />
                    <Skeleton className="h-6 w-16 dark:bg-gray-700" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-2xl font-black text-gray-400 dark:text-gray-500 mb-2">No events found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <EventCard key={event._id} event={event} index={index} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              Previous
            </Button>
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? 'default' : 'outline'}
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? (
                  isStudentView
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 dark:text-white border-0'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 dark:text-white border-0'
                ) : 'dark:bg-gray-800 dark:text-white dark:border-gray-700'}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      {isAuthenticated && <ChatBot />}
    </div>
  );
};