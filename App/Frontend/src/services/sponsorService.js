const mockSponsors = [
  {
    _id: '1',
    name: 'TechCorp',
    logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200',
    description: 'Leading technology solutions provider',
    website: 'https://techcorp.example.com',
    tier: 'platinum',
  },
  {
    _id: '2',
    name: 'InnovateLabs',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200',
    description: 'Innovation and research company',
    website: 'https://innovatelabs.example.com',
    tier: 'gold',
  },
  {
    _id: '3',
    name: 'CloudSystems',
    logo: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=200',
    description: 'Cloud infrastructure and services',
    website: 'https://cloudsystems.example.com',
    tier: 'gold',
  },
  {
    _id: '4',
    name: 'DataDynamics',
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200',
    description: 'Big data analytics platform',
    website: 'https://datadynamics.example.com',
    tier: 'silver',
  },
];

const mockAdvertisements = [
  {
    _id: '1',
    sponsor: mockSponsors[0],
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
    link: 'https://techcorp.example.com/careers',
    title: 'Join Our Team',
    description: 'We are hiring talented engineers!',
  },
  {
    _id: '2',
    sponsor: mockSponsors[1],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    link: 'https://innovatelabs.example.com/internship',
    title: 'Summer Internship 2024',
    description: 'Apply now for exciting internship opportunities',
  },
  {
    _id: '3',
    sponsor: mockSponsors[2],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    link: 'https://cloudsystems.example.com/workshop',
    title: 'Cloud Computing Workshop',
    description: 'Free workshop for college students',
  },
];

export const sponsorService = {
  getAllSponsors: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockSponsors });
      }, 300);
    });
  },

  getSponsorById: async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sponsor = mockSponsors.find(s => s._id === id);
        if (sponsor) {
          resolve({ data: sponsor });
        } else {
          reject(new Error('Sponsor not found'));
        }
      }, 300);
    });
  },

  getAllAdvertisements: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockAdvertisements });
      }, 300);
    });
  },

  getAdvertisementsBySponsor: async (sponsorId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const ads = mockAdvertisements.filter(ad => ad.sponsor._id === sponsorId);
        resolve({ data: ads });
      }, 300);
    });
  },
};
