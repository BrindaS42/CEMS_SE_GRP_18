import React from 'react';

const Interests = ({ areasOfInterest }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Areas of Interest
      </h2>
      <div className="flex flex-wrap gap-2">
        {areasOfInterest.map((interest, index) => (
          <span key={index} className="bg-blue-100 text-blue-700 py-1.5 px-4 rounded-full text-sm font-medium">
            {interest}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Interests;