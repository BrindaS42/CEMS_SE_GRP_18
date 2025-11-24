import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSelector, useDispatch } from 'react-redux';
import { Card } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  MapPin, 
  Phone, 
  Mail,
  Building2,
  Image as ImageIcon,
  Video,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchAdById, clearSelectedAd, incrementAdView, toggleAdLike } from '@/Store/sponsor.slice';

const AdDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedAd: ad, loading } = useSelector((state) => state.sponsor);

  const [liked, setLiked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdById(id)).then(() => {
        // Once the ad is fetched, increment its view count.
        dispatch(incrementAdView(id));
      });
    }
    // Cleanup on unmount
    return () => {
      dispatch(clearSelectedAd());
    };
  }, [id, dispatch]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like this ad.');
      return;
    }
    const newLikedState = !liked;
    setLiked(!liked);
    dispatch(toggleAdLike({ adId: ad._id, liked: newLikedState }));
    toast.success(newLikedState ? 'Added to favorites' : 'Removed from favorites');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-96 bg-gray-200 rounded-lg" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-500">Advertisement not found</p>
          <Button onClick={() => navigate(`/sponsors/${ad.sponsorId._id}`)} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-gray-100">
                  <img 
                    src={ad.images[selectedImage] || ad.poster}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                  {ad.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {ad.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            idx === selectedImage
                              ? 'bg-white w-8'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {ad.images.length > 1 && (
                  <div className="p-4 grid grid-cols-4 gap-2">
                    {ad.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                          idx === selectedImage
                            ? 'border-purple-600'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${ad.title} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-black mb-2">{ad.title}</h1>
                    <Badge className="bg-purple-600">{ad.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">{ad.views}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className={liked ? 'text-red-600' : ''}
                    >
                      <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="ml-1">{ad.likes}</span>
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                </div>
              </Card>
            </motion.div>

            {ad.videos && ad.videos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Videos</h3>
                  </div>
                  <div className="space-y-4">
                    {ad.videos.map((video, idx) => (
                      <div key={idx} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        <iframe
                          src={video}
                          title={`${ad.title} Video ${idx + 1}`}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Sponsored By</h3>
                {ad.sponsorId && (
                  <div className="flex items-center gap-3 mb-4">
                  {ad.sponsorId.sponsorDetails?.firmLogo && (
                    <img
                      src={ad.sponsorId.sponsorDetails.firmLogo}
                      alt={ad.sponsorId.profile?.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{ad.sponsorId.profile?.name}</p>
                    <p className="text-sm text-gray-500">{ad.sponsorId.email}</p>
                  </div>
                </div>)}
                <Button
                  className="w-full"
                  onClick={() => navigate(`/sponsors/${ad.sponsorId._id}`)}
                >
                  View Sponsor Profile
                </Button>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Location & Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Stall Location</p>
                      <p className="text-sm">{ad.address}</p>
                    </div>
                  </div>

                  {ad.actualAddress && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Business Address</p>
                          <p className="text-sm">{ad.actualAddress}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Contact</p>
                      <a
                        href={`tel:${ad.contact}`}
                        className="text-sm text-purple-600 hover:underline"
                      >
                        {ad.contact}
                      </a>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                      <a
                        href={`mailto:${ad.sponsorId.email}`}
                        className="text-sm text-purple-600 hover:underline break-all"
                      >
                        {ad.sponsorId.email}
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {ad.poster && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold">Promotional Poster</h3>
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={ad.poster}
                      alt={`${ad.title} Poster`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdDetailsPage;
