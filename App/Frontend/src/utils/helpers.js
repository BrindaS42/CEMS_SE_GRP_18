/**
 * Utility helper functions for the CEMS application
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Format number with commas (e.g., 1000 -> 1,000)
 */
export const formatNumber = (num) => {
  return num.toLocaleString('en-US');
};

/**
 * Convert number to compact format (e.g., 1000 -> 1K)
 */
export const compactNumber = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

/**
 * Check if event is happening today
 */
export const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if event is upcoming (within next 7 days)
 */
export const isUpcoming = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffInDays = Math.floor((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays >= 0 && diffInDays <= 7;
};

/**
 * Check if event has passed
 */
export const hasPassed = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getTime() < now.getTime();
};

/**
 * Get color based on event status
 */
export const getEventStatusColor = (status) => {
  switch (status) {
    case 'published':
      return 'bg-green-500';
    case 'draft':
      return 'bg-yellow-500';
    case 'cancelled':
      return 'bg-red-500';
    case 'completed':
      return 'bg-gray-500';
    default:
      return 'bg-blue-500';
  }
};

/**
 * Get role-specific gradient class
 */
export const getRoleGradient = (role) => {
  switch (role) {
    case 'student':
      return 'from-purple-500 via-pink-500 to-orange-500';
    case 'organizer':
      return 'from-indigo-600 via-purple-600 to-pink-600';
    case 'sponsor':
      return 'from-blue-600 via-indigo-600 to-purple-600';
    case 'admin':
      return 'from-red-600 via-orange-600 to-yellow-600';
    default:
      return 'from-gray-600 to-gray-800';
  }
};

/**
 * Get role-specific background gradient
 */
export const getRoleBackground = (role) => {
  switch (role) {
    case 'student':
      return 'from-purple-50 via-pink-50 to-orange-50';
    case 'organizer':
      return 'from-indigo-50 via-purple-50 to-pink-50';
    case 'sponsor':
      return 'from-blue-50 via-indigo-50 to-purple-50';
    case 'admin':
      return 'from-red-50 via-orange-50 to-yellow-50';
    default:
      return 'from-gray-50 to-gray-100';
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

/**
 * Generate random color for avatars
 */
export const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Download file from URL
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Check if two time ranges overlap (for clash detection)
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

/**
 * Calculate days until event
 */
export const daysUntilEvent = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffInMs = d.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

/**
 * Get event status text
 */
export const getEventStatus = (date) => {
  const days = daysUntilEvent(date);
  
  if (days < 0) return 'Completed';
  if (days === 0) return 'Happening Today!';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  if (days <= 30) return `In ${Math.ceil(days / 7)} weeks`;
  return `In ${Math.ceil(days / 30)} months`;
};

/**
 * Debounce function for search inputs
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generate slug from title
 */
export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Parse query string to object
 */
export const parseQueryString = (queryString) => {
  const params = new URLSearchParams(queryString);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};
