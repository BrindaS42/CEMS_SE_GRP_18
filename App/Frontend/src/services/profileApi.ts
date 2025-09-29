import { ProfileState } from '../store/slices/profileSlice';

// Mock API service for profile management
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ProfileState> => {
    // Reduce API delay to prevent timeout
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Return mock profile data (in real app, this would come from backend)
    return {
      isEditing: false,
      hasUnsavedChanges: false,
      isSaving: false,
      lastSaved: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      
      profilePicture: 'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODk2NTAzMnww&ixlib=rb-4.1.0&q=80&w=200&h=200&fit=crop&crop=face',
      name: 'John Doe',
      contactNumber: '+1 (555) 123-4567',
      email: 'john.doe@college.edu',
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      githubProfile: 'https://github.com/johndoe',
      address: '123 College Street\nCity, State 12345',
      dateOfBirth: '1998-06-15',
      
      areasOfInterest: ['Web Development', 'Event Management', 'Team Leadership', 'UI/UX Design'],
      achievements: [
        {
          id: '1',
          title: 'Best Event Organizer 2024',
          description: 'Awarded for organizing the most successful college tech fest with over 500 participants.',
          proofType: 'link',
          proofUrl: 'https://example.com/certificate',
          date: '2024-03-15'
        },
        {
          id: '2',
          title: 'Outstanding Leadership Award',
          description: 'Recognized for exceptional leadership in student council activities and community service.',
          proofType: 'file',
          date: '2024-01-20'
        }
      ],
      publishedEvents: [
        {
          id: '1',
          title: 'Tech Innovation Summit 2024',
          role: 'Leader',
          date: '2024-03-20',
          status: 'Completed'
        },
        {
          id: '2',
          title: 'Annual Cultural Festival',
          role: 'Co-Leader',
          date: '2024-05-10',
          status: 'Completed'
        },
        {
          id: '3',
          title: 'Winter Sports Championship',
          role: 'Member',
          date: '2024-12-15',
          status: 'Upcoming'
        }
      ],
      otherRoles: [
        {
          id: '1',
          title: 'Student Council Member',
          organization: 'College Student Council',
          period: '2023-2024',
          url: 'https://college.edu/student-council'
        },
        {
          id: '2',
          title: 'Volunteer Coordinator',
          organization: 'Local Community Center',
          period: '2023-Present'
        }
      ]
    };
  },

  // Save profile changes
  saveProfile: async (profileData: Partial<ProfileState>): Promise<void> => {
    // Reduce API delay to prevent timeout
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // In real app, this would send data to backend
    console.log('Saving profile data:', profileData);
    
    // Simulate occasional save failure for demo
    if (Math.random() < 0.1) {
      throw new Error('Failed to save profile. Please try again.');
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<string> => {
    // Reduce API delay to prevent timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In real app, this would upload to cloud storage
    console.log('Uploading profile picture:', file.name);
    
    // Return mock URL (in real app, this would be the actual uploaded file URL)  
    return 'https://images.unsplash.com/photo-1576558656222-ba66febe3dec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDF8fHx8MTc1ODk2NTAzMnww&ixlib=rb-4.1.0&q=80&w=200&h=200&fit=crop&crop=face';
  },

  // Upload achievement proof file
  uploadAchievementProof: async (file: File): Promise<string> => {
    // Reduce API delay to prevent timeout
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // In real app, this would upload to cloud storage
    console.log('Uploading achievement proof:', file.name);
    
    // Return mock URL
    return 'https://example.com/uploaded-file/' + file.name;
  }
};