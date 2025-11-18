import SponsorAd from "../../models/sponsorad.model.js";

// CREATE AD (Draft by default)
export const createSponsorAd = async (req, res) => {
  try {
    const ad = await SponsorAd.create({
      sponsorId: req.user.id,
      title: req.body.title,
      description: req.body.description,
      images: req.body.images || [],
      videos: req.body.videos || [],
      address: req.body.address,
      contact: req.body.contact,
      poster: req.body.poster,
      status: "Drafted",
    });

    res.status(201).json({ message: "Ad created", ad });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY ADS
export const getSponsorAds = async (req, res) => {
  try {
    const ads = await SponsorAd.find({ sponsorId: req.user.id });
    res.status(200).json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EDIT AD
export const updateSponsorAd = async (req, res) => {
  try {
    const ad = await SponsorAd.findOneAndUpdate(
      { _id: req.params.id, sponsorId: req.user.id },
      req.body,
      { new: true }
    );

    if (!ad) return res.status(404).json({ message: "Ad not found or unauthorized" });

    res.status(200).json(ad);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE AD
export const deleteSponsorAd = async (req, res) => {
  try {
    const ad = await SponsorAd.findOneAndDelete({
      _id: req.params.id,
      sponsorId: req.user.id,
    });

    if (!ad) return res.status(404).json({ message: "Ad not found or unauthorized" });

    res.status(200).json({ message: "Ad deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUBLISH AD
export const publishSponsorAd = async (req, res) => {
  try {
    const ad = await SponsorAd.findOne({
      _id: req.params.id,
      sponsorId: req.user.id,
    });

    if (!ad) return res.status(404).json({ message: "Ad not found or unauthorized" });

    ad.status = "Published";
    await ad.save();

    res.status(200).json({ message: "Ad published", ad });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
