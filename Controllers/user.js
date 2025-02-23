import Boom from "@hapi/boom";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Joi from "joi";
import User from "../Models/user.js";
import logger from "../Utils/logger.js";

// User Registration
export const userRegister = async (request, h) => {
    try {
        const { name, email, password } = request.payload;

        logger.info(`Registration Attempt: ${email}`);

        // Check if user already exists
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            logger.warn(`Registration Failed: Email already exists (${email})`);
            throw Boom.conflict("User already exists.");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        logger.info(`Registration Successful: ${email}`);
        return h.response({ message: "User Registered Successfully", user: newUser }).code(201);
    } catch (error) {
        throw Boom.badImplementation(error.message);
    }
};

// User Login
export const userLogin = async (request, h) => {
    try {
        const { email, password } = request.payload;
        logger.info(`Login Attempt for Email: ${email}`);

        // Find user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            logger.warn(`Failed Login: User not found (${email})`);
            throw Boom.unauthorized("Invalid Email or Password.");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn(`Failed Login: Incorrect password for (${email})`);
            throw Boom.unauthorized("Invalid Email or Password.");
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, name: user.name, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.token = token;
        await user.save();

        logger.info(`Successful Login: ${email}`);
        return h.response({ message: "Login Successful", user }).code(200);
    } catch (error) {
        throw Boom.badImplementation(error.message);
    }
};

//User Profile
export const getUserProfile = async (request, h) => {
    try {
        //Extract user ID from authenticated request
        const userId = request.auth.credentials.id;

        // Fetch user details
        const user = await User.findById(userId).select("-password");

        // If user does not exist
        if (!user) {
            logger.error(`User not found: ${request.auth.credentials.id}`);
            throw Boom.notFound("User not found.");
        }

        logger.info(`User Found.`);
        return h.response({ success: true, user }).code(200);
    } catch (error) {
        console.error("Profile Fetch Error:", error.message);
        throw Boom.badImplementation(error.message);
    }
};

//User Update
export const updateUser = async (request, h) => {
    try {
        // Extract user ID from authenticated request
        const userId = request.auth.credentials.id;

        const updateFields = request.payload;

        // If no fields are provided, return an error
        if (Object.keys(updateFields).length === 0) {
            logger.warn("No update fields provided.");
            throw Boom.badRequest("At least one field (name or email) must be provided for update.");
        }

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true, select: "-password" } // Exclude password from response
        );

        // If user does not exist
        if (!updatedUser) {
            logger.error(`User Not Found: ${userId}`);
            throw Boom.notFound("User not found.");
        }

        logger.info(`User Updated: ${updatedUser.email}`);
        return h.response({ success: true, message: "User updated successfully", user: updatedUser }).code(200);
    } catch (error) {
        logger.error(`Update Error: ${error.message}`);
        throw Boom.badImplementation(error.message);
    }
};

//User delete
export const deleteUser = async (request, h) => {
    try {
        // Extract user ID from authenticated request
        const userId = request.auth.credentials.id;

        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        // If user not found
        if (!deletedUser) {
            logger.error(`User Not Found: ${userId}`);
            throw Boom.notFound("User not found.");
        }

        logger.info(`User Deleted: ${deletedUser.email}`);
        return h.response({ success: true, message: "User deleted successfully" }).code(200);
    } catch (error) {
        logger.error(`Deletion Error: ${error.message}`);
        throw Boom.badImplementation(error.message);
    }
};

// User Logout
export const userLogout = async (request, h) => {
    try {
        // Get user ID from authenticated request
        const user = await User.findById(request.auth.credentials._id);

        // If user does not exist
        if (!user) {
            logger.error(`User not found: ${request.auth.credentials._id}`);
            throw Boom.unauthorized("User not found.");
        }

        // Clear the user's token
        user.token = "";
        await user.save();

        logger.info(`User Found: ${user.email}`);
        return h.response({ message: "Logout Successful" }).code(200);
    } catch (error) {
        logger.error(`Logout Error: ${error.message}`);
        throw Boom.badImplementation(error.message);
    }
};


