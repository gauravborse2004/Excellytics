import { generateResetToken, generateToken } from "../utils/jwtToken.js";
import Admin from "../models/admin.model.js";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import Upload from "../models/upload.model.js";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All field are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must have atleast 6 characters" });
    }

    const admin = await Admin.findOne({ email });

    if (admin) return res.status(400).json({ message: "Email already exits" });

    // hash password done by descript password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newAdmin) {
      // genereate jwt token here
      generateToken(newAdmin._id, res);
      await newAdmin.save();

      res.status(201).json({
        _id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        profilePic: newAdmin.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(admin._id, res);

    res.status(200).json({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      profilePic: admin.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Inernal server error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller ", error.message);
    req.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.admin);
  } catch (error) {
    console.log("Error in checking controller ", error.message);
    res.status(500).json({ message: "Internal servere error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "User not existed" });
    }

    // Generate the reset password token
    const resetToken = generateResetToken(admin.id);

    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword?token=${resetToken}`;
    const message = `
      <h2>Hello, ${admin.fullName}</h2>
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire soon.</p>
    `;

    // Send reset link via email
    await sendEmail({
      to: admin.email,
      subject: "Reset Password",
      html: message,
    });

    res.status(200).json({ message: "Password reset link sent" });
  } catch (error) {
    console.log("error in forgotPassword: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Decode and verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the decoded user ID
    const admin = await Admin.findById(decoded.userId);

    if (!admin) {
      return res.status(400).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Save the new password to the user record
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully " });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
    console.log(error);
  }
};

export const dashboard = async (req, res) => {
  try {
    const uploadStats = await Upload.aggregate([
      {
        $group: {
          _id: null,
          totalUploads: { $sum: 1 },
          totalStorageBytes: { $sum: "$fileSize" },
        },
      },
      {
        $project: {
          _id: 0,
          totalUploads: 1,
          totalStorageUsedMB: {
            $round: [{ $divide: ["$totalStorageBytes", 1048576] }, 2],
          },
        },
      },
    ]);

    const { totalUploads = 0, totalStorageUsedMB = 0 } = uploadStats[0] || {};

    //Get most recently created user
    const recentUser = await User.findOne()
      .sort({ createdAt: -1 })
      .select("fullName createdAt");
    // User count per day
    const userStats = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          usersCreated: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // chronological order
    ]);

    //Response
    res.json({
      totalUploads,
      totalStorageUsedMB,
      recentUser: recentUser
        ? {
            name: recentUser.fullName,
            createdAt: recentUser.createdAt.toISOString().split("T")[0],
          }
        : null,
      userCreationTimeline: userStats.map((entry) => ({
        date: entry._id,
        count: entry.usersCreated,
      })),
    });
  } catch (error) {
    console.error("Error fetching upload stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const userData = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "uploads",
          localField: "_id",
          foreignField: "userId",
          as: "uploads",
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          createdAt: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalUploads: { $size: "$uploads" },
          totalStorageUsedMB: {
            $round: [
              {
                $divide: [{ $sum: "$uploads.fileSize" }, 1048576],
              },
              2,
            ],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete associated uploads
    await Upload.deleteMany({ userId });

    res.json({ message: "User and uploads deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error" });
  }
};
