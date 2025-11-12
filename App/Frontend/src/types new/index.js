// User Roles
export const UserRole = ['student', 'organizer', 'sponsor', 'admin'];

// Example structures as plain JS objects for reference
export const defaultAchievement = {
  title: '',
  description: '',
  proof: '',
};

export const defaultUserProfile = {
  name: '',
  profilePic: '',
  contactNo: '',
  linkedin: '',
  github: '',
  address: '',
  dob: '',
  areasOfInterest: [],
  pastAchievements: [],
  resume: '',
};

export const defaultUser = {
  _id: '',
  role: '',
  authProvider: '',
  email: '',
  username: '',
  profile: defaultUserProfile,
  linkedRoles: [],
  createdAt: '',
};

export const defaultTeamMember = {
  user: '',
  role: '',
};

export const defaultTeam = {
  _id: '',
  name: '',
  leader: '',
  members: [],
  createdAt: '',
};

export const defaultMapAnnotation = {
  label: '',
  description: '',
  coordinates: { lat: 0, lng: 0 },
  icon: '',
  color: '',
};

export const defaultVenue = {
  address: '',
  coordinates: { lat: 0, lng: 0 },
  mapAnnotations: [],
};

export const defaultTimelineItem = {
  date: '',
  time: '',
  message: '',
  addedBy: '',
};

export const defaultSubEvent = {
  title: '',
  description: '',
};

export const defaultAnnouncement = {
  title: '',
  message: '',
  date: '',
  postedBy: '',
};

export const defaultWinner = {
  name: '',
  team: [],
  proof: '',
};

export const defaultScoreboardEntry = {
  participant: '',
  score: 0,
};

export const defaultPOC = {
  name: '',
  contact: '',
};

export const defaultEvent = {
  _id: '',
  title: '',
  description: '',
  categoryTags: [],
  ruleBook: '',
  poc: defaultPOC,
  venue: defaultVenue,
  timeline: [],
  subEvents: [],
  gallery: [],
  registrations: [],
  sponsors: [],
  announcements: [],
  winners: [],
  scoreboard: [],
  status: 'draft',
  createdBy: '',
  createdAt: '',
  updatedAt: '',
  registrationCount: 0,
  viewCount: 0,
};

export const defaultPayment = {
  status: 'pending',
  qrCode: '',
  combo: '',
};

export const defaultRegistration = {
  _id: '',
  event: '',
  student: '',
  type: 'single',
  teamMembers: [],
  payment: defaultPayment,
  reminders: [],
  clashWarning: false,
  registeredAt: '',
  status: 'pending',
};

export const defaultAdvertisement = {
  _id: '',
  sponsor: '',
  title: '',
  description: '',
  images: [],
  videos: [],
  status: 'draft',
  analytics: {
    impressions: 0,
    clicks: 0,
    engagementRate: 0,
  },
  linkedEvents: [],
  createdAt: '',
};

export const MessageType = ['general', 'announcement', 'invitation', 'registration_request'];

export const defaultMessage = {
  _id: '',
  sender: '',
  receiver: '',
  event: '',
  subject: '',
  message: '',
  attachments: [],
  type: '',
  createdAt: '',
  read: false,
  metadata: {
    registrationId: '',
    action: '',
  },
};

export const defaultApiResponse = {
  success: true,
  data: null,
  message: '',
};

export const defaultPaginatedResponse = {
  success: true,
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
};
