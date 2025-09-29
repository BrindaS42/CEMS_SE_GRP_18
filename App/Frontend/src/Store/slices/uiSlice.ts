import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  currentPage: string;
  sidebarOpen: boolean;
  sidebarHovered: boolean;
  sidebarPanelHovered: boolean;
  rightPanelOpen: boolean;
  loading: boolean;
  darkMode: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>;
}

const initialState: UIState = {
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
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setSidebarHovered: (state, action: PayloadAction<boolean>) => {
      state.sidebarHovered = action.payload;
    },
    setSidebarPanelHovered: (state, action: PayloadAction<boolean>) => {
      state.sidebarPanelHovered = action.payload;
    },
    toggleRightPanel: (state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
    setRightPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.rightPanelOpen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<UIState['notifications'][0], 'id'>>) => {
      const notification = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
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