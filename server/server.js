require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const notesRoutes = require("./routes/notes");
const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/notes", notesRoutes);

mongoose.connect(process.env.MONGO_URI);
module.exports = app;