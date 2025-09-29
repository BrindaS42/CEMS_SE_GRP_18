import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { MapPin, Search, Crosshair, Check } from 'lucide-react';

interface LocationData {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

interface MapLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialAddress?: string;
  initialCoordinates?: { lat: number; lng: number };
}

// Mock map data for demonstration
const mockLocations = [
  {
    address: "Indian Institute of Technology Delhi, Hauz Khas, New Delhi, Delhi 110016",
    coordinates: { lat: 28.5458, lng: 77.1932 },
    placeId: "iit-delhi"
  },
  {
    address: "Jawaharlal Nehru University, New Delhi, Delhi 110067",
    coordinates: { lat: 28.5394, lng: 77.1663 },
    placeId: "jnu-delhi"
  },
  {
    address: "Delhi University, University Road, Delhi 110007",
    coordinates: { lat: 28.6964, lng: 77.2085 },
    placeId: "du-delhi"
  },
  {
    address: "India Gate, Rajpath, India Gate, New Delhi, Delhi 110001",
    coordinates: { lat: 28.6129, lng: 77.2295 },
    placeId: "india-gate"
  },
  {
    address: "Red Fort, Netaji Subhash Marg, Lal Qila, Chandni Chowk, New Delhi, Delhi 110006",
    coordinates: { lat: 28.6562, lng: 77.2410 },
    placeId: "red-fort"
  }
];

export function MapLocationPicker({ onLocationSelect, initialAddress = "", initialCoordinates }: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<typeof mockLocations>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialCoordinates ? { 
      address: initialAddress, 
      coordinates: initialCoordinates 
    } : null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate API search delay
      const timer = setTimeout(() => {
        const filtered = mockLocations.filter(location =>
          location.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(filtered);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleLocationSelect = (location: typeof mockLocations[0]) => {
    const locationData: LocationData = {
      address: location.address,
      coordinates: location.coordinates,
      placeId: location.placeId
    };
    setSelectedLocation(locationData);
    setSearchQuery(location.address);
    setSuggestions([]);
    onLocationSelect(locationData);
  };

  const handleCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          const locationData: LocationData = {
            address: `Current Location (${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)})`,
            coordinates
          };
          setSelectedLocation(locationData);
          setSearchQuery(locationData.address);
          onLocationSelect(locationData);
        },
        (error) => {
          console.error("Error getting current location:", error);
          alert("Unable to get current location. Please enter address manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Location Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for venue location..."
            className="pl-10"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCurrentLocation}
            className="absolute right-2 top-1 h-8"
          >
            <Crosshair className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <Card className="border-college-blue/20">
          <CardContent className="p-2">
            <div className="space-y-1">
              {suggestions.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(location)}
                  className="w-full text-left p-3 rounded-lg hover:bg-college-blue/5 transition-colors border border-transparent hover:border-college-blue/10"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-college-blue mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-college-blue truncate">
                        {location.address.split(',')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {location.address}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Location Display */}
      {selectedLocation && (
        <Card className="border-college-blue/20 bg-college-blue/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-college-blue rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-college-blue">Selected Location</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedLocation.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Map Display Toggle */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowMap(!showMap)}
          className="w-full"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {showMap ? 'Hide Map' : 'Show Map Preview'}
        </Button>

        {showMap && (
          <Card className="border-college-blue/20">
            <CardContent className="p-0">
              <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg relative overflow-hidden">
                {/* Mock Map Interface */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-college-blue mx-auto mb-2" />
                    <p className="font-medium text-college-blue">Interactive Map</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLocation ? 'Location marked on map' : 'Select a location to view on map'}
                    </p>
                  </div>
                </div>
                
                {/* Mock Map Elements */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs text-muted-foreground">
                    🗺️ Map integration powered by Google Maps API (Demo Mode)
                  </div>
                </div>
                
                {selectedLocation && (
                  <>
                    {/* Mock Map Pin */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-6 h-6 bg-college-red rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                    </div>
                    
                    {/* Mock Info Window */}
                    <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-full">
                      <div className="bg-white rounded-lg shadow-lg p-2 max-w-48 text-xs border border-gray-200">
                        <p className="font-medium text-college-blue truncate">
                          {selectedLocation.address.split(',')[0]}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {isSearching && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-college-blue border-t-transparent rounded-full animate-spin"></div>
            Searching locations...
          </div>
        </div>
      )}
    </div>
  );
}