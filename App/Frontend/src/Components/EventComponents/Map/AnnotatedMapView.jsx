import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventLocation } from '@/store/map_annotator.slice';
import LeafletMap from './leafletMap';
import { Skeleton } from '@/components/ui/skeleton';

const AnnotatedMapView = ({ eventId }) => {
  const dispatch = useDispatch();
  const { eventLocation, loading, error } = useSelector((state) => state.mapAnnotator);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventLocation(eventId));
    }
  }, [dispatch, eventId]);

  if (loading) return <Skeleton className="h-[500px] w-full" />;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!eventLocation) return <div className="p-4 text-center text-gray-500">No map data available for this event.</div>;

  return <LeafletMap eventLocation={eventLocation} />;
};

export default AnnotatedMapView;