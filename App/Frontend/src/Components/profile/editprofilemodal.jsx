import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateOrganizerProfile } from '../../Store/profile/organizer.slice.js';
import { FaTimes, FaSave, FaPlus, FaTrash } from 'react-icons/fa';

const EditProfileModal = ({ isOpen, onClose, currentProfile }) => {
  const dispatch = useDispatch();

  // 1. Local state for form data
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 2. Sync Redux profile data to local form state when modal opens or profile changes
  useEffect(() => {
    if (currentProfile) {
      setFormData({
        name: currentProfile.name || '',
        profilePic: currentProfile.profilePic || '',
        contactNo: currentProfile.contactNo || '',
        email: currentProfile.email || '',
        linkedinProfile: currentProfile.linkedinProfile || '',
        githubProfile: currentProfile.githubProfile || '',
        address: currentProfile.address || '',
        dob: currentProfile.dob ? new Date(currentProfile.dob).toISOString().substring(0, 10) : '', // Format date for input type="date"
        areasOfInterest: currentProfile.areasOfInterest || [''], // Ensure at least one empty string for editing
        pastAchievements: currentProfile.pastAchievements || [
          { title: '', description: '', proof: '' },
        ],
      });
    }
  }, [currentProfile, isOpen]); // Rerun when profile or modal status changes

  // Stop if modal is closed
  if (!isOpen) return null;

  // --- General Input Change Handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // --- Interests Array Handlers ---
  const handleInterestChange = (index, value) => {
    const newInterests = [...formData.areasOfInterest];
    newInterests[index] = value;
    setFormData({ ...formData, areasOfInterest: newInterests });
  };

  const addInterest = () => {
    setFormData({ ...formData, areasOfInterest: [...formData.areasOfInterest, ''] });
  };

  const removeInterest = (index) => {
    const newInterests = formData.areasOfInterest.filter((_, i) => i !== index);
    setFormData({ ...formData, areasOfInterest: newInterests });
  };

  // --- Achievements Array Handlers ---
  const handleAchievementChange = (index, field, value) => {
    const newAchievements = [...formData.pastAchievements];
    newAchievements[index] = { ...newAchievements[index], [field]: value };
    setFormData({ ...formData, pastAchievements: newAchievements });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      pastAchievements: [
        ...formData.pastAchievements,
        { title: '', description: '', proof: '' },
      ],
    });
  };

  const removeAchievement = (index) => {
    const newAchievements = formData.pastAchievements.filter((_, i) => i !== index);
    setFormData({ ...formData, pastAchievements: newAchievements });
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Clean up empty strings/objects before submitting
    const cleanedData = {
        ...formData,
        areasOfInterest: formData.areasOfInterest.filter(i => i.trim() !== ''),
        pastAchievements: formData.pastAchievements.filter(ach => ach.title.trim() !== ''),
    };

    try {
      // Dispatch the update thunk
      await dispatch(updateOrganizerProfile(cleanedData)).unwrap();
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Update failed:", err);
      setError(err || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal Backdrop and Container
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white p-6 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-800">Edit Organizer Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 transition"
            disabled={loading}
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-100 border border-red-300 rounded">
              {error}
            </div>
          )}

          {/* === Basic Information Section === */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                required 
              />
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Pic URL</label>
              <input 
                type="url" 
                name="profilePic" 
                value={formData.profilePic || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
              <input 
                type="tel" 
                name="contactNo" 
                value={formData.contactNo || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            {/* Email (Read-only since it's typically tied to user login) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email || ''} 
                readOnly
                className="w-full p-2 border border-gray-300 bg-gray-100 rounded-lg" 
              />
            </div>
            
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="dob" 
                value={formData.dob || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile URL</label>
              <input 
                type="url" 
                name="linkedinProfile" 
                value={formData.linkedinProfile || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            {/* GitHub */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile URL</label>
              <input 
                type="url" 
                name="githubProfile" 
                value={formData.githubProfile || ''} 
                onChange={handleChange} 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
          
          {/* === Areas of Interest Section === */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 mt-6">
            Areas of Interest
          </h3>
          <div className="space-y-3 mb-6">
            {formData.areasOfInterest?.map((interest, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="e.g., Event Management"
                  value={interest}
                  onChange={(e) => handleInterestChange(index, e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                  disabled={formData.areasOfInterest.length === 1 && index === 0}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addInterest}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FaPlus /> Add Interest
            </button>
          </div>

          {/* === Achievements Section === */}
          <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2 mt-6">
            Past Achievements
          </h3>
          <div className="space-y-6 mb-6">
            {formData.pastAchievements?.map((achievement, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50 relative">
                <h4 className="font-medium text-gray-700 mb-2">Achievement #{index + 1}</h4>
                
                {/* Remove Button */}
                <button
                    type="button"
                    onClick={() => removeAchievement(index)}
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
                >
                    <FaTimes />
                </button>

                {/* Title */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Lead Organizer, TechFest 2024"
                    value={achievement.title}
                    onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    placeholder="Details about your role and contribution..."
                    value={achievement.description}
                    onChange={(e) => handleAchievementChange(index, 'description', e.target.value)}
                    rows="2"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Proof Link */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Proof Link (URL)</label>
                  <input
                    type="url"
                    placeholder="http://example.com/proof"
                    value={achievement.proof}
                    onChange={(e) => handleAchievementChange(index, 'proof', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addAchievement}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <FaPlus /> Add Achievement
            </button>
          </div>
          
          {/* Modal Footer / Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center gap-2 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;