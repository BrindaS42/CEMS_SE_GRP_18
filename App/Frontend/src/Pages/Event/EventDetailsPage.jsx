import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Heart,
  BookmarkPlus,
  ArrowLeft,
  Trophy,
  Megaphone,
  FileText,
  Image as ImageIcon,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  ChevronDown,
  MessageSquare,
  FormInput,
  Upload,
  Send,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Star,
  ThumbsUp,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { eventService } from '../services/eventService';
import { registrationService } from '../services/registrationService';
import { toast } from 'sonner';
import { ScrollArea } from '../../components/ui/scroll-area';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [hasClash, setHasClash] = useState(false);
  const [clashingEvents, setClashingEvents] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [registrationFormData, setRegistrationFormData] = useState({});
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [currentSponsorAdIndex, setCurrentSponsorAdIndex] = useState(0);
  
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const isStudentView = user?.role === 'student';
  const isOrganizerView = user?.role === 'organizer';
  const isEventOrganizer = event?.createdBy?.members?.some((m) => m._id === user?._id);

  const eventSponsorAds = [
    {
      _id: 'ad1',
      sponsorId: { _id: 's1', name: 'TechCorp Solutions' },
      title: 'Special Discount for Event Participants!',
      description: 'Get 30% off on all our products during the event. Visit our stall for exclusive deals.',
      images: ['https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=600&fit=crop'],
      videos: [],
      address: 'Stall #12, Main Campus Building A',
      contact: '+1 234 567 8900',
      poster: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=600&fit=crop',
      views: 542,
      likes: 45,
      status: 'Published',
    },
    {
      _id: 'ad2',
      sponsorId: { _id: 's2', name: 'CodeMasters Academy' },
      title: 'Free Coding Workshop',
      description: 'Join our exclusive workshop for event participants. Learn from industry experts.',
      images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop'],
      videos: [],
      address: 'Stall #5, Main Campus Building B',
      contact: '+1 234 567 8901',
      poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
      views: 398,
      likes: 32,
      status: 'Published',
    },
  ];

  const eventSponsors = [
    {
      _id: 's1',
      name: 'TechCorp Solutions',
      profile: {
        firmLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
        firmDescription: 'Leading provider of enterprise software solutions',
      },
      email: 'contact@techcorp.com',
      sponsorDetails: {
        stallLocation: 'Main Campus, Building A, Ground Floor, Stall #12',
      },
    },
    {
      _id: 's2',
      name: 'CodeMasters Academy',
      profile: {
        firmLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200&h=200&fit=crop',
        firmDescription: 'Premier coding bootcamp and training institute',
      },
      email: 'info@codemasters.com',
      sponsorDetails: {
        stallLocation: 'Main Campus, Building B, First Floor, Stall #5',
      },
    },
    {
      _id: 's3',
      name: 'InnovateTech Inc',
      profile: {
        firmLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop',
        firmDescription: 'Innovation hub for emerging technologies',
      },
      email: 'hello@innovatetech.com',
      sponsorDetails: {
        stallLocation: 'Main Campus, Building C, Ground Floor, Stall #8',
      },
    },
  ];

  useEffect(() => {
    if (id) {
      loadEventDetails();
      if (isStudentView) {
        checkForClashes();
        checkRegistrationStatus();
      }
      loadChatMessages();
      loadReviews();
    }
  }, [id]);

  const loadEventDetails = async () => {
    try {
      const response = await eventService.getEventById(id);
      setEvent(response.data);
    } catch (error) {
      console.error('Failed to load event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const checkForClashes = async () => {
    try {
      const response = await registrationService.checkClashes(id);
      setHasClash(response.data.hasClash);
      setClashingEvents(response.data.events);
    } catch (error) {
      console.error('Failed to check for clashes:', error);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await registrationService.checkRegistration(id);
      setIsRegistered(response.data.isRegistered);
    } catch (error) {
      console.error('Failed to check registration status:', error);
    }
  };

  const loadChatMessages = async () => {
    try {
      setChatMessages([
        {
          _id: '1',
          sender: { name: 'John Organizer', role: 'organizer' },
          message: 'Welcome to the event chat! Feel free to ask any questions.',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          _id: '2',
          sender: { name: 'Sarah Student', role: 'student' },
          message: 'What is the dress code for the event?',
          createdAt: new Date(Date.now() - 1800000),
        },
      ]);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
    }
  };

  const loadReviews = async () => {
    try {
      setReviews([
        {
          _id: '1',
          user: {
            name: 'Alice Johnson',
            profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          },
          rating: 5,
          comment: 'Amazing event! The organization was top-notch and I learned so much. Highly recommend to everyone!',
          createdAt: new Date(Date.now() - 86400000),
          likes: 12,
        },
        {
          _id: '2',
          user: {
            name: 'Bob Smith',
            profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          },
          rating: 4,
          comment: 'Great experience overall. The workshops were very informative. Would love to see more networking opportunities next time.',
          createdAt: new Date(Date.now() - 172800000),
          likes: 8,
        },
        {
          _id: '3',
          user: {
            name: 'Carol Williams',
            profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          },
          rating: 5,
          comment: "Absolutely fantastic! The speakers were experts in their field and the venue was perfect. Can't wait for the next one!",
          createdAt: new Date(Date.now() - 259200000),
          likes: 15,
        },
      ]);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      return;
    }

    if (hasClash) {
      toast.error('You have a schedule clash with this event');
      return;
    }

    setRegistering(true);
    try {
      await registrationService.registerForEvent(id, registrationFormData);
      toast.success('Registration successful! Check your inbox for confirmation.');
      setIsRegistered(true);
    } catch (error) {
      toast.error((error && error.response?.data?.message) || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    handleRegister();
  };

  const handleRegistrationFormChange = (field, value) => {
    setRegistrationFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckIn = async () => {
    try {
      toast.success('Checked in successfully!');
      setCheckInDialogOpen(false);
      setCheckInCode('');
      loadEventDetails();
    } catch (error) {
      toast.error('Invalid check-in code');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const newMessage = {
        _id: Date.now().toString(),
        sender: { name: user?.name || 'You', role: user?.role },
        message: chatMessage,
        createdAt: new Date(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
      toast.success('Message sent!');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (!newRating) {
      toast.error('Please select a rating');
      return;
    }

    if (!newReview.trim()) {
      toast.error('Please write a comment');
      return;
    }

    try {
      const review = {
        _id: Date.now().toString(),
        user: {
          name: user?.profile?.name || user?.username || 'Anonymous',
          profilePic: user?.profile?.profilePic,
        },
        rating: newRating,
        comment: newReview,
        createdAt: new Date(),
        likes: 0,
      };
      setReviews([review, ...reviews]);
      setNewReview('');
      setNewRating(0);
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;

    try {
      toast.success('Report submitted successfully. We will review it shortly.');
      setReportDialogOpen(false);
      setReportText('');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  const nextSponsorAd = () => {
    setCurrentSponsorAdIndex((prev) => (prev + 1) % eventSponsorAds.length);
  };

  const prevSponsorAd = () => {
    setCurrentSponsorAdIndex((prev) => (prev - 1 + eventSponsorAds.length) % eventSponsorAds.length);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-black mb-2">Event Not Found</h2>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild>
            <Link to="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            src={event.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                {event.eventType}
              </Badge>
              <Badge className="bg-gradient-to-r from-orange-600 to-pink-600">
                {event.category}
              </Badge>
              {event.config?.registrationType && (
                <Badge variant="outline" className="text-white border-white">
                  {event.config.registrationType}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-2">{event.title}</h1>
            <p className="text-xl text-gray-200 max-w-3xl">{event.tagline}</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {hasClash && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  You have a schedule clash with {clashingEvents.length} event(s):
                  <ul className="mt-2 list-disc list-inside">
                    {clashingEvents.map((e) => (
                      <li key={e._id}>{e.title}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-7 lg:grid-cols-7">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="winners">Winners</TabsTrigger>
                  <TabsTrigger value="chatroom">Chatroom</TabsTrigger>
                  <TabsTrigger value="registration">Register</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6 space-y-8">
                  <div>
                    <h2 className="text-2xl font-black mb-4">About This Event</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>

                  {event.subEvents && event.subEvents.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                        <Trophy className="w-6 h-6" />
                        Sub Events
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {event.subEvents.map((subEvent, idx) => (
                          <Card key={idx} className="p-4">
                            <h3 className="font-black mb-2">{subEvent.title}</h3>
                            <p className="text-sm text-gray-600">{subEvent.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {eventSponsorAds.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4">Sponsored Content</h2>
                      <Card className="p-0 overflow-hidden">
                        <div className="relative">
                          <motion.div
                            key={currentSponsorAdIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <img
                              src={eventSponsorAds[currentSponsorAdIndex].poster}
                              alt={eventSponsorAds[currentSponsorAdIndex].title}
                              className="w-full h-80 object-cover"
                            />
                            <div className="p-6">
                              <div className="flex items-center gap-3 mb-3">
                                <Building2 className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold">
                                  {eventSponsorAds[currentSponsorAdIndex].sponsorId.name}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black mb-2">
                                {eventSponsorAds[currentSponsorAdIndex].title}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                {eventSponsorAds[currentSponsorAdIndex].description}
                              </p>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {eventSponsorAds[currentSponsorAdIndex].views} views
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    {eventSponsorAds[currentSponsorAdIndex].likes} likes
                                  </div>
                                </div>
                                <Button
                                  onClick={() =>
                                    navigate(`/ads/${eventSponsorAds[currentSponsorAdIndex]._id}`)
                                  }
                                >
                                  View More
                                </Button>
                              </div>
                            </div>
                          </motion.div>

                          {eventSponsorAds.length > 1 && (
                            <>
                              <button
                                onClick={prevSponsorAd}
                                className="absolute left-4 top-40 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button
                                onClick={nextSponsorAd}
                                className="absolute right-4 top-40 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}
                        </div>

                        {eventSponsorAds.length > 1 && (
                          <div className="flex justify-center gap-2 pb-4">
                            {eventSponsorAds.map((_, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCurrentSponsorAdIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  idx === currentSponsorAdIndex
                                    ? 'bg-purple-600 w-8'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {event.venue && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        Venue Information
                      </h2>
                      <Card className="p-6">
                        {event.venue.address && (
                          <p className="text-gray-700 mb-4">{event.venue.address}</p>
                        )}
                        {event.venue.mapAnnotations && event.venue.mapAnnotations.length > 0 && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Points of Interest:</h3>
                            <div className="grid gap-2">
                              {event.venue.mapAnnotations.map((annotation, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: annotation.color || '#6366f1' }} />
                                  <div>
                                    <p className="font-semibold">{annotation.label}</p>
                                    {annotation.description && (
                                      <p className="text-sm text-gray-600">{annotation.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    </div>
                  )}

                  {event.pocs && event.pocs.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-black mb-4">Points of Contact</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {event.pocs.map((poc, idx) => (
                          <Card key={idx} className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-black">{poc.name}</h3>
                                <p className="text-sm text-gray-500">{poc.designation || 'Organizer'}</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              {poc.contact && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-4 h-4" />
                                  {poc.contact}
                                </div>
                              )}
                              {poc.email && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="w-4 h-4" />
                                  {poc.email}
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-black flex items-center gap-2">
                        <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                        Reviews & Ratings
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black">{averageRating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= Math.round(parseFloat(averageRating))
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-500">({reviews.length} reviews)</span>
                      </div>
                    </div>

                    {isAuthenticated && (
                      <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50">
                        <h3 className="font-black mb-4">Rate This Event</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-semibold">Your Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                              >
                                <Star
                                  className={`w-8 h-8 ${
                                    star <= (hoverRating || newRating)
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                          {newRating > 0 && (
                            <span className="text-sm text-gray-600 ml-2">
                              {newRating} {newRating === 1 ? 'star' : 'stars'}
                            </span>
                          )}
                        </div>

                        <Textarea
                          placeholder="Share your experience with this event..."
                          value={newReview}
                          onChange={(e) => setNewReview(e.target.value)}
                          className="mb-4 min-h-24"
                        />
                        
                        <Button
                          onClick={handleSubmitReview}
                          disabled={!newRating || !newReview.trim()}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Submit Review
                        </Button>
                      </Card>
                    )}

                    {!isAuthenticated && (
                      <Alert className="mb-6">
                        <AlertDescription>
                          Please <Link to="/login" className="font-semibold underline">login</Link> to rate and review this event
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No reviews yet. Be the first to review this event!</p>
                        </Card>
                      ) : (
                        reviews.map((review) => (
                          <Card key={review._id} className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={review.user.profilePic} />
                                <AvatarFallback>
                                  {review.user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-black">{review.user.name}</h4>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                            key={star}
                                            className={`w-4 h-4 ${
                                              star <= review.rating
                                                ? 'fill-yellow-500 text-yellow-500'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="text-gray-500">
                                    <ThumbsUp className="w-4 h-4 mr-1" />
                                    {review.likes}
                                  </Button>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="p-6">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Event Timeline
                  </h2>
                  {event.timeline && event.timeline.length > 0 ? (
                    <div className="space-y-4">
                      {event.timeline.map((item, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">{item.date}</Badge>
                                <Badge variant="outline">{item.time}</Badge>
                              </div>
                              <p className="text-gray-700">{item.message}</p>
                            </div>
                            {isEventOrganizer && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTimelineIndex(idx);
                                  setCheckInDialogOpen(true);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Check-in
                              </Button>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>No timeline available for this event</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="announcements" className="p-6">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Megaphone className="w-6 h-6" />
                    Announcements
                  </h2>
                  {event.announcements && event.announcements.length > 0 ? (
                    <div className="space-y-4">
                      {event.announcements.map((announcement, idx) => (
                        <Card key={idx} className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Megaphone className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-black text-lg mb-1">{announcement.title}</h3>
                              <p className="text-sm text-gray-500 mb-3">{announcement.date}</p>
                              <p className="text-gray-700">{announcement.message}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>No announcements available yet</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="winners" className="p-6">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Winners
                  </h2>
                  {event.winners && event.winners.length > 0 ? (
                    <div className="space-y-4">
                      {event.winners.map((winner, idx) => (
                        <Card key={idx} className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏆'}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-black text-lg mb-2">{winner.name}</h3>
                              {winner.team && winner.team.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {winner.team.map((member, mIdx) => (
                                    <Badge key={mIdx} variant="outline">{member}</Badge>
                                  ))}
                                </div>
                              )}
                              {winner.proof && (
                                <a
                                  href={winner.proof}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-purple-600 hover:underline flex items-center gap-1"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View Proof
                                </a>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>Winners will be announced after the event</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>

                <TabsContent value="chatroom" className="p-6">
                  <Card className="h-[600px] flex flex-col">
                    <div className="p-4 border-b">
                      <h2 className="text-xl font-black flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Event Chatroom
                      </h2>
                      <p className="text-sm text-gray-500">Connect with other participants</p>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {chatMessages.map((msg) => (
                          <div key={msg._id} className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">{msg.sender.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {msg.sender.role}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(msg.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {isAuthenticated ? (
                      <div className="p-4 border-t">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type your message..."
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          />
                          <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-t">
                        <Alert>
                          <AlertDescription>
                            Please <Link to="/login" className="font-semibold underline">login</Link> to participate in the chat
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="registration">
                  <Card className="p-8">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                      <FormInput className="w-6 h-6" />
                      Event Registration
                    </h2>

                    {!isAuthenticated ? (
                      <Alert>
                        <AlertDescription>
                          Please <Link to="/login" className="font-semibold underline">login</Link> to register for this event
                        </AlertDescription>
                      </Alert>
                    ) : user?.role !== 'student' ? (
                      <Alert>
                        <AlertDescription>
                          Only students can register for events
                        </AlertDescription>
                      </Alert>
                    ) : isRegistered ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          You are already registered for this event! Check your inbox for confirmation details.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                        {event.config?.registrationType === 'Team' && (
                          <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name *</Label>
                            <Input
                              id="teamName"
                              required
                              placeholder="Enter your team name"
                              onChange={(e) => handleRegistrationFormChange('teamName', e.target.value)}
                            />
                            {event.config.teamSizeRange && (
                              <p className="text-sm text-gray-500">
                                Team size: {event.config.teamSizeRange.min} - {event.config.teamSizeRange.max} members
                              </p>
                            )}
                          </div>
                        )}

                        {event.config?.fees && event.config.fees > 0 && (
                          <div className="space-y-4 border-t pt-4">
                            <div className="flex items-center justify-between">
                              <Label>Registration Fee</Label>
                              <span className="text-2xl font-black">₹{event.config.fees}</span>
                            </div>
                            
                            {event.config.qrCodeUrl && (
                              <div className="flex justify-center py-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                                  <img
                                    src={event.config.qrCodeUrl}
                                    alt="Payment QR Code"
                                    className="w-48 h-48 object-contain"
                                  />
                                </div>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="paymentProof">Upload Payment Proof *</Label>
                              <Input
                                id="paymentProof"
                                type="file"
                                required
                                accept="image/*"
                                onChange={(e) => handleRegistrationFormChange('paymentProof', e.target.files?.[0])}
                              />
                            </div>
                          </div>
                        )}

                        {event.config?.registrationFields?.map((field, idx) => (
                          <div key={idx} className="space-y-2">
                            <Label htmlFor={`field-${idx}`}>
                              {field.title} {field.required && '*'}
                            </Label>
                            {field.description && (
                              <p className="text-sm text-gray-500">{field.description}</p>
                            )}
                            {field.type === 'text' && (
                              <Input
                                id={`field-${idx}`}
                                required={field.required}
                                onChange={(e) => handleRegistrationFormChange(field.title, e.target.value)}
                              />
                            )}
                            {field.type === 'textarea' && (
                              <Textarea
                                id={`field-${idx}`}
                                required={field.required}
                                onChange={(e) => handleRegistrationFormChange(field.title, e.target.value)}
                              />
                            )}
                            {field.type === 'file' && (
                              <Input
                                id={`field-${idx}`}
                                type="file"
                                required={field.required}
                                onChange={(e) => handleRegistrationFormChange(field.title, e.target.files?.[0])}
                              />
                            )}
                          </div>
                        ))}

                        <Button
                          type="submit"
                          disabled={registering || hasClash}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          {registering ? 'Registering...' : 'Register for Event'}
                        </Button>
                      </form>
                    )}
                  </Card>
                </TabsContent>

                <TabsContent value="sponsors" className="p-6">
                  <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Event Sponsors
                  </h2>
                  
                  {eventSponsors.length > 0 ? (
                    <div className="space-y-4">
                      {eventSponsors.map((sponsor) => (
                        <Card key={sponsor._id} className="p-6">
                          <div className="flex items-start gap-4">
                            <img
                              src={sponsor.profile.firmLogo}
                              alt={sponsor.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="font-black text-xl mb-2">{sponsor.name}</h3>
                              <p className="text-gray-600 mb-3">{sponsor.profile.firmDescription}</p>
                              
                              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {sponsor.sponsorDetails.stallLocation}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {sponsor.email}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/sponsors/${sponsor._id}`)}
                                >
                                  <UserIcon className="w-4 h-4 mr-2" />
                                  View Profile
                                </Button>
                                <Button
                                  onClick={() => navigate(`/sponsors/${sponsor._id}`)}
                                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                  <ImageIcon className="w-4 h-4 mr-2" />
                                  View Ads
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>No sponsors for this event yet</AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </Card>

            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-24">
              <div className="space-y-4">
                {event.dateTimeRange && (
                  <>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-semibold">
                          {event.dateTimeRange.startDate 
                            ? new Date(event.dateTimeRange.startDate).toLocaleDateString()
                            : 'TBA'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-semibold">
                          {event.dateTimeRange.startTime && event.dateTimeRange.endTime
                            ? `${event.dateTimeRange.startTime} - ${event.dateTimeRange.endTime}`
                            : 'TBA'}
                        </p>
                      </div>
                    </div>

                    <Separator />
                  </>
                )}

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Registrations</p>
                    <p className="font-semibold">
                      {event.config?.maxCapacity
                        ? `${event.registrationCount || 0} / ${event.config.maxCapacity}`
                        : 'Unlimited'}
                    </p>
                  </div>
                </div>

                {event.config?.fees && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Entry Fee</span>
                      <span className="text-2xl font-black">₹{event.config.fees}</span>
                    </div>
                  </>
                )}
              </div>

              {isStudentView && !isRegistered && (
                <Button
                  onClick={handleRegister}
                  disabled={registering || hasClash}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </Button>
              )}

              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  <Heart className="w-4 h-4 mr-2" />
                  Like
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <BookmarkPlus className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {event.createdBy && (
              <Card className="p-6">
                <h3 className="font-black mb-4">Organized By</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{event.createdBy.name}</p>
                      <p className="text-sm text-gray-500">
                        {event.createdBy.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={checkInDialogOpen} onOpenChange={setCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in to Timeline Event</DialogTitle>
            <DialogDescription>Enter the check-in code to confirm attendance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter check-in code"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={!checkInCode.trim()}>
              Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Event</DialogTitle>
            <DialogDescription>
              Please describe the issue you're reporting. Our team will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the issue..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-32"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={!reportText.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
