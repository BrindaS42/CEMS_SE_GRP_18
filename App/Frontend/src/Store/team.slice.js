import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

axios.defaults.withCredentials = true
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const fetchUsers = createAsyncThunk('team/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/team/users`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load users')
  }
})

export const fetchTeamList = createAsyncThunk('team/fetchTeamList', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_BASE}/team/list`)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.error || 'Failed to load team list')
  }
})

export const createTeam = createAsyncThunk('team/create', async (payload, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/team/create`, payload)
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || err?.response?.data?.error || 'Failed to create team')
  }
})

export const inviteMember = createAsyncThunk('team/inviteMember', async ({ teamId, username, role }, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_BASE}/team/${teamId}/invite`, { username, role })
    return res.data
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || err?.response?.data?.error || 'Failed to invite member')
  }
})

const initialState = {
  loading: false,
  error: null,
  lastCreatedTeam: null,
  users: [],
  teamList: [],
  draft: {
    name: '',
    description: '',
    members: [],
  },
}

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setDraftTeamMeta(state, action) {
      const { name, description } = action.payload || {}
      if (typeof name === 'string') state.draft.name = name
      if (typeof description === 'string') state.draft.description = description
    },
    addDraftMember(state, action) {
      const member = action.payload
      const exists = state.draft.members.find(m => m.username === member.username)
      if (!exists) state.draft.members.push(member)
    },
    removeDraftMember(state, action) {
      const username = action.payload
      state.draft.members = state.draft.members.filter(m => m.username !== username)
    },
    changeDraftMemberRole(state, action) {
      const { username, role } = action.payload
      const m = state.draft.members.find(x => x.username === username)
      if (m) m.role = role
    },
    clearDraft(state) {
      state.draft = { name: '', description: '', members: [] }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchTeamList.fulfilled, (state, action) => { state.teamList = action.payload })
      .addCase(createTeam.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createTeam.fulfilled, (state, action) => { state.loading = false; state.lastCreatedTeam = action.payload })
      .addCase(createTeam.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(inviteMember.rejected, (state, action) => { state.error = action.payload })
  }
})

export const { setDraftTeamMeta, addDraftMember, removeDraftMember, changeDraftMemberRole, clearDraft } = teamSlice.actions
export default teamSlice.reducer


