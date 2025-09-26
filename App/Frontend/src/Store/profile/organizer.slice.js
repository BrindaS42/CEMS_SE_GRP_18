// Frontend/src/Store/profile/organizer.slice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// Assuming you'll set up an API client. We'll use a placeholder 'api' for now.
// You'll need to create this 'api' object or function, likely in a separate file (e.g., api/axiosClient.js).
// For this step, we'll assume a mock API call using 'setTimeout' to simulate the network delay.
// *** REPLACE THIS MOCK LATER WITH YOUR ACTUAL API CALLS ***

// MOCK API Client for demonstration (You'll replace this!)
const mockProfileData = {
    name: "Alex Doe",
    profilePic: "https://via.placeholder.com/150",
    contactNo: "+91 12345 67890",
    email: "alex.doe@example.com",
    linkedinProfile: "https://linkedin.com/in/alexdoe",
    githubProfile: "https://github.com/alexdoe",
    address: "Bengaluru, India",
    dob: "1998-05-20",
    areasOfInterest: ["Event Management", "Tech Startups", "AI Ethics"],
    pastAchievements: [
      {
        title: "Lead Organizer, TechFest 2024",
        description: "Successfully managed a team of 50 volunteers...",
        proof: "http://example.com/link-to-certificate-or-photo",
      },
    ],
    publishedEvents: [
        { eventName: "Hackathon 2024", role: "Lead Coordinator" },
    ]
};

const mockFetchProfile = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Mock API: Fetched profile.");
            // Simulate a successful response
            resolve({ data: mockProfileData }); 
        }, 1000); // Simulate network delay
    });
};

const mockUpdateProfile = (newProfileData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Mock API: Updated profile.");
            // Simulate a successful response with the updated data
            resolve({ data: newProfileData }); 
        }, 1000);
    });
};
// END MOCK API Client


// 1. Define the initial state (now with profile as null and added error state)
const initialState = {
  profile: null, // Set to null to indicate no data fetched yet
  loading: false,
  error: null,
};


// 2. Define the Async Thunks

// Thunk to fetch the organizer profile
export const fetchOrganizerProfile = createAsyncThunk(
  "organizer/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
        // *** REPLACE mockFetchProfile with your actual API call (e.g., axios.get('/api/organizer/profile')) ***
        const response = await mockFetchProfile(); 
        return response.data;
    } catch (error) {
        // Standard way to handle and pass the error message
        return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// Thunk to update the organizer profile
export const updateOrganizerProfile = createAsyncThunk(
  "organizer/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
        // *** REPLACE mockUpdateProfile with your actual API call (e.g., axios.put('/api/organizer/profile', profileData)) ***
        const response = await mockUpdateProfile(profileData); 
        return response.data; // The updated profile data
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);


// 3. Create the Slice with extraReducers

const organizerSlice = createSlice({
  name: "organizer",
  initialState,
  // Add a simple reducer to handle clearing state (e.g., on logout)
  reducers: {
    clearProfile: (state) => {
        state.profile = null;
        state.loading = false;
        state.error = null;
    }
  },
  // extraReducers handles actions from outside the slice, like the thunks
  extraReducers: (builder) => {
    // --- Fetch Profile Handlers ---
    builder
      .addCase(fetchOrganizerProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchOrganizerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Set the profile data
      })
      .addCase(fetchOrganizerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
        state.profile = null; // Ensure profile is null on failure
      })
    // --- Update Profile Handlers ---
      .addCase(updateOrganizerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrganizerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // Update the profile with the returned data
      })
      .addCase(updateOrganizerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the error message
      });
  },
});

export const { clearProfile } = organizerSlice.actions;

// We export the reducer function, which will be used in our store.
export default organizerSlice.reducer;