import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'motion/react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Package,
  DollarSign,
  Globe,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Skeleton } from '@/Components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import { fetchSponsorById, fetchSponsorAds, clearSelectedSponsor } from '@/Store/sponsor.slice';
import { toast } from 'sonner';

export const SponsorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedSponsor: sponsor, ads, loading, error } = useSelector((state) => state.sponsor);

  useEffect(() => {
    if (id) {
      dispatch(fetchSponsorById(id));
      dispatch(fetchSponsorAds(id));
    }

    // Cleanup function to clear data when the component unmounts
    return () => {
      dispatch(clearSelectedSponsor());
    };
  }, [id, dispatch]);

  console.log('Sponsor Details:', sponsor);
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-3xl dark:bg-gray-800" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full dark:bg-gray-800" />
            </div>
            <Skeleton className="h-64 w-full dark:bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
        <div className="text-center">
          <Building2 className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-2xl font-black mb-2 dark:text-white">Sponsor Not Found</h2>
          <Button asChild>
            <Link to="/sponsors">Back to Sponsors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild className="dark:text-gray-300 dark:hover:bg-gray-800">
            <Link to="/sponsors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sponsors
            </Link>
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl"
        >
          <img
            src={sponsor.sponsorDetails?.banner || sponsor.sponsorDetails?.firmLogo}
            alt={sponsor.profile?.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-24 h-24 bg-white rounded-xl p-2">
                <img src={sponsor.sponsorDetails?.firmLogo} alt={sponsor.profile?.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-6xl font-black mb-2">{sponsor.name}</h1>
                <Badge className="bg-emerald-600 text-white">Verified Sponsor</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Us */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  About Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {sponsor.sponsorDetails?.firmDescription || 'No description provided.'}
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {/* The 'aboutUs' field is not in the user model, you might want to add it or remove this line */}
                </p>
              </CardContent>
            </Card>

            {/* Products/Services - Now showing Ads */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Package className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Products & Services
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Explore our offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {ads && ads.filter(ad => ad.status !== 'Drafted').map((ad) => (
                    <Card key={ad._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-700 dark:border-gray-600">
                      <img
                        src={ad.images[0] || ad.poster}
                        alt={ad.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-black mb-2 line-clamp-1 dark:text-white">{ad.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {ad.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {ad.likes}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0"
                          onClick={() => navigate(`/ads/${ad._id}`)}
                        >
                          Learn More
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Locations - Updated to use the locations array */}
            {sponsor.sponsorDetails?.locations && sponsor.sponsorDetails.locations.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Our Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sponsor.sponsorDetails.locations.map((loc, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-1 dark:text-white">{loc.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{loc.address}</p>
                      {loc.description && <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{loc.description}</p>}
                      {loc.mapLink && (
                        <a href={loc.mapLink} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline">View on Map</a>
                      )}
                      {index < sponsor.sponsorDetails.locations.length - 1 && <Separator className="mt-6 dark:bg-gray-700" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-500 dark:text-gray-400">Point of Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-semibold dark:text-white">{sponsor.sponsorDetails?.poc?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{sponsor.sponsorDetails?.poc?.role || "sponsor"}</p>
                      </div>
                    </div>

                    <Separator className="dark:bg-gray-700" />

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email</p>
                        <p className="font-medium text-sm break-all dark:text-white">{sponsor.sponsorDetails?.poc?.email || sponsor.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone</p>
                        <p className="font-medium text-sm dark:text-white">{sponsor.sponsorDetails?.poc?.contactNo || sponsor.profile?.contactNo || 'N/A'}</p>
                      </div>
                    </div>

                    {sponsor.sponsorDetails?.links?.[0] && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Website</p>
                          <a
                            href={sponsor.sponsorDetails.links[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
              </CardContent>
            </Card>

            {/* Quick Links */}
            {sponsor.sponsorDetails?.links && sponsor.sponsorDetails.links.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="dark:text-white">Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sponsor.sponsorDetails?.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors dark:text-gray-300"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm flex-1 truncate">{link}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};