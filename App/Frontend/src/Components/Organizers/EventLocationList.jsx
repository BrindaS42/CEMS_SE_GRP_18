import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDashboardEvents } from '../../store/event.slice.js';

export default function EventLocationList() {
    const dispatch = useDispatch();
    const { all: dashboardEvents, status, error } = useSelector((state) => state.events);

    useEffect(() => {
        // Fetch the list of events when the component loads
        dispatch(fetchDashboardEvents());
    }, [dispatch]);

    if (status === 'loading') {
        return <div className="text-center p-4">Loading events...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error fetching events: {error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Select an Event to Add/Edit Location</h2>
            <div className="space-y-3">
                {dashboardEvents && dashboardEvents.length > 0 ? (
                    dashboardEvents.map((event) => (
                        <Link
                            key={event._id}
                            to={`/admin/add-location/${event._id}`}
                            className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border"
                        >
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-sm text-gray-500">Status: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{event.status}</span></p>
                        </Link>
                    ))
                ) : (
                    <p>No events found. You can create one from the "Create Event" tab.</p>
                )}
            </div>
        </div>
    );
}