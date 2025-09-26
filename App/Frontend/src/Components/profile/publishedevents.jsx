import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';

const PublishedEvents = ({ publishedEvents }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
        Published Events
      </h2>
      <div>
        {publishedEvents.map((event, index) => (
          <div key={index} className="flex items-center gap-4 py-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-gray-100">
            <FaCalendarCheck className="text-blue-600 text-xl" />
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">{event.eventName}</span>
              <span className="text-sm text-gray-600">{event.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublishedEvents;