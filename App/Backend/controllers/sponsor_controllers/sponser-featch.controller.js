import SponsorAd from "../../models/sponsorAd.model.js";

export const GetAllSponsorNameDescpNoOfEsponsred = async (req, res) => {
    try {

        const sponsors = await SponsorAd.aggregate([
            {
                $group: {
                    _id: "$sponsorId",
                    noOfSponsored: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sponsorDetails",
                },
            },
            {
                $unwind: "$sponsorDetails",
            },
            {
                $project: {
                    _id: 0,
                    sponsorId: "$_id",
                    name: "$sponsorDetails.name",
                    description: "$sponsorDetails.description",
                    noOfSponsored: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: sponsors,
        });
    } catch (error) {
        console.error("Error fetching sponsor list:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch sponsor list",
        });
    }
};

export const GetAllAdsBySpID = async (req, res) => {
  try {
    const { sponsorId } = req.params;

    const ads = await SponsorAd.find({ sponsorId });

    if (!ads || ads.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No ads found for this sponsor",
      });
    }

    res.status(200).json({
      success: true,
      count: ads.length,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching sponsor ads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sponsor ads",
    });
  }
};
