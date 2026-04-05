import {
  getCurrentUserService,
  userLoginService,
  userLogoutService,
  userSignupService,
} from "../service/auth.service.js";
import { validateUserInput } from "../validation/user.validation.js";

export const signupUser = async (req, res) => {
  try {
    const validationResult = validateUserInput(req.body); // returns success, error, and parsed data

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0]?.message || "Invalid input",
      });
    }
    const result = await userSignupService(validationResult.data);

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // login needs both email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const result = await userLoginService({ email, password });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

// logout here is mostly frontend side, client removes token
export const logoutUser = async (req, res) => {
  try {
    const result = await userLogoutService();

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Logout failed",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const result = await getCurrentUserService(req.user._id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.message === "User not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to fetch user details",
    });
  }
};
