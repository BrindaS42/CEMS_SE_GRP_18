import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Separator } from '../../components/ui/separator';
import { sponsorService } from '../services/sponsorService';
import { toast } from 'sonner@2.0.3';

export const SponsorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sponsor, setSponsor] = useState(null);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchSponsorDetails();
      fetchSponsorAds();
    }
  }, [id]);

  const fetchSponsorDetails = async () => {
    try {
      // Mock sponsor data
      setSponsor({
        _id: id,
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        phone: '+1 234 567 8900',
        website: 'https://techcorp.com',
        sponsorDetails: {
          firmLogo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop',
          firmDescription: 'Leading provider of enterprise software solutions, specializing in cloud computing, AI technologies, and digital transformation. We partner with educational institutions to foster innovation and prepare students for the future of technology. With over 20 years of experience, we have helped thousands of organizations achieve their digital goals.',
          aboutUs: 'Founded in 2000, TechCorp Solutions has been at the forefront of technological innovation. Our mission is to empower businesses and educational institutions with cutting-edge solutions that drive growth and efficiency. We believe in the power of technology to transform lives and create opportunities.',
          links: ['https://techcorp.com', 'https://careers.techcorp.com', 'https://blog.techcorp.com'],
          products: [
            {
              name: 'Cloud Platform Pro',
              description: 'Enterprise-grade cloud infrastructure solution',
              image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop',
              price: '₹50,000/month',
            },
            {
              name: 'AI Analytics Suite',
              description: 'Advanced analytics powered by artificial intelligence',
              image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
              price: '₹75,000/month',
            },
            {
              name: 'DevOps Toolchain',
              description: 'Complete DevOps automation and CI/CD pipeline',
              image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop',
              price: '₹40,000/month',
            },
          ],
          stallLocation: 'Main Campus, Building A, Ground Floor, Stall #12',
          businessAddress: '123 Tech Park, Silicon Valley, San Francisco, CA 94025, USA',
          pocName: 'John Smith',
          pocEmail: 'john.smith@techcorp.com',
          pocPhone: '+1 234 567 8901',
        },
      });
    } catch (error) {
      console.error('Failed to fetch sponsor details:', error);
      toast.error('Failed to load sponsor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSponsorAds = async () => {
    try {
      // Mock ads data based on SponsorAd schema
      setAds([
        {
          _id: '1',
          title: 'Summer Internship Program 2024',
          description: 'Join our exclusive internship program and work on cutting-edge projects with industry experts',
          images: [
            'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=600&fit=crop',
          ],
          videos: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
          address: 'Stall #12, Main Campus Building A',
          contact: '+1 234 567 8900',
          poster: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=1200&h=600&fit=crop',
          views: 1234,
          likes: 89,
          status: 'Published',
        },
        {
          _id: '2',
          title: 'Tech Workshop Series',
          description: 'Free workshops on AI, Cloud Computing, and Web Development for all students',
          images: [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
          ],
          videos: [],
          address: 'Stall #12, Main Campus Building A',
          contact: '+1 234 567 8900',
          poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
          views: 892,
          likes: 67,
          status: 'Published',
        },
        {
          _id: '3',
          title: 'Campus Recruitment Drive',
          description: 'We are hiring! Multiple openings for freshers and experienced professionals',
          images: [
            'https://images.unsplash.com/photo-1559223607-a43c990aa8f5?w=1200&h=600&fit=crop',
          ],
          videos: [],
          address: 'Stall #12, Main Campus Building A',
          contact: '+1 234 567 8900',
          poster: 'https://images.unsplash.com/photo-1559223607-a43c990aa8f5?w=1200&h=600&fit=crop',
          views: 2156,
          likes: 143,
          status: 'Published',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    }
  };

  const nextAd = () => {
    setCurrentAdIndex((prev) => (prev + 1) % ads.length);
  };

  const prevAd = () => {
    setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full mb-8 rounded-3xl" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-black mb-2">Sponsor Not Found</h2>
          <Button asChild>
            <Link to="/sponsors">Back to Sponsors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button variant="ghost" asChild>
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
            src={sponsor.sponsorDetails.firmLogo}
            alt={sponsor.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-24 h-24 bg-white rounded-xl p-2">
                <Building2 className="w-full h-full text-emerald-600" />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  About Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {sponsor.sponsorDetails.firmDescription}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {sponsor.sponsorDetails.aboutUs}
                </p>
              </CardContent>
            </Card>

            {/* Products/Services - Now showing Ads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Products & Services
                </CardTitle>
                <CardDescription>Explore our offerings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {ads.map((ad) => (
                    <Card key={ad._id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <img
                        src={ad.images[0] || ad.poster}
                        alt={ad.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-black mb-2 line-clamp-1">{ad.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{ad.description}</p>
                        <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
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
                          className="w-full"
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

            {/* Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Stall Location (Campus)</h4>
                  <p className="text-gray-600">{sponsor.sponsorDetails.stallLocation}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Business Office</h4>
                  <p className="text-gray-600">{sponsor.sponsorDetails.businessAddress}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-gray-500">Point of Contact</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{sponsor.sponsorDetails.pocName}</p>
                        <p className="text-xs text-gray-500">Account Manager</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="font-medium text-sm break-all">{sponsor.sponsorDetails.pocEmail}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Phone</p>
                        <p className="font-medium text-sm">{sponsor.sponsorDetails.pocPhone}</p>
                      </div>
                    </div>

                    {sponsor.website && (
                      <div className="flex items-start gap-3">
                        <Globe className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Website</p>
                          <a
                            href={sponsor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-sm text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            Visit Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Sponsor
                </Button>
              </CardContent>
            </Card>

            {/* Quick Links */}
            {sponsor.sponsorDetails.links && sponsor.sponsorDetails.links.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sponsor.sponsorDetails.links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-600" />
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