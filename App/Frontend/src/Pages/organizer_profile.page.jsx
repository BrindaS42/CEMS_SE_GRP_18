import React from 'react';
import { useSelector } from 'react-redux';
import ProfileHeader from '../components/profile/profileheader.jsx';
import Interests from '../components/profile/interests.jsx';
import Achievements from '../components/profile/achievements.jsx';
import PublishedEvents from '../components/profile/publishedevents.jsx';

// No CSS import is needed anymore!

const OrganizerProfile = () => {
  const profile = useSelector((state) => state.organizer.profile);

  if (!profile) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  // Apply body background in your root CSS or layout component, e.g., <body class="bg-gray-100">
  return (
    <div className="max-w-4xl mx-auto my-10 p-5">
      <ProfileHeader profile={profile} />
      <Interests areasOfInterest={profile.areasOfInterest} />
      <Achievements pastAchievements={profile.pastAchievements} />
      <PublishedEvents publishedEvents={profile.publishedEvents} />
    </div>
  );
};

export default OrganizerProfile;