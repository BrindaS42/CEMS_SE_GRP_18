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
  Search, // Added
  X,      // Added
  Shield, // Added
  Check   // Added
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Skeleton } from '@/Components/ui/skeleton';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { SegmentedControl } from '@/Components/ui/segmented-control';
import { fetchEventDetails, addEventRating } from '@/Store/studentEvents.slice';
import { createReport } from '@/Store/admin.slice';
import { fetchAllMessages, sendMessage, clearMessages, addMessage } from '@/Store/event.interaction.slice'
import { submitRegistration, getRegistrationStatus, markCheckIn, fetchMyLeadTeams } from '@/Store/registration.slice'
import { toast } from 'sonner';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { socket } from '@/service/socket';
import SponsorAdCarousel from '@/Components/EventComponents/SponsorAdCarousel';
import AnnotatedMapView from '@/Components/EventComponents/Map/AnnotatedMapView';

export const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentEvent: event, loading } = useSelector((state) => state.studentEvents);
  const { messages: chatMessages, status: chatStatus } = useSelector((state) => state.eventInteraction) || { messages: [], status: 'idle' };
  const registrationStatus = useSelector((state) => state.registration.status);
  const { myLeadTeams, teamsLoading } = useSelector((state) => state.registration);
  const announcements = event?.announcements || [];
  const sponsors = event?.sponsors || [];
  const reviews = event?.ratings || [];

  // State for Segmented Control
  const [activeTab, setActiveTab] = useState('overview');

  const [registering, setRegistering] = useState(false);
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [selectedTimelineId, setSelectedTimelineId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [registrationFormData, setRegistrationFormData] = useState({});
  const [customFieldsData, setCustomFieldsData] = useState({});
  const [selectedComboId, setSelectedComboId] = useState(null);
  const [newReview, setNewReview] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportText, setReportText] = useState('');

  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

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
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (!id) return;

    dispatch(fetchEventDetails(id));
    if (user?.role === 'student' && user.id) {
      dispatch(getRegistrationStatus({ eventId: id, participantId: user?.id }));
    }
    // Fetch teams if the user is a student
    if (user?.role === 'student') {
      dispatch(fetchMyLeadTeams());
      console.log("Dispatched fetchMyLeadTeams", myLeadTeams);
    }
    dispatch(fetchAllMessages(id));

    const setupSocketListeners = () => {
      socket.emit('join_room', id);

      const handleReceiveMessage = (newMessage) => {
        if (newMessage.eventId === id) {
          dispatch(addMessage(newMessage));
        }
      };

      socket.on('receive_message', handleReceiveMessage);

      return () => {
        socket.emit('leave_room', id);
        socket.off('receive_message', handleReceiveMessage);
        dispatch(clearMessages());
      };
    };

    if (socket.connected) {
      return setupSocketListeners();
    } else {
      const onConnect = () => {
        socket.off('connect', onConnect);
        return setupSocketListeners();
      };
      socket.on('connect', onConnect);
      return () => socket.off('connect', onConnect);
    }
  }, [id, dispatch, user?.id, user?.role]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      return;
    }

    setRegistering(true);
    try {
      const selectedTeam = myLeadTeams.find(team => team._id === registrationFormData.teamId);

      const finalRegistrationData = {
        ...registrationFormData,
        eventId: id,
        teamName: selectedTeam?.teamName,
        comboId: selectedComboId,
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
    } catch (error) {
      toast.error(error || 'Invalid check-in code or failed to check in.');
    }
  };

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
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-3xl dark:bg-gray-800" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full dark:bg-gray-800" />
            </div>
            <Skeleton className="h-64 w-full dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 transition-colors duration-300">
        <div className="text-center">
          <Calendar className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-2xl font-black mb-2 dark:text-white">Event Not Found</h2>
          <Button asChild>
            <Link to="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    );
  }

  console.log("Event details loaded:", event);
  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild className="dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
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
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700 overflow-x-auto">
                <div className="min-w-max">
                  <SegmentedControl
                    options={[
                      { value: 'overview', label: 'Overview' },
                      { value: 'timeline', label: 'Timeline' },
                      { value: 'announcements', label: 'Announcements' },
                      { value: 'chatroom', label: 'Chatroom' },
                      { value: 'registration', label: 'Register' },
                      { value: 'sponsors', label: 'Sponsors' },
                      { value: 'map', label: 'Map' },
                    ]}
                    value={activeTab}
                    onChange={setActiveTab}
                    variant="student"
                  />
                </div>
              </div>

              <div className="tab-transition">
                {activeTab === 'overview' && (
                  <div className="p-6 space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-2xl font-black mb-4 dark:text-white">About This Event</h2>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>

                    {event.subEvents && event.subEvents.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                          <Trophy className="w-6 h-6" />
                          Sub Events
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          {event.subEvents.map((subEventItem, idx) => (
                            <Card key={idx} className="p-4 space-y-2 dark:bg-gray-700 dark:border-gray-600">
                              <h3 className="font-black mb-2 dark:text-white">{subEventItem.subevent?.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{subEventItem.subevent?.description}</p>
                              {subEventItem.subevent?.timeline?.[0] && (
                                <p className="text-xs text-muted-foreground dark:text-gray-500">
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
                        <h2 className="text-2xl font-black mb-4 flex items-center gap-2 dark:text-white">
                          <MapPin className="w-6 h-6" />
                          Venue Information
                        </h2>
                        <Card className="p-6 dark:bg-gray-700 dark:border-gray-600">
                          <p className="text-gray-700 dark:text-gray-300 mb-4">{event.venue}</p>
                        </Card>
                      </div>
                    )}

                    {event.poc && (
                      <div>
                        <h2 className="text-2xl font-black mb-4 dark:text-white">Points of Contact</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="p-4 dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-black dark:text-white">{event.poc.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Organizer</p>
                              </div>
                            </div>
                            <div className="space-y-2 text-sm">
                              {event.poc.contact && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                  <Phone className="w-4 h-4" />
                                  {event.poc.contact}
                                </div>
                              )}
                              {event.poc.email && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
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
                        <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white">
                          <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                          Reviews & Ratings
                        </h2>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black dark:text-white">{averageRating}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${star <= Math.round(parseFloat(averageRating))
                                  ? 'fill-yellow-500 text-yellow-500'
                                  : 'text-gray-300 dark:text-gray-600'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-500 dark:text-gray-400">({reviews.length} reviews)</span>
                        </div>
                      </div>

                      {isAuthenticated && (
                        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-900/50">
                          <h3 className="font-black mb-4 dark:text-white">Rate This Event</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-sm font-semibold dark:text-gray-300">Your Rating:</span>
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
                                    className={`w-8 h-8 ${star <= (hoverRating || newRating)
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                  />
                                </button>
                              ))}
                            </div>
                            {newRating > 0 && (
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {newRating} {newRating === 1 ? 'star' : 'stars'}
                              </span>
                            )}
                          </div>

                          <Textarea
                            placeholder="Share your experience with this event..."
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            className="mb-4 min-h-24 dark:bg-gray-900 dark:border-gray-700"
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
                        <Alert className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                          <AlertDescription className="dark:text-gray-300">
                            Please <Link to="/login" className="font-semibold underline">login</Link> to rate and review this event
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-4">
                        {reviews.length === 0 ? (
                          <Card className="p-8 text-center text-gray-500 dark:bg-gray-800 dark:border-gray-700">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                            <p className="dark:text-gray-400">No reviews yet. Be the first to review this event!</p>
                          </Card>
                        ) : (
                          reviews.map((review) => (
                            <Card key={review._id} className="p-6 dark:bg-gray-800 dark:border-gray-700">
                              <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12 border-2 border-purple-200 dark:border-purple-800">
                                  <AvatarImage src={review.by?.profile?.profilePic} />
                                  <AvatarFallback>
                                    {review.by?.profile?.name?.charAt(0).toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <h4 className="font-black dark:text-white">{review.by?.profile?.name || 'Anonymous'}</h4>
                                      <div className="flex items-center gap-2">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                              key={star}
                                              className={`w-4 h-4 ${star <= review.rating
                                                ? 'fill-yellow-500 text-yellow-500'
                                                : 'text-gray-300 dark:text-gray-600'
                                                }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                          {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.review}</p>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="p-6 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                      <Clock className="w-6 h-6" />
                      Event Timeline
                    </h2>
                    {event.timeline && event.timeline.length > 0 ? (
                      <div className="space-y-4">
                        {event.timeline.map((item, idx) => (
                          <Card key={idx} className="p-4 dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-500">{new Date(item.date).toLocaleDateString()}</Badge>
                                  <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-500">{item.duration.from} - {item.duration.to}</Badge>
                                </div>
                                <h4 className="font-semibold dark:text-white">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                              </div>
                              {isEventOrganizer && item.checkInRequired && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTimelineId(item._id);
                                    setCheckInDialogOpen(true);
                                  }}
                                  className="dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600"
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
                      <Alert className="dark:bg-gray-700 dark:border-gray-600">
                        <AlertDescription className="dark:text-gray-300">No timeline available for this event</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {activeTab === 'announcements' && (
                  <div className="p-6 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                      <Megaphone className="w-6 h-6" />
                      Announcements
                    </h2>
                    {announcements.length > 0 ? (
                      <div className="space-y-4">
                        {announcements.map((announcement) => (
                          <Card key={announcement._id} className="p-6 dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Megaphone className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                  {new Date(announcement.date).toLocaleDateString()} at {announcement.time}
                                </p>
                                <p className="text-gray-700 dark:text-gray-300">{announcement.message}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert className="dark:bg-gray-700 dark:border-gray-600">
                        <AlertDescription className="dark:text-gray-300">No announcements available yet</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {activeTab === 'chatroom' && (
                  <div className="p-6 animate-fade-in">
                    <Card className="h-[600px] flex flex-col dark:bg-gray-800 dark:border-gray-700">
                      <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="text-xl font-black flex items-center gap-2 dark:text-white">
                          <MessageSquare className="w-5 h-5" />
                          Event Chatroom
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect with other participants</p>
                      </div>

                      <ScrollArea className="flex-1 p-4 overflow-hidden">
                        <div className="space-y-4">
                          {(chatMessages || []).map((msg) => (
                            <div
                              key={msg._id}
                              className={`flex items-start gap-3 ${msg.sender?._id === user.id ? 'justify-end' : ''}`}
                            >
                              {msg.sender?._id !== user.id && (
                                <Avatar className="w-8 h-8 border-2 border-purple-200 dark:border-purple-800">
                                  <AvatarFallback>{msg.sender?.profile?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className={`flex-1 max-w-xs md:max-w-md ${msg.sender?._id === user.id ? 'text-right' : ''}`}>
                                <div className={`flex items-center gap-2 mb-1 ${msg.sender?._id === user.id ? 'justify-end' : ''}`}>
                                  <span className="font-semibold text-sm dark:text-gray-300">{msg.sender?.profile?.name || 'User'}</span>
                                  {msg.sender?.role && (
                                    <Badge variant="outline" className="text-xs capitalize dark:text-gray-400 dark:border-gray-600">
                                      {msg.sender.role}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500 dark:text-gray-500">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`p-3 rounded-lg ${msg.sender?._id === user.id ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-200'}`}>
                                  <p className="text-sm">{msg.message}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={chatEndRef} />
                        </div>
                      </ScrollArea>

                      {isAuthenticated ? (
                        <div className="p-4 border-t dark:border-gray-700">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Type your message..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              className="dark:bg-gray-900 dark:border-gray-600"
                            />
                            <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border-t dark:border-gray-700">
                          <Alert className="dark:bg-gray-900 dark:border-gray-600">
                            <AlertDescription className="dark:text-gray-300">
                              Please <Link to="/login" className="font-semibold underline">login</Link> to participate in the chat
                            </AlertDescription>
                          </Alert>
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {activeTab === 'registration' && (
                  <div className="p-6 animate-fade-in">
                    <Card className="p-8 dark:bg-gray-800 dark:border-gray-700">
                      <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                        <FormInput className="w-6 h-6" />
                        Event Registration
                      </h2>

                      {!isAuthenticated ? (
                        <Alert className="dark:bg-gray-700 dark:border-gray-600">
                          <AlertDescription className="dark:text-gray-300">
                            Please <Link to="/login" className="font-semibold underline">login</Link> to register for this event
                          </AlertDescription>
                        </Alert>
                      ) : user?.role !== 'student' ? (
                        <Alert className="dark:bg-gray-700 dark:border-gray-600">
                          <AlertDescription className="dark:text-gray-300">
                            Only students can register for events
                          </AlertDescription>
                        </Alert>
                      ) : registrationStatus ? (
                        <div className="text-center p-4 border border-dashed rounded-lg dark:border-gray-600">
                          {registrationStatus.registrationStatus === 'confirmed' && (
                            <>
                              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                              <h3 className="text-xl font-bold dark:text-white">You are Registered!</h3>
                              <p className="text-muted-foreground dark:text-gray-400">Your registration is confirmed. Your check-in code will be sent to your inbox.</p>
                            </>
                          )}
                          {registrationStatus.registrationStatus === 'pending' && (
                            <>
                              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                              <h3 className="text-xl font-bold dark:text-white">Registration Pending</h3>
                              <p className="text-muted-foreground dark:text-gray-400">Your registration is awaiting approval from the organizers.</p>
                            </>
                          )}
                          {registrationStatus.registrationStatus === 'cancelled' && (
                            <>
                              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                              <h3 className="text-xl font-bold dark:text-white">Registration Cancelled</h3>
                              <p className="text-muted-foreground dark:text-gray-400">Your registration for this event has been cancelled.</p>
                            </>
                          )}
                          <p className="text-sm mt-4 dark:text-gray-300">Payment Status: <Badge variant="outline" className="dark:text-gray-300 dark:border-gray-500">{registrationStatus.paymentStatus}</Badge></p>
                        </div>
                      ) : (
                        <form onSubmit={handleRegistrationSubmit} className="space-y-6">

                          {event.config?.combos && event.config?.combos?.length > 0 && (
                            <div className="space-y-4 pt-4">
                              <Label className="dark:text-gray-300">Select a Plan</Label>
                              <div className="grid md:grid-cols-2 gap-4">
                                {event.config.combos.map((combo) => (
                                  <div
                                    key={combo._id}
                                    onClick={() => setSelectedComboId(combo._id)}
                                    className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${selectedComboId === combo._id
                                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500'
                                      : 'border-gray-200 hover:border-purple-300 dark:border-gray-700 dark:hover:border-purple-700'
                                      }`}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: combo.color || '#888' }}
                                        />
                                        <span className="font-bold dark:text-white">{combo.title}</span>
                                      </div>
                                      {selectedComboId === combo._id && (
                                        <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                                      {combo.description}
                                    </p>
                                    <div className="font-black text-lg dark:text-white">
                                      ₹{combo.fees}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {event?.config?.registrationType === 'Team' && (
                            <div className="space-y-4">
                              <Label className="dark:text-gray-300">Select Your Team *</Label>

                              {(() => {
                                const selectedTeamId = registrationFormData.teamId;
                                const selectedTeam = myLeadTeams.find(t => t._id === selectedTeamId);

                                // 1. STATE: NO TEAM SELECTED - SHOW SEARCH INPUT
                                if (!selectedTeam) {
                                  // ... inside the registration tab render logic

                                  const filteredTeams = myLeadTeams.filter(team =>
                                    // FIX: Added (team.name || '') to prevent crash if name is missing
                                    (team?.teamName || '').toLowerCase().includes(teamSearchQuery.toLowerCase())
                                  );

                                  return (
                                    <div className="relative">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <Input
                                          placeholder="Search for your team..."
                                          value={teamSearchQuery}
                                          onChange={(e) => {
                                            setTeamSearchQuery(e.target.value);
                                            setShowTeamDropdown(true);
                                          }}
                                          onFocus={() => setShowTeamDropdown(true)}
                                          className="pl-10 dark:bg-gray-900 dark:border-gray-600"
                                        />
                                      </div>

                                      <AnimatePresence>
                                        {showTeamDropdown && teamSearchQuery && (
                                          <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                                          >
                                            {teamsLoading ? (
                                              <div className="p-4 text-center text-sm text-gray-500">Loading teams...</div>
                                            ) : filteredTeams.length > 0 ? (
                                              filteredTeams.map((team) => (
                                                <button
                                                  key={team._id}
                                                  type="button"
                                                  onClick={() => {
                                                    handleRegistrationFormChange('teamId', team._id);
                                                    setTeamSearchQuery('');
                                                    setShowTeamDropdown(false);
                                                  }}
                                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 border-b last:border-0 dark:border-gray-700"
                                                >
                                                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 flex items-center justify-center text-xs font-bold">
                                                    {team.teamName.substring(0, 2).toUpperCase()}
                                                  </div>
                                                  <div className="flex-1">
                                                    <p className="text-sm font-semibold dark:text-gray-200">{team.teamName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                      {team.members?.length || 0} members
                                                    </p>
                                                  </div>
                                                </button>
                                              ))
                                            ) : (
                                              <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No teams found matching "{teamSearchQuery}"
                                              </div>
                                            )}
                                          </motion.div>
                                        )}
                                      </AnimatePresence>

                                      {myLeadTeams.length === 0 && !teamsLoading && (
                                        <p className="text-xs text-red-500 mt-2">
                                          You don't lead any teams. Please create a team first.
                                        </p>
                                      )}
                                    </div>
                                  );
                                }

                                return (
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-center justify-between group"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {selectedTeam.teamName.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-gray-900 dark:text-white">{selectedTeam.teamName}</h4>
                                          <Badge variant="secondary" className="text-xs bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Selected
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                          {selectedTeam.members?.length} Members • Leader: You
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRegistrationFormChange('teamId', null)}
                                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                      <X className="w-5 h-5" />
                                    </Button>
                                  </motion.div>
                                );
                              })()}

                              {event?.config?.teamSizeRange && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border dark:border-gray-700">
                                  <Users className="w-4 h-4" />
                                  <span>Required Team Size: <span className="font-semibold text-gray-700 dark:text-gray-300">{event.config.teamSizeRange.min} - {event.config.teamSizeRange.max} members</span></span>
                                </div>
                              )}
                            </div>
                          )}

                          {event?.config?.isfree==="false" && (
                            <div className="space-y-4 border-t pt-4 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <Label className="dark:text-gray-300">Registration Fee</Label>
                                <span className="text-3xl font-black text-purple-600 dark:text-purple-400">
                                  ₹
                                  {(() => {
                                    // Dynamic Fee Calculation
                                    if (selectedComboId) {
                                      const combo = event.config.combos.find(c => c._id === selectedComboId);
                                      return combo ? combo.fees : event.config.fees;
                                    }
                                    return event.config.fees;
                                  })()}
                                </span>
                              </div>

                              {event.config.qrCodeUrl && (
                                <div className="flex justify-center py-4">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 dark:border-gray-600">
                                    <img
                                      src={event.config.qrCodeUrl}
                                      alt="Payment QR Code"
                                      className="w-48 h-48 object-contain"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="paymentProof" className="dark:text-gray-300">Upload Payment Proof *</Label>
                                <Input
                                  id="paymentProof"
                                  type="url"
                                  required
                                  placeholder="https://your-payment-proof-url.com/image.jpg"
                                  onChange={(e) => handleRegistrationFormChange('paymentProof', e.target.value)}
                                  className="dark:bg-gray-900 dark:border-gray-600"
                                />
                              </div>
                            </div>
                          )}

                          {event?.config?.registrationFields?.map((field, idx) => (
                            <div key={idx} className="space-y-2">
                              <Label htmlFor={`field-${idx}`} className="dark:text-gray-300">
                                {field.title} {field.required && '*'}
                              </Label>
                              {field.description && <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>}
                              {field.inputType === 'text' && (
                                <Input
                                  id={`field-${idx}`}
                                  required={field.required}
                                  onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                                  className="dark:bg-gray-900 dark:border-gray-600"
                                />
                              )}
                              {field.inputType === 'textarea' && (
                                <Textarea
                                  id={`field-${idx}`}
                                  required={field.required}
                                  onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                                  className="dark:bg-gray-900 dark:border-gray-600"
                                />
                              )}
                              {['number', 'date', 'time'].includes(field.inputType) && (
                                <Input
                                  id={`field-${idx}`}
                                  type={field.inputType}
                                  required={field.required}
                                  onChange={(e) => handleCustomFieldChange(field.title, e.target.value)}
                                  className="dark:bg-gray-900 dark:border-gray-600"
                                />
                              )}
                              {field.inputType === 'file' && (
                                <Input
                                  id={`field-${idx}`}
                                  type="file"
                                  required={field.required}
                                  onChange={(e) => handleRegistrationFormChange(field.title, e.target.files?.[0])}
                                  className="dark:bg-gray-900 dark:border-gray-600"
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
                  </div>
                )}

                {activeTab === 'sponsors' && (
                  <div className="p-6 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                      <Building2 className="w-6 h-6" />
                      Event Sponsors
                    </h2>

                    {sponsors.length > 0 ? (
                      <div className="space-y-4">
                        {sponsors.map((sponsor) => (
                          <Card key={sponsor.sponsor?._id} className="p-6 dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex items-start gap-4">
                              <img
                                src={sponsor.sponsor?.profile?.firmLogo}
                                alt={sponsor.sponsor?.profile?.name}
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <h3 className="font-black text-xl mb-2 dark:text-white">{sponsor.sponsor?.profile?.name}</h3>
                                <p className="text-gray-600 mb-3 dark:text-gray-300">{sponsor.sponsor?.profile?.firmDescription}</p>

                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                                    className="dark:text-gray-300 dark:border-gray-500 dark:hover:bg-gray-600"
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
                      <Alert className="dark:bg-gray-700 dark:border-gray-600">
                        <AlertDescription className="dark:text-gray-300">No sponsors for this event yet</AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {activeTab === 'map' && (
                  <div className="p-6 animate-fade-in">
                    <h2 className="text-2xl font-black mb-6 flex items-center gap-2 dark:text-white">
                      <MapPin className="w-6 h-6" />
                      Event Map
                    </h2>
                    <Card className="overflow-hidden dark:border-gray-600">
                      <AnnotatedMapView eventId={id} />
                    </Card>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-center pt-6">
              <Button
                variant="outline"
                onClick={() => setReportDialogOpen(true)}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6 sticky top-24 dark:bg-gray-800 dark:border-gray-700">
              <div className="space-y-4">
                {event.timeline?.[0] && (
                  <>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Starts On</p>
                        <p className="font-semibold dark:text-white">
                          {new Date(event.timeline[0].date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />
                  </>
                )}

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Registrations</p>
                    <p className="font-semibold dark:text-white">{event.registrations?.length || 0}</p>
                  </div>
                </div>

                {event.config?.fees && (
                  <>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Entry Fee</span>
                      <span className="text-2xl font-black dark:text-white">₹{event.config.fees}</span>
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
              <Card className="p-6 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="font-black mb-4 dark:text-white">Organized By</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold dark:text-white">{event.createdBy.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Check-in to Timeline Event</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Enter the check-in code to confirm attendance</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter check-in code"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInDialogOpen(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button onClick={handleCheckIn} disabled={!checkInCode.trim()}>
              Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Report Event</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Please describe the issue you're reporting. Our team will review it shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the issue..."
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="min-h-32 dark:bg-gray-900 dark:border-gray-600"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)} className="dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700">
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