import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  email: string;
  username: string;
  role: 'Leader' | 'Editor' | 'Viewer';
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
  createdBy: string;
}

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  loading: false,
  error: null,
};

// Async thunks for API calls
export const createTeam = createAsyncThunk(
  'team/createTeam',
  async (teamData: { name: string; description?: string; members: Omit<TeamMember, 'id' | 'joinedAt'>[] }) => {
    // This would be an actual API call in a real application
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: teamData.name,
      description: teamData.description,
      members: teamData.members.map(member => ({
        ...member,
        id: Math.random().toString(36).substr(2, 9),
        joinedAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id', // This would come from auth state
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return newTeam;
  }
);

export const fetchTeams = createAsyncThunk(
  'team/fetchTeams',
  async () => {
    // This would be an actual API call in a real application
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data for now
    return [];
  }
);

export const updateTeam = createAsyncThunk(
  'team/updateTeam',
  async (teamData: { id: string; name?: string; description?: string; members?: TeamMember[] }) => {
    // This would be an actual API call in a real application
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return teamData;
  }
);

export const deleteTeam = createAsyncThunk(
  'team/deleteTeam',
  async (teamId: string) => {
    // This would be an actual API call in a real application
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return teamId;
  }
);

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setCurrentTeam: (state, action: PayloadAction<Team | null>) => {
      state.currentTeam = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    addMemberToCurrentTeam: (state, action: PayloadAction<Omit<TeamMember, 'id' | 'joinedAt'>>) => {
      if (state.currentTeam) {
        const newMember: TeamMember = {
          ...action.payload,
          id: Math.random().toString(36).substr(2, 9),
          joinedAt: new Date().toISOString(),
        };
        state.currentTeam.members.push(newMember);
      }
    },
    removeMemberFromCurrentTeam: (state, action: PayloadAction<string>) => {
      if (state.currentTeam) {
        state.currentTeam.members = state.currentTeam.members.filter(
          member => member.id !== action.payload
        );
      }
    },
    updateMemberRole: (state, action: PayloadAction<{ memberId: string; role: 'Leader' | 'Editor' | 'Viewer' }>) => {
      if (state.currentTeam) {
        const { memberId, role } = action.payload;
        
        // If setting someone as Leader, demote current leader to Editor
        if (role === 'Leader') {
          state.currentTeam.members.forEach(member => {
            if (member.role === 'Leader') {
              member.role = 'Editor';
            }
          });
        }
        
        // Update the target member's role
        const member = state.currentTeam.members.find(m => m.id === memberId);
        if (member) {
          member.role = role;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Create team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
        state.currentTeam = action.payload;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create team';
      })
      
      // Fetch teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      })
      
      // Update team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const { id, ...updates } = action.payload;
        const teamIndex = state.teams.findIndex(team => team.id === id);
        if (teamIndex !== -1) {
          state.teams[teamIndex] = { ...state.teams[teamIndex], ...updates };
        }
        if (state.currentTeam && state.currentTeam.id === id) {
          state.currentTeam = { ...state.currentTeam, ...updates };
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update team';
      })
      
      // Delete team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter(team => team.id !== action.payload);
        if (state.currentTeam && state.currentTeam.id === action.payload) {
          state.currentTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete team';
      });
  },
});

export const {
  setCurrentTeam,
  clearError,
  addMemberToCurrentTeam,
  removeMemberFromCurrentTeam,
  updateMemberRole,
} = teamSlice.actions;

export default teamSlice.reducer;