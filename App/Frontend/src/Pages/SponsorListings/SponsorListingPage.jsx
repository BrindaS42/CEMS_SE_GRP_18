import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSponsors, fetchSponsorAds } from '@/Store/sponsor.slice';
import { motion } from 'motion/react';
import { Building2, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Skeleton } from '@/Components/ui/skeleton';
import { toast } from 'sonner';
import { ChatBot } from '@/Components/ChatBot';

export const SponsorListingPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sponsors, ads, loading: isLoading } = useSelector((state) => state.sponsor); 
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showAdsDialog, setShowAdsDialog] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // 1. Derive the published ads list immediately when 'ads' changes (KEPT FROM HEAD)
  const publishedAds = useMemo(() => {
    // Ensure 'ads' is an array before filtering
    return Array.isArray(ads) ? ads.filter(ad => ad.status === 'Published') : [];
  }, [ads]);


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
      await dispatch(fetchSponsorAds(sponsor._id)).unwrap();
    } catch (err) {
      toast.error('Failed to load advertisements');
    } finally {
      setLoadingAds(false);
    }
  };

  // KEPT FROM HEAD: Logic uses publishedAds
  const nextAd = () => {
    const count = publishedAds.length;
    if (count > 0) {
      setCurrentAdIndex((prev) => (prev + 1) % count);
    }
  };

  const prevAd = () => {
    const count = publishedAds.length;
    if (count > 0) {
      setCurrentAdIndex((prev) => (prev - 1 + count) % count);
    }
  };

  // KEPT FROM HEAD: Ensure index validity
  useEffect(() => {
    if (currentAdIndex >= publishedAds.length && publishedAds.length > 0) {
      setCurrentAdIndex(0);
    }
    if (publishedAds.length === 0) {
      setCurrentAdIndex(0);
    }
  }, [publishedAds, currentAdIndex]);


  // Determine the current ad to display from the filtered list (KEPT FROM HEAD)
  const currentAd = publishedAds[currentAdIndex];


  return (
    // MERGED: Added dark mode classes from Incoming Change
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            {/* MERGED: Added dark mode gradient stops */}
            <h1 className="text-5xl mb-4 font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Our Sponsors
            </h1>
            {/* MERGED: Added dark mode text color */}
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Meet the organizations supporting our college events
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                // MERGED: Added dark mode styling to Card and Skeletons
                <Card key={i} className="overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-lg dark:bg-gray-700" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-6 w-3/4 mb-2 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-full mb-1 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-full mb-1 dark:bg-gray-700" />
                    <Skeleton className="h-4 w-2/3 dark:bg-gray-700" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full dark:bg-gray-700" />
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
                  {/* MERGED: Added dark mode borders and background */}
                  <Card className="h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-2 hover:border-emerald-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-emerald-500/50">
                    <CardHeader className="pb-4">
                      {/* MERGED: Added dark mode gradient to image container */}
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
                        <img
                          src={sponsor.sponsorDetails?.firmLogo}
                          alt={sponsor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* MERGED: Added dark mode text colors */}
                      <CardTitle className="flex items-center gap-2 dark:text-white">
                        <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        {sponsor.profile?.name || 'Sponsor Name'}
                      </CardTitle>
                      <CardDescription className="line-clamp-3 dark:text-gray-400">
                        {sponsor.sponsorDetails?.firmDescription}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {sponsor.sponsorDetails?.links && sponsor.sponsorDetails.links?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {sponsor.sponsorDetails.links.map((link, idx) => (
                            // MERGED: Added dark mode Badge styling
                            <Badge key={idx} variant="outline" className="text-xs dark:text-gray-300 dark:border-gray-600">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Link {idx + 1}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>

                    {/* MERGED: Added dark mode footer border and Button styling */}
                    <CardFooter className="flex gap-2 pt-4 border-t dark:border-gray-700">
                      <Button
                        onClick={() => handleViewProfile(sponsor._id)}
                        variant="outline"
                        className="flex-1 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:bg-transparent"
                      >
                        View Profile
                      </Button>
                      <Button
                        onClick={() => handleViewAds(sponsor)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white border-0"
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
        {/* MERGED: Added dark mode dialog background */}
        <DialogContent className="max-w-4xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            {/* MERGED: Added dark mode text colors */}
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              {selectedSponsor?.profile?.name} - Advertisements
            </DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              Browse through the sponsor's promotional content
            </DialogDescription>
          </DialogHeader>

          {loadingAds ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
            </div>
          ) : publishedAds.length > 0 && currentAd ? ( 
            // KEPT FROM HEAD: Logic checks `publishedAds`
            <div className="relative">
              {/* MERGED: Added dark mode background to carousel container */}
              <div className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900">
                <motion.div
                  key={currentAd._id} // KEPT FROM HEAD: Uses ID as key
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={currentAd.images?.[0] || currentAd.poster}
                    alt={currentAd.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="mt-4 p-2">
                    {/* MERGED: Added dark mode text colors */}
                    <h3 className="text-xl mb-2 dark:text-white">{currentAd.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{currentAd.description}</p>
                  </div>
                </motion.div>
              </div>

              {/* Carousel Controls */}
              {publishedAds.length > 1 && (
                <>
                  <button
                    onClick={prevAd}
                    // MERGED: Added dark mode button styling (white/80 vs gray-800/80)
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 dark:text-white rounded-full p-2 shadow-lg backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextAd}
                    // MERGED: Added dark mode button styling
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800 dark:text-white rounded-full p-2 shadow-lg backdrop-blur-sm"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {publishedAds.map((_, idx) => ( 
                      // KEPT FROM HEAD: Iterates publishedAds
                      <button
                        key={idx}
                        onClick={() => setCurrentAdIndex(idx)}
                        // MERGED: Added dark mode indicator colors
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === currentAdIndex
                            ? 'bg-emerald-600 w-8 dark:bg-emerald-400'
                            : 'bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No published advertisements available for this sponsor
            </div>
          )}
        </DialogContent>
      </Dialog>
      {isAuthenticated && <ChatBot />}
    </div>
  );
};