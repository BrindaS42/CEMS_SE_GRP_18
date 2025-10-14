const STORAGE_KEY = 'role';

export function getCurrentRole() {
  if (typeof window === 'undefined') return 'organizer';
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === 'student' || raw === 'organizer' || raw === 'sponsor') return raw;
  return 'organizer';
}

export function setCurrentRole(role) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, role);
}

