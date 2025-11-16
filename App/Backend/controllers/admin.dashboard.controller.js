import mongoose from "mongoose";
import User from "../models/user.model.js";
import Event from "../models/event.model.js";
import College from "../models/college.model.js";

export const getUsersPerCollege = async (req, res) => {
  try {
    const usersPerCollege = await User.aggregate([
      {
        $lookup: {
          from: "colleges",
          localField: "college",
          foreignField: "_id",
          as: "collegeDetails",
        },
      },
      { $unwind: "$collegeDetails" },
      {
        $group: {
          _id: "$collegeDetails.name",
          code: { $first: "$collegeDetails.code" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: usersPerCollege,
    });
  } catch (error) {
    console.error("Error in getUsersPerCollege:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getRegistrationStats = async (req, res) => {
  try {
    let { startDate, startTime, endDate, endTime } = req.body;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
    const end = new Date(`${endDate}T${endTime || "23:59"}:59`);

    const users = await User.find({
      role: { $in: ["student", "organizer", "sponsor"] },
      createdAt: { $gte: start, $lte: end },
    }).select("username email role createdAt");

    const grouped = {
      student: [],
      organizer: [],
      sponsor: [],
    };

    users.forEach((u) => {
      grouped[u.role].push(u);
    });

    const userCounts = {
      studentCount: grouped.student.length,
      organizerCount: grouped.organizer.length,
      sponsorCount: grouped.sponsor.length,
    };

    const colleges = await College.find({
      createdAt: { $gte: start, $lte: end },
    }).select("name code createdAt");

    return res.status(200).json({
      dateRange: { start, end },

      users: {
        counts: userCounts,
        lists: grouped,
      },

      colleges: {
        total: colleges.length,
        list: colleges,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getEventStats = async (req, res) => {
  try {
    let { startDate, startTime, endDate, endTime } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
    const end = new Date(`${endDate}T${endTime || "23:59"}:59`);

    const publishedEvents = await Event.find({
      status: "published",
      statusTime: { $gte: start, $lte: end },
    }).select("title status statusTime createdAt");

    const completedEvents = await Event.find({
      status: "completed",
      statusTime: { $gte: start, $lte: end },
    }).select("title status statusTime createdAt");

    res.status(200).json({
      dateRange: { start, end },

      published: {
        total: publishedEvents.length,
        list: publishedEvents,
      },

      completed: {
        total: completedEvents.length,
        list: completedEvents,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch event stats",
      error: err.message,
    });
  }
};
