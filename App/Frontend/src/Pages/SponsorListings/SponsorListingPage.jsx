import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { sponsorService } from '../services/sponsorService';
import { toast } from 'sonner@2.0.3';

export const SponsorListingPage = () => {
  const navigate = useNavigate();
  const [sponsors, setSponsors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showAdsDialog, setShowAdsDialog] = useState(false);
  const [sponsorAds, setSponsorAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      // Mock data for demonstration
      setSponsors([
        {
          _id: '1',
          name: 'TechCorp Solutions',
          email: 'contact@techcorp.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop',
            firmDescription: 'Leading provider of enterprise software solutions, specializing in cloud computing and AI technologies. We partner with educational institutions to foster innovation.',
            links: ['https://techcorp.com', 'https://careers.techcorp.com'],
          },
        },
        {
          _id: '2',
          name: 'InnovateTech',
          email: 'hello@innovatetech.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=400&fit=crop',
            firmDescription: 'Innovative tech startup focused on building next-generation mobile applications and web platforms for the education sector.',
            links: ['https://innovatetech.com'],
          },
        },
        {
          _id: '3',
          name: 'DataDrive Analytics',
          email: 'info@datadrive.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop',
            firmDescription: 'Data analytics and business intelligence company helping organizations make data-driven decisions through advanced analytics.',
            links: ['https://datadrive.com', 'https://blog.datadrive.com'],
          },
        },
        {
          _id: '4',
          name: 'CloudScale Systems',
          email: 'contact@cloudscale.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop',
            firmDescription: 'Cloud infrastructure and DevOps solutions provider, empowering businesses to scale their operations efficiently and securely.',
            links: ['https://cloudscale.com'],
          },
        },
        {
          _id: '5',
          name: 'CyberShield Security',
          email: 'hello@cybershield.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=400&fit=crop',
            firmDescription: 'Cybersecurity firm specializing in threat detection, prevention, and security training for enterprises and educational institutions.',
            links: ['https://cybershield.com', 'https://training.cybershield.com'],
          },
        },
        {
          _id: '6',
          name: 'GreenEnergy Solutions',
          email: 'info@greenenergy.com',
          sponsorDetails: {
            firmLogo: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=400&fit=crop',
            firmDescription: 'Renewable energy company committed to sustainable solutions, partnering with colleges to promote green technology and environmental awareness.',
            links: ['https://greenenergy.com'],
          },
        },
      ]);
    } catch (err) {
      toast.error('Failed to load sponsors');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (sponsorId) => {
    navigate(`/sponsors/${sponsorId}`);
  };

  const handleViewAds = async (sponsor) => {
    setSelectedSponsor(sponsor);
    setShowAdsDialog(true);
    setLoadingAds(true);
    setCurrentAdIndex(0);

    try {
      // Mock ads data
      setSponsorAds([
        {
          _id: '1',
          imageUrl: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&h=400&fit=crop',
          title: `${sponsor.name} - Innovation Summit 2024`,
          description: 'Join us at the Innovation Summit',
        },
        {
          _id: '2',
          imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
          title: `${sponsor.name} - Career Opportunities`,
          description: 'Explore exciting career paths with us',
        },
        {
          _id: '3',
          imageUrl: 'https://images.unsplash.com/photo-1559223607-a43c990aa8f5?w=800&h=400&fit=crop',
          title: `${sponsor.name} - Workshop Series`,
          description: 'Hands-on technical workshops',
        },
      ]);
    } catch (err) {
      toast.error('Failed to load advertisements');
    } finally {
      setLoadingAds(false);
    }
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % sponsorAds.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + sponsorAds.length) % sponsorAds.length);
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
                          src={sponsor.sponsorDetails.firmLogo}
                          alt={sponsor.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                        {sponsor.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {sponsor.sponsorDetails.firmDescription}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1">
                      {sponsor.sponsorDetails.links && sponsor.sponsorDetails.links.length > 0 && (
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
              {selectedSponsor?.name} - Advertisements
            </DialogTitle>
            <DialogDescription>
              Browse through the sponsor's promotional content
            </DialogDescription>
          </DialogHeader>

          {loadingAds ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : sponsorAds.length > 0 ? (
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
                    src={sponsorAds[currentAdIndex].imageUrl}
                    alt={sponsorAds[currentAdIndex].title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  <div className="mt-4">
                    <h3 className="text-xl mb-2">{sponsorAds[currentAdIndex].title}</h3>
                    <p className="text-gray-600">{sponsorAds[currentAdIndex].description}</p>
                  </div>
                </motion.div>
              </div>

              {/* Carousel Controls */}
              {sponsorAds.length > 1 && (
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
                    {sponsorAds.map((_, idx) => (
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
    </div>
  );
};