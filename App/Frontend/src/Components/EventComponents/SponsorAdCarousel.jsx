import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SponsorAdCarousel = ({ sponsors, interval = 5000 }) => {
  const [currentAd, setCurrentAd] = useState(null);
  const [sponsorIndex, setSponsorIndex] = useState(0);

  // Create a flattened list of all available ads from all sponsors
  const allSponsorAds = React.useMemo(() => {
    return sponsors
      .filter(s => s.status === 'Approved') // Only show ads from approved sponsors
      .flatMap(s => {
        const sponsorUser = s.sponsor; // Access the nested sponsor object

        // Check if the sponsor user and their ads are populated
        if (sponsorUser && Array.isArray(sponsorUser.ads) && sponsorUser.ads.length > 0) {
          // Pick a random ad from this sponsor's ads
          const randomAdIndex = Math.floor(Math.random() * sponsorUser.ads.length);
          const ad = sponsorUser.ads[randomAdIndex];
          if (!ad) return []; // Should not happen if ads.length > 0, but good practice
          return {
            ...ad,
            sponsorName: sponsorUser.profile?.name || 'A Sponsor',
          };
        }
        return null;
      })
      .filter(Boolean); // Remove null entries
  }, [sponsors]);

  useEffect(() => {
    if (allSponsorAds.length === 0) return;

    // Set the initial ad
    setCurrentAd(allSponsorAds[0]);

    const timer = setInterval(() => {
      setSponsorIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % allSponsorAds.length;
        setCurrentAd(allSponsorAds[nextIndex]);
        return nextIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [allSponsorAds, interval]);

  if (allSponsorAds.length === 0) {
    return null; // Don't render anything if there are no ads
  }

  return (
    <Card className="p-4 sticky top-24">
      <h3 className="font-black mb-4 text-center">Sponsored Ads</h3>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAd?._id || sponsorIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-lg"
        >
          {currentAd?.poster ? (
            <img
              src={currentAd.poster}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground text-sm">{currentAd?.title}</p>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
            <Badge variant="secondary">{currentAd?.sponsorName}</Badge>
          </div>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
};

SponsorAdCarousel.propTypes = {
  sponsors: PropTypes.array.isRequired,
  interval: PropTypes.number,
};

export default SponsorAdCarousel;