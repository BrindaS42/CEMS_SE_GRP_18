import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrganizerProfile } from '../Store/profile/organizer.slice.js'; 
import ProfileHeader from '../components/profile/profileheader.jsx';
import Interests from '../components/profile/interests.jsx';
import Achievements from '../components/profile/achievements.jsx';
import PublishedEvents from '../components/profile/publishedevents.jsx';
import { FaEdit } from 'react-icons/fa'; 
import EditProfileModal from '../components/profile/editprofilemodal.jsx'; 


const OrganizerProfile = () => {
  const dispatch = useDispatch();
  // Destructure profile, loading, and error from the store
  const { profile, loading, error } = useSelector((state) => state.organizer); 
  
  // State to control the visibility of the Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false); 


  // Fetch the profile when the component mounts
  useEffect(() => {
    // Only fetch if the profile hasn't been loaded yet (to prevent re-fetching on subsequent renders)
    if (!profile) { 
      dispatch(fetchOrganizerProfile());
    }
  }, [dispatch, profile]);

  
  // --- Loading State Handler ---
  if (loading && !profile) { 
    return (
        <div className="max-w-4xl mx-auto my-10 p-5 text-center text-xl text-blue-600">
            Loading profile data...
        </div>
    );
  }

  // --- Error State Handler ---
  if (error) {
    return (
        <div className="max-w-4xl mx-auto my-10 p-5 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">
            Error: {error}. Please try again later.
        </div>
    );
  }
  
  // --- No Profile Data Handler ---
  // This case should ideally be covered by the error handler, but good for completeness
  if (!profile) {
    return <div className="max-w-4xl mx-auto my-10 p-5 text-center">Profile data is unavailable.</div>;
  }
  
  
  return (
    <div className="max-w-4xl mx-auto my-10 p-5">
        
      {/* Edit Profile Button */}
      <div className="flex justify-end mb-5">
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
        >
          <FaEdit />
          Edit Profile
        </button>
      </div>

      {/* Main Profile Components */}
      <ProfileHeader profile={profile} />
      <Interests areasOfInterest={profile.areasOfInterest || []} />
      <Achievements pastAchievements={profile.pastAchievements || []} />
      <PublishedEvents publishedEvents={profile.publishedEvents || []} />
      
      { // We will uncomment this once you've created the EditProfileModal component in Step 4
        <EditProfileModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            currentProfile={profile} 
        />
      }
    </div>
  );
};

export default OrganizerProfile;
