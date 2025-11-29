import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
  Search, 
  Building2, 
  Mail, 
  Phone, 
  ExternalLink,
  Star,
  MapPin
} from 'lucide-react';
import { sponsorService } from '@/services/sponsorService';
import { toast } from 'sonner';

const SponsorsPage = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    setLoading(true);
    try {
      const response = await sponsorService.getAllSponsors();
      setSponsors(response.data);
    } catch (error) {
      console.error('Failed to load sponsors:', error);
      toast.error('Failed to load sponsors');
    } finally {
      setLoading(false);
    }
  };

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.profile.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sponsor.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950/20 dark:to-gray-950 py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-black mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Our Sponsors
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Discover our valued partners and sponsors supporting our events
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <Input
              type="search"
              placeholder="Search sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Sponsors Grid */}
        {!loading && filteredSponsors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all group cursor-pointer border-2 hover:border-purple-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-purple-500/50">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      {sponsor.profile.logo ? (
                        <img
                          src={sponsor.profile.logo}
                          alt={sponsor.profile.company}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg mb-1 truncate dark:text-white">
                        {sponsor.profile.company}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {sponsor.profile.name}
                      </p>
                      {sponsor.rating && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{sponsor.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {sponsor.profile.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {sponsor.profile.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {sponsor.totalAds && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">{sponsor.totalAds} Ads</Badge>
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {sponsor.profile.phone && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Phone className="w-4 h-4" />
                        <span className="truncate">{sponsor.profile.phone}</span>
                      </div>
                    )}
                    {sponsor.email && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{sponsor.email}</span>
                      </div>
                    )}
                    {sponsor.profile.address && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{sponsor.profile.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => navigate(`/sponsors/${sponsor._id}`)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-500 text-white border-0"
                  >
                    View Profile
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && filteredSponsors.length === 0 && (
          <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No sponsors found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No sponsors available at the moment'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SponsorsPage;