const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5002;
const path = require("path");
const { DatabaseService, Case } = require("./models"); // ✅ works now
const RouterMiddleware = require("./utils/RouterMiddleware");

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
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

app.listen(port, async () => {
  await DatabaseService.init(app, "routes"); // ✅ this will connect and test DB
  RouterMiddleware.init(app, "routes");
  console.log(`Server started at port ${port}`);
});
