import {
  getCurrentUserService,
  userLoginService,
  userLogoutService,
  userSignupService,
} from "../service/auth.service.js";
import { validateUserInput } from "../validation/user.validation.js";

export const signupUser = async (req, res) => {
  try {
    // vaidates the req.body that yes this is in proper format

    const validationResult = validateUserInput(req.body); // return {sucess,error,data}

    // if user didnt follow the format
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.error.issues[0]?.message || "Invalid input",
      });
    }
    // saves user in db 
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
    // seeing if one is null
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    // checking db if user exists
    const result = await userLoginService({ email, password });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
};

  // just for backend experince logut will be done by front end
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
    // get current user info
    const result = await getCurrentUserService(req.user._id);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.message === "User not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to fetch user details",
    });
  }
};
