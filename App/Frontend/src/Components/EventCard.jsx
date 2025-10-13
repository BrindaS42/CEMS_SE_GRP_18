// EventCard.jsx
import * as React from "react";
import { Calendar, MapPin, Users, Edit, Send } from "lucide-react";
import PropTypes from "prop-types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function EventCard({ id, title, date, location, attendees, status, image, description }) {
  const handleEdit = () => {
    // Navigate to edit form or open modal
    console.log("Edit event:", title);
    // In real app: navigate(`/events/edit/${id}`);
  };

  const handlePublish = async () => {
    try {
      console.log("Publishing event:", title);
      // In real app: await eventsApi.publishEvent(id);
      // Show success notification
    } catch (error) {
      console.error("Error publishing event:", error);
      // Show error notification
    }
  };

  return (
    <Card className="overflow-hidden border-l-4 border-l-college-blue hover:shadow-lg transition-shadow">
      {/* Triangular design element */}
      <div className="absolute top-2 right-2 w-0 h-0 border-l-[15px] border-l-transparent border-b-[15px] border-b-college-yellow opacity-40 z-10"></div>
      
      <div className="aspect-video w-full overflow-hidden relative">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight text-college-blue">{title}</CardTitle>
          <Badge 
            variant={status === "current" ? "default" : "secondary"}
            className={status === "current" ? "bg-college-red text-white" : "bg-college-yellow text-college-blue"}
          >
            {status === "current" ? "Live" : "Upcoming"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-college-blue" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-college-blue" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-college-blue" />
            <span>{attendees} attendees</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="flex-1 border-college-blue text-college-blue hover:bg-college-blue hover:text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePublish}
            className="flex-1 border-college-red text-college-red hover:bg-college-red hover:text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

EventCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  attendees: PropTypes.number.isRequired,
  status: PropTypes.oneOf(['current', 'upcoming']).isRequired,
  image: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};