import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSponsors, fetchSponsorAds } from '@/store/sponsor.slice';
import { motion } from 'motion/react';
import { Building2, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ChatBot } from '@/components/ChatBot';

export const SponsorListingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sponsors, ads, loading: isLoading } = useSelector((state) => state.sponsor); const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showAdsDialog, setShowAdsDialog] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchAllSponsors());
  }, [dispatch]);

  const handleViewProfile = (sponsorId) => {
    navigate(`/sponsors/${sponsorId}`);
  };

  const handleViewAds = async (sponsor) => {
    setLoadingAds(true);
    setSelectedSponsor(sponsor);
    setShowAdsDialog(true);
    setCurrentAdIndex(0);

    try {
      // Dispatch the thunk to fetch ads for the selected sponsor
      await dispatch(fetchSponsorAds(sponsor._id)).unwrap();
    } catch (err) {
      toast.error('Failed to load advertisements');
    } finally {
      setLoadingAds(false);
    }
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl mb-4 font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Our Sponsors
            </h1>
            <p className="text-xl text-gray-600">
              Meet the organizations supporting our college events
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {sponsors.map((sponsor, index) => (
                <motion.div
                  key={sponsor._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-200">
                    <CardHeader className="pb-4">
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                        <img
                          src={sponsor.sponsorDetails?.firmLogo}
                          alt={sponsor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                        {sponsor.profile?.name || 'Sponsor Name'}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {sponsor.sponsorDetails?.firmDescription}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {sponsor.sponsorDetails?.links && sponsor.sponsorDetails.links?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {sponsor.sponsorDetails.links.map((link, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Link {idx + 1}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => handleViewProfile(sponsor._id)}
                        variant="outline"
                        className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleViewAds(sponsor)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        View Ads
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Ads Dialog with Carousel */}
      <Dialog open={showAdsDialog} onOpenChange={setShowAdsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              {selectedSponsor?.profile?.name} - Advertisements
            </DialogTitle>
            <DialogDescription>
              Browse through the sponsor's promotional content
            </DialogDescription>
          </DialogHeader>

          {loadingAds ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : ads.length > 0 ? (
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <motion.div
                  key={currentAdIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={ads[currentAdIndex].images[0] || ads[currentAdIndex].poster}
                    alt={ads[currentAdIndex].title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="mt-4">
                    <h3 className="text-xl mb-2">{ads[currentAdIndex].title}</h3>
                    <p className="text-gray-600">{ads[currentAdIndex].description}</p>
                  </div>
                </motion.div>
              </div>

              {/* Carousel Controls */}
              {ads.length > 1 && (
                <>
                  <button
                    onClick={prevAd}
                    className="absolute left-2 top-1/3 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextAd}
                    className="absolute right-2 top-1/3 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentAdIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentAdIndex
                            ? 'bg-emerald-600 w-8'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No advertisements available for this sponsor
            </div>
          )}
        </DialogContent>
      </Dialog>
      {isAuthenticated && <ChatBot />}
    </div>
  );
};