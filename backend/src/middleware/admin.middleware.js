import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

// export const protectRoute = async (req, res, next) => {
//   try {
//     const token = req.cookies.jwt;

//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized - No token provided " });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (!decoded) {
//       return res.status(404).json({ message: "Unauthorized - Invalid token" });
//     }

//     const admin = await Admin.findById(decoded.userId).select("-password");

//     if (!admin) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     req.admin = admin;
//     next();
//   } catch (error) {
//     console.log("Error in protect middleware ", error.message);
//     res.status(500).json({ message: "Intrenal server error " });
//   }
// };


// creation of middleware in express


export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided " });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(404).json({ message: "Unauthorized - Invalid token" });
    }

    const admin = await Admin.findById(decoded.userId).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    req.admin = admin;
    next();
  } catch (error) {
    console.log("Error in protect middleware ", error.message);
    res.status(500).json({ message: "Intrenal server error " });
  }
};
