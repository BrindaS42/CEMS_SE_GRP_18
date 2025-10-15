// EventForm.jsx

import { useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';

export function EventForm({ event, onSubmit, onCancel, loading = false }) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: event ? {
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      status: event.status,
      image: event.image,
      attendees: event.attendees,
    } : {
      status: 'upcoming',
      attendees: 0,
    }
  });

  const watchedStatus = watch('status');

  return (
    <Card className="w-full max-w-2xl mx-auto border-college-blue/20">
      <CardHeader>
        <CardTitle className="text-college-blue">
          {event ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title" className="text-college-blue">Event Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Event title is required' })}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-college-blue">Date *</Label>
              <Input
                id="date"
                type="datetime-local"
                {...register('date', { required: 'Event date is required' })}
                className="border-college-blue/30 focus:border-college-blue"
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-college-blue">Location *</Label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="Event location"
              />
              {errors.location && (
                <p className="text-sm text-destructive">{errors.location.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-college-blue">Status *</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className="border-college-blue/30 focus:border-college-blue">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expected Attendees */}
            <div className="space-y-2">
              <Label htmlFor="attendees" className="text-college-blue">Expected Attendees</Label>
              <Input
                id="attendees"
                type="number"
                {...register('attendees', { 
                  min: { value: 0, message: 'Attendees cannot be negative' }
                })}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="0"
              />
              {errors.attendees && (
                <p className="text-sm text-destructive">{errors.attendees.message}</p>
              )}
            </div>

            {/* Image URL */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="image" className="text-college-blue">Event Image URL</Label>
              <Input
                id="image"
                type="url"
                {...register('image')}
                className="border-college-blue/30 focus:border-college-blue"
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-sm text-destructive">{errors.image.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description" className="text-college-blue">Description *</Label>
              <Textarea
                id="description"
                {...register('description', { required: 'Description is required' })}
                className="border-college-blue/30 focus:border-college-blue min-h-[100px]"
                placeholder="Enter event description"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 justify-end pt-4 border-t border-college-blue/20">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="border-college-blue/30 text-college-blue hover:bg-college-blue/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-college-blue hover:bg-college-blue/90"
            >
              {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

EventForm.propTypes = {
  event: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};