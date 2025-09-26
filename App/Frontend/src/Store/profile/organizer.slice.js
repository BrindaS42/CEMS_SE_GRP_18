import { createSlice } from "@reduxjs/toolkit";

// This is the initial data for our organizer profile.
// In a real app, this would likely come from an API call.
const initialState = {
  profile: {
    name: "Alex Doe",
    profilePic: "https://via.placeholder.com/150", // Placeholder image URL
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
        description: "Successfully managed a team of 50 volunteers and coordinated with 20+ sponsors for a 3-day tech festival.",
        proof: "http://example.com/link-to-certificate-or-photo",
      },
      {
        title: "Best Event Strategy Award",
        description: "Awarded for the innovative marketing and execution strategy for the 'Innovate' hackathon.",
        proof: "http://example.com/link-to-award",
      },
    ],
    publishedEvents: [
        { eventName: "Hackathon 2024", role: "Lead Coordinator" },
        { eventName: "Tech Summit 2023", role: "Marketing Head" },
    ]
  },
  // We can add other state properties here later, like loading status or errors
  loading: false,
};

const organizerSlice = createSlice({
  name: "organizer",
  initialState,
  // Reducers are functions that define how our state can be updated.
  // We will add these later when we want to edit the profile.
  reducers: {
    // Example: setProfile: (state, action) => { state.profile = action.payload; }
  },
});

// We export the reducer function, which will be used in our store.
export default organizerSlice.reducer;