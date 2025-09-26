import React from 'react';
import { FaLink } from 'react-icons/fa';

const Achievements = ({ pastAchievements }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Past Achievements
      </h2>
      <ul className="list-none p-0 m-0">
        {pastAchievements.map((ach, index) => (
          <li key={index} className="py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-1">{ach.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{ach.description}</p>
            <a href={ach.proof} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 inline-flex items-center gap-1 hover:underline">
              <FaLink /> View Proof
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Achievements;