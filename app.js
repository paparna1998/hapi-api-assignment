import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
import dbConnection from "./Utils/dbConnection.js";
import { User_Routes } from "./Utils/allRoutes.js";
import jwt from "jsonwebtoken";
import HapiRateLimit from "hapi-rate-limit";
import { registerAuthStrategy } from "./Utils/registerAuthStrategy.js"
dotenv.config();

// Initialize Hapi server
const server = Hapi.server({
    port: process.env.PORT || 5002,
    host: "localhost"
});

// Define root route
server.route({
    method: "GET",
    path: "/",
    options: { auth: false },
    handler: (request, h) => {
        return h.response({ message: "Welcome to NWT assignment." });
    }
});

// Register global error logging middleware
server.ext("onPreResponse", (request, h) => {
    const response = request.response;
    if (response.isBoom) {
        console.error("Error:", response.output.payload);
    }
    return h.continue;
});

// Register routes
const registerRoutes = async () => {
    if (Array.isArray(User_Routes)) {
        server.route(User_Routes);
    } else {
        console.error("Routes must be an array. Check your User_Routes export.");
    }
};

// Initialize the application
const init = async () => {
    await dbConnection();
    await server.register({
        plugin: HapiRateLimit, // Register Rate Limiting Plugin
        options: {
            pathLimit: 10, // Max 10 requests per minute per route
            userLimit: 5, // Max 5 requests per minute per user
            headers: true, // Include rate limit headers in response
            trustProxy: true, // Support proxies
        }
    });
    await registerAuthStrategy(server);
    registerRoutes();
};

// Handle server errors
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Error:", err);
    process.exit(1);
});


// Start the server
const startServer = async () => {
    await server.start();
    console.log(`Server listening on ${process.env.PORT}`);
};

init().then(startServer);
