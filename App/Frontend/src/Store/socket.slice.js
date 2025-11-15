import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isConnected: false,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocketConnected: (state) => {
      state.isConnected = true;
    },
    setSocketDisconnected: (state) => {
      state.isConnected = false;
    },
  },
});

export const { setSocketConnected, setSocketDisconnected } = socketSlice.actions;

export default socketSlice.reducer;