import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import feedbackRoute from "./routes/feedback";
import searchRoute from "./routes/search";
import extractRoute from "./routes/extract";

const app = new Hono().basePath("/api/edge");

// Middleware
app.use("*", cors());
app.use("*", logger());

// Routes
app.route("/feedback", feedbackRoute);
app.route("/search", searchRoute);
app.route("/extract", extractRoute);

export default app;
