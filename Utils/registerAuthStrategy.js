
import HapiAuthJWT from "hapi-auth-jwt2";
import User from "../Models/user.js";

// Register JWT authentication strategy
export const registerAuthStrategy = async (server) => {
    await server.register(HapiAuthJWT);
    server.auth.strategy("jwt", "jwt", {
        key: process.env.JWT_SECRET,
        validate: async (decoded, request) => {
            const user = await User.findById(decoded.id);
            return { isValid: !!user };
        },
        verifyOptions: { algorithms: ["HS256"] },
    });
    server.auth.default("jwt");
};