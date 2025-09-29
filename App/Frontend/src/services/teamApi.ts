import { api } from './api';
import { Team, TeamMember } from '../store/slices/teamSlice';

export interface CreateTeamRequest {
  name: string;
  description?: string;
  members: Omit<TeamMember, 'id' | 'joinedAt'>[];
}

export interface UpdateTeamRequest {
  id: string;
  name?: string;
  description?: string;
  members?: TeamMember[];
}

export const teamApi = {
  // Create a new team
  createTeam: async (teamData: CreateTeamRequest): Promise<Team> => {
    try {
      const response = await api.post('/teams', teamData);
      return response.data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  },

  // Get all teams for the current user
  getTeams: async (): Promise<Team[]> => {
    try {
      const response = await api.get('/teams');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  },

  // Get a specific team by ID
  getTeam: async (teamId: string): Promise<Team> => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  },

  // Update a team
  updateTeam: async (teamData: UpdateTeamRequest): Promise<Team> => {
    try {
      const { id, ...updateData } = teamData;
      const response = await api.put(`/teams/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  },

  // Delete a team
  deleteTeam: async (teamId: string): Promise<void> => {
    try {
      await api.delete(`/teams/${teamId}`);
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  },

  // Add member to team
  addMember: async (teamId: string, memberData: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember> => {
    try {
      const response = await api.post(`/teams/${teamId}/members`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  },

  // Remove member from team
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`);
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (teamId: string, memberId: string, role: 'Leader' | 'Editor' | 'Viewer'): Promise<TeamMember> => {
    try {
      const response = await api.patch(`/teams/${teamId}/members/${memberId}`, { role });
      return response.data;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }
};

export default teamApi;