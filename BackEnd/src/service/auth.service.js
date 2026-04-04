import User from "../model/user.model.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import { signToken } from "../utils/jwt.util.js";

export const userSignupService = async ({ username, email, password }) => {
  try {
    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email is already registered");
      }

      throw new Error("Username is already taken");
    }

    const hashedPassword = await hashPassword(password);

    if (!hashedPassword) {
      throw new Error("Failed to hash password");
    }

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (!user || !user._id) {
      throw new Error("Failed to create user");
    }

    const token = signToken({ userId: user._id.toString() });

    if (!token) {
      throw new Error("Failed to generate token");
    }

    return {
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "email") {
        throw new Error("Email is already registered");
      }

      if (duplicateField === "username") {
        throw new Error("Username is already taken");
      }
    }

    throw new Error(error.message || "User signup failed");
  }
};

export const userLoginService = async ({ email, password }) => {
  try {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = signToken({ userId: user._id.toString() });

    if (!token) {
      throw new Error("Failed to generate token");
    }

    return {
      success: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  } catch (error) {
    throw new Error(error.message || "User login failed");
  }
};

export const userLogoutService = async () => ({
  success: true,
  message: "Logout successful. Remove the token on the client side.",
});

export const getCurrentUserService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user details");
  }
};
