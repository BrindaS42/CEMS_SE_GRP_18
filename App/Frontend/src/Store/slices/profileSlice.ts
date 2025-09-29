import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  proofUrl?: string;
  proofType: 'link' | 'file';
  date: string;
}

export interface PublishedEvent {
  id: string;
  title: string;
  role: 'Leader' | 'Co-Leader' | 'Member' | 'Organizer';
  date: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
}

export interface OtherRole {
  id: string;
  title: string;
  organization: string;
  url?: string;
  period: string;
}

export interface ProfileState {
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved: string | null;
  
  // Basic Information
  profilePicture?: string;
  name: string;
  contactNumber: string;
  email: string;
  linkedinProfile: string;
  githubProfile: string;
  address: string;
  dateOfBirth: string;
  
  // Professional Details
  areasOfInterest: string[];
  achievements: Achievement[];
  publishedEvents: PublishedEvent[];
  otherRoles: OtherRole[];
}

const initialState: ProfileState = {
  isEditing: false,
  hasUnsavedChanges: false,
  isSaving: false,
  lastSaved: null,
  
  // Basic Information
  name: 'John Doe',
  contactNumber: '+1 (555) 123-4567',
  email: 'john.doe@college.edu',
  linkedinProfile: '',
  githubProfile: '',
  address: '123 College Street\nCity, State 12345',
  dateOfBirth: '1998-06-15',
  
  // Professional Details - Start with smaller initial data to improve loading
  areasOfInterest: ['Web Development', 'Event Management'],
  achievements: [],
  publishedEvents: [],
  otherRoles: []
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditing = action.payload;
      if (!action.payload) {
        state.hasUnsavedChanges = false;
      }
    },
    
    updateBasicInfo: (state, action: PayloadAction<Partial<Omit<ProfileState, 'achievements' | 'publishedEvents' | 'otherRoles' | 'areasOfInterest'>>>) => {
      Object.assign(state, action.payload);
      if (state.isEditing) {
        state.hasUnsavedChanges = true;
      }
    },
    
    updateAreasOfInterest: (state, action: PayloadAction<string[]>) => {
      state.areasOfInterest = action.payload;
      if (state.isEditing) {
        state.hasUnsavedChanges = true;
      }
    },
    
    addAchievement: (state, action: PayloadAction<Omit<Achievement, 'id'>>) => {
      const newAchievement = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.achievements.push(newAchievement);
      state.hasUnsavedChanges = true;
    },
    
    updateAchievement: (state, action: PayloadAction<Achievement>) => {
      const index = state.achievements.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.achievements[index] = action.payload;
        state.hasUnsavedChanges = true;
      }
    },
    
    removeAchievement: (state, action: PayloadAction<string>) => {
      state.achievements = state.achievements.filter(a => a.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
    
    addOtherRole: (state, action: PayloadAction<Omit<OtherRole, 'id'>>) => {
      const newRole = {
        ...action.payload,
        id: Date.now().toString()
      };
      state.otherRoles.push(newRole);
      state.hasUnsavedChanges = true;
    },
    
    updateOtherRole: (state, action: PayloadAction<OtherRole>) => {
      const index = state.otherRoles.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.otherRoles[index] = action.payload;
        state.hasUnsavedChanges = true;
      }
    },
    
    removeOtherRole: (state, action: PayloadAction<string>) => {
      state.otherRoles = state.otherRoles.filter(r => r.id !== action.payload);
      state.hasUnsavedChanges = true;
    },
    
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },
    
    setSaved: (state) => {
      state.hasUnsavedChanges = false;
      state.isSaving = false;
      state.lastSaved = new Date().toISOString();
    },
    
    resetChanges: (state) => {
      state.hasUnsavedChanges = false;
    }
  }
});

export const {
  setEditMode,
  updateBasicInfo,
  updateAreasOfInterest,
  addAchievement,
  updateAchievement,
  removeAchievement,
  addOtherRole,
  updateOtherRole,
  removeOtherRole,
  setSaving,
  setSaved,
  resetChanges
} = profileSlice.actions;

export default profileSlice.reducer;