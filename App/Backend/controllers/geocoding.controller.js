import axios from 'axios';

export const searchLocation = async (req, res) => {
  try {
    const { q, limit = 5, format = 'json', addressdetails = 1 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query (q) is required.' });
    }

    const nominatimUrl = 'https://nominatim.openstreetmap.org/search';

    const response = await axios.get(nominatimUrl, {
      params: { q, limit, format, addressdetails },
      headers: {
        'User-Agent': 'CEMS-WebApp/1.0 (cems18se@gmail.com)',
      },
    });

    res.json(response.data);

  } catch (error) {
    console.error('Geocoding search error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Failed to fetch geocoding data.';
    res.status(status).json({ message });
  }
};