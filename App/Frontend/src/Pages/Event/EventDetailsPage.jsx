import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Heart,
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
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fetchEventDetails, addEventRating } from '@/store/studentEvents.slice';
import { createReport } from '@/store/admin.slice';
import { fetchAllMessages, sendMessage, clearMessages, addMessage } from '@/store/event.interaction.slice';
import { submitRegistration, getRegistrationStatus, markCheckIn } from '@/store/registration.slice';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { socket } from '@/service/socket';
import SponsorAdCarousel from '@/components/EventComponents/SponsorAdCarousel';
import AnnotatedMapView from '@/components/EventComponents/Map/AnnotatedMapView';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentEvent: event, loading } = useSelector((state) => state.studentEvents);
  const { messages: chatMessages, status: chatStatus } = useSelector((state) => state.eventInteraction) || { messages: [], status: 'idle' };
  const { status: registrationStatus } = useSelector((state) => state.registration);
  const announcements = event?.announcements || [];
  const sponsors = event?.sponsors || [];
  const reviews = event?.ratings || [];
  console.log("event:", event);
  const [registering, setRegistering] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [registrationFormData, setRegistrationFormData] = useState({});
  const [customFieldsData, setCustomFieldsData] = useState({});
  
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const chatEndRef = useRef(null);

  const isStudentView = user?.role === 'student';
  const isOrganizerView = user?.role === 'organizer';
  const isEventOrganizer = useMemo(() => {
    if (!event || !user || !event.createdBy) return false;
    const team = event.createdBy;
    if (team.leader?._id === user.id) return true;
    return team.members?.some(m => m.user?._id === user.id && m.status === 'Approved');
  }, [event, user]);

  useEffect(() => {
    // Scroll to the bottom of the chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // In EventDetailsPage.jsx - Replace the socket setup useEffect

useEffect(() => {
  if (!id) return;

  dispatch(fetchEventDetails(id));
  if (user?.role === 'student' && user.id) {
    dispatch(getRegistrationStatus({ eventId: id, participantId: user?.id }));
  }
  dispatch(fetchAllMessages(id));

  console.log('[EventDetailsPage] 🔌 Socket connected?', socket.connected);
  console.log('[EventDetailsPage] 🔌 Socket ID:', socket.id);

  // ===== WAIT for socket to be ready =====
  const setupSocketListeners = () => {
    console.log(`[EventDetailsPage] ✅ Setting up socket listeners for room: ${id}`);

    // Join room
    socket.emit('join_room', id);
    console.log(`[EventDetailsPage] 📤 Emitted join_room for: ${id}`);

    // Setup message listener
    const handleReceiveMessage = (newMessage) => {
      console.log('[EventDetailsPage] 📥 ===== RECEIVED MESSAGE =====');
      console.log('[EventDetailsPage] 📥 Message:', newMessage);
      console.log('[EventDetailsPage] 📥 EventId match?', newMessage.eventId === id);

      if (newMessage.eventId === id) {
        console.log('[EventDetailsPage] ✅ Message is for this event, dispatching...');
        dispatch(addMessage(newMessage));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    console.log(`[EventDetailsPage] ✅ Listener 'receive_message' registered`);

    // Cleanup
    return () => {
      console.log(`[EventDetailsPage] 🧹 Cleanup: leaving room ${id}`);
      socket.emit('leave_room', id);
      socket.off('receive_message', handleReceiveMessage);
      dispatch(clearMessages());
    };
  };

  // If socket is already connected, setup immediately
  if (socket.connected) {
    console.log('[EventDetailsPage] 🟢 Socket already connected, setting up now');
    return setupSocketListeners();
  } else {
    // Wait for socket to connect
    console.log('[EventDetailsPage] 🟡 Socket not connected yet, waiting...');
    const onConnect = () => {
      console.log('[EventDetailsPage] 🟢 Socket just connected, setting up now');
      socket.off('connect', onConnect); // Remove this listener
      return setupSocketListeners();
    };
    socket.on('connect', onConnect);

    return () => {
      socket.off('connect', onConnect);
    };
  }
}, [id, dispatch, user?.id]); // Add user?.id to dependencies

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      return;
    }

    setRegistering(true);
    try {
      const finalRegistrationData = {
        ...registrationFormData,
        eventId: id,
        registrationData: event.config.registrationFields.map(field => ({
          question: field.title,
          answer: customFieldsData[field.title] || ''
        }))
      };
      await dispatch(submitRegistration(finalRegistrationData)).unwrap();
      toast.success('Registration successful! Check your inbox for confirmation.');
      dispatch(getRegistrationStatus({ eventId: id, participantId: user.id }));
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

  const handleCustomFieldChange = (fieldTitle, value) => {
    setCustomFieldsData((prev) => ({
      ...prev,
      [fieldTitle]: value,
    }));
  };

  const handleCheckIn = async () => {
    if (!checkInCode.trim() || !selectedTimelineId) return;
    try {
      await dispatch(markCheckIn({ checkInCode, timelineRef: selectedTimelineId })).unwrap();
      toast.success('Checked in successfully!');
      setCheckInDialogOpen(false);
      setCheckInCode('');
      setSelectedTimelineId(null);
      // Optionally re-fetch data if needed, but for now, UI feedback is enough.
    } catch (error) {
      toast.error(error || 'Invalid check-in code or failed to check in.');
    }
  };

  console.log("chatMessages:", chatMessages);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await dispatch(sendMessage({ eventId: id, message: chatMessage })).unwrap();
      setChatMessage('');
    } catch (error) {
      toast.error(error || 'Failed to send message');
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

    dispatch(addEventRating({ eventId: id, rating: { rating: newRating, review: newReview } }))
      .unwrap()
      .then(() => {
        toast.success('Review submitted successfully!');
        setNewRating(0);
        setNewReview('');
      })
      .catch((err) => toast.error(err || 'Failed to submit review'));
  };

  const handleSubmitReport = async () => {
    if (!reportText.trim()) return;

    try {
      await dispatch(createReport({ modelType: 'event', id, reason: reportText })).unwrap();
      toast.success('Report submitted successfully. We will review it shortly.');
      setReportDialogOpen(false);
      setReportText('');
    } catch (error) {
      toast.error(error || 'Failed to submit report');
    }
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
            src={event.posterUrl || event.gallery?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                {event.categoryTags?.[0] || 'General'}
              </Badge>
              {event.config?.registrationType && (
                <Badge variant="outline" className="text-white border-white">
                  {event.config.registrationType}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-2">{event.title}</h1>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full grid grid-cols-7 lg:grid-cols-7">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="announcements">Announcements</TabsTrigger>
                  <TabsTrigger value="chatroom">Chatroom</TabsTrigger>
                  <TabsTrigger value="registration">Register</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                  <TabsTrigger value="map">Map</TabsTrigger>
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
                        {event.subEvents.map((subEventItem, idx) => (
                          <Card key={idx} className="p-4 space-y-2">
                            <h3 className="font-black mb-2">{subEventItem.subevent?.title}</h3>
                            <p className="text-sm text-gray-600">{subEventItem.subevent?.description}</p>
                            {subEventItem.subevent?.timeline?.[0] && (
                               <p className="text-xs text-muted-foreground">
                                Date: {new Date(subEventItem.subevent.timeline[0].date).toLocaleDateString()}
                               </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.venue && (
                    <div>
                      <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                        <MapPin className="w-6 h-6" />
                        Venue Information
                      </h2>
                      <Card className="p-6">
                        <p className="text-gray-700 mb-4">{event.venue}</p>
                      </Card>
                    </div>
                  )}

                  {event.poc && (
                    <div>
                      <h2 className="text-2xl font-black mb-4">Points of Contact</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                          <Card className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-black">{event.poc.name}</h3>
                                <p className="text-sm text-gray-500">Organizer</p>
                               </div>
                             </div>
                             <div className="space-y-2 text-sm">
                               {event.poc.contact && (
                                 <div className="flex items-center gap-2 text-gray-600">
                                   <Phone className="w-4 h-4" />
                                   {event.poc.contact}
                                 </div>
                               )}
                               {event.poc.email && (
                                 <div className="flex items-center gap-2 text-gray-600">
                                   <Mail className="w-4 h-4" />
                                   {event.poc.email}
                                 </div>
                               )}
                             </div>
                           </Card>
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
                              <Avatar className="w-12 h-12 border-2 border-purple-200">
                                <AvatarImage src={review.by?.profile?.profilePic} />
                                <AvatarFallback>
                                  {review.by?.profile?.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-black">{review.by?.profile?.name || 'Anonymous'}</h4>
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
                                </div>
                                <p className="text-gray-700 leading-relaxed">{review.review}</p>
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
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge variant="outline">{new Date(item.date).toLocaleDateString()}</Badge>
                                <Badge variant="outline">{item.duration.from} - {item.duration.to}</Badge>
                              </div>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            {isEventOrganizer && item.checkInRequired && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedTimelineId(item._id);
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
                  {announcements.length > 0 ? (
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <Card key={announcement._id} className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Megaphone className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-3">
                                {new Date(announcement.date).toLocaleDateString()} at {announcement.time}
                              </p>
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

                <TabsContent value="chatroom" className="p-6">
                  <Card className="h-[600px] flex flex-col">
                    <div className="p-4 border-b">
                      <h2 className="text-xl font-black flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Event Chatroom
                      </h2>
                      <p className="text-sm text-gray-500">Connect with other participants</p>
                    </div>

                    <ScrollArea className="flex-1 p-4 overflow-hidden">
                      <div className="space-y-4">
                        {(chatMessages || []).map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex items-start gap-3 ${msg.sender?._id === user.id ? 'justify-end' : ''}`}
                          >
                            {msg.sender?._id !== user.id && (
                              <Avatar className="w-8 h-8 border-2 border-purple-200">
                                <AvatarFallback>{msg.sender?.profile?.name?.charAt(0) || '?'}</AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`flex-1 max-w-xs md:max-w-md ${msg.sender?._id === user.id ? 'text-right' : ''}`}>
                              <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user.id ? 'justify-end' : ''}`}>
                                <span className="font-semibold text-sm">{msg.sender?.profile?.name || 'User'}</span>
                                {msg.sender?.role && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {msg.sender.role}
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className={`p-3 rounded-lg ${msg.sender?._id === user.id ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                                <p className="text-sm">{msg.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
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
                    ) : registrationStatus ? (
                      <div className="text-center p-4 border border-dashed rounded-lg">
                        {registrationStatus.registrationStatus === 'confirmed' && (
                          <>
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">You are Registered!</h3>
                            <p className="text-muted-foreground">Your registration is confirmed. Your check-in code will be sent to your inbox.</p>
                          </>
                        )}
                        {registrationStatus.registrationStatus === 'pending' && (
                          <>
                            <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Registration Pending</h3>
                            <p className="text-muted-foreground">Your registration is awaiting approval from the organizers.</p>
                          </>
                        )}
                        {registrationStatus.registrationStatus === 'cancelled' && (
                          <>
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold">Registration Cancelled</h3>
                            <p className="text-muted-foreground">Your registration for this event has been cancelled.</p>
                          </>
                        )}
                        <p className="text-sm mt-4">Payment Status: <Badge variant="outline">{registrationStatus.paymentStatus}</Badge></p>
                      </div>
                    ) : (                      
                      <form onSubmit={handleRegistrationSubmit} className="space-y-6">                        
                        {event?.config?.registrationType === 'Team' && (
                          <div className="space-y-2">
                            <Label htmlFor="teamName">Team Name *</Label>
                            <Input
                              id="teamName"
                              required
                              placeholder="Enter your team name"
                              onChange={(e) => handleRegistrationFormChange('teamName', e.target.value)}
                            />
                            {event?.config?.teamSizeRange && (
                              <p className="text-sm text-gray-500">
                                Team size: {event.config.teamSizeRange.min} - {event.config.teamSizeRange.max} members
                              </p>
                            )}
                          </div>
                        )}

                        {event?.config?.fees > 0 && (
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
                                type="url"
                                required
                                placeholder="https://your-payment-proof-url.com/image.jpg"
                                onChange={(e) => handleRegistrationFormChange('paymentProof', e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {event?.config?.registrationFields?.map((field, idx) => (
                          <div key={idx} className="space-y-2">
                            <Label htmlFor={`field-${idx}`}>
                              {field.title} {field.required && '*'}
                            </Label>
                            {field.description && <p className="text-sm text-gray-500">{field.description}</p>}
                            {field.inputType === 'text' && (
                              <Input
                                id={`field-${idx}`}
                                required={field.required}
                                onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                              />
                            )}
                            {field.inputType === 'textarea' && (
                              <Textarea
                                id={`field-${idx}`}
                                required={field.required}
                                onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                              />
                            )}
                            {['number', 'date', 'time'].includes(field.inputType) && (
                              <Input id={`field-${idx}`} type={field.inputType} required={field.required} onChange={(e) => handleCustomFieldChange(field.title, e.target.value)} />
                            )}
                            {field.inputType === 'file' && (
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
                          disabled={registering}
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
                  
                  {sponsors.length > 0 ? (
                    <div className="space-y-4">
                      {sponsors.map((sponsor) => (
                        <Card key={sponsor.sponsor?._id} className="p-6">
                          <div className="flex items-start gap-4">
                            <img
                              src={sponsor.sponsor?.profile?.firmLogo}
                              alt={sponsor.sponsor?.profile?.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h3 className="font-black text-xl mb-2">{sponsor.sponsor?.profile?.name}</h3>
                              <p className="text-gray-600 mb-3">{sponsor.sponsor?.profile?.firmDescription}</p>
                              
                              <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {sponsor.sponsor?.sponsorDetails?.stallLocation || 'N/A'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Mail className="w-4 h-4" />
                                  {sponsor.sponsor?.email}
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => navigate(`/sponsors/${sponsor.sponsor?._id}`)}
                                >
                                  <UserIcon className="w-4 h-4 mr-2" />
                                  View Profile
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

                <TabsContent value="map" className="p-6">
                   <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6" />
                    Event Map
                  </h2>
                  <Card className="overflow-hidden">
                    <AnnotatedMapView eventId={id} />
                  </Card>
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
                {event.timeline?.[0] && (
                  <>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Starts On</p>
                        <p className="font-semibold">
                          {new Date(event.timeline[0].date).toLocaleDateString()}
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
                    <p className="font-semibold">{event.registrations?.length || 0}</p>
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

              {isStudentView && registrationStatus?.registrationStatus !== 'confirmed' && (
                <Button
                  disabled={registering}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </Button>
              )}

            </Card>

            <SponsorAdCarousel sponsors={sponsors} />

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
