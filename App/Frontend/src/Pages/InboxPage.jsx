import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {motion} from 'motion/react';
import {
  Inbox,
  Mail,
  MailOpen,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Filter,
  Search,
  Trash2,
  Eye,
  Send,
  FileText,
  Edit3,
  Archive,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { messageService } from '../services/messageService';
import { registrationService } from '../services/registrationService';
import { toast } from 'sonner';
import {Sidebar} from '../components/general/Sidebar';


const InboxPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('inbox');

  const handleNavigation = (page) => setActivePage(page);
  const [inboxMessages, setInboxMessages] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [draftMessages, setDraftMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    messageId: null,
  });
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    type: 'message',
    title: '',
    description: '',
    message: '',
    to: '',
    status: 'draft',
  });

  const isOrganizerView = user?.role === 'organizer';
  const isStudentView = user?.role === 'student';

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const mockInbox = [
        {
          _id: '1',
          type: 'registration_approval',
          title: 'Registration Approved',
          description: 'Your registration for TechFest 2024 has been approved',
          message: 'Congratulations! Your registration has been approved. Please check your email for further details.',
          from: { _id: 'org1', username: 'organizer1', email: 'org@example.com' },
          to: { _id: user?._id || 'user1', username: user?.username, email: user?.email },
          status: 'sent',
          approvalStatus: 'approved',
          createdAt: new Date(Date.now() - 3600000),
        },
        {
          _id: '2',
          type: 'team_invite',
          title: 'Team Invitation',
          description: 'You have been invited to join a team',
          message: 'You have been invited to join team "Code Warriors" for the upcoming hackathon.',
          from: { _id: 'user2', username: 'john_doe', email: 'john@example.com' },
          to: { _id: user?._id || 'user1', username: user?.username, email: user?.email },
          status: 'sent',
          approvalStatus: 'pending',
          createdAt: new Date(Date.now() - 7200000),
        },
      ];

      const mockSent = [
        {
          _id: '3',
          type: 'sponsorship_request',
          title: 'Sponsorship Request for Annual Fest',
          description: 'Request for sponsorship',
          message: 'We would like to request sponsorship for our annual college fest.',
          from: { _id: user?._id || 'user1', username: user?.username, email: user?.email },
          to: { _id: 'sponsor1', username: 'techcorp', email: 'sponsor@techcorp.com' },
          status: 'sent',
          approvalStatus: 'pending',
          createdAt: new Date(Date.now() - 86400000),
        },
      ];

      const mockDrafts = [
        {
          _id: '4',
          type: 'message',
          title: 'Draft: Event Inquiry',
          description: 'Inquiry about event details',
          message: 'I would like to know more about...',
          from: { _id: user?._id || 'user1', username: user?.username, email: user?.email },
          to: { _id: '', username: '', email: '' },
          status: 'draft',
          createdAt: new Date(Date.now() - 172800000),
        },
      ];

      setInboxMessages(mockInbox);
      setSentMessages(mockSent);
      setDraftMessages(mockDrafts);
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleComposeMessage = async (saveAs) => {
    if (!composeForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (saveAs === 'sent' && !composeForm.to.trim()) {
      toast.error('Please specify a recipient');
      return;
    }

    try {
      const newMessage = {
        ...composeForm,
        status: saveAs,
        from: user._id,
        createdAt: new Date().toISOString(),
      };

      await messageService.createMessage(newMessage);

      toast.success(saveAs === 'draft' ? 'Saved as draft' : 'Message sent successfully');
      setComposeDialogOpen(false);
      setComposeForm({
        type: 'message',
        title: '',
        description: '',
        message: '',
        to: '',
        status: 'draft',
      });
      loadMessages();
    } catch (error) {
      toast.error('Failed to save message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      toast.success('Message deleted');
      loadMessages();
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  const handleApprovalAction = async (action) => {
    if (!actionDialog.messageId) return;

    try {
      await messageService.updateMessageApproval(actionDialog.messageId, action);
      toast.success(`Request ${action}ed successfully`);
      setActionDialog({ open: false, type: null, messageId: null });
      loadMessages();
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Mail className="w-4 h-4" />;
      case 'team_invite':
        return <User className="w-4 h-4" />;
      case 'sponsorship_request':
        return <FileText className="w-4 h-4" />;
      case 'mou_approval':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'registration_approval':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const getApprovalBadge = (approvalStatus) => {
    switch (approvalStatus) {
      case 'approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return null;
    }
  };

  const filterMessages = (messages) => {
    return messages.filter((msg) => {
      const matchesSearch =
        searchQuery === '' ||
        (msg.title && msg.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (msg.message && msg.message.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        filterType === 'all' || msg.type === filterType;

      return matchesSearch && matchesType;
    });
  };

  const renderMessageList = (messages, emptyText) => {
    const filtered = filterMessages(messages);

    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <Card className="p-12 text-center">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{emptyText}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((message) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={`p-4 cursor-pointer transition-all border-l-4 ${selectedMessage?._id === message._id
                  ? 'border-l-purple-600 bg-purple-50'
                  : 'border-l-transparent hover:border-l-purple-300'
                }`}
              onClick={() => setSelectedMessage(message)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                    {getMessageIcon(message.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black truncate">{message.title}</h3>
                      {message.approvalStatus && getApprovalBadge(message.approvalStatus)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {message.from ? `From: ${message.from.username || message.from.email}` : ''}
                      {message.to && ` → To: ${message.to.username || message.to.email}`}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {message.description || message.message}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-400 px-[1px] py-[0px]">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-xs whitespace-normal break-words leading-tight max-w-[120px]">
                    {message.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderMessageDetail = () => {
    if (!selectedMessage) {
      return (
        <Card className="p-12 text-center h-full flex items-center justify-center">
          <div>
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Select a message to view details</p>
          </div>
        </Card>
      );
    }

    const needsApproval = selectedMessage.type !== 'message' &&
      selectedMessage.type !== 'announcement' &&
      selectedMessage.approvalStatus === 'pending' &&
      selectedMessage.to?._id === user?._id;

    return (
      <Card className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">{selectedMessage.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  From: {selectedMessage.from?.username || selectedMessage.from?.email}
                </div>
                {selectedMessage.to && (
                  <div className="flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    To: {selectedMessage.to?.username || selectedMessage.to?.email}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedMessage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const status = selectedMessage.status;
                handleDeleteMessage(selectedMessage._id, status);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Badge>{selectedMessage.type.replace('_', ' ')}</Badge>
            {selectedMessage.approvalStatus && getApprovalBadge(selectedMessage.approvalStatus)}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          {selectedMessage.description && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{selectedMessage.description}</p>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Message</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
          </div>
        </ScrollArea>

        {needsApproval && (
          <div className="p-6 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">This request requires your action</p>
            <div className="flex gap-3">
              <Button
                onClick={() => setActionDialog({ open: true, type: 'accept', messageId: selectedMessage._id })}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => setActionDialog({ open: true, type: 'reject', messageId: selectedMessage._id })}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex h-screen bg-background pt-16">

      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activePage={activePage}
        onNavigate={handleNavigation}
        role={user?.role}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll p-6 page-transition">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Inbox
            </h1>
            <p className="text-gray-600">Manage your messages and notifications</p>
          </div>

          <Card className="p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="message">Messages</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                  <SelectItem value="team_invite">Team Invites</SelectItem>
                  <SelectItem value="sponsorship_request">Sponsorship Requests</SelectItem>
                  <SelectItem value="mou_approval">MoU Approvals</SelectItem>
                  <SelectItem value="registration_approval">Registration Approvals</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setComposeDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </div>
          </Card>

          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <Tabs defaultValue="inbox" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="inbox" className="flex items-center gap-2">
                    <Inbox className="w-4 h-4" />
                    Inbox
                    {inboxMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {inboxMessages.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Sent
                    {sentMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {sentMessages.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Draft
                    {draftMessages.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {draftMessages.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inbox">
                  {renderMessageList(inboxMessages, 'No messages in inbox')}
                </TabsContent>

                <TabsContent value="sent">
                  {renderMessageList(sentMessages, 'No sent messages')}
                </TabsContent>

                <TabsContent value="draft">
                  {renderMessageList(draftMessages, 'No draft messages')}
                </TabsContent>
              </Tabs>
            </div>

            <div className="lg:col-span-3">
              {renderMessageDetail()}
            </div>
          </div>
        </div>

        <Dialog open={composeDialogOpen} onOpenChange={setComposeDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose New Message</DialogTitle>
              <DialogDescription>Create a new message or save as draft</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">Message Type</Label>
                <Select
                  value={composeForm.type}
                  onValueChange={(value) => setComposeForm({ ...composeForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="message">Message</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="team_invite">Team Invite</SelectItem>
                    <SelectItem value="sponsorship_request">Sponsorship Request</SelectItem>
                    <SelectItem value="mou_approval">MoU Approval Request</SelectItem>
                    <SelectItem value="registration_approval">Registration Approval Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to">To (Email or Username)</Label>
                <Input
                  id="to"
                  placeholder="recipient@example.com"
                  value={composeForm.to}
                  onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter message title"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  value={composeForm.description}
                  onChange={(e) => setComposeForm({ ...composeForm, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  className="min-h-32"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleComposeMessage('draft')}
                disabled={!composeForm.title.trim()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleComposeMessage('sent')}
                disabled={!composeForm.title.trim() || !composeForm.to.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {actionDialog.type === 'accept' ? 'Accept Request' : 'Reject Request'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {actionDialog.type} this request? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleApprovalAction(actionDialog.type)}
                className={
                  actionDialog.type === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {actionDialog.type === 'accept' ? 'Accept' : 'Reject'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
          </main>
      </div>
    </div>
  );
};

export default InboxPage;
export { InboxPage };
