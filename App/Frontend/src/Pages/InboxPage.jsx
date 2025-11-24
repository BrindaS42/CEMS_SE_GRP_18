import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Plus,
  Archive,
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Input } from '../Components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../Components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../Components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../Components/ui/dialog';
import { Label } from '../Components/ui/label';
import { Textarea } from '../Components/ui/textarea';
import { Skeleton } from '../Components/ui/skeleton';
import { ScrollArea } from '../Components/ui/scroll-area';
import { toast } from 'sonner';
import {Sidebar} from '../Components/general/Sidebar';
import {
  fetchArrivals,
  fetchSent,
  fetchDrafts,
  createDraft,
  sendMessage,
  sendDirectMessage,
  updateDraft,
  deleteMessage,
  approveMessage,
  rejectMessage,
} from '../Store/inbox.slice';


const InboxPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { arrivals, sent, drafts, status: loading } = useSelector((state) => state.inbox) || { arrivals: [], sent: [], drafts: [], status: 'idle' };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activePage, setActivePage] = useState('inbox');
  const handleNavigation = (page) => setActivePage(page);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [actionDialog, setActionDialog] = useState({
    open: false,
    type: null,
    messageId: null,
  });
  const [composeDialogOpen, setComposeDialogOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({
    _id: null, // To track editing
    type: 'message',
    title: '',
    description: '',
    to: [],
    status: 'Draft',
  });
  const [currentRecipient, setCurrentRecipient] = useState({ email: '', role: 'student' });
  const [broadcastType, setBroadcastType] = useState('specific');


  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (selectedMessage) {
      const updatedMessage = arrivals.find(m => m._id === selectedMessage._id);
      if (updatedMessage) {
        setSelectedMessage(updatedMessage);
      } else {
        setSelectedMessage(null);
      }
    }
  }, [arrivals]);

  const resetComposeForm = () => {
    setComposeForm({ type: 'message', title: '', description: '', to: [], status: 'Draft' });
    setCurrentRecipient({ email: '', role: 'student' });
    setBroadcastType('specific');
  };

  const loadMessages = async () => {
    dispatch(fetchArrivals());
    dispatch(fetchSent());
    dispatch(fetchDrafts());
  };

  const handleEditDraft = (draft) => {
    // Check for Broadcast:
    // If the `to` array has exactly one element and it's a string starting with 'to_', it's a broadcast keyword.
    const isBroadcastKeyword = draft.to?.length === 1 && typeof draft.to[0] === 'string' && draft.to[0].startsWith('to_');

    if (isBroadcastKeyword) {
      setBroadcastType(draft.to[0]);
      // In broadcast mode, the 'to' array in composeForm should be empty since the value is in broadcastType
    } else {
      setBroadcastType('specific');
    }

    let mappedRecipients = [];
    if (draft.to && Array.isArray(draft.to)) {
      // Map populated user objects back to the simple {email, role} format for the compose form
      if (!isBroadcastKeyword) {
        mappedRecipients = draft.to
          .filter(u => u && typeof u === 'object' && u.email && u.role)
          .map(u => ({ email: u.email, role: u.role }));
      }
    }


    setComposeForm({
      _id: draft._id,
      type: draft.type,
      title: draft.title,
      description: draft.description || '',
      // If it's a broadcast, mappedRecipients is empty (handled by broadcastType state).
      // If it's specific, mappedRecipients has the list of recipients.
      to: mappedRecipients,
      status: 'Draft',
    });
    setComposeDialogOpen(true);
  };

  const handleComposeMessage = async (saveAs) => {
    if (!composeForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const isBroadcast = broadcastType !== 'specific';
    const finalTo = isBroadcast ? [broadcastType] : composeForm.to;

    if (saveAs === 'Sent' && finalTo.length === 0) {
      toast.error('Please specify a recipient');
      return;
    }

    try {
      const payload = { ...composeForm };

      payload.to = finalTo;
      if (saveAs === 'Draft') {
        delete payload._id; // Don't send _id in the body for create/update
        const thunk = composeForm._id ? updateDraft({ draftId: composeForm._id, payload }) : createDraft(payload);
        await dispatch(thunk).unwrap();
        toast.success('Saved as draft');
      } else { // 'Sent'
        if (composeForm._id) {
          // It's an existing draft, so update it then send it
          const updatedDraft = await dispatch(updateDraft({ draftId: composeForm._id, payload })).unwrap();
          await dispatch(sendMessage(updatedDraft)).unwrap();
        } else {
          // It's a new message, send it directly
          await dispatch(sendDirectMessage(payload)).unwrap();
        }
        toast.success('Message sent successfully');
      }

      setComposeDialogOpen(false);
      resetComposeForm();
    } catch (error) {
      toast.error(error || 'Failed to save message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await dispatch(deleteMessage(messageId)).unwrap();
      toast.success('Message deleted');
      if (selectedMessage?._id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      toast.error(error || 'Failed to delete message');
    }
  };

  const handleApprovalAction = async (action) => {
    if (!actionDialog.messageId) return;
    try {
      const thunk = action === 'accept' ? approveMessage : rejectMessage;
      await dispatch(thunk(actionDialog.messageId)).unwrap();
      toast.success(`Request ${action}ed successfully`);
      setActionDialog({ open: false, type: null, messageId: null });
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

  const getApprovalBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-600">Approved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-600">Rejected</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-600">Pending</Badge>;
      default:
        return null;
    }
  };

  const handleAddRecipient = () => {
    if (currentRecipient.email.trim()) {
      if (!composeForm.to.some(r => r.email === currentRecipient.email && r.role === currentRecipient.role)) {
        setComposeForm(prev => ({ ...prev, to: [...prev.to, currentRecipient] }));
        setCurrentRecipient({ email: '', role: 'student' });
      } else {
        toast.info('Recipient already added.');
      }
    }
  };

  const handleRemoveRecipient = (recipient) => {
    setComposeForm(prev => ({ ...prev, to: prev.to.filter(r => r.email !== recipient.email || r.role !== recipient.role) }));
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

    if (loading === 'loading') {
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
                      {message.status && getApprovalBadge(message.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {message.from ? `From: ${message.from.profile?.name}` : 'From: [Deleted User]'}
                      {message.to && message.to.length > 0 ? ` → To: ${message.to[0]?.profile?.name}` : ''}
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
      selectedMessage.status === 'Pending' &&
      selectedMessage.to?.some(recipient => recipient._id === user?.id);

    const isDraftOwner =
      selectedMessage.status === 'Draft' &&
      selectedMessage.from?._id === user?.id;


    return (
      <Card className="h-full flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2">{selectedMessage.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  From: {selectedMessage.from?.profile?.name || '[Deleted User]'}
                </div>
                {selectedMessage.to && selectedMessage.to.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Send className="w-4 h-4" />
                    To: {selectedMessage.to.map(u => u.profile?.name || u.email || '[Deleted User]').join(', ')}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(selectedMessage.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isDraftOwner && (
                <Button variant="ghost" size="sm" onClick={() => handleEditDraft(selectedMessage)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMessage(selectedMessage._id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

          </div>
          <div className="flex gap-2">
            <Badge>{selectedMessage.type.replace('_', ' ')}</Badge>
            {selectedMessage.status && getApprovalBadge(selectedMessage.status)}
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div>
            {selectedMessage.description && (
              <>
                <h3 className="font-semibold mb-2">Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.description}</p>
              </>
            )}
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


  console.log('Arrivals:', arrivals);
  console.log('Sent:', sent);
  console.log('Drafts:', drafts);

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
                    {arrivals.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {arrivals.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Sent
                    {sent.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {sent.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Draft
                    {drafts.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {drafts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="inbox">
                  {renderMessageList(arrivals, 'No messages in inbox')}
                </TabsContent>

                <TabsContent value="sent">
                  {renderMessageList(sent, 'No sent messages')}
                </TabsContent>

                <TabsContent value="draft">
                  {renderMessageList(drafts, 'No draft messages')}
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

              {user?.role === 'admin' && (
                <div>
                  <Label>Broadcast To</Label>
                  <Select
                    value={broadcastType}
                    onValueChange={(value) => {
                      setBroadcastType(value);
                      if (value !== 'specific') {
                        setComposeForm(prev => ({ ...prev, to: [] }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specific">Specific Users</SelectItem>
                      <SelectItem value="to_all_student">All Students</SelectItem>
                      <SelectItem value="to_all_organizer">All Organizers</SelectItem>
                      <SelectItem value="to_all_sponsor">All Sponsors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>To</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="recipient@example.com"
                    value={currentRecipient.email}
                    onChange={(e) => setCurrentRecipient(prev => ({ ...prev, email: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                    disabled={broadcastType !== 'specific'}
                  />
                  <Select value={currentRecipient.role} onValueChange={(value) => setCurrentRecipient(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent disabled={broadcastType !== 'specific'}>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="sponsor">Sponsor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddRecipient} disabled={broadcastType !== 'specific'}><Plus className="w-4 h-4" /></Button>
                </div>
                {composeForm.to.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-2 border rounded-md">
                    {composeForm.to.map((recipient, index) => (
                      <Badge key={index} variant="secondary" className="gap-1.5">
                        {recipient.email} ({recipient.role})
                        <button
                          type="button"
                          onClick={() => handleRemoveRecipient(recipient)}
                          className="rounded-full hover:bg-muted-foreground/20"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
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
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={composeForm.description}
                  onChange={(e) => setComposeForm({ ...composeForm, description: e.target.value })}
                  className="min-h-32"
                />
              </div>

            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handleComposeMessage('Draft')}
                disabled={loading === 'loading' || !composeForm.title.trim()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleComposeMessage('Sent')}
                disabled={loading === 'loading' || !composeForm.title.trim() || (composeForm.to.length === 0 && broadcastType === 'specific')}
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
