import jwt from "jsonwebtoken";
import Boom from "@hapi/boom";
import User from "../Models/user.js";
import logger from "../Utils/logger.js";

const isToken = async (request, h) => {
    try {
        const inputToken = request.headers.authorization;

        if (!inputToken) {
            logger.error("No Authorization Header Found!");
            throw Boom.unauthorized("Unauthorized Access - No Token Provided");
        }

        const token = inputToken.split(" ")[1];
        logger.info(`Extracted Token: ${token}`);

        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
                if (error) {
                    logger.error(`JWT Verification Failed: ${error.message}`);
                    return reject(Boom.unauthorized("Unauthorized Access - Invalid Token"));
                }

                logger.info(`Decoded Token: ${JSON.stringify(decoded)}`);
                try {
                    const user = await User.findOne({ _id: decoded.id });
                    if (!user) {
                        logger.error(`User Not Found: ${decoded.id}`);
                        return reject(Boom.unauthorized("Unauthorized Access - User Not Found"));
                    }

                    logger.info(`User Authenticated: ${user.email}`);
                    request.auth.credentials = user;
                    resolve(user);
                } catch (err) {
                    logger.error(`Unexpected Error in isToken: ${err.message}`);
                    return reject(Boom.badImplementation("Server Error: " + err.message));
                }
            });
        });
    } catch (err) {
        throw Boom.badImplementation(err.message);
    }
};

export default isToken;
