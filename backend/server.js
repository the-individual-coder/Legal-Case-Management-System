const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const { DatabaseService, Case, Applicant } = require("./models");
const RouterMiddleware = require("./utils/RouterMiddleware");

app.use(express.json());
app.use(cors());

app.get("/", (req, resp) => {
  return resp.sendFile(path.resolve("index.html"));
});

app.get("/case", async (req, res) => {
  try {
    const cases = await Case.findAll();
    res.status(200).json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/createApplicant", async (req, res) => {
  try {
    const addedApplicant = await Applicant.create(req.body);
    res.status(201).json(addedApplicant);
  } catch (error) {
    console.error("Error creating applicant:", error);
    res.status(500).json({ message: "Error creating applicant" });
  }
});

// ✅ Init DB + routers only once, not inside listen()
(async () => {
  try {
    await DatabaseService.init(app, "routes");
    RouterMiddleware.init(app, "routes");
    console.log("Database + routes initialized");
  } catch (err) {
    console.error("Init error:", err);
  }
})();

// ❌ Don't use app.listen on Vercel
// app.listen(port, () => { ... });

// ✅ Instead, export the app for Vercel
module.exports = app;
