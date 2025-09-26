import React from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaLinkedin, FaGithub } from 'react-icons/fa';

const ProfileHeader = ({ profile }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-5 flex flex-col sm:flex-row items-center gap-6">
      <img 
        src={profile.profilePic} 
        alt={profile.name} 
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" 
      />
      <div className="text-center sm:text-left">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">{profile.name}</h1>
        <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 mb-2 text-sm text-gray-600">
          <a href={`mailto:${profile.email}`} className="flex items-center gap-2 transition-colors hover:text-blue-600">
            <FaEnvelope /> {profile.email}
          </a>
          <a href={`tel:${profile.contactNo}`} className="flex items-center gap-2 transition-colors hover:text-blue-600">
            <FaPhone /> {profile.contactNo}
          </a>
        </div>
        <div className="flex justify-center sm:justify-start items-center gap-2 mb-2 text-sm text-gray-600">
          <FaMapMarkerAlt /> {profile.address}
        </div>
        <div className="flex justify-center sm:justify-start gap-4 text-sm text-gray-600">
          <a href={profile.linkedinProfile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-blue-600">
            <FaLinkedin /> LinkedIn
          </a>
          <a href={profile.githubProfile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-blue-600">
            <FaGithub /> GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;