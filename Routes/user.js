import { userRegister, userLogin, userLogout, getUserProfile, updateUser, deleteUser } from "../Controllers/user.js";
import isToken from "../Middleware/tokenVerify.js";
import Joi from "joi";
import Boom from "@hapi/boom";
import logger from "../Utils/logger.js";

const userRoutes = [
    {
        method: "POST",
        path: "/users/register",
        options: {
            auth: false,
            validate: {
                payload: Joi.object({
                    name: Joi.string().pattern(/^[A-Za-z\s]+$/).required().messages({"string.pattern.base": "Name should only contain letters and spaces.",}),
                    email: Joi.string().email().required().messages({"string.email": "Please enter a valid email address.",}),
                    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).min(6).required().messages({
                        "string.pattern.base": "Password must contain at least one letter, one number, and one special character.",
                    })
                }),
                failAction: async (request, h, err) => {
                    logger.warn(`Joi Validation Failed: ${err.details[0].message}`);
                    throw Boom.badRequest(err.details[0].message);
                }
            },
            handler: userRegister
        }
    },
    {
        method: "POST",
        path: "/users/login",
        options: {
            auth: false,
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required().messages({"string.email": "Please enter a valid email address.",}),
                    password: Joi.string().pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/).min(6).required().messages({
                        "string.pattern.base": "Password must contain at least one letter, one number, and one special character.",
                    })
                }),
                failAction: async (request, h, err) => {
                    logger.warn(`Joi Validation Failed: ${err.details[0].message}`);
                    throw Boom.badRequest(err.details[0].message);
                }
            },
            handler: userLogin
        }
    },
    {
        method: "GET",
        path: "/users/profile",
        options: {
            auth: "jwt",
            pre: [{ method: isToken, assign: "user" }], // Apply Middleware
            handler: getUserProfile
        }
    },
    {
        method: "PUT",
        path: "/users/update",
        options: {
            auth: "jwt",
            pre: [{ method: isToken, assign: "user" }], // Apply Middleware
            validate: {
                payload: Joi.object({
                    name: Joi.string().pattern(/^[A-Za-z\s]+$/).optional().messages({"string.pattern.base": "Name should only contain letters and spaces.",}),
                    email: Joi.string().email().optional().messages({"string.email": "Please enter a valid email address.",}),
                }),
                failAction: async (request, h, err) => {
                    logger.warn(`Joi Validation Failed: ${err.details[0].message}`);
                    throw Boom.badRequest(err.details[0].message);
                }
            },
            handler: updateUser
        }
    },
    {
        method: "DELETE",
        path: "/users/delete",
        options: {
            auth: "jwt",
            pre: [{ method: isToken, assign: "user" }], // Apply Middleware
            handler: deleteUser
        }
    },
    {
        method: "POST",
        path: "/users/logout",
        options: {
            auth: "jwt",
            pre: [{ method: isToken, assign: "user" }], // Apply Middleware
            handler: userLogout
        }
    },
];

export default userRoutes;
