// uiSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: 'Dashboard',
  sidebarOpen: false,
  sidebarHovered: false,
  sidebarPanelHovered: false,
  rightPanelOpen: false,
  loading: false,
  darkMode: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarHovered: (state, action) => {
      state.sidebarHovered = action.payload;
    },
    setSidebarPanelHovered: (state, action) => {
      state.sidebarPanelHovered = action.payload;
    },
    toggleRightPanel: (state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    setRightPanelOpen: (state, action) => {
      state.rightPanelOpen = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    addNotification: (state, action) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
  },
});

export const {
  setCurrentPage,
  toggleSidebar,
  setSidebarOpen,
  setSidebarHovered,
  setSidebarPanelHovered,
  toggleRightPanel,
  setRightPanelOpen,
  setLoading,
  addNotification,
  removeNotification,
  toggleDarkMode,
  setDarkMode,
} = uiSlice.actions;

export default uiSlice.reducer;