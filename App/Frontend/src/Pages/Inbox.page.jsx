import PropTypes from 'prop-types';
import { useState } from 'react';
import { Mail, MailOpen, Search, Trash2, Star, Reply } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { cn } from '../components/ui/utils';
import { Sidebar } from '../Components/Organizers/Sidebar';

const InboxPage = ({ 
  onNavigate,
  isSidebarCollapsed = true,
  onToggleSidebar,
  currentRole = 'organizer',
}) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Event Coordinator',
      subject: 'TechFest 2025 Registration Confirmed',
      preview: 'Your registration for TechFest 2025 has been confirmed. Please check your email for more details...',
      timestamp: '2 hours ago',
      read: false,
      starred: true,
    },
    {
      id: '2',
      sender: 'Admin Team',
      subject: 'Important: Campus Event Guidelines',
      preview: 'Please review the updated campus event guidelines before organizing your next event...',
      timestamp: '5 hours ago',
      read: false,
      starred: false,
    },
    {
      id: '3',
      sender: 'Cultural Committee',
      subject: 'Volunteer Opportunity for Cultural Night',
      preview: 'We are looking for volunteers to help with the upcoming Cultural Night event...',
      timestamp: '1 day ago',
      read: true,
      starred: false,
    },
    {
      id: '4',
      sender: 'Sports Department',
      subject: 'Sports Day Results Announced',
      preview: 'Congratulations to all participants! The results for Sports Day 2025 have been announced...',
      timestamp: '2 days ago',
      read: true,
      starred: true,
    },
    {
      id: '5',
      sender: 'Sponsor Team',
      subject: 'New Sponsorship Opportunity',
      preview: 'A new sponsor has expressed interest in your event. Please review the details...',
      timestamp: '3 days ago',
      read: true,
      starred: false,
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkAsRead = (id) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const handleToggleStar = (id) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, starred: !msg.starred } : msg
      )
    );
  };

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    if (selectedMessage === id) {
      setSelectedMessage(null);
    }
  };

  const unreadCount = messages.filter(msg => !msg.read).length;
  const filteredMessages = messages.filter(msg =>
    msg.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedMessageData = messages.find(msg => msg.id === selectedMessage);

  return (
    <div className="flex h-screen bg-background pt-16">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={onToggleSidebar}
        activePage="inbox"
        onNavigate={onNavigate}
        role={currentRole}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto smooth-scroll" data-page-content>
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Inbox
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate?.('dashboard')}
                >
                  Back to Dashboard
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Messages List */}
              <div className="lg:col-span-1 space-y-2">
                {filteredMessages.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No messages found
                    </CardContent>
                  </Card>
                ) : (
                  filteredMessages.map((message) => (
                    <Card
                      key={message.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        selectedMessage === message.id && 'ring-2 ring-primary',
                        !message.read && 'bg-muted/30'
                      )}
                      onClick={() => {
                        setSelectedMessage(message.id);
                        handleMarkAsRead(message.id);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {message.read ? (
                              <MailOpen className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <Mail className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm truncate">
                                {message.sender}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 flex-shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStar(message.id);
                                }}
                              >
                                <Star
                                  className={cn(
                                    'w-4 h-4',
                                    message.starred
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  )}
                                />
                              </Button>
                            </div>
                            <div className="text-sm line-clamp-1">
                              {message.subject}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {message.preview}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Message Detail */}
              <div className="lg:col-span-2">
                {selectedMessageData ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 flex-1">
                            <h2 className="text-xl">{selectedMessageData.subject}</h2>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>From: {selectedMessageData.sender}</span>
                              <Badge variant="outline">{selectedMessageData.timestamp}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleStar(selectedMessageData.id)}
                            >
                              <Star
                                className={cn(
                                  'w-4 h-4',
                                  selectedMessageData.starred
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                )}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(selectedMessageData.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>

                        <hr className="border-border" />

                        <div className="prose prose-sm max-w-none">
                          <p>{selectedMessageData.preview}</p>
                          <p className="text-muted-foreground mt-4">
                            This is a sample message content. In a real application, this would contain the full message body with proper formatting and details.
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button className="bg-gradient-to-r from-primary to-accent text-white">
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                          <Button variant="outline">
                            Forward
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg mb-2">No message selected</h3>
                      <p className="text-sm text-muted-foreground">
                        Select a message from the list to view its contents
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

InboxPage.propTypes = {
  onNavigate: PropTypes.func,
  isSidebarCollapsed: PropTypes.bool,
  onToggleSidebar: PropTypes.func,
  currentRole: PropTypes.oneOf(['organizer', 'student', 'sponsor', 'admin']),
};

InboxPage.defaultProps = {
  isSidebarCollapsed: true,
  currentRole: 'organizer',
};

export default InboxPage;