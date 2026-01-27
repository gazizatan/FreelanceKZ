import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // eGov OAuth callback - redirect from backend API to frontend callback
  // This handles the case when eGov redirects to our backend server
  app.get("/auth/egov/callback", (req, res) => {
    const { code, state, error } = req.query;
    
    // Build the frontend callback URL - redirect to the React app
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    
  // Redirect to the React Router handled route
    res.redirect(`${frontendUrl}/auth/egov/callback?code=${code || ''}&error=${error || ''}${state ? `&state=${state}` : ''}`);
  });

  return app;
}
