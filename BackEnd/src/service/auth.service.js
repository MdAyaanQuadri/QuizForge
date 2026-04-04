import User from "../model/user.model.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import { signToken } from "../utils/jwt.util.js";

export const userSignupService = async ({ username, email, password }) => {
  try {
    // checks if all three are present
    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required");
    }
    // we try and find if the user is has a duplicate email or user name
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    // throws error seeing if email or username is duplicate
    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email is already registered");
      }

      throw new Error("Username is already taken");
    }
    // hashes the password
    const hashedPassword = await hashPassword(password);

    if (!hashedPassword) {
      throw new Error("Failed to hash password");
    }

    // saves user in db
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // checks if the user has been saved if yes then is there a partial save
    if (!user || !user._id) {
      throw new Error("Failed to create user");
    }

    // genrating tokens
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
    // seeing is the error is db related
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
    // seeing if email exists in db
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid email or password");
    }
    // camoaring passwrod if they are same 
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    //create the token
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
    // finding user minus password
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
