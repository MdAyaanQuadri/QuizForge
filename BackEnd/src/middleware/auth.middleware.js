import User from "../model/user.model.js";
import { verifyToken } from "../utils/jwt.util.js";

const authMiddleware = async (req, res, next) => {
  try {
    // getting token from header
    const authHeader = req.headers.authorization;
// cheking if the token is not null and if it isnt then it is a bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }
// exptractign token since bearer toekn has Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }
// seeing if token is legit
    const decodedToken = verifyToken(token);

    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    // gets the user from db minus teh password
    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
// making the user info aceesble to every one useing this middle ware
    req.user = user;
    // going to next controller 
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized access",
    });
  }
};

export default authMiddleware;
