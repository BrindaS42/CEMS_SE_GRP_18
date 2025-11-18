import College from '../models/college.model.js';

export const applyForCollegeRegistration = async (req, res) => {
  try {
    const { name, code, website, description, poc, address } = req.body;

    // Basic validation
    if (!name || !code || !poc || !address) {
      return res.status(400).json({ message: 'Missing required fields for college registration.' });
    }

    // Check if college with the same name or code already exists
    const existingCollege = await College.findOne({ $or: [{ name }, { code }] });
    if (existingCollege) {
      return res.status(409).json({ message: 'A college with this name or code already exists.' });
    }

    const newCollege = new College({ name, code, website, description, poc, address });
    await newCollege.save();

    res.status(201).json({
      message: 'College registration submitted successfully. It is pending approval from an admin.',
      college: newCollege,
    });
  } catch (error) {
    console.error("Error registering college:", error);
    res.status(500).json({ message: 'Server error during college registration.', error: error.message });
  }
};

export const getAllApprovedColleges = async (req, res) => {
  try {
    const colleges = await College.find({ status: 'Approved' }).select('name code');
    res.status(200).json(colleges);
  } catch (error) {
    console.error("Error fetching approved colleges:", error);
    res.status(500).json({ message: 'Server error while fetching colleges.' });
  }
};

export const getAllCollegesForAdmin = async (req, res) => {
  try {
    const colleges = await College.find({}).sort({ createdAt: -1 });
    res.status(200).json(colleges);
  } catch (error) {
    console.error("Error fetching all colleges for admin:", error);
    res.status(500).json({ message: 'Server error while fetching colleges for admin.' });
  }
};